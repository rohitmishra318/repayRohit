import sys, os, uuid, asyncio
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database import SessionLocal
from backend.models.schema import Student, Institute, ModelRegistry, AlertState
from backend.services.risk_service import score_student, get_risk_tier
from backend.services.trigger_service import process_triggers
from datetime import datetime, timedelta

INSTITUTES = {
    "tier_1": {"name": "IIT Bombay", "trust": 0.88},
    "tier_2": {"name": "VIT Vellore", "trust": 0.62},
    "tier_3": {"name": "KL University", "trust": 0.35},
}

# Define 20 students
STUDENTS = [
    # 1. Ananya
    {"name": "Ananya Krishnan",  "course_type": "Engineering", "course_family": "campus",     "inst": "tier_2", "cgpa": 7.2, "int_tier": "none",       "ppo": False, "certs": 1, "field": "IT_software",  "city": 1, "emi": 14200, "months": 4, "status": "searching"},
    # 2. Rohan
    {"name": "Rohan Mehta",      "course_type": "MBA",         "course_family": "campus",     "inst": "tier_1", "cgpa": 8.6, "int_tier": "recognized",  "ppo": True,  "certs": 3, "field": "BFSI",          "city": 1, "emi": 22000, "months": 1, "status": "placed"},
    # 3. Arun
    {"name": "Arun Pillai",      "course_type": "Nursing",     "course_family": "regulatory", "inst": "tier_2", "cgpa": 7.8, "int_tier": "unverified",  "ppo": False, "certs": 0, "field": "healthcare",    "city": 2, "emi": 9500,  "months": 2, "status": "searching"},
    # 4. Meera
    {"name": "Meera Iyer",       "course_type": "Arts",        "course_family": "market",     "inst": "tier_3", "cgpa": 6.1, "int_tier": "none",        "ppo": False, "certs": 0, "field": "media",         "city": 2, "emi": 7800,  "months": 6, "status": "searching"},
    
    # 5-8: Medium risk Engineering
    {"name": "Priya Sharma",     "course_type": "Engineering", "course_family": "campus",     "inst": "tier_2", "cgpa": 7.8, "int_tier": "unverified",  "ppo": False, "certs": 2, "field": "IT_software",  "city": 1, "emi": 12000, "months": 3, "status": "searching"},
    {"name": "Karan Patel",      "course_type": "Engineering", "course_family": "campus",     "inst": "tier_2", "cgpa": 8.1, "int_tier": "recognized",  "ppo": False, "certs": 1, "field": "manufacturing", "city": 2, "emi": 11500, "months": 2, "status": "searching"},
    {"name": "Rahul Verma",      "course_type": "Engineering", "course_family": "campus",     "inst": "tier_3", "cgpa": 8.5, "int_tier": "none",        "ppo": False, "certs": 3, "field": "IT_hardware",  "city": 3, "emi": 8500,  "months": 1, "status": "searching"},
    {"name": "Neha Gupta",       "course_type": "Engineering", "course_family": "campus",     "inst": "tier_1", "cgpa": 7.0, "int_tier": "recognized",  "ppo": False, "certs": 0, "field": "IT_software",  "city": 1, "emi": 18000, "months": 0, "status": "searching"},

    # 9-12: Low risk MBA
    {"name": "Sanya Gupta",      "course_type": "MBA",         "course_family": "campus",     "inst": "tier_1", "cgpa": 8.9, "int_tier": "recognized",  "ppo": True,  "certs": 4, "field": "consulting",    "city": 1, "emi": 25000, "months": 1, "status": "placed"},
    {"name": "Vikram Singh",     "course_type": "MBA",         "course_family": "campus",     "inst": "tier_1", "cgpa": 8.2, "int_tier": "recognized",  "ppo": True,  "certs": 2, "field": "BFSI",          "city": 1, "emi": 21000, "months": 0, "status": "placed"},
    {"name": "Aditya Rao",       "course_type": "MBA",         "course_family": "campus",     "inst": "tier_2", "cgpa": 9.1, "int_tier": "recognized",  "ppo": False, "certs": 3, "field": "consulting",    "city": 1, "emi": 16000, "months": 1, "status": "searching"},
    {"name": "Ishita Desai",     "course_type": "MBA",         "course_family": "campus",     "inst": "tier_2", "cgpa": 8.5, "int_tier": "unverified",  "ppo": False, "certs": 1, "field": "marketing",     "city": 2, "emi": 14000, "months": 2, "status": "searching"},

    # 13-16: Nursing (regulatory)
    {"name": "Simran Kaur",      "course_type": "Nursing",     "course_family": "regulatory", "inst": "tier_2", "cgpa": 8.3, "int_tier": "recognized",  "ppo": False, "certs": 1, "field": "healthcare",    "city": 2, "emi": 10500, "months": 1, "status": "searching"},
    {"name": "Tanya Thomas",     "course_type": "Nursing",     "course_family": "regulatory", "inst": "tier_3", "cgpa": 7.4, "int_tier": "unverified",  "ppo": False, "certs": 0, "field": "healthcare",    "city": 3, "emi": 6500,  "months": 4, "status": "searching"},
    {"name": "Joy Dsouza",       "course_type": "Nursing",     "course_family": "regulatory", "inst": "tier_2", "cgpa": 8.0, "int_tier": "recognized",  "ppo": False, "certs": 2, "field": "healthcare",    "city": 1, "emi": 12000, "months": 0, "status": "searching"},
    {"name": "Manoj Kumar",      "course_type": "Nursing",     "course_family": "regulatory", "inst": "tier_3", "cgpa": 6.8, "int_tier": "none",        "ppo": False, "certs": 0, "field": "healthcare",    "city": 2, "emi": 7000,  "months": 5, "status": "searching"},

    # 17-20: Arts/CA (market)
    {"name": "Arjun Nair",       "course_type": "CA",          "course_family": "market",     "inst": "tier_2", "cgpa": 7.5, "int_tier": "recognized",  "ppo": False, "certs": 2, "field": "BFSI",          "city": 1, "emi": 13000, "months": 3, "status": "searching"},
    {"name": "Sneha Roy",        "course_type": "Arts",        "course_family": "market",     "inst": "tier_1", "cgpa": 8.7, "int_tier": "unverified",  "ppo": False, "certs": 1, "field": "media",         "city": 1, "emi": 8500,  "months": 2, "status": "searching"},
    {"name": "Farhan Ali",       "course_type": "Arts",        "course_family": "market",     "inst": "tier_3", "cgpa": 6.5, "int_tier": "none",        "ppo": False, "certs": 0, "field": "education",     "city": 3, "emi": 5000,  "months": 4, "status": "searching"},
    {"name": "Divya Jain",       "course_type": "CA",          "course_family": "market",     "inst": "tier_1", "cgpa": 8.1, "int_tier": "recognized",  "ppo": True,  "certs": 3, "field": "BFSI",          "city": 1, "emi": 15000, "months": 1, "status": "placed"},
]

async def run():
    db = SessionLocal()

    # Clear ONLY existing demo data to preserve the 2000-student training set
    demo_students = db.query(Student).filter(Student.is_demo == True).all()
    demo_ids = [s.student_id for s in demo_students]
    if demo_ids:
        db.query(AlertState).filter(AlertState.student_id.in_(demo_ids)).delete(synchronize_session=False)
        from backend.models.schema import RiskScore
        db.query(RiskScore).filter(RiskScore.student_id.in_(demo_ids)).delete(synchronize_session=False)
        db.query(Student).filter(Student.is_demo == True).delete(synchronize_session=False)
    db.commit()

    inst_map = {}
    for tier, info in INSTITUTES.items():
        inst = Institute(institute_id=str(uuid.uuid4()), name=info["name"], tier=tier, data_trust_score=info["trust"])
        db.add(inst)
        inst_map[tier] = inst
    db.flush()

    db.add(ModelRegistry(
        retrained_at=datetime.utcnow() - timedelta(days=2),
        n_new_labels=247,
        survival_weight=0.51, cohort_weight=0.28, demand_weight=0.21, meta_learner_r2=0.74,
    ))

    student_objects = []
    for s in STUDENTS:
        student = Student(
            student_id=str(uuid.uuid4()),
            name=s["name"],
            institute_id=inst_map[s["inst"]].institute_id,
            course_type=s["course_type"],
            course_family=s["course_family"],
            cgpa=s["cgpa"],
            internship_count=0 if s["int_tier"] == "none" else 1,
            internship_employer_tier=s["int_tier"],
            ppo_exists=s["ppo"],
            cert_count=s["certs"],
            graduation_month=6,
            graduation_year=2024,
            target_field=s["field"],
            target_city_tier=s["city"],
            loan_emi_monthly=s["emi"],
            months_since_graduation=s["months"],
            placement_status=s["status"],
            is_demo=True,
        )
        db.add(student)
        student_objects.append(student)

    db.commit()

    print(f"Seeded {len(INSTITUTES)} institutes + {len(STUDENTS)} demo students + model registry.")

    key_students_info = []
    
    for idx, student in enumerate(student_objects):
        # 1. Native risk scoring
        risk_result = await score_student(student.student_id, db)
        
        # 2. Native trigger processing
        fired_triggers = process_triggers(student, db)
        
        if idx < 4:
            tier = get_risk_tier(risk_result["risk_score"])
            triggers = [t["id"] for t in fired_triggers]
            from backend.services.llm_service import generate_risk_card
            xai = generate_risk_card(student, risk_result, inst_map[student.institute_id].name if student.institute_id in inst_map else "Demo Institute")
            
            key_students_info.append({
                "name": student.name,
                "tier": tier,
                "score": risk_result["risk_score"],
                "triggers": triggers,
                "regulatory_note": risk_result.get("regulatory_note"),
                "bias_flags": risk_result.get("bias_flags", []),
                "xai": xai
            })
            
    from backend.services.llm_service import generate_risk_card
    print(f"Demo data seeded. {len(STUDENTS)} students ready.\n")
    print("Key demo students:")
    for info in key_students_info:
        bias = " | BIAS FLAG" if info["bias_flags"] else ""
        reg = f" | REGULATORY: {info['regulatory_note']}" if info["regulatory_note"] else ""
        print(f" - {info['name']}: {info['tier']} ({info['score']:.3f}) | Triggers: {info['triggers']}{bias}{reg}")
        if info.get("xai"):
            print(f"   XAI Preview: {info['xai'][:150]}...")

    db.close()

if __name__ == "__main__":
    asyncio.run(run())
