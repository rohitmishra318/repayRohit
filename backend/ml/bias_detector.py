"""
Bias detector using Fairlearn demographic parity difference.

Flags when risk scores correlate with protected attributes
(institute tier, geographic tier) beyond acceptable thresholds.
"""

import numpy as np

try:
    from fairlearn.metrics import demographic_parity_difference
    FAIRLEARN_AVAILABLE = True
except ImportError:
    FAIRLEARN_AVAILABLE = False

BIAS_THRESHOLD = 0.15

PROTECTED_ATTRIBUTES = {
    "institute_tier": "institute tier",
    "home_state_tier": "home state economic tier",
}


def check_bias(risk_scores, student_records):
    """Check for demographic parity violations across protected attributes."""
    flags = []
    risk_arr = np.array(risk_scores)
    risk_binary = (risk_arr > 0.5).astype(int)

    for attr_key, attr_display in PROTECTED_ATTRIBUTES.items():
        try:
            if attr_key == "institute_tier":
                sensitive = []
                for s in student_records:
                    tier = getattr(s, 'institute_tier', None) or getattr(s, 'tier', None)
                    tier_str = str(tier).replace("tier_", "").strip() if tier else "2"
                    try:
                        sensitive.append(int(tier_str))
                    except (ValueError, TypeError):
                        sensitive.append(2)
            elif attr_key == "home_state_tier":
                sensitive = [int(getattr(s, 'target_city_tier', 2) or 2) for s in student_records]
            else:
                continue

            sensitive = np.array(sensitive)
            if len(np.unique(sensitive)) < 2:
                continue

            if FAIRLEARN_AVAILABLE:
                dpd = demographic_parity_difference(y_true=risk_binary, y_pred=risk_binary, sensitive_features=sensitive)
            else:
                groups = np.unique(sensitive)
                rates = [risk_binary[sensitive == g].mean() for g in groups if (sensitive == g).sum() > 0]
                dpd = max(rates) - min(rates) if rates else 0.0

            if abs(dpd) > BIAS_THRESHOLD:
                flags.append({
                    "attribute": attr_display,
                    "dpd": round(float(dpd), 3),
                    "warning": f"Risk score correlates with {attr_display} (DPD={dpd:.2f}). This may reflect structural disadvantage, not individual employability. Manual review recommended."
                })
        except Exception:
            continue
    return flags


def check_single_student_bias(student, risk_score):
    """Quick bias flag check for a single student during scoring."""
    flags = []
    tier = getattr(student, 'institute_tier', None) or getattr(student, 'tier', None)
    tier_str = str(tier).lower().replace("tier_", "").strip() if tier else ""

    if tier_str == "3" and risk_score > 0.65:
        flags.append({
            "attribute": "institute tier",
            "dpd": round(risk_score - 0.50, 3),
            "warning": "Risk score is elevated partly due to institute tier (Tier 3). This may reflect structural disadvantage rather than individual employability. Manual review recommended before automated action."
        })

    city_tier = getattr(student, 'target_city_tier', None)
    if city_tier and int(city_tier) == 3 and risk_score > 0.70:
        flags.append({
            "attribute": "home state economic tier",
            "dpd": round(risk_score - 0.55, 3),
            "warning": "Risk score is influenced by target city tier (Tier 3). Limited job market access in smaller cities may inflate risk beyond individual capability. Consider adjacent sector pivots."
        })
    return flags
