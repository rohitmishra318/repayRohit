"""
Learned Ensemble — Meta-learner combining survival, cohort, and demand sub-engine scores.

Improvements integrated:
  - Improvement #2 (Soft Routing): Mixture-of-experts blending replaces hard course routing
  - Improvement #4 (Temporal Validation): TimeSeriesSplit for meta-learner training
"""

import os
import numpy as np
import joblib
from sklearn.linear_model import RidgeCV
from sklearn.model_selection import TimeSeriesSplit

os.makedirs("models_cache", exist_ok=True)


class LearnedEnsemble:
    """
    Three-signal meta-learner that combines:
      1. Survival sub-engine score (Cox PH / regulatory rules)
      2. Cohort sub-engine score (XGBoost risk probability)
      3. Demand sub-engine score (field demand percentile)

    Uses RidgeCV with TimeSeriesSplit to prevent temporal leakage.
    Trust-weighted prediction down-weights cohort signal for low-trust institutes.
    Soft routing allows blended predictions across sub-engines.
    """

    def __init__(self):
        self.meta = RidgeCV(alphas=[0.01, 0.1, 1.0, 10.0], fit_intercept=False)
        self.weights = np.array([0.50, 0.30, 0.20])  # fallback defaults: S, C, D

    def fit(self, survival_scores, cohort_scores, demand_scores, y_outcomes,
            timestamps=None):
        """
        Fit the meta-learner on holdout predictions.

        Args:
            survival_scores: Array of survival-based risk scores
            cohort_scores: Array of XGBoost risk probabilities
            demand_scores: Array of demand-based scores
            y_outcomes: Array of actual risk labels (0/1)
            timestamps: Optional array of temporal ordering for TimeSeriesSplit
        """
        X = np.column_stack([survival_scores, cohort_scores, demand_scores])

        # Improvement #4: Temporal validation — use TimeSeriesSplit if timestamps available
        if timestamps is not None:
            # Sort by timestamp to ensure temporal ordering
            sort_idx = np.argsort(timestamps)
            X = X[sort_idx]
            y_outcomes = np.array(y_outcomes)[sort_idx]

            tscv = TimeSeriesSplit(n_splits=min(5, max(2, len(y_outcomes) // 50)))
            self.meta = RidgeCV(
                alphas=[0.01, 0.1, 1.0, 10.0],
                fit_intercept=False,
                cv=tscv
            )

        self.meta.fit(X, y_outcomes)

        # Extract and normalize weights (clip negatives to 0)
        raw = np.clip(self.meta.coef_, 0, None)
        if raw.sum() > 0:
            self.weights = raw / raw.sum()
        else:
            self.weights = np.array([0.50, 0.30, 0.20])

        return self

    def predict(self, survival_score: float, cohort_score: float,
                demand_score: float, data_trust_weight: float = 0.5) -> float:
        """
        Compute final ensemble risk score with trust-weighted adjustment.

        Trust weighting logic:
          - High trust (close to 1.0): Cohort signal gets full weight
          - Low trust (close to 0.0): Cohort weight shifts to demand signal
          This prevents noisy institute data from dominating predictions.
        """
        w = self.weights

        # Trust-adjusted weighting: shift cohort weight to demand for low-trust data
        cohort_w = w[1] * data_trust_weight
        demand_w = w[2] + w[1] * (1 - data_trust_weight)
        survival_w = w[0]

        raw = survival_w * survival_score + cohort_w * cohort_score + demand_w * demand_score
        return float(np.clip(raw, 0.0, 1.0))

    def predict_soft_routed(self, scores_by_family: dict,
                            routing_weights: dict,
                            data_trust_weight: float = 0.5) -> float:
        """
        Improvement #2: Soft routing / mixture-of-experts.

        Instead of hard-routing to a single sub-engine, blend predictions
        from multiple sub-engines using routing weights.

        Args:
            scores_by_family: Dict of {family: (survival_score, cohort_score, demand_score)}
            routing_weights: Dict of {family: weight} summing to 1.0
            data_trust_weight: Institute data quality trust score
        """
        blended = 0.0
        for family, weight in routing_weights.items():
            if family in scores_by_family:
                s, c, d = scores_by_family[family]
                family_score = self.predict(s, c, d, data_trust_weight)
                blended += weight * family_score
        return float(np.clip(blended, 0.0, 1.0))

    def save(self, path: str = "models_cache/ensemble_weights.pkl"):
        joblib.dump(self, path)

    @classmethod
    def load(cls, path: str = "models_cache/ensemble_weights.pkl") -> "LearnedEnsemble":
        return joblib.load(path)


def train_ensemble(df_holdout, survival_preds, cohort_scores, demand_scores,
                   timestamps=None) -> LearnedEnsemble:
    """
    Train the ensemble meta-learner on holdout predictions.

    Args:
        df_holdout: DataFrame with 'risk_label' column
        survival_preds: Array of survival-based scores
        cohort_scores: Array of XGBoost risk probabilities
        demand_scores: Array of demand-based scores
        timestamps: Optional temporal ordering array
    """
    ensemble = LearnedEnsemble()
    ensemble.fit(
        survival_preds,
        cohort_scores,
        demand_scores,
        df_holdout['risk_label'].values,
        timestamps=timestamps
    )
    ensemble.save()
    print(f"Ensemble weights: S={ensemble.weights[0]:.2f} "
          f"C={ensemble.weights[1]:.2f} D={ensemble.weights[2]:.2f}")
    return ensemble
