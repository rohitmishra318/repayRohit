import os
import joblib
import pandas as pd
from sqlalchemy.orm import Session
from backend.models.schema import Student, Institute, DemandIndex
from backend.models.schema import RiskScore, AlertState, ModelRegistry
from backend.ml.features import build_feature_vector
from backend.services.risk_service import get_risk_tier
from backend.data.demand_index_mock import get_latest_demand

CACHE_DIR = "models_cache"
try:
    xgb_risk = joblib.load(os.path.join(CACHE_DIR, "xgb_risk.pkl"))
except Exception:
    xgb_risk = None

def get_portfolio_summary(db: Session) -> dict:
    students = db.query(Student).all()

    scores_map = {
        str(rs.student_id): float(rs.risk_score or 0)
        for rs in db.query(RiskScore).all()
    }

    high, medium, low = 0, 0, 0
    field_data: dict = {}

    for s in students:
        score = scores_map.get(str(s.student_id), 0.5)
        tier = get_risk_tier(score)
        if tier == "HIGH": high += 1
        elif tier == "MEDIUM": medium += 1
        else: low += 1

        field = s.target_field or "unknown"
        if field not in field_data:
            field_data[field] = {"scores": [], "count": 0}
        field_data[field]["scores"].append(score)
        field_data[field]["count"] += 1

    sector_exposure = sorted([
        {
            "field": f,
            "student_count": d["count"],
            "avg_risk": round(sum(d["scores"]) / len(d["scores"]), 3),
            "demand_percentile": 65.0,
        }
        for f, d in field_data.items()
    ], key=lambda x: x["avg_risk"], reverse=True)

    all_scores = list(scores_map.values())
    avg_risk = round(sum(all_scores) / len(all_scores), 3) if all_scores else 0.0

    recent_alerts = []
    for alert in (db.query(AlertState)
                    .filter(AlertState.state == "triggered")
                    .order_by(AlertState.updated_at.desc())
                    .limit(5).all()):
        student = db.query(Student).filter(Student.student_id == alert.student_id).first()
        recent_alerts.append({
            "id": str(alert.id),
            "student_id": str(alert.student_id),
            "student_name": student.name if student else "Unknown",
            "trigger_name": alert.trigger_name,
            "severity": alert.severity,
            "deadline": str(alert.deadline) if alert.deadline else None,
            "state": alert.state,
        })

    model_reg = db.query(ModelRegistry).order_by(ModelRegistry.id.desc()).first()
    model_version = None
    if model_reg:
        model_version = {
            "id": model_reg.id,
            "retrained_at": str(model_reg.retrained_at),
            "n_new_labels": model_reg.n_new_labels,
            "survival_weight": float(model_reg.survival_weight or 0),
            "cohort_weight": float(model_reg.cohort_weight or 0),
            "demand_weight": float(model_reg.demand_weight or 0),
            "meta_learner_r2": float(model_reg.meta_learner_r2 or 0),
        }

    return {
        "total_students": len(students),
        "high_risk_count": high,
        "medium_risk_count": medium,
        "low_risk_count": low,
        "avg_risk_score": avg_risk,
        "sector_exposure": sector_exposure,
        "recent_alerts": recent_alerts,
        "model_version": model_version,
    }


async def run_stress_test(field: str, shock_pct: float, db: Session) -> dict:
    """Collect all students in target field, apply demand shock, and re-predict natively."""
    students = db.query(Student).filter(Student.target_field == field).all()
    institutes_map = {str(i.institute_id): i for i in db.query(Institute).all()}
    
    if not students or not xgb_risk:
        return {
            "shock_applied": f"{field} demand drops {shock_pct:.0f}%",
            "baseline_high_risk": 0,
            "shocked_high_risk": 0,
            "new_at_risk": 0,
            "portfolio_impact_pct": 0.0,
            "most_affected_fields": [field],
        }

    baseline_high = 0
    shocked_high = 0

    for s in students:
        inst = institutes_map.get(str(s.institute_id))
        
        # Get actual cohort 
        cohort = db.query(Student.cgpa).filter(
            Student.institute_id == s.institute_id,
            Student.course_type == s.course_type,
            Student.graduation_year == s.graduation_year
        ).all()
        cohort_df = pd.DataFrame(cohort, columns=['cgpa']) if cohort else pd.DataFrame()
        
        # Get demand
        demand_record = get_latest_demand(s.target_field, s.target_city_tier, db)
        if not demand_record: continue
        
        from backend.ml.gbm_model import _prepare_features
        # Build baseline features
        f_base = build_feature_vector(s, inst, demand_record, cohort_df, db)
        X_base_df = pd.DataFrame([f_base])
        X_base = _prepare_features(X_base_df).values
        base_score = float(xgb_risk.predict_proba(X_base)[0][1])
        if base_score >= 0.70:
            baseline_high += 1
            
        # Apply shock
        demand_record.demand_percentile = max(0, demand_record.demand_percentile * (1 - (shock_pct/100.0)))
        demand_record.mom_delta = demand_record.mom_delta - shock_pct
        
        f_shock = build_feature_vector(s, inst, demand_record, cohort_df, db)
        X_shock_df = pd.DataFrame([f_shock])
        X_shock = _prepare_features(X_shock_df).values
        shock_score = float(xgb_risk.predict_proba(X_shock)[0][1])
        if shock_score >= 0.70:
            shocked_high += 1

    new_at_risk = max(0, shocked_high - baseline_high)
    impact_pct = round((new_at_risk / len(students)) * 100, 2) if students else 0.0

    return {
        "shock_applied": f"{field} demand drops {shock_pct:.0f}%",
        "baseline_high_risk": baseline_high,
        "shocked_high_risk": shocked_high,
        "new_at_risk": new_at_risk,
        "portfolio_impact_pct": impact_pct,
        "most_affected_fields": [field],
    }
