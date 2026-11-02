# CareerPilot — Executive Job Search & Client Delivery Management Platform

CareerPilot is an enterprise SaaS platform designed for executive career management and advisory firms to orchestrate the end-to-end job-search lifecycle for senior technology leaders (Director, VP, SVP, CTO, CIO, CISO, and CPO candidates).

## 1. Core Operational Modules

1. **Executive Dashboard (`/api/dashboard`)**:
   - Real-time KPI telemetry computed directly from PostgreSQL: Total Active Clients, New Client Onboardings, Active Search Programs, Opportunities Identified, Applications Submitted, Hiring-Manager Outreach Count, Interviews Secured, Client Conversion Rate, Overdue Deliverables & Tasks, and Advisory Team Workload.
   - 5 Interactive Recharts Visualizations: Weekly Application & Outreach Trends, Executive Job-Search Conversion Funnel, Client-Wise Performance Comparison, Monthly Delivery Cadence, and Team Capacity Utilization.
2. **Client Onboarding & Profile Management (`/api/clients`)**:
   - Complete onboarding workflow capturing full executive background, leadership scope, technology specialisation, core technical competencies, target job titles, target companies, preferred geographies, compensation bands, and career objectives.
   - Validated PDF (`.pdf`) and Word (`.docx`) executive resume upload workflow (`POST /api/clients/:id/resume`).
3. **Job Search Pipeline (`/api/pipeline`, `/api/opportunities`)**:
   - 8-Stage Kanban Board (`Identified`, `Shortlisted`, `Approved`, `Applied`, `Recruiter Contacted`, `Interview Scheduled`, `Rejected`, `Offer Received`) + Searchable, Sortable & Paginated Table View.
   - Full stage transition audit history and offer/rejection logging.
4. **Client Delivery Management (`/api/delivery`, `/api/tasks`, `/api/deliverables`)**:
   - Account manager assignments, SLA task tracking, overdue task/deliverable alerts, client approval workflows (`Approve` / `Request Changes`), and chronological PostgreSQL activity timeline.
5. **Hiring Manager Outreach CRM (`/api/outreach`)**:
   - Decision-maker contact directory, channel tracking (`Warm Intro`, `Direct Email`, `LinkedIn InMail`, `Executive Recruiter`), reply & follow-up counters, scheduled next actions, and meeting/referral outcomes.
6. **Interview Tracking (`/api/interviews`)**:
   - Multi-round executive interview management (`Executive Recruiter Screen`, `Hiring Manager Deep-Dive`, `Architecture & Strategy Panel`, `CEO / Board Final`, `Compensation & Offer`), preparation dossier tracking, and panel debrief feedback.
7. **Client Progress Reporting (`/api/reports`)**:
   - Weekly client progress reports dynamically calculated from live database records with one-click **PDF Export** (`jsPDF`) and **CSV Export**.

---

## 2. Normalised PostgreSQL Schema (15 Tables)

Defined in `src/db/schema.ts` (Drizzle ORM) and `backend_fastapi/models.py` (SQLAlchemy 2.0):
- `roles`
- `users`
- `clients`
- `client_profiles`
- `client_programs`
- `team_assignments`
- `job_opportunities`
- `applications`
- `hiring_manager_contacts`
- `outreach_activities`
- `interview_records`
- `tasks`
- `deliverables`
- `client_reports`
- `activity_logs`

---

## 3. Seeded Simulated Executive Dataset

All synthetic records are transparently labelled `[SIMULATED]` in the UI and database:
- **12 Executive Clients** (CTOs, CISOs, CIOs, SVPs of Engineering, VPs of Product & AI)
- **5 Internal Team Members** (Managing Director, Principal Career Strategists, Research Associates)
- **50 Job Opportunities** across 25 Tier-1 enterprise & AI companies
- **100 Application Records** across weekly (`W37–W44`) and monthly buckets
- **60 Hiring-Manager Contacts & 60 Outreach Activities**
- **30 Executive Interview Records**

---

## 4. Setup, Running & Testing Instructions

### Local / Cloud Run Development
```bash
# Install dependencies
npm install

# Run TypeScript & schema typecheck
npm run lint

# Run automated PostgreSQL integration verification suite
npx tsx tests/verify_platform.test.ts

# Start full-stack server on port 3000
npm run dev
```

### Docker Compose Deployment
```bash
docker compose up --build -d
```
