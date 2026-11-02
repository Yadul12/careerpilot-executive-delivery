import React, { useState } from 'react';
import {
  Target,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  ArrowRight,
} from 'lucide-react';
import type {
  CandidateFullRecord,
  JobDescriptionFullRecord,
  MatchResultFullRecord,
  MatchingWeights,
} from '../../types_talentiq.ts';

interface MatchingEngineViewProps {
  candidates: CandidateFullRecord[];
  jobs: JobDescriptionFullRecord[];
  matches: MatchResultFullRecord[];
  weights: MatchingWeights;
  initialCandidateId?: number | null;
  initialJobId?: number | null;
  onRunMatch: (candidateId: number, jobId: number) => Promise<MatchResultFullRecord>;
  onInspectGap: (matchId: number) => void;
  onNavigateSettings: () => void;
}

export const MatchingEngineView: React.FC<MatchingEngineViewProps> = ({
  candidates,
  jobs,
  matches,
  weights,
  initialCandidateId,
  initialJobId,
  onRunMatch,
  onInspectGap,
  onNavigateSettings,
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<number>(
    initialCandidateId || candidates[0]?.id || 1
  );
  const [selectedJobId, setSelectedJobId] = useState<number>(
    initialJobId || jobs[0]?.id || 1
  );
  const [activeMatchId, setActiveMatchId] = useState<number | null>(
    matches[0]?.id ?? null
  );
  const [isEvaluating, setIsEvaluating] = useState(false);

  const activeMatch =
    matches.find((m) => m.id === activeMatchId) || matches[0] || null;

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    try {
      const evaluated = await onRunMatch(selectedCandidateId, selectedJobId);
      setActiveMatchId(evaluated.id);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Module E · Intelligent Candidate-Job Matching Engine
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Explainable 7-Dimension Weighted Matching
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Combines semantic competency alignment with configurable rule-based executive weighting ({weights.technicalWeight}/{weights.leadershipWeight}/{weights.seniorityWeight}/{weights.domainWeight}/{weights.industryWeight}/{weights.progressionWeight}/{weights.qualificationWeight}).
          </p>
        </div>

        <button
          onClick={onNavigateSettings}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
        >
          <Sliders className="w-3.5 h-3.5" />
          Configure Dimension Weights
        </button>
      </div>

      {/* Interactive Match Evaluator Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
        <div className="lg:col-span-5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            1. Select Executive Candidate Profile
          </label>
          <select
            value={selectedCandidateId}
            onChange={(e) => setSelectedCandidateId(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName} — {c.currentDesignation} ({c.totalYearsExperience} yrs · {c.primaryDomain})
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-5">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            2. Select Target Executive Job Mandate
          </label>
          <select
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.jobTitle} — {j.company} ({j.roleCategory} · {j.yearsOfExperience}+ yrs)
              </option>
            ))}
          </select>
        </div>

        <div className="lg:col-span-2">
          <button
            onClick={handleEvaluate}
            disabled={isEvaluating}
            className="w-full py-2 px-4 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {isEvaluating ? 'Scoring...' : 'Evaluate Match'}
          </button>
        </div>
      </div>

      {/* Main Split: Stored Matches List (Left 5) & Explainable Scorecard (Right 7) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-200 dark:divide-slate-800 max-h-[700px] overflow-y-auto">
          <div className="p-3.5 bg-slate-50/70 dark:bg-slate-800/40 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Evaluated Candidate-Job Pairs ({matches.length})
          </div>
          {matches.map((m) => {
            const isSelected = activeMatch?.id === m.id;
            const scoreColor =
              m.overallScore >= 82
                ? 'text-emerald-600 dark:text-emerald-400'
                : m.overallScore >= 72
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-amber-600 dark:text-amber-400';

            return (
              <div
                key={m.id}
                onClick={() => setActiveMatchId(m.id)}
                className={`p-4 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/70 dark:bg-blue-950/30'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {m.candidateName}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {m.candidateDesignation} ({m.candidateYears} yrs)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-base font-bold tabular-nums ${scoreColor}`}>
                      {m.overallScore}%
                    </div>
                    <div className="text-[10px] text-slate-400">{m.confidenceTier}</div>
                  </div>
                </div>
                <div className="mt-2 text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>
                    {m.jobTitle} · {m.company}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 7 Columns: Explainable 7-Dimension Breakdown */}
        <div className="lg:col-span-7">
          {activeMatch ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {activeMatch.scoringMode}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {activeMatch.candidateName} → {activeMatch.jobTitle} ({activeMatch.company})
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {activeMatch.candidateDesignation} · {activeMatch.roleCategory}
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-3xl font-extrabold tabular-nums text-slate-900 dark:text-white">
                    {activeMatch.overallScore}
                    <span className="text-base font-normal text-slate-400">/100</span>
                  </div>
                  <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    {activeMatch.confidenceTier}
                  </div>
                </div>
              </div>

              {/* 7 Weighted Dimensions Progress Bars */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  7-Dimension Weighted Alignment Breakdown
                </h3>
                {[
                  {
                    label: 'Technical Skill Alignment',
                    weight: weights.technicalWeight,
                    score: activeMatch.technicalScore,
                  },
                  {
                    label: 'Leadership Experience & Org Scale',
                    weight: weights.leadershipWeight,
                    score: activeMatch.leadershipScore,
                  },
                  {
                    label: 'Seniority & Tenure Alignment',
                    weight: weights.seniorityWeight,
                    score: activeMatch.seniorityScore,
                  },
                  {
                    label: 'Technology Domain Expertise',
                    weight: weights.domainWeight,
                    score: activeMatch.domainScore,
                  },
                  {
                    label: 'Industry Vertical Experience',
                    weight: weights.industryWeight,
                    score: activeMatch.industryScore,
                  },
                  {
                    label: 'Career Progression Velocity',
                    weight: weights.progressionWeight,
                    score: activeMatch.progressionScore,
                  },
                  {
                    label: 'Education & Executive Certifications',
                    weight: weights.qualificationWeight,
                    score: activeMatch.qualificationScore,
                  },
                ].map((dim, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {dim.label}{' '}
                        <span className="text-slate-400 tabular-nums">(Weight: {dim.weight}%)</span>
                      </span>
                      <span className="font-bold tabular-nums text-slate-900 dark:text-white">
                        {dim.score}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-600 dark:bg-blue-500 transition-all"
                        style={{ width: `${dim.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Explainable AI Rationale */}
              {activeMatch.explanation && (
                <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Explainable Match Intelligence & Rationale
                  </h3>

                  <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        Recommendation Rationale:{' '}
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 leading-relaxed">
                        {activeMatch.explanation.recommendationRationale}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Matching Technical & Leadership Skills
                      </div>
                      <div className="text-slate-800 dark:text-slate-200 mt-1 leading-relaxed">
                        {activeMatch.explanation.matchingSkills}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Missing Qualifications & Concerns
                      </div>
                      <div className="text-slate-800 dark:text-slate-200 mt-1 leading-relaxed">
                        {activeMatch.explanation.missingQualifications}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Potential Screening Concerns & Discovery Focus
                    </div>
                    <div className="text-slate-700 dark:text-slate-300">
                      {activeMatch.explanation.potentialConcerns}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => onInspectGap(activeMatch.id)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 cursor-pointer"
                >
                  <span>Open Deep-Dive Skills Gap Analysis</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
