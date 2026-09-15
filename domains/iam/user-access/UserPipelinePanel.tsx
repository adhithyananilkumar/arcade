'use client';

import { useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Crown,
  Loader2,
  Search,
  Shield,
  ShieldCheck,
  ShieldMinus,
  ShieldPlus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import type { IamPipelineStatus, PolicySummary } from '@/domains/identity';
import { ComplianceBadge } from './ComplianceBadge';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLATFORM_ADMIN = 'PLATFORM_ADMIN';
const PLATFORM_OWNER = 'PLATFORM_OWNER';

// ─── Admin role danger zone ────────────────────────────────────────────────────

function AdminRoleSection({
  status,
  busy,
  canManageAdminRole,
  onSetAdminRole,
}: {
  status: IamPipelineStatus;
  busy: boolean;
  canManageAdminRole: boolean;
  onSetAdminRole: (roleCode: string, enable: boolean) => void;
}) {
  const heldRoleCodes = new Set(status.assignedPolicies.map((p) => p.code));
  const hasAdmin = heldRoleCodes.has(PLATFORM_ADMIN);
  const hasOwner = heldRoleCodes.has(PLATFORM_OWNER);

  const rows: { code: string; label: string; description: string; held: boolean }[] = [
    {
      code: PLATFORM_ADMIN,
      label: 'Platform Administrator',
      description: 'Broad platform operations access (users, roles, channels, system settings).',
      held: hasAdmin,
    },
    {
      code: PLATFORM_OWNER,
      label: 'Platform Owner',
      description: 'Unrestricted access to every permission on the platform. Grant with care.',
      held: hasOwner,
    },
  ];

  if (!canManageAdminRole) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2">
        <Crown size={14} className="text-amber-500" />
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          Admin Role
        </h3>
      </div>
      <div className="rounded-xl border border-amber-100 bg-amber-50/40 divide-y divide-amber-100/80 overflow-hidden">
        {rows.map((row) => (
          <div key={row.code} className="flex items-center justify-between gap-4 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">{row.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{row.description}</p>
            </div>
            <button
              type="button"
              disabled={busy}
              onClick={() => onSetAdminRole(row.code, !row.held)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                row.held
                  ? 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50'
                  : 'bg-[#14142b] text-white hover:bg-[#232735]'
              }`}
            >
              {row.held ? <ShieldMinus size={13} /> : <ShieldPlus size={13} />}
              {row.held ? 'Revoke' : 'Grant'}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Policies (assigned / available) ──────────────────────────────────────────

function PolicyCard({
  policy,
  action,
}: {
  policy: PolicySummary;
  action: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 p-3.5 rounded-xl border border-gray-100 bg-white">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-[#14142b] shrink-0" />
          <p className="text-sm font-semibold text-gray-900 truncate">{policy.displayName}</p>
          {policy.isSystemRole && (
            <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-500 rounded-full">
              System
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          {policy.permissionCount} permission{policy.permissionCount === 1 ? '' : 's'}
        </p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
}

function PoliciesSection({
  status,
  busy,
  onAssignPolicy,
  onRevokePolicy,
}: {
  status: IamPipelineStatus;
  busy: boolean;
  onAssignPolicy: (policyId: string) => void;
  onRevokePolicy: (policyId: string) => void;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Policies</h3>
        <span className="text-xs text-gray-400">
          {status.assignedPolicies.length} assigned
        </span>
      </div>

      {status.assignedPolicies.length === 0 ? (
        <div className="text-xs text-gray-400 italic text-center py-4 border border-dashed border-gray-200 rounded-xl">
          No policies assigned.
        </div>
      ) : (
        <div className="space-y-2">
          {status.assignedPolicies.map((p) => (
            <PolicyCard
              key={p.id}
              policy={p}
              action={
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onRevokePolicy(p.id)}
                  className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-50"
                  title="Revoke policy"
                >
                  <Trash2 size={14} />
                </button>
              }
            />
          ))}
        </div>
      )}

      {status.availablePolicies.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-xs font-semibold text-[#14142b] hover:text-[#232735] list-none flex items-center gap-1">
            <ChevronRight size={12} className="group-open:hidden" />
            <ChevronDown size={12} className="hidden group-open:block" />
            {status.availablePolicies.length} more available polic
            {status.availablePolicies.length === 1 ? 'y' : 'ies'}
          </summary>
          <div className="space-y-2 mt-2">
            {status.availablePolicies.map((p) => (
              <PolicyCard
                key={p.id}
                policy={p}
                action={
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => onAssignPolicy(p.id)}
                    className="px-2.5 py-1 text-xs font-bold text-[#14142b] bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    Assign
                  </button>
                }
              />
            ))}
          </div>
        </details>
      )}
    </section>
  );
}

// ─── Granular permission customization ─────────────────────────────────────────

function GranularPermissionsSection({
  status,
  busy,
  onSave,
}: {
  status: IamPipelineStatus;
  busy: boolean;
  onSave: (permissionIds: string[]) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState(false);

  const currentlyAssignedIds = useMemo(
    () =>
      status.policies.flatMap((p) => p.permissions.filter((perm) => perm.assigned).map((perm) => perm.id)),
    [status.policies]
  );
  const [selectedIds, setSelectedIds] = useState<string[]>(currentlyAssignedIds);
  const [dirty, setDirty] = useState(false);

  // Re-sync local selection whenever the server state changes underneath us
  // (e.g. after a policy was assigned/revoked elsewhere in this drawer).
  const syncKey = currentlyAssignedIds.slice().sort().join(',');
  const [lastSyncKey, setLastSyncKey] = useState(syncKey);
  if (syncKey !== lastSyncKey && !dirty) {
    setSelectedIds(currentlyAssignedIds);
    setLastSyncKey(syncKey);
  }

  const filteredPolicies = useMemo(() => {
    if (!search.trim()) return status.policies;
    const q = search.toLowerCase();
    return status.policies
      .map((policy) => ({
        ...policy,
        permissions: policy.permissions.filter(
          (perm) => perm.code.toLowerCase().includes(q) || (perm.name ?? '').toLowerCase().includes(q)
        ),
      }))
      .filter((policy) => policy.permissions.length > 0);
  }, [status.policies, search]);

  const toggle = (id: string) => {
    setDirty(true);
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleGroup = (ids: string[], select: boolean) => {
    setDirty(true);
    setSelectedIds((prev) =>
      select ? [...new Set([...prev, ...ids])] : prev.filter((x) => !ids.includes(x))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(selectedIds);
      setDirty(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-2 text-left"
      >
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-slate-400" />
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Customize Individual Permissions
          </h3>
        </div>
        {open ? <ChevronDown size={14} className="text-gray-400" /> : <ChevronRight size={14} className="text-gray-400" />}
      </button>

      {open && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500">
            Grant or revoke specific permissions instead of a whole policy. You can only change
            permissions you hold yourself, unless you are a Platform Owner.
          </p>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search permissions…"
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-medium focus:border-[#14142b]/30 focus:bg-white focus:ring-2 focus:ring-slate-200 outline-none"
            />
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {filteredPolicies.length === 0 ? (
              <div className="text-xs text-gray-400 italic text-center py-4">
                No permissions match &quot;{search}&quot;.
              </div>
            ) : (
              filteredPolicies.map((policy) => {
                const ids = policy.permissions.map((p) => p.id);
                const allSelected = ids.every((id) => selectedIds.includes(id));
                const someSelected = ids.some((id) => selectedIds.includes(id));
                return (
                  <div key={policy.id} className="border border-gray-100 rounded-lg overflow-hidden">
                    <div className="flex items-center gap-2.5 px-3 py-2 bg-gray-50">
                      <button
                        type="button"
                        onClick={() => toggleGroup(ids, !allSelected)}
                        className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                          allSelected
                            ? 'bg-[#14142b] border-[#14142b] text-white'
                            : someSelected
                            ? 'bg-slate-300 border-slate-400'
                            : 'border-gray-300 bg-white'
                        }`}
                      >
                        {(allSelected || someSelected) && <Check size={9} strokeWidth={3} />}
                      </button>
                      <span className="text-xs font-semibold text-gray-700">{policy.displayName}</span>
                      <span className="text-[10px] text-gray-400 ml-auto">
                        {ids.filter((id) => selectedIds.includes(id)).length}/{ids.length}
                      </span>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {policy.permissions.map((perm) => {
                        const isSelected = selectedIds.includes(perm.id);
                        return (
                          <label
                            key={perm.id}
                            className={`flex items-center gap-2.5 px-3 py-1.5 cursor-pointer transition-colors ${
                              isSelected ? 'bg-slate-50' : 'hover:bg-gray-50/60'
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={isSelected}
                              onChange={() => toggle(perm.id)}
                            />
                            <div
                              className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? 'bg-[#14142b] border-[#14142b] text-white'
                                  : 'border-gray-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check size={9} strokeWidth={3} />}
                            </div>
                            <span className="text-xs text-gray-700 font-mono truncate">{perm.code}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            {dirty && <span className="text-[11px] text-amber-600 font-medium mr-auto">Unsaved changes</span>}
            <button
              type="button"
              disabled={!dirty || saving || busy}
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-[#14142b] rounded-lg hover:bg-[#232735] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              Save Permissions
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

// ─── Admin tasks ────────────────────────────────────────────────────────────────

function TasksSection({
  status,
  busy,
  onAssignTask,
  onRevokeTask,
}: {
  status: IamPipelineStatus;
  busy: boolean;
  onAssignTask: (taskCode: string) => void;
  onRevokeTask: (taskCode: string) => void;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Admin Tasks</h3>
        <span className="text-xs text-gray-400">{status.assignedTasks.length} assigned</span>
      </div>

      {status.assignedTasks.length === 0 ? (
        <div className="text-xs text-gray-400 italic text-center py-4 border border-dashed border-gray-200 rounded-xl">
          No tasks assigned.
        </div>
      ) : (
        <div className="space-y-2">
          {status.assignedTasks.map((t) => (
            <div key={t.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 bg-white">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 truncate">{t.name}</p>
                  <span
                    className={`shrink-0 px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                      t.isSatisfied
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {t.isSatisfied ? 'Satisfied' : 'Missing Policy'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{t.category}</p>
              </div>
              <button
                type="button"
                disabled={busy}
                onClick={() => onRevokeTask(t.code)}
                className="shrink-0 p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors disabled:opacity-50"
                title="Revoke task"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {status.availableTasks.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-xs font-semibold text-[#14142b] hover:text-[#232735] list-none flex items-center gap-1">
            <ChevronRight size={12} className="group-open:hidden" />
            <ChevronDown size={12} className="hidden group-open:block" />
            {status.availableTasks.length} more available task{status.availableTasks.length === 1 ? '' : 's'}
          </summary>
          <div className="space-y-2 mt-2">
            {status.availableTasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 bg-white">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{t.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.category}</p>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onAssignTask(t.code)}
                  className="shrink-0 px-2.5 py-1 text-xs font-bold text-[#14142b] bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  Assign
                </button>
              </div>
            ))}
          </div>
        </details>
      )}
    </section>
  );
}

// ─── Main panel ─────────────────────────────────────────────────────────────────

export interface UserPipelinePanelProps {
  status: IamPipelineStatus;
  busy: boolean;
  canManageAdminRole: boolean;
  onAssignPolicy: (policyId: string) => void;
  onRevokePolicy: (policyId: string) => void;
  onSavePermissions: (permissionIds: string[]) => Promise<void>;
  onAssignTask: (taskCode: string) => void;
  onRevokeTask: (taskCode: string) => void;
  onSetAdminRole: (roleCode: string, enable: boolean) => void;
}

export function UserPipelinePanel({
  status,
  busy,
  canManageAdminRole,
  onAssignPolicy,
  onRevokePolicy,
  onSavePermissions,
  onAssignTask,
  onRevokeTask,
  onSetAdminRole,
}: UserPipelinePanelProps) {
  return (
    <div className="space-y-6">
      {/* Compliance summary */}
      <section className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={14} className="text-[#14142b]" />
            <span className="text-sm font-semibold text-gray-900">
              {status.roleDisplayName ?? 'No Role'}
            </span>
          </div>
          <ComplianceBadge status={status.complianceStatus} />
        </div>
        {status.complianceNotes.length > 0 && (
          <ul className="text-xs text-gray-500 space-y-0.5 pl-0.5">
            {status.complianceNotes.map((n, i) => (
              <li key={i}>{n}</li>
            ))}
          </ul>
        )}
      </section>

      <AdminRoleSection
        status={status}
        busy={busy}
        canManageAdminRole={canManageAdminRole}
        onSetAdminRole={onSetAdminRole}
      />

      <PoliciesSection
        status={status}
        busy={busy}
        onAssignPolicy={onAssignPolicy}
        onRevokePolicy={onRevokePolicy}
      />

      <GranularPermissionsSection status={status} busy={busy} onSave={onSavePermissions} />

      <TasksSection
        status={status}
        busy={busy}
        onAssignTask={onAssignTask}
        onRevokeTask={onRevokeTask}
      />
    </div>
  );
}
