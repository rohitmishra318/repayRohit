from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from backend.database import get_db
from backend.models.schema import Student, Institute, DemandIndex
from backend.ml.features import build_feature_vector
from backend.data.demand_index_mock import get_latest_demand
from backend.ml.intervention_ranker import rank_interventions
from backend.services.risk_service import score_student
from backend.models.schema import RiskScore

router = APIRouter()

@router.get("/{student_id}")
async def get_interventions(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    institute = db.query(Institute).filter(Institute.institute_id == student.institute_id).first()

    # Get latest demand
    demand_record = get_latest_demand(student.target_field, student.target_city_tier, db)
    
    # We pass empty dataframe for cohort here because intervention ranker doesn't strictly need precise cgpa percentile
    # though ideally we would pass it. For MVP, this is sufficient.
    import pandas as pd
    cohort_df = pd.DataFrame()
    
    features = build_feature_vector(student, institute, demand_record, cohort_df, db)
    
    risk_score = db.query(RiskScore).filter(RiskScore.student_id == student_id).first()
    if not risk_score:
        risk_data = await score_student(student_id, db)
    else:
        risk_data = {
            "risk_score": float(risk_score.risk_score or 0),
            "repayment_stress_index": float(risk_score.repayment_stress_index or 0),
        }

    interventions = rank_interventions(features, risk_data, top_n=3)

    return {
        "student_id": student_id,
        "generated_at": datetime.utcnow().isoformat(),
        "lift_note": "Lift estimates are research-calibrated priors. They update as real outcomes accumulate.",
        "interventions": interventions,
    }
