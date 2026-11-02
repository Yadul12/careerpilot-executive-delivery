import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  ClientReportItem,
  LiveClientSnapshot,
  RoleName,
} from '../types.ts';
import { Download, FileSpreadsheet, Plus, CheckCircle2 } from 'lucide-react';

interface ReportsModuleProps {
  reports: ClientReportItem[];
  liveSnapshots: LiveClientSnapshot[];
  userRole: RoleName;
  onGenerateReport: (payload: {
    clientId: number;
    reportPeriod: string;
    executiveSummary: string;
  }) => Promise<void>;
}

export const ReportsModule: React.FC<ReportsModuleProps> = ({
  reports,
  liveSnapshots,
  userRole,
  onGenerateReport,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<number>(
    liveSnapshots[0]?.clientId || 1
  );
  const [reportPeriod, setReportPeriod] = useState('Oct 26 – Nov 02, 2026');
  const [executiveSummary, setExecutiveSummary] = useState(
    'Strong executive funnel progression this week. Completed Wave 3 hiring-manager outreach and finalized board briefing dossier ahead of upcoming panel rounds.'
  );
  const [generating, setGenerating] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const activeSnapshot =
    liveSnapshots.find((s) => s.clientId === selectedClientId) || liveSnapshots[0];

  const handleDownloadPDF = (snapshot: LiveClientSnapshot) => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('CareerPilot — Weekly Executive Search Progress Report', 16, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Client: ${snapshot.clientName} (${snapshot.designation} at ${snapshot.employer})`, 16, 30);
    doc.text(`Delivery Lead: ${snapshot.ownerName} | Period: ${reportPeriod}`, 16, 36);
    doc.text('Data Notice: Calculated from live PostgreSQL records [SIMULATED COHORT]', 16, 42);

    doc.setDrawColor(200, 200, 200);
    doc.line(16, 46, 194, 46);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('1. Executive Funnel Summary', 16, 55);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const metrics = [
      `Opportunities Identified: ${snapshot.opportunitiesIdentified}`,
      `Roles Shortlisted: ${snapshot.rolesShortlisted}`,
      `Applications Submitted: ${snapshot.applicationsSubmitted}`,
      `Hiring-Manager Outreach Sent: ${snapshot.hiringManagerOutreach}`,
      `Decision-Maker Responses Received: ${snapshot.responsesReceived}`,
      `Executive Interviews Secured: ${snapshot.interviewsSecured}`,
    ];
    metrics.forEach((m, i) => {
      doc.text(`• ${m}`, 20, 64 + i * 7);
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('2. Upcoming Actions & Deadlines', 16, 114);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const actions =
      snapshot.upcomingActions.length > 0
        ? snapshot.upcomingActions
        : ['Continue hiring-manager warm intro sequence & panel prep'];
    actions.slice(0, 5).forEach((act, i) => {
      doc.text(`• ${act}`, 20, 122 + i * 7);
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('3. Pending Deliverables', 16, 162);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const delivs =
      snapshot.pendingDeliverables.length > 0
        ? snapshot.pendingDeliverables
        : ['All current program deliverables approved'];
    delivs.slice(0, 4).forEach((d, i) => {
      doc.text(`• ${d}`, 20, 170 + i * 7);
    });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('4. Advisory Executive Summary', 16, 205);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const splitSummary = doc.splitTextToSize(executiveSummary, 170);
    doc.text(splitSummary, 16, 213);

    const safeName = snapshot.clientName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    doc.save(`careerpilot_weekly_report_${safeName}.pdf`);
    setToastMsg(`Downloaded PDF report for ${snapshot.clientName}`);
  };

  const handleExportCSV = (snapshot?: LiveClientSnapshot) => {
    const rows = snapshot ? [snapshot] : liveSnapshots;
    const headers = [
      'Client ID',
      'Executive Name',
      'Designation',
      'Employer',
      'Delivery Owner',
      'Status',
      'Opportunities Identified',
      'Roles Shortlisted',
      'Applications Submitted',
      'Hiring Manager Outreach',
      'Responses Received',
      'Interviews Secured',
      'Pending Deliverables',
    ];

    const csvLines = [
      headers.join(','),
      ...rows.map((r) =>
        [
          r.clientId,
          `"${r.clientName}"`,
          `"${r.designation}"`,
          `"${r.employer}"`,
          `"${r.ownerName}"`,
          `"${r.status}"`,
          r.opportunitiesIdentified,
          r.rolesShortlisted,
          r.applicationsSubmitted,
          r.hiringManagerOutreach,
          r.responsesReceived,
          r.interviewsSecured,
          `"${r.pendingDeliverables.join('; ')}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvLines], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = snapshot
      ? `careerpilot_report_${snapshot.clientName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.csv`
      : 'careerpilot_all_executive_reports.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToastMsg('Exported CSV client report data');
  };

  const handleGenerateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGenerating(true);
      await onGenerateReport({
        clientId: selectedClientId,
        reportPeriod,
        executiveSummary,
      });
      setToastMsg('Saved new weekly progress report to PostgreSQL');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Selector & Export Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex flex-wrap items-center gap-3">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">
            Select Executive Client:
          </label>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(Number(e.target.value))}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-medium"
          >
            {liveSnapshots.map((s) => (
              <option key={s.clientId} value={s.clientId}>
                {s.clientName} — {s.designation} ({s.employer})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {activeSnapshot && (
            <button
              type="button"
              onClick={() => handleDownloadPDF(activeSnapshot)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Export Executive PDF</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => handleExportCSV(activeSnapshot)}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Client CSV</span>
          </button>
          <button
            type="button"
            onClick={() => handleExportCSV()}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Export Cohort CSV</span>
          </button>
        </div>
      </div>

      {/* Live Client Report Preview + Report Generator */}
      {activeSnapshot && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 8 Columns: Live Executive Progress Report Dossier */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  Weekly Executive Progress Report · Live PostgreSQL Calculation
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 font-display mt-0.5">
                  {activeSnapshot.clientName} — {activeSnapshot.designation}
                </h2>
              </div>
              <div className="text-xs font-mono tabular-nums text-slate-500">
                Period: {reportPeriod}
              </div>
            </div>

            {/* 6 Core Report Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="text-xs text-slate-500">Opportunities Identified</div>
                <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                  {activeSnapshot.opportunitiesIdentified}
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="text-xs text-slate-500">Roles Shortlisted</div>
                <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                  {activeSnapshot.rolesShortlisted}
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="text-xs text-slate-500">Applications Submitted</div>
                <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
                  {activeSnapshot.applicationsSubmitted}
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="text-xs text-slate-500">Hiring-Manager Outreach</div>
                <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
                  {activeSnapshot.hiringManagerOutreach}
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="text-xs text-slate-500">Responses Received</div>
                <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                  {activeSnapshot.responsesReceived}
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="text-xs text-slate-500">Interviews Secured</div>
                <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
                  {activeSnapshot.interviewsSecured}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-xs">
              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Upcoming Actions & Next Milestones
                </h3>
                {activeSnapshot.upcomingActions.length > 0 ? (
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
                    {activeSnapshot.upcomingActions.map((act, idx) => (
                      <li key={idx}>• {act}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500">
                    All immediate tasks complete. Continuing weekly hiring-manager outreach cadence.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                  Pending Deliverables & Client Sign-Offs
                </h3>
                {activeSnapshot.pendingDeliverables.length > 0 ? (
                  <ul className="space-y-1.5 text-slate-600 dark:text-slate-300">
                    {activeSnapshot.pendingDeliverables.map((deliv, idx) => (
                      <li key={idx}>• {deliv}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-emerald-600 dark:text-emerald-400">
                    All current milestone deliverables approved by client.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right 4 Columns: Publish & Archive Report Snapshot */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 font-display">
              Publish Weekly Report Snapshot
            </h3>
            <form onSubmit={handleGenerateSnapshot} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Reporting Period</label>
                <input
                  type="text"
                  value={reportPeriod}
                  onChange={(e) => setReportPeriod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">
                  Executive Advisory Commentary
                </label>
                <textarea
                  rows={4}
                  value={executiveSummary}
                  onChange={(e) => setExecutiveSummary(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                />
              </div>
              {userRole !== 'Client' && (
                <button
                  type="submit"
                  disabled={generating}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {generating ? 'Publishing Snapshot...' : 'Archive Weekly Report to DB'}
                  </span>
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Historical Archived Reports Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 font-display">
            Published Weekly Client Reports Archive ({reports.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 bg-slate-50/60 dark:bg-slate-950/40">
                <th className="py-3 px-4">Executive Client</th>
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4 text-right">Identified</th>
                <th className="py-3 px-4 text-right">Applied</th>
                <th className="py-3 px-4 text-right">Outreach</th>
                <th className="py-3 px-4 text-right">Interviews</th>
                <th className="py-3 px-4">Executive Summary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {reports.map((rep) => (
                <tr key={rep.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">
                    {rep.clientName}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums text-slate-600 dark:text-slate-400">
                    {rep.reportPeriod}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {rep.opportunitiesIdentified}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {rep.applicationsSubmitted}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {rep.outreachSent} ({rep.responsesReceived} replies)
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                    {rep.interviewsSecured}
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-md truncate">
                    {rep.executiveSummary}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
