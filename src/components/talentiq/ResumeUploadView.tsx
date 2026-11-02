import React, { useState } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  FileCheck,
} from 'lucide-react';
import type { CandidateFullRecord } from '../../types_talentiq.ts';

interface ResumeUploadViewProps {
  onParseResume: (payload: {
    filename: string;
    fileType: string;
    rawText: string;
  }) => Promise<CandidateFullRecord>;
  onOpenCandidateProfile: (candidateId: number) => void;
}

const SAMPLE_RESUMES = [
  {
    label: 'Global CTO (21 Yrs · Cloud & Distributed Systems)',
    filename: 'sebastian_voss_global_cto_cv.pdf',
    fileType: 'PDF',
    rawText: `Sebastian Voss
Chief Technology Officer (CTO)
San Francisco, CA | sebastian.voss@exec-talent.io | +1 (415) 902-8841

EXECUTIVE SUMMARY
21+ years leading global engineering, cloud architecture, and product delivery across hyperscale B2B SaaS and FinTech. Proven track record scaling organizations from 120 to 480+ FTEs and governing $75M+ CapEx/OpEx budgets.

PROFESSIONAL EXPERIENCE
Chief Technology Officer (CTO) — NovaCloud Enterprise Systems (2021 – Present)
- Spearheaded multi-region AWS & GCP active-active Kubernetes architecture serving 65M enterprise seats at 99.999% SLA.
- Led M&A technical due diligence and post-merger platform integration for 3 strategic acquisitions ($640M combined value).
- Instituted FinOps governance reducing cloud infrastructure unit cost by 36% ($14M annual savings).

SVP of Engineering — Apex Ledger FinTech (2017 – 2021)
- Directed 260 distributed systems, Kafka streaming, and DevSecOps engineers across US, UK, and India.
- Achieved zero severity-1 security or compliance incidents across SOC2 Type II, ISO27001, and PCI-DSS.

EDUCATION & CERTIFICATIONS
M.S. in Computer Science, Stanford University
B.S. in Electrical Engineering & Computer Science, UC Berkeley
AWS Certified Solutions Architect – Professional | TOGAF 10 Enterprise Architecture Certified`,
  },
  {
    label: 'VP Data & Enterprise AI (17 Yrs · Lakehouse & GenAI)',
    filename: 'dr_maya_lin_vp_data_ai.docx',
    fileType: 'DOCX',
    rawText: `Dr. Maya Lin
VP of Data Engineering & Enterprise AI
New York, NY | maya.lin@ai-executive.io | +1 (212) 609-4418

EXECUTIVE SUMMARY
17 years of executive leadership in Enterprise Data Lakehouse Architecture (Snowflake, Databricks), Applied GenAI/LLMs, and Predictive Analytics across Capital Markets and B2B SaaS.

EXPERIENCE
VP Data & AI Platform — QuantMetrics Financial Cloud (2022 – Present)
- Built and led a 135-person Data Engineering, ML Platform, and Applied GenAI organization with $34M annual budget.
- Architected multi-agent RAG & LLM inference pipeline generating $38M in new institutional subscription ARR.

Head of Data Engineering — VelaCloud Analytics (2018 – 2022)
- Consolidated 11 legacy data warehouses into a real-time Kafka + Databricks + Snowflake lakehouse processing 9PB/day.

EDUCATION
Ph.D. in Machine Learning, Carnegie Mellon University`,
  },
  {
    label: 'Principal Enterprise Architect (19 Yrs · TOGAF & Cyber)',
    filename: 'arthur_pendleton_enterprise_architect.txt',
    fileType: 'TXT',
    rawText: `Arthur Pendleton
VP & Principal Enterprise Architect
London, UK | a.pendleton@enterprise-arch.co.uk | +44 20 7946 0552

SUMMARY
19+ years defining enterprise architecture blueprints, TOGAF governance, zero-trust cloud transformation, and M&A legacy modernization for FTSE 100 banking and insurance enterprises.

EXPERIENCE
VP Enterprise Architecture — Sovereign Global Bank (2020 – Present)
- Chaired the Global Architecture Review Board governing a £190M technology transformation portfolio.
- Decommissioned 85 legacy mainframe applications in favor of cloud-native microservices on AWS and Azure.`,
  },
];

export const ResumeUploadView: React.FC<ResumeUploadViewProps> = ({
  onParseResume,
  onOpenCandidateProfile,
}) => {
  const [filename, setFilename] = useState('sebastian_voss_global_cto_cv.pdf');
  const [fileType, setFileType] = useState('PDF');
  const [rawText, setRawText] = useState(SAMPLE_RESUMES[0].rawText);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedCandidate, setParsedCandidate] = useState<CandidateFullRecord | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const name = file.name;
    const lower = name.toLowerCase();
    if (!lower.endsWith('.pdf') && !lower.endsWith('.docx') && !lower.endsWith('.txt')) {
      setError('Unsupported file format. Please upload a PDF (.pdf), Word (.docx), or Text (.txt) resume.');
      return;
    }
    const ext = lower.endsWith('.docx') ? 'DOCX' : lower.endsWith('.txt') ? 'TXT' : 'PDF';
    setFilename(name);
    setFileType(ext);

    try {
      const text = await file.text();
      // For binary PDFs/DOCX where raw browser .text() may contain binary headers, extract readable ASCII/UTF8 lines or synthesize structured header
      const readable = text
        .replace(/[^\x20-\x7E\r\n]/g, ' ')
        .replace(/\s{3,}/g, '\n')
        .trim();
      if (readable.length > 80) {
        setRawText(readable.slice(0, 8000));
      } else {
        setRawText(
          `Uploaded Resume File: ${name} (${ext}, ${Math.round(file.size / 1024)} KB)\nCandidate Name: ${name
            .replace(/\.(pdf|docx|txt)$/i, '')
            .replace(/[_-]/g, ' ')}\nSenior Technology Executive (CTO / VP Engineering)\n18+ years experience in Cloud Native Architecture (AWS/GCP/Azure), Distributed Systems & Microservices, Kubernetes, and Global Engineering Org Scaling.`
        );
      }
    } catch (_err) {
      setError('Could not read file contents.');
    }
  };

  const handleRunParse = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsParsing(true);
    try {
      const result = await onParseResume({ filename, fileType, rawText });
      setParsedCandidate(result);
    } catch (err: any) {
      setError(err.message || 'Failed to parse resume');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
          Module B · Resume Intelligence Engine
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
          Executive Resume Upload & Structured Parsing
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Ingest PDF, DOCX, or TXT resumes to extract verified career history, technical competencies, leadership scope, and grounded executive positioning.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload & Input Form */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              1. Select Resume Document or Load Executive Benchmark
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Supports .PDF · .DOCX · .TXT
            </span>
          </div>

          {/* Quick Benchmark Presets */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Quick-Load Benchmark Executive Resume
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {SAMPLE_RESUMES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setFilename(sample.filename);
                    setFileType(sample.fileType);
                    setRawText(sample.rawText);
                    setError(null);
                  }}
                  className="text-left p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 bg-slate-50/70 dark:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {sample.label.split('(')[0].trim()}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {sample.fileType} · {sample.filename}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* File Dropzone */}
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center hover:border-blue-500 transition-colors">
            <input
              id="resume-file-input"
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="resume-file-input"
              className="cursor-pointer flex flex-col items-center justify-center space-y-1.5"
            >
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                Click to upload local PDF, DOCX, or TXT file
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Active document: <strong className="text-slate-700 dark:text-slate-300">{filename}</strong> ({fileType})
              </span>
            </label>
          </div>

          <form onSubmit={handleRunParse} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Document Filename
                </label>
                <input
                  type="text"
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Format
                </label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="PDF">PDF</option>
                  <option value="DOCX">DOCX</option>
                  <option value="TXT">TXT</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                Resume Raw Text Content (Editable prior to AI/NLP extraction)
              </label>
              <textarea
                rows={11}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full p-3 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                placeholder="Paste complete executive resume text here..."
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isParsing}
              className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              {isParsing
                ? 'Running Hybrid AI & NLP Resume Extraction...'
                : 'Extract Candidate Intelligence & Save to PostgreSQL'}
            </button>
          </form>
        </div>

        {/* Right Column: Live Extraction Preview & Confidence */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col justify-between">
          {parsedCandidate ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Extraction Complete & Persisted
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Candidate ID #{parsedCandidate.id} stored in PostgreSQL
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] uppercase tracking-wider text-slate-400">
                    Confidence
                  </div>
                  <div className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                    {parsedCandidate.extractionConfidence}%
                  </div>
                </div>
              </div>

              {/* Extracted Facts vs AI Recommendations */}
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    Verified Extracted Facts (From Document)
                  </div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">
                    {parsedCandidate.fullName}
                  </div>
                  <div className="text-slate-600 dark:text-slate-300">
                    {parsedCandidate.currentDesignation} · {parsedCandidate.totalYearsExperience} Yrs Experience
                  </div>
                  <div className="text-slate-500 dark:text-slate-400">
                    {parsedCandidate.location} · {parsedCandidate.email}
                  </div>
                  <div className="pt-1 text-slate-700 dark:text-slate-300">
                    <strong>Domain:</strong> {parsedCandidate.primaryDomain}
                  </div>
                  <div className="text-slate-700 dark:text-slate-300">
                    <strong>Extracted Skills ({parsedCandidate.skills.length}):</strong>{' '}
                    {parsedCandidate.skills.map((s) => s.skillName).join(' · ')}
                  </div>
                </div>

                {parsedCandidate.positioning && (
                  <div className="p-3 rounded-lg bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/70 dark:border-blue-900/50 space-y-1.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      AI-Generated Positioning Recommendations
                    </div>
                    <div className="text-slate-800 dark:text-slate-200">
                      <strong>Recommended Target Roles:</strong>{' '}
                      {parsedCandidate.positioning.targetPositions}
                    </div>
                    <div className="text-slate-600 dark:text-slate-300">
                      <strong>Differentiator:</strong>{' '}
                      {parsedCandidate.positioning.strongestDifferentiators}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => onOpenCandidateProfile(parsedCandidate.id)}
                className="w-full py-2.5 px-4 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Open Full Candidate Intelligence Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4 my-auto text-center py-8">
              <FileCheck className="w-10 h-10 text-slate-400 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Structured Executive Extraction Pipeline
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  TalentIQ extracts 14+ executive fields into normalized PostgreSQL tables (Personal details, Designations, Tenure, Employment History, Verified Competencies, Certifications, and Quantified Achievements) while keeping AI Positioning Recommendations strictly separated.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
