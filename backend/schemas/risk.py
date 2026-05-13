from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class ShapDriver(BaseModel):
    feature: str
    direction: str
    magnitude: float
    display: str

class BiasFlag(BaseModel):
    attribute: str
    dpd: float
    warning: str

class RiskScoreResponse(BaseModel):
    student_id: str
    risk_score: float
    ci_lower: float
    ci_upper: float
    ci_width: float
    p_3mo: float
    p_6mo: float
    p_12mo: float
    predicted_salary_lower: float
    predicted_salary_upper: float
    repayment_stress_index: float
    repayment_stress_label: str
    shap_drivers: List[ShapDriver]
    bias_flags: List[BiasFlag]
    data_trust_weight: float
    course_family: str
    regulatory_note: Optional[str] = None
    needs_human_review: bool
    scored_at: str

    model_config = ConfigDict(from_attributes=True)

class RiskCardResponse(BaseModel):
    student_id: str
    risk_summary: str
    generated_at: str
