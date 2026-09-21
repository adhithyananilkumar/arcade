'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Core
 *
 * Purpose:
 * The handle-appeal review queue: who is claiming what, from whom, and on what
 * grounds — and the decision.
 *
 * Rules:
 * - Gated on `platform.handles.manage`; the backend enforces it independently.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Check,
  ExternalLink,
  Gavel,
  Loader2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  HandleAppealStatusPill,
  HandleService,
  ProfileEmptyState,
  type HandleAppeal,
  type HandleAppealStatus,
} from '@/domains/profiles';
import { getAvatarUrl } from '@/shared/utils/avatar';

const FILTERS: { id: HandleAppealStatus | 'OPEN'; label: string }[] = [
  { id: 'OPEN', label: 'Open' },
  { id: 'APPROVED', label: 'Approved' },
  { id: 'REJECTED', label: 'Declined' },
  { id: 'WITHDRAWN', label: 'Withdrawn' },
];

export function HandleAppealConsole() {
  const [filter, setFilter] = useState<HandleAppealStatus | 'OPEN'>('OPEN');
  const [appeals, setAppeals] = useState<HandleAppeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [deciding, setDeciding] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // "Open" is the absence of a status filter on the backend, which returns PENDING and
      // UNDER_REVIEW together — the two states an administrator still has to act on.
      const page = await HandleService.reviewQueue({
        status: filter === 'OPEN' ? undefined : filter,
        size: 50,
      });
      setAppeals(page.content);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not load the appeal queue.',
      );
      setAppeals([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    // Fetch-on-mount: the request is the effect's whole purpose and its result has to land in
    // state. Same pattern as ProtectedLayout and the profile page.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const decide = async (appeal: HandleAppeal, approve: boolean) => {
    const verb = approve ? 'Approve' : 'Decline';
    const note = window.prompt(
      approve
        ? `Approve @${appeal.requestedHandle} for ${appeal.claimantName}?\n\nThis transfers the handle immediately. ${
            appeal.currentHolderName
              ? `${appeal.currentHolderName} will lose it and be notified.`
              : ''
          }\n\nNote (optional, shown to the claimant):`
        : `Decline the claim on @${appeal.requestedHandle}?\n\nNote (optional, shown to the claimant):`,
    );
    if (note === null) return;

    setDeciding(appeal.id);
    try {
      await HandleService.decideAppeal(appeal.id, approve, note || undefined);
      toast.success(approve ? 'Handle transferred' : 'Appeal declined');
      load();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : `Could not ${verb.toLowerCase()} that appeal.`,
      );
    } finally {
      setDeciding(null);
    }
  };

  return (
    <div className="space-y-7">
      <header>
        <h1 className="text-[24px] font-extrabold tracking-tight text-slate-900 dark:text-white">
          Handle appeals
        </h1>
        <p className="mt-1.5 max-w-2xl text-[13px] font-medium leading-relaxed text-slate-500 dark:text-neutral-400">
          Claims on handles somebody else holds. Approving one transfers the
          handle immediately and leaves the previous holder with no profile
          address until they choose a new one — so decide on the evidence, not on
          who asked first.
        </p>
      </header>

      <div className="flex items-center gap-1 border-b border-slate-100 dark:border-neutral-900">
        {FILTERS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setFilter(option.id)}
            className={`-mb-px border-b-2 px-4 py-3 text-[13px] font-bold tracking-tight transition-colors ${
              filter === option.id
                ? 'border-slate-900 text-slate-900 dark:border-white dark:text-white'
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:text-neutral-500'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-16 text-[13px] font-bold text-slate-400 dark:text-neutral-500">
          <Loader2 size={15} className="animate-spin" /> Loading…
        </div>
      ) : appeals.length === 0 ? (
        <ProfileEmptyState
          icon={Gavel}
          title={filter === 'OPEN' ? 'Nothing to review' : 'Nothing here'}
          description={
            filter === 'OPEN'
              ? 'Handle appeals appear here when someone claims a name that is already taken or reserved.'
              : undefined
          }
        />
      ) : (
        <ul className="space-y-4">
          {appeals.map((appeal) => {
            const open =
              appeal.status === 'PENDING' || appeal.status === 'UNDER_REVIEW';
            return (
              <li
                key={appeal.id}
                className="rounded-[20px] border border-slate-100 bg-white p-6 dark:border-neutral-900 dark:bg-black"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden bg-slate-50 dark:bg-neutral-900 ${
                        appeal.claimantType === 'CHANNEL'
                          ? 'rounded-xl'
                          : 'rounded-full'
                      }`}
                    >
                      {appeal.claimantAvatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getAvatarUrl(appeal.claimantAvatarUrl)}
                          alt=""
                          className="h-full w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : null}
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[16px] font-extrabold tracking-tight text-slate-900 dark:text-white">
                          @{appeal.requestedHandle}
                        </span>
                        <HandleAppealStatusPill status={appeal.status} />
                      </div>

                      <p className="mt-1 text-[12.5px] font-bold text-slate-500 dark:text-neutral-400">
                        Claimed by {appeal.claimantName}
                        {appeal.claimantType === 'CHANNEL' && ' (channel)'}
                        {appeal.claimantCurrentHandle &&
                          ` · currently @${appeal.claimantCurrentHandle}`}
                      </p>

                      <p className="mt-0.5 text-[12px] font-bold text-slate-400 dark:text-neutral-500">
                        {appeal.currentHolderName
                          ? `Held by ${appeal.currentHolderName}`
                          : 'The handle is currently unheld'}
                      </p>
                    </div>
                  </div>

                  {open && (
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        onClick={() => decide(appeal, false)}
                        disabled={deciding === appeal.id}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-[12.5px] font-extrabold tracking-tight text-slate-600 transition-colors hover:border-rose-300 hover:text-rose-600 disabled:opacity-50 dark:border-neutral-800 dark:text-neutral-300 dark:hover:border-rose-900 dark:hover:text-rose-400"
                      >
                        <X size={13} /> Decline
                      </button>
                      <button
                        type="button"
                        onClick={() => decide(appeal, true)}
                        disabled={deciding === appeal.id}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-[12.5px] font-extrabold tracking-tight text-white transition-colors hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                      >
                        {deciding === appeal.id ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          <Check size={13} />
                        )}
                        Approve
                      </button>
                    </div>
                  )}
                </div>

                {appeal.competingClaimCount > 0 && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-3.5 py-3 dark:border-amber-900/40 dark:bg-amber-950/30">
                    <AlertTriangle
                      size={14}
                      className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400"
                    />
                    <p className="text-[12.5px] font-bold text-amber-800 dark:text-amber-300">
                      {appeal.competingClaimCount} other open{' '}
                      {appeal.competingClaimCount === 1 ? 'claim' : 'claims'} on this
                      handle. Approving this one declines the rest.
                    </p>
                  </div>
                )}

                <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3.5 dark:bg-neutral-950">
                  <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400 dark:text-neutral-600">
                    Their case
                  </p>
                  <p className="mt-1.5 whitespace-pre-wrap text-[13px] font-medium leading-relaxed text-slate-600 dark:text-neutral-300">
                    {appeal.justification}
                  </p>
                  {appeal.evidenceUrl && (
                    <a
                      href={appeal.evidenceUrl}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-extrabold text-indigo-500 transition-colors hover:text-indigo-600 dark:text-indigo-400"
                    >
                      Supporting link <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px] font-bold text-slate-400 dark:text-neutral-500">
                  <span>Filed {new Date(appeal.createdAt).toLocaleString()}</span>
                  {appeal.decidedByName && (
                    <span>
                      Decided by {appeal.decidedByName}
                      {appeal.decidedAt &&
                        ` on ${new Date(appeal.decidedAt).toLocaleDateString()}`}
                    </span>
                  )}
                  {appeal.claimantCurrentHandle && (
                    <Link
                      href={`/${appeal.claimantCurrentHandle}`}
                      className="text-indigo-500 hover:text-indigo-600 dark:text-indigo-400"
                    >
                      View claimant
                    </Link>
                  )}
                </div>

                {appeal.decisionNote && (
                  <p className="mt-3 text-[12.5px] font-medium text-slate-500 dark:text-neutral-400">
                    <span className="font-extrabold">Note:</span> {appeal.decisionNote}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
