import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { ShieldCheck, ArrowRight, Sun, Moon } from 'lucide-react';

interface LoginViewProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  darkMode,
  onToggleDarkMode,
}) => {
  const { signInWithGoogle, authError, loading } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="flex items-center justify-between gap-8 px-8 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <a
          href="#top"
          className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100 font-display whitespace-nowrap shrink-0"
        >
          CareerPilot
        </a>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-400">
          <a
            href="#capabilities"
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            Capabilities
          </a>
          <a
            href="#architecture"
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            Architecture
          </a>
          <a
            href="#governance"
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            Governance
          </a>
          <a
            href="#reporting"
            className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            Reporting
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleDarkMode}
            aria-label="Toggle theme"
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Sign In to Workspace
          </button>
        </div>
      </header>

      {/* Main Split Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
        {/* Left Column: Value Proposition & Sign-In */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span>Executive Career Operations</span>
              <span aria-hidden="true">·</span>
              <span>C-Suite, CTO & VP Practice</span>
              <span aria-hidden="true">·</span>
              <span>PostgreSQL Cloud SQL Backed</span>
            </div>

            <h1
              className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-display leading-tight"
              style={{ textWrap: 'balance' }}
            >
              Executive Job Search & Client Delivery Management Platform
            </h1>

            <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
              Built for executive career advisory firms managing Director, VP, CTO, and
              Board-level technology transitions. Orchestrate client onboarding, target
              market mapping, hiring-manager outreach, panel preparation, and weekly
              board-grade client reporting from a single relational workspace.
            </p>
          </div>

          {/* Primary Sign-In Card */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-5 max-w-xl">
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Enterprise Workspace Authentication
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sign in with your Google account to access the live PostgreSQL executive
                cohort, switch RBAC roles, and manage client delivery workflows.
              </p>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-700 dark:text-red-300">
                {authError}
              </div>
            )}

            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-3 px-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{loading ? 'Synchronizing Session...' : 'Continue with Google Sign-In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span>Role-Based Access Control (4 Roles)</span>
              <span aria-hidden="true">·</span>
              <span>Simulated Executive Dataset Included</span>
            </div>
          </div>
        </div>

        {/* Right Column: Structured Module & Schema Overview */}
        <div
          id="capabilities"
          className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col justify-between space-y-6"
        >
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 font-display">
              01. Core Operational Modules
            </h2>
            <div className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
              <div className="py-3 space-y-1">
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  Executive Dashboard & Funnel Telemetry
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time conversion metrics, weekly application velocity, and team utilization computed directly from PostgreSQL.
                </p>
              </div>
              <div className="py-3 space-y-1">
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  Client Onboarding & Dossier Management
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Structured C-suite profiles, target compensation bands, and validated PDF/DOCX executive resume uploads.
                </p>
              </div>
              <div className="py-3 space-y-1">
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  8-Stage Job Search Kanban & Pipeline Table
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track opportunities from Identified and Shortlisted through Recruiter Contacted, Interview Scheduled, and Offer Received.
                </p>
              </div>
              <div className="py-3 space-y-1">
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  Hiring Manager Outreach CRM & Interview Prep
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Manage warm introductions, follow-up sequences, multi-round board panels, and downloadable PDF/CSV weekly reports.
                </p>
              </div>
            </div>
          </div>

          <div
            id="architecture"
            className="pt-4 border-t border-slate-200 dark:border-slate-800 grid grid-cols-3 gap-4 text-left"
          >
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                15
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Normalized SQL Tables
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                12
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Simulated C-Suite Clients
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                240+
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                Seeded Pipeline Records
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
