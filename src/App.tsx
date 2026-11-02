/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { LoginView } from './components/LoginView.tsx';
import { DashboardModule } from './components/DashboardModule.tsx';
import { ClientsModule } from './components/ClientsModule.tsx';
import { PipelineModule } from './components/PipelineModule.tsx';
import { DeliveryModule } from './components/DeliveryModule.tsx';
import { OutreachModule } from './components/OutreachModule.tsx';
import { InterviewsModule } from './components/InterviewsModule.tsx';
import { ReportsModule } from './components/ReportsModule.tsx';
import {
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
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FolderKanban,
  Send,
  CalendarCheck,
  FileBarChart,
  Sun,
  Moon,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

type ActiveModule =
  | 'dashboard'
  | 'clients'
  | 'pipeline'
  | 'delivery'
  | 'outreach'
  | 'interviews'
  | 'reports';

const MODULE_META: Record<
  ActiveModule,
  { label: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }
> = {
  dashboard: {
    label: 'Executive Dashboard',
    subtitle: 'Real-time C-suite search conversion metrics, weekly velocity, and advisory workload',
    icon: LayoutDashboard,
  },
  clients: {
    label: 'Client Onboarding & Profiles',
    subtitle: 'Manage executive cohorts, career objectives, compensation bands, and PDF/DOCX resumes',
    icon: Users,
  },
  pipeline: {
    label: 'Job Search Pipeline',
    subtitle: '8-stage executive Kanban board, role fit scoring, and application stage history',
    icon: Briefcase,
  },
  delivery: {
    label: 'Client Delivery Management',
    subtitle: 'Account manager assignments, SLA tasks, deliverable approvals, and activity timeline',
    icon: FolderKanban,
  },
  outreach: {
    label: 'Hiring Manager Outreach CRM',
    subtitle: 'Decision-maker outreach tracking, warm introductions, follow-ups, and panel referrals',
    icon: Send,
  },
  interviews: {
    label: 'Interview Tracking',
    subtitle: 'Multi-round executive panel scheduling, briefing dossiers, debrief feedback, and offers',
    icon: CalendarCheck,
  },
  reports: {
    label: 'Client Progress Reports',
    subtitle: 'Weekly executive delivery snapshots calculated from PostgreSQL with PDF & CSV export',
    icon: FileBarChart,
  },
};

function WorkspaceContent({
  darkMode,
  onToggleDarkMode,
}: {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}) {
  const {
    firebaseUser,
    userProfile,
    loading: authLoading,
    signOut,
    switchRole,
    apiFetch,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveModule>('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [dataLoading, setDataLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  const [dashboardData, setDashboardData] = useState<DashboardAnalyticsData | null>(null);
  const [clients, setClients] = useState<ExecutiveClient[]>([]);
  const [opportunities, setOpportunities] = useState<JobOpportunity[]>([]);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [tasks, setTasks] = useState<DeliveryTaskItem[]>([]);
  const [deliverables, setDeliverables] = useState<DeliverableItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [outreachActivities, setOutreachActivities] = useState<OutreachActivityRecord[]>([]);
  const [interviews, setInterviews] = useState<InterviewRecordItem[]>([]);
  const [reports, setReports] = useState<ClientReportItem[]>([]);
  const [liveSnapshots, setLiveSnapshots] = useState<LiveClientSnapshot[]>([]);

  const loadAllWorkspaceData = useCallback(async () => {
    if (!firebaseUser) return;
    try {
      setDataLoading(true);
      setErrorBanner(null);

      const [
        dashRes,
        clientsRes,
        pipelineRes,
        deliveryRes,
        outreachRes,
        interviewsRes,
        reportsRes,
      ] = await Promise.all([
        apiFetch<DashboardAnalyticsData>('/api/dashboard'),
        apiFetch<{ clients: ExecutiveClient[] }>('/api/clients'),
        apiFetch<{ opportunities: JobOpportunity[]; applications: ApplicationRecord[] }>(
          '/api/pipeline?pageSize=100'
        ),
        apiFetch<{
          tasks: DeliveryTaskItem[];
          deliverables: DeliverableItem[];
          activityLogs: ActivityLogItem[];
        }>('/api/delivery'),
        apiFetch<{ activities: OutreachActivityRecord[] }>('/api/outreach'),
        apiFetch<{ interviews: InterviewRecordItem[] }>('/api/interviews'),
        apiFetch<{ reports: ClientReportItem[]; liveSnapshots: LiveClientSnapshot[] }>(
          '/api/reports'
        ),
      ]);

      setDashboardData(dashRes);
      setClients(clientsRes.clients);
      setOpportunities(pipelineRes.opportunities);
      setApplications(pipelineRes.applications);
      setTasks(deliveryRes.tasks);
      setDeliverables(deliveryRes.deliverables);
      setActivityLogs(deliveryRes.activityLogs);
      setOutreachActivities(outreachRes.activities);
      setInterviews(interviewsRes.interviews);
      setReports(reportsRes.reports);
      setLiveSnapshots(reportsRes.liveSnapshots);
    } catch (err: any) {
      console.error('Error loading workspace data:', err);
      setErrorBanner(err.message || 'Failed to load workspace records from PostgreSQL');
    } finally {
      setDataLoading(false);
    }
  }, [firebaseUser, apiFetch]);

  useEffect(() => {
    if (firebaseUser) {
      loadAllWorkspaceData();
    }
  }, [firebaseUser, loadAllWorkspaceData]);

  if (!firebaseUser) {
    return <LoginView darkMode={darkMode} onToggleDarkMode={onToggleDarkMode} />;
  }

  const currentRole: RoleName = userProfile?.roleName || 'Administrator';

  // CRUD Handlers wired to PostgreSQL Backend APIs
  const handleOnboardClient = async (payload: any) => {
    await apiFetch('/api/clients', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await loadAllWorkspaceData();
  };

  const handleUploadResume = async (
    clientId: number,
    fileData: { filename: string; fileType: string; fileSize: number }
  ) => {
    await apiFetch(`/api/clients/${clientId}/resume`, {
      method: 'POST',
      body: JSON.stringify(fileData),
    });
    await loadAllWorkspaceData();
  };

  const handleCreateOpportunity = async (payload: any) => {
    await apiFetch('/api/opportunities', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await loadAllWorkspaceData();
  };

  const handleUpdateOpportunityStatus = async (
    oppId: number,
    status: PipelineStatus,
    notes?: string
  ) => {
    await apiFetch(`/api/opportunities/${oppId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes }),
    });
    await loadAllWorkspaceData();
  };

  const handleCreateTask = async (payload: any) => {
    await apiFetch('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await loadAllWorkspaceData();
  };

  const handleUpdateTaskStatus = async (
    taskId: number,
    status: string,
    internalNotes?: string
  ) => {
    await apiFetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, internalNotes }),
    });
    await loadAllWorkspaceData();
  };

  const handleCreateDeliverable = async (payload: any) => {
    await apiFetch('/api/deliverables', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await loadAllWorkspaceData();
  };

  const handleUpdateDeliverableApproval = async (
    deliverableId: number,
    clientApprovalStatus: string
  ) => {
    await apiFetch(`/api/deliverables/${deliverableId}/approval`, {
      method: 'PATCH',
      body: JSON.stringify({ clientApprovalStatus }),
    });
    await loadAllWorkspaceData();
  };

  const handleCreateOutreach = async (payload: any) => {
    await apiFetch('/api/outreach', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await loadAllWorkspaceData();
  };

  const handleUpdateOutreach = async (activityId: number, updates: any) => {
    await apiFetch(`/api/outreach/${activityId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    await loadAllWorkspaceData();
  };

  const handleCreateInterview = async (payload: any) => {
    await apiFetch('/api/interviews', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    await loadAllWorkspaceData();
  };

  const handleUpdateInterview = async (interviewId: number, updates: any) => {
    await apiFetch(`/api/interviews/${interviewId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
    await loadAllWorkspaceData();
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
    await loadAllWorkspaceData();
  };

  const navOrder: ActiveModule[] = [
    'dashboard',
    'clients',
    'pipeline',
    'delivery',
    'outreach',
    'interviews',
    'reports',
  ];

  const activeModuleMeta = MODULE_META[activeTab];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Desktop Left Sidebar (260px Width) */}
      <aside className="hidden lg:flex lg:flex-col w-[264px] shrink-0 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 justify-between">
        <div className="p-5 space-y-6">
          {/* Brand Wordmark */}
          <div className="flex items-center justify-between px-2">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 font-display whitespace-nowrap">
              CareerPilot
            </span>
            <span className="text-[11px] font-mono text-slate-400">Enterprise</span>
          </div>

          {/* Primary Navigation */}
          <nav className="space-y-1" aria-label="Workspace Modules">
            {navOrder.map((modKey) => {
              const item = MODULE_META[modKey];
              const Icon = item.icon;
              const isActive = activeTab === modKey;
              return (
                <button
                  key={modKey}
                  type="button"
                  onClick={() => setActiveTab(modKey)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Role-Based Access Control (RBAC) Switcher & Account Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-950/30">
          <div className="space-y-1">
            <label
              htmlFor="rbac-role-select"
              className="block text-[11px] font-medium text-slate-500 dark:text-slate-400"
            >
              Active RBAC Role
            </label>
            <select
              id="rbac-role-select"
              value={currentRole}
              onChange={(e) => switchRole(e.target.value as RoleName)}
              className="w-full px-2.5 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 cursor-pointer"
            >
              <option value="Administrator">Administrator (Full Access)</option>
              <option value="Client Delivery Owner">Client Delivery Owner</option>
              <option value="Research Associate">Research Associate</option>
              <option value="Client">Client (Executive Portal)</option>
            </select>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                {userProfile?.fullName || firebaseUser.displayName || 'Executive Partner'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {userProfile?.email || firebaseUser.email}
              </div>
            </div>
            <button
              type="button"
              onClick={signOut}
              title="Sign Out"
              className="p-1.5 text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar Contract for SaaS Workspace: Breadcrumb Trail on left, Primary Controls on right */}
        <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileNavOpen(!mobileNavOpen)}
              className="lg:hidden p-1.5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-lg"
            >
              {mobileNavOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 truncate">
              <span className="font-medium text-slate-700 dark:text-slate-300">
                CareerPilot
              </span>
              <span aria-hidden="true">/</span>
              <span>{currentRole}</span>
              <span aria-hidden="true">/</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                {activeModuleMeta.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onToggleDarkMode}
              aria-label="Toggle Light/Dark Theme"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              <span>{darkMode ? 'Light' : 'Dark'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('reports')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Weekly Client Reports
            </button>
          </div>
        </header>

        {/* Mobile Drawer Navigation */}
        {mobileNavOpen && (
          <div className="lg:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 space-y-1">
            {navOrder.map((modKey) => {
              const item = MODULE_META[modKey];
              return (
                <button
                  key={modKey}
                  type="button"
                  onClick={() => {
                    setActiveTab(modKey);
                    setMobileNavOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg ${
                    activeTab === modKey
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Viewport Container */}
        <main className="flex-1 p-6 lg:p-8 max-w-[1440px] w-full mx-auto space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-display">
                {activeModuleMeta.label}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {activeModuleMeta.subtitle}
              </p>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              {clients.length} Clients · {opportunities.length} Opportunities ·{' '}
              {applications.length} Applications
            </div>
          </div>

          {errorBanner && (
            <div className="p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl flex items-center justify-between text-xs text-red-700 dark:text-red-300">
              <span>{errorBanner}</span>
              <button
                type="button"
                onClick={loadAllWorkspaceData}
                className="px-3 py-1 bg-red-600 text-white font-semibold rounded-md cursor-pointer"
              >
                Retry
              </button>
            </div>
          )}

          {/* Active Module Render */}
          {activeTab === 'dashboard' && (
            <DashboardModule
              data={dashboardData}
              loading={dataLoading || authLoading}
              onRefresh={loadAllWorkspaceData}
              onNavigate={(tab) => setActiveTab(tab as ActiveModule)}
            />
          )}

          {activeTab === 'clients' && (
            <ClientsModule
              clients={clients}
              userRole={currentRole}
              onOnboardClient={handleOnboardClient}
              onUploadResume={handleUploadResume}
            />
          )}

          {activeTab === 'pipeline' && (
            <PipelineModule
              opportunities={opportunities}
              applications={applications}
              clients={clients}
              userRole={currentRole}
              onCreateOpportunity={handleCreateOpportunity}
              onUpdateStatus={handleUpdateOpportunityStatus}
            />
          )}

          {activeTab === 'delivery' && (
            <DeliveryModule
              tasks={tasks}
              deliverables={deliverables}
              activityLogs={activityLogs}
              clients={clients}
              userRole={currentRole}
              onCreateTask={handleCreateTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onCreateDeliverable={handleCreateDeliverable}
              onUpdateDeliverableApproval={handleUpdateDeliverableApproval}
            />
          )}

          {activeTab === 'outreach' && (
            <OutreachModule
              activities={outreachActivities}
              clients={clients}
              opportunities={opportunities}
              userRole={currentRole}
              onCreateOutreach={handleCreateOutreach}
              onUpdateOutreach={handleUpdateOutreach}
            />
          )}

          {activeTab === 'interviews' && (
            <InterviewsModule
              interviews={interviews}
              clients={clients}
              userRole={currentRole}
              onCreateInterview={handleCreateInterview}
              onUpdateInterview={handleUpdateInterview}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsModule
              reports={reports}
              liveSnapshots={liveSnapshots}
              userRole={currentRole}
              onGenerateReport={handleGenerateReport}
            />
          )}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <AuthProvider>
      <WorkspaceContent
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode((prev) => !prev)}
      />
    </AuthProvider>
  );
}
