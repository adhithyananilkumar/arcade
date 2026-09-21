'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Profiles
 *
 * Purpose:
 * A claimant's view of their own handle appeals, and the status of each.
 *
 * Rules:
 * - Pure. Withdrawing is the caller's job via `onWithdraw`; omitting it makes
 *   the list read-only, which is what the admin queue wants.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { Clock, ExternalLink, Gavel, ShieldCheck, ShieldX, Undo2 } from 'lucide-react';
import type { HandleAppeal, HandleAppealStatus } from '../types/profile.types';
import { ProfileEmptyState } from './ProfileCards';

const STATUS_STYLE: Record<
  HandleAppealStatus,
  { label: string; className: string; icon: typeof Clock }
> = {
  PENDING: {
    label: 'Pending review',
    className:
      'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/40',
    icon: Clock,
  },
  UNDER_REVIEW: {
    label: 'Under review',
    className:
      'bg-sky-50 text-sky-700 border-sky-100 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/40',
    icon: Gavel,
  },
  APPROVED: {
    label: 'Approved',
    className:
      'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/40',
    icon: ShieldCheck,
  },
  REJECTED: {
    label: 'Declined',
    className:
      'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/40',
    icon: ShieldX,
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    className:
      'bg-slate-100 text-slate-500 border-slate-200 dark:bg-neutral-900 dark:text-neutral-400 dark:border-neutral-800',
    icon: Undo2,
  },
};

function formatDate(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function HandleAppealStatusPill({ status }: { status: HandleAppealStatus }) {
  const style = STATUS_STYLE[status] ?? STATUS_STYLE.PENDING;
  const Icon = style.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-extrabold tracking-tight ${style.className}`}
    >
      <Icon size={12} />
      {style.label}
    </span>
  );
}

export interface HandleAppealListProps {
  appeals: HandleAppeal[];
  /** Omit to render read-only. Only open appeals offer it. */
  onWithdraw?: (appealId: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function HandleAppealList({
  appeals,
  onWithdraw,
  emptyTitle = 'No appeals yet',
  emptyDescription = 'If a handle you have a registered claim to is already taken, you can appeal for it from the handle field above.',
}: HandleAppealListProps) {
  if (!appeals.length) {
    return (
      <ProfileEmptyState
        icon={Gavel}
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <ul className="space-y-3">
      {appeals.map((appeal) => {
        const open =
          appeal.status === 'PENDING' || appeal.status === 'UNDER_REVIEW';
        return (
          <li
            key={appeal.id}
            className="rounded-[18px] border border-slate-100 bg-white p-5 dark:border-neutral-900 dark:bg-black"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[15px] font-extrabold tracking-tight text-slate-900 dark:text-white">
                    @{appeal.requestedHandle}
                  </span>
                  <HandleAppealStatusPill status={appeal.status} />
                </div>
                <p className="mt-1 text-[12px] font-bold text-slate-400 dark:text-neutral-500">
                  Filed {formatDate(appeal.createdAt)}
                  {appeal.currentHolderName && ` · held by ${appeal.currentHolderName}`}
                </p>
              </div>

              {open && onWithdraw && (
                <button
                  type="button"
                  onClick={() => onWithdraw(appeal.id)}
                  className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-[12px] font-extrabold tracking-tight text-slate-500 transition-colors hover:border-slate-900 hover:text-slate-900 dark:border-neutral-800 dark:text-neutral-400 dark:hover:border-neutral-400 dark:hover:text-white"
                >
                  Withdraw
                </button>
              )}
            </div>

            <p className="mt-3 line-clamp-3 text-[12.5px] font-medium leading-relaxed text-slate-500 dark:text-neutral-400">
              {appeal.justification}
            </p>

            {appeal.evidenceUrl && (
              <a
                href={appeal.evidenceUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-extrabold text-indigo-500 transition-colors hover:text-indigo-600 dark:text-indigo-400"
              >
                Supporting link <ExternalLink size={12} />
              </a>
            )}

            {appeal.decisionNote && (
              <div className="mt-4 rounded-xl bg-slate-50 px-3.5 py-3 dark:bg-neutral-950">
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-slate-400 dark:text-neutral-600">
                  Arcade&apos;s note
                </p>
                <p className="mt-1 text-[12.5px] font-medium leading-relaxed text-slate-600 dark:text-neutral-300">
                  {appeal.decisionNote}
                </p>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
