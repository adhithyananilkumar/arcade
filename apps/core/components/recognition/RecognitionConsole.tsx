'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Core
 *
 * Purpose:
 * Console surface for recognition: the badge catalog, who holds what, and the
 * grant/revoke actions.
 *
 * Rules:
 * - Gated on `platform.recognition.manage`. The gate here is a presentation
 *   hint; every endpoint it calls is enforced independently on the backend.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Loader2, Lock, Plus, Search, Undo2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  RecognitionService,
  VerifiedBadge,
  type BadgeDefinition,
  type BadgeGrant,
  type ProfileBadge,
} from '@/domains/recognition';
import { ProfileEmptyState } from '@/domains/profiles';
import { getAvatarUrl } from '@/shared/utils/avatar';
import { BadgeGrantDialog } from './BadgeGrantDialog';
import { BadgeDefinitionDialog } from './BadgeDefinitionDialog';

/** Adapts a catalog entry into the shape the badge renderer takes, for previews. */
function previewBadge(definition: BadgeDefinition): ProfileBadge {
  return {
    code: definition.code,
    label: definition.displayName,
    description: definition.description,
    category: definition.category,
    icon: definition.icon,
    accentColor: definition.accentColor,
    effect: definition.effect,
    displayOrder: definition.displayOrder,
    grantedAt: new Date().toISOString(),
  };
}

export function RecognitionConsole() {
  const [definitions, setDefinitions] = useState<BadgeDefinition[]>([]);
  const [grants, setGrants] = useState<BadgeGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'grants' | 'catalog'>('grants');
  const [filter, setFilter] = useState<string>('');
  const [definitionFilter, setDefinitionFilter] = useState<string>('');
  const [granting, setGranting] = useState(false);
  const [creatingDefinition, setCreatingDefinition] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [catalog, page] = await Promise.all([
        RecognitionService.listDefinitions(true),
        RecognitionService.listGrants({
          definitionId: definitionFilter || undefined,
          size: 100,
        }),
      ]);
      setDefinitions(catalog);
      setGrants(page.content);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not load recognition data.',
      );
    } finally {
      setLoading(false);
    }
  }, [definitionFilter]);

  useEffect(() => {
    // Fetch-on-mount: the request is the effect's whole purpose and its result has to land in
    // state. Same pattern as ProtectedLayout and the profile page.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const visibleGrants = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    if (!needle) return grants;
    return grants.filter(
      (grant) =>
        grant.subjectName.toLowerCase().includes(needle) ||
        grant.subjectHandle?.toLowerCase().includes(needle) ||
        grant.badgeName.toLowerCase().includes(needle),
    );
  }, [grants, filter]);

  const revoke = async (grant: BadgeGrant) => {
    const reason = window.prompt(
      `Revoke "${grant.title || grant.badgeName}" from ${grant.subjectName}?\n\nReason (optional, kept on the record):`,
    );
    // prompt returns null on cancel and "" when submitted empty — only the first should abort.
    if (reason === null) return;

    try {
      await RecognitionService.revoke(grant.id, reason || undefined);
      toast.success('Badge revoked');
      load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not revoke that badge.',
      );
    }
  };

  return (
    <div className="space-y-7">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-extrabold tracking-tight text-slate-900 dark:text-white">
            Recognition
          </h1>
          <p className="mt-1.5 max-w-2xl text-[13px] font-medium leading-relaxed text-slate-500 dark:text-neutral-400">
            Verification ticks, Arcade team badges, and one-off awards. A badge
            is what the platform publicly asserts about an account — it grants no
            permission, and revoking it takes nothing away but the badge.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {tab === 'catalog' && (
            <button
              type="button"
              onClick={() => setCreatingDefinition(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-extrabold tracking-tight text-slate-700 transition-colors hover:border-slate-900 dark:border-neutral-800 dark:bg-black dark:text-neutral-200 dark:hover:border-neutral-400"
            >
              <Plus size={14} /> New badge
            </button>
          )}
          <button
            type="button"
            onClick={() => setGranting(true)}
            disabled={!definitions.length}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-[13px] font-extrabold tracking-tight text-white transition-colors hover:bg-slate-800 disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
          >
            <Plus size={14} /> Grant badge
          </button>
        </div>
      </header>

      <div className="flex items-center gap-1 border-b border-slate-100 dark:border-neutral-900">
        {(['grants', 'catalog'] as const).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`-mb-px border-b-2 px-4 py-3 text-[13px] font-bold tracking-tight transition-colors ${
              tab === id
                ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:text-neutral-500'
            }`}
          >
            {id === 'grants' ? 'Who holds what' : 'Badge catalog'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-[13px] font-bold text-slate-400 dark:text-neutral-500">
          <Loader2 size={15} className="animate-spin" /> Loading…
        </div>
      ) : tab === 'grants' ? (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[240px] flex-1">
              <Search
                size={14}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 dark:text-neutral-600"
              />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter by holder or badge"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3.5 text-[13px] font-semibold text-slate-900 outline-none focus:border-slate-900 dark:border-neutral-800 dark:bg-black dark:text-white dark:focus:border-neutral-400"
              />
            </div>

            <select
              value={definitionFilter}
              onChange={(e) => setDefinitionFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13px] font-bold text-slate-700 outline-none focus:border-slate-900 dark:border-neutral-800 dark:bg-black dark:text-neutral-200"
            >
              <option value="">All badges</option>
              {definitions.map((definition) => (
                <option key={definition.id} value={definition.id}>
                  {definition.displayName}
                </option>
              ))}
            </select>
          </div>

          {visibleGrants.length === 0 ? (
            <ProfileEmptyState
              title="No badges granted yet"
              description="Grant one to verify an instructor or an organization, or to recognise someone on the Arcade team."
            />
          ) : (
            <ul className="divide-y divide-slate-100 overflow-hidden rounded-[20px] border border-slate-100 dark:divide-neutral-900 dark:border-neutral-900">
              {visibleGrants.map((grant) => (
                <li
                  key={grant.id}
                  className="flex flex-wrap items-center gap-4 bg-white px-5 py-4 dark:bg-black"
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden bg-slate-50 dark:bg-neutral-900 ${
                      grant.subjectType === 'CHANNEL' ? 'rounded-xl' : 'rounded-full'
                    }`}
                  >
                    {grant.subjectAvatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={getAvatarUrl(grant.subjectAvatarUrl)}
                        alt=""
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : null}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {grant.subjectHandle ? (
                        <Link
                          href={`/${grant.subjectHandle}`}
                          className="truncate text-[14px] font-extrabold tracking-tight text-slate-900 hover:text-indigo-600 dark:text-white dark:hover:text-indigo-400"
                        >
                          {grant.subjectName}
                        </Link>
                      ) : (
                        <span className="truncate text-[14px] font-extrabold tracking-tight text-slate-900 dark:text-white">
                          {grant.subjectName}
                        </span>
                      )}
                      <VerifiedBadge
                        badge={{
                          code: grant.badgeCode,
                          label: grant.title || grant.badgeName,
                          description: null,
                          category: grant.category,
                          icon: grant.icon,
                          accentColor: grant.accentColor,
                          effect: grant.effect,
                          displayOrder: 0,
                          tenure: grant.tenure,
                          note: grant.note,
                          grantedAt: grant.grantedAt,
                        }}
                        size={16}
                      />
                    </div>
                    <p className="mt-0.5 text-[11.5px] font-bold text-slate-400 dark:text-neutral-500">
                      {grant.title || grant.badgeName}
                      {grant.tenure && ` · ${grant.tenure}`}
                      {` · granted by ${grant.grantedByName}`}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => revoke(grant)}
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-extrabold tracking-tight text-slate-500 transition-colors hover:border-rose-300 hover:text-rose-600 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-rose-900 dark:hover:text-rose-400"
                  >
                    <Undo2 size={12} /> Revoke
                  </button>
                </li>
              ))}
            </ul>
          )}
        </>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {definitions.map((definition) => (
            <li
              key={definition.id}
              className={`rounded-[20px] border bg-white p-5 dark:bg-black ${
                definition.active
                  ? 'border-slate-100 dark:border-neutral-900'
                  : 'border-dashed border-slate-200 opacity-60 dark:border-neutral-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <VerifiedBadge
                  badge={previewBadge(definition)}
                  size={22}
                  showDetailOnHover={false}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-extrabold tracking-tight text-slate-900 dark:text-white">
                      {definition.displayName}
                    </span>
                    {definition.systemDefined && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-slate-500 dark:bg-neutral-900 dark:text-neutral-400">
                        <Lock size={9} /> System
                      </span>
                    )}
                    {!definition.active && (
                      <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-slate-400 dark:bg-neutral-900">
                        Retired
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 font-mono text-[10.5px] font-bold text-slate-400 dark:text-neutral-600">
                    {definition.code}
                  </p>
                  {definition.description && (
                    <p className="mt-2 text-[12.5px] font-medium leading-relaxed text-slate-500 dark:text-neutral-400">
                      {definition.description}
                    </p>
                  )}
                  <p className="mt-3 text-[11.5px] font-bold text-slate-400 dark:text-neutral-500">
                    {definition.category} · applies to {definition.appliesTo} ·{' '}
                    {definition.liveGrantCount}{' '}
                    {definition.liveGrantCount === 1 ? 'holder' : 'holders'}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {granting && (
        <BadgeGrantDialog
          definitions={definitions}
          onClose={() => setGranting(false)}
          onGranted={load}
        />
      )}

      {creatingDefinition && (
        <BadgeDefinitionDialog
          onClose={() => setCreatingDefinition(false)}
          onCreated={load}
        />
      )}
    </div>
  );
}
