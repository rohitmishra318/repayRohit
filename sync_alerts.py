import sys
import os
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models.schema import Student
from backend.services.trigger_service import process_triggers

def sync_all_alerts():
    db = SessionLocal()
    try:
        students = db.query(Student).all()
        print(f"Evaluating alerts for {len(students)} students...")
        count = 0
        for student in students:
            fired = process_triggers(student, db)
            if fired:
                count += len(fired)
        print(f"Successfully triggered {count} new alerts!")
    finally:
        db.close()

if __name__ == "__main__":
    sync_all_alerts()
