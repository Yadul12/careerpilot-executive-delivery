export type RoleName =
  | 'Administrator'
  | 'Client Delivery Owner'
  | 'Research Associate'
  | 'Client';

export interface UserProfile {
  id: number;
  uid: string;
  email: string;
  fullName: string;
  roleId: number | null;
  roleName: RoleName;
  designation: string;
  department: string;
  avatarInitials: string;
  isActive: boolean;
  isSimulated: boolean;
}

export interface ClientProfileDetail {
  id: number;
  clientId: number;
  technologySpecialisation: string;
  leadershipExperience: string;
  coreCompetencies: string;
  targetJobTitles: string;
  preferredIndustries: string;
  targetCompanies: string;
  preferredLocations: string;
  salaryExpectations: string;
  careerObjectives: string;
  resumeFilename: string | null;
  resumeFileType: string | null;
  resumeFileSize: number | null;
  resumeUploadedAt: string | null;
  resumeSummary: string | null;
}

export interface ClientProgram {
  id: number;
  clientId: number;
  programName: string;
  tier: string;
  startDate: string;
  targetEndDate: string;
  status: string;
  weeklyApplicationTarget: number;
  weeklyOutreachTarget: number;
  conversionStage: string;
  healthStatus: string;
}

export interface ExecutiveClient {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  linkedinUrl: string;
  currentDesignation: string;
  currentEmployer: string;
  yearsOfExperience: number;
  location: string;
  status: string;
  onboardingDate: string;
  targetCompMin: number;
  targetCompMax: number;
  assignedOwnerId: number | null;
  assignedOwnerName: string;
  isSimulated: boolean;
  profile: ClientProfileDetail | null;
  program: ClientProgram | null;
  teamAssignments: Array<{
    id: number;
    clientId: number;
    userId: number;
    assignmentRole: string;
    allocationPct: number;
    user?: UserProfile;
  }>;
}

export const PIPELINE_STATUSES = [
  'Identified',
  'Shortlisted',
  'Approved',
  'Applied',
  'Recruiter Contacted',
  'Interview Scheduled',
  'Rejected',
  'Offer Received',
] as const;

export type PipelineStatus = (typeof PIPELINE_STATUSES)[number];

export interface JobOpportunity {
  id: number;
  clientId: number;
  clientName: string;
  clientDesignation: string;
  company: string;
  designation: string;
  technologySpecialisation: string;
  salaryRange: string;
  salaryMin: number;
  salaryMax: number;
  location: string;
  workMode: string;
  jobDescription: string;
  sourceUrl: string;
  fitScore: number;
  status: PipelineStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationRecord {
  id: number;
  opportunityId: number;
  clientId: number;
  clientName: string;
  company: string;
  designation: string;
  salaryRange: string;
  location: string;
  technologySpecialisation: string;
  status: PipelineStatus;
  appliedDate: string;
  weekBucket: string;
  monthBucket: string;
  resumeVersion: string;
  coverLetterSent: boolean;
  rejectionReason: string | null;
  offerDetails: string | null;
  notes: string;
  stageHistory: string;
}

export interface OutreachActivityRecord {
  id: number;
  contactId: number;
  clientId: number;
  opportunityId: number | null;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  company: string;
  relationshipWarmth: string;
  clientName: string;
  opportunityTitle: string;
  channel: string;
  messageSubject: string;
  messageSnippet: string;
  sentDate: string;
  status: string;
  replyReceived: boolean;
  replyDate: string | null;
  followUpCount: number;
  nextAction: string;
  nextActionDate: string;
  outcome: string;
}

export interface InterviewRecordItem {
  id: number;
  applicationId: number | null;
  opportunityId: number | null;
  clientId: number;
  clientName: string;
  clientDesignation: string;
  company: string;
  roleTitle: string;
  stageName: string;
  roundNumber: number;
  scheduledAt: string;
  interviewerName: string;
  interviewerTitle: string;
  prepStatus: string;
  prepNotes: string;
  feedback: string;
  outcome: string;
}

export interface DeliveryTaskItem {
  id: number;
  clientId: number;
  clientName: string;
  assignedToId: number | null;
  assignedToName: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  dueDate: string;
  completedAt: string | null;
  internalNotes: string;
}

export interface DeliverableItem {
  id: number;
  clientId: number;
  clientName: string;
  ownerId: number | null;
  ownerName: string;
  title: string;
  deliverableType: string;
  status: string;
  clientApprovalStatus: string;
  dueDate: string;
  submittedAt: string | null;
  approvedAt: string | null;
  version: string;
  notes: string;
}

export interface ActivityLogItem {
  id: number;
  clientId: number | null;
  clientName?: string;
  actorName: string;
  actionType: string;
  entityType: string;
  entityId: number | null;
  description: string;
  createdAt: string;
}

export interface ClientReportItem {
  id: number;
  clientId: number;
  clientName: string;
  clientDesignation: string;
  clientEmployer: string;
  ownerName: string;
  reportPeriod: string;
  weekStarting: string;
  opportunitiesIdentified: number;
  rolesShortlisted: number;
  applicationsSubmitted: number;
  outreachSent: number;
  responsesReceived: number;
  interviewsSecured: number;
  upcomingActions: string;
  pendingDeliverablesSummary: string;
  executiveSummary: string;
  createdAt: string;
}

export interface LiveClientSnapshot {
  clientId: number;
  clientName: string;
  designation: string;
  employer: string;
  ownerName: string;
  status: string;
  opportunitiesIdentified: number;
  rolesShortlisted: number;
  applicationsSubmitted: number;
  hiringManagerOutreach: number;
  responsesReceived: number;
  interviewsSecured: number;
  upcomingActions: string[];
  pendingDeliverables: string[];
}

export interface DashboardAnalyticsData {
  kpis: {
    totalActiveClients: number;
    totalClients: number;
    newClientOnboardings: number;
    activePrograms: number;
    totalOpportunities: number;
    applicationsSubmitted: number;
    totalApplicationsRecords: number;
    hiringManagerOutreach: number;
    outreachReplyRate: number;
    interviewsSecured: number;
    clientConversionRate: number;
    appToInterviewRate: number;
    overdueDeliverables: number;
    overdueDeliverablesOnly: number;
    overdueTasksOnly: number;
  };
  weeklyTrends: Array<{
    week: string;
    applications: number;
    outreach: number;
    interviews: number;
  }>;
  funnelData: Array<{
    stage: string;
    count: number;
  }>;
  clientPerformance: Array<{
    clientId: number;
    clientName: string;
    designation: string;
    status: string;
    ownerName: string;
    opportunities: number;
    applications: number;
    outreach: number;
    interviews: number;
    conversionRate: number;
  }>;
  teamWorkload: Array<{
    userId: number;
    fullName: string;
    roleName: string;
    designation: string;
    avatarInitials: string;
    assignedClients: number;
    openTasks: number;
    deliverables: number;
    outreachHandled: number;
    utilizationPct: number;
  }>;
  monthlyDelivery: Array<{
    month: string;
    onboarded: number;
    deliverablesCompleted: number;
    interviewsSecured: number;
  }>;
  recentActivity: ActivityLogItem[];
}
