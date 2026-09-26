'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  FileText,
  Lock,
  NotebookPen,
  PlayCircle,
  Radio,
} from 'lucide-react';
import { useContentNotesQuery, type NoteContentType } from '@/domains/learning';
import type { OverviewItem, OverviewSection } from '../contentOverview.types';

interface OverviewSyllabusProps {
  sections: OverviewSection[];
  contentType: NoteContentType;
  contentId: string;
  /** Item the resume button points at, highlighted as "you are here". */
  currentItemId?: string | null;
}

const ITEM_ICON = {
  LESSON: PlayCircle,
  ASSESSMENT: FileText,
  SESSION: Radio,
  RESOURCE: FileText,
} as const;

/**
 * The contents of the thing, with the learner's own progress and their own notes drawn onto it.
 *
 * <p>The note marker is the point. Everywhere else in the product — and in both reference designs —
 * a syllabus tells you what the author wrote and a notes page tells you what you wrote, and the two
 * never meet. Marking which lessons you annotated turns your own writing into a navigation aid:
 * scanning the syllabus shows where you did the thinking, which is almost always where you want to
 * return.
 */
export function OverviewSyllabus({
  sections,
  contentType,
  contentId,
  currentItemId,
}: OverviewSyllabusProps) {
  const { data: notes } = useContentNotesQuery(contentType, contentId);

  const notedAnchors = useMemo(
    () => new Set((notes?.notes ?? []).map((note) => note.anchorId).filter(Boolean) as string[]),
    [notes],
  );

  // Sections containing unfinished work open by default; fully-completed ones collapse, so a
  // learner returning to a long course lands on what is left rather than scrolling past what isn't.
  const [collapsed, setCollapsed] = useState<Set<string>>(
    () =>
      new Set(
        sections
          .filter((s) => s.items.length > 0 && s.items.every((i) => i.completed))
          .map((s) => s.id),
      ),
  );

  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (sections.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        There is no published content here yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {sections.map((section) => {
        const isCollapsed = collapsed.has(section.id);
        const done = section.items.filter((i) => i.completed).length;

        return (
          <section
            key={section.id}
            className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/70 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60"
          >
            <button
              type="button"
              onClick={() => toggle(section.id)}
              aria-expanded={!isCollapsed}
              className="flex w-full items-center gap-3 px-5 py-4 text-left transition hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
            >
              <ChevronDown
                size={16}
                className={`shrink-0 text-slate-400 transition-transform ${isCollapsed ? '-rotate-90' : ''}`}
              />
              <span className="flex-1 text-[15px] font-semibold text-slate-900 dark:text-slate-100">
                {section.title}
              </span>
              <span className="shrink-0 text-xs font-medium tabular-nums text-slate-400">
                {done}/{section.items.length}
              </span>
            </button>

            {!isCollapsed && (
              <ul className="border-t border-slate-100 dark:border-slate-800">
                {section.items.map((item) => (
                  <SyllabusRow
                    key={item.id}
                    item={item}
                    hasNote={notedAnchors.has(item.id)}
                    isCurrent={item.id === currentItemId}
                  />
                ))}
              </ul>
            )}
          </section>
        );
      })}
    </div>
  );
}

function SyllabusRow({
  item,
  hasNote,
  isCurrent,
}: {
  item: OverviewItem;
  hasNote: boolean;
  isCurrent: boolean;
}) {
  const Icon = ITEM_ICON[item.kind];

  const inner = (
    <>
      <span className="flex h-6 w-6 shrink-0 items-center justify-center">
        {item.completed ? (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Check size={12} strokeWidth={3} />
          </span>
        ) : item.locked ? (
          <Lock size={14} className="text-slate-300 dark:text-slate-600" />
        ) : (
          <Icon size={16} className="text-slate-400" />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-[14px] ${
            isCurrent
              ? 'font-semibold text-indigo-600 dark:text-indigo-400'
              : item.completed
                ? 'text-slate-500 dark:text-slate-400'
                : 'text-slate-800 dark:text-slate-200'
          }`}
        >
          {item.title}
        </span>
      </span>

      {hasNote && (
        <NotebookPen
          size={13}
          className="shrink-0 text-amber-500"
          aria-label="You have notes on this"
        />
      )}
      {item.durationLabel && (
        <span className="shrink-0 text-xs tabular-nums text-slate-400">{item.durationLabel}</span>
      )}
    </>
  );

  const className = `flex w-full items-center gap-3 px-5 py-2.5 text-left transition ${
    isCurrent ? 'bg-indigo-50/60 dark:bg-indigo-950/30' : ''
  } ${item.href && !item.locked ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40' : 'cursor-default opacity-70'}`;

  return (
    <li className="border-b border-slate-50 last:border-0 dark:border-slate-800/50">
      {item.href && !item.locked ? (
        <Link href={item.href} className={className}>
          {inner}
        </Link>
      ) : (
        <div className={className}>{inner}</div>
      )}
    </li>
  );
}
