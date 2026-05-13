from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class InstituteResponse(BaseModel):
    id: str
    name: str
    tier: str
    data_trust_score: float

    model_config = ConfigDict(from_attributes=True)

class StudentResponse(BaseModel):
    student_id: str
    institute_id: str
    course_type: str
    course_family: str
    cgpa: float
    internship_count: int
    internship_employer_tier: str
    ppo_exists: bool
    cert_count: int
    graduation_month: int
    graduation_year: int
    target_field: str
    target_city_tier: int
    loan_emi_monthly: float
    months_since_graduation: int
    placement_status: str
    created_at: str

    model_config = ConfigDict(from_attributes=True)

class PaginatedStudentResponse(BaseModel):
    total: int
    page: int
    size: int
    items: List[StudentResponse]
