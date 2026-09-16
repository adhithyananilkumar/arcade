'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronRight, Lock, Search } from 'lucide-react';
import type { ConsoleSurface, Permission } from '@/domains/identity';

const SURFACE_LABEL: Record<ConsoleSurface, string> = {
  CHANNELS: 'Channels',
  REVIEWS: 'Reviews',
  CONTENT_MANAGE: 'Content Manage',
  EXAMS: 'Exams',
  PAYMENTS: 'Payments',
  INBOX: 'Inbox',
  IAM: 'IAM',
  SYSTEM: 'System',
};

const SURFACE_DESCRIPTION: Record<ConsoleSurface, string> = {
  CHANNELS: 'Manage platform channels and channel access',
  REVIEWS: 'Review submitted courses and content, and publish or reject them',
  CONTENT_MANAGE: 'Suspend, unsuspend, and organize published courses',
  EXAMS: 'Create and edit exam schedule time slots for published courses',
  PAYMENTS: 'Financial, billing, and analytics operations',
  INBOX: 'Manage support and report submissions',
  IAM: 'Manage platform access and policies',
  SYSTEM: 'Platform capabilities with no dedicated Console page',
};

const SURFACE_ORDER: ConsoleSurface[] = [
  'CHANNELS',
  'REVIEWS',
  'CONTENT_MANAGE',
  'EXAMS',
  'PAYMENTS',
  'INBOX',
  'IAM',
  'SYSTEM',
];

function formatPermissionLabel(code: string): string {
  const parts = code.split('.');
  if (parts.length < 2) return code;
  const action = parts[parts.length - 1];
  const resource = parts.slice(1, -1).join(' ');
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return `${cap(action)} ${resource}`.trim();
}

function PermissionSurfaceGroup({
  surface,
  permissions,
  selectedIds,
  heldCodes,
  onToggle,
  onToggleAll,
}: {
  surface: ConsoleSurface;
  permissions: Permission[];
  selectedIds: string[];
  /** null = current admin holds ALL (no restriction); otherwise the set of permission codes they
   * may delegate. Permissions outside this set can be unchecked but never newly checked — mirrors
   * PlatformRoleService#assignPermissions' assigner cap. */
  heldCodes: Set<string> | null;
  onToggle: (id: string) => void;
  onToggleAll: (ids: string[], select: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const ids = permissions.map((p) => p.id);
  const selectedCount = ids.filter((id) => selectedIds.includes(id)).length;
  const allSelected = selectedCount === ids.length && ids.length > 0;
  const someSelected = selectedCount > 0 && !allSelected;
  const delegableIds = heldCodes ? permissions.filter((p) => heldCodes.has(p.code)).map((p) => p.id) : ids;

  return (
    <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white">
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/80 select-none">
        <button
          type="button"
          onClick={() => onToggleAll(allSelected ? ids : delegableIds, !allSelected)}
          className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
            allSelected
              ? 'bg-[#14142b] border-[#14142b] text-white'
              : someSelected
              ? 'bg-slate-300 border-slate-400 text-white'
              : 'border-slate-300 hover:border-slate-400 bg-white'
          }`}
          title="Select all in this surface"
        >
          {(allSelected || someSelected) && <Check size={10} strokeWidth={3} />}
        </button>

        <button
          type="button"
          className="flex-1 flex items-center gap-2 text-left min-w-0"
          onClick={() => setExpanded((e) => !e)}
        >
          <div className="min-w-0">
            <span className="text-sm font-semibold text-gray-800">{SURFACE_LABEL[surface]}</span>
            <p className="text-xs text-gray-400 truncate">{SURFACE_DESCRIPTION[surface]}</p>
          </div>
          <span className="ml-auto shrink-0 text-xs font-semibold text-gray-500">
            {selectedCount} / {permissions.length}
          </span>
          <span className="shrink-0 text-gray-400">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        </button>
      </div>

      {expanded && (
        <div className="divide-y divide-slate-50">
          {permissions.map((perm) => {
            const isSelected = selectedIds.includes(perm.id);
            const isHeld = !heldCodes || heldCodes.has(perm.code);
            // Locked only when NOT already selected and NOT held — you may always uncheck a
            // permission you don't personally hold (that's how you'd fix a save that would
            // otherwise be rejected), you just can't newly add one you don't hold.
            const locked = !isSelected && !isHeld;
            return (
              <label
                key={perm.id}
                className={`flex items-start gap-3 px-4 py-2.5 transition-colors ${
                  locked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                } ${isSelected ? 'bg-slate-50' : locked ? '' : 'hover:bg-gray-50/60'}`}
                title={locked ? "You don't hold this permission yourself, so you can't grant it to others." : undefined}
              >
                <div
                  className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-[#14142b] border-[#14142b] text-white'
                      : locked
                      ? 'border-slate-200 bg-slate-50'
                      : 'border-slate-300 hover:border-slate-400 bg-white'
                  }`}
                >
                  {isSelected && <Check size={10} strokeWidth={3} />}
                  {locked && <Lock size={8} className="text-slate-300" />}
                </div>
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isSelected}
                  disabled={locked}
                  onChange={() => !locked && onToggle(perm.id)}
                />
                <div className="min-w-0">
                  <p className="text-[13px] font-medium text-gray-800">
                    {formatPermissionLabel(perm.code)}
                  </p>
                  {perm.description && (
                    <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{perm.description}</p>
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

export interface PermissionSelectorProps {
  permissions: Permission[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  /** The CURRENT ADMIN's own effective permission codes — used only to predict, in the UI,
   * whether the backend will accept the resulting permission set (PlatformRoleService requires
   * holding every permission in a policy's FINAL set, not just newly-added ones, unless you hold
   * ALL). Undefined/missing is treated as "no restriction known" (nothing locked) rather than
   * "holds nothing" — the backend remains the real authority either way. */
  myPermissionCodes?: string[];
}

/**
 * The one Policy permission picker in the app, grouped by real Console navigation surface
 * (Channels, Reviews, Content Manage, Exams, Payments, Inbox, IAM) rather than a raw DB `module`
 * string. Write-only context: the Policy Editor is its sole consumer — the user-access drawer is
 * read-only (see AccessPoliciesPanel's effective-access view) and never edits permissions
 * directly, since Policy is the only assignable IAM unit.
 */
export function PermissionSelector({ permissions, selectedIds, onChange, myPermissionCodes }: PermissionSelectorProps) {
  const [search, setSearch] = useState('');
  const heldCodes = useMemo(() => {
    if (!myPermissionCodes) return null;
    if (myPermissionCodes.includes('ALL')) return null; // no restriction
    return new Set(myPermissionCodes);
  }, [myPermissionCodes]);

  const filtered = useMemo(() => {
    if (!search.trim()) return permissions;
    const q = search.toLowerCase();
    return permissions.filter(
      (p) => p.code.toLowerCase().includes(q) || (p.description ?? '').toLowerCase().includes(q)
    );
  }, [permissions, search]);

  const grouped = useMemo(() => {
    const groups: Partial<Record<ConsoleSurface, Permission[]>> = {};
    for (const perm of filtered) {
      const surface = perm.surface ?? 'SYSTEM';
      (groups[surface] ??= []).push(perm);
    }
    return groups;
  }, [filtered]);

  const orderedSurfaces = SURFACE_ORDER.filter((s) => grouped[s]?.length);

  const toggle = (id: string) => {
    onChange(selectedIds.includes(id) ? selectedIds.filter((x) => x !== id) : [...selectedIds, id]);
  };

  const toggleAll = (ids: string[], select: boolean) => {
    onChange(
      select
        ? [...new Set([...selectedIds, ...ids])]
        : selectedIds.filter((x) => !ids.includes(x))
    );
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search permissions…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/80 text-sm font-medium focus:border-[#14142b]/30 focus:bg-white focus:ring-2 focus:ring-slate-200 outline-none"
        />
      </div>

      {orderedSurfaces.length > 0 ? (
        <div className="space-y-2">
          {orderedSurfaces.map((surface) => (
            <PermissionSurfaceGroup
              key={surface}
              surface={surface}
              permissions={grouped[surface]!}
              selectedIds={selectedIds}
              heldCodes={heldCodes}
              onToggle={toggle}
              onToggleAll={toggleAll}
            />
          ))}
        </div>
      ) : (
        <div className="text-sm text-gray-400 italic text-center py-6 border border-dashed border-gray-200 rounded-xl">
          No permissions match &quot;{search}&quot;.
        </div>
      )}
    </div>
  );
}

export { SURFACE_LABEL, SURFACE_ORDER, formatPermissionLabel };
