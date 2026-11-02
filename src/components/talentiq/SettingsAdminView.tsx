import React, { useState, useEffect } from 'react';
import {
  Sliders,
  Shield,
  Save,
  RotateCcw,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import type {
  MatchingWeights,
  EvaluationLogRecord,
} from '../../types_talentiq.ts';

interface SettingsAdminViewProps {
  currentRole: string;
  weights: MatchingWeights;
  logs: EvaluationLogRecord[];
  onSwitchRole: (roleName: string) => Promise<void>;
  onUpdateWeights: (weights: Omit<MatchingWeights, 'id' | 'configName' | 'updatedAt'>) => Promise<void>;
}

const TALENTIQ_ROLES = [
  {
    name: 'Administrator',
    desc: 'Full platform governance: configure 7-dimension matching weights, manage role taxonomy, parse resumes/JDs, and audit AI evaluation logs.',
  },
  {
    name: 'Recruitment Analyst',
    desc: 'Operational intelligence: upload/parse executive resumes, analyse job descriptions, run candidate-job matches, and perform skills gap analyses.',
  },
  {
    name: 'Delivery Manager',
    desc: 'Executive advisory & sign-off: review candidate intelligence profiles, approve positioning strategies, compare shortlists, and export client reports.',
  },
];

export const SettingsAdminView: React.FC<SettingsAdminViewProps> = ({
  currentRole,
  weights,
  logs,
  onSwitchRole,
  onUpdateWeights,
}) => {
  const [form, setForm] = useState({
    technicalWeight: weights.technicalWeight,
    leadershipWeight: weights.leadershipWeight,
    seniorityWeight: weights.seniorityWeight,
    domainWeight: weights.domainWeight,
    industryWeight: weights.industryWeight,
    progressionWeight: weights.progressionWeight,
    qualificationWeight: weights.qualificationWeight,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    setForm({
      technicalWeight: weights.technicalWeight,
      leadershipWeight: weights.leadershipWeight,
      seniorityWeight: weights.seniorityWeight,
      domainWeight: weights.domainWeight,
      industryWeight: weights.industryWeight,
      progressionWeight: weights.progressionWeight,
      qualificationWeight: weights.qualificationWeight,
    });
  }, [weights]);

  const totalSum =
    form.technicalWeight +
    form.leadershipWeight +
    form.seniorityWeight +
    form.domainWeight +
    form.industryWeight +
    form.progressionWeight +
    form.qualificationWeight;

  const handleSaveWeights = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setBanner(null);
    try {
      await onUpdateWeights({
        ...form,
        updatedBy: currentRole,
      });
      setBanner(
        'Matching weights saved to PostgreSQL and all stored candidate-job match scores recalculated.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefault = () => {
    setForm({
      technicalWeight: 25,
      leadershipWeight: 20,
      seniorityWeight: 15,
      domainWeight: 15,
      industryWeight: 10,
      progressionWeight: 10,
      qualificationWeight: 5,
    });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
        <div className="text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
          System Governance · RBAC, Configurable Matching Weights & AI Telemetry
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
          Settings, Role Access & Matching Calibration
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Manage enterprise RBAC permissions, calibrate the 7-dimension executive matching weights, and inspect AI/NLP evaluation logs.
        </p>
      </div>

      {banner && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{banner}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Columns: RBAC Role Switcher */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Shield className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Enterprise Role-Based Access Control (RBAC)
            </h2>
          </div>

          <div className="space-y-3">
            {TALENTIQ_ROLES.map((r) => {
              const active = currentRole === r.name;
              return (
                <div
                  key={r.name}
                  onClick={() => onSwitchRole(r.name)}
                  className={`p-3.5 rounded-xl border transition-colors cursor-pointer ${
                    active
                      ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-500'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {r.name}
                    </span>
                    <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                      {active ? 'Active Session Role' : 'Click to Activate'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {r.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 7 Columns: Configurable 7-Dimension Matching Weights */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Configurable 7-Dimension Matching Weights (Module E)
              </h2>
            </div>
            <span className="text-xs font-bold tabular-nums text-slate-700 dark:text-slate-300">
              Total Weight Sum: {totalSum}%
            </span>
          </div>

          <form onSubmit={handleSaveWeights} className="space-y-3 text-xs">
            {[
              { key: 'technicalWeight', label: '1. Technical Skill Alignment (Default 25%)' },
              { key: 'leadershipWeight', label: '2. Leadership Experience & Scale (Default 20%)' },
              { key: 'seniorityWeight', label: '3. Seniority & Tenure Alignment (Default 15%)' },
              { key: 'domainWeight', label: '4. Technology Domain Expertise (Default 15%)' },
              { key: 'industryWeight', label: '5. Industry Vertical Experience (Default 10%)' },
              { key: 'progressionWeight', label: '6. Career Progression Trajectory (Default 10%)' },
              { key: 'qualificationWeight', label: '7. Qualifications & Certifications (Default 5%)' },
            ].map((item) => {
              const val = (form as any)[item.key];
              return (
                <div key={item.key} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-medium text-slate-700 dark:text-slate-300">
                      {item.label}
                    </label>
                    <span className="font-bold tabular-nums text-blue-600 dark:text-blue-400">
                      {val}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={50}
                    value={val}
                    onChange={(e) =>
                      setForm({ ...form, [item.key]: Number(e.target.value) })
                    }
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>
              );
            })}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handleResetDefault}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset to 25/20/15/15/10/10/5
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-500 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving
                  ? 'Recalculating Matches...'
                  : 'Save Weights & Recalculate All Matches'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* AI & Deterministic NLP Evaluation Logs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              AI & Hybrid NLP Evaluation Audit Logs (PostgreSQL `evaluation_logs`)
            </h3>
          </div>
          <span className="text-xs text-slate-500 tabular-nums">{logs.length} Recent Operations</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 px-4">Operation Type</th>
                <th className="py-3 px-4">Engine / Model Used</th>
                <th className="py-3 px-4">Input Summary</th>
                <th className="py-3 px-4">Output Telemetry</th>
                <th className="py-3 px-4 text-right">Latency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                    {log.operationType}
                  </td>
                  <td className="py-3 px-4 text-blue-600 dark:text-blue-400 font-medium">
                    {log.modelUsed}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {log.inputSummary}
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">
                    {log.outputMetadata}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-400">
                    {log.latencyMs} ms
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
