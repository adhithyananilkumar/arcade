'use client';

import { Inbox } from 'lucide-react';
import type { BugReportSummary } from '../types/bug-report.types';
import { listTime, receiptState } from '../utils/labels';
import { BugStatusBadge, CategoryIcon, MessageTicks } from './BugBadges';

/** The preview line under a report: who spoke last and what they said, with ticks on your own. */
function Preview({ report }: { report: BugReportSummary }) {
  const last = report.lastMessage;
  if (!last) return <span className="truncate">{report.category.label}</span>;
  const mine = !last.staff;
  return (
    <>
      {mine && <MessageTicks state={receiptState(last.createdAt, 'reporter', report.receipts)} className="-ml-0.5" />}
      <span className="truncate">
        {mine ? (last.kind === 'CREATED' ? '' : 'You: ') : <span className="font-medium text-slate-600">{last.actorName?.split(' ')[0] ?? 'Arcade team'}: </span>}
        {last.body}
      </span>
    </>
  );
}

/**
 * The reporter's reports as a chat list, newest activity first: what was reported, the last
 * message with its ticks, and how many team replies are unread.
 */
export function MyBugReportsList({
  reports,
  selectedId,
  onOpen,
  emptyHint = 'Reports you send will show up here, with replies from the team.',
}: {
  reports: BugReportSummary[];
  selectedId?: string | null;
  onOpen: (id: string) => void;
  emptyHint?: string;
}) {
  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Inbox size={18} />
        </span>
        <p className="mt-2 text-[12.5px] text-slate-500">{emptyHint}</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {reports.map((r) => {
        const selected = selectedId === r.id;
        const unread = r.unreadCount > 0;
        return (
          <li key={r.id}>
            <button
              type="button"
              onClick={() => onOpen(r.id)}
              aria-current={selected ? 'true' : undefined}
              className={`flex w-full cursor-pointer items-center gap-3 px-3 py-3 text-left transition-colors ${
                selected ? 'bg-slate-100' : 'hover:bg-slate-50'
              }`}
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                <CategoryIcon icon={r.category.icon} size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline gap-2">
                  <span className={`min-w-0 flex-1 truncate text-[13.5px] text-slate-900 ${unread ? 'font-bold' : 'font-semibold'}`}>{r.title}</span>
                  <span className={`shrink-0 text-[11px] ${unread ? 'font-semibold text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {listTime(r.lastMessage?.createdAt ?? r.lastActivityAt)}
                  </span>
                </span>
                <span className="mt-0.5 flex items-center gap-2">
                  <span className={`flex min-w-0 flex-1 items-center gap-1 text-[12.5px] ${unread ? 'text-slate-700' : 'text-slate-500'}`}>
                    <Preview report={r} />
                  </span>
                  {unread && (
                    <span className="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-emerald-500 px-1.5 text-[10.5px] font-bold text-white">
                      {r.unreadCount}
                    </span>
                  )}
                </span>
                <span className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="font-mono">{r.key}</span>
                  <BugStatusBadge status={r.status} audience="reporter" />
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
