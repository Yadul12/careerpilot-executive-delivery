import React, { useState, useMemo } from 'react';
import { GitCompare, ArrowUpDown, Filter } from 'lucide-react';
import type {
  CandidateFullRecord,
  JobDescriptionFullRecord,
  MatchingWeights,
} from '../../types_talentiq.ts';
import { evaluateCandidateJobMatchDeterministic } from '../../services/talentiq_engine.ts';

interface CandidateComparisonViewProps {
  candidates: CandidateFullRecord[];
  jobs: JobDescriptionFullRecord[];
  weights: MatchingWeights;
}

export const CandidateComparisonView: React.FC<CandidateComparisonViewProps> = ({
  candidates,
  jobs,
  weights,
}) => {
  const [selectedJobId, setSelectedJobId] = useState<number>(jobs[0]?.id || 1);
  const [selectedCandidateIds, setSelectedCandidateIds] = useState<number[]>(
    candidates.slice(0, 4).map((c) => c.id)
  );
  const [sortBy, setSortBy] = useState<'overall' | 'technical' | 'leadership' | 'experience'>(
    'overall'
  );
  const [minScoreFilter, setMinScoreFilter] = useState<number>(0);

  const activeJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  const toggleCandidate = (id: number) => {
    if (selectedCandidateIds.includes(id)) {
      if (selectedCandidateIds.length > 1) {
        setSelectedCandidateIds(selectedCandidateIds.filter((cid) => cid !== id));
      }
    } else {
      setSelectedCandidateIds([...selectedCandidateIds, id]);
    }
  };

  const comparedRows = useMemo(() => {
    if (!activeJob) return [];
    const pool = candidates.filter((c) => selectedCandidateIds.includes(c.id));
    const evaluated = pool.map((candidate) => {
      const result = evaluateCandidateJobMatchDeterministic(candidate, activeJob, weights);
      return {
        candidate,
        result,
      };
    });

    const filtered = evaluated.filter((item) => item.result.overallScore >= minScoreFilter);

    return filtered.sort((a, b) => {
      if (sortBy === 'technical') return b.result.technicalScore - a.result.technicalScore;
      if (sortBy === 'leadership') return b.result.leadershipScore - a.result.leadershipScore;
      if (sortBy === 'experience')
        return b.candidate.totalYearsExperience - a.candidate.totalYearsExperience;
      return b.result.overallScore - a.result.overallScore;
    });
  }, [candidates, activeJob, selectedCandidateIds, weights, sortBy, minScoreFilter]);

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
          Module G · Multi-Candidate Executive Shortlist Comparison
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
          Side-by-Side Candidate Comparison Matrix
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Benchmark multiple executive candidates against a single mandate across all 7 weighted scoring dimensions, demonstrated competencies, and missing qualifications.
        </p>
      </div>

      {/* Controls: Target Job + Sorting + Min Score Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Target Executive Job Mandate
            </label>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.jobTitle} — {j.company} ({j.roleCategory})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort Shortlist By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value="overall">Composite Match Score (Highest First)</option>
              <option value="technical">Technical Alignment Score</option>
              <option value="leadership">Leadership Scale Score</option>
              <option value="experience">Total Years of Experience</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Minimum Match Threshold
            </label>
            <select
              value={minScoreFilter}
              onChange={(e) => setMinScoreFilter(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
            >
              <option value={0}>Show All Selected Candidates (0%+)</option>
              <option value={72}>Strong Contenders Only (≥72%)</option>
              <option value={82}>High-Confidence Fits Only (≥82%)</option>
            </select>
          </div>
        </div>

        {/* Candidate Selector Checkboxes */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Select Candidates to Compare ({selectedCandidateIds.length} active)
          </div>
          <div className="flex flex-wrap gap-2">
            {candidates.map((c) => {
              const active = selectedCandidateIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleCandidate(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                    active
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400'
                  }`}
                >
                  {c.fullName} ({c.currentDesignation.split('(')[0].trim()})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-xs">
                <th className="py-3.5 px-4 font-bold text-slate-700 dark:text-slate-300 w-52">
                  Evaluation Dimension
                </th>
                {comparedRows.map(({ candidate, result }) => (
                  <th key={candidate.id} className="py-3.5 px-4 min-w-[230px]">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {candidate.fullName}
                    </div>
                    <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400">
                      {candidate.currentDesignation}
                    </div>
                    <div className="mt-1.5 inline-flex items-baseline gap-1.5">
                      <span className="text-lg font-extrabold tabular-nums text-blue-600 dark:text-blue-400">
                        {result.overallScore}%
                      </span>
                      <span className="text-[11px] font-medium text-slate-500">
                        {result.confidenceTier}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs">
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  Total Leadership Tenure
                </td>
                {comparedRows.map(({ candidate }) => (
                  <td key={candidate.id} className="py-3 px-4 font-semibold tabular-nums text-slate-900 dark:text-white">
                    {candidate.totalYearsExperience} Years ({candidate.primaryDomain})
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  Technical Alignment ({weights.technicalWeight}%)
                </td>
                {comparedRows.map(({ candidate, result }) => (
                  <td key={candidate.id} className="py-3 px-4 font-bold tabular-nums text-slate-900 dark:text-white">
                    {result.technicalScore}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  Leadership Scale ({weights.leadershipWeight}%)
                </td>
                {comparedRows.map(({ candidate, result }) => (
                  <td key={candidate.id} className="py-3 px-4 font-bold tabular-nums text-slate-900 dark:text-white">
                    {result.leadershipScore}%
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  Seniority & Domain ({weights.seniorityWeight + weights.domainWeight}%)
                </td>
                {comparedRows.map(({ candidate, result }) => (
                  <td key={candidate.id} className="py-3 px-4 tabular-nums text-slate-800 dark:text-slate-200">
                    Seniority: <strong>{result.seniorityScore}%</strong> · Domain: <strong>{result.domainScore}%</strong>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  Industry & Progression ({weights.industryWeight + weights.progressionWeight}%)
                </td>
                {comparedRows.map(({ candidate, result }) => (
                  <td key={candidate.id} className="py-3 px-4 tabular-nums text-slate-800 dark:text-slate-200">
                    Industry: <strong>{result.industryScore}%</strong> · Progression: <strong>{result.progressionScore}%</strong>
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  Demonstrated Mandate Skills
                </td>
                {comparedRows.map(({ candidate, result }) => (
                  <td key={candidate.id} className="py-3 px-4 text-emerald-700 dark:text-emerald-400 leading-relaxed">
                    {result.skillsGap.demonstratedSkills}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  Missing Required Skills
                </td>
                {comparedRows.map(({ candidate, result }) => (
                  <td key={candidate.id} className="py-3 px-4 text-amber-700 dark:text-amber-400 leading-relaxed">
                    {result.skillsGap.missingRequiredSkills}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  Executive Pedigree & Companies
                </td>
                {comparedRows.map(({ candidate }) => (
                  <td key={candidate.id} className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {candidate.profile?.companiesWorkedAt}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                  Recommendation Summary
                </td>
                {comparedRows.map(({ candidate, result }) => (
                  <td key={candidate.id} className="py-3 px-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                    {result.explanation.recommendationRationale}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
