import os
import sys
import pandas as pd
import datetime

# Ensure backend module is discoverable
sys.path.append(os.path.join(os.path.dirname(__file__), "../.."))

from backend.database import SessionLocal
from backend.models.schema import Institute, Student, Outcome, DemandIndex, ModelRegistry
from backend.data.demand_index_mock import generate_demand_index

def seed_database():
    db = SessionLocal()
    try:
        print("Seeding institutes...")
        df_inst = pd.read_csv("synthetic_institutes.csv")
        institutes = [Institute(**row.to_dict()) for _, row in df_inst.iterrows()]
        db.add_all(institutes)
        db.commit()
        print(f"done ({len(institutes)})")

        print("Seeding students...")
        df_stu = pd.read_csv("synthetic_students.csv")
        # Ensure months_since_graduation is somewhat realistic from the generated CSV
        # and replace NaNs with None for SQLAlchemy
        df_stu = df_stu.where(pd.notnull(df_stu), None)
        
        # Calculate months since graduation based on today (May 2026)
        # using graduation_year and graduation_month
        today_year = 2026
        today_month = 5
        
        students = []
        for _, row in df_stu.iterrows():
            d = row.to_dict()
            g_y = d.get('graduation_year', 2024)
            g_m = d.get('graduation_month', 5)
            months_since = (today_year - g_y) * 12 + (today_month - g_m)
            d['months_since_graduation'] = max(0, months_since)
            
            # Map column names for SQLAlchemy model
            if '10th_board_score' in d:
                d['tenth_board_score'] = d.pop('10th_board_score')
            if '12th_board_score' in d:
                d['twelfth_board_score'] = d.pop('12th_board_score')
                
            students.append(Student(**d))
            
            if len(students) >= 100:
                db.add_all(students)
                db.commit()
                students = []
        if students:
            db.add_all(students)
            db.commit()
        print(f"done ({len(df_stu)})")

        print("Seeding outcomes...")
        df_out = pd.read_csv("synthetic_outcomes.csv")
        df_out = df_out.where(pd.notnull(df_out), None)
        outcomes = []
        for _, row in df_out.iterrows():
            d = row.to_dict()
            outcomes.append(Outcome(**d))
            if len(outcomes) >= 500:
                db.add_all(outcomes)
                db.commit()
                outcomes = []
        if outcomes:
            db.add_all(outcomes)
            db.commit()
        print(f"done ({len(df_out)})")

        print("Seeding demand index...")
        demand_data = generate_demand_index(18)
        demands = [DemandIndex(**d) for d in demand_data]
        db.add_all(demands)
        db.commit()
        print(f"done ({len(demands)})")

        print("Seeding model registry...")
        registry = ModelRegistry(
            retrained_at=datetime.datetime.utcnow() - datetime.timedelta(days=2),
            n_new_labels=247,
            survival_weight=0.51,
            cohort_weight=0.28,
            demand_weight=0.21,
            meta_learner_r2=0.74
        )
        db.add(registry)
        db.commit()
        print("done (1)")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
