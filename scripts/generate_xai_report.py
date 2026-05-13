import asyncio
import os
import sys

# Add current directory to path for imports
sys.path.append(os.getcwd())

from backend.database import SessionLocal
from backend.models.schema import Student, Institute
from backend.services.risk_service import score_student, get_risk_tier
from backend.services.llm_service import generate_risk_card

async def main():
    db = SessionLocal()
    # Get the 4 key demo students specifically
    target_names = ["Ananya Krishnan", "Rohan Mehta", "Arun Pillai", "Meera Iyer"]
    students = db.query(Student).filter(Student.name.in_(target_names)).all()
    # Sort them in the order of target_names
    students.sort(key=lambda x: target_names.index(x.name))
    
    inst_map = {i.institute_id: i.name for i in db.query(Institute).all()}
    
    report = "# XAI Risk Analysis Report\n\n"
    report += "This report contains the full AI-generated (deterministic fallback) risk cards for the key demo students.\n\n"
    
    for s in students:
        risk_result = await score_student(s.student_id, db)
        inst_name = inst_map.get(s.institute_id, "Demo Institute")
        card = generate_risk_card(s, risk_result, inst_name)
        
        tier = get_risk_tier(risk_result["risk_score"])
        
        report += f"## Student: {s.name}\n"
        report += f"**Risk Score**: {risk_result['risk_score']:.3f} ({tier})\n"
        report += f"**Course**: {s.course_type} | **Family**: {s.course_family}\n\n"
        report += card
        report += "\n---\n\n"
    
    with open("xai_analysis_report.md", "w", encoding="utf-8") as f:
        f.write(report)
    
    print("XAI Analysis Report generated as xai_analysis_report.md")
    db.close()

if __name__ == "__main__":
    asyncio.run(main())
