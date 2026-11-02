"""
CareerPilot FastAPI Backend Service (Python / SQLAlchemy / JWT / Pydantic).
Provides REST API endpoints for the 7 operational modules.
"""

import os
from datetime import datetime, timedelta
from typing import Optional
import jwt
from fastapi import Depends, FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import create_engine, func
from sqlalchemy.engine import URL
from sqlalchemy.orm import Session, sessionmaker

from models import (
    ActivityLog,
    Application,
    Base,
    Client,
    ClientProfile,
    ClientProgram,
    ClientReport,
    Deliverable,
    HiringManagerContact,
    InterviewRecord,
    JobOpportunity,
    OutreachActivity,
    Role,
    Task,
    User,
)
from schemas import ClientOnboardingCreate, OpportunityCreate

JWT_SECRET = os.getenv("JWT_SECRET_KEY", "enterprise-jwt-secret-change-in-prod")
JWT_ALGORITHM = "HS256"

# Construct SQLAlchemy URL via Object parameters (SQL_HOST, SQL_USER, SQL_PASSWORD, SQL_DB_NAME)
db_url = URL.create(
    drivername="postgresql+psycopg2",
    username=os.getenv("SQL_USER", "postgres"),
    password=os.getenv("SQL_PASSWORD", "postgres"),
    host=os.getenv("SQL_HOST", "localhost"),
    database=os.getenv("SQL_DB_NAME", "careerpilot"),
)

engine = create_engine(db_url, pool_pre_ping=True, pool_size=10)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

app = FastAPI(
    title="CareerPilot — Executive Job Search & Client Delivery API",
    version="1.0.0",
    description="Enterprise SaaS API for managing executive career cohorts, pipelines, outreach, and reporting.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

security = HTTPBearer()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def create_jwt_token(uid: str, email: str, role: str = "Administrator") -> str:
    payload = {
        "sub": uid,
        "email": email,
        "role": role,
        "exp": datetime.utcnow() + timedelta(hours=12),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    token = credentials.credentials
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
        ) from exc


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "CareerPilot FastAPI"}


@app.get("/api/dashboard")
def get_dashboard(db: Session = Depends(get_db)):
    total_clients = db.query(func.count(Client.id)).scalar() or 0
    total_opps = db.query(func.count(JobOpportunity.id)).scalar() or 0
    total_apps = db.query(func.count(Application.id)).scalar() or 0
    total_outreach = db.query(func.count(OutreachActivity.id)).scalar() or 0
    total_interviews = db.query(func.count(InterviewRecord.id)).scalar() or 0
    overdue_deliv = (
        db.query(func.count(Deliverable.id))
        .filter(Deliverable.status == "Overdue")
        .scalar()
        or 0
    )
    return {
        "kpis": {
            "totalActiveClients": total_clients,
            "totalOpportunities": total_opps,
            "applicationsSubmitted": total_apps,
            "hiringManagerOutreach": total_outreach,
            "interviewsSecured": total_interviews,
            "overdueDeliverables": overdue_deliv,
        }
    }


@app.post("/api/clients", status_code=201)
def onboard_client(payload: ClientOnboardingCreate, db: Session = Depends(get_db)):
    client = Client(
        full_name=payload.fullName,
        email=payload.email,
        phone=payload.phone,
        linkedin_url=payload.linkedinUrl,
        current_designation=payload.currentDesignation,
        current_employer=payload.currentEmployer,
        years_of_experience=payload.yearsOfExperience,
        location=payload.location,
        status="Onboarding",
        onboarding_date=datetime.utcnow().strftime("%Y-%m-%d"),
        target_comp_min=payload.targetCompMin,
        target_comp_max=payload.targetCompMax,
        assigned_owner_name=payload.assignedOwnerName,
        is_simulated=False,
    )
    db.add(client)
    db.commit()
    db.refresh(client)
    return {"client": {"id": client.id, "fullName": client.full_name}}


@app.post("/api/opportunities", status_code=201)
def create_opportunity(payload: OpportunityCreate, db: Session = Depends(get_db)):
    opp = JobOpportunity(
        client_id=payload.clientId,
        company=payload.company,
        designation=payload.designation,
        technology_specialisation=payload.technologySpecialisation,
        salary_range=payload.salaryRange,
        salary_min=payload.salaryMin,
        salary_max=payload.salaryMax,
        location=payload.location,
        work_mode=payload.workMode,
        job_description=payload.jobDescription,
        source_url=payload.sourceUrl,
        fit_score=payload.fitScore,
        status=payload.status,
    )
    db.add(opp)
    db.commit()
    db.refresh(opp)
    return {"opportunity": {"id": opp.id, "company": opp.company, "status": opp.status}}
