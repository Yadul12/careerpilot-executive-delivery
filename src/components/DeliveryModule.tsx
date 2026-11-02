import React, { useState } from 'react';
import {
  DeliveryTaskItem,
  DeliverableItem,
  ActivityLogItem,
  ExecutiveClient,
  RoleName,
} from '../types.ts';
import {
  AlertTriangle,
  Plus,
  CheckCircle2,
  Clock,
  FileCheck,
  X,
} from 'lucide-react';

interface DeliveryModuleProps {
  tasks: DeliveryTaskItem[];
  deliverables: DeliverableItem[];
  activityLogs: ActivityLogItem[];
  clients: ExecutiveClient[];
  userRole: RoleName;
  onCreateTask: (payload: any) => Promise<void>;
  onUpdateTaskStatus: (taskId: number, status: string, internalNotes?: string) => Promise<void>;
  onCreateDeliverable: (payload: any) => Promise<void>;
  onUpdateDeliverableApproval: (deliverableId: number, approvalStatus: string) => Promise<void>;
}

export const DeliveryModule: React.FC<DeliveryModuleProps> = ({
  tasks,
  deliverables,
  activityLogs,
  clients,
  userRole,
  onCreateTask,
  onUpdateTaskStatus,
  onCreateDeliverable,
  onUpdateDeliverableApproval,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>('All');
  const [taskFilter, setTaskFilter] = useState<string>('All');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showDeliverableModal, setShowDeliverableModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newTask, setNewTask] = useState({
    clientId: clients[0]?.id || 1,
    assignedToName: 'Elena Vance',
    title: '',
    description: '',
    category: 'Interview Prep',
    priority: 'High',
    dueDate: '2026-11-08',
    internalNotes: '',
  });

  const [newDeliverable, setNewDeliverable] = useState({
    clientId: clients[0]?.id || 1,
    ownerName: 'Elena Vance',
    title: '',
    deliverableType: '90-Day CTO Charter',
    dueDate: '2026-11-09',
    version: 'v1.0',
    notes: '',
  });

  const filteredTasks = tasks.filter((t) => {
    const matchesClient =
      selectedClientId === 'All' || t.clientId === Number(selectedClientId);
    const matchesStatus = taskFilter === 'All' || t.status === taskFilter;
    return matchesClient && matchesStatus;
  });

  const filteredDeliverables = deliverables.filter(
    (d) => selectedClientId === 'All' || d.clientId === Number(selectedClientId)
  );

  const filteredLogs = activityLogs.filter(
    (l) => selectedClientId === 'All' || l.clientId === Number(selectedClientId)
  );

  const overdueTasksCount = tasks.filter((t) => t.status === 'Overdue').length;
  const overdueDeliverablesCount = deliverables.filter(
    (d) => d.status === 'Overdue'
  ).length;
  const pendingApprovalsCount = deliverables.filter(
    (d) => d.clientApprovalStatus === 'Pending Approval'
  ).length;

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await onCreateTask(newTask);
      setShowTaskModal(false);
      setNewTask((prev) => ({ ...prev, title: '', description: '', internalNotes: '' }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeliverableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await onCreateDeliverable(newDeliverable);
      setShowDeliverableModal(false);
      setNewDeliverable((prev) => ({ ...prev, title: '', notes: '' }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overdue Task & Deliverable Alert Banner */}
      {(overdueTasksCount > 0 || overdueDeliverablesCount > 0) && (
        <div className="p-4 bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-bold text-red-900 dark:text-red-200">
                Delivery SLA Alert: {overdueTasksCount} Overdue Tasks &{' '}
                {overdueDeliverablesCount} Overdue Client Deliverables
              </h3>
              <p className="text-xs text-red-700 dark:text-red-300 mt-0.5">
                Executive panel preparation charters and Wave 3 outreach deliverables require immediate owner action or client sign-off.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setTaskFilter('Overdue')}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
          >
            Filter Overdue Tasks
          </button>
        </div>
      )}

      {/* Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-xl">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
          >
            <option value="All">All Executive Clients ({clients.length})</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.fullName} — Owner: {c.assignedOwnerName}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg">
            {['All', 'Overdue', 'In Progress', 'Awaiting Client', 'Completed'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setTaskFilter(st)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  taskFilter === st
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {userRole !== 'Client' && (
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowDeliverableModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Submit Deliverable</span>
            </button>
            <button
              type="button"
              onClick={() => setShowTaskModal(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Tasks + Client Deliverables & Approvals + Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Columns: Tasks & Deliverables */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tasks Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 font-display">
                  Client Delivery Tasks & SLA Deadlines
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Track internal notes, account manager ownership, and completion status
                </p>
              </div>
              <span className="text-xs font-mono tabular-nums text-slate-500">
                {filteredTasks.length} tasks
              </span>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredTasks.map((task) => (
                <div key={task.id} className="p-5 space-y-2.5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {task.clientName}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Owner: {task.assignedToName}</span>
                        <span aria-hidden="true">·</span>
                        <span>Priority: {task.priority}</span>
                        <span aria-hidden="true">·</span>
                        <span
                          className={
                            task.status === 'Overdue'
                              ? 'text-red-600 dark:text-red-400 font-semibold'
                              : task.status === 'Completed'
                              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                              : 'text-amber-600 dark:text-amber-400 font-semibold'
                          }
                        >
                          {task.status}
                        </span>
                      </div>

                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {task.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {task.description}
                      </p>

                      {task.internalNotes && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                          Internal Note: {task.internalNotes}
                        </div>
                      )}
                    </div>

                    <div className="text-right shrink-0 space-y-2">
                      <div className="text-xs font-mono tabular-nums text-slate-500 flex items-center justify-end gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Due {task.dueDate}</span>
                      </div>

                      {task.status !== 'Completed' ? (
                        <button
                          type="button"
                          onClick={() => onUpdateTaskStatus(task.id, 'Completed')}
                          className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-md hover:bg-emerald-100 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Complete Task</span>
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                          Done {task.completedAt}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Deliverables & Pending Client Approvals */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 font-display">
                  Executive Deliverables & Client Approvals
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {pendingApprovalsCount} deliverables currently awaiting executive client sign-off
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {filteredDeliverables.map((deliv) => (
                <div key={deliv.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {deliv.clientName}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{deliv.deliverableType}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{deliv.version}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">Due {deliv.dueDate}</span>
                    </div>

                    <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {deliv.title}
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Approval State:{' '}
                      <strong
                        className={
                          deliv.clientApprovalStatus === 'Approved'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : deliv.clientApprovalStatus === 'Changes Requested'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-amber-600 dark:text-amber-400'
                        }
                      >
                        {deliv.clientApprovalStatus}
                      </strong>{' '}
                      · {deliv.notes}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {deliv.clientApprovalStatus !== 'Approved' && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateDeliverableApproval(deliv.id, 'Approved')
                          }
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md cursor-pointer"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateDeliverableApproval(deliv.id, 'Changes Requested')
                          }
                          className="px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                        >
                          Request Changes
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Complete Activity Timeline */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex flex-col">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 font-display">
              Client Program Activity Timeline
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Chronological audit log of deliverables, approvals, and milestones
            </p>
          </div>

          <div className="divide-y divide-slate-200 dark:divide-slate-800 max-h-[820px] overflow-y-auto">
            {filteredLogs.map((log) => (
              <div key={log.id} className="px-6 py-4 space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    <strong className="text-slate-900 dark:text-slate-100">
                      {log.actorName}
                    </strong>{' '}
                    · {log.actionType}
                  </span>
                  <span className="font-mono tabular-nums">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {log.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal: Create Task */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-display">
                Create Client Delivery Task
              </h3>
              <button
                type="button"
                onClick={() => setShowTaskModal(false)}
                className="p-1 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleTaskSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Executive Client *</label>
                <select
                  value={newTask.clientId}
                  onChange={(e) =>
                    setNewTask({ ...newTask, clientId: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g., Prepare 90-Day Board Architecture Thesis"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Internal Advisory Notes</label>
                <input
                  type="text"
                  value={newTask.internalNotes}
                  onChange={(e) =>
                    setNewTask({ ...newTask, internalNotes: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Submit Deliverable */}
      {showDeliverableModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-display">
                Submit Executive Deliverable for Approval
              </h3>
              <button
                type="button"
                onClick={() => setShowDeliverableModal(false)}
                className="p-1 text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleDeliverableSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium mb-1">Executive Client *</label>
                <select
                  value={newDeliverable.clientId}
                  onChange={(e) =>
                    setNewDeliverable({
                      ...newDeliverable,
                      clientId: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fullName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-medium mb-1">Deliverable Title *</label>
                <input
                  type="text"
                  required
                  value={newDeliverable.title}
                  onChange={(e) =>
                    setNewDeliverable({ ...newDeliverable, title: e.target.value })
                  }
                  placeholder="e.g., Board Bio & 90-Day Technical Strategy Deck"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium mb-1">Deliverable Type</label>
                  <select
                    value={newDeliverable.deliverableType}
                    onChange={(e) =>
                      setNewDeliverable({
                        ...newDeliverable,
                        deliverableType: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                  >
                    <option value="Executive Resume">Executive Resume</option>
                    <option value="Board Bio">Board Bio</option>
                    <option value="90-Day CTO Charter">90-Day CTO Charter</option>
                    <option value="Target Market Map">Target Market Map</option>
                    <option value="Interview Briefing Dossier">Interview Briefing Dossier</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={newDeliverable.dueDate}
                    onChange={(e) =>
                      setNewDeliverable({ ...newDeliverable, dueDate: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block font-medium mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={newDeliverable.notes}
                  onChange={(e) =>
                    setNewDeliverable({ ...newDeliverable, notes: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeliverableModal(false)}
                  className="px-4 py-2 text-slate-500 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg cursor-pointer"
                >
                  Submit Deliverable
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
