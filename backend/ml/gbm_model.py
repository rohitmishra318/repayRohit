"""
XGBoost risk and salary models.

Improvement #1: Trust score propagation — uses data_trust_weight as
sample_weight during training so models learn to de-emphasize noisy
data from low-trust institutes.
"""

import os
import joblib
import numpy as np
import pandas as pd
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import roc_auc_score, mean_absolute_error

os.makedirs("models_cache", exist_ok=True)

ALL_FEATURES = [
    "cgpa_percentile", "internship_access_score", "ppo_binary",
    "cert_count_norm", "season_phase", "field_demand_percentile",
    "mom_demand_delta", "adjacent_opportunity", "months_since_graduation"
]


def _prepare_features(df, feature_list=None):
    """Prepare feature matrix ensuring all expected columns exist."""
    if feature_list is None:
        feature_list = ALL_FEATURES
    X = df[[f for f in feature_list if f in df.columns]].copy()
    for f in feature_list:
        if f not in X.columns:
            X[f] = 0.5
    X = X[feature_list].fillna(0.5)
    # Ensure all numeric
    for col in X.columns:
        X[col] = pd.to_numeric(X[col], errors='coerce').fillna(0.5)
    return X


def train_risk_model(df: pd.DataFrame) -> xgb.XGBClassifier:
    """
    Train XGBoost binary risk classifier.

    Improvement #1: Uses data_trust_weight as sample_weight to reduce
    the influence of noisy data from low-trust institutes.
    """
    y = df['risk_label'].copy()
    if y.dtype == 'object' or y.dtype.name == 'string':
        y = (y != 'SAFE').astype(int)
    y = y.astype(int)

    X = _prepare_features(df)

    # Extract trust weights for sample weighting (Improvement #1)
    trust_weights = df['data_trust_weight'].fillna(0.5) if 'data_trust_weight' in df.columns else None

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, stratify=y, random_state=42
    )

    # Split trust weights correspondingly
    if trust_weights is not None:
        w_train = trust_weights.loc[X_train.index].values
        w_test = trust_weights.loc[X_test.index].values
    else:
        w_train = None
        w_test = None

    clf = xgb.XGBClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.05,
        eval_metric='auc',
        random_state=42
    )

    # Improvement #1: Trust-aware training
    clf.fit(X_train, y_train, sample_weight=w_train)

    train_auc = roc_auc_score(y_train, clf.predict_proba(X_train)[:, 1])
    test_auc = roc_auc_score(y_test, clf.predict_proba(X_test)[:, 1])
    print(f"  Risk Model - Train AUC: {train_auc:.4f} | Test AUC: {test_auc:.4f}")

    joblib.dump(clf, "models_cache/xgb_risk.pkl")
    return clf


def train_salary_model(df: pd.DataFrame) -> xgb.XGBRegressor:
    """
    Train XGBoost salary regressor on placed students only.

    Improvement #1: Uses data_trust_weight as sample_weight.
    """
    placed_df = df[df['event_observed'] == True].copy()

    if 'salary_lpa' not in placed_df.columns and 'actual_salary' in placed_df.columns:
        placed_df['salary_lpa'] = placed_df['actual_salary'] / 100000.0

    y = placed_df['salary_lpa'].dropna()
    X = _prepare_features(placed_df.loc[y.index])

    trust_weights = placed_df['data_trust_weight'].fillna(0.5) if 'data_trust_weight' in placed_df.columns else None

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    if trust_weights is not None:
        w_train = trust_weights.loc[y_train.index].values
    else:
        w_train = None

    reg = xgb.XGBRegressor(
        n_estimators=200,
        max_depth=4,
        objective='reg:squarederror',
        learning_rate=0.05,
        random_state=42
    )

    # Improvement #1: Trust-aware training
    reg.fit(X_train, y_train, sample_weight=w_train)

    train_mae = mean_absolute_error(y_train, reg.predict(X_train))
    test_mae = mean_absolute_error(y_test, reg.predict(X_test))
    print(f"  Salary Model - Train MAE: {train_mae:.4f} LPA | Test MAE: {test_mae:.4f} LPA")

    joblib.dump(reg, "models_cache/xgb_salary.pkl")
    return reg


def predict_risk(features_dict: dict, risk_model: xgb.XGBClassifier) -> float:
    """Returns risk score 0.0-1.0 (probability of class 1)."""
    X = _prepare_features(pd.DataFrame([features_dict]))
    return float(risk_model.predict_proba(X)[0, 1])


def predict_salary(features_dict: dict, salary_model: xgb.XGBRegressor) -> tuple:
    """Returns (lower_lpa, upper_lpa) using ±20% of point prediction."""
    X = _prepare_features(pd.DataFrame([features_dict]))
    pred = float(salary_model.predict(X)[0])
    lower_lpa = round(max(pred * 0.8, 0.0), 2)
    upper_lpa = round(pred * 1.2, 2)
    return (lower_lpa, upper_lpa)
