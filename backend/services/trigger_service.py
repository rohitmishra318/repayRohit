import uuid
from datetime import date, timedelta
from sqlalchemy.orm import Session
from backend.models.schema import AlertState
from backend.models.schema import Student

TRIGGERS = [
    {
        "id": "T001", "name": "90-day no placement", "severity": "high",
        "check": lambda s: (s.months_since_graduation or 0) >= 3 and s.placement_status == "searching",
        "assignee": "Relationship Manager", "deadline_days": 7,
    },
    {
        "id": "T004", "name": "No internship and no PPO", "severity": "high",
        "check": lambda s: s.internship_employer_tier == "none" and not s.ppo_exists,
        "assignee": "Relationship Manager", "deadline_days": 5,
    },
]


def process_triggers(student: Student, db: Session) -> list:
    fired = []
    for trigger in TRIGGERS:
        existing = db.query(AlertState).filter(
            AlertState.student_id == student.student_id,
            AlertState.trigger_id == trigger["id"]
        ).first()

        if existing and existing.state in ("triggered", "actioned"):
            continue

        if trigger["check"](student):
            deadline = date.today() + timedelta(days=trigger["deadline_days"])
            if existing:
                existing.state = "triggered"
                existing.deadline = deadline
            else:
                db.add(AlertState(
                    id=uuid.uuid4(),
                    student_id=student.student_id,
                    trigger_id=trigger["id"],
                    trigger_name=trigger["name"],
                    state="triggered",
                    severity=trigger["severity"],
                    assignee=trigger["assignee"],
                    deadline=deadline,
                ))
            try:
                db.commit()
            except Exception:
                db.rollback()
            fired.append({"id": trigger["id"], "name": trigger["name"], "deadline": str(deadline)})

    return fired


def resolve_alert(alert_id: str, action_taken: str, db: Session):
    alert = db.query(AlertState).filter(AlertState.id == alert_id).first()
    if not alert:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Alert not found")
    alert.state = "actioned"
    alert.action_taken = action_taken
    db.commit()
    return alert
