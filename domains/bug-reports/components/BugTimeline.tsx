'use client';

import { Fragment, useEffect, useState } from 'react';
import {
  ArrowRightLeft,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  Flag,
  Gauge,
  ImagePlus,
  ListOrdered,
  Lock,
  MessageSquare,
  RotateCcw,
  Tag,
  UserCheck,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { BugActivity, BugActivityKind, BugAttachment } from '../types/bug-report.types';
import { absoluteTime, clockTime, dayLabel, describeActivity } from '../utils/labels';
import { PersonAvatar } from './BugBadges';

const EVENT_ICON: Partial<Record<BugActivityKind, LucideIcon>> = {
  CREATED: Flag,
  STATUS_CHANGED: ArrowRightLeft,
  ASSIGNED: UserCheck,
  SEVERITY_CHANGED: Gauge,
  PRIORITY_CHANGED: ListOrdered,
  CATEGORY_CHANGED: Tag,
  ATTACHMENT_ADDED: ImagePlus,
  REOPENED: RotateCcw,
  CONFIRMED_FIXED: CircleCheck,
};

/** Comments from the same person this close together read as one message group. */
const GROUP_WINDOW_MS = 5 * 60 * 1000;

export type BugTimelineFilter = 'all' | 'comments' | 'events';

/**
 * A report's history as a chat: comments as bubbles (the viewer's own on the right), everything
 * else as compact one-line events, grouped under day headings. Staff see INTERNAL entries tinted
 * and marked; reporters never receive them in the first place.
 */
export function BugTimeline({
  activity,
  audience,
  names,
  viewerId,
  filter = 'all',
}: {
  activity: BugActivity[];
  audience: 'staff' | 'reporter';
  /** id → display name, for assignee/category changes. */
  names?: Record<string, string>;
  /** Staff view: whose comments sit on the right. The reporter's own are always on the right. */
  viewerId?: string | null;
  filter?: BugTimelineFilter;
}) {
  const shown = activity.filter((e) => (filter === 'all' ? true : filter === 'comments' ? e.kind === 'COMMENT' : e.kind !== 'COMMENT'));
  if (shown.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1.5 py-6 text-center text-[12px] text-slate-400">
        <MessageSquare size={18} className="opacity-60" />
        {filter === 'comments' ? 'No messages yet.' : 'No activity yet.'}
      </div>
    );
  }

  const isMine = (e: BugActivity) => (audience === 'reporter' ? !e.staff : !!viewerId && e.actor?.id === viewerId);

  return (
    <ol className="space-y-1">
      {shown.map((entry, i) => {
        const prev = shown[i - 1];
        const newDay = !prev || dayLabel(prev.createdAt) !== dayLabel(entry.createdAt);
        const who = entry.actor?.name ?? 'Arcade';
        const internal = entry.visibility === 'INTERNAL';
        const dayHeading = newDay && (
          <li aria-hidden className="flex items-center gap-3 py-2 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
            <span className="h-px flex-1 bg-slate-200/80" />
            {dayLabel(entry.createdAt)}
            <span className="h-px flex-1 bg-slate-200/80" />
          </li>
        );

        if (entry.kind === 'COMMENT') {
          const mine = isMine(entry);
          const continued =
            !newDay &&
            prev?.kind === 'COMMENT' &&
            prev.actor?.id === entry.actor?.id &&
            prev.visibility === entry.visibility &&
            new Date(entry.createdAt).getTime() - new Date(prev.createdAt).getTime() < GROUP_WINDOW_MS;
          const label = audience === 'reporter' && entry.staff ? `${who} · Arcade team` : mine ? 'You' : who;
          return (
            <Fragment key={entry.id}>
              {dayHeading}
              <li className={`flex gap-2.5 ${mine ? 'flex-row-reverse' : ''} ${continued ? 'pt-0.5' : 'pt-2'}`}>
                {mine ? null : continued ? (
                  <span className="w-7 shrink-0" />
                ) : (
                  <PersonAvatar name={who} avatarUrl={entry.actor?.avatarUrl} size={28} />
                )}
                <div className={`flex min-w-0 max-w-[82%] flex-col ${mine ? 'items-end' : 'items-start'}`}>
                  {!continued && (
                    <p className={`mb-1 flex items-center gap-1.5 px-1 text-[11px] text-slate-400 ${mine ? 'flex-row-reverse' : ''}`}>
                      <span className="font-semibold text-slate-600">{label}</span>
                      <time title={absoluteTime(entry.createdAt)}>{clockTime(entry.createdAt)}</time>
                      {internal && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-amber-100 px-1 py-px text-[9.5px] font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-500/15 dark:text-amber-200">
                          <Lock size={9} /> Internal
                        </span>
                      )}
                    </p>
                  )}
                  <div
                    title={continued ? absoluteTime(entry.createdAt) : undefined}
                    className={`whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-left text-[13px] leading-relaxed shadow-xs ${
                      continued ? '' : mine ? 'rounded-tr-md' : 'rounded-tl-md'
                    } ${
                      internal
                        ? 'border border-dashed border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200'
                        : mine
                          ? 'bg-ink text-on-ink'
                          : entry.staff
                            ? 'bg-indigo-50 text-slate-800 ring-1 ring-indigo-100 dark:bg-indigo-500/10 dark:ring-indigo-500/20'
                            : 'bg-surface text-slate-800 ring-1 ring-slate-200/80'
                    }`}
                  >
                    {entry.body}
                  </div>
                </div>
              </li>
            </Fragment>
          );
        }

        const Icon = EVENT_ICON[entry.kind] ?? ArrowRightLeft;
        const note = entry.body && entry.kind !== 'ATTACHMENT_ADDED' ? entry.body : null;
        return (
          <Fragment key={entry.id}>
            {dayHeading}
            <li className="flex gap-2.5 py-1 pl-1 text-[11.5px] text-slate-500">
              <span
                className={`mt-px flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                  internal ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Icon size={11} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="leading-5">
                  <span className="font-semibold text-slate-700">{entry.actor ? who : 'Arcade'}</span>{' '}
                  {describeActivity(entry, { reporter: audience === 'reporter', names })}
                  <time className="ml-1.5 text-slate-400" title={absoluteTime(entry.createdAt)}>
                    {clockTime(entry.createdAt)}
                  </time>
                </p>
                {note && <p className="mt-1 whitespace-pre-wrap break-words border-l-2 border-slate-200 pl-2.5 text-[12px] text-slate-600">{note}</p>}
              </div>
            </li>
          </Fragment>
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
