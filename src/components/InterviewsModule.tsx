import React, { useState } from 'react';
import {
  InterviewRecordItem,
  ExecutiveClient,
  RoleName,
} from '../types.ts';
import { Calendar, Plus, X, CheckCircle2 } from 'lucide-react';

interface InterviewsModuleProps {
  interviews: InterviewRecordItem[];
  clients: ExecutiveClient[];
  userRole: RoleName;
  onCreateInterview: (payload: any) => Promise<void>;
  onUpdateInterview: (
    interviewId: number,
    updates: { prepStatus?: string; feedback?: string; outcome?: string }
  ) => Promise<void>;
}

export const InterviewsModule: React.FC<InterviewsModuleProps> = ({
  interviews,
  clients,
  userRole,
  onCreateInterview,
  onUpdateInterview,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>('All');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('All');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editingInterview, setEditingInterview] = useState<InterviewRecordItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [newInterview, setNewInterview] = useState({
    clientId: clients[0]?.id || 1,
    company: '',
    roleTitle: 'Chief Technology Officer (CTO)',
    stageName: 'CEO / Board Final',
    roundNumber: 4,
    scheduledAt: '2026-11-10 14:00',
    interviewerName: '',
    interviewerTitle: 'Chief Executive Officer & Board Member',
    prepStatus: 'Dossier Ready',
    prepNotes:
      'Prepared 90-day technical architecture roadmap, M&A integration thesis, and compensation expectations.',
  });

  const filteredInterviews = interviews.filter((iv) => {
    const matchesClient =
      selectedClientId === 'All' || iv.clientId === Number(selectedClientId);
    const matchesOutcome =
      outcomeFilter === 'All' || iv.outcome === outcomeFilter;
    return matchesClient && matchesOutcome;
  });

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await onCreateInterview(newInterview);
      setShowScheduleModal(false);
      setNewInterview((prev) => ({
        ...prev,
        company: '',
        interviewerName: '',
      }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDebriefSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInterview) return;
    try {
      setSubmitting(true);
      await onUpdateInterview(editingInterview.id, {
        prepStatus: editingInterview.prepStatus,
        feedback: editingInterview.feedback,
        outcome: editingInterview.outcome,
      });
      setEditingInterview(null);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
          >
            <option value="All">All Executive Clients ({clients.length})</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg">
            {['All', 'Scheduled', 'Advanced to Next Round', 'Offer Extended'].map(
              (tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setOutcomeFilter(tab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    outcomeFilter === tab
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>
        </div>

        {userRole !== 'Client' && (
          <button
            type="button"
            onClick={() => setShowScheduleModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Executive Interview</span>
          </button>
        )}
      </div>

      {/* Interviews Grid / Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/60 dark:bg-slate-950/40">
                <th className="py-3 px-4">Company & Executive Mandate</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Round & Interviewer</th>
                <th className="py-3 px-4">Preparation & Debrief</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {filteredInterviews.map((iv) => (
                <tr
                  key={iv.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-4 px-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {iv.company}
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 font-medium">
                      {iv.roleTitle}
                    </div>
                    <div className="text-slate-400 font-mono tabular-nums mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>{iv.scheduledAt}</span>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {iv.clientName}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">
                      {iv.clientDesignation}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      Round {iv.roundNumber} · {iv.stageName}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">
                      {iv.interviewerName} ({iv.interviewerTitle})
                    </div>
                  </td>

                  <td className="py-4 px-4 max-w-sm">
                    <div className="font-medium text-slate-800 dark:text-slate-200">
                      Prep Status: {iv.prepStatus}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                      {iv.prepNotes}
                    </p>
                    {iv.feedback && (
                      <p className="text-slate-700 dark:text-slate-300 italic mt-1 line-clamp-2">
                        Feedback: “{iv.feedback}”
                      </p>
                    )}
                  </td>

                  <td className="py-4 px-4">
                    <span
                      className={
                        iv.outcome === 'Offer Extended'
                          ? 'font-bold text-emerald-600 dark:text-emerald-400'
                          : iv.outcome === 'Advanced to Next Round'
                          ? 'font-semibold text-blue-600 dark:text-blue-400'
                          : 'font-medium text-amber-600 dark:text-amber-400'
                      }
                    >
                      {iv.outcome}
                    </span>
                  </td>

                  <td className="py-4 px-4 text-right whitespace-nowrap space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditingInterview(iv)}
                      className="px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Record Feedback
                    </button>
                    {iv.outcome === 'Scheduled' && (
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateInterview(iv.id, {
                            prepStatus: 'Debrief Complete',
                            outcome: 'Advanced to Next Round',
                          })
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded cursor-pointer"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Advance</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Record Feedback & Update Outcome */}
      {editingInterview && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-display">
                  Update Interview Debrief & Outcome
                </h3>
                <p className="text-xs text-slate-500">
                  {editingInterview.company} · Round {editingInterview.roundNumber} (
                  {editingInterview.stageName})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingInterview(null)}
                className="p-1 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDebriefSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Preparation Status</label>
                  <select
                    value={editingInterview.prepStatus}
                    onChange={(e) =>
                      setEditingInterview({
                        ...editingInterview,
                        prepStatus: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  >
                    <option value="Pending Prep">Pending Prep</option>
                    <option value="Dossier Ready">Dossier Ready</option>
                    <option value="Mock Completed">Mock Completed</option>
                    <option value="Debrief Complete">Debrief Complete</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium mb-1">Interview Outcome</label>
                  <select
                    value={editingInterview.outcome}
                    onChange={(e) =>
                      setEditingInterview({
                        ...editingInterview,
                        outcome: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Advanced to Next Round">Advanced to Next Round</option>
                    <option value="Offer Extended">Offer Extended</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">
                  Panel Feedback & Candidate Debrief Notes
                </label>
                <textarea
                  rows={4}
                  value={editingInterview.feedback}
                  onChange={(e) =>
                    setEditingInterview({
                      ...editingInterview,
                      feedback: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingInterview(null)}
                  className="px-4 py-2 text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Save Debrief
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Schedule Executive Interview */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-display">
                Schedule Executive Interview Round
              </h3>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="p-1 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Executive Client *</label>
                <select
                  value={newInterview.clientId}
                  onChange={(e) =>
                    setNewInterview({
                      ...newInterview,
                      clientId: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Company *</label>
                  <input
                    type="text"
                    required
                    value={newInterview.company}
                    onChange={(e) =>
                      setNewInterview({ ...newInterview, company: e.target.value })
                    }
                    placeholder="e.g., Anthropic, Stripe"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Target Role Title *</label>
                  <input
                    type="text"
                    required
                    value={newInterview.roleTitle}
                    onChange={(e) =>
                      setNewInterview({ ...newInterview, roleTitle: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Interview Stage</label>
                  <select
                    value={newInterview.stageName}
                    onChange={(e) =>
                      setNewInterview({ ...newInterview, stageName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  >
                    <option value="Executive Recruiter Screen">Executive Recruiter Screen</option>
                    <option value="Hiring Manager Deep-Dive">Hiring Manager Deep-Dive</option>
                    <option value="Architecture & Strategy Panel">Architecture & Strategy Panel</option>
                    <option value="CEO / Board Final">CEO / Board Final</option>
                    <option value="Compensation & Offer">Compensation & Offer</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Scheduled Date & Time</label>
                  <input
                    type="text"
                    value={newInterview.scheduledAt}
                    onChange={(e) =>
                      setNewInterview({ ...newInterview, scheduledAt: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Interviewer Name *</label>
                  <input
                    type="text"
                    required
                    value={newInterview.interviewerName}
                    onChange={(e) =>
                      setNewInterview({
                        ...newInterview,
                        interviewerName: e.target.value,
                      })
                    }
                    placeholder="e.g., Evelyn Mercer"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Interviewer Title</label>
                  <input
                    type="text"
                    value={newInterview.interviewerTitle}
                    onChange={(e) =>
                      setNewInterview({
                        ...newInterview,
                        interviewerTitle: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Preparation Activities & Notes</label>
                <textarea
                  rows={2}
                  value={newInterview.prepNotes}
                  onChange={(e) =>
                    setNewInterview({ ...newInterview, prepNotes: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Schedule Round
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
