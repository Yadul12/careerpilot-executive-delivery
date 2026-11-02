"""
FastAPI Backend Service for TalentIQ – AI-Powered Executive Resume Intelligence & Job Matching Platform.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import (
    ResumeParseRequest,
    CandidateMatchRequest,
    MatchEvaluationResponse,
    MatchingWeightsSchema,
)
from matching_engine import parse_resume_text_deterministic, evaluate_candidate_job_match

app = FastAPI(
    title="TalentIQ – AI-Powered Executive Resume Intelligence & Job Matching API",
    version="2.0.0",
    description="Enterprise FastAPI & NLP service for executive resume parsing, 21-role taxonomy classification, and explainable 7-dimension candidate-job matching.",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "TalentIQ FastAPI NLP Engine"}


@app.post("/api/v1/resumes/parse")
def parse_resume_endpoint(payload: ResumeParseRequest):
    if not payload.raw_text or len(payload.raw_text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Resume text must contain at least 20 characters.")
    extracted = parse_resume_text_deterministic(
        filename=payload.filename,
        file_type=payload.file_type,
        raw_text=payload.raw_text,
    )
    return {"status": "parsed", "extracted_profile": extracted}


@app.post("/api/v1/matches/evaluate", response_model=MatchEvaluationResponse)
def evaluate_match_endpoint(payload: CandidateMatchRequest):
    if payload.weights and payload.weights.total() != 100:
        raise HTTPException(status_code=400, detail="Matching weights must sum to 100%.")
    return evaluate_candidate_job_match(payload)
