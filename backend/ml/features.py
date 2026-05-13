"""
Feature engineering pipeline.

Transforms raw student + institute + demand data into model-ready arrays.
All features are cohort-relative or externally derived — never raw institute absolute values.

Improvement #1 (partial): Attenuates noisy feature contributions from low-trust institutes
by blending feature values toward the population mean for low-trust data.
"""

import datetime
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from backend.models.schema import Student, Institute, Outcome, DemandIndex
from backend.ml.course_router import get_season_phase
from backend.data.demand_index_mock import ADJACENT_SECTORS

EXPECTED_INTERNSHIP_QUALITY = {"1": 1.8, "2": 1.2, "3": 0.7}
INTERNSHIP_ACTUAL = {"recognized": 2, "unverified": 1, "none": 0}
COL_MULTIPLIER = {"1": 1.45, "2": 1.10, "3": 0.85}


def compute_internship_access_score(employer_tier: str, institute_tier: str) -> float:
    tier_key = str(institute_tier).replace("tier_", "").strip() if institute_tier else "3"
    emp_tier_key = employer_tier if employer_tier else "none"

    actual = INTERNSHIP_ACTUAL.get(emp_tier_key, 0.0)
    expected = EXPECTED_INTERNSHIP_QUALITY.get(tier_key, 0.7)

    return min(round(actual / expected, 3), 1.5)


def compute_repayment_stress_index(predicted_salary_lpa: float, city_tier: int, emi_monthly: float) -> float:
    if not predicted_salary_lpa or not emi_monthly:
        return 1.0

    monthly_gross = (predicted_salary_lpa * 100000) / 12
    post_tax = monthly_gross * 0.75

    ct_key = str(city_tier) if city_tier else "3"
    col_adj = post_tax / COL_MULTIPLIER.get(ct_key, 0.85)

    if col_adj <= 0:
        return 2.0
    return round(min(emi_monthly / col_adj, 2.0), 3)


def compute_adjacent_opportunity(target_field: str, city_tier: int, db: Session) -> float:
    adj = ADJACENT_SECTORS.get(target_field, [])
    if not adj:
        return 0.5

    sectors = [a["sector"] for a in adj]
    records = db.query(DemandIndex).filter(
        DemandIndex.field.in_(sectors),
        DemandIndex.city_tier == city_tier
    ).all()

    if not records:
        return 0.5

    return round(max(r.demand_percentile for r in records) / 100.0, 3)


def _attenuate_by_trust(value: float, population_mean: float, trust: float) -> float:
    """
    Improvement #1: Attenuate noisy features from low-trust institutes.
    Blends the raw value toward the population mean proportional to (1 - trust).
    High trust (1.0) = use raw value; Low trust (0.3) = 70% population mean blend.
    """
    blend_factor = max(0.0, min(trust, 1.0))
    return blend_factor * value + (1 - blend_factor) * population_mean


def build_feature_vector(
    student: Student,
    institute: Institute,
    demand_record: Optional[DemandIndex],
    cohort_df: pd.DataFrame,
    db: Session
) -> Dict[str, Any]:

    current_month = datetime.datetime.now().month
    trust = float(getattr(institute, 'data_trust_score', 0.5) or 0.5)

    # CGPA percentile within cohort
    if not cohort_df.empty and student.cgpa is not None:
        cgpa_percentile = float((cohort_df['cgpa'] <= student.cgpa).mean())
    else:
        cgpa_percentile = 0.5

    # Improvement #1: Attenuate CGPA percentile for low-trust institutes
    cgpa_percentile = _attenuate_by_trust(cgpa_percentile, 0.5, trust)

    internship_score = compute_internship_access_score(
        student.internship_employer_tier, institute.tier
    )
    # Improvement #1: Attenuate internship score for low-trust data
    internship_score = _attenuate_by_trust(internship_score, 0.5, trust)

    adj_opp = compute_adjacent_opportunity(student.target_field, student.target_city_tier, db)

    return {
        "cgpa_percentile": round(cgpa_percentile, 3),
        "internship_access_score": round(internship_score, 3),
        "ppo_binary": 1 if student.ppo_exists else 0,
        "cert_count_norm": min((student.cert_count or 0) / 5.0, 1.0),
        "months_since_graduation": student.months_since_graduation or 0,
        "season_phase": get_season_phase(student.course_type, current_month),
        "graduation_cohort_size": len(cohort_df) if not cohort_df.empty else 1,
        "field_demand_percentile": round(demand_record.demand_percentile / 100.0, 3) if demand_record else 0.5,
        "mom_demand_delta": round(demand_record.mom_delta / 100.0, 3) if demand_record else 0.0,
        "adjacent_opportunity": adj_opp,
        "data_trust_weight": trust,
        "course_family": student.course_family
    }


def build_training_dataframe(db: Session) -> pd.DataFrame:
    """
    Constructs the master analytical dataframe for model training.
    Vectorized operations for performance — avoids row-by-row DB queries.
    """
    students_df = pd.read_sql(db.query(Student).statement, db.bind)
    institutes_df = pd.read_sql(db.query(Institute).statement, db.bind)
    outcomes_df = pd.read_sql(db.query(Outcome).statement, db.bind)
    demand_df = pd.read_sql(db.query(DemandIndex).statement, db.bind)

    # Get latest demand per field+city_tier
    latest_demand = demand_df.sort_values('month').groupby(['field', 'city_tier']).tail(1)

    # Merge with distinct suffixes to prevent column collision
    df = students_df.merge(
        institutes_df.add_suffix('_inst'),
        left_on='institute_id', right_on='institute_id_inst', how='left'
    )
    df = df.merge(
        outcomes_df.add_suffix('_out'),
        left_on='student_id', right_on='student_id_out', how='left'
    )
    df = df.merge(
        latest_demand[['field', 'city_tier', 'demand_percentile', 'mom_delta']],
        left_on=['target_field', 'target_city_tier'],
        right_on=['field', 'city_tier'],
        how='left'
    )

    # Map columns back to expected names
    df['tier'] = df.get('tier_inst', pd.Series(['3'] * len(df)))
    df['data_trust_score'] = df.get('data_trust_score_inst', pd.Series([0.5] * len(df)))
    df['event_observed'] = df.get('event_observed_out', pd.Series([False] * len(df)))
    df['months_to_event'] = df.get('months_to_event_out', pd.Series([6] * len(df)))
    df['actual_salary'] = df.get('actual_salary_out', pd.Series(dtype=float))

    # Handle missing CGPA with median imputation
    df['cgpa'] = df['cgpa'].fillna(df['cgpa'].median())

    # Compute cohort-relative features vectorized
    df['cgpa_percentile'] = df.groupby(
        ['institute_id', 'course_type', 'graduation_year']
    )['cgpa'].rank(pct=True).fillna(0.5)

    df['graduation_cohort_size'] = df.groupby(
        ['institute_id', 'course_type', 'graduation_year']
    )['student_id'].transform('count')

    df['internship_access_score'] = df.apply(
        lambda r: compute_internship_access_score(
            r['internship_employer_tier'], r.get('tier', '3')
        ), axis=1
    )

    # Improvement #1: Attenuate features by trust score (vectorized)
    trust = df['data_trust_score'].fillna(0.5)
    df['cgpa_percentile'] = trust * df['cgpa_percentile'] + (1 - trust) * 0.5
    df['internship_access_score'] = trust * df['internship_access_score'] + (1 - trust) * 0.5

    df['ppo_binary'] = df['ppo_exists'].astype(int)
    df['cert_count_norm'] = (df['cert_count'].fillna(0) / 5.0).clip(upper=1.0)

    current_month = datetime.datetime.now().month
    df['season_phase'] = df['course_type'].apply(lambda c: get_season_phase(c, current_month))

    # Vectorized adjacent opportunity — pre-compute all sector max demands
    adj_demand_cache = {}
    for sector, adj_list in ADJACENT_SECTORS.items():
        adj_sectors = [a["sector"] for a in adj_list]
        for ct in [1, 2, 3]:
            max_dem = latest_demand[
                (latest_demand['field'].isin(adj_sectors)) &
                (latest_demand['city_tier'] == ct)
            ]['demand_percentile'].max()
            adj_demand_cache[(sector, ct)] = round(max_dem / 100.0, 3) if pd.notna(max_dem) else 0.5

    df['adjacent_opportunity'] = df.apply(
        lambda r: adj_demand_cache.get(
            (r['target_field'], r['target_city_tier']), 0.5
        ), axis=1
    )

    df['field_demand_percentile'] = (df['demand_percentile'] / 100.0).fillna(0.5)
    df['mom_demand_delta'] = (df['mom_delta'] / 100.0).fillna(0.0)

    # Target definitions
    df['risk_label'] = (~df['event_observed'].fillna(False).astype(bool)).astype(int)
    df['salary_lpa'] = df['actual_salary'] / 100000.0

    df['data_trust_weight'] = df['data_trust_score'].fillna(0.5)
    df['course_family'] = df['course_family'].fillna("market")

    # Clean up suffix columns
    final_cols = [c for c in df.columns if not c.endswith('_inst') and not c.endswith('_out')]
    df = df.loc[:, ~df.columns.duplicated()]
    return df[final_cols]
