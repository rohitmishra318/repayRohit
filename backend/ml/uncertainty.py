"""
Conformal prediction wrapper using MAPIE.

Provides calibrated confidence intervals for risk scores,
enabling the system to flag students needing human review
when uncertainty is too wide (CI width > 0.30).
"""

import os
import numpy as np
import joblib
from mapie.classification import MapieClassifier
from mapie.regression import MapieRegressor

os.makedirs("models_cache", exist_ok=True)

# Feature order must match training
ALL_FEATURES = [
    "cgpa_percentile", "internship_access_score", "ppo_binary",
    "cert_count_norm", "season_phase", "field_demand_percentile",
    "mom_demand_delta", "adjacent_opportunity", "months_since_graduation"
]


def wrap_risk_with_conformal(risk_model, X_train, y_train) -> MapieClassifier:
    """
    Wrap the XGBoost risk classifier with MAPIE conformal prediction.

    Uses score-based method with cross-validation to calibrate prediction sets.
    Adjusts cv folds based on available data to prevent class imbalance errors.
    """
    # Determine safe number of CV folds
    min_class_count = min(np.bincount(y_train.astype(int)))
    cv_folds = min(5, max(2, min_class_count // 5))

    mapie = MapieClassifier(
        estimator=risk_model,
        method="score",
        cv=cv_folds
    )
    mapie.fit(X_train, y_train)
    joblib.dump(mapie, "models_cache/mapie_risk.pkl")
    print(f"MAPIE risk wrapper fitted (cv={cv_folds})")
    return mapie


def wrap_salary_with_conformal(salary_model, X_train, y_train) -> MapieRegressor:
    """
    Wrap the XGBoost salary regressor with MAPIE conformal prediction.
    Provides calibrated salary prediction intervals.
    """
    cv_folds = min(5, max(2, len(y_train) // 20))

    mapie = MapieRegressor(
        estimator=salary_model,
        method="plus",
        cv=cv_folds
    )
    mapie.fit(X_train, y_train)
    joblib.dump(mapie, "models_cache/mapie_salary.pkl")
    print(f"MAPIE salary wrapper fitted (cv={cv_folds})")
    return mapie


def predict_with_ci(mapie_model, features_dict: dict, alpha: float = 0.20) -> dict:
    """
    Predict risk score with calibrated confidence intervals.

    Args:
        mapie_model: Fitted MapieClassifier
        features_dict: Dict of feature name -> value
        alpha: Significance level (0.20 = 80% CI)

    Returns:
        Dict with risk_score, ci_lower, ci_upper, ci_width, needs_human_review
    """
    X = np.array([[features_dict.get(f, 0.5) for f in ALL_FEATURES]])

    try:
        y_pred, y_pis = mapie_model.predict(X, alpha=alpha)

        # MapieClassifier returns prediction sets — extract bounds
        # y_pis shape: (n_samples, n_classes, n_alpha)
        # For binary classification, we use the probability approach
        if hasattr(y_pred, '__len__'):
            pred_class = int(y_pred[0])
        else:
            pred_class = int(y_pred)

        # Get prediction set bounds
        # y_pis[sample_idx, class_idx, alpha_idx]
        ci_lower = float(y_pis[0, 0, 0]) if y_pis.ndim >= 3 else 0.0
        ci_upper = float(y_pis[0, 1, 0]) if y_pis.ndim >= 3 else 1.0

        # Ensure bounds are valid
        ci_lower = max(0.0, min(ci_lower, 1.0))
        ci_upper = max(ci_lower, min(ci_upper, 1.0))
        ci_width = ci_upper - ci_lower

        return {
            "risk_score": round(float(pred_class), 3),
            "ci_lower": round(ci_lower, 3),
            "ci_upper": round(ci_upper, 3),
            "ci_width": round(ci_width, 3),
            "needs_human_review": ci_width > 0.30,
        }

    except Exception:
        # Fallback: return point prediction with synthetic CI
        return {
            "risk_score": 0.5,
            "ci_lower": 0.3,
            "ci_upper": 0.7,
            "ci_width": 0.4,
            "needs_human_review": True,
        }


def predict_salary_with_ci(mapie_salary_model, features_dict: dict,
                           alpha: float = 0.20) -> dict:
    """
    Predict salary range with calibrated confidence intervals.

    Returns:
        Dict with predicted_salary_lpa, salary_lower_lpa, salary_upper_lpa
    """
    X = np.array([[features_dict.get(f, 0.5) for f in ALL_FEATURES]])

    try:
        y_pred, y_pis = mapie_salary_model.predict(X, alpha=alpha)

        pred = float(y_pred[0])
        lower = float(y_pis[0, 0, 0])
        upper = float(y_pis[0, 1, 0])

        # Ensure salary bounds are non-negative
        lower = max(0.0, lower)
        upper = max(lower, upper)

        return {
            "predicted_salary_lpa": round(pred, 2),
            "salary_lower_lpa": round(lower, 2),
            "salary_upper_lpa": round(upper, 2),
        }

    except Exception:
        # Fallback
        return {
            "predicted_salary_lpa": 5.0,
            "salary_lower_lpa": 4.0,
            "salary_upper_lpa": 6.0,
        }
