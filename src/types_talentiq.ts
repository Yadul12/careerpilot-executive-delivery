export type TalentIQRole = 'Administrator' | 'Recruitment Analyst' | 'Delivery Manager';

export interface MatchingWeights {
  id?: number;
  configName: string;
  technicalWeight: number;
  leadershipWeight: number;
  seniorityWeight: number;
  domainWeight: number;
  industryWeight: number;
  progressionWeight: number;
  qualificationWeight: number;
  updatedBy: string;
  updatedAt?: string;
}

export interface TechnologyRoleRecord {
  id: number;
  category: string;
  roleTitle: string;
  typicalResponsibilities: string;
  requiredTechnicalKnowledge: string;
  expectedLeadershipExperience: string;
  relevantIndustryExperience: string;
  commonQualifications: string;
  seniorityBand: string;
  createdAt?: string;
}

export interface EmploymentHistoryItem {
  id?: number;
  candidateId?: number;
  company: string;
  designation: string;
  duration: string;
  highlights: string;
}

export interface CandidateSkillItem {
  id?: number;
  candidateId?: number;
  skillName: string;
  skillCategory: string;
  proficiencyLevel: string;
  yearsUsed: number;
  isVerified: boolean;
}

export interface CertificationItem {
  id?: number;
  candidateId?: number;
  name: string;
  issuingOrg: string;
  issueYear: string;
}

export interface PositioningRecommendationItem {
  id?: number;
  candidateId?: number;
  targetPositions: string;
  alternativePaths: string;
  strongestDifferentiators: string;
  skillsNeedingVisibility: string;
  resumePositioningAdvice: string;
  relevantIndustrySegments: string;
  recommendedSearchStrategy: string;
  approvedByManager: boolean;
}

export interface CandidateFullRecord {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  currentDesignation: string;
  previousDesignations: string;
  totalYearsExperience: number;
  primaryDomain: string;
  extractionConfidence: number;
  analysisMonth: string;
  isSynthetic: boolean;
  createdAt?: string;
  resume?: {
    id: number;
    filename: string;
    fileType: string;
    rawText: string;
    extractionConfidence: number;
    parsedAt?: string;
  } | null;
  profile?: {
    id: number;
    industryExperience: string;
    leadershipExperience: string;
    educationalQualifications: string;
    majorAchievements: string;
    companiesWorkedAt: string;
    executiveSummary: string;
  } | null;
  employmentHistory: EmploymentHistoryItem[];
  skills: CandidateSkillItem[];
  certifications: CertificationItem[];
  positioning?: PositioningRecommendationItem | null;
}

export interface JobRequirementItem {
  id?: number;
  jobId?: number;
  skillName: string;
  requirementType: 'Required' | 'Preferred';
  weightImportance: number;
}

export interface JobDescriptionFullRecord {
  id: number;
  jobTitle: string;
  company: string;
  roleCategory: string;
  taxonomyRoleId?: number | null;
  seniorityLevel: string;
  yearsOfExperience: number;
  leadershipExpectations: string;
  industryRequirements: string;
  technicalResponsibilities: string;
  location: string;
  compensationInfo: string;
  rawDescription: string;
  isSynthetic: boolean;
  createdAt?: string;
  requirements: JobRequirementItem[];
}

export interface MatchExplanationRecord {
  id?: number;
  matchId?: number;
  matchingSkills: string;
  relevantLeadership: string;
  matchingIndustry: string;
  missingQualifications: string;
  potentialConcerns: string;
  recommendationRationale: string;
}

export interface SkillsGapRecord {
  id: number;
  matchId?: number | null;
  candidateId: number;
  jobId: number;
  candidateName?: string;
  candidateDesignation?: string;
  jobTitle?: string;
  company?: string;
  overallScore?: number;
  demonstratedSkills: string;
  missingRequiredSkills: string;
  unmentionedProbableSkills: string;
  missingPreferredSkills: string;
  leadershipGaps: string;
  industryGaps: string;
  clarificationAreas: string;
  positioningImprovementPlan: string;
  createdAt?: string;
}

export interface MatchResultFullRecord {
  id: number;
  candidateId: number;
  jobId: number;
  candidateName: string;
  candidateDesignation: string;
  candidateDomain: string;
  candidateYears: number;
  jobTitle: string;
  company: string;
  roleCategory: string;
  overallScore: number;
  technicalScore: number;
  leadershipScore: number;
  seniorityScore: number;
  domainScore: number;
  industryScore: number;
  progressionScore: number;
  qualificationScore: number;
  confidenceTier: string;
  scoringMode: string;
  evaluatedAt?: string;
  explanation?: MatchExplanationRecord | null;
  skillsGap?: SkillsGapRecord | null;
}

export interface EvaluationLogRecord {
  id: number;
  operationType: string;
  modelUsed: string;
  fallbackTriggered: boolean;
  latencyMs: number;
  inputSummary: string;
  outputMetadata: string;
  createdAt?: string;
}

export interface TalentIQDashboardData {
  kpis: {
    totalCandidatesAnalysed: number;
    totalResumesUploaded: number;
    totalJobDescriptionsProcessed: number;
    totalCandidateJobMatches: number;
    highConfidenceMatches: number;
    averageMatchingScore: number;
    topTechnicalSpecialisations: { name: string; count: number }[];
    topRecommendedPositions: { position: string; count: number }[];
    missingSkillTrends: { skill: string; count: number }[];
  };
  charts: {
    experienceDistribution: { bracket: string; candidates: number }[];
    domainDistribution: { domain: string; candidates: number }[];
    jobsByCategory: { category: string; jobs: number }[];
    scoreDistribution: { range: string; matches: number }[];
    monthlyAnalysisTrends: { month: string; resumesAnalysed: number; highConfidenceMatches: number }[];
  };
}
