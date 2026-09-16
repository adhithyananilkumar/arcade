'use client';

import { useMemo, useState } from 'react';
import { MoreHorizontal, Plus, ShieldCheck, Trash2 } from 'lucide-react';
import type { Role } from '@/domains/identity';
import type { ConsoleSurface } from '@/domains/identity';
import { SURFACE_LABEL, SURFACE_ORDER, formatPermissionLabel } from '../policy-editor/PermissionSelector';
import { ConfirmDialog } from './ConfirmDialog';

function PolicyCard({
  policy,
  busy,
  canManage,
  onRemove,
}: {
  policy: Role;
  busy: boolean;
  canManage: boolean;
  onRemove: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const count = policy.permissions?.length ?? 0;

  return (
    <div className="relative flex items-start justify-between gap-3 p-3.5 rounded-xl border border-gray-100 bg-white">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <ShieldCheck size={14} className="text-[#14142b] shrink-0" />
          <p className="text-sm font-semibold text-gray-900 truncate">{policy.displayName}</p>
          <span
            className={`shrink-0 px-1.5 py-0.5 text-[10px] font-semibold rounded-full ${
              policy.systemRole ? 'bg-gray-100 text-gray-500' : 'bg-indigo-50 text-indigo-600'
            }`}
          >
            {policy.systemRole ? 'System' : 'Custom'}
          </span>
        </div>
        {policy.description && <p className="text-xs text-gray-500 mt-0.5">{policy.description}</p>}
        <p className="text-xs text-gray-400 mt-0.5">
          {count} permission{count === 1 ? '' : 's'}
        </p>
      </div>

      {canManage && (
        <div className="shrink-0">
          <button
            type="button"
            disabled={busy}
            onClick={() => setMenuOpen((o) => !o)}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-8 z-20 w-40 rounded-xl border border-gray-100 bg-white shadow-lg py-1">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onRemove();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <Trash2 size={13} /> Remove policy
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export interface AccessPoliciesPanelProps {
  userName: string;
  assignedPolicies: Role[];
  busy: boolean;
  canManage: boolean;
  onRemovePolicy: (policyId: string) => Promise<void>;
  onOpenAssign: () => void;
}

/**
 * A user's IAM footprint reduced to what it now actually is: assigned Policies, and the
 * read-only Effective Access those policies produce. No per-user permission overrides, no admin
 * tasks — Policy is the only assignable unit (see docs/architecture ADR for the refactor).
 */
export function AccessPoliciesPanel({
  userName,
  assignedPolicies,
  busy,
  canManage,
  onRemovePolicy,
  onOpenAssign,
}: AccessPoliciesPanelProps) {
  const [pendingRemoval, setPendingRemoval] = useState<Role | null>(null);

  const effectiveBySurface = useMemo(() => {
    const map = new Map<string, Map<string, string[]>>(); // surface -> code -> [policy names]
    for (const policy of assignedPolicies) {
      for (const perm of policy.permissions ?? []) {
        const surface = (perm.surface as ConsoleSurface) ?? 'SYSTEM';
        if (!map.has(surface)) map.set(surface, new Map());
        const byCode = map.get(surface)!;
        if (!byCode.has(perm.code)) byCode.set(perm.code, []);
        byCode.get(perm.code)!.push(policy.displayName);
      }
    }
    return SURFACE_ORDER.filter((s) => map.has(s)).map((surface) => ({
      surface,
      permissions: Array.from(map.get(surface)!.entries()).map(([code, grantedBy]) => ({
        code,
        label: formatPermissionLabel(code),
        grantedBy,
      })),
    }));
  }, [assignedPolicies]);

  const totalPermissions = useMemo(() => {
    const codes = new Set<string>();
    assignedPolicies.forEach((p) => (p.permissions ?? []).forEach((perm) => codes.add(perm.code)));
    return codes.size;
  }, [assignedPolicies]);

  // What the user loses if `pendingRemoval` is revoked, and whether another remaining policy
  // still covers each of those permissions — the whole point of showing this before removing.
  const removalImpact = useMemo(() => {
    if (!pendingRemoval) return null;
    const remaining = assignedPolicies.filter((p) => p.id !== pendingRemoval.id);
    const remainingCodes = new Set(remaining.flatMap((p) => (p.permissions ?? []).map((perm) => perm.code)));
    const lost = (pendingRemoval.permissions ?? []).filter((p) => !remainingCodes.has(p.code));
    const stillCovered = (pendingRemoval.permissions ?? []).filter((p) => remainingCodes.has(p.code));
    return { lost, stillCovered };
  }, [pendingRemoval, assignedPolicies]);

  const handleConfirmRemove = async () => {
    if (!pendingRemoval) return;
    await onRemovePolicy(pendingRemoval.id);
    setPendingRemoval(null);
  };

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Access Policies</h3>
          <span className="text-xs text-gray-400">{assignedPolicies.length} assigned</span>
        </div>

        {assignedPolicies.length === 0 ? (
          <div className="text-xs text-gray-400 italic text-center py-4 border border-dashed border-gray-200 rounded-xl">
            No policies assigned.
          </div>
        ) : (
          <div className="space-y-2">
            {assignedPolicies.map((p) => (
              <PolicyCard
                key={p.id}
                policy={p}
                busy={busy}
                canManage={canManage}
                onRemove={() => setPendingRemoval(p)}
              />
            ))}
          </div>
        )}

        {canManage && (
          <button
            type="button"
            disabled={busy}
            onClick={onOpenAssign}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-[#14142b] bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
          >
            <Plus size={13} /> Assign policy
          </button>
        )}
      </section>

      <section className="space-y-3 pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Effective Access</h3>
        </div>
        {totalPermissions === 0 ? (
          <p className="text-xs text-gray-400 italic">
            No effective permissions — this user has no assigned policies.
          </p>
        ) : (
          <>
            <p className="text-xs text-gray-500">
              {totalPermissions} permission{totalPermissions === 1 ? '' : 's'} through{' '}
              {assignedPolicies.length} polic{assignedPolicies.length === 1 ? 'y' : 'ies'}
            </p>
            <div className="space-y-3">
              {effectiveBySurface.map(({ surface, permissions }) => (
                <div key={surface}>
                  <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wide mb-1">
                    {SURFACE_LABEL[surface]}
                  </p>
                  <ul className="space-y-1">
                    {permissions.map((p) => (
                      <li key={p.code} className="text-xs text-gray-600 flex items-start gap-1.5">
                        <ShieldCheck size={11} className="text-emerald-500 shrink-0 mt-0.5" />
                        <span>
                          {p.label}
                          {p.grantedBy.length > 0 && (
                            <span className="text-gray-400"> — via {p.grantedBy.join(', ')}</span>
                          )}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <ConfirmDialog
        open={pendingRemoval !== null}
        title={`Remove ${pendingRemoval?.displayName ?? ''}?`}
        danger
        busy={busy}
        confirmLabel="Remove Policy"
        onConfirm={handleConfirmRemove}
        onCancel={() => setPendingRemoval(null)}
        description={
          removalImpact && (
            <>
              {removalImpact.lost.length > 0 ? (
                <>
                  <p>{userName} will lose:</p>
                  <ul className="space-y-0.5">
                    {removalImpact.lost.map((p) => (
                      <li key={p.id}>• {formatPermissionLabel(p.code)}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p>This policy grants no permissions that aren&apos;t already lost.</p>
              )}
              {removalImpact.stillCovered.length > 0 && (
                <>
                  <p className="pt-1.5">The following will remain active through another policy:</p>
                  <ul className="space-y-0.5">
                    {removalImpact.stillCovered.map((p) => (
                      <li key={p.id} className="text-emerald-600">✓ {formatPermissionLabel(p.code)}</li>
                    ))}
                  </ul>
                </>
              )}
            </>
          )
        }
      />
    </div>
  );
}
