"""
SQLAlchemy 2.0 Normalized PostgreSQL Models for CareerPilot Enterprise Platform.
Mirrors the 15 normalized tables in PostgreSQL.
"""

from datetime import datetime
from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class Role(Base):
    __tablename__ = "roles"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    permissions = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    uid = Column(String(128), unique=True, nullable=False, index=True)
    email = Column(String(255), nullable=False, index=True)
    full_name = Column(String(255), nullable=False)
    role_id = Column(Integer, ForeignKey("roles.id"))
    role_name = Column(String(100), nullable=False, default="Administrator")
    designation = Column(String(255), nullable=False)
    department = Column(String(255), nullable=False)
    avatar_initials = Column(String(10), nullable=False, default="CP")
    is_active = Column(Boolean, default=True, nullable=False)
    is_simulated = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(64), nullable=False)
    linkedin_url = Column(String(512), nullable=False)
    current_designation = Column(String(255), nullable=False)
    current_employer = Column(String(255), nullable=False)
    years_of_experience = Column(Integer, nullable=False)
    location = Column(String(255), nullable=False)
    status = Column(String(64), nullable=False, default="Active", index=True)
    onboarding_date = Column(String(32), nullable=False)
    target_comp_min = Column(Integer, nullable=False, default=300000)
    target_comp_max = Column(Integer, nullable=False, default=450000)
    assigned_owner_id = Column(Integer, ForeignKey("users.id"), index=True)
    assigned_owner_name = Column(String(255), nullable=False)
    is_simulated = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    profile = relationship("ClientProfile", back_populates="client", uselist=False)


class ClientProfile(Base):
    __tablename__ = "client_profiles"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), unique=True, nullable=False)
    technology_specialisation = Column(Text, nullable=False)
    leadership_experience = Column(Text, nullable=False)
    core_competencies = Column(Text, nullable=False)
    target_job_titles = Column(Text, nullable=False)
    preferred_industries = Column(Text, nullable=False)
    target_companies = Column(Text, nullable=False)
    preferred_locations = Column(Text, nullable=False)
    salary_expectations = Column(Text, nullable=False)
    career_objectives = Column(Text, nullable=False)
    resume_filename = Column(String(512))
    resume_file_type = Column(String(128))
    resume_file_size = Column(Integer)
    resume_uploaded_at = Column(DateTime)
    resume_summary = Column(Text)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    client = relationship("Client", back_populates="profile")


class ClientProgram(Base):
    __tablename__ = "client_programs"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    program_name = Column(String(255), nullable=False)
    tier = Column(String(100), nullable=False, default="Executive Retainer")
    start_date = Column(String(32), nullable=False)
    target_end_date = Column(String(32), nullable=False)
    status = Column(String(64), nullable=False, default="Active")
    weekly_application_target = Column(Integer, nullable=False, default=8)
    weekly_outreach_target = Column(Integer, nullable=False, default=12)
    conversion_stage = Column(String(100), nullable=False)
    health_status = Column(String(64), nullable=False, default="On Track")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class TeamAssignment(Base):
    __tablename__ = "team_assignments"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    assignment_role = Column(String(100), nullable=False)
    allocation_pct = Column(Integer, nullable=False, default=25)
    assigned_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class JobOpportunity(Base):
    __tablename__ = "job_opportunities"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    company = Column(String(255), nullable=False, index=True)
    designation = Column(String(255), nullable=False)
    technology_specialisation = Column(Text, nullable=False)
    salary_range = Column(String(128), nullable=False)
    salary_min = Column(Integer, nullable=False, default=280000)
    salary_max = Column(Integer, nullable=False, default=420000)
    location = Column(String(255), nullable=False)
    work_mode = Column(String(64), nullable=False, default="Hybrid")
    job_description = Column(Text, nullable=False)
    source_url = Column(String(512), nullable=False)
    fit_score = Column(Integer, nullable=False, default=88)
    status = Column(String(64), nullable=False, default="Identified", index=True)
    created_by_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Application(Base):
    __tablename__ = "applications"
    id = Column(Integer, primary_key=True, index=True)
    opportunity_id = Column(Integer, ForeignKey("job_opportunities.id", ondelete="CASCADE"), nullable=False, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(64), nullable=False, default="Identified", index=True)
    applied_date = Column(String(32), nullable=False)
    week_bucket = Column(String(32), nullable=False)
    month_bucket = Column(String(32), nullable=False)
    resume_version = Column(String(255), nullable=False)
    cover_letter_sent = Column(Boolean, default=True, nullable=False)
    rejection_reason = Column(Text)
    offer_details = Column(Text)
    notes = Column(Text, nullable=False, default="")
    stage_history = Column(Text, nullable=False, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class HiringManagerContact(Base):
    __tablename__ = "hiring_manager_contacts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False, index=True)
    email = Column(String(255), nullable=False)
    linkedin_url = Column(String(512), nullable=False)
    phone = Column(String(64), nullable=False)
    opportunity_id = Column(Integer, ForeignKey("job_opportunities.id", ondelete="SET NULL"))
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), index=True)
    relationship_warmth = Column(String(64), nullable=False, default="Warm")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class OutreachActivity(Base):
    __tablename__ = "outreach_activities"
    id = Column(Integer, primary_key=True, index=True)
    contact_id = Column(Integer, ForeignKey("hiring_manager_contacts.id", ondelete="CASCADE"), nullable=False, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    opportunity_id = Column(Integer, ForeignKey("job_opportunities.id", ondelete="SET NULL"))
    channel = Column(String(64), nullable=False, default="LinkedIn InMail")
    message_subject = Column(String(512), nullable=False)
    message_snippet = Column(Text, nullable=False)
    sent_date = Column(String(32), nullable=False)
    status = Column(String(64), nullable=False, default="Sent", index=True)
    reply_received = Column(Boolean, default=False, nullable=False)
    reply_date = Column(String(32))
    follow_up_count = Column(Integer, default=1, nullable=False)
    next_action = Column(Text, nullable=False)
    next_action_date = Column(String(32), nullable=False)
    outcome = Column(String(128), nullable=False, default="Awaiting Response")
    owner_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class InterviewRecord(Base):
    __tablename__ = "interview_records"
    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id", ondelete="CASCADE"))
    opportunity_id = Column(Integer, ForeignKey("job_opportunities.id", ondelete="CASCADE"))
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    company = Column(String(255), nullable=False)
    role_title = Column(String(255), nullable=False)
    stage_name = Column(String(128), nullable=False)
    round_number = Column(Integer, default=1, nullable=False)
    scheduled_at = Column(String(64), nullable=False)
    interviewer_name = Column(String(255), nullable=False)
    interviewer_title = Column(String(255), nullable=False)
    prep_status = Column(String(64), nullable=False, default="Scheduled")
    prep_notes = Column(Text, nullable=False)
    feedback = Column(Text, nullable=False, default="")
    outcome = Column(String(64), nullable=False, default="Scheduled", index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    assigned_to_id = Column(Integer, ForeignKey("users.id"))
    assigned_to_name = Column(String(255), nullable=False)
    title = Column(String(512), nullable=False)
    description = Column(Text, nullable=False)
    category = Column(String(100), nullable=False)
    priority = Column(String(64), nullable=False, default="High")
    status = Column(String(64), nullable=False, default="In Progress", index=True)
    due_date = Column(String(32), nullable=False, index=True)
    completed_at = Column(String(32))
    internal_notes = Column(Text, nullable=False, default="")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Deliverable(Base):
    __tablename__ = "deliverables"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner_name = Column(String(255), nullable=False)
    title = Column(String(512), nullable=False)
    deliverable_type = Column(String(128), nullable=False)
    status = Column(String(64), nullable=False, default="In Review", index=True)
    client_approval_status = Column(String(64), nullable=False, default="Pending Approval")
    due_date = Column(String(32), nullable=False)
    submitted_at = Column(String(32))
    approved_at = Column(String(32))
    version = Column(String(32), nullable=False, default="v1.0")
    notes = Column(Text, nullable=False, default="")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class ClientReport(Base):
    __tablename__ = "client_reports"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True)
    report_period = Column(String(128), nullable=False)
    week_starting = Column(String(32), nullable=False)
    opportunities_identified = Column(Integer, default=0, nullable=False)
    roles_shortlisted = Column(Integer, default=0, nullable=False)
    applications_submitted = Column(Integer, default=0, nullable=False)
    outreach_sent = Column(Integer, default=0, nullable=False)
    responses_received = Column(Integer, default=0, nullable=False)
    interviews_secured = Column(Integer, default=0, nullable=False)
    upcoming_actions = Column(Text, nullable=False)
    pending_deliverables_summary = Column(Text, nullable=False)
    executive_summary = Column(Text, nullable=False)
    generated_by_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class ActivityLog(Base):
    __tablename__ = "activity_logs"
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("clients.id", ondelete="CASCADE"), index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    actor_name = Column(String(255), nullable=False)
    action_type = Column(String(100), nullable=False)
    entity_type = Column(String(100), nullable=False)
    entity_id = Column(Integer)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
