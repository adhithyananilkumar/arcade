'use client';

import { useState } from 'react';
import { Loader2, RotateCcw, ThumbsUp } from 'lucide-react';
import type { BugReportDetail } from '../types/bug-report.types';
import { absoluteTime, RESOLUTION_LABEL } from '../utils/labels';
import { BugImpactBadge, BugStatusBadge, CategoryIcon } from './BugBadges';
import { BugChatComposer } from './BugChatComposer';
import { BugAttachmentGallery, BugTimeline } from './BugTimeline';

/** What the reporter is being asked, in plain words, for the states that ask them anything. */
function Prompt({ detail }: { detail: BugReportDetail }) {
  const { status, resolution } = detail.summary;
  if (status === 'NEEDS_INFO') {
    return (
      <div className="rounded-2xl border border-fuchsia-200 bg-fuchsia-50 px-3.5 py-2.5 text-[12.5px] text-fuchsia-900 dark:border-fuchsia-500/25 dark:bg-fuchsia-500/10 dark:text-fuchsia-200">
        The team needs a little more information. Reply below and the report goes straight back to them.
      </div>
    );
  }
  if (status === 'RESOLVED') {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-[12.5px] text-emerald-900 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-200">
        {resolution === 'FIXED'
          ? 'We think this is fixed. Could you check and let us know?'
          : `Marked as ${RESOLUTION_LABEL[resolution ?? 'FIXED'].toLowerCase()}${detail.duplicateOfKey ? ` of ${detail.duplicateOfKey}` : ''}. Tell us if you disagree.`}
      </div>
    );
  }
  return null;
}

/**
 * One of the reporter's own reports: what they sent, where it is, and the conversation. Actions
 * appear only when the backend lists them in `allowedActions`.
 */
export function BugReportThread({
  detail,
  onComment,
  onVerdict,
  onAttach,
  compact = false,
}: {
  detail: BugReportDetail;
  /** Resolve true once the message is saved; false keeps the draft in the box. */
  onComment: (body: string) => Promise<boolean>;
  onVerdict: (stillHappening: boolean, note?: string) => Promise<void>;
  onAttach: (file: File) => Promise<void>;
  compact?: boolean;
}) {
  const { summary } = detail;
  const [busy, setBusy] = useState<null | 'fixed' | 'again'>(null);
  const can = (a: string) => detail.allowedActions.includes(a as never);

  const run = async (kind: NonNullable<typeof busy>, action: () => Promise<void>) => {
    setBusy(kind);
    try {
      await action();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] font-bold text-slate-400">{summary.key}</span>
          <BugStatusBadge status={summary.status} audience="reporter" />
          <BugImpactBadge impact={summary.impact} />
        </div>
        <h3 className={`mt-1.5 font-semibold leading-snug text-ink ${compact ? 'text-[14px]' : 'text-lg'}`}>{summary.title}</h3>
        <p className="mt-1 inline-flex items-center gap-1.5 text-[11.5px] text-slate-400">
          <CategoryIcon icon={summary.category.icon} size={12} /> {summary.category.label} · sent {absoluteTime(summary.createdAt)}
        </p>
      </div>

      <Prompt detail={detail} />

      <div className="whitespace-pre-wrap rounded-2xl bg-slate-50 px-3.5 py-3 text-[12.5px] leading-relaxed text-slate-700">
        {detail.description}
        {detail.expected && (
          <>
            <p className="mt-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Expected</p>
            {detail.expected}
          </>
        )}
      </div>

      {detail.attachments.length > 0 && <BugAttachmentGallery attachments={detail.attachments} size={compact ? 'sm' : 'md'} />}

      <div>
        <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">Updates</p>
        <BugTimeline activity={detail.activity} audience="reporter" />
      </div>

      {can('VERDICT') && (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => run('fixed', () => onVerdict(false))}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-3 py-2 text-[12px] font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {busy === 'fixed' ? <Loader2 size={13} className="animate-spin" /> : <ThumbsUp size={13} />} It&apos;s fixed
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => run('again', () => onVerdict(true))}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-slate-300 bg-surface px-3 py-2 text-[12px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {busy === 'again' ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />} Still happening
          </button>
        </div>
      )}

      {can('COMMENT') && (
        <BugChatComposer
          onSend={(body) => onComment(body)}
          onAttach={can('ATTACH') ? onAttach : undefined}
          placeholder={{ reply: summary.status === 'NEEDS_INFO' ? 'Answer the team…' : 'Add a note for the team…' }}
        />
      )}
      {summary.status === 'CLOSED' && (
        <p className="text-center text-[11.5px] text-slate-400">This report is closed. If the problem comes back, send a new report.</p>
      )}
    </div>
  );
}
