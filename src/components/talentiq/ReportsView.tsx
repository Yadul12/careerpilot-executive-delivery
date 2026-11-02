import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import {
  FileDown,
  FileSpreadsheet,
  FileText,
  Target,
  AlertTriangle,
} from 'lucide-react';
import type {
  CandidateFullRecord,
  MatchResultFullRecord,
} from '../../types_talentiq.ts';

interface ReportsViewProps {
  candidates: CandidateFullRecord[];
  matches: MatchResultFullRecord[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  candidates,
  matches,
}) => {
  const [selectedCandidateId, setSelectedCandidateId] = useState<number>(
    candidates[0]?.id || 1
  );
  const [selectedMatchId, setSelectedMatchId] = useState<number>(
    matches[0]?.id || 1
  );

  const activeCandidate =
    candidates.find((c) => c.id === selectedCandidateId) || candidates[0];
  const activeMatch =
    matches.find((m) => m.id === selectedMatchId) || matches[0];

  const downloadCsv = (filename: string, rows: string[][]) => {
    const csvContent = rows
      .map((r) => r.map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 1. Candidate Intelligence Report (PDF & CSV)
  const exportCandidatePdf = () => {
    if (!activeCandidate) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('TalentIQ — Executive Candidate Intelligence Report', 14, 20);
    doc.setFontSize(10);
    doc.text(
      `Candidate: ${activeCandidate.fullName} | ${activeCandidate.currentDesignation}`,
      14,
      30
    );
    doc.text(
      `Domain: ${activeCandidate.primaryDomain} | Experience: ${activeCandidate.totalYearsExperience} Years | Confidence: ${activeCandidate.extractionConfidence}%`,
      14,
      37
    );
    doc.text(`Location: ${activeCandidate.location} | Email: ${activeCandidate.email}`, 14, 44);

    const lines = doc.splitTextToSize(
      `LEADERSHIP SCOPE:\n${activeCandidate.profile?.leadershipExperience || ''}\n\nQUANTIFIED ACHIEVEMENTS:\n${activeCandidate.profile?.majorAchievements || ''}\n\nVERIFIED COMPETENCIES:\n${activeCandidate.skills.map((s) => s.skillName).join(' · ')}\n\nTARGET EXECUTIVE POSITIONING:\n${activeCandidate.positioning?.targetPositions || ''}\n\nPOSITIONING ADVICE:\n${activeCandidate.positioning?.resumePositioningAdvice || ''}`,
      180
    );
    doc.text(lines, 14, 55);
    doc.save(`${activeCandidate.fullName.toLowerCase().replace(/\s+/g, '_')}_intelligence_report.pdf`);
  };

  const exportCandidateCsv = () => {
    if (!activeCandidate) return;
    downloadCsv(`${activeCandidate.fullName.toLowerCase().replace(/\s+/g, '_')}_intelligence.csv`, [
      ['Field', 'Value'],
      ['Full Name', activeCandidate.fullName],
      ['Current Designation', activeCandidate.currentDesignation],
      ['Years of Experience', String(activeCandidate.totalYearsExperience)],
      ['Primary Domain', activeCandidate.primaryDomain],
      ['Extraction Confidence', `${activeCandidate.extractionConfidence}%`],
      ['Companies Worked At', activeCandidate.profile?.companiesWorkedAt || ''],
      ['Leadership Experience', activeCandidate.profile?.leadershipExperience || ''],
      ['Major Achievements', activeCandidate.profile?.majorAchievements || ''],
      ['Verified Skills', activeCandidate.skills.map((s) => s.skillName).join(' | ')],
      ['Target Positions', activeCandidate.positioning?.targetPositions || ''],
      ['Positioning Advice', activeCandidate.positioning?.resumePositioningAdvice || ''],
    ]);
  };

  // 2. Job Matching Report (PDF & CSV)
  const exportMatchPdf = () => {
    if (!activeMatch) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('TalentIQ — Executive Job Matching Report', 14, 20);
    doc.setFontSize(10);
    doc.text(
      `Candidate: ${activeMatch.candidateName} (${activeMatch.candidateDesignation})`,
      14,
      30
    );
    doc.text(
      `Target Mandate: ${activeMatch.jobTitle} at ${activeMatch.company} (${activeMatch.roleCategory})`,
      14,
      37
    );
    doc.text(
      `Overall Composite Score: ${activeMatch.overallScore}/100 (${activeMatch.confidenceTier})`,
      14,
      44
    );

    const body = doc.splitTextToSize(
      `7-DIMENSION BREAKDOWN:\nTechnical: ${activeMatch.technicalScore}% | Leadership: ${activeMatch.leadershipScore}% | Seniority: ${activeMatch.seniorityScore}% | Domain: ${activeMatch.domainScore}% | Industry: ${activeMatch.industryScore}% | Progression: ${activeMatch.progressionScore}% | Qualifications: ${activeMatch.qualificationScore}%\n\nRECOMMENDATION RATIONALE:\n${activeMatch.explanation?.recommendationRationale || ''}\n\nMATCHING SKILLS:\n${activeMatch.explanation?.matchingSkills || ''}\n\nPOTENTIAL CONCERNS:\n${activeMatch.explanation?.potentialConcerns || ''}`,
      180
    );
    doc.text(body, 14, 55);
    doc.save(`talentiq_match_report_${activeMatch.id}.pdf`);
  };

  const exportMatchCsv = () => {
    if (!activeMatch) return;
    downloadCsv(`talentiq_match_report_${activeMatch.id}.csv`, [
      ['Metric', 'Value'],
      ['Candidate', activeMatch.candidateName],
      ['Mandate', `${activeMatch.jobTitle} (${activeMatch.company})`],
      ['Overall Score', `${activeMatch.overallScore}%`],
      ['Confidence Tier', activeMatch.confidenceTier],
      ['Technical Alignment', `${activeMatch.technicalScore}%`],
      ['Leadership Experience', `${activeMatch.leadershipScore}%`],
      ['Seniority Alignment', `${activeMatch.seniorityScore}%`],
      ['Domain Expertise', `${activeMatch.domainScore}%`],
      ['Industry Experience', `${activeMatch.industryScore}%`],
      ['Career Progression', `${activeMatch.progressionScore}%`],
      ['Qualifications', `${activeMatch.qualificationScore}%`],
      ['Rationale', activeMatch.explanation?.recommendationRationale || ''],
    ]);
  };

  // 3. Skills Gap Report (PDF & CSV)
  const exportGapPdf = () => {
    if (!activeMatch || !activeMatch.skillsGap) return;
    const g = activeMatch.skillsGap;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('TalentIQ — Executive Skills Gap & Positioning Report', 14, 20);
    doc.setFontSize(10);
    doc.text(
      `Candidate: ${activeMatch.candidateName} | Target Mandate: ${activeMatch.jobTitle} (${activeMatch.company})`,
      14,
      30
    );
    const body = doc.splitTextToSize(
      `DEMONSTRATED SKILLS:\n${g.demonstratedSkills}\n\nUNMENTIONED PROBABLE SKILLS (INFERRED):\n${g.unmentionedProbableSkills}\n\nGENUINELY MISSING REQUIRED SKILLS:\n${g.missingRequiredSkills}\n\nMISSING PREFERRED SKILLS:\n${g.missingPreferredSkills}\n\nLEADERSHIP GAPS:\n${g.leadershipGaps}\n\nPOSITIONING IMPROVEMENT PLAN:\n${g.positioningImprovementPlan}`,
      180
    );
    doc.text(body, 14, 42);
    doc.save(`talentiq_skills_gap_${activeMatch.id}.pdf`);
  };

  const exportGapCsv = () => {
    if (!activeMatch || !activeMatch.skillsGap) return;
    const g = activeMatch.skillsGap;
    downloadCsv(`talentiq_skills_gap_${activeMatch.id}.csv`, [
      ['Category', 'Details'],
      ['Candidate', activeMatch.candidateName],
      ['Target Mandate', `${activeMatch.jobTitle} (${activeMatch.company})`],
      ['Demonstrated Skills', g.demonstratedSkills],
      ['Unmentioned Probable Skills', g.unmentionedProbableSkills],
      ['Genuinely Missing Required Skills', g.missingRequiredSkills],
      ['Missing Preferred Skills', g.missingPreferredSkills],
      ['Leadership Gaps', g.leadershipGaps],
      ['Industry Gaps', g.industryGaps],
      ['Positioning Improvement Plan', g.positioningImprovementPlan],
    ]);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
          Module I · Executive Report Generation & Export Center
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
          Downloadable Intelligence, Matching & Skills Gap Dossiers
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Generate client-ready PDF and CSV deliverables for executive boards, retained search partners, and candidate advisory sessions.
        </p>
      </div>

      {/* Selectors */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Select Executive Candidate (For Candidate Intelligence Report)
          </label>
          <select
            value={selectedCandidateId}
            onChange={(e) => setSelectedCandidateId(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName} — {c.currentDesignation}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Select Evaluated Candidate-Job Pair (For Matching & Skills Gap Reports)
          </label>
          <select
            value={selectedMatchId}
            onChange={(e) => setSelectedMatchId(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                {m.candidateName} → {m.jobTitle} ({m.company}) [{m.overallScore}%]
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 3 Report Dossier Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card 1: Candidate Intelligence Report */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <FileText className="w-5 h-5" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                1. Candidate Intelligence Report
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Comprehensive dossier containing verified factual resume extraction, leadership scale, technical competencies, and target C-suite positioning strategy.
            </p>
            {activeCandidate && (
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">
                  {activeCandidate.fullName}
                </div>
                <div className="text-slate-600 dark:text-slate-300">
                  {activeCandidate.currentDesignation} · {activeCandidate.totalYearsExperience} Yrs
                </div>
                <div className="text-[11px] text-slate-500">
                  Target: {activeCandidate.positioning?.targetPositions}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={exportCandidatePdf}
              className="py-2 px-3 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              Download PDF
            </button>
            <button
              onClick={exportCandidateCsv}
              className="py-2 px-3 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Card 2: Job Matching Report */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
              <Target className="w-5 h-5" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                2. Job Matching Report
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Full 7-dimension weighted scorecard (Technical, Leadership, Seniority, Domain, Industry, Progression, Qualifications) with explainable recommendation rationale.
            </p>
            {activeMatch && (
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">
                  {activeMatch.candidateName} → {activeMatch.jobTitle}
                </div>
                <div className="text-slate-600 dark:text-slate-300 tabular-nums">
                  Score: <strong>{activeMatch.overallScore}%</strong> ({activeMatch.confidenceTier})
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {activeMatch.company} · {activeMatch.roleCategory}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={exportMatchPdf}
              className="py-2 px-3 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              Download PDF
            </button>
            <button
              onClick={exportMatchCsv}
              className="py-2 px-3 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Card 3: Skills Gap Report */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="w-5 h-5" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                3. Skills Gap & Positioning Report
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Detailed breakdown of Demonstrated Skills, Inferred Probable Skills (omitted from CV), Genuinely Missing Skills, and a step-by-step Resume Improvement Plan.
            </p>
            {activeMatch?.skillsGap && (
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs space-y-1">
                <div className="font-bold text-slate-900 dark:text-white">
                  Gap Audit: {activeMatch.candidateName}
                </div>
                <div className="text-slate-600 dark:text-slate-300 truncate">
                  Missing Req: {activeMatch.skillsGap.missingRequiredSkills}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  Inferred: {activeMatch.skillsGap.unmentionedProbableSkills}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={exportGapPdf}
              className="py-2 px-3 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" />
              Download PDF
            </button>
            <button
              onClick={exportGapCsv}
              className="py-2 px-3 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
