import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Compass,
  Layers,
  ShieldAlert,
} from 'lucide-react';
import type { MatchResultFullRecord } from '../../types_talentiq.ts';

interface SkillsGapViewProps {
  matches: MatchResultFullRecord[];
  selectedMatchId: number | null;
  onSelectMatch: (id: number) => void;
}

export const SkillsGapView: React.FC<SkillsGapViewProps> = ({
  matches,
  selectedMatchId,
  onSelectMatch,
}) => {
  const activeMatch =
    matches.find((m) => m.id === selectedMatchId) || matches[0] || null;

  if (!activeMatch || !activeMatch.skillsGap) {
    return (
      <div className="p-8 text-xs text-slate-500">
        No skills gap analysis records found. Run a Candidate-Job evaluation first.
      </div>
    );
  }

  const gap = activeMatch.skillsGap;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Module F · Executive Skills Gap & Probable Competency Intelligence
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Skills Gap & Resume Visibility Analysis
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Distinguishes genuinely missing required skills from unmentioned probable competencies that senior executives possess but omitted from their CV.
          </p>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
            Select Evaluated Candidate-Job Mandate Pair
          </label>
          <select
            value={activeMatch.id}
            onChange={(e) => onSelectMatch(Number(e.target.value))}
            className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          >
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                {m.candidateName} vs {m.jobTitle} ({m.company}) — {m.overallScore}%
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4-Quadrant Competency Classification Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            1. Demonstrated & Verified Skills (Explicit in Resume)
          </div>
          <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            {gap.demonstratedSkills}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4" />
            2. Unmentioned Probable Skills (Inferred from Executive Tenure)
          </div>
          <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            {gap.unmentionedProbableSkills}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            *High probability the candidate possesses these skills based on {activeMatch.candidateDesignation} scope, but they are currently omitted from resume text.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            3. Genuinely Missing Required Skills
          </div>
          <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            {gap.missingRequiredSkills}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            4. Missing Preferred / Secondary Skills
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {gap.missingPreferredSkills}
          </p>
        </div>
      </div>

      {/* Leadership Gaps, Industry Gaps, Clarification Areas & Positioning Plan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-blue-600" />
            Executive Leadership, Industry & Discovery Clarification Areas
          </h3>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Leadership Scope & Scale Gaps
            </div>
            <p className="text-slate-800 dark:text-slate-200 mt-1 leading-relaxed">
              {gap.leadershipGaps}
            </p>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Industry Domain Gaps
            </div>
            <p className="text-slate-800 dark:text-slate-200 mt-1 leading-relaxed">
              {gap.industryGaps}
            </p>
          </div>

          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Suggested Interview Clarification Questions
            </div>
            <p className="text-slate-800 dark:text-slate-200 mt-1 leading-relaxed">
              {gap.clarificationAreas}
            </p>
          </div>
        </div>

        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 text-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
            <Compass className="w-4 h-4" />
            Suggested Resume Positioning Improvement Plan
          </h3>
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 whitespace-pre-line text-slate-800 dark:text-slate-200 leading-relaxed">
            {gap.positioningImprovementPlan}
          </div>
        </div>
      </div>
    </div>
  );
};
