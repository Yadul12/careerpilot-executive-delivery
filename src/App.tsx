/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { LoginView } from './components/LoginView.tsx';

// Project 1: CareerPilot Modules
import { DashboardModule } from './components/DashboardModule.tsx';
import { ClientsModule } from './components/ClientsModule.tsx';
import { PipelineModule } from './components/PipelineModule.tsx';
import { DeliveryModule } from './components/DeliveryModule.tsx';
import { OutreachModule } from './components/OutreachModule.tsx';
import { InterviewsModule } from './components/InterviewsModule.tsx';
import { ReportsModule } from './components/ReportsModule.tsx';
import type {
  DashboardAnalyticsData,
  ExecutiveClient,
  JobOpportunity,
  ApplicationRecord,
  DeliveryTaskItem,
  DeliverableItem,
  ActivityLogItem,
  OutreachActivityRecord,
  InterviewRecordItem,
  ClientReportItem,
  LiveClientSnapshot,
  PipelineStatus,
  RoleName,
} from './types.ts';

// Project 2: TalentIQ Modules
import { DashboardView } from './components/talentiq/DashboardView.tsx';
import { CandidateManagementView } from './components/talentiq/CandidateManagementView.tsx';
import { ResumeUploadView } from './components/talentiq/ResumeUploadView.tsx';
import { CandidateProfileView } from './components/talentiq/CandidateProfileView.tsx';
import { JobDescriptionView } from './components/talentiq/JobDescriptionView.tsx';
import { RoleExplorerView } from './components/talentiq/RoleExplorerView.tsx';
import { MatchingEngineView } from './components/talentiq/MatchingEngineView.tsx';
import { CandidateComparisonView } from './components/talentiq/CandidateComparisonView.tsx';
import { SkillsGapView } from './components/talentiq/SkillsGapView.tsx';
import { ReportsView } from './components/talentiq/ReportsView.tsx';
import { SettingsAdminView } from './components/talentiq/SettingsAdminView.tsx';
import type {
  TalentIQDashboardData,
  CandidateFullRecord,
  JobDescriptionFullRecord,
  TechnologyRoleRecord,
  MatchResultFullRecord,
  MatchingWeights,
  EvaluationLogRecord,
} from './types_talentiq.ts';

import {
  LayoutDashboard,
  Users,
  FileUp,
  UserCheck,
  Briefcase,
  Layers,
  Target,
  GitCompare,
  AlertTriangle,
  FileBarChart,
  Settings,
  FolderKanban,
  Send,
  CalendarCheck,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

type PlatformKey = 'careerpilot' | 'talentiq';

type CareerPilotTab =
  | 'dashboard'
  | 'clients'
  | 'pipeline'
  | 'delivery'
  | 'outreach'
  | 'interviews'
  | 'reports';

type TalentIQPage =
  | 'dashboard'
  | 'candidates'
  | 'resume-upload'
  | 'candidate-profile'
  | 'jobs'
  | 'roles'
  | 'matching'
  | 'comparison'
  | 'skills-gap'
  | 'reports'
  | 'settings';

const CAREERPILOT_NAV: {
  id: CareerPilotTab;
  label: string;
  code: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'dashboard', label: 'Executive Dashboard', code: 'Mod A', icon: LayoutDashboard },
  { id: 'clients', label: 'Client Onboarding & Profiles', code: 'Mod B', icon: Users },
  { id: 'pipeline', label: 'Job Search Pipeline', code: 'Mod C', icon: Briefcase },
  { id: 'delivery', label: 'Client Delivery Management', code: 'Mod F', icon: FolderKanban },
  { id: 'outreach', label: 'Hiring Manager Outreach', code: 'Mod D', icon: Send },
  { id: 'interviews', label: 'Interview Tracking', code: 'Mod E', icon: CalendarCheck },
  { id: 'reports', label: 'Client Progress Reports', code: 'Mod G', icon: FileBarChart },
];

const TALENTIQ_NAV: {
  id: TalentIQPage;
  label: string;
  moduleCode: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'dashboard', label: 'Executive Dashboard', moduleCode: 'Mod A', icon: LayoutDashboard },
  { id: 'candidates', label: 'Candidate Management', moduleCode: 'Roster', icon: Users },
  { id: 'resume-upload', label: 'Resume Upload & Parsing', moduleCode: 'Mod B', icon: FileUp },
  { id: 'candidate-profile', label: 'Intelligence Profile', moduleCode: 'Mod B/H', icon: UserCheck },
  { id: 'jobs', label: 'Job Description Analysis', moduleCode: 'Mod D', icon: Briefcase },
  { id: 'roles', label: 'Technology Role Explorer', moduleCode: 'Mod C', icon: Layers },
  { id: 'matching', label: 'Candidate-Job Matching', moduleCode: 'Mod E', icon: Target },
  { id: 'comparison', label: 'Candidate Comparison', moduleCode: 'Mod G', icon: GitCompare },
  { id: 'skills-gap', label: 'Skills Gap Analysis', moduleCode: 'Mod F', icon: AlertTriangle },
  { id: 'reports', label: 'Reports & Analytics', moduleCode: 'Mod I', icon: FileBarChart },
  { id: 'settings', label: 'Settings & Administration', moduleCode: 'RBAC', icon: Settings },
];

const DEFAULT_WEIGHTS: MatchingWeights = {
  configName: 'default',
  technicalWeight: 25,
  leadershipWeight: 20,
  seniorityWeight: 15,
  domainWeight: 15,
  industryWeight: 10,
  progressionWeight: 10,
  qualificationWeight: 5,
  updatedBy: 'System Administrator',
};

function detectPlatformFromUrl(): PlatformKey {
  const fullUrl = `${window.location.href} ${document.referrer || ''}`.toLowerCase();

  if (
    fullUrl.includes('app=careerpilot') ||
    fullUrl.includes('#careerpilot') ||
    fullUrl.includes('/careerpilot')
  ) {
    localStorage.setItem('active_enterprise_platform', 'careerpilot');
    return 'careerpilot';
  }
  if (
    fullUrl.includes('app=talentiq') ||
    fullUrl.includes('#talentiq') ||
    fullUrl.includes('/talentiq')
  ) {
    localStorage.setItem('active_enterprise_platform', 'talentiq');
    return 'talentiq';
  }

  const saved = localStorage.getItem('active_enterprise_platform');
  if (saved === 'careerpilot' || saved === 'talentiq') {
    return saved;
  }

  if (window.location.hostname.toLowerCase().includes('careerpilot')) {
    return 'careerpilot';
  }

  return 'talentiq';
}

const MainWorkspace: React.FC<{
  darkMode: boolean;
  onToggleDarkMode: () => void;
}> = ({ darkMode, onToggleDarkMode }) => {
  const { userProfile, loading, signOut, switchRole, apiFetch } = useAuth();

  const [activePlatform, setActivePlatform] = useState<PlatformKey>(() => detectPlatformFromUrl());

  const handleSwitchPlatform = useCallback((platform: PlatformKey) => {
    setActivePlatform(platform);
    localStorage.setItem('active_enterprise_platform', platform);
    const targetUrl =
      platform === 'careerpilot'
        ? '/?app=careerpilot#careerpilot'
        : '/?app=talentiq#talentiq';
    window.history.replaceState({}, '', targetUrl);
    document.title =
      platform === 'careerpilot'
        ? 'CareerPilot — Executive Job Search & Client Delivery Platform'
        : 'TalentIQ — AI-Powered Executive Resume Intelligence & Job Matching Platform';
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setActivePlatform(detectPlatformFromUrl());
    };
    window.addEventListener('popstate', onPopState);
    document.title =
      activePlatform === 'careerpilot'
        ? 'CareerPilot — Executive Job Search & Client Delivery Platform'
        : 'TalentIQ — AI-Powered Executive Resume Intelligence & Job Matching Platform';
    return () => window.removeEventListener('popstate', onPopState);
  }, [activePlatform]);

  // CareerPilot State
  const [cpTab, setCpTab] = useState<CareerPilotTab>('dashboard');
  const [cpDashboard, setCpDashboard] = useState<DashboardAnalyticsData | null>(null);
  const [cpClients, setCpClients] = useState<ExecutiveClient[]>([]);
  const [cpOpportunities, setCpOpportunities] = useState<JobOpportunity[]>([]);
  const [cpApplications, setCpApplications] = useState<ApplicationRecord[]>([]);
  const [cpTasks, setCpTasks] = useState<DeliveryTaskItem[]>([]);
  const [cpDeliverables, setCpDeliverables] = useState<DeliverableItem[]>([]);
  const [cpActivities, setCpActivities] = useState<ActivityLogItem[]>([]);
  const [cpOutreach, setCpOutreach] = useState<OutreachActivityRecord[]>([]);
  const [cpInterviews, setCpInterviews] = useState<InterviewRecordItem[]>([]);
  const [cpReports, setCpReports] = useState<ClientReportItem[]>([]);
  const [cpSnapshots, setCpSnapshots] = useState<LiveClientSnapshot[]>([]);

  // TalentIQ State
  const [tiqPage, setTiqPage] = useState<TalentIQPage>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tiqDashboard, setTiqDashboard] = useState<TalentIQDashboardData | null>(null);
  const [candidates, setCandidates] = useState<CandidateFullRecord[]>([]);
  const [jobs, setJobs] = useState<JobDescriptionFullRecord[]>([]);
  const [roles, setRoles] = useState<TechnologyRoleRecord[]>([]);
  const [matches, setMatches] = useState<MatchResultFullRecord[]>([]);
  const [weights, setWeights] = useState<MatchingWeights>(DEFAULT_WEIGHTS);
  const [logs, setLogs] = useState<EvaluationLogRecord[]>([]);

  const [selectedCandidateId, setSelectedCandidateId] = useState<number | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);

  const loadCareerPilotData = useCallback(async () => {
    try {
      const [dash, clientsRes, pipeRes, delivRes, outRes, intRes, repRes] = await Promise.all([
        apiFetch<DashboardAnalyticsData>('/api/dashboard'),
        apiFetch<{ clients: ExecutiveClient[] }>('/api/clients'),
        apiFetch<{ opportunities: JobOpportunity[]; applications: ApplicationRecord[] }>(
          '/api/pipeline?pageSize=100'
        ),
        apiFetch<{
          tasks: DeliveryTaskItem[];
          deliverables: DeliverableItem[];
          activities: ActivityLogItem[];
        }>('/api/delivery'),
        apiFetch<{ activities: OutreachActivityRecord[] }>('/api/outreach'),
        apiFetch<{ interviews: InterviewRecordItem[] }>('/api/interviews'),
        apiFetch<{ reports: ClientReportItem[]; liveSnapshots: LiveClientSnapshot[] }>(
          '/api/reports'
        ),
      ]);

      setCpDashboard(dash);
      setCpClients(clientsRes.clients);
      setCpOpportunities(pipeRes.opportunities);
      setCpApplications(pipeRes.applications);
      setCpTasks(delivRes.tasks);
      setCpDeliverables(delivRes.deliverables);
      setCpActivities(delivRes.activities);
      setCpOutreach(outRes.activities);
      setCpInterviews(intRes.interviews);
      setCpReports(repRes.reports);
      setCpSnapshots(repRes.liveSnapshots);
    } catch (error) {
      console.error('Error loading CareerPilot data:', error);
    }
  }, [apiFetch]);

  const loadTalentIQData = useCallback(async () => {
    try {
      const [dashRes, candRes, jobsRes, rolesRes, matchesRes, weightsRes, logsRes] =
        await Promise.all([
          apiFetch<TalentIQDashboardData>('/api/talentiq/dashboard'),
          apiFetch<{ candidates: CandidateFullRecord[] }>('/api/talentiq/candidates'),
          apiFetch<{ jobs: JobDescriptionFullRecord[] }>('/api/talentiq/jobs'),
          apiFetch<{ roles: TechnologyRoleRecord[] }>('/api/talentiq/roles'),
          apiFetch<{ matches: MatchResultFullRecord[] }>('/api/talentiq/matches'),
          apiFetch<{ weights: MatchingWeights }>('/api/talentiq/weights'),
          apiFetch<{ logs: EvaluationLogRecord[] }>('/api/talentiq/logs'),
        ]);

      setTiqDashboard(dashRes);
      setCandidates(candRes.candidates);
      setJobs(jobsRes.jobs);
      setRoles(rolesRes.roles);
      setMatches(matchesRes.matches);
      setWeights(weightsRes.weights);
      setLogs(logsRes.logs);

      if (!selectedCandidateId && candRes.candidates.length > 0) {
        setSelectedCandidateId(candRes.candidates[0].id);
      }
      if (!selectedJobId && jobsRes.jobs.length > 0) {
        setSelectedJobId(jobsRes.jobs[0].id);
      }
      if (!selectedMatchId && matchesRes.matches.length > 0) {
        setSelectedMatchId(matchesRes.matches[0].id);
      }
    } catch (error) {
      console.error('Error loading TalentIQ data:', error);
    }
  }, [apiFetch, selectedCandidateId, selectedJobId, selectedMatchId]);

  useEffect(() => {
    if (userProfile) {
      loadTalentIQData();
      loadCareerPilotData();
    }
  }, [userProfile, loadTalentIQData, loadCareerPilotData]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 text-sm">
        Initializing Enterprise Workspace...
      </div>
    );
  }

  if (!userProfile) {
    return (
      <LoginView
        activePlatform={activePlatform}
        onSwitchPlatform={handleSwitchPlatform}
        darkMode={darkMode}
        onToggleDarkMode={onToggleDarkMode}
      />
    );
  }

  // TalentIQ Handlers
  const handleParseResume = async (payload: {
    filename: string;
    fileType: string;
    rawText: string;
  }) => {
    const res = await apiFetch<{ candidate: CandidateFullRecord }>(
      '/api/talentiq/resumes/parse',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    await loadTalentIQData();
    setSelectedCandidateId(res.candidate.id);
    return res.candidate;
  };

  const handleUpdateCandidate = async (id: number, payload: Record<string, any>) => {
    await apiFetch(`/api/talentiq/candidates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    await loadTalentIQData();
  };

  const handleReprocessCandidate = async (id: number) => {
    await apiFetch(`/api/talentiq/candidates/${id}/reprocess`, {
      method: 'POST',
    });
    await loadTalentIQData();
  };

  const handleAnalyseJob = async (payload: {
    rawDescription: string;
    jobTitle?: string;
    company?: string;
    location?: string;
    compensationInfo?: string;
  }) => {
    const res = await apiFetch<{ job: JobDescriptionFullRecord }>(
      '/api/talentiq/jobs/analyse',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    await loadTalentIQData();
    setSelectedJobId(res.job.id);
    return res.job;
  };

  const handleUpdateJob = async (id: number, payload: Record<string, any>) => {
    await apiFetch(`/api/talentiq/jobs/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    await loadTalentIQData();
  };

  const handleCreateRole = async (payload: any) => {
    await apiFetch('/api/talentiq/roles', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await loadTalentIQData();
  };

  const handleRunMatch = async (candidateId: number, jobId: number) => {
    const res = await apiFetch<{ match: MatchResultFullRecord }>(
      '/api/talentiq/matches/evaluate',
      {
        method: 'POST',
        body: JSON.stringify({ candidateId, jobId }),
      }
    );
    await loadTalentIQData();
    setSelectedMatchId(res.match.id);
    return res.match;
  };

  const handleUpdateWeights = async (
    newWeights: Omit<MatchingWeights, 'id' | 'configName' | 'updatedAt'>
  ) => {
    await apiFetch('/api/talentiq/weights', {
      method: 'PUT',
      body: JSON.stringify(newWeights),
    });
    await loadTalentIQData();
  };

  // CareerPilot Handlers
  const handleCreateClient = async (payload: Record<string, any>) => {
    await apiFetch('/api/clients', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await loadCareerPilotData();
  };

  const handleUploadClientResume = async (
    clientId: number,
    file: { filename: string; fileType: string; fileSize: number }
  ) => {
    await apiFetch(`/api/clients/${clientId}/resume`, {
      method: 'POST',
      body: JSON.stringify(file),
    });
    await loadCareerPilotData();
  };

  const handleCreateOpportunity = async (payload: Record<string, any>) => {
    await apiFetch('/api/opportunities', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await loadCareerPilotData();
  };

  const handleUpdateOpportunityStatus = async (
    opportunityId: number,
    status: PipelineStatus,
    notes?: string
  ) => {
    await apiFetch(`/api/opportunities/${opportunityId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
    await loadCareerPilotData();
  };

  const handleCreateTask = async (payload: Record<string, any>) => {
    await apiFetch('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await loadCareerPilotData();
  };

  const handleUpdateTaskStatus = async (taskId: number, status: string, internalNotes?: string) => {
    await apiFetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, internalNotes }),
    });
    await loadCareerPilotData();
  };

  const handleCreateDeliverable = async (payload: Record<string, any>) => {
    await apiFetch('/api/deliverables', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await loadCareerPilotData();
  };

  const handleUpdateDeliverableApproval = async (
    deliverableId: number,
    clientApprovalStatus: string
  ) => {
    await apiFetch(`/api/deliverables/${deliverableId}/approval`, {
      method: 'PATCH',
      body: JSON.stringify({ clientApprovalStatus }),
    });
    await loadCareerPilotData();
  };

  const handleCreateOutreach = async (payload: Record<string, any>) => {
    await apiFetch('/api/outreach', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await loadCareerPilotData();
  };

  const handleUpdateOutreach = async (activityId: number, payload: Record<string, any>) => {
    await apiFetch(`/api/outreach/${activityId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    await loadCareerPilotData();
  };

  const handleCreateInterview = async (payload: Record<string, any>) => {
    await apiFetch('/api/interviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await loadCareerPilotData();
  };

  const handleUpdateInterview = async (interviewId: number, payload: Record<string, any>) => {
    await apiFetch(`/api/interviews/${interviewId}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    await loadCareerPilotData();
  };

  const handleGenerateReport = async (payload: {
    clientId: number;
    reportPeriod: string;
    executiveSummary: string;
  }) => {
    await apiFetch('/api/reports', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await loadCareerPilotData();
  };

  const isCareerPilot = activePlatform === 'careerpilot';

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Left Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform lg:translate-x-0 lg:static ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                {isCareerPilot ? (
                  <Briefcase className="w-4 h-4" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
              </div>
              <div>
                <div className="text-sm font-bold tracking-tight text-slate-900 dark:text-white leading-none">
                  {isCareerPilot ? 'CareerPilot' : 'TalentIQ'}
                </div>
                <div className="text-[10px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  {isCareerPilot ? 'Executive Job Search CRM' : 'Resume & Matching AI'}
                </div>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links based on Active Project */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-190px)]">
            {isCareerPilot
              ? CAREERPILOT_NAV.map((item) => {
                  const Icon = item.icon;
                  const isActive = cpTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCpTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 text-white dark:bg-blue-600'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </span>
                      <span
                        className={`text-[10px] font-mono ${
                          isActive ? 'text-slate-300 dark:text-blue-200' : 'text-slate-400'
                        }`}
                      >
                        {item.code}
                      </span>
                    </button>
                  );
                })
              : TALENTIQ_NAV.map((item) => {
                  const Icon = item.icon;
                  const isActive = tiqPage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setTiqPage(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 text-white dark:bg-blue-600'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 truncate">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </span>
                      <span
                        className={`text-[10px] font-mono ${
                          isActive ? 'text-slate-300 dark:text-blue-200' : 'text-slate-400'
                        }`}
                      >
                        {item.moduleCode}
                      </span>
                    </button>
                  );
                })}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="truncate pr-2">
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {userProfile.fullName}
              </div>
              <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium truncate">
                {userProfile.roleName}
              </div>
            </div>
            <button
              onClick={signOut}
              title="Sign Out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Utility Bar with Unified Platform Switcher */}
        <header className="min-h-16 px-6 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
            >
              <Menu className="w-4 h-4" />
            </button>

            {/* Unified Project Switcher */}
            <div className="flex items-center rounded-lg p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs">
              <button
                onClick={() => handleSwitchPlatform('careerpilot')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  isCareerPilot
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                1. CareerPilot (Job Search CRM)
              </button>
              <button
                onClick={() => handleSwitchPlatform('talentiq')}
                className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                  !isCareerPilot
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                2. TalentIQ (Resume & Matching AI)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Active RBAC Role Switcher */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 hidden md:inline">Role:</span>
              {isCareerPilot ? (
                <select
                  value={userProfile.roleName}
                  onChange={(e) => switchRole(e.target.value as RoleName)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Client Delivery Owner">Client Delivery Owner</option>
                  <option value="Research Associate">Research Associate</option>
                  <option value="Client">Client</option>
                </select>
              ) : (
                <select
                  value={
                    ['Administrator', 'Recruitment Analyst', 'Delivery Manager'].includes(
                      userProfile.roleName
                    )
                      ? userProfile.roleName
                      : 'Administrator'
                  }
                  onChange={(e) => switchRole(e.target.value as RoleName)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white cursor-pointer"
                >
                  <option value="Administrator">Administrator</option>
                  <option value="Recruitment Analyst">Recruitment Analyst</option>
                  <option value="Delivery Manager">Delivery Manager</option>
                </select>
              )}
            </div>

            <button
              onClick={onToggleDarkMode}
              aria-label="Toggle theme"
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        {/* Active Project Workspace */}
        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {isCareerPilot ? (
            <>
              {cpTab === 'dashboard' && (
                <DashboardModule
                  data={cpDashboard}
                  loading={false}
                  onRefresh={loadCareerPilotData}
                  onNavigate={(mod) => setCpTab(mod as CareerPilotTab)}
                />
              )}
              {cpTab === 'clients' && (
                <ClientsModule
                  clients={cpClients}
                  userRole={userProfile.roleName as RoleName}
                  onOnboardClient={handleCreateClient}
                  onUploadResume={handleUploadClientResume}
                />
              )}
              {cpTab === 'pipeline' && (
                <PipelineModule
                  opportunities={cpOpportunities}
                  applications={cpApplications}
                  clients={cpClients}
                  userRole={userProfile.roleName as RoleName}
                  onCreateOpportunity={handleCreateOpportunity}
                  onUpdateStatus={handleUpdateOpportunityStatus}
                />
              )}
              {cpTab === 'delivery' && (
                <DeliveryModule
                  tasks={cpTasks}
                  deliverables={cpDeliverables}
                  activityLogs={cpActivities}
                  clients={cpClients}
                  userRole={userProfile.roleName as RoleName}
                  onCreateTask={handleCreateTask}
                  onUpdateTaskStatus={handleUpdateTaskStatus}
                  onCreateDeliverable={handleCreateDeliverable}
                  onUpdateDeliverableApproval={handleUpdateDeliverableApproval}
                />
              )}
              {cpTab === 'outreach' && (
                <OutreachModule
                  activities={cpOutreach}
                  clients={cpClients}
                  opportunities={cpOpportunities}
                  userRole={userProfile.roleName as RoleName}
                  onCreateOutreach={handleCreateOutreach}
                  onUpdateOutreach={handleUpdateOutreach}
                />
              )}
              {cpTab === 'interviews' && (
                <InterviewsModule
                  interviews={cpInterviews}
                  clients={cpClients}
                  userRole={userProfile.roleName as RoleName}
                  onCreateInterview={handleCreateInterview}
                  onUpdateInterview={handleUpdateInterview}
                />
              )}
              {cpTab === 'reports' && (
                <ReportsModule
                  reports={cpReports}
                  liveSnapshots={cpSnapshots}
                  userRole={userProfile.roleName as RoleName}
                  onGenerateReport={handleGenerateReport}
                />
              )}
            </>
          ) : (
            <>
              {tiqPage === 'dashboard' && (
                <DashboardView
                  data={tiqDashboard}
                  onNavigate={(tab) => setTiqPage(tab as TalentIQPage)}
                />
              )}

              {tiqPage === 'candidates' && (
                <CandidateManagementView
                  candidates={candidates}
                  onSelectCandidate={(id) => {
                    setSelectedCandidateId(id);
                    setTiqPage('candidate-profile');
                  }}
                  onNavigateUpload={() => setTiqPage('resume-upload')}
                />
              )}

              {tiqPage === 'resume-upload' && (
                <ResumeUploadView
                  onParseResume={handleParseResume}
                  onOpenCandidateProfile={(id) => {
                    setSelectedCandidateId(id);
                    setTiqPage('candidate-profile');
                  }}
                />
              )}

              {tiqPage === 'candidate-profile' && (
                <CandidateProfileView
                  candidates={candidates}
                  selectedCandidateId={selectedCandidateId}
                  onSelectCandidate={(id) => setSelectedCandidateId(id)}
                  onUpdateCandidate={handleUpdateCandidate}
                  onReprocessCandidate={handleReprocessCandidate}
                  onNavigateMatching={(cid) => {
                    setSelectedCandidateId(cid);
                    setTiqPage('matching');
                  }}
                />
              )}

              {tiqPage === 'jobs' && (
                <JobDescriptionView
                  jobs={jobs}
                  onAnalyseJob={handleAnalyseJob}
                  onUpdateJob={handleUpdateJob}
                  onMatchJob={(jid) => {
                    setSelectedJobId(jid);
                    setTiqPage('matching');
                  }}
                />
              )}

              {tiqPage === 'roles' && (
                <RoleExplorerView
                  roles={roles}
                  userRole={userProfile.roleName}
                  onCreateRole={handleCreateRole}
                />
              )}

              {tiqPage === 'matching' && (
                <MatchingEngineView
                  candidates={candidates}
                  jobs={jobs}
                  matches={matches}
                  weights={weights}
                  initialCandidateId={selectedCandidateId}
                  initialJobId={selectedJobId}
                  onRunMatch={handleRunMatch}
                  onInspectGap={(mid) => {
                    setSelectedMatchId(mid);
                    setTiqPage('skills-gap');
                  }}
                  onNavigateSettings={() => setTiqPage('settings')}
                />
              )}

              {tiqPage === 'comparison' && (
                <CandidateComparisonView
                  candidates={candidates}
                  jobs={jobs}
                  weights={weights}
                />
              )}

              {tiqPage === 'skills-gap' && (
                <SkillsGapView
                  matches={matches}
                  selectedMatchId={selectedMatchId}
                  onSelectMatch={(mid) => setSelectedMatchId(mid)}
                />
              )}

              {tiqPage === 'reports' && (
                <ReportsView candidates={candidates} matches={matches} />
              )}

              {tiqPage === 'settings' && (
                <SettingsAdminView
                  currentRole={userProfile.roleName}
                  weights={weights}
                  logs={logs}
                  onSwitchRole={async (r) => switchRole(r as RoleName)}
                  onUpdateWeights={handleUpdateWeights}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('talentiq_theme') === 'dark';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('talentiq_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('talentiq_theme', 'light');
    }
  }, [darkMode]);

  return (
    <AuthProvider>
      <MainWorkspace
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
      />
    </AuthProvider>
  );
}
