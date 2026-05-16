import sys
import os
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models.schema import Student, AlertState
from backend.services.trigger_service import TRIGGERS
import uuid
from datetime import date, timedelta

db = SessionLocal()
try:
    student = db.query(Student).first()
    print("Student:", student.student_id)
    trigger = TRIGGERS[0]
    deadline = date.today() + timedelta(days=trigger["deadline_days"])
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
    db.commit()
    print("Success!")
except Exception as e:
    import traceback
    print("Error:", traceback.format_exc())
    db.rollback()
finally:
    db.close()
