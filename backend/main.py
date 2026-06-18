from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers import students, risk, portfolio, interventions, alerts, auth
from backend.database import Base, engine

# Import all models to ensure they're registered with SQLAlchemy
from backend.models.schema import Student, Institute, RiskScore, AlertState, Outcome, DemandIndex
from backend.models.auth import User


app = FastAPI(title="RepaySignal API", version="1.0.0")

# Create all tables
Base.metadata.create_all(bind=engine)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://152.67.175.191:5173", "http://152.67.175.191:5174", "http://localhost:3000", "http://152.67.175.191", "http://152.67.175.191:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# auth.router must come BEFORE students.router
app.include_router(auth.router, tags=["auth"])
app.include_router(students.router, prefix="/students", tags=["students"])
app.include_router(risk.router, prefix="/risk", tags=["risk"])
app.include_router(portfolio.router, tags=["portfolio"])
app.include_router(interventions.router, prefix="/interventions", tags=["interventions"])
app.include_router(alerts.router, prefix="/alerts", tags=["alerts"])

@app.get("/")
def root():
    return {"status": "RepaySignal API running", "version": "1.0.0"}
