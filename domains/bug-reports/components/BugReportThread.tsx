'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, RotateCcw, ThumbsUp } from 'lucide-react';
import type { BugReceipts, BugReportDetail } from '../types/bug-report.types';
import { RESOLUTION_LABEL } from '../utils/labels';
import { BugImpactBadge, BugStatusBadge, CategoryIcon } from './BugBadges';
import { BugChatComposer } from './BugChatComposer';
import { BugTimeline } from './BugTimeline';

/** What the reporter is being asked, in plain words, for the states that ask them anything. */
function Prompt({ detail }: { detail: BugReportDetail }) {
  const { status, resolution } = detail.summary;
  if (status === 'NEEDS_INFO') {
    return (
      <p className="border-b border-fuchsia-200/70 bg-fuchsia-50 px-5 py-2 text-[12.5px] text-fuchsia-900 dark:border-fuchsia-500/20 dark:bg-fuchsia-500/10 dark:text-fuchsia-200">
        The team needs a little more information. Reply below and the report goes straight back to them.
      </p>
    );
  }
  if (status === 'RESOLVED') {
    return (
      <p className="border-b border-emerald-200/70 bg-emerald-50 px-5 py-2 text-[12.5px] text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200">
        {resolution === 'FIXED'
          ? 'We think this is fixed. Could you check and let us know?'
          : `Marked as ${RESOLUTION_LABEL[resolution ?? 'FIXED'].toLowerCase()}${detail.duplicateOfKey ? ` of ${detail.duplicateOfKey}` : ''}. Tell us if you disagree.`}
      </p>
    );
  }
  return null;
}

/**
 * One of the reporter's own reports as a conversation: the report is the first message, the team's
 * replies and status changes follow, and the reply box sits at the bottom. Actions appear only when
 * the backend lists them in `allowedActions`.
 */
export function BugReportThread({
  detail,
  receipts,
  onComment,
  onVerdict,
  onAttach,
  headerAction,
}: {
  detail: BugReportDetail;
  /** Fresher delivery markers than the detail's own (e.g. from a polled list). */
  receipts?: BugReceipts;
  /** Resolve true once the message is saved; false keeps the draft in the box. */
  onComment: (body: string) => Promise<boolean>;
  onVerdict: (stillHappening: boolean, note?: string) => Promise<void>;
  onAttach: (file: File) => Promise<void>;
  /** Rendered before the title — e.g. a back button. */
  headerAction?: React.ReactNode;
}) {
  const { summary } = detail;
  const [busy, setBusy] = useState<null | 'fixed' | 'again'>(null);
  const can = (a: string) => detail.allowedActions.includes(a as never);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Open at the newest message, and follow the conversation as it grows.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [summary.id, detail.activity.length]);

  const run = async (kind: NonNullable<typeof busy>, action: () => Promise<void>) => {
    setBusy(kind);
    try {
      await action();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b border-slate-200/70 px-4 py-3 sm:px-5">
        {headerAction}
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
          <CategoryIcon icon={summary.category.icon} size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-[14.5px] font-semibold text-ink" title={summary.title}>
            {summary.title}
          </h2>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11.5px] text-slate-500">
            <span className="font-mono font-semibold text-slate-400">{summary.key}</span>
            <BugStatusBadge status={summary.status} audience="reporter" />
            <BugImpactBadge impact={summary.impact} />
            <span className="hidden sm:inline">{summary.category.label}</span>
          </p>
        </div>
      </header>

      <Prompt detail={detail} />

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-50/60 px-3 py-3 sm:px-5">
        <BugTimeline
          activity={detail.activity}
          audience="reporter"
          receipts={receipts ?? summary.receipts}
          report={{ title: summary.title, description: detail.description, expected: detail.expected, attachments: detail.attachments }}
        />
      </div>

      <footer className="shrink-0 space-y-2.5 border-t border-slate-200/70 px-3 py-3 sm:px-5">
        {can('VERDICT') && (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => run('fixed', () => onVerdict(false))}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-3 py-2 text-[12.5px] font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {busy === 'fixed' ? <Loader2 size={13} className="animate-spin" /> : <ThumbsUp size={13} />} It&apos;s fixed
            </button>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => run('again', () => onVerdict(true))}
              className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-surface px-3 py-2 text-[12.5px] font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {busy === 'again' ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />} Still happening
            </button>
          </div>
        )}

        {can('COMMENT') && (
          <BugChatComposer
            onSend={(body) => onComment(body)}
            onAttach={can('ATTACH') ? onAttach : undefined}
            placeholder={{ reply: summary.status === 'NEEDS_INFO' ? 'Answer the team…' : 'Message the team…' }}
          />
        )}
        {summary.status === 'CLOSED' && (
          <p className="py-1 text-center text-[12px] text-slate-400">This report is closed. If the problem comes back, send a new report.</p>
        )}
      </footer>
    </div>
  );
}
