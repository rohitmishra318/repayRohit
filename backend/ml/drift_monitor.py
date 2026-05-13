"""
Drift monitor using Population Stability Index (PSI) and Kolmogorov-Smirnov tests.

Improvement #5: Links drift detection to automated retraining flag.
When PSI > 0.2 or KS p-value < 0.01, sets trigger_retraining = True.
"""

import numpy as np
from scipy import stats


def compute_psi(reference, current, bins=10):
    """Compute Population Stability Index between reference and current distributions."""
    ref = np.array(reference, dtype=float)
    cur = np.array(current, dtype=float)

    # Create bins from reference distribution
    breakpoints = np.percentile(ref, np.linspace(0, 100, bins + 1))
    breakpoints = np.unique(breakpoints)

    ref_counts = np.histogram(ref, bins=breakpoints)[0]
    cur_counts = np.histogram(cur, bins=breakpoints)[0]

    # Add small epsilon to avoid division by zero
    eps = 1e-6
    ref_pct = (ref_counts + eps) / (ref_counts.sum() + eps * len(ref_counts))
    cur_pct = (cur_counts + eps) / (cur_counts.sum() + eps * len(cur_counts))

    psi = np.sum((cur_pct - ref_pct) * np.log(cur_pct / ref_pct))
    return round(float(psi), 4)


def compute_ks_test(reference, current):
    """Compute two-sample KS test statistic and p-value."""
    stat, p_value = stats.ks_2samp(reference, current)
    return {"ks_statistic": round(float(stat), 4), "p_value": round(float(p_value), 6)}


def check_drift(reference_features, current_features, feature_names=None):
    """
    Check for feature drift between reference (training) and current (inference) data.

    Returns:
        Dict with per-feature drift metrics and overall retraining recommendation.
    """
    ref = np.array(reference_features)
    cur = np.array(current_features)

    if feature_names is None:
        feature_names = [f"feature_{i}" for i in range(ref.shape[1])]

    results = []
    trigger_retraining = False

    for i, fname in enumerate(feature_names):
        ref_col = ref[:, i]
        cur_col = cur[:, i]

        if np.std(ref_col) == 0 and np.std(cur_col) == 0:
            continue

        psi = compute_psi(ref_col, cur_col)
        ks = compute_ks_test(ref_col, cur_col)

        drifted = psi > 0.2 or ks["p_value"] < 0.01

        results.append({
            "feature": fname,
            "psi": psi,
            "ks_statistic": ks["ks_statistic"],
            "ks_p_value": ks["p_value"],
            "drifted": drifted,
            "severity": "high" if psi > 0.25 else ("medium" if psi > 0.1 else "low")
        })

        # Improvement #5: Auto-retraining trigger
        if psi > 0.2:
            trigger_retraining = True

    drifted_count = sum(1 for r in results if r["drifted"])

    return {
        "features_checked": len(results),
        "features_drifted": drifted_count,
        "drift_ratio": round(drifted_count / max(len(results), 1), 3),
        "trigger_retraining": trigger_retraining,
        "details": results,
        "summary": "RETRAINING RECOMMENDED" if trigger_retraining else "No significant drift detected"
    }
