'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  Check,
  ChevronDown,
  FileText,
  Lock,
  PlayCircle,
  Radio,
} from 'lucide-react';
import { useContentNotesQuery, type NoteContentType } from '@/domains/learning';
import type { OverviewItem, OverviewSection } from '../contentOverview.types';

interface OverviewSyllabusProps {
  sections: OverviewSection[];
  contentType: NoteContentType;
  contentId: string;
  currentItemId?: string | null;
}

const ITEM_ICON = {
  LESSON: PlayCircle,
  ASSESSMENT: FileText,
  SESSION: Radio,
  RESOURCE: FileText,
} as const;

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
      <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        There is no published content here yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
        Course Curriculum
      </h2>

      <div className="space-y-5">
        {sections.map((section, idx) => {
          const isCollapsed = collapsed.has(section.id);
          const done = section.items.filter((i) => i.completed).length;

          return (
            <div
              key={section.id}
              className="rounded-tl-[2rem] rounded-tr-[2rem] rounded-br-[2rem] rounded-bl-xl border border-slate-200/80 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between gap-4 pb-2">
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-blue-600 dark:text-blue-400">
                    Chapter {idx + 1}: {section.title}
                  </h3>
                  <p className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {section.items.length} {section.items.length === 1 ? 'LESSON' : 'LESSONS'} • {done} COMPLETED
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggle(section.id)}
                  aria-expanded={!isCollapsed}
                  className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                >
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
                  />
                </button>
              </div>

              {!isCollapsed && (
                <ul className="mt-4 space-y-2.5">
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
            </div>
          );
        })}
      </div>
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

  const content = (
    <div
      className={`group flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-medium transition-all ${
        isCurrent
          ? 'bg-blue-50 text-blue-900 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-100 dark:border-blue-800'
          : 'bg-[#F8FAFC] text-slate-700 hover:bg-[#F1F5F9] dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {item.completed ? (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
            <Check size={12} strokeWidth={3} />
          </span>
        ) : item.locked ? (
          <Lock size={15} className="shrink-0 text-slate-400" />
        ) : (
          <Icon size={17} className="shrink-0 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
        )}
        <span className="truncate text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white">
          {item.title}
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0 ml-4">
        {hasNote && (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
            Note
          </span>
        )}
        <span className="text-xs text-slate-400 font-normal">
          {item.completed ? 'Done' : '15 Min'}
        </span>
      </div>
    </div>
  );

  if (item.href && !item.locked) {
    return (
      <li>
        <Link href={item.href} className="block">
          {content}
        </Link>
      </li>
    );
  }

  return <li>{content}</li>;
}
