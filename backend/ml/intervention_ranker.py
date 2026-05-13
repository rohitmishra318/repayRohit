"""
Intervention ranker — selects and ranks the top interventions for a student
based on their risk profile, course family, and contextual modifiers.
"""

from backend.data.intervention_catalog import INTERVENTION_CATALOG


def _compute_modifier(intervention, student_features, risk_data):
    """Apply contextual lift modifiers based on student profile."""
    modifier = 1.0
    modifiers = intervention.get("lift_modifiers", {})

    # No internship modifier
    if "no_internship" in modifiers:
        if student_features.get("internship_access_score", 0) < 0.3:
            modifier *= modifiers["no_internship"]

    # Low CGPA modifier
    if "low_cgpa" in modifiers:
        if student_features.get("cgpa_percentile", 0.5) < 0.35:
            modifier *= modifiers["low_cgpa"]

    # Has PPO modifier (reduces lift — they don't need this)
    if "has_ppo" in modifiers:
        if student_features.get("ppo_binary", 0) == 1:
            modifier *= modifiers["has_ppo"]

    # High adjacent opportunity
    if "high_adjacent_opportunity" in modifiers:
        if student_features.get("adjacent_opportunity", 0.5) > 0.6:
            modifier *= modifiers["high_adjacent_opportunity"]

    # Demand declining
    if "demand_declining" in modifiers:
        if student_features.get("mom_demand_delta", 0) < -0.05:
            modifier *= modifiers["demand_declining"]

    # Low cert count
    if "low_cert_count" in modifiers:
        if student_features.get("cert_count_norm", 0.5) < 0.2:
            modifier *= modifiers["low_cert_count"]

    # Tier-3 institute
    if "tier_3_institute" in modifiers:
        trust = student_features.get("data_trust_weight", 0.5)
        if trust < 0.4:
            modifier *= modifiers["tier_3_institute"]

    # Tier-1 institute (reduces lift for networking — they already have it)
    if "tier_1_institute" in modifiers:
        trust = student_features.get("data_trust_weight", 0.5)
        if trust > 0.8:
            modifier *= modifiers["tier_1_institute"]

    # High stress index
    if "high_stress_index" in modifiers:
        stress = risk_data.get("repayment_stress_index", 0.5)
        if stress > 0.6:
            modifier *= modifiers["high_stress_index"]

    # Pre-exam regulatory
    if "pre_exam" in modifiers:
        if student_features.get("months_since_graduation", 0) < 4:
            modifier *= modifiers["pre_exam"]

    return modifier


def rank_interventions(student_features, risk_data, top_n=3):
    """
    Rank interventions for a student based on adjusted lift.

    Args:
        student_features: Dict of computed feature values
        risk_data: Dict with risk_score, repayment_stress_index, etc.
        top_n: Number of top interventions to return

    Returns:
        List of top_n intervention dicts with adjusted_lift_pp
    """
    course_family = student_features.get("course_family", "market")

    candidates = []
    for intervention in INTERVENTION_CATALOG:
        # Filter by applicable course family
        if course_family not in intervention["applicable_families"]:
            continue

        modifier = _compute_modifier(intervention, student_features, risk_data)
        adjusted_lift = round(intervention["base_lift_pp"] * modifier, 1)

        candidates.append({
            "id": intervention["id"],
            "name": intervention["name"],
            "category": intervention["category"],
            "base_lift_pp": intervention["base_lift_pp"],
            "adjusted_lift_pp": adjusted_lift,
            "cost_tier": intervention["cost_tier"],
            "delivery": intervention["delivery"],
            "description": intervention["description"],
        })

    # Sort by adjusted lift descending
    candidates.sort(key=lambda x: x["adjusted_lift_pp"], reverse=True)
    return candidates[:top_n]
