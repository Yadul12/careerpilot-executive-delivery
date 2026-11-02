import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { DashboardAnalyticsData } from '../types.ts';
import { ArrowUpRight, AlertTriangle, RefreshCw } from 'lucide-react';

interface DashboardModuleProps {
  data: DashboardAnalyticsData | null;
  loading: boolean;
  onRefresh: () => void;
  onNavigate: (tab: string) => void;
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  data,
  loading,
  onRefresh,
  onNavigate,
}) => {
  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, idx) => (
            <div
              key={idx}
              className="h-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 animate-pulse"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 animate-pulse" />
          <div className="h-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 animate-pulse" />
        </div>
      </div>
    );
  }

  const {
    kpis,
    weeklyTrends,
    funnelData,
    clientPerformance,
    teamWorkload,
    monthlyDelivery,
    recentActivity,
  } = data;

  return (
    <div className="space-y-8">
      {/* Simulation Transparency Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="space-y-0.5">
          <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
            Live PostgreSQL Telemetry · Simulated Executive Cohort Active
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            All KPIs, funnel conversions, and team utilization metrics below are dynamically calculated from PostgreSQL database records. Synthetic cohort records are labelled [SIMULATED].
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Recalculate Metrics</span>
        </button>
      </div>

      {/* 10 Executive KPI Cards (2 rows of 5 on Desktop) */}
      <section aria-label="Executive Key Performance Indicators" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">Total Active Clients</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
              {kpis.totalActiveClients}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              of {kpis.totalClients} total
            </span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">New Client Onboardings</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
              {kpis.newClientOnboardings}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400">
              Q4 Cohort
            </span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">Active Search Programs</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
              {kpis.activePrograms}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Retainer & CTO
            </span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">Opportunities Identified</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
              {kpis.totalOpportunities}
            </span>
            <button
              type="button"
              onClick={() => onNavigate('pipeline')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
            >
              <span>Pipeline</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">Applications Submitted</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
              {kpis.applicationsSubmitted}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              /{kpis.totalApplicationsRecords} tracked
            </span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">Hiring-Manager Outreach</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
              {kpis.hiringManagerOutreach}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
              {kpis.outreachReplyRate}% reply rate
            </span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">Interviews Secured</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
              {kpis.interviewsSecured}
            </span>
            <button
              type="button"
              onClick={() => onNavigate('interviews')}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5 cursor-pointer"
            >
              <span>View Rounds</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">Client Conversion Rate</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
              {kpis.clientConversionRate}%
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              {kpis.appToInterviewRate}% app-to-int
            </span>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">Overdue Deliverables & Tasks</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-red-600 dark:text-red-400 font-mono tabular-nums">
              {kpis.overdueDeliverables}
            </span>
            <button
              type="button"
              onClick={() => onNavigate('delivery')}
              className="text-xs text-red-600 dark:text-red-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Resolve ({kpis.overdueDeliverablesOnly} deliv)</span>
            </button>
          </div>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">Advisory Team Workload</div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
              {teamWorkload.length}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              Avg {Math.round(teamWorkload.reduce((s, m) => s + m.utilizationPct, 0) / Math.max(1, teamWorkload.length))}% util
            </span>
          </div>
        </div>
      </section>

      {/* Row 1 of Interactive Charts: Weekly Application Trends & Job-Search Funnel */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 font-display">
                Weekly Application, Outreach & Interview Trends
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                8-week cohort velocity across executive search programs (W37–W44)
              </p>
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              n = {kpis.totalApplicationsRecords} applications
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrends} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    color: '#f8fafc',
                    fontSize: '12px',
                    borderRadius: '8px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area
                  type="monotone"
                  dataKey="applications"
                  name="Applications Logged"
                  stroke="#2563eb"
                  fill="#3b82f6"
                  fillOpacity={0.18}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="outreach"
                  name="HM Outreach Sent"
                  stroke="#0d9488"
                  fill="#14b8a6"
                  fillOpacity={0.14}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="interviews"
                  name="Interviews Secured"
                  stroke="#d97706"
                  fill="#f59e0b"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 font-display">
                Executive Job-Search Conversion Funnel
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Stage distribution from role identification to executive offer
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={funnelData}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 24, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis
                  type="category"
                  dataKey="stage"
                  width={125}
                  tick={{ fontSize: 11 }}
                  stroke="#64748b"
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
                <Bar
                  dataKey="count"
                  name="Pipeline Records"
                  fill="#2563eb"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Row 2 of Interactive Charts: Client-Wise Performance & Monthly Delivery Performance */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 font-display">
                Client-Wise Pipeline & Interview Conversion Performance
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Applications submitted vs. hiring-manager outreach and interviews secured per executive client
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={clientPerformance.slice(0, 8)}
                margin={{ top: 10, right: 16, left: -12, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis
                  dataKey="clientName"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  stroke="#64748b"
                />
                <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    color: '#f8fafc',
                    fontSize: '12px',
                    borderRadius: '8px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="applications" name="Applications" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="outreach" name="HM Outreach" fill="#14b8a6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="interviews" name="Interviews" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-5 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 font-display">
              Monthly Delivery & Interview Conversion Cadence
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Cohort onboardings, approved deliverables, and executive interviews by month
            </p>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyDelivery} margin={{ top: 10, right: 16, left: -12, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#1e293b',
                    color: '#f8fafc',
                    fontSize: '12px',
                    borderRadius: '8px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="onboarded" name="Clients Onboarded" fill="#6366f1" radius={[3, 3, 0, 0]} />
                <Bar dataKey="deliverablesCompleted" name="Deliverables Completed" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="interviewsSecured" name="Interviews Secured" fill="#f59e0b" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Row 3: Internal Advisory Team Workload Table & Recent Executive Activity Log */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 font-display">
                Internal Team Workload & Capacity Allocation
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                5 internal practice members across C-Suite Delivery and Market Research
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/60 dark:bg-slate-950/40">
                  <th className="py-3 px-4">Team Member</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4 text-right">Clients</th>
                  <th className="py-3 px-4 text-right">Open Tasks</th>
                  <th className="py-3 px-4 text-right">Outreach</th>
                  <th className="py-3 px-4 text-right">Utilization</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                {teamWorkload.map((member) => (
                  <tr
                    key={member.userId}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center text-xs font-semibold font-mono shrink-0">
                          {member.avatarInitials}
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {member.fullName}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {member.designation}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
                      {member.roleName}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900 dark:text-slate-100">
                      {member.assignedClients}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900 dark:text-slate-100">
                      {member.openTasks}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900 dark:text-slate-100">
                      {member.outreachHandled}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums">
                      <span
                        className={
                          member.utilizationPct >= 85
                            ? 'text-amber-600 dark:text-amber-400 font-semibold'
                            : 'text-emerald-600 dark:text-emerald-400 font-semibold'
                        }
                      >
                        {member.utilizationPct}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Operational Activity Stream */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 font-display">
                Recent Executive Delivery Audit Log
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest PostgreSQL state transitions across client programs
              </p>
            </div>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-slate-800 flex-1 overflow-y-auto max-h-80">
            {recentActivity.map((log) => (
              <div key={log.id} className="px-6 py-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    <strong className="font-medium text-slate-800 dark:text-slate-200">
                      {log.actorName}
                    </strong>{' '}
                    · {log.actionType}
                  </span>
                  <span className="font-mono tabular-nums">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {log.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
