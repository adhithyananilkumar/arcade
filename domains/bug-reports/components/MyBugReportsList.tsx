'use client';

import { ChevronRight, ImageIcon, MessageSquare } from 'lucide-react';
import type { BugReportSummary } from '../types/bug-report.types';
import { relativeTime } from '../utils/labels';
import { BugStatusBadge, CategoryIcon } from './BugBadges';

/** The reporter's reports, newest activity first. Ones waiting on the reporter are flagged. */
export function MyBugReportsList({
  reports,
  onOpen,
  emptyHint = 'Reports you send will show up here, with replies from the team.',
}: {
  reports: BugReportSummary[];
  onOpen: (id: string) => void;
  emptyHint?: string;
}) {
  if (reports.length === 0) {
    return <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-[12.5px] text-slate-400">{emptyHint}</p>;
  }
  return (
    <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200/80 bg-surface">
      {reports.map((r) => {
        const waiting = r.status === 'NEEDS_INFO' || r.status === 'RESOLVED';
        return (
          <li key={r.id}>
            <button type="button" onClick={() => onOpen(r.id)} className="flex w-full cursor-pointer items-center gap-3 px-3.5 py-3 text-left transition hover:bg-slate-50">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <CategoryIcon icon={r.category.icon} size={14} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="font-mono text-[10.5px] font-bold text-slate-400">{r.key}</span>
                  {waiting && <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-500" aria-label="Waiting for you" />}
                </span>
                <span className="block truncate text-[12.5px] font-semibold text-slate-800">{r.title}</span>
                <span className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-400">
                  {relativeTime(r.lastActivityAt)}
                  {r.commentCount > 0 && (
                    <span className="inline-flex items-center gap-0.5">
                      <MessageSquare size={10} /> {r.commentCount}
                    </span>
                  )}
                  {r.attachmentCount > 0 && (
                    <span className="inline-flex items-center gap-0.5">
                      <ImageIcon size={10} /> {r.attachmentCount}
                    </span>
                  )}
                </span>
              </span>
              <BugStatusBadge status={r.status} audience="reporter" />
              <ChevronRight size={14} className="shrink-0 text-slate-300" />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
