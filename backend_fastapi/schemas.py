"""
Pydantic v2 Validation Schemas for CareerPilot FastAPI Service.
"""

from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator

ALLOWED_PIPELINE_STATUSES = {
    "Identified",
    "Shortlisted",
    "Approved",
    "Applied",
    "Recruiter Contacted",
    "Interview Scheduled",
    "Rejected",
    "Offer Received",
}


class ClientOnboardingCreate(BaseModel):
    fullName: str = Field(..., min_length=2, max_length=255)
    email: EmailStr
    phone: str = Field(default="+1 (415) 555-0190")
    linkedinUrl: str = Field(default="https://linkedin.com/in/executive")
    currentDesignation: str = Field(..., min_length=2)
    currentEmployer: str = Field(..., min_length=2)
    yearsOfExperience: int = Field(default=18, ge=1, le=50)
    location: str = Field(default="San Francisco, CA")
    targetCompMin: int = Field(default=350000, ge=100000)
    targetCompMax: int = Field(default=550000, ge=100000)
    assignedOwnerName: str = Field(default="Elena Vance")
    technologySpecialisation: str
    leadershipExperience: str
    coreCompetencies: str
    targetJobTitles: str
    preferredIndustries: str
    targetCompanies: str
    preferredLocations: str
    salaryExpectations: str
    careerObjectives: str
    resumeFilename: Optional[str] = None

    @field_validator("resumeFilename")
    @classmethod
    def validate_resume_extension(cls, v: Optional[str]) -> Optional[str]:
        if v:
            lower = v.lower()
            if not (lower.endswith(".pdf") or lower.endswith(".docx") or lower.endswith(".doc")):
                raise ValueError("Resume must be in PDF or DOCX format")
        return v


class OpportunityCreate(BaseModel):
    clientId: int
    company: str = Field(..., min_length=1)
    designation: str = Field(..., min_length=2)
    technologySpecialisation: str
    salaryRange: str
    salaryMin: int = 350000
    salaryMax: int = 500000
    location: str
    workMode: str = "Hybrid"
    jobDescription: str
    sourceUrl: str = "https://careers.enterprise.sim"
    fitScore: int = Field(default=90, ge=0, le=100)
    status: str = "Identified"

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in ALLOWED_PIPELINE_STATUSES:
            raise ValueError(f"Status must be one of {ALLOWED_PIPELINE_STATUSES}")
        return v
