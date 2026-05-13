from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.database import get_db
from backend.models.schema import AlertState
from backend.models.schema import Student
from backend.services.trigger_service import resolve_alert

router = APIRouter()


class ResolveBody(BaseModel):
    action_taken: str


@router.get("/")
def list_alerts(
    state: str = Query(default="triggered"),
    limit: int = Query(default=20),
    db: Session = Depends(get_db),
):
    alerts = (
        db.query(AlertState)
        .filter(AlertState.state == state)
        .order_by(AlertState.updated_at.desc())
        .limit(limit)
        .all()
    )
    result = []
    for a in alerts:
        student = db.query(Student).filter(Student.student_id == a.student_id).first()
        result.append({
            "id": str(a.id),
            "student_id": str(a.student_id),
            "student_name": student.name if student else "Unknown",
            "student_course": student.course_type if student else "—",
            "trigger_id": a.trigger_id,
            "trigger_name": a.trigger_name,
            "severity": a.severity,
            "state": a.state,
            "assignee": a.assignee,
            "deadline": str(a.deadline) if a.deadline else None,
            "action_taken": a.action_taken,
        })
    return result


@router.patch("/{alert_id}")
def action_alert(alert_id: str, body: ResolveBody, db: Session = Depends(get_db)):
    alert = resolve_alert(alert_id, body.action_taken, db)
    return {
        "id": str(alert.id),
        "state": alert.state,
        "action_taken": alert.action_taken,
    }
