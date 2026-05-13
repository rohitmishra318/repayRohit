from sqlalchemy.orm import Session
from backend.models.schema import Institute

def compute_institute_trust_score(institute_id: str, db: Session) -> float:
    """
    Calculates a composite data trust score for an institute.
    MVP utilizes the pre-computed `data_trust_score` set during generation.
    """
    inst = db.query(Institute).filter(Institute.institute_id == institute_id).first()
    return float(inst.data_trust_score) if inst and inst.data_trust_score is not None else 0.30
