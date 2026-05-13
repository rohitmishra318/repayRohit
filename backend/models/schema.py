from sqlalchemy import Column, String, Float, Integer, Boolean, Date, JSON, Text, DateTime
from backend.database import Base
import datetime


class Institute(Base):
    __tablename__ = "institutes"
    institute_id = Column(String(36), primary_key=True)
    name = Column(String(255))
    tier = Column(String(20))
    data_trust_score = Column(Float)


class Student(Base):
    __tablename__ = "students"
    student_id = Column(String(36), primary_key=True)
    name = Column(String(255), nullable=True)
    institute_id = Column(String(36))
    course_type = Column(String(50))
    course_family = Column(String(20))
    cgpa = Column(Float, nullable=True)
    internship_count = Column(Integer)
    internship_employer_tier = Column(String(20))
    ppo_exists = Column(Boolean)
    cert_count = Column(Integer)
    graduation_month = Column(Integer)
    graduation_year = Column(Integer)
    target_field = Column(String(100))
    target_city_tier = Column(Integer)
    loan_emi_monthly = Column(Float)
    data_trust_score = Column(Float, default=0.5)
    has_profile_contradiction = Column(Boolean, default=False)
    is_scarred = Column(Boolean, default=False)
    is_demo = Column(Boolean, default=False)
    tenth_board_score = Column("10th_board_score", Float, nullable=True)
    twelfth_board_score = Column("12th_board_score", Float, nullable=True)
    months_since_graduation = Column(Integer, default=0)
    placement_status = Column(String(20), default="searching")


class Outcome(Base):
    __tablename__ = "outcomes"
    id = Column(String(36), primary_key=True)
    student_id = Column(String(36))
    true_event_observed = Column(Boolean)
    months_to_event = Column(Integer, nullable=True)
    actual_salary = Column(Float, nullable=True)
    placement_city_tier = Column(Integer, nullable=True)
    employer_type = Column(String(50), nullable=True)
    event_observed = Column(Boolean)
    is_noisy_label = Column(Boolean)
    noise_type = Column(String(50))
    placement_status = Column(String(20))


class DemandIndex(Base):
    __tablename__ = "demand_index"
    id = Column(Integer, primary_key=True, autoincrement=True)
    field = Column(String(100))
    city_tier = Column(Integer)
    month = Column(Date)
    demand_percentile = Column(Float)
    mom_delta = Column(Float)
    adjacent_sectors = Column(JSON)


class ModelRegistry(Base):
    __tablename__ = "model_registry"
    id = Column(Integer, primary_key=True, autoincrement=True)
    retrained_at = Column(DateTime, default=datetime.datetime.utcnow)
    n_new_labels = Column(Integer)
    survival_weight = Column(Float)
    cohort_weight = Column(Float)
    demand_weight = Column(Float)
    meta_learner_r2 = Column(Float)


class RiskScore(Base):
    """Stores computed risk scores per student per scoring run."""
    __tablename__ = "risk_scores"
    id = Column(String(36), primary_key=True)
    student_id = Column(String(36))
    risk_score = Column(Float)
    ci_lower = Column(Float)
    ci_upper = Column(Float)
    ci_width = Column(Float)
    p_3mo = Column(Float)
    p_6mo = Column(Float)
    p_12mo = Column(Float)
    predicted_salary_lower = Column(Float, nullable=True)
    predicted_salary_upper = Column(Float, nullable=True)
    repayment_stress_index = Column(Float, nullable=True)
    shap_drivers = Column(JSON, nullable=True)
    bias_flags = Column(JSON, nullable=True)
    data_trust_weight = Column(Float)
    course_family = Column(String(20))
    regulatory_note = Column(String(500), nullable=True)
    needs_human_review = Column(Boolean, default=False)
    scored_at = Column(DateTime, default=datetime.datetime.utcnow)
    xai_card_text = Column(Text, nullable=True)


class AlertState(Base):
    """Stores trigger alert states per student — state machine: monitoring → triggered → actioned → resolved."""
    __tablename__ = "alert_states"
    id = Column(String(36), primary_key=True)
    student_id = Column(String(36))
    trigger_id = Column(String(10))
    trigger_name = Column(String(100))
    state = Column(String(20), default="monitoring")
    severity = Column(String(10))
    priority_score = Column(Float, nullable=True)
    assignee = Column(String(100), nullable=True)
    deadline = Column(Date, nullable=True)
    action_taken = Column(String(500), nullable=True)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)
