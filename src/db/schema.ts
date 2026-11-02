import { relations } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

// 1. Roles
export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(), // Administrator, Client Delivery Owner, Research Associate, Client
  description: text('description').notNull(),
  permissions: text('permissions').notNull(), // JSON array of permission strings
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 2. Users (Linked to Firebase Auth UID)
export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    uid: text('uid').notNull().unique(),
    email: text('email').notNull(),
    fullName: text('full_name').notNull(),
    roleId: integer('role_id').references(() => roles.id),
    roleName: text('role_name').notNull().default('Administrator'),
    designation: text('designation').notNull().default('Managing Director, Client Delivery'),
    department: text('department').notNull().default('Executive Search & Advisory'),
    avatarInitials: text('avatar_initials').notNull().default('CP'),
    isActive: boolean('is_active').notNull().default(true),
    isSimulated: boolean('is_simulated').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_users_uid').on(table.uid),
    index('idx_users_email').on(table.email),
    index('idx_users_role').on(table.roleName),
  ]
);

// 3. Clients
export const clients = pgTable(
  'clients',
  {
    id: serial('id').primaryKey(),
    fullName: text('full_name').notNull(),
    email: text('email').notNull(),
    phone: text('phone').notNull(),
    linkedinUrl: text('linkedin_url').notNull(),
    currentDesignation: text('current_designation').notNull(),
    currentEmployer: text('current_employer').notNull(),
    yearsOfExperience: integer('years_of_experience').notNull(),
    location: text('location').notNull(),
    status: text('status').notNull().default('Active'), // Onboarding, Active, Interviewing, Offer Stage, Placed, Paused
    onboardingDate: text('onboarding_date').notNull(), // YYYY-MM-DD
    targetCompMin: integer('target_comp_min').notNull().default(300000),
    targetCompMax: integer('target_comp_max').notNull().default(450000),
    assignedOwnerId: integer('assigned_owner_id').references(() => users.id),
    assignedOwnerName: text('assigned_owner_name').notNull().default('Elena Vance'),
    isSimulated: boolean('is_simulated').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_clients_status').on(table.status),
    index('idx_clients_owner').on(table.assignedOwnerId),
  ]
);

// 4. Client_Profiles
export const clientProfiles = pgTable(
  'client_profiles',
  {
    id: serial('id').primaryKey(),
    clientId: integer('client_id')
      .references(() => clients.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),
    technologySpecialisation: text('technology_specialisation').notNull(),
    leadershipExperience: text('leadership_experience').notNull(),
    coreCompetencies: text('core_competencies').notNull(), // comma-separated or JSON
    targetJobTitles: text('target_job_titles').notNull(),
    preferredIndustries: text('preferred_industries').notNull(),
    targetCompanies: text('target_companies').notNull(),
    preferredLocations: text('preferred_locations').notNull(),
    salaryExpectations: text('salary_expectations').notNull(),
    careerObjectives: text('career_objectives').notNull(),
    resumeFilename: text('resume_filename'),
    resumeFileType: text('resume_file_type'),
    resumeFileSize: integer('resume_file_size'),
    resumeUploadedAt: timestamp('resume_uploaded_at'),
    resumeSummary: text('resume_summary'),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [index('idx_client_profiles_client').on(table.clientId)]
);

// 5. Client_Programs
export const clientPrograms = pgTable(
  'client_programs',
  {
    id: serial('id').primaryKey(),
    clientId: integer('client_id')
      .references(() => clients.id, { onDelete: 'cascade' })
      .notNull(),
    programName: text('program_name').notNull(), // e.g., C-Suite Accelerated Transition
    tier: text('tier').notNull().default('Executive Retainer'), // Executive Retainer, Board & CTO Advisory, VP Fast-Track
    startDate: text('start_date').notNull(),
    targetEndDate: text('target_end_date').notNull(),
    status: text('status').notNull().default('Active'), // Active, Completed, On Hold
    weeklyApplicationTarget: integer('weekly_application_target').notNull().default(8),
    weeklyOutreachTarget: integer('weekly_outreach_target').notNull().default(12),
    conversionStage: text('conversion_stage').notNull().default('Active Pipeline'),
    healthStatus: text('health_status').notNull().default('On Track'), // On Track, At Risk, Needs Attention
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('idx_client_programs_client').on(table.clientId)]
);

// 6. Team_Assignments
export const teamAssignments = pgTable(
  'team_assignments',
  {
    id: serial('id').primaryKey(),
    clientId: integer('client_id')
      .references(() => clients.id, { onDelete: 'cascade' })
      .notNull(),
    userId: integer('user_id')
      .references(() => users.id, { onDelete: 'cascade' })
      .notNull(),
    assignmentRole: text('assignment_role').notNull(), // Client Delivery Owner, Research Associate, Executive Branding Lead
    allocationPct: integer('allocation_pct').notNull().default(25),
    assignedAt: timestamp('assigned_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_team_assignments_client').on(table.clientId),
    index('idx_team_assignments_user').on(table.userId),
  ]
);

// 7. Job_Opportunities
export const jobOpportunities = pgTable(
  'job_opportunities',
  {
    id: serial('id').primaryKey(),
    clientId: integer('client_id')
      .references(() => clients.id, { onDelete: 'cascade' })
      .notNull(),
    company: text('company').notNull(),
    designation: text('designation').notNull(),
    technologySpecialisation: text('technology_specialisation').notNull(),
    salaryRange: text('salary_range').notNull(),
    salaryMin: integer('salary_min').notNull().default(280000),
    salaryMax: integer('salary_max').notNull().default(420000),
    location: text('location').notNull(),
    workMode: text('work_mode').notNull().default('Hybrid'), // Remote, Hybrid, On-site
    jobDescription: text('job_description').notNull(),
    sourceUrl: text('source_url').notNull(),
    fitScore: integer('fit_score').notNull().default(88),
    status: text('status').notNull().default('Identified'), // Identified, Shortlisted, Approved, Applied, Recruiter Contacted, Interview Scheduled, Rejected, Offer Received
    createdById: integer('created_by_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_opportunities_client').on(table.clientId),
    index('idx_opportunities_status').on(table.status),
    index('idx_opportunities_company').on(table.company),
  ]
);

// 8. Applications
export const applications = pgTable(
  'applications',
  {
    id: serial('id').primaryKey(),
    opportunityId: integer('opportunity_id')
      .references(() => jobOpportunities.id, { onDelete: 'cascade' })
      .notNull(),
    clientId: integer('client_id')
      .references(() => clients.id, { onDelete: 'cascade' })
      .notNull(),
    status: text('status').notNull().default('Identified'),
    appliedDate: text('applied_date').notNull(), // YYYY-MM-DD
    weekBucket: text('week_bucket').notNull(), // e.g., 2026-W40
    monthBucket: text('month_bucket').notNull(), // e.g., 2026-10
    resumeVersion: text('resume_version').notNull().default('v3.2 Executive Master'),
    coverLetterSent: boolean('cover_letter_sent').notNull().default(true),
    rejectionReason: text('rejection_reason'),
    offerDetails: text('offer_details'),
    notes: text('notes').notNull().default(''),
    stageHistory: text('stage_history').notNull().default('[]'), // JSON history of status transitions
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_applications_client').on(table.clientId),
    index('idx_applications_opportunity').on(table.opportunityId),
    index('idx_applications_status').on(table.status),
  ]
);

// 9. Hiring_Manager_Contacts
export const hiringManagerContacts = pgTable(
  'hiring_manager_contacts',
  {
    id: serial('id').primaryKey(),
    name: text('name').notNull(),
    title: text('title').notNull(),
    company: text('company').notNull(),
    email: text('email').notNull(),
    linkedinUrl: text('linkedin_url').notNull(),
    phone: text('phone').notNull(),
    opportunityId: integer('opportunity_id').references(() => jobOpportunities.id, {
      onDelete: 'set null',
    }),
    clientId: integer('client_id').references(() => clients.id, {
      onDelete: 'cascade',
    }),
    relationshipWarmth: text('relationship_warmth').notNull().default('Warm'), // Cold, Warm, Champion, Referred
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_hm_contacts_company').on(table.company),
    index('idx_hm_contacts_client').on(table.clientId),
  ]
);

// 10. Outreach_Activities
export const outreachActivities = pgTable(
  'outreach_activities',
  {
    id: serial('id').primaryKey(),
    contactId: integer('contact_id')
      .references(() => hiringManagerContacts.id, { onDelete: 'cascade' })
      .notNull(),
    clientId: integer('client_id')
      .references(() => clients.id, { onDelete: 'cascade' })
      .notNull(),
    opportunityId: integer('opportunity_id').references(() => jobOpportunities.id, {
      onDelete: 'set null',
    }),
    channel: text('channel').notNull().default('LinkedIn InMail'), // LinkedIn InMail, Direct Email, Warm Intro, Executive Recruiter
    messageSubject: text('message_subject').notNull(),
    messageSnippet: text('message_snippet').notNull(),
    sentDate: text('sent_date').notNull(), // YYYY-MM-DD
    status: text('status').notNull().default('Sent'), // Sent, Opened, Replied, Follow-Up Due, Meeting Booked, Referral Secured
    replyReceived: boolean('reply_received').notNull().default(false),
    replyDate: text('reply_date'),
    followUpCount: integer('follow_up_count').notNull().default(1),
    nextAction: text('next_action').notNull(),
    nextActionDate: text('next_action_date').notNull(),
    outcome: text('outcome').notNull().default('Awaiting Response'), // Awaiting Response, Intro Call Scheduled, Referred to Hiring Panel, Polite Pass
    ownerId: integer('owner_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_outreach_client').on(table.clientId),
    index('idx_outreach_contact').on(table.contactId),
    index('idx_outreach_status').on(table.status),
  ]
);

// 11. Interview_Records
export const interviewRecords = pgTable(
  'interview_records',
  {
    id: serial('id').primaryKey(),
    applicationId: integer('application_id').references(() => applications.id, {
      onDelete: 'cascade',
    }),
    opportunityId: integer('opportunity_id').references(() => jobOpportunities.id, {
      onDelete: 'cascade',
    }),
    clientId: integer('client_id')
      .references(() => clients.id, { onDelete: 'cascade' })
      .notNull(),
    company: text('company').notNull(),
    roleTitle: text('role_title').notNull(),
    stageName: text('stage_name').notNull(), // Executive Recruiter Screen, Hiring Manager Deep-Dive, Architecture & Strategy Panel, CEO / Board Final, Compensation & Offer
    roundNumber: integer('round_number').notNull().default(1),
    scheduledAt: text('scheduled_at').notNull(), // YYYY-MM-DD HH:mm
    interviewerName: text('interviewer_name').notNull(),
    interviewerTitle: text('interviewer_title').notNull(),
    prepStatus: text('prep_status').notNull().default('Scheduled'), // Pending Prep, Dossier Ready, Mock Completed, Debrief Complete
    prepNotes: text('prep_notes').notNull(),
    feedback: text('feedback').notNull().default(''),
    outcome: text('outcome').notNull().default('Scheduled'), // Scheduled, Advanced to Next Round, Offer Extended, Closed
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_interviews_client').on(table.clientId),
    index('idx_interviews_outcome').on(table.outcome),
  ]
);

// 12. Tasks
export const tasks = pgTable(
  'tasks',
  {
    id: serial('id').primaryKey(),
    clientId: integer('client_id')
      .references(() => clients.id, { onDelete: 'cascade' })
      .notNull(),
    assignedToId: integer('assigned_to_id').references(() => users.id),
    assignedToName: text('assigned_to_name').notNull().default('Elena Vance'),
    title: text('title').notNull(),
    description: text('description').notNull(),
    category: text('category').notNull().default('Pipeline Operations'), // Branding, Pipeline Operations, Outreach, Interview Prep
    priority: text('priority').notNull().default('High'), // Critical, High, Medium, Low
    status: text('status').notNull().default('In Progress'), // Pending, In Progress, Awaiting Client, Completed, Overdue
    dueDate: text('due_date').notNull(), // YYYY-MM-DD
    completedAt: text('completed_at'),
    internalNotes: text('internal_notes').notNull().default(''),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_tasks_client').on(table.clientId),
    index('idx_tasks_status').on(table.status),
    index('idx_tasks_due').on(table.dueDate),
  ]
);

// 13. Deliverables
export const deliverables = pgTable(
  'deliverables',
  {
    id: serial('id').primaryKey(),
    clientId: integer('client_id')
      .references(() => clients.id, { onDelete: 'cascade' })
      .notNull(),
    ownerId: integer('owner_id').references(() => users.id),
    ownerName: text('owner_name').notNull().default('Elena Vance'),
    title: text('title').notNull(),
    deliverableType: text('deliverable_type').notNull(), // Executive Resume, Board Bio, LinkedIn Authority Overhaul, Target Market Map, 90-Day CTO Charter, Interview Briefing Dossier
    status: text('status').notNull().default('In Review'), // Draft, In Review, Approved, Overdue
    clientApprovalStatus: text('client_approval_status').notNull().default('Pending Approval'), // Pending Approval, Approved, Changes Requested
    dueDate: text('due_date').notNull(), // YYYY-MM-DD
    submittedAt: text('submitted_at'),
    approvedAt: text('approved_at'),
    version: text('version').notNull().default('v1.0'),
    notes: text('notes').notNull().default(''),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_deliverables_client').on(table.clientId),
    index('idx_deliverables_status').on(table.status),
  ]
);

// 14. Client_Reports
export const clientReports = pgTable(
  'client_reports',
  {
    id: serial('id').primaryKey(),
    clientId: integer('client_id')
      .references(() => clients.id, { onDelete: 'cascade' })
      .notNull(),
    reportPeriod: text('report_period').notNull(), // e.g., Oct 26 – Nov 02, 2026
    weekStarting: text('week_starting').notNull(),
    opportunitiesIdentified: integer('opportunities_identified').notNull().default(0),
    rolesShortlisted: integer('roles_shortlisted').notNull().default(0),
    applicationsSubmitted: integer('applications_submitted').notNull().default(0),
    outreachSent: integer('outreach_sent').notNull().default(0),
    responsesReceived: integer('responses_received').notNull().default(0),
    interviewsSecured: integer('interviews_secured').notNull().default(0),
    upcomingActions: text('upcoming_actions').notNull(),
    pendingDeliverablesSummary: text('pending_deliverables_summary').notNull(),
    executiveSummary: text('executive_summary').notNull(),
    generatedById: integer('generated_by_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('idx_reports_client').on(table.clientId)]
);

// 15. Activity_Logs
export const activityLogs = pgTable(
  'activity_logs',
  {
    id: serial('id').primaryKey(),
    clientId: integer('client_id').references(() => clients.id, {
      onDelete: 'cascade',
    }),
    userId: integer('user_id').references(() => users.id),
    actorName: text('actor_name').notNull(),
    actionType: text('action_type').notNull(), // Client Onboarded, Status Updated, Outreach Logged, Interview Scheduled, Deliverable Approved, Report Generated
    entityType: text('entity_type').notNull(), // Client, Opportunity, Application, Outreach, Interview, Task, Deliverable
    entityId: integer('entity_id'),
    description: text('description').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('idx_activity_client').on(table.clientId)]
);

// Relations
export const clientsRelations = relations(clients, ({ one, many }) => ({
  profile: one(clientProfiles, {
    fields: [clients.id],
    references: [clientProfiles.clientId],
  }),
  programs: many(clientPrograms),
  opportunities: many(jobOpportunities),
  applications: many(applications),
  outreachActivities: many(outreachActivities),
  interviews: many(interviewRecords),
  tasks: many(tasks),
  deliverables: many(deliverables),
  reports: many(clientReports),
  activities: many(activityLogs),
}));

// ============================================================================
// TALENTIQ — AI-POWERED EXECUTIVE RESUME INTELLIGENCE & JOB MATCHING TABLES
// ============================================================================

// 16. Candidates
export const candidates = pgTable(
  'candidates',
  {
    id: serial('id').primaryKey(),
    fullName: text('full_name').notNull(),
    email: text('email').notNull(),
    phone: text('phone').notNull(),
    location: text('location').notNull(),
    currentDesignation: text('current_designation').notNull(),
    previousDesignations: text('previous_designations').notNull(),
    totalYearsExperience: integer('total_years_experience').notNull(),
    primaryDomain: text('primary_domain').notNull(), // Cloud & Infrastructure, AI & Data, Enterprise Architecture, Platform & DevOps, FinTech & Security
    extractionConfidence: integer('extraction_confidence').notNull().default(94),
    analysisMonth: text('analysis_month').notNull().default('2026-10'),
    isSynthetic: boolean('is_synthetic').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_candidates_domain').on(table.primaryDomain),
    index('idx_candidates_exp').on(table.totalYearsExperience),
  ]
);

// 17. Candidate_Resumes
export const candidateResumes = pgTable(
  'candidate_resumes',
  {
    id: serial('id').primaryKey(),
    candidateId: integer('candidate_id')
      .references(() => candidates.id, { onDelete: 'cascade' })
      .notNull(),
    filename: text('filename').notNull(),
    fileType: text('file_type').notNull(), // PDF, DOCX, TXT
    rawText: text('raw_text').notNull(),
    extractionConfidence: integer('extraction_confidence').notNull().default(94),
    parsedAt: timestamp('parsed_at').defaultNow().notNull(),
  },
  (table) => [index('idx_candidate_resumes_cid').on(table.candidateId)]
);

// 18. Candidate_Profiles
export const candidateProfiles = pgTable(
  'candidate_profiles',
  {
    id: serial('id').primaryKey(),
    candidateId: integer('candidate_id')
      .references(() => candidates.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),
    industryExperience: text('industry_experience').notNull(),
    leadershipExperience: text('leadership_experience').notNull(),
    educationalQualifications: text('educational_qualifications').notNull(),
    majorAchievements: text('major_achievements').notNull(),
    companiesWorkedAt: text('companies_worked_at').notNull(),
    executiveSummary: text('executive_summary').notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [index('idx_candidate_profiles_cid').on(table.candidateId)]
);

// 19. Employment_History
export const employmentHistory = pgTable(
  'employment_history',
  {
    id: serial('id').primaryKey(),
    candidateId: integer('candidate_id')
      .references(() => candidates.id, { onDelete: 'cascade' })
      .notNull(),
    company: text('company').notNull(),
    designation: text('designation').notNull(),
    duration: text('duration').notNull(),
    highlights: text('highlights').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('idx_emp_history_cid').on(table.candidateId)]
);

// 20. Candidate_Skills
export const candidateSkills = pgTable(
  'candidate_skills',
  {
    id: serial('id').primaryKey(),
    candidateId: integer('candidate_id')
      .references(() => candidates.id, { onDelete: 'cascade' })
      .notNull(),
    skillName: text('skill_name').notNull(),
    skillCategory: text('skill_category').notNull(), // Architecture, Cloud, Data/AI, Leadership, Governance
    proficiencyLevel: text('proficiency_level').notNull().default('Expert'),
    yearsUsed: integer('years_used').notNull().default(8),
    isVerified: boolean('is_verified').notNull().default(true),
  },
  (table) => [
    index('idx_candidate_skills_cid').on(table.candidateId),
    index('idx_candidate_skills_name').on(table.skillName),
  ]
);

// 21. Certifications
export const certifications = pgTable(
  'certifications',
  {
    id: serial('id').primaryKey(),
    candidateId: integer('candidate_id')
      .references(() => candidates.id, { onDelete: 'cascade' })
      .notNull(),
    name: text('name').notNull(),
    issuingOrg: text('issuing_org').notNull(),
    issueYear: text('issue_year').notNull(),
  },
  (table) => [index('idx_certifications_cid').on(table.candidateId)]
);

// 22. Technology_Roles (Role Classification Taxonomy)
export const technologyRoles = pgTable(
  'technology_roles',
  {
    id: serial('id').primaryKey(),
    category: text('category').notNull(), // Executive Leadership, Engineering Leadership, Architecture, Data and Analytics, Infrastructure and Operations
    roleTitle: text('role_title').notNull().unique(),
    typicalResponsibilities: text('typical_responsibilities').notNull(),
    requiredTechnicalKnowledge: text('required_technical_knowledge').notNull(),
    expectedLeadershipExperience: text('expected_leadership_experience').notNull(),
    relevantIndustryExperience: text('relevant_industry_experience').notNull(),
    commonQualifications: text('common_qualifications').notNull(),
    seniorityBand: text('seniority_band').notNull().default('C-Level / VP'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('idx_tech_roles_category').on(table.category)]
);

// 23. Job_Descriptions
export const jobDescriptions = pgTable(
  'job_descriptions',
  {
    id: serial('id').primaryKey(),
    jobTitle: text('job_title').notNull(),
    company: text('company').notNull(),
    roleCategory: text('role_category').notNull(), // Executive Leadership, Engineering Leadership, Architecture, Data and Analytics, Infrastructure and Operations
    taxonomyRoleId: integer('taxonomy_role_id').references(() => technologyRoles.id, {
      onDelete: 'set null',
    }),
    seniorityLevel: text('seniority_level').notNull(), // C-Suite, SVP / VP, Director, Principal / Head
    yearsOfExperience: integer('years_of_experience').notNull().default(15),
    leadershipExpectations: text('leadership_expectations').notNull(),
    industryRequirements: text('industry_requirements').notNull(),
    technicalResponsibilities: text('technical_responsibilities').notNull(),
    location: text('location').notNull(),
    compensationInfo: text('compensation_info').notNull(),
    rawDescription: text('raw_description').notNull(),
    isSynthetic: boolean('is_synthetic').notNull().default(true),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_jd_category').on(table.roleCategory),
    index('idx_jd_company').on(table.company),
  ]
);

// 24. Job_Requirements
export const jobRequirements = pgTable(
  'job_requirements',
  {
    id: serial('id').primaryKey(),
    jobId: integer('job_id')
      .references(() => jobDescriptions.id, { onDelete: 'cascade' })
      .notNull(),
    skillName: text('skill_name').notNull(),
    requirementType: text('requirement_type').notNull().default('Required'), // Required, Preferred
    weightImportance: integer('weight_importance').notNull().default(10),
  },
  (table) => [index('idx_job_req_jid').on(table.jobId)]
);

// 25. Match_Results
export const matchResults = pgTable(
  'match_results',
  {
    id: serial('id').primaryKey(),
    candidateId: integer('candidate_id')
      .references(() => candidates.id, { onDelete: 'cascade' })
      .notNull(),
    jobId: integer('job_id')
      .references(() => jobDescriptions.id, { onDelete: 'cascade' })
      .notNull(),
    overallScore: integer('overall_score').notNull(),
    technicalScore: integer('technical_score').notNull(),
    leadershipScore: integer('leadership_score').notNull(),
    seniorityScore: integer('seniority_score').notNull(),
    domainScore: integer('domain_score').notNull(),
    industryScore: integer('industry_score').notNull(),
    progressionScore: integer('progression_score').notNull(),
    qualificationScore: integer('qualification_score').notNull(),
    confidenceTier: text('confidence_tier').notNull(), // High Confidence (>=82), Strong Contender (70-81), Partial Alignment (<70)
    scoringMode: text('scoring_mode').notNull().default('Hybrid Semantic + Rule Engine'),
    evaluatedAt: timestamp('evaluated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_match_candidate').on(table.candidateId),
    index('idx_match_job').on(table.jobId),
    index('idx_match_score').on(table.overallScore),
  ]
);

// 26. Match_Explanations
export const matchExplanations = pgTable(
  'match_explanations',
  {
    id: serial('id').primaryKey(),
    matchId: integer('match_id')
      .references(() => matchResults.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),
    matchingSkills: text('matching_skills').notNull(),
    relevantLeadership: text('relevant_leadership').notNull(),
    matchingIndustry: text('matching_industry').notNull(),
    missingQualifications: text('missing_qualifications').notNull(),
    potentialConcerns: text('potential_concerns').notNull(),
    recommendationRationale: text('recommendation_rationale').notNull(),
  },
  (table) => [index('idx_match_exp_mid').on(table.matchId)]
);

// 27. Skills_Gap_Analysis
export const skillsGapAnalysis = pgTable(
  'skills_gap_analysis',
  {
    id: serial('id').primaryKey(),
    matchId: integer('match_id').references(() => matchResults.id, {
      onDelete: 'cascade',
    }),
    candidateId: integer('candidate_id')
      .references(() => candidates.id, { onDelete: 'cascade' })
      .notNull(),
    jobId: integer('job_id')
      .references(() => jobDescriptions.id, { onDelete: 'cascade' })
      .notNull(),
    demonstratedSkills: text('demonstrated_skills').notNull(),
    missingRequiredSkills: text('missing_required_skills').notNull(),
    unmentionedProbableSkills: text('unmentioned_probable_skills').notNull(),
    missingPreferredSkills: text('missing_preferred_skills').notNull(),
    leadershipGaps: text('leadership_gaps').notNull(),
    industryGaps: text('industry_gaps').notNull(),
    clarificationAreas: text('clarification_areas').notNull(),
    positioningImprovementPlan: text('positioning_improvement_plan').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_gap_candidate').on(table.candidateId),
    index('idx_gap_job').on(table.jobId),
  ]
);

// 28. Positioning_Recommendations
export const positioningRecommendations = pgTable(
  'positioning_recommendations',
  {
    id: serial('id').primaryKey(),
    candidateId: integer('candidate_id')
      .references(() => candidates.id, { onDelete: 'cascade' })
      .notNull()
      .unique(),
    targetPositions: text('target_positions').notNull(),
    alternativePaths: text('alternative_paths').notNull(),
    strongestDifferentiators: text('strongest_differentiators').notNull(),
    skillsNeedingVisibility: text('skills_needing_visibility').notNull(),
    resumePositioningAdvice: text('resume_positioning_advice').notNull(),
    relevantIndustrySegments: text('relevant_industry_segments').notNull(),
    recommendedSearchStrategy: text('recommended_search_strategy').notNull(),
    approvedByManager: boolean('approved_by_manager').notNull().default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('idx_pos_rec_cid').on(table.candidateId)]
);

// 29. Evaluation_Logs
export const evaluationLogs = pgTable('evaluation_logs', {
  id: serial('id').primaryKey(),
  operationType: text('operation_type').notNull(), // Resume Parse, JD Parse, Candidate-Job Match, Positioning Generation
  modelUsed: text('model_used').notNull(),
  fallbackTriggered: boolean('fallback_triggered').notNull().default(false),
  latencyMs: integer('latency_ms').notNull().default(140),
  inputSummary: text('input_summary').notNull(),
  outputMetadata: text('output_metadata').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 30. Matching_Weights_Config
export const matchingWeightsConfig = pgTable('matching_weights_config', {
  id: serial('id').primaryKey(),
  configName: text('config_name').notNull().unique(),
  technicalWeight: integer('technical_weight').notNull().default(25),
  leadershipWeight: integer('leadership_weight').notNull().default(20),
  seniorityWeight: integer('seniority_weight').notNull().default(15),
  domainWeight: integer('domain_weight').notNull().default(15),
  industryWeight: integer('industry_weight').notNull().default(10),
  progressionWeight: integer('progression_weight').notNull().default(10),
  qualificationWeight: integer('qualification_weight').notNull().default(5),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

