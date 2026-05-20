import asyncio
from backend.database import SessionLocal
from backend.models.schema import RiskScore, Student

def test():
    db = SessionLocal()
    rs_all = db.query(RiskScore).all()
    print("RiskScore count:", len(rs_all))
    
    scores_map = {str(rs.student_id): float(rs.risk_score or 0) for rs in rs_all}
    print("Scores map size:", len(scores_map))
    
    students = db.query(Student).limit(100).all()
    matches = 0
    for s in students:
        sid = str(s.student_id)
        if sid in scores_map:
            print(f"Match found! Student ID: {sid}, Score: {scores_map[sid]}")
            matches += 1
            
    print("Matches in first 100 students:", matches)

if __name__ == "__main__":
    test()
