'use client';

import { useEffect, useMemo, useState } from 'react';
import { permissionService, Permission } from '@/domains/identity';
import { Scope } from '../types/iam.types';
import { ChevronDown, ChevronRight, Loader2, X, Plus, Check, Search } from 'lucide-react';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface PolicyEditorProps {
  scope: Scope;
  mode: 'create' | 'edit';
  resourceId?: string;
  policy?: {
    id: string;
    name: string;
    description?: string;
    /** Real permission UUIDs already assigned */
    permissionIds?: string[];
  };
  onSave: (data: {
    name: string;
    description: string;
    effectivePermissionIds: string[];
  }) => Promise<void>;
  onCancel: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatLabel(str: string): string {
  return str
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function groupByModule(permissions: Permission[]): Record<string, Permission[]> {
  const groups: Record<string, Permission[]> = {};
  for (const perm of permissions) {
    const key = perm.module || perm.code.split('.').slice(0, -1).join('.') || 'General';
    if (!groups[key]) groups[key] = [];
    groups[key].push(perm);
  }
  return groups;
}

// ─── Permission Group ─────────────────────────────────────────────────────────

function PermissionGroup({
  groupName,
  permissions,
  selectedIds,
  onToggle,
  onToggleAll,
}: {
  groupName: string;
  permissions: Permission[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  onToggleAll: (ids: string[], select: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const groupIds = permissions.map((p) => p.id);
  const allSelected = groupIds.every((id) => selectedIds.includes(id));
  const someSelected = groupIds.some((id) => selectedIds.includes(id));

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      {/* Group header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 select-none">
        {/* Group-level checkbox */}
        <button
          type="button"
          onClick={() => onToggleAll(groupIds, !allSelected)}
          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
            allSelected
              ? 'bg-indigo-600 border-indigo-600 text-white'
              : someSelected
              ? 'bg-indigo-200 border-indigo-400 text-white'
              : 'border-gray-300 hover:border-indigo-400 bg-white'
          }`}
        >
          {(allSelected || someSelected) && <Check size={10} strokeWidth={3} />}
        </button>

        <button
          type="button"
          className="flex-1 flex items-center gap-2 text-left"
          onClick={() => setExpanded((e) => !e)}
        >
          <span className="text-sm font-semibold text-gray-800">{formatLabel(groupName)}</span>
          <span className="text-xs text-gray-400">
            {someSelected
              ? `${groupIds.filter((id) => selectedIds.includes(id)).length}/${permissions.length}`
              : permissions.length}
          </span>
          <span className="ml-auto text-gray-400">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        </button>
      </div>

      {/* Permission rows */}
      {expanded && (
        <div className="divide-y divide-gray-50">
          {permissions.map((perm) => {
            const isSelected = selectedIds.includes(perm.id);
            return (
              <label
                key={perm.id}
                className={`flex items-start gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                  isSelected ? 'bg-indigo-50/40' : 'hover:bg-gray-50/60'
                }`}
              >
                <div
                  className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-gray-300 hover:border-indigo-400 bg-white'
                  }`}
                >
                  {isSelected && <Check size={10} strokeWidth={3} />}
                </div>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isSelected}
                  onChange={() => onToggle(perm.id)}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-800 font-mono">
                    {perm.code}
                  </p>
                  {perm.description && (
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                      {perm.description}
                    </p>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Editor ──────────────────────────────────────────────────────────────

export function PolicyEditor({
  scope,
  mode,
  policy,
  onSave,
  onCancel,
}: PolicyEditorProps) {
  const [name, setName] = useState(policy?.name ?? '');
  const [description, setDescription] = useState(policy?.description ?? '');
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(policy?.permissionIds ?? []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);
  const [search, setSearch] = useState('');

  // ── Load ──────────────────────────────────────────────────────────────────

  useEffect(() => {
    setName(policy?.name ?? '');
    setDescription(policy?.description ?? '');
    setSelectedIds(policy?.permissionIds ?? []);
    setTouched(false);
    setSearch('');

    permissionService
      .getAllPermissions(scope === 'PUBLISHER' ? undefined : scope)
      .then((perms) => setAllPermissions(perms))
      .catch(() => setAllPermissions([]))
      .finally(() => setLoading(false));
  }, [policy?.id, scope]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived ───────────────────────────────────────────────────────────────
  // allPermissions is already filtered to this scope by the backend — the frontend
  // must never re-derive scope from a permission's code or infer it locally.

  const filtered = useMemo(() => {
    if (!search.trim()) return allPermissions;
    const q = search.toLowerCase();
    return allPermissions.filter(
      (p) =>
        p.code.toLowerCase().includes(q) ||
        (p.description ?? '').toLowerCase().includes(q) ||
        (p.module ?? '').toLowerCase().includes(q)
    );
  }, [allPermissions, search]);

  const grouped = useMemo(() => groupByModule(filtered), [filtered]);
  const groupKeys = Object.keys(grouped).sort();

  // ── Handlers ──────────────────────────────────────────────────────────────

  const toggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = (ids: string[], select: boolean) => {
    setSelectedIds((prev) =>
      select
        ? [...new Set([...prev, ...ids])]
        : prev.filter((x) => !ids.includes(x))
    );
  };

  const nameError = touched && name.trim().length === 0;
  const canSave = name.trim().length > 0;

  const handleSave = async () => {
    setTouched(true);
    if (!canSave) return;
    try {
      setSaving(true);
      await onSave({
        name: name.trim(),
        description: description.trim(),
        effectivePermissionIds: selectedIds,
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col max-h-[90vh] w-full bg-white rounded-2xl overflow-hidden font-sans">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {mode === 'create' ? 'New Policy' : 'Edit Policy'}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Scope: <span className="font-medium text-gray-600">{scope}</span>
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 space-y-6">

          {/* Policy Information */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Policy Information
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Policy Name <span className="text-red-500">*</span>
              </label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setTouched(true); }}
                placeholder="e.g. BCA Faculty Moderators"
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition-all ${
                  nameError
                    ? 'border-red-400 ring-1 ring-red-400'
                    : 'border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                }`}
              />
              {nameError && (
                <p className="mt-1 text-xs text-red-600">Policy name is required.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what this policy allows…"
                rows={2}
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none"
              />
            </div>
          </section>

          {/* Permissions */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Permissions
              </h3>
              {selectedIds.length > 0 && (
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                  {selectedIds.length} selected
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
              </div>
            ) : allPermissions.length === 0 ? (
              <div className="text-sm text-gray-400 italic text-center py-10 border border-dashed border-gray-200 rounded-xl">
                No permissions available for this scope.
              </div>
            ) : (
              <>
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search permissions…"
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>

                {/* Groups */}
                {groupKeys.length > 0 ? (
                  <div className="space-y-2">
                    {groupKeys.map((key) => (
                      <PermissionGroup
                        key={key}
                        groupName={key}
                        permissions={grouped[key]}
                        selectedIds={selectedIds}
                        onToggle={toggle}
                        onToggleAll={toggleAll}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 italic text-center py-6 border border-dashed border-gray-200 rounded-xl">
                    No permissions match "{search}".
                  </div>
                )}
              </>
            )}
          </section>

        </div>
      </div>

      {/* Footer */}
      <div className="shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/60">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          {saving ? 'Saving…' : mode === 'edit' ? 'Update Policy' : 'Create Policy'}
        </button>
      </div>

    </div>
  );
}
