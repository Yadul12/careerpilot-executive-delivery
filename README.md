# TalentIQ & CareerPilot – Unified Enterprise Executive Intelligence & Client Delivery Suite

Production-grade enterprise SaaS suite containing two complete, PostgreSQL-backed platforms for executive recruitment and career management firms:

1. **TalentIQ – AI-Powered Executive Resume Intelligence & Job Matching Platform** (11 Modules, 15 Synthetic Executive Candidates, 30 Executive Job Descriptions, 21 Technology Taxonomy Roles, 7-Dimension Weighted Matching Engine, Skills Gap Analysis, Candidate Comparison, and PDF/CSV Dossier Export).
2. **CareerPilot – Executive Job Search & Client Delivery Management Platform** (7 Modules, 12 Executive Clients, 8-Stage Job Search Pipeline, Hiring Manager Outreach CRM, Interview Tracking, Client Delivery Task & Deliverable Management, and Weekly Client Progress Reports).

---

## 1. System Architecture

```
+-----------------------------------------------------------------------------------+
|                        React 19 + TypeScript + Tailwind CSS                       |
|  +--------------------------------------+  +-----------------------------------+  |
|  |   Project 1: CareerPilot Workspace   |  |   Project 2: TalentIQ Workspace   |  |
|  |   (7 Executive Delivery Modules)     |  |   (11 AI & Matching Views)        |  |
|  +--------------------------------------+  +-----------------------------------+  |
+-----------------------------------------+-----------------------------------------+
                                          | REST APIs (JWT / Session Auth + RBAC)
+-----------------------------------------v-----------------------------------------+
|               Application API & Hybrid AI/NLP Layer                               |
|  - Node 22 / Express / Drizzle ORM Server (server.ts)                             |
|  - Python FastAPI / SQLAlchemy / Pydantic NLP Microservice (backend/main.py)      |
|  - Hybrid AI + Deterministic Semantic & Rule-Based Matching Engine                |
+-----------------------------------------+-----------------------------------------+
                                          | Connection Pool (Drizzle + SQLAlchemy)
+-----------------------------------------v-----------------------------------------+
|               PostgreSQL 16 + pgvector (Google Cloud SQL / Docker)                |
|  - 15 TalentIQ Normalized Tables (tiq_candidates, tiq_match_results, etc.)        |
|  - 15 CareerPilot Normalized Tables (clients, job_opportunities, outreach, etc.)  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Database Schema (30 Normalized PostgreSQL Tables)

Defined in `src/db/schema.ts` (Drizzle ORM) and `backend/models.py` (SQLAlchemy ORM):

### TalentIQ Tables (15 Tables)
- `roles` & `users` (RBAC across `Administrator`, `Recruitment Analyst`, `Delivery Manager`)
- `tiq_candidates` (Executive roster with `candidate_code`, `full_name`, `current_designation`, `total_years_experience`, `primary_domain`, `extraction_confidence`)
- `tiq_candidate_resumes` (`PDF`, `DOCX`, `TXT` raw text & parsing confidence)
- `tiq_candidate_profiles` (Verified career summary, previous designations, companies, industry experience, technical competencies, leadership scope)
- `tiq_employment_history` (Chronological executive roles & key impacts)
- `tiq_candidate_skills` (Categorized competencies, proficiency, verified years)
- `tiq_certifications` (Executive & cloud/architecture credentials)
- `tiq_technology_roles` (21 benchmark technology leadership roles across 5 categories)
- `tiq_job_descriptions` (30 executive mandates with seniority, compensation, taxonomy classification)
- `tiq_job_requirements` (Structured required vs. preferred skills, leadership & industry expectations)
- `tiq_matching_weights` (Configurable 7-dimension weights summing to 100%)
- `tiq_match_results` (Overall 0–100 score + all 7 individual dimension scores)
- `tiq_match_explanations` (Matching skills, relevant leadership/industry background, missing qualifications, potential concerns, narrative explanation)
- `tiq_skills_gap_analysis` (Demonstrated skills, unmentioned probable skills, genuinely missing required skills, missing preferred skills, positioning plan)
- `tiq_positioning_recommendations` & `tiq_evaluation_logs` (Tailored executive summary, leadership highlights, Delivery Manager approval workflow, and audit trail)

### CareerPilot Tables (15 Tables)
- `clients`, `client_profiles`, `client_resumes`, `client_target_roles`, `job_opportunities`, `applications`, `application_status_history`, `outreach_contacts`, `outreach_activities`, `interviews`, `interview_feedback`, `delivery_tasks`, `client_deliverables`, `activity_logs`, `client_reports`.

---

## 3. AI, NLP & Explainable 7-Dimension Matching Algorithm

Implemented in `src/services/talentiq_engine.ts` and `backend/matching_engine.py`:

1. **Fact-Grounded Resume Parsing**:
   - Extracts candidate contact details, designations, tenure, employment history, technical competencies, and leadership scope strictly from the uploaded document (`PDF`, `DOCX`, `TXT`).
   - Never fabricates companies or credentials; clearly separates **Verified Extracted Facts** from **AI Positioning Recommendations**.
2. **Explainable 7-Dimension Weighted Scoring (0–100)**:
   - **Technical Skill Alignment (Default `25%`)**: Semantic & taxonomy-aware skill overlap plus partial credit for probable executive competencies.
   - **Leadership Experience (Default `20%`)**: Evaluates headcount scale, P&L/budget ownership, global team transformation, and C-suite/board reporting.
   - **Seniority Alignment (Default `15%`)**: Compares total years of experience and designation level against mandate expectations.
   - **Domain Expertise (Default `15%`)**: Evaluates primary technology specialization against the 21-role taxonomy category.
   - **Industry Experience (Default `10%`)**: Evaluates vertical alignment (FinTech, B2B SaaS, Healthcare, Cloud Infrastructure, E-Commerce, Cybersecurity).
   - **Career Progression (Default `10%`)**: Assesses upward executive trajectory across engineering and architecture leadership roles.
   - **Required Qualifications (Default `5%`)**: Evaluates academic degrees and enterprise certifications.
3. **3-Tier Skills Gap Classification**:
   - **Demonstrated Skills**: Explicitly verified in the candidate's resume.
   - **Unmentioned Probable Skills**: Competencies typical of the candidate's executive tenure and domain (e.g., FinOps or Vendor Governance for an 18-year Cloud CTO) that should be surfaced during resume revisions.
   - **Genuinely Missing Required Skills**: Competencies required by the mandate that are outside the candidate's historical domain.

---

## 4. Local Setup & Docker Deployment Instructions

### Option A: Local Full-Stack Development (Node 22 + PostgreSQL)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment variables
cp .env.example .env

# 3. Push Drizzle PostgreSQL schema (if using custom DATABASE_URL)
npx drizzle-kit push --config=src/db/drizzle.config.ts

# 4. Run development server (Port 3000)
npm run dev

# 5. Run automated platform verification tests
npx tsx tests/verify_platform.test.ts
```

### Option B: Python FastAPI NLP Microservice & Pytest Suite

```bash
cd backend
pip install -r requirements.txt
pytest tests/test_talentiq.py
uvicorn main:app --reload --port 8000
```

### Option C: Production Docker Compose Deployment

```bash
docker compose up --build -d
```
- **Unified Web Platform (CareerPilot + TalentIQ)**: `http://localhost:3000`
- **FastAPI NLP Documentation (Swagger UI)**: `http://localhost:8000/docs`
- **PostgreSQL 16 + pgvector**: `localhost:5432`
