"""
SHAP explainer for XGBoost risk model.

Extracts top-N SHAP drivers with signed direction, magnitude, and
human-readable display strings for the LLM risk card generator.
"""

import os
import joblib
import numpy as np
import shap

os.makedirs("models_cache", exist_ok=True)

FEATURE_DISPLAY_NAMES = {
    "cgpa_percentile":         "CGPA relative to cohort",
    "internship_access_score": "Internship quality (access-adjusted)",
    "ppo_binary":              "Pre-placement offer",
    "cert_count_norm":         "Skill certifications",
    "season_phase":            "Campus placement season timing",
    "field_demand_percentile": "Job demand in target field",
    "mom_demand_delta":        "Month-on-month demand change",
    "adjacent_opportunity":    "Adjacent sector opportunity",
    "months_since_graduation": "Time since graduation",
}

ALL_FEATURES = list(FEATURE_DISPLAY_NAMES.keys())


def build_explainer(risk_model) -> shap.TreeExplainer:
    """Build and cache a SHAP TreeExplainer from the trained risk model."""
    explainer = shap.TreeExplainer(risk_model)
    joblib.dump(explainer, "models_cache/shap_explainer.pkl")
    return explainer


def get_top_drivers(features_dict: dict, explainer: shap.TreeExplainer, n: int = 3) -> list:
    """
    Extract the top-N SHAP drivers for a single prediction.

    CRITICAL: preserves signed direction — does NOT take abs() before sorting.
    Sort by abs(shap_value) descending, take top n.

    Returns list of dicts with: feature, direction, magnitude, signed, display
    """
    # Handle string-type adjacent_opportunity via label encoder
    fd = dict(features_dict)
    if "adjacent_opportunity" in fd and isinstance(fd["adjacent_opportunity"], str):
        if os.path.exists("models_cache/le_adjacent.pkl"):
            le = joblib.load("models_cache/le_adjacent.pkl")
            val = fd["adjacent_opportunity"]
            fd["adjacent_opportunity"] = le.transform([val])[0] if val in le.classes_ else -1

    features_array = np.array([[fd.get(f, 0.5) for f in ALL_FEATURES]])
    shap_values = explainer.shap_values(features_array)

    # Handle binary classifier: shap_values may be list of [class0, class1]
    if isinstance(shap_values, list):
        # Use class 1 (high risk) SHAP values
        sv = shap_values[1][0] if len(shap_values) > 1 else shap_values[0][0]
    elif shap_values.ndim == 3:
        sv = shap_values[0, :, 1]
    else:
        sv = shap_values[0]

    paired = []
    for i, val in enumerate(sv):
        feat_name = ALL_FEATURES[i]
        display_name = FEATURE_DISPLAY_NAMES.get(feat_name, feat_name)
        direction = "increases_risk" if val > 0 else "reduces_risk"
        verb = "raises" if val > 0 else "lowers"

        paired.append({
            "feature": display_name,
            "direction": direction,
            "magnitude": round(abs(float(val)), 4),
            "signed": round(float(val), 4),
            "display": f"{display_name} {verb} risk",
        })

    # Sort by magnitude (abs value) descending
    paired.sort(key=lambda x: x["magnitude"], reverse=True)
    return paired[:n]
