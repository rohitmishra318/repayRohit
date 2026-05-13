import uuid
from sqlalchemy import Column, String, Boolean, Numeric, TIMESTAMP, ForeignKey, Date, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from backend.database import Base

class RiskScore(Base):
    __tablename__ = "risk_scores"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.student_id"), unique=True)
    risk_score = Column(Numeric(4, 3))
    ci_lower = Column(Numeric(4, 3))
    ci_upper = Column(Numeric(4, 3))
    ci_width = Column(Numeric(4, 3))
    p_3mo = Column(Numeric(4, 3))
    p_6mo = Column(Numeric(4, 3))
    p_12mo = Column(Numeric(4, 3))
    predicted_salary_lower = Column(Numeric(12, 2))
    predicted_salary_upper = Column(Numeric(12, 2))
    repayment_stress_index = Column(Numeric(4, 3))
    shap_drivers = Column(JSONB)
    bias_flags = Column(JSONB)
    data_trust_weight = Column(Numeric(3, 2))
    course_family = Column(String(20))
    regulatory_note = Column(String(500), nullable=True)
    needs_human_review = Column(Boolean, default=False)
    scored_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

class AlertState(Base):
    __tablename__ = "alert_states"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.student_id"))
    trigger_id = Column(String(10))
    trigger_name = Column(String(100))
    state = Column(String(20), default='monitoring')
    severity = Column(String(10))
    assignee = Column(String(100), nullable=True)
    deadline = Column(Date, nullable=True)
    action_taken = Column(String(500), nullable=True)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

class ModelRegistry(Base):
    __tablename__ = "model_registry"
    id = Column(Integer, primary_key=True, autoincrement=True)
    retrained_at = Column(TIMESTAMP)
    n_new_labels = Column(Integer)
    survival_weight = Column(Numeric(4, 3))
    cohort_weight = Column(Numeric(4, 3))
    demand_weight = Column(Numeric(4, 3))
    meta_learner_r2 = Column(Numeric(4, 3))
