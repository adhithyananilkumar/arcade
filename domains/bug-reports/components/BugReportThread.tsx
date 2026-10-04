'use client';

import { useRef, useState } from 'react';
import { ImagePlus, Loader2, RotateCcw, Send, ThumbsUp } from 'lucide-react';
import type { BugReportDetail } from '../types/bug-report.types';
import { absoluteTime, RESOLUTION_LABEL } from '../utils/labels';
import { BugImpactBadge, BugStatusBadge, CategoryIcon } from './BugBadges';
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
  onComment: (body: string) => Promise<void>;
  onVerdict: (stillHappening: boolean, note?: string) => Promise<void>;
  onAttach: (file: File) => Promise<void>;
  compact?: boolean;
}) {
  const { summary } = detail;
  const [reply, setReply] = useState('');
  const [busy, setBusy] = useState<null | 'reply' | 'fixed' | 'again' | 'attach'>(null);
  const fileRef = useRef<HTMLInputElement>(null);
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
        <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Updates</p>
        <BugTimeline activity={detail.activity} audience="reporter" />
      </div>

      {can('VERDICT') && (
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => run('fixed', () => onVerdict(false, reply.trim() || undefined).then(() => setReply('')))}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full bg-emerald-600 px-3 py-2 text-[12px] font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {busy === 'fixed' ? <Loader2 size={13} className="animate-spin" /> : <ThumbsUp size={13} />} It&apos;s fixed
          </button>
          <button
            type="button"
            disabled={busy !== null}
            onClick={() => run('again', () => onVerdict(true, reply.trim() || undefined).then(() => setReply('')))}
            className="inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-slate-300 bg-surface px-3 py-2 text-[12px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {busy === 'again' ? <Loader2 size={13} className="animate-spin" /> : <RotateCcw size={13} />} Still happening
          </button>
        </div>
      )}

      {can('COMMENT') && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!reply.trim()) return;
            run('reply', () => onComment(reply.trim()).then(() => setReply('')));
          }}
          className="flex items-end gap-2"
        >
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={2}
            maxLength={4000}
            placeholder={summary.status === 'NEEDS_INFO' ? 'Answer the team…' : 'Add a note for the team…'}
            className="min-w-0 flex-1 resize-none rounded-2xl border border-slate-200 bg-surface px-3 py-2 text-[12.5px] text-slate-800 placeholder:text-slate-400 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 dark:focus:border-indigo-500/40 dark:focus:ring-indigo-500/25"
          />
          {can('ATTACH') && (
            <>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={busy !== null}
                aria-label="Add a screenshot"
                className="cursor-pointer rounded-full border border-slate-200 bg-surface p-2.5 text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                {busy === 'attach' ? <Loader2 size={15} className="animate-spin" /> : <ImagePlus size={15} />}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = '';
                  if (file) run('attach', () => onAttach(file));
                }}
              />
            </>
          )}
          <button
            type="submit"
            disabled={!reply.trim() || busy !== null}
            aria-label="Send"
            className="cursor-pointer rounded-full bg-ink p-2.5 text-on-ink hover:bg-ink-hover disabled:opacity-40"
          >
            {busy === 'reply' ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </form>
      )}
      {summary.status === 'CLOSED' && (
        <p className="text-center text-[11.5px] text-slate-400">This report is closed. If the problem comes back, send a new report.</p>
      )}
    </div>
  );
}
