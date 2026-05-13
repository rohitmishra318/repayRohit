import uuid
import os
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException
from backend.models.schema import Student, Institute, DemandIndex
from backend.models.schema import RiskScore
from backend.ml.features import build_feature_vector, compute_repayment_stress_index
from backend.ml.bias_detector import check_single_student_bias
from backend.data.demand_index_mock import get_latest_demand

CACHE_DIR = "models_cache"

# Load models globally
try:
    xgb_risk = joblib.load(os.path.join(CACHE_DIR, "xgb_risk.pkl"))
    xgb_salary = joblib.load(os.path.join(CACHE_DIR, "xgb_salary.pkl"))
    mapie_risk = joblib.load(os.path.join(CACHE_DIR, "mapie_risk.pkl"))
    shap_explainer = joblib.load(os.path.join(CACHE_DIR, "shap_explainer.pkl"))
    
    # Survival models
    cph_models = {
        "campus": joblib.load(os.path.join(CACHE_DIR, "cph_campus.pkl")),
        "market": joblib.load(os.path.join(CACHE_DIR, "cph_market.pkl")),
        "regulatory": joblib.load(os.path.join(CACHE_DIR, "cph_regulatory.pkl"))
    }
except Exception as e:
    print(f"Warning: Could not load all ML models: {e}")
    xgb_risk, xgb_salary, mapie_risk, shap_explainer, cph_models = None, None, None, None, {}

def get_risk_tier(score: float) -> str:
    if score >= 0.75: return "HIGH"
    if score >= 0.55: return "MEDIUM"
    return "LOW"

def get_stress_label(index: float) -> str:
    if index < 0.35: return "LOW"
    if index < 0.50: return "MODERATE"
    if index < 0.70: return "HIGH"
    return "CRITICAL"

async def score_student(student_id: str, db: Session) -> dict:
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    institute = db.query(Institute).filter(Institute.institute_id == student.institute_id).first()
    
    # Get latest demand
    demand_record = get_latest_demand(student.target_field, student.target_city_tier, db)
        
    # Get cohort df for CGPA ranking
    cohort = db.query(Student.cgpa).filter(
        Student.institute_id == student.institute_id,
        Student.course_type == student.course_type,
        Student.graduation_year == student.graduation_year
    ).all()
    cohort_df = pd.DataFrame(cohort, columns=['cgpa']) if cohort else pd.DataFrame()

    features_dict = build_feature_vector(student, institute, demand_record, cohort_df, db)
    
    # Construct X array
    from backend.ml.gbm_model import _prepare_features
    X_df = pd.DataFrame([features_dict])
    X = _prepare_features(X_df).values

    # Predict Risk & Mapie CI
    risk_score = float(xgb_risk.predict_proba(X)[0][1]) if xgb_risk else 0.5
    if mapie_risk:
        _, y_pis = mapie_risk.predict(X, alpha=0.20)
        classes_in_set = int(y_pis[0, :, 0].sum())
        if classes_in_set == 2:
            ci_lower = max(0, risk_score - 0.15)
            ci_upper = min(1, risk_score + 0.15)
        else:
            ci_lower = max(0, risk_score - 0.05)
            ci_upper = min(1, risk_score + 0.05)
    else:
        ci_lower, ci_upper = max(0, risk_score - 0.1), min(1, risk_score + 0.1)
    ci_width = ci_upper - ci_lower
        
    # Predict Salary
    if xgb_salary:
        pred_sal = float(xgb_salary.predict(X)[0]) * 100000
        sal_lower, sal_upper = pred_sal * 0.85, pred_sal * 1.15
    else:
        sal_lower, sal_upper = 300000.0, 500000.0

    # SHAP explainer
    shap_drivers = []
    if shap_explainer:
        shap_vals = shap_explainer.shap_values(X)
        # Handle binary vs regression shap output
        if isinstance(shap_vals, list):
            sv = shap_vals[1][0]
        elif len(shap_vals.shape) == 3:
            sv = shap_vals[0, :, 1]
        else:
            sv = shap_vals[0]
            
        from backend.ml.gbm_model import ALL_FEATURES
        feature_names = list(ALL_FEATURES)
        importances = []
        for i, val in enumerate(sv):
            importances.append({
                "feature": feature_names[i],
                "direction": "increases_risk" if val > 0 else "reduces_risk",
                "magnitude": abs(float(val)),
                "display": f"{feature_names[i].replace('_', ' ').title()} Impact"
            })
        importances.sort(key=lambda x: x["magnitude"], reverse=True)
        shap_drivers = importances[:3]

    # Bias Flags
    bias_flags = check_single_student_bias(student, risk_score)
    
    # Survival Model
    from backend.ml.survival_model import predict_placement_probs
    survival_result = predict_placement_probs(features_dict, cph_models)
    p_3mo = survival_result["p_3mo"]
    p_6mo = survival_result["p_6mo"]
    p_12mo = survival_result["p_12mo"]
    regulatory_note = survival_result.get("regulatory_note")
    cf = student.course_family

    stress_index = compute_repayment_stress_index(sal_lower/100000.0, student.target_city_tier, float(student.loan_emi_monthly or 0))

    result = {
        "student_id": student_id,
        "risk_score": risk_score,
        "ci_lower": ci_lower,
        "ci_upper": ci_upper,
        "ci_width": ci_width,
        "p_3mo": p_3mo,
        "p_6mo": p_6mo,
        "p_12mo": p_12mo,
        "predicted_salary_lower": sal_lower,
        "predicted_salary_upper": sal_upper,
        "repayment_stress_index": stress_index,
        "repayment_stress_label": get_stress_label(stress_index),
        "shap_drivers": shap_drivers,
        "bias_flags": bias_flags,
        "data_trust_weight": features_dict.get("data_trust_weight", 0.5),
        "course_family": cf,
        "regulatory_note": regulatory_note,
        "needs_human_review": ci_width > 0.30 or len(bias_flags) > 0,
        "scored_at": datetime.utcnow().isoformat()
    }

    # Upsert
    existing = db.query(RiskScore).filter(RiskScore.student_id == student_id).first()
    db_fields = {k: v for k, v in result.items() if k not in ("student_id", "repayment_stress_label", "scored_at")}
    if existing:
        for k, v in db_fields.items():
            setattr(existing, k, v)
    else:
        db.add(RiskScore(id=str(uuid.uuid4()), student_id=student_id, **db_fields))
    db.commit()

    return result
