"""
Automated Pytest Suite for TalentIQ – Resume Parsing, 7-Dimension Matching, and Skills Gap Analysis.
"""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_resume_parsing():
    sample_resume = """
    Vikramaditya Rao
    vikram.rao@cloudscale.io | +1-415-890-2311
    Chief Technology Officer with 19 years of experience in Cloud & Platform Engineering.
    Skills: Kubernetes, AWS, GCP, Terraform, Kafka, Microservices, FinOps, Zero-Trust.
    Led 280+ engineers across global fintech and SaaS platforms.
    """
    response = client.post(
        "/api/v1/resumes/parse",
        json={
            "filename": "Vikramaditya_Rao_CTO.pdf",
            "file_type": "PDF",
            "raw_text": sample_resume,
        },
    )
    assert response.status_code == 200
    data = response.json()["extracted_profile"]
    assert data["email"] == "vikram.rao@cloudscale.io"
    assert data["total_years_experience"] == 19
    assert "Kubernetes" in data["technical_competencies"]
    assert data["extraction_confidence"] >= 80


def test_7_dimension_matching_and_skills_gap():
    payload = {
        "candidate_name": "Vikramaditya Rao",
        "current_designation": "SVP Engineering",
        "total_years_experience": 18,
        "primary_domain": "Cloud & Platform Engineering",
        "technical_competencies": ["Kubernetes", "AWS", "Terraform", "Microservices", "Kafka"],
        "industry_experience": ["FinTech", "Enterprise SaaS"],
        "leadership_experience": "Directed 240+ engineers and $38M annual cloud infrastructure budget.",
        "educational_qualifications": ["M.S. Computer Science, Stanford University"],
        "job_title": "Chief Technology Officer",
        "company": "AetherPay Global",
        "role_category": "Executive Leadership",
        "years_experience_required": 15,
        "required_skills": ["Kubernetes", "AWS", "Terraform", "FinOps", "Rust"],
        "preferred_skills": ["GraphQL", "Service Mesh"],
        "industry_requirements": ["FinTech"],
    }
    response = client.post("/api/v1/matches/evaluate", json=payload)
    assert response.status_code == 200
    result = response.json()
    assert 0 <= result["overall_score"] <= 100
    assert "Kubernetes" in result["demonstrated_skills"]
    assert "FinOps" in result["unmentioned_probable_skills"]
    assert "Rust" in result["genuinely_missing_skills"]
