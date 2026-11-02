import React, { useState } from 'react';
import {
  JobOpportunity,
  ApplicationRecord,
  ExecutiveClient,
  PIPELINE_STATUSES,
  PipelineStatus,
  RoleName,
} from '../types.ts';
import {
  Search,
  Plus,
  LayoutGrid,
  Table as TableIcon,
  History,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';

interface PipelineModuleProps {
  opportunities: JobOpportunity[];
  applications: ApplicationRecord[];
  clients: ExecutiveClient[];
  userRole: RoleName;
  onCreateOpportunity: (payload: any) => Promise<void>;
  onUpdateStatus: (oppId: number, status: PipelineStatus, notes?: string) => Promise<void>;
}

export const PipelineModule: React.FC<PipelineModuleProps> = ({
  opportunities,
  applications,
  clients,
  userRole,
  onCreateOpportunity,
  onUpdateStatus,
}) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [search, setSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortField, setSortField] = useState<'company' | 'salaryMax' | 'fitScore'>('fitScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [showAddModal, setShowAddModal] = useState(false);
  const [historyOpp, setHistoryOpp] = useState<JobOpportunity | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [newOpp, setNewOpp] = useState({
    clientId: clients[0]?.id || 1,
    company: '',
    designation: 'Chief Technology Officer (CTO)',
    technologySpecialisation: 'AI Infrastructure & Distributed Cloud',
    salaryRange: '$460k – $640k + Equity',
    salaryMin: 460000,
    salaryMax: 640000,
    location: 'San Francisco, CA',
    workMode: 'Hybrid',
    jobDescription:
      'Executive mandate leading global platform engineering, AI compute reliability, and multi-year product architecture.',
    sourceUrl: 'https://careers.enterprise.sim/cto',
    fitScore: 93,
    status: 'Identified' as PipelineStatus,
  });

  const canModifyPipeline = userRole !== 'Client';

  // Filter & Sort
  const filteredOpps = opportunities
    .filter((o) => {
      const matchesClient =
        selectedClientId === 'All' || o.clientId === Number(selectedClientId);
      const matchesStatus = selectedStatus === 'All' || o.status === selectedStatus;
      const matchesSearch =
        !search ||
        o.company.toLowerCase().includes(search.toLowerCase()) ||
        o.designation.toLowerCase().includes(search.toLowerCase()) ||
        o.technologySpecialisation.toLowerCase().includes(search.toLowerCase()) ||
        o.clientName.toLowerCase().includes(search.toLowerCase()) ||
        o.location.toLowerCase().includes(search.toLowerCase());
      return matchesClient && matchesStatus && matchesSearch;
    })
    .sort((a, b) => {
      const mult = sortDir === 'asc' ? 1 : -1;
      if (sortField === 'company') return a.company.localeCompare(b.company) * mult;
      if (sortField === 'salaryMax') return (a.salaryMax - b.salaryMax) * mult;
      return (a.fitScore - b.fitScore) * mult;
    });

  const totalPages = Math.max(1, Math.ceil(filteredOpps.length / pageSize));
  const paginatedOpps = filteredOpps.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (field: 'company' | 'salaryMax' | 'fitScore') => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await onCreateOpportunity(newOpp);
      setShowAddModal(false);
      setNewOpp((prev) => ({ ...prev, company: '' }));
    } finally {
      setSubmitting(false);
    }
  };

  const linkedAppHistory = historyOpp
    ? applications.filter((a) => a.opportunityId === historyOpp.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Pipeline Control Bar */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search company, role, tech stack..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
            />
          </div>

          <select
            value={selectedClientId}
            onChange={(e) => {
              setSelectedClientId(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
          >
            <option value="All">All Executive Clients ({clients.length})</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName} — {c.currentDesignation}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200"
          >
            <option value="All">All 8 Pipeline Stages</option>
            {PIPELINE_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* View Toggle: Kanban vs Table */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban Board</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table View ({filteredOpps.length})</span>
            </button>
          </div>

          {canModifyPipeline && (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Opportunity</span>
            </button>
          )}
        </div>
      </div>

      {/* View 1: 8-Stage Executive Kanban Board */}
      {viewMode === 'kanban' ? (
        <div className="overflow-x-auto pb-4">
          <div className="grid grid-flow-col auto-cols-[290px] gap-4">
            {PIPELINE_STATUSES.map((stage) => {
              const stageItems = filteredOpps.filter((o) => o.status === stage);
              return (
                <div
                  key={stage}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col max-h-[720px]"
                >
                  <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {stage}
                    </h3>
                    <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      {stageItems.length}
                    </span>
                  </div>

                  <div className="p-3 divide-y divide-slate-200 dark:divide-slate-800 overflow-y-auto flex-1">
                    {stageItems.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        No roles in {stage}
                      </div>
                    ) : (
                      stageItems.map((opp) => (
                        <div key={opp.id} className="py-3 first:pt-0 last:pb-0 space-y-2">
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                              {opp.company}
                            </span>
                            <span className="text-xs font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
                              Fit {opp.fitScore}%
                            </span>
                          </div>

                          <div className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-snug">
                            {opp.designation}
                          </div>

                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            Client: <strong className="font-medium text-slate-700 dark:text-slate-300">{opp.clientName}</strong>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                            <span>{opp.salaryRange}</span>
                            <span aria-hidden="true">·</span>
                            <span>{opp.location}</span>
                          </div>

                          <div className="pt-1.5 flex items-center justify-between gap-2">
                            <select
                              aria-label={`Change status for ${opp.company}`}
                              value={opp.status}
                              onChange={(e) =>
                                onUpdateStatus(opp.id, e.target.value as PipelineStatus)
                              }
                              className="flex-1 px-2 py-1 text-[11px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-slate-700 dark:text-slate-300 cursor-pointer"
                            >
                              {PIPELINE_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  Move → {st}
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={() => setHistoryOpp(opp)}
                              title="View Stage & Offer/Rejection History"
                              className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 border border-slate-200 dark:border-slate-800 rounded cursor-pointer"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* View 2: Searchable, Sortable & Paginated Table View */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/60 dark:bg-slate-950/40">
                  <th className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => toggleSort('company')}
                      className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
                    >
                      <span>Company & Role</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4">Executive Client</th>
                  <th className="py-3 px-4">Specialisation</th>
                  <th className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSort('salaryMax')}
                      className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
                    >
                      <span>Compensation</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => toggleSort('fitScore')}
                      className="inline-flex items-center gap-1 hover:text-slate-900 dark:hover:text-slate-100 cursor-pointer"
                    >
                      <span>Fit</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3 px-4">Pipeline Stage</th>
                  <th className="py-3 px-4 text-right">History</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
                {paginatedOpps.map((opp) => (
                  <tr
                    key={opp.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {opp.company} · {opp.designation}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400">
                        {opp.location} · {opp.workMode}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {opp.clientName}
                      </div>
                      <div className="text-slate-500 dark:text-slate-400">
                        {opp.clientDesignation}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                      {opp.technologySpecialisation}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900 dark:text-slate-100">
                      {opp.salaryRange}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-emerald-600 dark:text-emerald-400">
                      {opp.fitScore}%
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={opp.status}
                        onChange={(e) =>
                          onUpdateStatus(opp.id, e.target.value as PipelineStatus)
                        }
                        className="px-2.5 py-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs font-medium cursor-pointer"
                      >
                        {PIPELINE_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setHistoryOpp(opp)}
                        className="px-2.5 py-1 text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer"
                      >
                        Inspect Log
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="font-mono tabular-nums">
              Showing {(page - 1) * pageSize + 1}–
              {Math.min(page * pageSize, filteredOpps.length)} of {filteredOpps.length} opportunities
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="p-1.5 border border-slate-200 dark:border-slate-800 rounded disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono tabular-nums">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 border border-slate-200 dark:border-slate-800 rounded disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Stage Transition, Rejection & Offer History */}
      {historyOpp && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-display">
                  {historyOpp.company} — {historyOpp.designation}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Client: {historyOpp.clientName} · Current Status: {historyOpp.status}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setHistoryOpp(null)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                  Executive Role Mandate Summary
                </div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {historyOpp.jobDescription}
                </p>
              </div>

              <div className="font-semibold text-slate-900 dark:text-slate-100">
                Application & Stage Transition History ({linkedAppHistory.length} records)
              </div>

              <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-60 overflow-y-auto">
                {linkedAppHistory.map((app) => {
                  let parsedStages: Array<{ stage: string; date: string; note: string }> = [];
                  try {
                    parsedStages = JSON.parse(app.stageHistory || '[]');
                  } catch {
                    parsedStages = [];
                  }
                  return (
                    <div key={app.id} className="py-2.5 space-y-1.5">
                      <div className="flex items-center justify-between font-medium">
                        <span>Resume: {app.resumeVersion}</span>
                        <span className="font-mono tabular-nums text-slate-500">
                          Applied {app.appliedDate}
                        </span>
                      </div>
                      {app.offerDetails && (
                        <div className="text-emerald-600 dark:text-emerald-400 font-semibold">
                          Offer Package: {app.offerDetails}
                        </div>
                      )}
                      {app.rejectionReason && (
                        <div className="text-red-600 dark:text-red-400">
                          Closure Note: {app.rejectionReason}
                        </div>
                      )}
                      <div className="space-y-1 pl-3 border-l border-slate-200 dark:border-slate-800">
                        {parsedStages.map((s, idx) => (
                          <div key={idx} className="text-slate-500 dark:text-slate-400">
                            <span className="font-mono tabular-nums">{s.date}</span> ·{' '}
                            <strong className="text-slate-700 dark:text-slate-300">
                              {s.stage}
                            </strong>{' '}
                            — {s.note}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Job Opportunity */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-display">
                Add Executive Job Opportunity
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">Assign to Executive Client *</label>
                  <select
                    value={newOpp.clientId}
                    onChange={(e) => setNewOpp({ ...newOpp, clientId: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  >
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.fullName} ({c.currentDesignation})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Target Company *</label>
                  <input
                    type="text"
                    required
                    value={newOpp.company}
                    onChange={(e) => setNewOpp({ ...newOpp, company: e.target.value })}
                    placeholder="e.g., OpenAI, Stripe, Databricks"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Executive Role Title *</label>
                  <input
                    type="text"
                    required
                    value={newOpp.designation}
                    onChange={(e) => setNewOpp({ ...newOpp, designation: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Technology Specialisation *</label>
                  <input
                    type="text"
                    required
                    value={newOpp.technologySpecialisation}
                    onChange={(e) =>
                      setNewOpp({ ...newOpp, technologySpecialisation: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Compensation Range</label>
                  <input
                    type="text"
                    value={newOpp.salaryRange}
                    onChange={(e) => setNewOpp({ ...newOpp, salaryRange: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Location & Work Mode</label>
                  <input
                    type="text"
                    value={newOpp.location}
                    onChange={(e) => setNewOpp({ ...newOpp, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Initial Pipeline Status</label>
                  <select
                    value={newOpp.status}
                    onChange={(e) =>
                      setNewOpp({ ...newOpp, status: e.target.value as PipelineStatus })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  >
                    {PIPELINE_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Executive Fit Score (%)</label>
                  <input
                    type="number"
                    min={50}
                    max={99}
                    value={newOpp.fitScore}
                    onChange={(e) => setNewOpp({ ...newOpp, fitScore: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Executive Mandate & Scope</label>
                <textarea
                  rows={3}
                  value={newOpp.jobDescription}
                  onChange={(e) => setNewOpp({ ...newOpp, jobDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Create Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
