'use client';

import { useEffect, useMemo, useState } from 'react';
import { Loader2, X, ShieldAlert, ShieldCheck } from 'lucide-react';
import { permissionService, Permission } from '@/domains/identity';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { Scope } from '../types/iam.types';
import { PermissionSelector, SURFACE_LABEL, SURFACE_ORDER } from './PermissionSelector';

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

const SCOPE_LABEL: Record<Scope, string> = {
  PLATFORM: 'Platform',
  CHANNEL: 'Channel',
};

// ─── Main Editor ──────────────────────────────────────────────────────────────

export function PolicyEditor({
  scope,
  mode,
  resourceId,
  policy,
  onSave,
  onCancel,
}: PolicyEditorProps) {
  const myPermissionCodes = useAuthStore((state) => state.user?.permissions);
  const [name, setName] = useState(policy?.name ?? '');
  const [description, setDescription] = useState(policy?.description ?? '');
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>(policy?.permissionIds ?? []);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setName(policy?.name ?? '');
    setDescription(policy?.description ?? '');
    setSelectedIds(policy?.permissionIds ?? []);
    setTouched(false);
    setLoadError(false);
    setLoading(true);

    permissionService
      .getAllPermissions(scope)
      // The backend is the single source of truth for which permissions exist in this scope, and
      // for the Console surface each one belongs to — the frontend never re-derives either.
      .then((perms) => setAllPermissions(perms ?? []))
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false));
  }, [policy?.id, scope]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectedPermissions = useMemo(
    () => allPermissions.filter((p) => selectedIds.includes(p.id)),
    [allPermissions, selectedIds]
  );

  const summaryBySurface = useMemo(() => {
    const counts: Partial<Record<string, number>> = {};
    for (const p of selectedPermissions) {
      const key = p.surface ?? 'SYSTEM';
      counts[key] = (counts[key] ?? 0) + 1;
    }
    return SURFACE_ORDER.filter((s) => counts[s]).map((s) => ({ surface: s, count: counts[s]! }));
  }, [selectedPermissions]);

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

  return (
    <div className="flex flex-col max-h-[90vh] w-full bg-white rounded-2xl overflow-hidden font-sans">

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-[#14142b]">
            {mode === 'create' ? 'Create Policy' : 'Edit Policy'}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1.5">
            {SCOPE_LABEL[scope]} Policy
          </p>
        </div>
        <button
          onClick={onCancel}
          className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Scrollable body — two columns on desktop: form + permission picker, summary panel */}
      <div className="flex-1 overflow-y-auto md:overflow-hidden md:flex">
        <div className="flex-1 min-w-0 overflow-y-auto px-6 py-6 space-y-6">

          {/* Policy Information */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Policy Name
            </h3>
            <div>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); setTouched(true); }}
                placeholder="e.g. Content Operations Manager"
                className={`w-full rounded-xl border px-4 py-2.5 text-sm font-medium outline-none transition-all ${
                  nameError
                    ? 'border-rose-400 ring-2 ring-rose-400/20 bg-rose-50/50'
                    : 'border-slate-200 bg-slate-50/80 focus:border-[#14142b]/30 focus:bg-white focus:ring-2 focus:ring-slate-200'
                }`}
              />
              {nameError && (
                <p className="mt-1 text-xs text-rose-600">Policy name is required.</p>
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-sm font-medium focus:border-[#14142b]/30 focus:bg-white focus:ring-2 focus:ring-slate-200 outline-none resize-none"
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
                <span className="text-xs font-semibold text-[#14142b] bg-slate-100 px-2 py-0.5 rounded-full ring-1 ring-inset ring-slate-200">
                  {selectedIds.length} selected
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
              </div>
            ) : loadError ? (
              <div className="flex flex-col items-center gap-2 text-center py-10 border border-dashed border-rose-200 bg-rose-50/40 rounded-xl">
                <ShieldAlert size={20} className="text-rose-400" />
                <p className="text-sm text-rose-600 font-medium">Couldn&apos;t load the permission catalog.</p>
                <p className="text-xs text-rose-400">Close this dialog and try again.</p>
              </div>
            ) : allPermissions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 text-center py-10 border border-dashed border-gray-200 rounded-xl">
                <ShieldCheck size={20} className="text-gray-300" />
                <p className="text-sm text-gray-500">No {SCOPE_LABEL[scope].toLowerCase()}-scope permissions are defined yet.</p>
                <p className="text-xs text-gray-400">A policy can still be saved with a name and no permissions, and permissions can be added later once they exist.</p>
              </div>
            ) : (
              <PermissionSelector
                permissions={allPermissions}
                selectedIds={selectedIds}
                myPermissionCodes={myPermissionCodes}
                onChange={setSelectedIds}
              />
            )}
          </section>
        </div>

        {/* Policy summary — persistent on desktop, inline below on mobile */}
        <aside className="shrink-0 md:w-72 md:border-l border-slate-100 bg-slate-50/50 px-6 py-6 md:overflow-y-auto">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Policy Summary
          </h3>
          <p className="text-sm font-bold text-gray-900 mb-1 truncate">{name.trim() || 'Untitled policy'}</p>
          <p className="text-xs text-gray-500 mb-4">
            {selectedIds.length} permission{selectedIds.length === 1 ? '' : 's'}
            {summaryBySurface.length > 0 && ` across ${summaryBySurface.length} Console area${summaryBySurface.length === 1 ? '' : 's'}`}
          </p>

          {summaryBySurface.length > 0 ? (
            <div className="space-y-2 mb-4">
              {summaryBySurface.map(({ surface, count }) => (
                <div key={surface} className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">{SURFACE_LABEL[surface as keyof typeof SURFACE_LABEL]}</span>
                  <span className="font-semibold text-gray-900">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic mb-4">No permissions selected yet.</p>
          )}

          <div className="pt-3 border-t border-slate-200/70">
            <p className="text-[11px] text-gray-400 leading-relaxed">
              This policy grants access to {SCOPE_LABEL[scope].toLowerCase()}-level operations only.
            </p>
          </div>
        </aside>
      </div>

      {/* Footer */}
      <div className="shrink-0 flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200/60 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#14142b] rounded-xl hover:bg-[#232735] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm active:scale-[0.98]"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? 'Saving…' : mode === 'edit' ? 'Update Policy' : 'Create Policy'}
        </button>
      </div>

    </div>
  );
}
