"""
Training orchestrator — trains all ML models and saves artifacts to models_cache/.

Runs once before the demo. Inference runs on every API call.
Integrates all 5 improvements from the known limitations document.
"""

import os
import sys
import datetime
import numpy as np
import pandas as pd
import joblib

# Ensure backend is discoverable
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

from backend.database import SessionLocal
from backend.ml.features import build_training_dataframe
from backend.ml.survival_model import train_survival_models
from backend.ml.gbm_model import train_risk_model, train_salary_model, ALL_FEATURES
from backend.ml.shap_explainer import build_explainer
from backend.ml.uncertainty import wrap_risk_with_conformal, wrap_salary_with_conformal
from backend.ml.ensemble import train_ensemble
from backend.models.schema import ModelRegistry

os.makedirs("models_cache", exist_ok=True)


def train_all_models():
    """
    Full training pipeline:
      1. Build training DataFrame from DB
      2. Split train/holdout (stratified by course_family)
      3. Train survival models per course family
      4. Train XGBoost risk model (with trust-weighted samples)
      5. Train XGBoost salary model (with trust-weighted samples)
      6. Build SHAP explainer
      7. Wrap risk model in MAPIE conformal prediction
      8. Train LearnedEnsemble with temporal validation
      9. Insert row into model_registry
    """
    db = SessionLocal()

    try:
        # Step 1: Build training DataFrame
        print("=" * 60)
        print("RepaySignal Model Training Pipeline")
        print("=" * 60)
        print("\n[1/9] Building training DataFrame...")
        df = build_training_dataframe(db)
        print(f"  DataFrame shape: {df.shape}")
        print(f"  Risk label distribution: {df['risk_label'].value_counts().to_dict()}")
        print(f"  Course family distribution: {df['course_family'].value_counts().to_dict()}")

        # Step 2: Train/holdout split
        print("\n[2/9] Splitting train/holdout sets...")
        from sklearn.model_selection import train_test_split

        # Stratify by course_family for balanced representation
        df_train, df_holdout = train_test_split(
            df, test_size=0.2,
            stratify=df['course_family'],
            random_state=42
        )
        print(f"  Train: {len(df_train)} | Holdout: {len(df_holdout)}")

        # Step 3: Train survival models
        print("\n[3/9] Training survival models...")
        survival_models = train_survival_models(df_train)
        for family, model in survival_models.items():
            if model is not None:
                ci = model.concordance_index_
                n = len(df_train[df_train['course_family'] == family])
                print(f"  {family.capitalize()}: concordance index = {ci:.3f} (n={n})")
            elif family == "regulatory":
                print(f"  Regulatory: rule-based (no ML needed)")
            else:
                print(f"  {family.capitalize()}: skipped (insufficient data)")

        # Step 4: Train risk GBM (Improvement #1: trust-weighted)
        print("\n[4/9] Training risk GBM (trust-weighted)...")
        risk_model = train_risk_model(df_train)

        # Step 5: Train salary GBM (Improvement #1: trust-weighted)
        print("\n[5/9] Training salary GBM (trust-weighted)...")
        salary_model = train_salary_model(df_train)

        # Step 6: Build SHAP explainer
        print("\n[6/9] Building SHAP explainer...")
        explainer = build_explainer(risk_model)
        print("  SHAP TreeExplainer saved to models_cache/shap_explainer.pkl")

        # Step 7: MAPIE conformal prediction
        print("\n[7/9] Fitting MAPIE conformal wrappers...")
        X_train_risk = df_train[[f for f in ALL_FEATURES if f in df_train.columns]].fillna(0.5)
        for f in ALL_FEATURES:
            if f not in X_train_risk.columns:
                X_train_risk[f] = 0.5
        X_train_risk = X_train_risk[ALL_FEATURES]

        y_train_risk = df_train['risk_label'].astype(int)
        mapie_risk = wrap_risk_with_conformal(risk_model, X_train_risk, y_train_risk)

        # Salary MAPIE on placed students only
        placed_train = df_train[df_train['event_observed'] == True]
        if len(placed_train) > 20:
            X_train_sal = placed_train[[f for f in ALL_FEATURES if f in placed_train.columns]].fillna(0.5)
            for f in ALL_FEATURES:
                if f not in X_train_sal.columns:
                    X_train_sal[f] = 0.5
            X_train_sal = X_train_sal[ALL_FEATURES]
            y_train_sal = placed_train['salary_lpa'].dropna()
            X_train_sal = X_train_sal.loc[y_train_sal.index]
            mapie_salary = wrap_salary_with_conformal(salary_model, X_train_sal, y_train_sal)
        else:
            print("  Salary MAPIE skipped (insufficient placed students)")

        # Step 8: Train ensemble (Improvement #4: temporal validation)
        print("\n[8/9] Training ensemble meta-learner...")

        # Generate holdout predictions from each sub-engine
        X_holdout = df_holdout[[f for f in ALL_FEATURES if f in df_holdout.columns]].fillna(0.5)
        for f in ALL_FEATURES:
            if f not in X_holdout.columns:
                X_holdout[f] = 0.5
        X_holdout = X_holdout[ALL_FEATURES]

        # Survival scores: use 1 - p_6mo as risk proxy
        survival_preds = []
        for _, row in df_holdout.iterrows():
            family = row.get('course_family', 'market')
            model = survival_models.get(family)
            if model is not None and family != 'regulatory':
                try:
                    feat_cols = {
                        'campus': ["cgpa_percentile", "internship_access_score", "ppo_binary",
                                   "cert_count_norm", "season_phase", "field_demand_percentile",
                                   "mom_demand_delta", "graduation_cohort_size"],
                        'market': ["cgpa_percentile", "internship_access_score", "cert_count_norm",
                                   "field_demand_percentile", "adjacent_opportunity", "season_phase"]
                    }.get(family, ALL_FEATURES[:6])
                    df_infer = pd.DataFrame([{f: row.get(f, 0) for f in feat_cols}])
                    surv = model.predict_survival_function(df_infer).iloc[:, 0]
                    valid_t = [t for t in surv.index if t <= 6]
                    p6 = 1.0 - surv.loc[max(valid_t)] if valid_t else 0.5
                    survival_preds.append(float(p6))
                except Exception:
                    survival_preds.append(0.5)
            else:
                survival_preds.append(0.5)

        survival_preds = np.array(survival_preds)

        # Cohort scores from XGBoost
        cohort_scores = risk_model.predict_proba(X_holdout)[:, 1]

        # Demand scores
        demand_scores = df_holdout['field_demand_percentile'].fillna(0.5).values
        demand_scores = 1.0 - demand_scores  # Invert: low demand = high risk

        # Improvement #4: temporal ordering for TimeSeriesSplit
        timestamps = None
        if 'graduation_year' in df_holdout.columns and 'graduation_month' in df_holdout.columns:
            timestamps = (
                df_holdout['graduation_year'].fillna(2023) * 12 +
                df_holdout['graduation_month'].fillna(6)
            ).values

        ensemble = train_ensemble(
            df_holdout, survival_preds, cohort_scores, demand_scores,
            timestamps=timestamps
        )

        # Step 9: Update model registry
        print("\n[9/9] Updating model registry...")
        registry_entry = ModelRegistry(
            retrained_at=datetime.datetime.utcnow(),
            n_new_labels=len(df),
            survival_weight=float(ensemble.weights[0]),
            cohort_weight=float(ensemble.weights[1]),
            demand_weight=float(ensemble.weights[2]),
            meta_learner_r2=round(float(ensemble.meta.best_score_) if hasattr(ensemble.meta, 'best_score_') else 0.0, 3)
        )
        db.add(registry_entry)
        db.commit()
        print("  Model registry updated.")

        # Final summary
        print("\n" + "=" * 60)
        print("All models trained and saved to models_cache/")
        print("=" * 60)

        cached_files = os.listdir("models_cache")
        print(f"\nCached artifacts ({len(cached_files)}):")
        for f in sorted(cached_files):
            size_kb = os.path.getsize(f"models_cache/{f}") / 1024
            print(f"  {f} ({size_kb:.1f} KB)")

    except Exception as e:
        print(f"\n[ERROR] Training failed: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    train_all_models()
