from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.database import get_db
from backend.services.risk_service import score_student, get_stress_label
from backend.models.schema import Student, Institute
from backend.models.schema import RiskScore
from backend.services.llm_service import generate_risk_card
from datetime import datetime
from backend.schemas.risk import RiskCardResponse, RiskScoreResponse

class RiskCardRequest(BaseModel):
    student_id: str

router = APIRouter()

@router.get("/{student_id}", response_model=RiskScoreResponse)
async def get_risk(student_id: str, db: Session = Depends(get_db)):
    """
    Evaluates the native ML models in real-time, returning a valid JSON with SHAP drivers and MAPIE bounds.
    """
    result = await score_student(student_id, db)
    return result

@router.get("/{student_id}/cached", response_model=RiskScoreResponse)
async def get_cached_risk(student_id: str, db: Session = Depends(get_db)):
    """
    Returns the last cached risk score from DB without running the ML pipeline.
    Useful when you just want to display what's already stored.
    """
    rs = db.query(RiskScore).filter(RiskScore.student_id == student_id).first()
    if not rs:
        result = await score_student(student_id, db)
        return result

    return {
        "student_id": student_id,
        "risk_score": float(rs.risk_score or 0),
        "ci_lower": float(rs.ci_lower or 0),
        "ci_upper": float(rs.ci_upper or 0),
        "ci_width": float(rs.ci_width or 0),
        "p_3mo": float(rs.p_3mo or 0),
        "p_6mo": float(rs.p_6mo or 0),
        "p_12mo": float(rs.p_12mo or 0),
        "predicted_salary_lower": float(rs.predicted_salary_lower or 0),
        "predicted_salary_upper": float(rs.predicted_salary_upper or 0),
        "repayment_stress_index": float(rs.repayment_stress_index or 0),
        "repayment_stress_label": get_stress_label(float(rs.repayment_stress_index or 0)),
        "shap_drivers": rs.shap_drivers or [],
        "bias_flags": rs.bias_flags or [],
        "data_trust_weight": float(rs.data_trust_weight or 0.5),
        "course_family": rs.course_family,
        "regulatory_note": rs.regulatory_note,
        "needs_human_review": rs.needs_human_review,
        "scored_at": str(rs.scored_at),
    }

@router.post("/card", response_model=RiskCardResponse)
async def get_risk_card(body: RiskCardRequest, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.student_id == body.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    institute = db.query(Institute).filter(Institute.institute_id == student.institute_id).first()
    risk_score = db.query(RiskScore).filter(RiskScore.student_id == body.student_id).first()

    if not risk_score:
        risk_data = await score_student(body.student_id, db)
    else:
        risk_data = {
            "risk_score": float(risk_score.risk_score or 0),
            "p_3mo": float(risk_score.p_3mo or 0),
            "p_6mo": float(risk_score.p_6mo or 0),
            "p_12mo": float(risk_score.p_12mo or 0),
            "ci_lower": float(risk_score.ci_lower or 0),
            "ci_upper": float(risk_score.ci_upper or 0),
            "ci_width": float(risk_score.ci_width or 0),
            "repayment_stress_index": float(risk_score.repayment_stress_index or 0),
            "shap_drivers": risk_score.shap_drivers or [],
            "bias_flags": risk_score.bias_flags or [],
            "regulatory_note": risk_score.regulatory_note,
        }

    institute_name = institute.name if institute else "Unknown Institute"
    
    if risk_score and risk_score.xai_card_text:
        text = risk_score.xai_card_text
    else:
        text = generate_risk_card(student, risk_data, institute_name)
        if risk_score:
            risk_score.xai_card_text = text
            db.commit()

    return {
        "student_id": body.student_id,
        "risk_summary": text,
        "generated_at": datetime.utcnow().isoformat(),
    }
