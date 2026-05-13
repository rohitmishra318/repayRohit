import uuid
from sqlalchemy import Column, String, Integer, Boolean, Numeric, TIMESTAMP, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from backend.database import Base

class Institute(Base):
    __tablename__ = "institutes"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255))
    tier = Column(String(20))
    data_trust_score = Column(Numeric(3, 2), default=0.5)
    created_at = Column(TIMESTAMP, server_default=func.now())

class Student(Base):
    __tablename__ = "students"
    student_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=True)
    institute_id = Column(UUID(as_uuid=True), ForeignKey("institutes.id"))
    course_type = Column(String(50))
    course_family = Column(String(20))
    cgpa = Column(Numeric(4, 2))
    internship_count = Column(Integer, default=0)
    internship_employer_tier = Column(String(20))
    ppo_exists = Column(Boolean, default=False)
    cert_count = Column(Integer, default=0)
    graduation_month = Column(Integer)
    graduation_year = Column(Integer)
    target_field = Column(String(100))
    target_city_tier = Column(Integer)
    loan_emi_monthly = Column(Numeric(10, 2))
    months_since_graduation = Column(Integer, default=0)
    placement_status = Column(String(20), default='searching')
    created_at = Column(TIMESTAMP, server_default=func.now())
