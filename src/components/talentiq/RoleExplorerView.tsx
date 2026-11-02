import React, { useState } from 'react';
import { Layers, Plus, X, ShieldCheck } from 'lucide-react';
import type { TechnologyRoleRecord } from '../../types_talentiq.ts';

interface RoleExplorerViewProps {
  roles: TechnologyRoleRecord[];
  userRole: string;
  onCreateRole: (payload: {
    category: string;
    roleTitle: string;
    typicalResponsibilities: string;
    requiredTechnicalKnowledge: string;
    expectedLeadershipExperience: string;
    relevantIndustryExperience: string;
    commonQualifications: string;
    seniorityBand: string;
  }) => Promise<void>;
}

const DEFAULT_CATEGORIES = [
  'All',
  'Executive Leadership',
  'Engineering Leadership',
  'Architecture',
  'Data and Analytics',
  'Infrastructure and Operations',
];

export const RoleExplorerView: React.FC<RoleExplorerViewProps> = ({
  roles,
  userRole,
  onCreateRole,
}) => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    category: 'Executive Leadership',
    roleTitle: '',
    seniorityBand: 'C-Suite / VP',
    typicalResponsibilities: '',
    requiredTechnicalKnowledge: '',
    expectedLeadershipExperience: '',
    relevantIndustryExperience: '',
    commonQualifications: '',
  });

  const categories = Array.from(
    new Set([...DEFAULT_CATEGORIES, ...roles.map((r) => r.category)])
  );

  const filteredRoles =
    selectedCategory === 'All'
      ? roles
      : roles.filter((r) => r.category === selectedCategory);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onCreateRole(form);
      setShowAddModal(false);
      setForm({
        category: 'Executive Leadership',
        roleTitle: '',
        seniorityBand: 'C-Suite / VP',
        typicalResponsibilities: '',
        requiredTechnicalKnowledge: '',
        expectedLeadershipExperience: '',
        relevantIndustryExperience: '',
        commonQualifications: '',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Module C · Technology Role Classification Engine ({roles.length} Benchmark Roles)
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Executive Technology Role Taxonomy Explorer
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Structured competency, responsibility, and leadership benchmarks across Executive Leadership, Engineering Leadership, Architecture, Data & Analytics, and Infrastructure.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Role to Taxonomy
        </button>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white dark:bg-blue-600'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Role Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRoles.map((role) => (
          <div
            key={role.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3"
          >
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  {role.category}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {role.roleTitle}
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {role.seniorityBand}
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Typical Responsibilities:{' '}
                </span>
                <span className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {role.typicalResponsibilities}
                </span>
              </div>

              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Required Technical Knowledge:{' '}
                </span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">
                  {role.requiredTechnicalKnowledge}
                </span>
              </div>

              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Expected Leadership Experience:{' '}
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  {role.expectedLeadershipExperience}
                </span>
              </div>

              <div className="pt-1 border-t border-slate-100 dark:border-slate-800/60 flex flex-wrap justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span>
                  <strong>Industries:</strong> {role.relevantIndustryExperience}
                </span>
                <span>
                  <strong>Qualifications:</strong> {role.commonQualifications}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Role Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Add Executive Technology Role to Taxonomy ({userRole})
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Role Category
                  </label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="e.g., Executive Leadership or AI Governance"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Role Title
                  </label>
                  <input
                    type="text"
                    value={form.roleTitle}
                    onChange={(e) => setForm({ ...form, roleTitle: e.target.value })}
                    placeholder="e.g., Chief AI Officer (CAIO)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Typical Responsibilities
                </label>
                <textarea
                  rows={2}
                  value={form.typicalResponsibilities}
                  onChange={(e) =>
                    setForm({ ...form, typicalResponsibilities: e.target.value })
                  }
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Required Technical Knowledge
                </label>
                <input
                  type="text"
                  value={form.requiredTechnicalKnowledge}
                  onChange={(e) =>
                    setForm({ ...form, requiredTechnicalKnowledge: e.target.value })
                  }
                  placeholder="GenAI, LLMs & Machine Learning, Cloud Native Architecture..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Expected Leadership Experience
                  </label>
                  <input
                    type="text"
                    value={form.expectedLeadershipExperience}
                    onChange={(e) =>
                      setForm({ ...form, expectedLeadershipExperience: e.target.value })
                    }
                    placeholder="15+ years leading AI/Data orgs..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Common Qualifications
                  </label>
                  <input
                    type="text"
                    value={form.commonQualifications}
                    onChange={(e) =>
                      setForm({ ...form, commonQualifications: e.target.value })
                    }
                    placeholder="Ph.D./M.S. in CS or AI"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-500 cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {isSubmitting ? 'Saving Role...' : 'Save Taxonomy Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
