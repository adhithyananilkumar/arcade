'use client';

import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Lock, X } from 'lucide-react';
import type { BugActivity, BugAttachment } from '../types/bug-report.types';
import { absoluteTime, describeActivity, relativeTime } from '../utils/labels';
import { PersonAvatar } from './BugBadges';

/**
 * A report's history: comments as bubbles, everything else as one-line events. Staff see INTERNAL
 * entries tinted and marked; reporters never receive them in the first place.
 */
export function BugTimeline({
  activity,
  audience,
  names,
}: {
  activity: BugActivity[];
  audience: 'staff' | 'reporter';
  /** id → display name, for assignee/category changes. */
  names?: Record<string, string>;
}) {
  if (activity.length === 0) return <p className="text-xs text-slate-400">No activity yet.</p>;
  return (
    <ol className="space-y-3">
      {activity.map((entry) => {
        const who = entry.actor?.name ?? 'Arcade';
        const internal = entry.visibility === 'INTERNAL';
        if (entry.kind === 'COMMENT') {
          const mine = audience === 'reporter' ? !entry.staff : entry.staff;
          return (
            <li key={entry.id} className={`flex gap-2.5 ${mine && audience === 'reporter' ? 'flex-row-reverse' : ''}`}>
              <PersonAvatar name={who} avatarUrl={entry.actor?.avatarUrl} size={26} />
              <div className={`min-w-0 max-w-[85%] ${mine && audience === 'reporter' ? 'items-end text-right' : ''}`}>
                <p className="mb-0.5 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-600">{audience === 'reporter' && entry.staff ? `${who} · Arcade team` : who}</span>{' '}
                  · <time title={absoluteTime(entry.createdAt)}>{relativeTime(entry.createdAt)}</time>
                  {internal && (
                    <span className="ml-1.5 inline-flex items-center gap-0.5 rounded bg-amber-100 px-1 py-px text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-500/15 dark:text-amber-200">
                      <Lock size={9} /> Internal
                    </span>
                  )}
                </p>
                <div
                  className={`inline-block whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-left text-[12.5px] leading-relaxed ${
                    internal
                      ? 'border border-dashed border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200'
                      : entry.staff
                        ? 'bg-indigo-50 text-slate-800 dark:bg-indigo-500/10'
                        : 'bg-slate-100 text-slate-800'
                  }`}
                >
                  {entry.body}
                </div>
              </div>
            </li>
          );
        }
        return (
          <li key={entry.id} className="flex items-center gap-2 pl-1 text-[11.5px] text-slate-500">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${internal ? 'bg-amber-400' : 'bg-slate-300'}`} />
            <span className="min-w-0">
              <span className="font-semibold text-slate-700">{entry.actor ? who : 'Arcade'}</span>{' '}
              {describeActivity(entry, { reporter: audience === 'reporter', names })}
              {entry.body && entry.kind !== 'ATTACHMENT_ADDED' ? <span className="text-slate-400"> — {entry.body}</span> : null}
              <time className="ml-1.5 text-slate-400" title={absoluteTime(entry.createdAt)}>
                {relativeTime(entry.createdAt)}
              </time>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Screenshot thumbnails with a keyboard-navigable lightbox. */
export function BugAttachmentGallery({ attachments, size = 'md' }: { attachments: BugAttachment[]; size?: 'sm' | 'md' }) {
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(null);
      if (e.key === 'ArrowRight') setOpen((i) => (i === null ? i : (i + 1) % attachments.length));
      if (e.key === 'ArrowLeft') setOpen((i) => (i === null ? i : (i - 1 + attachments.length) % attachments.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, attachments.length]);

  if (attachments.length === 0) return null;
  const thumb = size === 'sm' ? 'h-14 w-20' : 'h-20 w-28';
  const current = open === null ? null : attachments[open];

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {attachments.map((a, i) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setOpen(i)}
            className={`${thumb} cursor-zoom-in overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition hover:border-slate-300 hover:shadow-sm`}
            title={a.fileName ?? 'Screenshot'}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- signed storage URL */}
            <img src={a.url} alt={a.fileName ?? 'Screenshot'} className="h-full w-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
      {current && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/90 p-4" role="dialog" aria-modal="true" data-capture-ignore onClick={() => setOpen(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element -- signed storage URL */}
          <img src={current.url} alt={current.fileName ?? 'Screenshot'} className="max-h-full max-w-full rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
          <button type="button" onClick={() => setOpen(null)} aria-label="Close" className="absolute right-4 top-4 cursor-pointer rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
            <X size={18} />
          </button>
          {attachments.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Previous"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((i) => (i === null ? i : (i - 1 + attachments.length) % attachments.length));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                aria-label="Next"
                onClick={(e) => {
                  e.stopPropagation();
                  setOpen((i) => (i === null ? i : (i + 1) % attachments.length));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
          <a
            href={current.url}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/20"
          >
            Open original · {open! + 1}/{attachments.length}
          </a>
        </div>
      )}
    </>
  );
}
