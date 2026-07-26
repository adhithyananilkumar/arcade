'use client';

import Link from 'next/link';
import { NotificationDto } from '../api/notification.service';

interface NotificationListProps {
  notifications: NotificationDto[];
  onItemClick?: (notification: NotificationDto) => void;
  emptyMessage?: string;
}

function typeLabel(type: string): string | null {
  switch (type) {
    case 'CONTENT_SUBMITTED':
      return 'Review submitted';
    case 'CONTENT_APPROVED':
      return 'Approved';
    case 'CONTENT_CHANGES_REQUESTED':
      return 'Changes requested';
    case 'CHANNEL_APPROVED':
    case 'CHANNEL_REJECTED':
      return 'Channel';
    default:
      return null;
  }
}

function typeTone(type: string): string {
  switch (type) {
    case 'CONTENT_APPROVED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'CONTENT_CHANGES_REQUESTED':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'CONTENT_SUBMITTED':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}

// Pure presentational — no fetching, no side effects. The orchestrator (e.g. LearnerNavbar)
// owns the data and passes it in, per the frontend's domain-UI-is-pure convention.
export function NotificationList({ notifications, onItemClick, emptyMessage }: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-slate-500">
        {emptyMessage || 'No notifications yet'}
      </div>
    );
  }

  return (
    <div className="divide-y divide-black/5 dark:divide-white/5">
      {notifications.map((n) => {
        const label = typeLabel(n.type);
        const content = (
          <div
            className={`p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${!n.read ? 'bg-indigo-50/50 dark:bg-indigo-500/10' : ''}`}
            onClick={() => onItemClick?.(n)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                {label && (
                  <span
                    className={`mb-1.5 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${typeTone(n.type)}`}
                  >
                    {label}
                  </span>
                )}
                <p className="text-sm text-slate-800 dark:text-slate-200 font-bold">{n.title}</p>
              </div>
              {!n.read && <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500 shrink-0" />}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{n.message}</p>
            {n.actorName && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                by {n.actorName}
              </p>
            )}
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
              {new Date(n.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              {' at '}
              {new Date(n.createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
            </p>
          </div>
        );

        return n.linkUrl ? (
          <Link key={n.id} href={n.linkUrl} className="block cursor-pointer">
            {content}
          </Link>
        ) : (
          <div key={n.id} className="cursor-pointer">
            {content}
          </div>
        );
      })}
    </div>
  );
}
