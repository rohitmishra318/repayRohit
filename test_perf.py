import asyncio
import time
from backend.database import SessionLocal
from backend.services.risk_service import score_student
from backend.models.schema import Student

async def test():
    db = SessionLocal()
    students = db.query(Student).limit(50).all()
    print("Testing scoring for 50 students...")
    start = time.time()
    for s in students:
        await score_student(str(s.student_id), db)
    end = time.time()
    print(f"Time taken: {end - start:.2f} seconds")

if __name__ == "__main__":
    asyncio.run(test())
