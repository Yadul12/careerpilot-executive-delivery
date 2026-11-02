import React, { useState } from 'react';
import { ExecutiveClient, RoleName } from '../types.ts';
import {
  Search,
  UserPlus,
  Upload,
  FileText,
  X,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

interface ClientsModuleProps {
  clients: ExecutiveClient[];
  userRole: RoleName;
  onOnboardClient: (payload: any) => Promise<void>;
  onUploadResume: (
    clientId: number,
    fileData: { filename: string; fileType: string; fileSize: number }
  ) => Promise<void>;
}

export const ClientsModule: React.FC<ClientsModuleProps> = ({
  clients,
  userRole,
  onOnboardClient,
  onUploadResume,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedClient, setSelectedClient] = useState<ExecutiveClient | null>(
    clients[0] || null
  );
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Onboarding Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '+1 (415) 890-0192',
    linkedinUrl: 'https://linkedin.com/in/',
    currentDesignation: 'Chief Technology Officer',
    currentEmployer: '',
    yearsOfExperience: 18,
    location: 'San Francisco, CA',
    targetCompMin: 420000,
    targetCompMax: 600000,
    assignedOwnerName: 'Elena Vance',
    programTier: 'Board & CTO Advisory',
    technologySpecialisation: 'AI Infrastructure, Distributed Cloud & Platform Engineering',
    leadershipExperience:
      'Scaled multi-region engineering organization of 220+ engineers; owned $90M R&D budget and board technical reporting.',
    coreCompetencies:
      'Distributed Systems, Kubernetes, LLM Production Inference, M&A Due Diligence, Org Scaling',
    targetJobTitles: 'Chief Technology Officer (CTO), SVP of Engineering, VP Platform',
    preferredIndustries: 'Enterprise AI, Cloud Infrastructure, FinTech',
    targetCompanies: 'Anthropic, Databricks, Stripe, Snowflake, Cloudflare',
    preferredLocations: 'San Francisco Bay Area, New York, Remote',
    salaryExpectations: '$420k – $600k Base + 1.0%–1.5% Equity',
    careerObjectives:
      'Partner with a high-growth Series C+ or public technology enterprise as CTO leading global engineering transformation.',
    resumeFilename: '',
    resumeFileType: '',
    resumeFileSize: 0,
  });

  const canManageClients =
    userRole === 'Administrator' || userRole === 'Client Delivery Owner';

  const statusTabs = ['All', 'Onboarding', 'Active', 'Interviewing', 'Offer Stage'];

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      !search ||
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.currentDesignation.toLowerCase().includes(search.toLowerCase()) ||
      c.currentEmployer.toLowerCase().includes(search.toLowerCase()) ||
      (c.profile?.technologySpecialisation || '')
        .toLowerCase()
        .includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeClient =
    clients.find((c) => c.id === selectedClient?.id) || filteredClients[0] || null;

  const handleResumeFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetClientId?: number
  ) => {
    setUploadError(null);
    setUploadFeedback(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const lower = file.name.toLowerCase();
    if (!lower.endsWith('.pdf') && !lower.endsWith('.docx') && !lower.endsWith('.doc')) {
      setUploadError('Invalid file format. Please upload a PDF (.pdf) or Word (.docx) document.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File exceeds 10 MB limit.');
      return;
    }

    if (targetClientId) {
      try {
        setSubmitting(true);
        await onUploadResume(targetClientId, {
          filename: file.name,
          fileType: file.type || 'application/pdf',
          fileSize: file.size,
        });
        setUploadFeedback(`Validated and stored "${file.name}" (${Math.round(file.size / 1024)} KB)`);
      } catch (err: any) {
        setUploadError(err.message || 'Resume upload failed');
      } finally {
        setSubmitting(false);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        resumeFilename: file.name,
        resumeFileType: file.type || 'application/pdf',
        resumeFileSize: file.size,
      }));
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await onOnboardClient(formData);
      setShowOnboardModal(false);
      setFormData((prev) => ({
        ...prev,
        fullName: '',
        email: '',
        currentEmployer: '',
        resumeFilename: '',
      }));
    } catch (err: any) {
      setUploadError(err.message || 'Failed to onboard executive client');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toolbar: Search, Segmented Status Filter, and Primary Onboard CTA */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search executive by name, role, company, or tech stack..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Interactive Filter Tabs (Functional Buttons) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg overflow-x-auto">
            {statusTabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusFilter(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  statusFilter === tab
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {canManageClients && (
          <button
            type="button"
            onClick={() => setShowOnboardModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Onboard Executive Client</span>
          </button>
        )}
      </div>

      {/* Master-Detail Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Client Roster Table/List */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 font-display">
              Executive Client Roster
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
              {filteredClients.length} clients
            </span>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-[680px] overflow-y-auto">
            {filteredClients.map((client) => {
              const isSelected = activeClient?.id === client.id;
              return (
                <button
                  key={client.id}
                  type="button"
                  onClick={() => {
                    setSelectedClient(client);
                    setUploadFeedback(null);
                    setUploadError(null);
                  }}
                  className={`w-full text-left px-5 py-4 transition-colors cursor-pointer block ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-950/30'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {client.fullName}
                    </span>
                    <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                      ${Math.round(client.targetCompMin / 1000)}k–${Math.round(client.targetCompMax / 1000)}k
                    </span>
                  </div>

                  <div className="mt-1 text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {client.currentDesignation} · {client.currentEmployer}
                  </div>

                  {/* Clean unboxed metadata with typographic separators */}
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span>{client.status}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{client.yearsOfExperience} yrs exp</span>
                    <span aria-hidden="true">·</span>
                    <span>{client.location}</span>
                    {client.isSimulated && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>[SIMULATED]</span>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Structured Professional Dossier */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-6">
          {activeClient ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{activeClient.program?.tier || 'Executive Retainer'}</span>
                    <span aria-hidden="true">·</span>
                    <span>Status: {activeClient.status}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">
                      Onboarded {activeClient.onboardingDate}
                    </span>
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-display">
                    {activeClient.fullName}
                  </h2>

                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    {activeClient.currentDesignation} at{' '}
                    <strong className="font-semibold">{activeClient.currentEmployer}</strong>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <span>{activeClient.email}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{activeClient.phone}</span>
                    <span aria-hidden="true">·</span>
                    <span>{activeClient.location}</span>
                    <span aria-hidden="true">·</span>
                    <a
                      href={activeClient.linkedinUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                    >
                      <span>LinkedIn Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0 space-y-1">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Target Compensation Band
                  </div>
                  <div className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                    ${Math.round(activeClient.targetCompMin / 1000)}k – $
                    {Math.round(activeClient.targetCompMax / 1000)}k
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Delivery Lead: {activeClient.assignedOwnerName}
                  </div>
                </div>
              </div>

              {/* Structured Career & Technical Dossier Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Technology Specialisation
                  </div>
                  <p className="text-slate-900 dark:text-slate-100 font-medium">
                    {activeClient.profile?.technologySpecialisation}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Target Executive Roles
                  </div>
                  <p className="text-slate-900 dark:text-slate-100 font-medium">
                    {activeClient.profile?.targetJobTitles}
                  </p>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Executive Leadership & Org Scale Experience ({activeClient.yearsOfExperience} Years)
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
                    {activeClient.profile?.leadershipExperience}
                  </p>
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Core Technical & Governance Competencies
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                    {activeClient.profile?.coreCompetencies}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Target Companies
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 text-xs">
                    {activeClient.profile?.targetCompanies}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Preferred Industries & Geographies
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 text-xs">
                    {activeClient.profile?.preferredIndustries} ·{' '}
                    {activeClient.profile?.preferredLocations}
                  </p>
                </div>

                <div className="md:col-span-2 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Career Objectives & Mandate Thesis
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                    {activeClient.profile?.careerObjectives}
                  </p>
                </div>
              </div>

              {/* Validated Executive Resume Dossier Upload (PDF / DOCX) */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      Executive Resume Dossier:{' '}
                      <span className="font-mono">
                        {activeClient.profile?.resumeFilename || 'No file uploaded'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {activeClient.profile?.resumeFileSize
                        ? `${Math.round(activeClient.profile.resumeFileSize / 1024)} KB · Validated PDF/DOCX Format`
                        : 'Upload PDF or DOCX executive resume (max 10 MB)'}
                    </div>
                  </div>
                </div>

                <label className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload PDF / DOCX</span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleResumeFileSelect(e, activeClient.id)}
                    className="hidden"
                  />
                </label>
              </div>

              {uploadFeedback && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-lg text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{uploadFeedback}</span>
                </div>
              )}

              {uploadError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg text-xs text-red-700 dark:text-red-300">
                  {uploadError}
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-sm text-slate-500">
              Select an executive client from the roster to inspect their structured career profile.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Onboard New Executive Client */}
      {showOnboardModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-3xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 font-display">
                  Onboard New Executive Client
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Create client record, structured executive profile, and delivery program in PostgreSQL
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowOnboardModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Executive Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g., Dr. Helena Vance-Sterling"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Executive Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="helena.sterling@executive.io"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Current Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.currentDesignation}
                    onChange={(e) =>
                      setFormData({ ...formData, currentDesignation: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Current Employer *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.currentEmployer}
                    onChange={(e) =>
                      setFormData({ ...formData, currentEmployer: e.target.value })
                    }
                    placeholder="e.g., Apex Cloud Enterprise"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={45}
                    value={formData.yearsOfExperience}
                    onChange={(e) =>
                      setFormData({ ...formData, yearsOfExperience: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Primary Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Technology Specialisation
                  </label>
                  <input
                    type="text"
                    value={formData.technologySpecialisation}
                    onChange={(e) =>
                      setFormData({ ...formData, technologySpecialisation: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Assigned Client Delivery Owner
                  </label>
                  <select
                    value={formData.assignedOwnerName}
                    onChange={(e) =>
                      setFormData({ ...formData, assignedOwnerName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  >
                    <option value="Elena Vance">Elena Vance (Managing Director)</option>
                    <option value="Marcus Thorne">Marcus Thorne (Principal Strategist)</option>
                    <option value="Priya Nair">Priya Nair (VP Client Delivery)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Target Job Titles
                  </label>
                  <input
                    type="text"
                    value={formData.targetJobTitles}
                    onChange={(e) =>
                      setFormData({ ...formData, targetJobTitles: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Target Companies
                  </label>
                  <input
                    type="text"
                    value={formData.targetCompanies}
                    onChange={(e) =>
                      setFormData({ ...formData, targetCompanies: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Leadership Experience & Org Scope
                </label>
                <textarea
                  rows={2}
                  value={formData.leadershipExperience}
                  onChange={(e) =>
                    setFormData({ ...formData, leadershipExperience: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Career Objectives
                </label>
                <textarea
                  rows={2}
                  value={formData.careerObjectives}
                  onChange={(e) =>
                    setFormData({ ...formData, careerObjectives: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>
                    {formData.resumeFilename
                      ? `Attached: ${formData.resumeFilename}`
                      : 'Attach Executive Resume (.PDF / .DOCX)'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => handleResumeFileSelect(e)}
                    className="hidden"
                  />
                </label>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowOnboardModal(false)}
                    className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg cursor-pointer"
                  >
                    {submitting ? 'Saving to PostgreSQL...' : 'Complete Client Onboarding'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
