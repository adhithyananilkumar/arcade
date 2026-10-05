'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, NotebookPen, PenLine, Plus } from 'lucide-react';
import { useContentNotesQuery, type LearnerNote, type NoteContentType } from '@/domains/learning';
import { NotePreviewSheet } from './NotePreviewSheet';
import type { OverviewItem } from '../contentOverview.types';

interface OverviewNotesPanelProps {
  contentType: NoteContentType;
  contentId: string;
  notesHref: string;
  /** Flattened items, so a note can offer "open the lesson this came from". */
  items: OverviewItem[];
}

/** How many note cards the rail shows before deferring to the full workspace. */
const PREVIEW_LIMIT = 3;

/**
 * The learner's own writing, surfaced on the way into the content rather than buried in the
 * player's side rail.
 *
 * <p>This is the part neither reference page has. Coursera and Laracasts both treat notes as
 * something you do *while* watching and never see again; the thing a returning learner actually
 * wants is what they concluded last time, before they pick up where they left off. So the rail
 * leads with the rollup (how much you've written), then the most recently touched notes, each of
 * which opens read-only next to a link back to the lesson that produced it.
 */
export function OverviewNotesPanel({
  contentType,
  contentId,
  notesHref,
  items,
}: OverviewNotesPanelProps) {
  const { data, isLoading } = useContentNotesQuery(contentType, contentId);
  const [openNote, setOpenNote] = useState<LearnerNote | null>(null);

  const hrefByAnchor = useMemo(
    () => new Map(items.map((item) => [item.id, item.href])),
    [items],
  );

  // Most recently touched first here, deliberately different from the workspace's syllabus order:
  // the rail is answering "what was I last thinking about", not "show me everything".
  const recent = useMemo(
    () =>
      [...(data?.notes ?? [])]
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, PREVIEW_LIMIT),
    [data],
  );

  return (
    <section className="rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface/95 shadow-[0_8px_30px_rgba(20,20,43,0.05)] backdrop-blur-sm p-6">
      <header className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <NotebookPen size={16} className="text-blue-600 dark:text-blue-400" />
          Your notes
        </h2>
        <Link
          href={notesHref}
          className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-400 dark:hover:bg-blue-900/80"
        >
          <Plus size={13} />
          Note
        </Link>
      </header>

      {isLoading && <NotesSkeleton />}

      {!isLoading && (!data || data.noteCount === 0) && (
        <div className="mt-3 space-y-3">
          <p className="text-[13px] leading-relaxed text-slate-500">
            Nothing written yet. Notes you take while working through this appear here, so you can
            pick up your own train of thought before you start again.
          </p>
          <Link
            href={notesHref}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <Plus size={13} />
            Add your first note
          </Link>
        </div>
      )}

      {!isLoading && data && data.noteCount > 0 && (
        <>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {data.noteCount} {data.noteCount === 1 ? 'note' : 'notes'} · {data.totalWordCount}{' '}
              {data.totalWordCount === 1 ? 'word' : 'words'}
            </p>
            <Link
              href={notesHref}
              className="flex items-center gap-0.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              All {data.noteCount}
              <ArrowUpRight size={13} />
            </Link>
          </div>

          <ul className="mt-3 space-y-2">
            {recent.map((note) => (
              <li key={note.id}>
                <button
                  type="button"
                  onClick={() => setOpenNote(note)}
                  className="group w-full rounded-xl border border-slate-200/70 bg-surface/60 p-3 text-left transition hover:border-indigo-300 hover:bg-indigo-50/40 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30"
                >
                  <span className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">
                    <PenLine size={11} />
                    {note.anchorLabel ?? 'On this course'}
                  </span>
                  <p className="mt-1 line-clamp-3 text-[13px] leading-relaxed text-slate-600">
                    {note.excerpt}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <NotePreviewSheet
        note={openNote}
        itemHref={openNote?.anchorId ? hrefByAnchor.get(openNote.anchorId) ?? null : null}
        onClose={() => setOpenNote(null)}
      />
    </section>
  );

}

function NotesSkeleton() {
  return (
    <div className="mt-3 space-y-2" aria-hidden>
      {[0, 1].map((i) => (
        <div
          key={i}
          className="h-16 animate-pulse rounded-xl bg-slate-100"
        />
      ))}
    </div>
  );
}
