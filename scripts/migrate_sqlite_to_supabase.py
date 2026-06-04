#!/usr/bin/env python3
"""
migrate_sqlite_to_supabase.py
=============================
Reads every table from the local SQLite repaysignal.db and inserts it into
the Supabase PostgreSQL database configured in .env DATABASE_URL.

Run from the RepaySignal project root:
    python scripts/migrate_sqlite_to_supabase.py

Requirements:
  - .env must have DATABASE_URL set to the Supabase PostgreSQL connection string
    with the real password (not [YOUR-PASSWORD]).
  - repaysignal.db must exist in the project root.
"""

import os
import sys
import sqlite3
import json
from datetime import datetime, date

# Make backend importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

# ── Validate env ──────────────────────────────────────────────────────────────
SQLITE_PATH = "./repaysignal.db"
PG_URL = os.environ.get("DATABASE_URL", "")

if not PG_URL or "postgresql" not in PG_URL:
    print("❌  DATABASE_URL is not a PostgreSQL URL.")
    print("    Set it in .env: DATABASE_URL=postgresql://postgres:PASSWORD@db.xxx.supabase.co:5432/postgres")
    sys.exit(1)

if "[YOUR-PASSWORD]" in PG_URL:
    print("❌  Replace [YOUR-PASSWORD] in DATABASE_URL with your actual Supabase database password!")
    print("    Find it at: Supabase Dashboard → Settings → Database → Connection string → URI")
    sys.exit(1)

if not os.path.exists(SQLITE_PATH):
    print(f"❌  SQLite file not found: {SQLITE_PATH}")
    print("    Run this script from the RepaySignal project root.")
    sys.exit(1)

# ── Imports that depend on env being loaded ───────────────────────────────────
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database import Base
from backend.models.schema import (
    Institute, Student, Outcome, DemandIndex,
    ModelRegistry, RiskScore, AlertState,
)
from backend.models.auth import User

# ── Helpers ───────────────────────────────────────────────────────────────────

def parse_json(val):
    """Convert a stored JSON string to a Python object (or None)."""
    if val is None:
        return None
    if isinstance(val, (dict, list)):
        return val
    try:
        return json.loads(val)
    except Exception:
        return None


def parse_date(val):
    if val is None:
        return None
    if isinstance(val, date):
        return val
    try:
        return datetime.strptime(val, "%Y-%m-%d").date()
    except Exception:
        return None


def parse_datetime(val):
    if val is None:
        return None
    if isinstance(val, datetime):
        return val
    for fmt in ("%Y-%m-%d %H:%M:%S.%f", "%Y-%m-%d %H:%M:%S", "%Y-%m-%dT%H:%M:%S"):
        try:
            return datetime.strptime(val, fmt)
        except Exception:
            continue
    return None


def bool_val(v):
    if v is None:
        return False
    return bool(v)


# ── Main migration ────────────────────────────────────────────────────────────

def migrate():
    print("=" * 60)
    print("  RepaySignal -- SQLite -> Supabase Migration")
    print("=" * 60)

    # Open SQLite
    sq = sqlite3.connect(SQLITE_PATH)
    sq.row_factory = sqlite3.Row
    cur = sq.cursor()

    # Build PostgreSQL engine & create all tables
    print("\nCreating tables in Supabase...")
    pg_engine = create_engine(PG_URL, pool_pre_ping=True)
    Base.metadata.create_all(bind=pg_engine)
    PGSession = sessionmaker(bind=pg_engine)
    db = PGSession()
    print("   Tables created [OK]")

    try:
        # ── institutes ────────────────────────────────────────────────────────
        print("\nMigrating institutes...")
        cur.execute("SELECT institute_id, name, tier, data_trust_score FROM institutes")
        rows = cur.fetchall()
        for r in rows:
            db.merge(Institute(
                institute_id=r["institute_id"],
                name=r["name"],
                tier=r["tier"],
                data_trust_score=r["data_trust_score"],
            ))
        db.commit()
        print(f"   OK: {len(rows)} institutes")

        # ── students ──────────────────────────────────────────────────────────
        print("\nMigrating students...")
        cur.execute("SELECT * FROM students")
        rows = cur.fetchall()
        batch = []
        for r in rows:
            d = dict(r)
            batch.append(Student(
                student_id=d["student_id"],
                name=d.get("name"),
                institute_id=d.get("institute_id"),
                course_type=d.get("course_type"),
                course_family=d.get("course_family"),
                cgpa=d.get("cgpa"),
                internship_count=d.get("internship_count", 0),
                internship_employer_tier=d.get("internship_employer_tier"),
                ppo_exists=bool_val(d.get("ppo_exists")),
                cert_count=d.get("cert_count", 0),
                graduation_month=d.get("graduation_month"),
                graduation_year=d.get("graduation_year"),
                target_field=d.get("target_field"),
                target_city_tier=d.get("target_city_tier"),
                loan_emi_monthly=d.get("loan_emi_monthly"),
                data_trust_score=d.get("data_trust_score", 0.5),
                has_profile_contradiction=bool_val(d.get("has_profile_contradiction")),
                is_scarred=bool_val(d.get("is_scarred")),
                is_demo=bool_val(d.get("is_demo")),
                # SQLite stored these as "10th_board_score" and "12th_board_score"
                tenth_board_score=d.get("10th_board_score") or d.get("tenth_board_score"),
                twelfth_board_score=d.get("12th_board_score") or d.get("twelfth_board_score"),
                months_since_graduation=d.get("months_since_graduation", 0),
                placement_status=d.get("placement_status", "searching"),
                city=d.get("city"),
            ))
            if len(batch) >= 200:
                for s in batch:
                    db.merge(s)
                db.commit()
                batch = []
        for s in batch:
            db.merge(s)
        db.commit()
        print(f"   OK: {len(rows)} students")

        # ── users ─────────────────────────────────────────────────────────────
        print("\nMigrating users...")
        try:
            cur.execute("SELECT * FROM users")
            rows = cur.fetchall()
            for r in rows:
                d = dict(r)
                db.merge(User(
                    id=d["id"],
                    firebase_uid=d.get("firebase_uid", ""),
                    name=d.get("name", ""),
                    email=d.get("email", ""),
                    hashed_password=d.get("hashed_password"),
                    role=d.get("role", "student"),
                    student_id=d.get("student_id"),
                    is_active=bool_val(d.get("is_active", True)),
                    created_at=parse_datetime(d.get("created_at")),
                ))
            db.commit()
            print(f"   OK: {len(rows)} users")
        except Exception as e:
            db.rollback()
            print(f"   WARN: Users skipped (table may be empty or not exist): {e}")

        # ── outcomes ──────────────────────────────────────────────────────────
        print("\nMigrating outcomes...")
        cur.execute("SELECT * FROM outcomes")
        rows = cur.fetchall()
        batch = []
        for r in rows:
            d = dict(r)
            batch.append(Outcome(
                id=d["id"],
                student_id=d.get("student_id"),
                true_event_observed=bool_val(d.get("true_event_observed")),
                months_to_event=d.get("months_to_event"),
                actual_salary=d.get("actual_salary"),
                placement_city_tier=d.get("placement_city_tier"),
                employer_type=d.get("employer_type"),
                event_observed=bool_val(d.get("event_observed")),
                is_noisy_label=bool_val(d.get("is_noisy_label")),
                noise_type=d.get("noise_type"),
                placement_status=d.get("placement_status"),
            ))
            if len(batch) >= 500:
                for o in batch:
                    db.merge(o)
                db.commit()
                batch = []
        for o in batch:
            db.merge(o)
        db.commit()
        print(f"   OK: {len(rows)} outcomes")

        # ── risk_scores ───────────────────────────────────────────────────────
        print("\nMigrating risk_scores...")
        try:
            cur.execute("SELECT * FROM risk_scores")
            rows = cur.fetchall()
            for r in rows:
                d = dict(r)
                db.merge(RiskScore(
                    id=d["id"],
                    student_id=d.get("student_id"),
                    risk_score=d.get("risk_score"),
                    ci_lower=d.get("ci_lower"),
                    ci_upper=d.get("ci_upper"),
                    ci_width=d.get("ci_width"),
                    p_3mo=d.get("p_3mo"),
                    p_6mo=d.get("p_6mo"),
                    p_12mo=d.get("p_12mo"),
                    predicted_salary_lower=d.get("predicted_salary_lower"),
                    predicted_salary_upper=d.get("predicted_salary_upper"),
                    repayment_stress_index=d.get("repayment_stress_index"),
                    shap_drivers=parse_json(d.get("shap_drivers")),
                    bias_flags=parse_json(d.get("bias_flags")),
                    data_trust_weight=d.get("data_trust_weight"),
                    course_family=d.get("course_family"),
                    regulatory_note=d.get("regulatory_note"),
                    needs_human_review=bool_val(d.get("needs_human_review")),
                    scored_at=parse_datetime(d.get("scored_at")),
                    xai_card_text=d.get("xai_card_text"),
                ))
            db.commit()
            print(f"   OK: {len(rows)} risk scores")
        except Exception as e:
            db.rollback()
            print(f"   WARN: Risk scores skipped: {e}")

        # ── alert_states ──────────────────────────────────────────────────────
        print("\nMigrating alert_states...")
        try:
            cur.execute("SELECT * FROM alert_states")
            rows = cur.fetchall()
            for r in rows:
                d = dict(r)
                db.merge(AlertState(
                    id=d["id"],
                    student_id=d.get("student_id"),
                    trigger_id=d.get("trigger_id"),
                    trigger_name=d.get("trigger_name"),
                    state=d.get("state", "monitoring"),
                    severity=d.get("severity"),
                    priority_score=d.get("priority_score"),
                    assignee=d.get("assignee"),
                    deadline=parse_date(d.get("deadline")),
                    action_taken=d.get("action_taken"),
                    updated_at=parse_datetime(d.get("updated_at")),
                ))
            db.commit()
            print(f"   OK: {len(rows)} alert states")
        except Exception as e:
            db.rollback()
            print(f"   WARN: Alert states skipped: {e}")

        # ── demand_index ──────────────────────────────────────────────────────
        print("\nMigrating demand_index...")
        try:
            cur.execute("SELECT * FROM demand_index")
            rows = cur.fetchall()
            for r in rows:
                d = dict(r)
                db.merge(DemandIndex(
                    id=d["id"],
                    field=d.get("field"),
                    city_tier=d.get("city_tier"),
                    month=parse_date(d.get("month")),
                    demand_percentile=d.get("demand_percentile"),
                    mom_delta=d.get("mom_delta"),
                    adjacent_sectors=parse_json(d.get("adjacent_sectors")),
                ))
            db.commit()
            print(f"   OK: {len(rows)} demand index records")
        except Exception as e:
            db.rollback()
            print(f"   WARN: Demand index skipped: {e}")

        # ── model_registry ────────────────────────────────────────────────────
        print("\nMigrating model_registry...")
        try:
            cur.execute("SELECT * FROM model_registry")
            rows = cur.fetchall()
            for r in rows:
                d = dict(r)
                db.merge(ModelRegistry(
                    id=d["id"],
                    retrained_at=parse_datetime(d.get("retrained_at")),
                    n_new_labels=d.get("n_new_labels"),
                    survival_weight=d.get("survival_weight"),
                    cohort_weight=d.get("cohort_weight"),
                    demand_weight=d.get("demand_weight"),
                    meta_learner_r2=d.get("meta_learner_r2"),
                ))
            db.commit()
            print(f"   OK: {len(rows)} model registry records")
        except Exception as e:
            db.rollback()
            print(f"   WARN: Model registry skipped: {e}")

    except Exception as e:
        db.rollback()
        print(f"\nERROR: Migration failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()
        sq.close()

    print("\n" + "=" * 60)
    print("  Migration complete! [DONE]")
    print("  Check your Supabase dashboard > Table Editor to verify.")
    print("=" * 60)


if __name__ == "__main__":
    migrate()
