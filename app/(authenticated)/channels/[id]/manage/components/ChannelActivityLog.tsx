'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { BookOpen, Edit3, Loader2, ShieldCheck, Star, Users, Video } from 'lucide-react';
import { channelService, type ChannelAuditLogEntry } from '@/domains/channels';
import { Panel } from '@/shared/design-system/ui/panel';
import { cn } from '@/shared/utils/utils';

// Categories the backend's audit-log filter understands (ChannelAuditLogRepository).
const FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'COURSE', label: 'Content' },
  { id: 'STAFF', label: 'Staff' },
  { id: 'REVIEW', label: 'Reviews' },
  { id: 'WEBINAR', label: 'Webinars' },
];

function iconFor(action: string) {
  const a = action.toUpperCase();
  if (a.includes('COURSE') || a.includes('CONTENT')) return BookOpen;
  if (a.includes('STAFF') || a.includes('MEMBER') || a.includes('USER')) return Users;
  if (a.includes('ROLE') || a.includes('POLICY') || a.includes('OWNER')) return ShieldCheck;
  if (a.includes('REVIEW')) return Star;
  if (a.includes('WEBINAR') || a.includes('EVENT')) return Video;
  return Edit3;
}

const humanize = (action: string) => {
  const s = action.replace(/_/g, ' ').toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/** The channel's audit trail: who did what, and when. */
export function ChannelActivityLog({ channelId }: { channelId: string }) {
  const [filter, setFilter] = useState('ALL');
  const [logs, setLogs] = useState<ChannelAuditLogEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    channelService
      .getChannelAuditLog(channelId, filter)
      .then((res) => {
        if (cancelled) return;
        setLogs(res);
        setError(null);
      })
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : 'Could not load activity.'));
    return () => {
      cancelled = true;
    };
  }, [channelId, filter]);

  return (
    <div className="space-y-4">
      <div className="inline-flex flex-wrap items-center gap-1.5 rounded-full border border-slate-200/80 bg-surface/80 p-1.5 shadow-xs backdrop-blur-md">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => {
              if (f.id === filter) return;
              setLogs(null);
              setFilter(f.id);
            }}
            className={cn(
              'cursor-pointer rounded-full px-4 py-2 text-[12px] font-semibold transition-all duration-200',
              filter === f.id
                ? 'bg-slate-950 text-white shadow-xs dark:bg-white dark:text-slate-950'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Panel padded={false} className="p-2">
        {error ? (
          <p className="m-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300">{error}</p>
        ) : logs === null ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-slate-400" size={22} />
          </div>
        ) : logs.length === 0 ? (
          <p className="px-6 py-14 text-center text-[13px] font-medium text-slate-500">No activity recorded yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {logs.map((log) => {
              const Icon = iconFor(log.action);
              return (
                <li key={log.id} className="flex gap-3.5 px-3 py-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <Icon size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <p className="text-[13px] font-semibold text-ink">{humanize(log.action)}</p>
                      <time
                        dateTime={log.createdAt}
                        title={log.createdAt ? new Date(log.createdAt).toLocaleString() : undefined}
                        className="text-[11.5px] font-medium text-slate-400"
                      >
                        {log.createdAt ? formatDistanceToNow(new Date(log.createdAt), { addSuffix: true }) : ''}
                      </time>
                    </div>
                    {log.details && <p className="mt-0.5 text-[12.5px] font-medium text-slate-600">{log.details}</p>}
                    <p className="mt-0.5 text-[11.5px] font-medium text-slate-400">by {log.actorName || 'System'}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Panel>
    </div>
  );
}
