import React, { useState, useMemo } from 'react';
import {
  Briefcase,
  Sparkles,
  Search,
  Edit3,
  Save,
  MapPin,
  DollarSign,
  Plus,
  X,
} from 'lucide-react';
import type { JobDescriptionFullRecord } from '../../types_talentiq.ts';

interface JobDescriptionViewProps {
  jobs: JobDescriptionFullRecord[];
  onAnalyseJob: (payload: {
    rawDescription: string;
    jobTitle?: string;
    company?: string;
    location?: string;
    compensationInfo?: string;
  }) => Promise<JobDescriptionFullRecord>;
  onUpdateJob: (id: number, payload: Record<string, any>) => Promise<void>;
  onMatchJob: (jobId: number) => void;
}

const ROLE_CATEGORIES = [
  'All',
  'Executive Leadership',
  'Engineering Leadership',
  'Architecture',
  'Data and Analytics',
  'Infrastructure and Operations',
];

const SAMPLE_JD = `Job Title: Chief Technology Officer (CTO) – Global Cloud & AI Platform
Company: VertexScale Enterprise SaaS
Location: San Francisco, CA (Hybrid)
Compensation: $460,000 – $560,000 Base + 50% Bonus + 1.5% Equity

MANDATE OVERVIEW
VertexScale is seeking a transformational Chief Technology Officer (CTO) with 18+ years of leadership experience to lead our 340-person global engineering, cloud architecture, and applied GenAI organization.

LEADERSHIP EXPECTATIONS
- Partner directly with the CEO, CFO, and Board of Directors on multi-year product-technology roadmap, R&D capital allocation ($65M budget), and M&A technical due diligence.
- Mentor and scale 6 VPs/Directors of Engineering across North America, EMEA, and APAC.

TECHNICAL RESPONSIBILITIES & REQUIREMENTS
- Own multi-region Cloud Native Architecture (AWS/GCP/Azure), Kubernetes & Container Orchestration, and Distributed Systems & Microservices at 99.999% availability.
- Drive GenAI, LLMs & Machine Learning integration into core B2B SaaS workflows and govern Zero-Trust Cybersecurity & Compliance (SOC2 Type II, ISO27001).`;

export const JobDescriptionView: React.FC<JobDescriptionViewProps> = ({
  jobs,
  onAnalyseJob,
  onUpdateJob,
  onMatchJob,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [selectedJobId, setSelectedJobId] = useState<number | null>(jobs[0]?.id ?? null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [newJdForm, setNewJdForm] = useState({
    jobTitle: 'Chief Technology Officer (CTO) – Global Cloud & AI',
    company: 'VertexScale Enterprise SaaS',
    location: 'San Francisco, CA (Hybrid)',
    compensationInfo: '$460,000 – $560,000 + 50% Bonus + Equity',
    rawDescription: SAMPLE_JD,
  });

  const filteredJobs = useMemo(() => {
    const q = search.toLowerCase().trim();
    return jobs.filter((j) => {
      const matchesCat = categoryFilter === 'All' || j.roleCategory === categoryFilter;
      const matchesSearch =
        !q ||
        j.jobTitle.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q) ||
        j.roleCategory.toLowerCase().includes(q) ||
        j.industryRequirements.toLowerCase().includes(q) ||
        j.requirements.some((r) => r.skillName.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [jobs, search, categoryFilter]);

  const activeJob =
    jobs.find((j) => j.id === selectedJobId) || filteredJobs[0] || jobs[0] || null;

  const [editForm, setEditForm] = useState({
    jobTitle: '',
    company: '',
    roleCategory: '',
    seniorityLevel: '',
    yearsOfExperience: 16,
    location: '',
    compensationInfo: '',
    leadershipExpectations: '',
    industryRequirements: '',
    technicalResponsibilities: '',
  });

  const startEditing = (job: JobDescriptionFullRecord) => {
    setEditForm({
      jobTitle: job.jobTitle,
      company: job.company,
      roleCategory: job.roleCategory,
      seniorityLevel: job.seniorityLevel,
      yearsOfExperience: job.yearsOfExperience,
      location: job.location,
      compensationInfo: job.compensationInfo,
      leadershipExpectations: job.leadershipExpectations,
      industryRequirements: job.industryRequirements,
      technicalResponsibilities: job.technicalResponsibilities,
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeJob) return;
    await onUpdateJob(activeJob.id, editForm);
    setIsEditing(false);
  };

  const handleCreateJd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalysing(true);
    try {
      const created = await onAnalyseJob(newJdForm);
      setSelectedJobId(created.id);
      setShowNewModal(false);
    } finally {
      setIsAnalysing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Module D · Job Description Intelligence ({jobs.length} Mandates Indexed)
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Executive Mandate Parsing & Taxonomy Classification
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Extract structured required/preferred competencies, leadership scope, and taxonomy category from executive job descriptions.
          </p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Analyse New Job Description
        </button>
      </div>

      {/* Category Filter & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {ROLE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white dark:bg-blue-600'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter mandates by title, company, skill..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Master-Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Columns: Mandate List */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-200 dark:divide-slate-800 max-h-[680px] overflow-y-auto">
          {filteredJobs.map((job) => {
            const isSelected = activeJob?.id === job.id;
            return (
              <div
                key={job.id}
                onClick={() => {
                  setSelectedJobId(job.id);
                  setIsEditing(false);
                }}
                className={`p-4 transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/70 dark:bg-blue-950/30'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {job.jobTitle}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {job.company} · {job.location}
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold tabular-nums text-blue-600 dark:text-blue-400 shrink-0">
                    {job.yearsOfExperience}+ yrs
                  </span>
                </div>
                <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  {job.roleCategory} · {job.seniorityLevel} · {job.compensationInfo}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 7 Columns: Selected Mandate Intelligence Inspector */}
        <div className="lg:col-span-7">
          {activeJob ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    {activeJob.roleCategory} · {activeJob.seniorityLevel}
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                    {activeJob.jobTitle} — {activeJob.company}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {activeJob.location}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5" /> {activeJob.compensationInfo}
                    </span>
                    <span className="tabular-nums font-medium">
                      Min Experience: {activeJob.yearsOfExperience} Years
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => (isEditing ? setIsEditing(false) : startEditing(activeJob))}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {isEditing ? 'Cancel' : 'Edit Mandate'}
                  </button>
                  <button
                    onClick={() => onMatchJob(activeJob.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Match Candidates
                  </button>
                </div>
              </div>

              {isEditing ? (
                <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={editForm.jobTitle}
                        onChange={(e) => setEditForm({ ...editForm, jobTitle: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Company
                      </label>
                      <input
                        type="text"
                        value={editForm.company}
                        onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Taxonomy Role Category
                      </label>
                      <select
                        value={editForm.roleCategory}
                        onChange={(e) => setEditForm({ ...editForm, roleCategory: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      >
                        {ROLE_CATEGORIES.filter((c) => c !== 'All').map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Required Years of Experience
                      </label>
                      <input
                        type="number"
                        value={editForm.yearsOfExperience}
                        onChange={(e) =>
                          setEditForm({ ...editForm, yearsOfExperience: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Leadership Expectations
                      </label>
                      <textarea
                        rows={2}
                        value={editForm.leadershipExpectations}
                        onChange={(e) =>
                          setEditForm({ ...editForm, leadershipExpectations: e.target.value })
                        }
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                        Technical Responsibilities
                      </label>
                      <textarea
                        rows={2}
                        value={editForm.technicalResponsibilities}
                        onChange={(e) =>
                          setEditForm({ ...editForm, technicalResponsibilities: e.target.value })
                        }
                        className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-500 cursor-pointer"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save Updated Mandate
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-xs">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Leadership Expectations
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed mt-1">
                      {activeJob.leadershipExpectations}
                    </p>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Technical Responsibilities
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 leading-relaxed mt-1">
                      {activeJob.technicalResponsibilities}
                    </p>
                  </div>

                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Industry & Domain Requirements
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 mt-1">
                      {activeJob.industryRequirements}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        Required Competencies
                      </div>
                      <div className="text-slate-800 dark:text-slate-200 font-medium mt-1 leading-relaxed">
                        {activeJob.requirements
                          .filter((r) => r.requirementType === 'Required')
                          .map((r) => r.skillName)
                          .join(' · ')}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        Preferred Competencies
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {activeJob.requirements
                          .filter((r) => r.requirementType === 'Preferred')
                          .map((r) => r.skillName)
                          .join(' · ') || 'Executive Board Advisory'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Modal to Analyse New Job Description */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-2xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Analyse & Classify New Executive Job Description
                </h3>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateJd} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Job Title (Optional Override)
                  </label>
                  <input
                    type="text"
                    value={newJdForm.jobTitle}
                    onChange={(e) => setNewJdForm({ ...newJdForm, jobTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Hiring Organization
                  </label>
                  <input
                    type="text"
                    value={newJdForm.company}
                    onChange={(e) => setNewJdForm({ ...newJdForm, company: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Paste Complete Job Description Text
                </label>
                <textarea
                  rows={9}
                  value={newJdForm.rawDescription}
                  onChange={(e) =>
                    setNewJdForm({ ...newJdForm, rawDescription: e.target.value })
                  }
                  className="w-full p-3 font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAnalysing}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-500 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isAnalysing ? 'Extracting Mandate Intelligence...' : 'Extract & Save to PostgreSQL'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
