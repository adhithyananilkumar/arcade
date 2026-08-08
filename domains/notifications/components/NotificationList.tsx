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
      <div className="py-12 px-4 text-center select-none">
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center mb-3">
          {/* Detailed SVG representation of the leaves surrounding the bell */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none" fill="none">
            {/* Left Leaf Group (Teal/Green) */}
            <path d="M 22 55 C 16 48, 16 38, 24 32 C 26 40, 24 48, 22 55 Z" fill="#10b981" opacity="0.75" />
            <path d="M 12 42 C 8 36, 12 28, 20 28 C 18 34, 16 38, 12 42 Z" fill="#34d399" opacity="0.65" />
            <path d="M 28 62 C 24 58, 26 52, 32 48 C 30 54, 30 58, 28 62 Z" fill="#059669" opacity="0.5" />
            
            {/* Right Leaf Group (Blue/Indigo) */}
            <path d="M 78 55 C 84 48, 84 38, 76 32 C 74 40, 76 48, 78 55 Z" fill="#3b82f6" opacity="0.75" />
            <path d="M 88 42 C 92 36, 88 28, 80 28 C 82 34, 84 38, 88 42 Z" fill="#60a5fa" opacity="0.65" />
            <path d="M 72 62 C 76 58, 74 52, 68 48 C 70 54, 70 58, 72 62 Z" fill="#2563eb" opacity="0.5" />
          </svg>

          {/* Center circular background with bell icon */}
          <div className="w-16 h-16 rounded-full bg-slate-100/80 border border-slate-200/40 flex items-center justify-center relative z-10">
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-slate-800" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
        </div>

        <h4 className="text-xs font-black text-slate-850 dark:text-slate-200 mb-1">You're all caught up!</h4>
        <p className="text-[10px] text-slate-400 font-semibold max-w-[180px] mx-auto leading-relaxed">
          {emptyMessage || "We'll notify you when something new arrives."}
        </p>
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
