import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import type { RoleName } from '../types.ts';
import {
  ShieldCheck,
  ArrowRight,
  Sun,
  Moon,
  Sparkles,
  Briefcase,
  UserCheck,
} from 'lucide-react';

interface LoginViewProps {
  activePlatform: 'careerpilot' | 'talentiq';
  onSwitchPlatform: (platform: 'careerpilot' | 'talentiq') => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  activePlatform,
  onSwitchPlatform,
  darkMode,
  onToggleDarkMode,
}) => {
  const { signInEnterprise, authError, loading } = useAuth();
  const isCareerPilot = activePlatform === 'careerpilot';

  const [selectedRole, setSelectedRole] = useState<RoleName>('Administrator');

  const roleOptions: { role: RoleName; label: string; desc: string }[] = isCareerPilot
    ? [
        { role: 'Administrator', label: 'Administrator', desc: 'Full system & RBAC access' },
        { role: 'Client Delivery Owner', label: 'Client Delivery Owner', desc: 'Manage client portfolios & reports' },
        { role: 'Research Associate', label: 'Research Associate', desc: 'Map jobs & outreach CRM' },
        { role: 'Client', label: 'Executive Client', desc: 'Review deliverables & pipeline' },
      ]
    : [
        { role: 'Administrator', label: 'Administrator', desc: 'Full taxonomy & weight configuration' },
        { role: 'Recruitment Analyst', label: 'Recruitment Analyst', desc: 'Parse resumes & run 7-dim matching' },
        { role: 'Delivery Manager', label: 'Delivery Manager', desc: 'Candidate comparison & positioning' },
      ];

  const handleLaunchWorkspace = async () => {
    await signInEnterprise(selectedRole);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Unified Project Switcher Bar */}
      <div className="bg-slate-900 text-white px-6 py-3 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px]">
              Select Platform Workspace:
            </span>
            <button
              type="button"
              onClick={() => {
                onSwitchPlatform('careerpilot');
                setSelectedRole('Administrator');
              }}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                isCareerPilot
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>1. CareerPilot (Executive Job Search & Client Delivery)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onSwitchPlatform('talentiq');
                setSelectedRole('Administrator');
              }}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                !isCareerPilot
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>2. TalentIQ (AI Resume Intelligence & Job Matching)</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 hidden md:block">
            Unified Enterprise Hosting · PostgreSQL Cloud SQL Connected
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="flex flex-wrap items-center justify-between gap-4 px-8 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 font-display whitespace-nowrap shrink-0 flex items-center gap-2">
            {isCareerPilot ? (
              <>
                <Briefcase className="w-5 h-5 text-blue-600" />
                <span>CareerPilot</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span>TalentIQ</span>
              </>
            )}
          </div>
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {isCareerPilot
              ? 'Executive Job Search & Client Delivery Management Platform'
              : 'AI-Powered Executive Resume Intelligence & Job Matching Platform'}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label="Toggle theme"
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={handleLaunchWorkspace}
            disabled={loading}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Enter {isCareerPilot ? 'CareerPilot' : 'TalentIQ'} Workspace
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
          <div className="space-y-5">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              {isCareerPilot ? (
                <>
                  <span>Project 1: CareerPilot</span>
                  <span aria-hidden="true">·</span>
                  <span>C-Suite, CTO & VP Client Delivery</span>
                  <span aria-hidden="true">·</span>
                  <span>PostgreSQL Cloud SQL Backed</span>
                </>
              ) : (
                <>
                  <span>Project 2: TalentIQ</span>
                  <span aria-hidden="true">·</span>
                  <span>21-Role Taxonomy & 7-Dim Scorer</span>
                  <span aria-hidden="true">·</span>
                  <span>PostgreSQL Cloud SQL Backed</span>
                </>
              )}
            </div>

            <h1
              className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-display leading-tight"
              style={{ textWrap: 'balance' }}
            >
              {isCareerPilot
                ? 'CareerPilot – Executive Job Search & Client Delivery Management Platform'
                : 'TalentIQ – AI-Powered Executive Resume Intelligence & Job Matching Platform'}
            </h1>

            <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              {isCareerPilot
                ? 'Built for executive career advisory firms managing Director, VP, CTO, and Board-level technology transitions. Orchestrate client onboarding, target market mapping, 8-stage Kanban job pipelines, hiring-manager outreach CRM, interview preparation, and weekly client reporting.'
                : 'Engineered for executive recruitment and career advisory firms. Parse C-suite and VP technology resumes (PDF, DOCX, TXT), classify mandates across 21 technology leadership roles, execute explainable 7-dimension candidate-job matching, analyse skills gaps, and export board-ready dossiers.'}
            </p>
          </div>

          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-5 max-w-xl">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Access {isCareerPilot ? 'CareerPilot Workspace' : 'TalentIQ Workspace'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isCareerPilot
                  ? 'Select your operational RBAC role below and launch the live CareerPilot workspace (12 executive clients, 8-stage pipeline, outreach CRM, and weekly reports).'
                  : 'Select your operational RBAC role below and launch the live TalentIQ workspace (15 executive candidates, 30 job descriptions, 21 taxonomy roles, and 7-dimension matching).'}
              </p>
            </div>

            {/* Role Selection Grid */}
            <div className="space-y-2">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Active Enterprise Role (RBAC):
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {roleOptions.map((item) => {
                  const active = selectedRole === item.role;
                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => setSelectedRole(item.role)}
                      className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                        active
                          ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <UserCheck className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                        {item.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-700 dark:text-red-300">
                {authError}
              </div>
            )}

            <button
              type="button"
              onClick={handleLaunchWorkspace}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3.5 px-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {loading
                  ? 'Synchronizing PostgreSQL Session...'
                  : `Launch ${isCareerPilot ? 'CareerPilot' : 'TalentIQ'} as ${selectedRole}`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col justify-between space-y-6">
          {isCareerPilot ? (
            <>
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 font-display">
                  Project 1: CareerPilot Modules
                </h2>
                <div className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                  <div className="py-3 space-y-1">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      Executive Dashboard & Funnel Telemetry
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Real-time conversion metrics, weekly application velocity, and team workload from PostgreSQL.
                    </p>
                  </div>
                  <div className="py-3 space-y-1">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      Client Onboarding & Dossier Management
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Structured C-suite profiles, compensation bands, and validated PDF/DOCX resume uploads.
                    </p>
                  </div>
                  <div className="py-3 space-y-1">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      8-Stage Job Search Kanban & Outreach CRM
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Track opportunities from Identified to Offer Received, plus Hiring Manager outreach and interviews.
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-4 text-left">
                <div>
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                    15
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">SQL Tables</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                    12
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">C-Suite Clients</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                    7
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Enterprise Modules</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 font-display">
                  Project 2: TalentIQ Modules
                </h2>
                <div className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                  <div className="py-3 space-y-1">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      Resume Intelligence & Fact-Grounded Positioning
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Upload PDF, DOCX, or TXT resumes to extract verified career history and AI positioning advice.
                    </p>
                  </div>
                  <div className="py-3 space-y-1">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      21-Role Technology Classification Taxonomy
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Spans Executive Leadership (CTO, CIO, CDO, CPTO), Engineering, Architecture, Data, and Infra.
                    </p>
                  </div>
                  <div className="py-3 space-y-1">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      7-Dimension Matching, Comparison & Skills Gap
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Configurable 25/20/15/15/10/10/5 weights, side-by-side comparison, and PDF/CSV reports.
                    </p>
                  </div>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-4 text-left">
                <div>
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                    15
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Exec Candidates</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                    30
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Job Mandates</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                    21
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Taxonomy Roles</div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};
