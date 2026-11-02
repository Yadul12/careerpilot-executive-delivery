import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Cell,
} from 'recharts';
import {
  Users,
  FileText,
  Briefcase,
  Target,
  Award,
  TrendingUp,
  Layers,
  AlertTriangle,
  Compass,
  ArrowUpRight,
} from 'lucide-react';
import type { TalentIQDashboardData } from '../../types_talentiq.ts';

interface DashboardViewProps {
  data: TalentIQDashboardData | null;
  onNavigate: (tab: string) => void;
}

const CHART_COLORS = ['#0f172a', '#2563eb', '#0284c7', '#4f46e5', '#0d9488', '#64748b'];

export const DashboardView: React.FC<DashboardViewProps> = ({ data, onNavigate }) => {
  if (!data) {
    return (
      <div className="p-8 text-sm text-slate-500 dark:text-slate-400">
        Loading TalentIQ executive telemetry from PostgreSQL...
      </div>
    );
  }

  const { kpis, charts } = data;

  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Module A · Live PostgreSQL Telemetry
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Executive Talent & Matching Intelligence Overview
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Real-time analytics across analysed C-suite & VP resumes, role taxonomy mandates, hybrid semantic matches, and skill gap vectors.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('resume-upload')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            Parse Executive Resume
          </button>
          <button
            onClick={() => onNavigate('matching')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Target className="w-3.5 h-3.5" />
            Run Match Engine
          </button>
        </div>
      </div>

      {/* 6 Primary Numeric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div
          onClick={() => onNavigate('candidates')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-blue-500/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Candidates Analysed</span>
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {kpis.totalCandidatesAnalysed}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
              C-Suite / VP <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('resume-upload')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-blue-500/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Resumes Uploaded</span>
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {kpis.totalResumesUploaded}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">PDF · DOCX · TXT</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('jobs')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-blue-500/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Job Mandates Processed</span>
            <Briefcase className="w-4 h-4 text-sky-600 dark:text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {kpis.totalJobDescriptionsProcessed}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">5 Role Domains</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('matching')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-blue-500/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Candidate-Job Matches</span>
            <Target className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {kpis.totalCandidateJobMatches}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">7-Dim Scored</span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('matching')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-blue-500/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>High-Confidence (≥82%)</span>
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {kpis.highConfidenceMatches}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
              {kpis.totalCandidateJobMatches > 0
                ? `${Math.round((kpis.highConfidenceMatches / kpis.totalCandidateJobMatches) * 100)}% of pool`
                : '0%'}
            </span>
          </div>
        </div>

        <div
          onClick={() => onNavigate('comparison')}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:border-blue-500/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Average Match Score</span>
            <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {kpis.averageMatchingScore}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Composite Index</span>
          </div>
        </div>
      </div>

      {/* 3 Qualitative Intelligence Summary Cards (Specialisations, Recommended Positions, Missing Skill Trends) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Most Common Technical Specialisations
            </h2>
            <span className="text-xs text-slate-400 tabular-nums">Verified Skills</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {kpis.topTechnicalSpecialisations.map((item, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate pr-3">
                  {item.name}
                </span>
                <span className="font-semibold tabular-nums text-slate-600 dark:text-slate-400 shrink-0">
                  {item.count} executives
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Most Recommended Executive Positions
            </h2>
            <span className="text-xs text-slate-400 tabular-nums">Target Fit</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {kpis.topRecommendedPositions.map((item, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate pr-3">
                  {item.position}
                </span>
                <span className="font-semibold tabular-nums text-indigo-600 dark:text-indigo-400 shrink-0">
                  {item.count} profiles
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Recurring Missing Skill Trends
            </h2>
            <span className="text-xs text-slate-400 tabular-nums">Gap Frequency</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {kpis.missingSkillTrends.map((item, idx) => (
              <div key={idx} className="py-2 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-800 dark:text-slate-200 truncate pr-3">
                  {item.skill}
                </span>
                <span className="font-semibold tabular-nums text-amber-600 dark:text-amber-400 shrink-0">
                  {item.count} mandates
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Charts Row 1: Experience Distribution & Technology Domain Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Candidate Distribution by Leadership Tenure
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Years of senior technology & engineering management experience across analysed pool
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.experienceDistribution} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="bracket" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    color: '#f8fafc',
                    fontSize: '12px',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="candidates" name="Executives" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Candidate Distribution by Technology Domain
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Primary architectural & operational domain specialization of executive roster
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={charts.domainDistribution}
                layout="vertical"
                margin={{ top: 4, right: 20, left: 30, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis
                  type="category"
                  dataKey="domain"
                  width={150}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    color: '#f8fafc',
                    fontSize: '12px',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="candidates" name="Candidates" radius={[0, 6, 6, 0]}>
                  {charts.domainDistribution.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Interactive Charts Row 2: Jobs by Role Category, Matching Score Distribution, Monthly Analysis Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Job Opportunities by Role Category
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active executive mandates classified across the 5 taxonomy domains
            </p>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.jobsByCategory} margin={{ top: 8, right: 12, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="category"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-15}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    color: '#f8fafc',
                    fontSize: '12px',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="jobs" name="Open Mandates" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Candidate-Job Matching Score Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Spread of 7-dimension weighted composite scores (0–100 scale)
            </p>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.scoreDistribution} margin={{ top: 8, right: 12, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="range"
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  angle={-12}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    color: '#f8fafc',
                    fontSize: '12px',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="matches" name="Evaluated Pairs" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Monthly Resume Analysis & Match Velocity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Monthly ingestion of executive resumes and high-confidence fits
            </p>
          </div>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.monthlyAnalysisTrends} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    color: '#f8fafc',
                    fontSize: '12px',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="highConfidenceMatches"
                  name="High-Confidence Matches"
                  stroke="#0d9488"
                  fill="#0d9488"
                  fillOpacity={0.18}
                />
                <Area
                  type="monotone"
                  dataKey="resumesAnalysed"
                  name="Resumes Analysed"
                  stroke="#2563eb"
                  fill="#2563eb"
                  fillOpacity={0.25}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
