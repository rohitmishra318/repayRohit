import sys, os, uuid
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.database import SessionLocal
from backend.models.student import Student, Institute
from backend.models.risk import ModelRegistry
from datetime import datetime, timedelta

INSTITUTES = {
    "tier_1": {"name": "IIT Bombay", "trust": 0.88},
    "tier_2": {"name": "VIT Vellore", "trust": 0.62},
    "tier_3": {"name": "KL University", "trust": 0.35},
}

STUDENTS = [
    {"name": "Ananya Krishnan",  "course_type": "Engineering", "course_family": "campus",     "inst": "tier_2", "cgpa": 7.2, "int_tier": "none",       "ppo": False, "certs": 1, "field": "IT_software",  "city": 1, "emi": 14200, "months": 4, "status": "searching"},
    {"name": "Rohan Mehta",      "course_type": "MBA",         "course_family": "campus",     "inst": "tier_1", "cgpa": 8.6, "int_tier": "recognized",  "ppo": True,  "certs": 3, "field": "BFSI",          "city": 1, "emi": 22000, "months": 1, "status": "placed"},
    {"name": "Arun Pillai",      "course_type": "Nursing",     "course_family": "regulatory", "inst": "tier_2", "cgpa": 7.8, "int_tier": "unverified",  "ppo": False, "certs": 0, "field": "healthcare",    "city": 2, "emi": 9500,  "months": 2, "status": "searching"},
    {"name": "Meera Iyer",       "course_type": "Arts",        "course_family": "market",     "inst": "tier_3", "cgpa": 6.1, "int_tier": "none",        "ppo": False, "certs": 0, "field": "media",         "city": 2, "emi": 7800,  "months": 6, "status": "searching"},
    {"name": "Priya Sharma",     "course_type": "Engineering", "course_family": "campus",     "inst": "tier_2", "cgpa": 7.8, "int_tier": "unverified",  "ppo": False, "certs": 2, "field": "IT_software",  "city": 1, "emi": 12000, "months": 3, "status": "searching"},
    {"name": "Karan Patel",      "course_type": "Engineering", "course_family": "campus",     "inst": "tier_2", "cgpa": 8.1, "int_tier": "recognized",  "ppo": False, "certs": 1, "field": "manufacturing", "city": 2, "emi": 11500, "months": 2, "status": "searching"},
    {"name": "Sanya Gupta",      "course_type": "MBA",         "course_family": "campus",     "inst": "tier_1", "cgpa": 8.9, "int_tier": "recognized",  "ppo": True,  "certs": 4, "field": "consulting",    "city": 1, "emi": 25000, "months": 1, "status": "placed"},
    {"name": "Arjun Nair",       "course_type": "CA",          "course_family": "campus",     "inst": "tier_2", "cgpa": 7.5, "int_tier": "recognized",  "ppo": False, "certs": 2, "field": "BFSI",          "city": 1, "emi": 13000, "months": 3, "status": "searching"},
]

def run():
    db = SessionLocal()
    inst_map = {}

    for tier, info in INSTITUTES.items():
        inst = Institute(id=uuid.uuid4(), name=info["name"], tier=tier, data_trust_score=info["trust"])
        db.add(inst)
        inst_map[tier] = inst
    db.flush()

    db.add(ModelRegistry(
        retrained_at=datetime.utcnow() - timedelta(days=2),
        n_new_labels=247,
        survival_weight=0.51, cohort_weight=0.28, demand_weight=0.21, meta_learner_r2=0.74,
    ))

    for s in STUDENTS:
        student = Student(
            student_id=uuid.uuid4(),
            name=s["name"],
            institute_id=inst_map[s["inst"]].id,
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
        )
        db.add(student)

    db.commit()
    print(f"Seeded {len(INSTITUTES)} institutes + {len(STUDENTS)} demo students + model registry.")
    print("Now call GET /risk/{student_id} for each to pre-score them (Flask must be running).")
    db.close()

if __name__ == "__main__":
    run()