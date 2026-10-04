'use client';

import { motion } from 'framer-motion';
import { ChevronRight, ImageIcon, Inbox, MessageSquare } from 'lucide-react';
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
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/90 px-4 py-8 text-center">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <Inbox size={18} />
        </span>
        <p className="mt-2 text-[12.5px] text-slate-500">{emptyHint}</p>
      </div>
    );
  }

  return (
    <ul className="space-y-1.5 overflow-hidden">
      {reports.map((r, i) => {
        const waiting = r.status === 'NEEDS_INFO' || r.status === 'RESOLVED';
        return (
          <motion.li
            key={r.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.2 }}
          >
            <button
              type="button"
              onClick={() => onOpen(r.id)}
              className="group flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-slate-200/80 bg-surface px-3.5 py-3 text-left shadow-xs transition-all duration-150 hover:border-indigo-300 hover:bg-slate-50/80 hover:shadow-sm dark:hover:border-indigo-500/30"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors duration-200 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:bg-indigo-500">
                <CategoryIcon icon={r.category.icon} size={14} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="font-mono text-[10.5px] font-bold text-slate-400">{r.key}</span>
                  {waiting && (
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-fuchsia-500" aria-label="Waiting for you" />
                    </span>
                  )}
                </span>
                <span className="block truncate text-[12.5px] font-semibold text-slate-900 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  {r.title}
                </span>
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
              <ChevronRight size={14} className="shrink-0 text-slate-300 transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-indigo-500" />
            </button>
          </motion.li>
        );
      })}
    </ul>
  );
}
