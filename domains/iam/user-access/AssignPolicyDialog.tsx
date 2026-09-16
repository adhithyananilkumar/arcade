'use client';

import { useMemo, useState } from 'react';
import { Loader2, Lock, Search, ShieldCheck, X } from 'lucide-react';
import type { Role } from '@/domains/identity';
import { SURFACE_LABEL, formatPermissionLabel } from '../policy-editor/PermissionSelector';
import type { ConsoleSurface } from '@/domains/identity';
import { canDelegatePolicy } from './delegation';

function groupBySurface(role: Role): { surface: ConsoleSurface | 'SYSTEM'; labels: string[] }[] {
  const groups = new Map<string, string[]>();
  for (const p of role.permissions ?? []) {
    const key = (p.surface as ConsoleSurface) ?? 'SYSTEM';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(formatPermissionLabel(p.code));
  }
  return Array.from(groups.entries()).map(([surface, labels]) => ({
    surface: surface as ConsoleSurface | 'SYSTEM',
    labels,
  }));
}

export interface AssignPolicyDialogProps {
  userName: string;
  availablePolicies: Role[];
  busy: boolean;
  /** The CURRENT ADMIN's own effective permission codes — used only to predict, in the UI,
   * whether the backend's delegation cap will allow granting a given policy (see
   * canDelegatePolicy). Never used as an authorization decision by itself. */
  myPermissionCodes: string[] | undefined;
  onAssign: (policyId: string) => Promise<void>;
  onClose: () => void;
}

/**
 * Two-step: pick a policy from a focused searchable list, then confirm an explicit
 * "this grants exactly these permissions" preview before the grant is applied. Policies the
 * current admin isn't authorized to delegate (see canDelegatePolicy) are shown but disabled,
 * with an explanation — never silently hidden, and never selectable only to fail on confirm.
 */
export function AssignPolicyDialog({
  userName,
  availablePolicies,
  busy,
  myPermissionCodes,
  onAssign,
  onClose,
}: AssignPolicyDialogProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<Role | null>(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return availablePolicies;
    const q = query.toLowerCase();
    return availablePolicies.filter(
      (p) => p.displayName.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q)
    );
  }, [availablePolicies, query]);

  const systemPolicies = filtered.filter((p) => p.systemRole);
  const customPolicies = filtered.filter((p) => !p.systemRole);

  const handleConfirm = async () => {
    if (!selected) return;
    await onAssign(selected.id);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-black/50 p-4 pt-[10vh]" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {!selected ? (
          <>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/60 shrink-0">
              <h2 className="text-sm font-bold text-gray-900">Assign Policy</h2>
              <button onClick={onClose} className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="p-4 space-y-3 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search policies…"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 text-sm font-medium focus:border-[#14142b]/30 focus:bg-white focus:ring-1 focus:ring-slate-300 outline-none"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
              {filtered.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No matching policies.</p>
              ) : (
                <>
                  {systemPolicies.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Recommended</p>
                      {systemPolicies.map((p) => (
                        <PolicyRow
                          key={p.id}
                          policy={p}
                          canDelegate={canDelegatePolicy(myPermissionCodes, p)}
                          onClick={() => setSelected(p)}
                        />
                      ))}
                    </div>
                  )}
                  {customPolicies.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Custom Policies</p>
                      {customPolicies.map((p) => (
                        <PolicyRow
                          key={p.id}
                          policy={p}
                          canDelegate={canDelegatePolicy(myPermissionCodes, p)}
                          onClick={() => setSelected(p)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/60 shrink-0">
              <h2 className="text-sm font-bold text-gray-900">Assign {selected.displayName}?</h2>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <p className="text-xs text-gray-500">
                This policy grants <strong>{userName}</strong>:
              </p>
              <div className="space-y-3">
                {groupBySurface(selected).map(({ surface, labels }) => (
                  <div key={surface}>
                    <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                      {SURFACE_LABEL[surface as keyof typeof SURFACE_LABEL] ?? surface}
                    </p>
                    <ul className="space-y-0.5">
                      {labels.map((label) => (
                        <li key={label} className="text-xs text-gray-600 flex items-center gap-1.5">
                          <ShieldCheck size={11} className="text-emerald-500 shrink-0" /> {label}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                {(selected.permissions ?? []).length === 0 && (
                  <p className="text-xs text-gray-400 italic">This policy grants no permissions.</p>
                )}
              </div>
              <p className="text-[11px] text-gray-400 pt-2 border-t border-gray-100">
                {userName} will have these permissions in addition to any existing policies.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50/60 shrink-0">
              <button
                type="button"
                onClick={() => setSelected(null)}
                disabled={busy}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200/60 transition-colors disabled:opacity-50"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={busy}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#14142b] rounded-xl hover:bg-[#232735] transition-colors disabled:opacity-50"
              >
                {busy && <Loader2 size={12} className="animate-spin" />}
                Assign Policy
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PolicyRow({
  policy,
  canDelegate,
  onClick,
}: {
  policy: Role;
  canDelegate: boolean;
  onClick: () => void;
}) {
  const count = policy.permissions?.length ?? 0;
  const surfaces = Array.from(
    new Set((policy.permissions ?? []).map((p) => SURFACE_LABEL[(p.surface as ConsoleSurface) ?? 'SYSTEM']))
  );

  if (!canDelegate) {
    return (
      <div
        className="w-full flex items-start justify-between gap-3 p-3 rounded-xl text-left border border-transparent opacity-50 cursor-not-allowed"
        title="You don't hold all the permissions this policy grants, so you can't assign it — ask someone who holds them (or a Platform Owner)."
      >
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-500 truncate">{policy.displayName}</p>
          <p className="text-xs text-gray-400 truncate">
            {count} permission{count === 1 ? '' : 's'}
            {surfaces.length > 0 && ` · ${surfaces.join(' · ')}`}
          </p>
        </div>
        <Lock size={13} className="shrink-0 text-gray-300 mt-0.5" />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-start justify-between gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left border border-transparent hover:border-slate-100"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{policy.displayName}</p>
        <p className="text-xs text-gray-500 truncate">
          {count} permission{count === 1 ? '' : 's'}
          {surfaces.length > 0 && ` · ${surfaces.join(' · ')}`}
        </p>
      </div>
      {policy.systemRole && (
        <span className="shrink-0 px-1.5 py-0.5 text-[10px] font-semibold bg-gray-100 text-gray-500 rounded-full">System</span>
      )}
    </button>
  );
}
