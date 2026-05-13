"""
Intervention catalog — static definitions of available interventions
with research-calibrated lift estimates and cost tiers.
"""

INTERVENTION_CATALOG = [
    {
        "id": "INT001",
        "name": "Mock Interview Bootcamp",
        "category": "skill_building",
        "applicable_families": ["campus", "market"],
        "base_lift_pp": 12,
        "cost_tier": "Low cost",
        "delivery": "Online 2-week sprint",
        "lift_modifiers": {
            "no_internship": 1.3,
            "low_cgpa": 1.1,
            "has_ppo": 0.5,
        },
        "description": "Intensive mock interviews with industry panelists to build confidence and technique."
    },
    {
        "id": "INT002",
        "name": "Resume & Portfolio Workshop",
        "category": "skill_building",
        "applicable_families": ["campus", "market", "regulatory"],
        "base_lift_pp": 8,
        "cost_tier": "Zero cost",
        "delivery": "Self-paced online module",
        "lift_modifiers": {
            "low_cgpa": 1.2,
            "no_internship": 1.1,
        },
        "description": "Professional resume building, LinkedIn optimization, and portfolio curation."
    },
    {
        "id": "INT003",
        "name": "Adjacent Sector Pivot Coaching",
        "category": "career_pivot",
        "applicable_families": ["market", "campus"],
        "base_lift_pp": 15,
        "cost_tier": "Medium cost",
        "delivery": "1-on-1 career counseling (3 sessions)",
        "lift_modifiers": {
            "high_adjacent_opportunity": 1.4,
            "demand_declining": 1.3,
        },
        "description": "Guided exploration of adjacent career sectors with transferable skill mapping."
    },
    {
        "id": "INT004",
        "name": "Upskilling Certification",
        "category": "skill_building",
        "applicable_families": ["campus", "market"],
        "base_lift_pp": 10,
        "cost_tier": "Medium cost",
        "delivery": "Online certification (4-8 weeks)",
        "lift_modifiers": {
            "low_cert_count": 1.3,
            "high_demand_field": 1.2,
        },
        "description": "Industry-recognized certification in high-demand skill areas."
    },
    {
        "id": "INT005",
        "name": "Board Exam Preparation Support",
        "category": "regulatory_support",
        "applicable_families": ["regulatory"],
        "base_lift_pp": 18,
        "cost_tier": "Low cost",
        "delivery": "Study group + mentor matching",
        "lift_modifiers": {
            "pre_exam": 1.5,
            "failed_once": 1.3,
        },
        "description": "Structured study support and mentor matching for professional licensing exams."
    },
    {
        "id": "INT006",
        "name": "Internship Bridge Program",
        "category": "experience_building",
        "applicable_families": ["campus", "market"],
        "base_lift_pp": 14,
        "cost_tier": "Zero cost",
        "delivery": "Partner company placements (2-3 months)",
        "lift_modifiers": {
            "no_internship": 1.5,
            "tier_3_institute": 1.2,
        },
        "description": "Short-term internship placements with partner companies to build work experience."
    },
    {
        "id": "INT007",
        "name": "Networking & Alumni Connect",
        "category": "network_building",
        "applicable_families": ["campus", "market", "regulatory"],
        "base_lift_pp": 7,
        "cost_tier": "Zero cost",
        "delivery": "Alumni platform + monthly meetups",
        "lift_modifiers": {
            "tier_1_institute": 0.7,
            "tier_3_institute": 1.4,
        },
        "description": "Connect with successful alumni for mentorship, referrals, and industry insights."
    },
    {
        "id": "INT008",
        "name": "EMI Restructuring Recommendation",
        "category": "financial",
        "applicable_families": ["campus", "market", "regulatory"],
        "base_lift_pp": 5,
        "cost_tier": "Zero cost",
        "delivery": "Automated lender recommendation",
        "lift_modifiers": {
            "high_stress_index": 1.5,
            "low_salary_prediction": 1.3,
        },
        "description": "Recommend EMI restructuring to reduce immediate financial stress during job search."
    },
]
