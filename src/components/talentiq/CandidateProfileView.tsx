import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  RefreshCw,
  Save,
  CheckCircle2,
  Briefcase,
  GraduationCap,
  Award,
  Compass,
  Building2,
  MapPin,
  Mail,
  Phone,
  Sparkles,
} from 'lucide-react';
import type { CandidateFullRecord } from '../../types_talentiq.ts';

interface CandidateProfileViewProps {
  candidates: CandidateFullRecord[];
  selectedCandidateId: number | null;
  onSelectCandidate: (id: number) => void;
  onUpdateCandidate: (id: number, payload: Record<string, any>) => Promise<void>;
  onReprocessCandidate: (id: number) => Promise<void>;
  onNavigateMatching: (candidateId: number) => void;
}

export const CandidateProfileView: React.FC<CandidateProfileViewProps> = ({
  candidates,
  selectedCandidateId,
  onSelectCandidate,
  onUpdateCandidate,
  onReprocessCandidate,
  onNavigateMatching,
}) => {
  const activeCandidate =
    candidates.find((c) => c.id === selectedCandidateId) || candidates[0] || null;

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isReprocessing, setIsReprocessing] = useState(false);
  const [statusBanner, setStatusBanner] = useState<string | null>(null);

  const [form, setForm] = useState({
    fullName: '',
    currentDesignation: '',
    previousDesignations: '',
    totalYearsExperience: 18,
    primaryDomain: '',
    location: '',
    industryExperience: '',
    leadershipExperience: '',
    educationalQualifications: '',
    majorAchievements: '',
    companiesWorkedAt: '',
    targetPositions: '',
    strongestDifferentiators: '',
    resumePositioningAdvice: '',
  });

  useEffect(() => {
    if (activeCandidate) {
      setForm({
        fullName: activeCandidate.fullName,
        currentDesignation: activeCandidate.currentDesignation,
        previousDesignations: activeCandidate.previousDesignations,
        totalYearsExperience: activeCandidate.totalYearsExperience,
        primaryDomain: activeCandidate.primaryDomain,
        location: activeCandidate.location,
        industryExperience: activeCandidate.profile?.industryExperience || '',
        leadershipExperience: activeCandidate.profile?.leadershipExperience || '',
        educationalQualifications: activeCandidate.profile?.educationalQualifications || '',
        majorAchievements: activeCandidate.profile?.majorAchievements || '',
        companiesWorkedAt: activeCandidate.profile?.companiesWorkedAt || '',
        targetPositions: activeCandidate.positioning?.targetPositions || '',
        strongestDifferentiators: activeCandidate.positioning?.strongestDifferentiators || '',
        resumePositioningAdvice: activeCandidate.positioning?.resumePositioningAdvice || '',
      });
    }
  }, [activeCandidate]);

  if (!activeCandidate) {
    return <div className="p-8 text-xs text-slate-500">No executive candidates available.</div>;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusBanner(null);
    try {
      await onUpdateCandidate(activeCandidate.id, form);
      setIsEditing(false);
      setStatusBanner('Executive intelligence profile and positioning saved to PostgreSQL.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReprocess = async () => {
    setIsReprocessing(true);
    setStatusBanner(null);
    try {
      await onReprocessCandidate(activeCandidate.id);
      setStatusBanner('Resume reprocessed and extraction confidence recalibrated.');
    } finally {
      setIsReprocessing(false);
    }
  };

  const handleToggleApproval = async () => {
    const nextState = !activeCandidate.positioning?.approvedByManager;
    await onUpdateCandidate(activeCandidate.id, { approvedByManager: nextState });
    setStatusBanner(
      nextState
        ? 'Positioning strategy approved by Delivery Manager.'
        : 'Positioning approval reverted to draft review.'
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Candidate Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Module B & Module H · Candidate Intelligence & Positioning Dossier
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            {activeCandidate.fullName} — {activeCandidate.currentDesignation}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> {activeCandidate.location}
            </span>
            <span className="inline-flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> {activeCandidate.email}
            </span>
            <span className="inline-flex items-center gap-1">
              <Phone className="w-3.5 h-3.5" /> {activeCandidate.phone}
            </span>
            <span>
              Extraction Confidence:{' '}
              <strong className="tabular-nums text-emerald-600 dark:text-emerald-400">
                {activeCandidate.extractionConfidence}%
              </strong>
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={activeCandidate.id}
            onChange={(e) => onSelectCandidate(Number(e.target.value))}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          >
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName} ({c.currentDesignation})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleReprocess}
            disabled={isReprocessing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isReprocessing ? 'animate-spin' : ''}`} />
            {isReprocessing ? 'Reprocessing...' : 'Reprocess Resume'}
          </button>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5" />
            {isEditing ? 'Cancel Editing' : 'Edit Extracted Data'}
          </button>

          <button
            type="button"
            onClick={() => onNavigateMatching(activeCandidate.id)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-500 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Match Against Mandates
          </button>
        </div>
      </div>

      {statusBanner && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {statusBanner}
          </span>
          <button
            onClick={() => setStatusBanner(null)}
            className="text-[11px] underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {isEditing ? (
        <form
          onSubmit={handleSave}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4"
        >
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Review & Edit Extracted Candidate Intelligence
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Current Designation
              </label>
              <input
                type="text"
                value={form.currentDesignation}
                onChange={(e) => setForm({ ...form, currentDesignation: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Years of Experience
              </label>
              <input
                type="number"
                value={form.totalYearsExperience}
                onChange={(e) =>
                  setForm({ ...form, totalYearsExperience: Number(e.target.value) })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Primary Technology Domain
              </label>
              <input
                type="text"
                value={form.primaryDomain}
                onChange={(e) => setForm({ ...form, primaryDomain: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Companies Worked At
              </label>
              <input
                type="text"
                value={form.companiesWorkedAt}
                onChange={(e) => setForm({ ...form, companiesWorkedAt: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Leadership Experience Scope
              </label>
              <textarea
                rows={2}
                value={form.leadershipExperience}
                onChange={(e) => setForm({ ...form, leadershipExperience: e.target.value })}
                className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                Major Quantified Achievements
              </label>
              <textarea
                rows={2}
                value={form.majorAchievements}
                onChange={(e) => setForm({ ...form, majorAchievements: e.target.value })}
                className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                AI Positioning: Target Executive Positions
              </label>
              <input
                type="text"
                value={form.targetPositions}
                onChange={(e) => setForm({ ...form, targetPositions: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                AI Positioning: Resume Positioning Advice
              </label>
              <textarea
                rows={2}
                value={form.resumePositioningAdvice}
                onChange={(e) => setForm({ ...form, resumePositioningAdvice: e.target.value })}
                className="w-full p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              {isSaving ? 'Saving Changes...' : 'Save Corrected Profile'}
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Columns: FACTUAL EXTRACTED RESUME INTELLIGENCE */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Section 1 · Verified Factual Extraction (Resume Source of Truth)
                </span>
                <span className="text-xs font-semibold tabular-nums text-slate-700 dark:text-slate-300">
                  {activeCandidate.totalYearsExperience} Years Experience · {activeCandidate.primaryDomain}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-slate-400 uppercase text-[10px] font-semibold">
                    Previous Designations
                  </div>
                  <div className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">
                    {activeCandidate.previousDesignations}
                  </div>
                </div>
                <div>
                  <div className="text-slate-400 uppercase text-[10px] font-semibold">
                    Companies Worked At
                  </div>
                  <div className="text-slate-800 dark:text-slate-200 font-medium mt-0.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    {activeCandidate.profile?.companiesWorkedAt}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-slate-400 uppercase text-[10px] font-semibold">
                    Industry Experience
                  </div>
                  <div className="text-slate-800 dark:text-slate-200 font-medium mt-0.5">
                    {activeCandidate.profile?.industryExperience}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-slate-400 uppercase text-[10px] font-semibold">
                    Leadership & Organizational Scope
                  </div>
                  <div className="text-slate-800 dark:text-slate-200 leading-relaxed mt-0.5">
                    {activeCandidate.profile?.leadershipExperience}
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-slate-400 uppercase text-[10px] font-semibold">
                    Major Quantified Achievements
                  </div>
                  <div className="text-slate-800 dark:text-slate-200 leading-relaxed mt-0.5">
                    {activeCandidate.profile?.majorAchievements}
                  </div>
                </div>
              </div>
            </div>

            {/* Verified Technical Competencies & Proficiency */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Extracted Technical & Leadership Competencies ({activeCandidate.skills.length})
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {activeCandidate.skills.map((sk, idx) => (
                  <div key={idx} className="py-2 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {sk.skillName}
                      </span>
                      <span className="text-slate-400 ml-2">· {sk.skillCategory}</span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-400 tabular-nums">
                      {sk.proficiencyLevel} · {sk.yearsUsed} yrs
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Employment History & Education */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                Chronological Employment History & Credentials
              </h3>
              <div className="space-y-3 text-xs">
                {activeCandidate.employmentHistory.map((h, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-white">
                      <span>
                        {h.designation} — {h.company}
                      </span>
                      <span className="text-slate-500 tabular-nums">{h.duration}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {h.highlights}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-[10px] font-semibold uppercase text-slate-400 flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5" /> Education
                  </div>
                  <div className="text-slate-800 dark:text-slate-200 mt-1">
                    {activeCandidate.profile?.educationalQualifications}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold uppercase text-slate-400 flex items-center gap-1">
                    <Award className="w-3.5 h-3.5" /> Executive Certifications
                  </div>
                  <div className="text-slate-800 dark:text-slate-200 mt-1">
                    {activeCandidate.certifications.length > 0
                      ? activeCandidate.certifications
                          .map((c) => `${c.name} (${c.issueYear})`)
                          .join(' · ')
                      : 'Verified Executive Track Record'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right 5 Columns: MODULE H — AI EXECUTIVE POSITIONING RECOMMENDATIONS */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Section 2 · AI Positioning Recommendations (Module H)
                  </span>
                </div>
                <button
                  onClick={handleToggleApproval}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold cursor-pointer transition-colors ${
                    activeCandidate.positioning?.approvedByManager
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                  }`}
                >
                  {activeCandidate.positioning?.approvedByManager
                    ? '✓ Approved by Delivery Manager'
                    : 'Pending Manager Approval'}
                </button>
              </div>

              {activeCandidate.positioning ? (
                <div className="space-y-3.5 text-xs">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Recommended Target Executive Positions
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-white mt-0.5">
                      {activeCandidate.positioning.targetPositions}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Alternative Leadership Career Paths
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 mt-0.5">
                      {activeCandidate.positioning.alternativePaths}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Strongest Executive Differentiators
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5">
                      {activeCandidate.positioning.strongestDifferentiators}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Skills Needing Stronger Resume Visibility
                    </div>
                    <div className="text-amber-700 dark:text-amber-400 font-medium mt-0.5">
                      {activeCandidate.positioning.skillsNeedingVisibility}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Actionable Resume Positioning Advice
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5">
                      {activeCandidate.positioning.resumePositioningAdvice}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Relevant Industry Segments
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 mt-0.5">
                      {activeCandidate.positioning.relevantIndustrySegments}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Recommended Executive Search Strategy
                    </div>
                    <div className="text-slate-700 dark:text-slate-300 leading-relaxed mt-0.5">
                      {activeCandidate.positioning.recommendedSearchStrategy}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-500">No positioning recommendations generated yet.</div>
              )}
            </div>

            {/* Raw Parsed Resume Document Inspector */}
            {activeCandidate.resume && (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    Source Document: {activeCandidate.resume.filename}
                  </span>
                  <span className="text-slate-500">{activeCandidate.resume.fileType}</span>
                </div>
                <pre className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-3 rounded-lg overflow-x-auto max-h-56 whitespace-pre-wrap">
                  {activeCandidate.resume.rawText}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
