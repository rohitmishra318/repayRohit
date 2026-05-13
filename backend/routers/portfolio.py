from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from backend.database import get_db
from backend.services.portfolio_service import get_portfolio_summary, run_stress_test

router = APIRouter()


class StressTestRequest(BaseModel):
    field: str
    shock_pct: float


@router.get("/portfolio")
def portfolio(db: Session = Depends(get_db)):
    return get_portfolio_summary(db)


@router.post("/stress-test")
async def stress_test(body: StressTestRequest, db: Session = Depends(get_db)):
    return await run_stress_test(body.field, body.shock_pct, db)
