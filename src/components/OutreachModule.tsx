import React, { useState } from 'react';
import {
  OutreachActivityRecord,
  ExecutiveClient,
  JobOpportunity,
  RoleName,
} from '../types.ts';
import { Search, Send, CheckCircle2, Calendar, X } from 'lucide-react';

interface OutreachModuleProps {
  activities: OutreachActivityRecord[];
  clients: ExecutiveClient[];
  opportunities: JobOpportunity[];
  userRole: RoleName;
  onCreateOutreach: (payload: any) => Promise<void>;
  onUpdateOutreach: (
    activityId: number,
    updates: {
      status: string;
      replyReceived: boolean;
      outcome: string;
      nextAction?: string;
      followUpCount?: number;
    }
  ) => Promise<void>;
}

export const OutreachModule: React.FC<OutreachModuleProps> = ({
  activities,
  clients,
  opportunities,
  userRole,
  onCreateOutreach,
  onUpdateOutreach,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showLogModal, setShowLogModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newOutreach, setNewOutreach] = useState({
    clientId: clients[0]?.id || 1,
    opportunityId: opportunities[0]?.id || undefined,
    contactName: '',
    contactTitle: 'Chief Executive Officer',
    company: '',
    contactEmail: '',
    linkedinUrl: 'https://linkedin.com/in/',
    relationshipWarmth: 'Warm',
    channel: 'Warm Intro',
    messageSubject: 'Confidential: Executive CTO/VP Thesis & Board Alignment',
    messageSnippet:
      'Sharing our client’s 90-day architectural scaling brief and leadership track record aligned with your upcoming platform expansion.',
    nextAction: 'Follow up with executive briefing dossier',
    nextActionDate: '2026-11-09',
  });

  const filteredActivities = activities.filter((a) => {
    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Replied' ? a.replyReceived : a.status === statusFilter);
    const matchesSearch =
      !search ||
      a.contactName.toLowerCase().includes(search.toLowerCase()) ||
      a.company.toLowerCase().includes(search.toLowerCase()) ||
      a.clientName.toLowerCase().includes(search.toLowerCase()) ||
      a.messageSubject.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const repliedCount = activities.filter((a) => a.replyReceived).length;
  const meetingsBookedCount = activities.filter(
    (a) => a.status === 'Meeting Booked' || a.outcome === 'Intro Call Scheduled'
  ).length;
  const referralsSecuredCount = activities.filter(
    (a) => a.status === 'Referral Secured' || a.outcome === 'Referred to Hiring Panel'
  ).length;

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await onCreateOutreach(newOutreach);
      setShowLogModal(false);
      setNewOutreach((prev) => ({
        ...prev,
        contactName: '',
        company: '',
        contactEmail: '',
      }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Outreach Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Total Hiring-Manager Outreach
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-slate-100">
            {activities.length}
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Verified Decision-Maker Replies
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">
            {repliedCount} ({activities.length > 0 ? Math.round((repliedCount / activities.length) * 100) : 0}%)
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Chemistry Meetings Booked
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-blue-600 dark:text-blue-400">
            {meetingsBookedCount}
          </div>
        </div>
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Board / Panel Referrals Secured
          </div>
          <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-amber-600 dark:text-amber-400">
            {referralsSecuredCount}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hiring manager, company, or executive client..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg overflow-x-auto">
            {['All', 'Replied', 'Meeting Booked', 'Referral Secured', 'Follow-Up Due'].map(
              (tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    statusFilter === tab
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
            onClick={() => setShowLogModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Log Hiring-Manager Outreach</span>
          </button>
        )}
      </div>

      {/* Outreach CRM Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-50/60 dark:bg-slate-950/40">
                <th className="py-3 px-4">Hiring Manager & Company</th>
                <th className="py-3 px-4">Executive Client</th>
                <th className="py-3 px-4">Channel & Message</th>
                <th className="py-3 px-4">Cadence & Next Action</th>
                <th className="py-3 px-4">Outcome Status</th>
                <th className="py-3 px-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {filteredActivities.map((act) => (
                <tr
                  key={act.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {act.contactName}
                    </div>
                    <div className="text-slate-600 dark:text-slate-300">
                      {act.contactTitle} · <strong>{act.company}</strong>
                    </div>
                    <div className="text-slate-400">
                      Warmth: {act.relationshipWarmth} · {act.contactEmail}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-900 dark:text-slate-100">
                      {act.clientName}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">
                      {act.opportunityTitle}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-medium text-slate-900 dark:text-slate-100 truncate">
                      {act.channel} · {act.messageSubject}
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                      {act.messageSnippet}
                    </p>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="font-mono tabular-nums text-slate-700 dark:text-slate-300">
                      Sent {act.sentDate} · Follow-ups: {act.followUpCount}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span>
                        Next ({act.nextActionDate}): {act.nextAction}
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div
                      className={
                        act.replyReceived
                          ? 'font-semibold text-emerald-600 dark:text-emerald-400'
                          : 'font-medium text-slate-700 dark:text-slate-300'
                      }
                    >
                      {act.status}
                    </div>
                    <div className="text-slate-500 dark:text-slate-400">
                      {act.outcome}
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                    {!act.replyReceived && (
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateOutreach(act.id, {
                            status: 'Meeting Booked',
                            replyReceived: true,
                            outcome: 'Intro Call Scheduled',
                            followUpCount: act.followUpCount,
                          })
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded hover:bg-emerald-100 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Log Reply & Call</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateOutreach(act.id, {
                          status: 'Referral Secured',
                          replyReceived: true,
                          outcome: 'Referred to Hiring Panel',
                          followUpCount: act.followUpCount + 1,
                        })
                      }
                      className="px-2.5 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-800 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      Log Referral
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Log Hiring-Manager Outreach */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-display">
                Log Hiring-Manager Outreach Activity
              </h3>
              <button
                type="button"
                onClick={() => setShowLogModal(false)}
                className="p-1 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Executive Client *</label>
                  <select
                    value={newOutreach.clientId}
                    onChange={(e) =>
                      setNewOutreach({ ...newOutreach, clientId: Number(e.target.value) })
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

                <div>
                  <label className="block font-medium mb-1">Target Company *</label>
                  <input
                    type="text"
                    required
                    value={newOutreach.company}
                    onChange={(e) =>
                      setNewOutreach({ ...newOutreach, company: e.target.value })
                    }
                    placeholder="e.g., Anthropic, Stripe, Databricks"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Hiring Manager Name *</label>
                  <input
                    type="text"
                    required
                    value={newOutreach.contactName}
                    onChange={(e) =>
                      setNewOutreach({ ...newOutreach, contactName: e.target.value })
                    }
                    placeholder="e.g., Dario Amodei / Patrick Collison"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Decision-Maker Title</label>
                  <input
                    type="text"
                    value={newOutreach.contactTitle}
                    onChange={(e) =>
                      setNewOutreach({ ...newOutreach, contactTitle: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Contact Email</label>
                  <input
                    type="email"
                    required
                    value={newOutreach.contactEmail}
                    onChange={(e) =>
                      setNewOutreach({ ...newOutreach, contactEmail: e.target.value })
                    }
                    placeholder="leader@company.io"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">Outreach Channel</label>
                  <select
                    value={newOutreach.channel}
                    onChange={(e) =>
                      setNewOutreach({ ...newOutreach, channel: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  >
                    <option value="Warm Intro">Warm VC / Board Intro</option>
                    <option value="Direct Email">Direct Executive Email</option>
                    <option value="LinkedIn InMail">LinkedIn InMail</option>
                    <option value="Executive Recruiter">Retained Search Partner</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium mb-1">Outreach Subject Line *</label>
                <input
                  type="text"
                  required
                  value={newOutreach.messageSubject}
                  onChange={(e) =>
                    setNewOutreach({ ...newOutreach, messageSubject: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium mb-1">Outreach Message / Pitch Snippet</label>
                <textarea
                  rows={3}
                  value={newOutreach.messageSnippet}
                  onChange={(e) =>
                    setNewOutreach({ ...newOutreach, messageSnippet: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Scheduled Next Action</label>
                  <input
                    type="text"
                    value={newOutreach.nextAction}
                    onChange={(e) =>
                      setNewOutreach({ ...newOutreach, nextAction: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-1">Follow-Up Date</label>
                  <input
                    type="date"
                    value={newOutreach.nextActionDate}
                    onChange={(e) =>
                      setNewOutreach({ ...newOutreach, nextActionDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-lg cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Log Outreach'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
