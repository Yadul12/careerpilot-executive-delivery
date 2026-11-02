import React, { useState, useMemo } from 'react';
import {
  Search,
  UserCheck,
  FileUp,
  ChevronRight,
  MapPin,
  Briefcase,
  Award,
  CheckCircle2,
} from 'lucide-react';
import type { CandidateFullRecord } from '../../types_talentiq.ts';

interface CandidateManagementViewProps {
  candidates: CandidateFullRecord[];
  onSelectCandidate: (candidateId: number) => void;
  onNavigateUpload: () => void;
}

export const CandidateManagementView: React.FC<CandidateManagementViewProps> = ({
  candidates,
  onSelectCandidate,
  onNavigateUpload,
}) => {
  const [search, setSearch] = useState('');
  const [domainFilter, setDomainFilter] = useState('All');
  const [minExp, setMinExp] = useState<number>(0);

  const domains = useMemo(() => {
    const set = new Set<string>(['All']);
    candidates.forEach((c) => set.add(c.primaryDomain));
    return Array.from(set);
  }, [candidates]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return candidates.filter((c) => {
      const matchesDomain = domainFilter === 'All' || c.primaryDomain === domainFilter;
      const matchesExp = c.totalYearsExperience >= minExp;
      const matchesSearch =
        !q ||
        c.fullName.toLowerCase().includes(q) ||
        c.currentDesignation.toLowerCase().includes(q) ||
        c.primaryDomain.toLowerCase().includes(q) ||
        c.location.toLowerCase().includes(q) ||
        (c.profile?.companiesWorkedAt || '').toLowerCase().includes(q) ||
        c.skills.some((s) => s.skillName.toLowerCase().includes(q));
      return matchesDomain && matchesExp && matchesSearch;
    });
  }, [candidates, search, domainFilter, minExp]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Executive Talent Roster · {candidates.length} Profiles Indexed
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Candidate Management & Intelligence Directory
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Inspect structured executive profiles, verified technical competencies, extraction confidence, and target positioning status.
          </p>
        </div>
        <button
          onClick={onNavigateUpload}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors cursor-pointer"
        >
          <FileUp className="w-4 h-4" />
          Upload & Parse New Resume
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by executive name, CTO/CIO/VP title, company, or technical skill..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          >
            {domains.map((d) => (
              <option key={d} value={d}>
                {d === 'All' ? 'All Technology Domains' : d}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={minExp}
            onChange={(e) => setMinExp(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          >
            <option value={0}>All Experience Levels (10+ Yrs)</option>
            <option value={15}>15+ Years Tenure (VP / SVP)</option>
            <option value={18}>18+ Years Tenure (C-Suite)</option>
            <option value={20}>20+ Years Tenure (Group CTO/CIO)</option>
          </select>
        </div>
      </div>

      {/* Candidate Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="py-3 px-4">Executive Candidate</th>
                <th className="py-3 px-4">Current Designation & Pedigree</th>
                <th className="py-3 px-4">Primary Domain</th>
                <th className="py-3 px-4">Tenure</th>
                <th className="py-3 px-4">Core Technical Competencies</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              {filtered.map((c) => {
                const initials = c.fullName
                  .split(' ')
                  .map((p) => p[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();

                return (
                  <tr
                    key={c.id}
                    onClick={() => onSelectCandidate(c.id)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {initials}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                            {c.fullName}
                            {c.positioning?.approvedByManager && (
                              <span title="Positioning Strategy Approved by Delivery Manager">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {c.location} · {c.isSynthetic ? '[SYNTHETIC]' : 'Live Upload'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        {c.currentDesignation}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-xs">
                        {c.profile?.companiesWorkedAt || c.previousDesignations}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-medium">
                      {c.primaryDomain}
                    </td>
                    <td className="py-3.5 px-4 font-semibold tabular-nums text-slate-900 dark:text-white">
                      {c.totalYearsExperience} yrs
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400 max-w-sm">
                      <div className="line-clamp-2 text-[11px] leading-relaxed">
                        {c.skills.map((s) => s.skillName).join(' · ')}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1 font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                        <Award className="w-3.5 h-3.5" />
                        {c.extractionConfidence}%
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCandidate(c.id);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Intelligence Profile
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
