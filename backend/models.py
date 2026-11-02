"""
SQLAlchemy ORM & Pydantic Schemas for TalentIQ – AI-Powered Executive Resume Intelligence & Job Matching Platform.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class CandidateORM(Base):
    __tablename__ = "tiq_candidates"

    id = Column(Integer, primary_key=True, index=True)
    candidate_code = Column(String(64), unique=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(64), nullable=False)
    location = Column(String(255), nullable=False)
    current_designation = Column(String(255), nullable=False)
    total_years_experience = Column(Integer, nullable=False, default=15)
    primary_domain = Column(String(255), nullable=False)
    extraction_confidence = Column(Integer, nullable=False, default=94)
    status = Column(String(64), nullable=False, default="Verified")
    created_at = Column(DateTime, default=datetime.utcnow)

    resumes = relationship("CandidateResumeORM", back_populates="candidate", cascade="all, delete-orphan")
    profile = relationship("CandidateProfileORM", back_populates="candidate", uselist=False, cascade="all, delete-orphan")


class CandidateResumeORM(Base):
    __tablename__ = "tiq_candidate_resumes"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("tiq_candidates.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(32), nullable=False)
    raw_text = Column(Text, nullable=False)
    extraction_confidence = Column(Integer, nullable=False, default=94)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    candidate = relationship("CandidateORM", back_populates="resumes")


class CandidateProfileORM(Base):
    __tablename__ = "tiq_candidate_profiles"

    id = Column(Integer, primary_key=True, index=True)
    candidate_id = Column(Integer, ForeignKey("tiq_candidates.id", ondelete="CASCADE"), nullable=False)
    executive_summary = Column(Text, nullable=False)
    previous_designations = Column(JSON, nullable=False, default=list)
    companies_worked_at = Column(JSON, nullable=False, default=list)
    industry_experience = Column(JSON, nullable=False, default=list)
    technical_competencies = Column(JSON, nullable=False, default=list)
    leadership_experience = Column(Text, nullable=False)
    educational_qualifications = Column(JSON, nullable=False, default=list)
    major_achievements = Column(JSON, nullable=False, default=list)
    recommended_roles = Column(JSON, nullable=False, default=list)
    is_manually_verified = Column(Boolean, default=False)

    candidate = relationship("CandidateORM", back_populates="profile")


class TechnologyRoleORM(Base):
    __tablename__ = "tiq_technology_roles"

    id = Column(Integer, primary_key=True, index=True)
    role_title = Column(String(255), unique=True, nullable=False)
    category = Column(String(128), nullable=False)
    seniority_band = Column(String(128), nullable=False)
    typical_responsibilities = Column(JSON, nullable=False, default=list)
    required_technical_knowledge = Column(JSON, nullable=False, default=list)
    expected_leadership_experience = Column(Text, nullable=False)
    relevant_industry_experience = Column(JSON, nullable=False, default=list)
    common_qualifications = Column(JSON, nullable=False, default=list)


class JobDescriptionORM(Base):
    __tablename__ = "tiq_job_descriptions"

    id = Column(Integer, primary_key=True, index=True)
    job_code = Column(String(64), unique=True, nullable=False)
    job_title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    role_category = Column(String(128), nullable=False)
    seniority_level = Column(String(128), nullable=False)
    years_experience_required = Column(Integer, nullable=False, default=15)
    location = Column(String(255), nullable=False)
    compensation_info = Column(String(255), nullable=False)
    raw_description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


# Pydantic Schemas
class MatchingWeightsSchema(BaseModel):
    technical_weight: int = Field(25, ge=0, le=100)
    leadership_weight: int = Field(20, ge=0, le=100)
    seniority_weight: int = Field(15, ge=0, le=100)
    domain_weight: int = Field(15, ge=0, le=100)
    industry_weight: int = Field(10, ge=0, le=100)
    progression_weight: int = Field(10, ge=0, le=100)
    qualification_weight: int = Field(5, ge=0, le=100)

    def total(self) -> int:
        return (
            self.technical_weight
            + self.leadership_weight
            + self.seniority_weight
            + self.domain_weight
            + self.industry_weight
            + self.progression_weight
            + self.qualification_weight
        )


class ResumeParseRequest(BaseModel):
    filename: str
    file_type: str = "PDF"
    raw_text: str


class CandidateMatchRequest(BaseModel):
    candidate_name: str
    current_designation: str
    total_years_experience: int
    primary_domain: str
    technical_competencies: List[str]
    industry_experience: List[str]
    leadership_experience: str
    educational_qualifications: List[str]
    job_title: str
    company: str
    role_category: str
    years_experience_required: int
    required_skills: List[str]
    preferred_skills: List[str]
    industry_requirements: List[str]
    weights: Optional[MatchingWeightsSchema] = None


class MatchEvaluationResponse(BaseModel):
    overall_score: int
    confidence_level: str
    dimension_scores: Dict[str, int]
    matching_technical_skills: List[str]
    demonstrated_skills: List[str]
    unmentioned_probable_skills: List[str]
    genuinely_missing_skills: List[str]
    missing_preferred_skills: List[str]
    explanation: str
    positioning_plan: List[str]
