from pydantic import BaseModel
from typing import List

class InterventionResponse(BaseModel):
    name: str
    category: str
    course_families: List[str]
    base_lift_pp: float
    cost_tier: str
    delivery: str
    description: str
    contextual_lift: float
