from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from backend.database import get_db
from backend.models.schema import Student, Institute
from backend.models.schema import RiskScore
from backend.services.risk_service import get_risk_tier

router = APIRouter()


@router.get("/")
async def list_students(
    course_family: Optional[str] = None,
    risk_tier: Optional[str] = None,
    limit: int = Query(default=50, le=200),
    db: Session = Depends(get_db),
):
    query = db.query(Student)
    if course_family:
        query = query.filter(Student.course_family == course_family)
    students = query.limit(limit).all()

    scores_map = {
        str(rs.student_id): float(rs.risk_score or 0)
        for rs in db.query(RiskScore).all()
    }
    institutes_map = {str(i.institute_id): i for i in db.query(Institute).all()}

    result = []
    for s in students:
        score = scores_map.get(str(s.student_id), 0.5)
        tier = get_risk_tier(score)
        if risk_tier and tier != risk_tier:
            continue
        inst = institutes_map.get(str(s.institute_id))
        result.append({
            "student_id": str(s.student_id),
            "name": s.name,
            "course_type": s.course_type,
            "course_family": s.course_family,
            "target_field": s.target_field,
            "risk_score": round(score, 3),
            "risk_tier": tier,
            "months_since_graduation": s.months_since_graduation,
            "placement_status": s.placement_status,
            "institute_tier": inst.tier if inst else None,
        })
    return result


@router.get("/{student_id}")
async def get_student(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    institute = db.query(Institute).filter(Institute.institute_id == student.institute_id).first()
    return {
        "student_id": str(student.student_id),
        "name": student.name,
        "course_type": student.course_type,
        "course_family": student.course_family,
        "target_field": student.target_field,
        "cgpa": float(student.cgpa or 0),
        "internship_employer_tier": student.internship_employer_tier,
        "ppo_exists": student.ppo_exists,
        "cert_count": student.cert_count,
        "target_city_tier": student.target_city_tier,
        "loan_emi_monthly": float(student.loan_emi_monthly or 0),
        "months_since_graduation": student.months_since_graduation,
        "placement_status": student.placement_status,
        "institute_tier": institute.tier if institute else None,
        "data_trust_score": float(institute.data_trust_score if institute else 0.5),
    }
