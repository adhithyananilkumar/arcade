'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, NotebookPen, Search, Trash2 } from 'lucide-react';
import {
  TiptapContentView,
  useContentNotesQuery,
  useDeleteNoteMutation,
} from '@/domains/learning';
import type { ContentOverviewModel } from './contentOverview.types';

/**
 * Every note for one piece of content, on one page.
 *
 * <p>The rail on the overview shows the three most recently touched notes; this is where the rest
 * live. Ordered by position in the content rather than by when they were written, so reading top to
 * bottom replays the course in the learner's own words — which is what makes it usable for revision
 * rather than just an archive.
 *
 * <p>Takes the same {@link ContentOverviewModel} the hub does, so it works for any content type
 * without knowing which one it is.
 */
export function NotesWorkspacePage({ model }: { model: ContentOverviewModel }) {
  const { data, isLoading } = useContentNotesQuery(model.noteContentType, model.contentId);
  const deleteNote = useDeleteNoteMutation(model.noteContentType, model.contentId);
  const [query, setQuery] = useState('');

  const hrefByAnchor = useMemo(
    () => new Map(model.sections.flatMap((s) => s.items).map((item) => [item.id, item.href])),
    [model.sections],
  );

  // Matched against the server-derived excerpt and the anchor label, not the Tiptap JSON — a
  // substring search over raw document JSON would happily match node type names like "paragraph".
  const notes = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return data?.notes ?? [];
    return (data?.notes ?? []).filter(
      (note) =>
        note.excerpt.toLowerCase().includes(needle) ||
        (note.anchorLabel ?? '').toLowerCase().includes(needle),
    );
  }, [data, query]);

  return (
    <main className="min-h-screen bg-background pb-28">
      {/* `LearnerShell` is deliberately transparent so page backgrounds run under the floating
          navbar, which means every page must paint its own — without one, whatever sits behind
          shows through. `bg-background` rather than a hardcoded colour so the `.dark` theme
          applies. The top padding clears the fixed navbar and the bottom padding clears the dock;
          the shell must not supply either (see its comment). */}
      <div className="mx-auto w-full max-w-3xl px-4 pt-28 sm:px-6 md:pt-32">
      <Link
        href={model.overviewHref}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft size={13} />
        Back to {model.title || 'overview'}
      </Link>

      <header className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
            <NotebookPen size={22} className="text-indigo-500" />
            Your notes
          </h1>
          {data && (
            <p className="mt-1 text-[13px] text-slate-500 dark:text-slate-400">
              {data.noteCount} {data.noteCount === 1 ? 'note' : 'notes'} · {data.totalWordCount}{' '}
              {data.totalWordCount === 1 ? 'word' : 'words'}
            </p>
          )}
        </div>

        {(data?.noteCount ?? 0) > 0 && (
          <label className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your notes"
              className="w-56 rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-[13px] outline-none transition focus:border-indigo-400 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
        )}
      </header>

      {isLoading && (
        <div className="mt-6 space-y-3" aria-busy>
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
          ))}
        </div>
      )}

      {!isLoading && (data?.noteCount ?? 0) === 0 && (
        <p className="mt-10 rounded-2xl border border-dashed border-slate-300 p-10 text-center text-sm leading-relaxed text-slate-500 dark:border-slate-700 dark:text-slate-400">
          You haven&rsquo;t written anything here yet.
          <br />
          Notes you take while working through this collect on this page.
        </p>
      )}

      {!isLoading && (data?.noteCount ?? 0) > 0 && notes.length === 0 && (
        <p className="mt-10 text-center text-sm text-slate-500 dark:text-slate-400">
          No notes match &ldquo;{query}&rdquo;.
        </p>
      )}

      <ul className="mt-6 space-y-4">
        {notes.map((note) => {
          const href = note.anchorId ? hrefByAnchor.get(note.anchorId) : null;

          return (
            <li
              key={note.id}
              className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100">
                    {href ? (
                      <Link href={href} className="hover:text-indigo-600 hover:underline">
                        {note.anchorLabel ?? 'On this content'}
                      </Link>
                    ) : (
                      (note.anchorLabel ?? 'On this content')
                    )}
                  </h2>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {note.wordCount} {note.wordCount === 1 ? 'word' : 'words'} · edited{' '}
                    {new Date(note.updatedAt).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Delete this note? This cannot be undone.')) {
                      deleteNote.mutate(note.id);
                    }
                  }}
                  className="shrink-0 rounded-lg p-1.5 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/40"
                  aria-label={`Delete note on ${note.anchorLabel ?? 'this content'}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="arcade-rich-text mt-3 text-[14px] leading-relaxed">
                <TiptapContentView body={note.body} emptyMessage="This note is empty." />
              </div>
            </li>
          );
        })}
        </ul>
      </div>
    </main>
  );
}
