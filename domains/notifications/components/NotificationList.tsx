'use client';

import Link from 'next/link';
import { NotificationDto } from '../api/notification.service';

interface NotificationListProps {
  notifications: NotificationDto[];
  onItemClick?: (notification: NotificationDto) => void;
  emptyMessage?: string;
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
        const content = (
          <div
            className={`p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${!n.read ? 'bg-indigo-50/50 dark:bg-indigo-500/10' : ''}`}
            onClick={() => onItemClick?.(n)}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-slate-800 dark:text-slate-200 font-bold">{n.title}</p>
              {!n.read && <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500 shrink-0" />}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{n.message}</p>
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
