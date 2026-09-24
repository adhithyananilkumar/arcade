'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, Check, Sparkles } from 'lucide-react';
import { OverviewHero } from './sections/OverviewHero';
import { OverviewSyllabus } from './sections/OverviewSyllabus';
import { OverviewNotesPanel } from './sections/OverviewNotesPanel';
import { OverviewFacts, OverviewPeople } from './sections/OverviewAside';
import type { ContentOverviewModel } from './contentOverview.types';

/**
 * The page a learner opens after enrolling, and every time they come back.
 *
 * One component for every content type. Courses and events supply the same ContentOverviewModel
 * through their own adapter.
 *
 * If a learner arrives without an active enrollment (e.g. following a direct link), they are
 * immediately redirected to the content overview / landing page where details and enrollment live.
 */
export function ContentOverviewPage({ model }: { model: ContentOverviewModel }) {
  const router = useRouter();

  useEffect(() => {
    if (!model.isLoading && !model.isEntitled && model.landingHref) {
      router.replace(model.landingHref);
    }
  }, [model.isLoading, model.isEntitled, model.landingHref, router]);

  if (model.isLoading) return <OverviewSkeleton />;

  if (model.error) {
    return (
      <OverviewMessage
        icon={<AlertTriangle className="text-amber-500" size={28} />}
        title="We couldn't load this"
        body={model.error}
        action={{ href: model.landingHref, label: 'Back to the content page' }}
      />
    );
  }

  if (!model.isEntitled) {
    return <OverviewSkeleton />;
  }

  const flatItems = model.sections.flatMap((section) => section.items);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <OverviewHero model={model} />

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <main className="min-w-0 space-y-6">
          {(model.description || model.outcomes.length > 0) && (
            <section className="rounded-2xl border border-slate-200/80 bg-white/70 p-6 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">About</h2>

              {model.description && (
                <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
                  {model.description}
                </p>
              )}

              {model.outcomes.length > 0 && (
                <>
                  <h3 className="mt-6 text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                    What you&rsquo;ll walk away with
                  </h3>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {model.outcomes.map((outcome) => (
                      <li key={outcome} className="flex gap-2 text-[14px] text-slate-600 dark:text-slate-300">
                        <Check size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </section>
          )}

          <section>
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {model.contentType === 'COURSE' ? 'Course content' : 'Schedule'}
              </h2>
              <span className="text-xs font-medium text-slate-400">
                {model.progress.completedItems} of {model.progress.totalItems} done
              </span>
            </div>
            <OverviewSyllabus
              sections={model.sections}
              contentType={model.noteContentType}
              contentId={model.contentId}
              currentItemId={
                flatItems.find((item) => item.href === model.resume?.href)?.id ?? null
              }
            />
          </section>
        </main>

        {/* Sticky on desktop so the resume-adjacent context — progress, notes, who made this —
            stays reachable while scrolling a long syllabus. */}
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <OverviewNotesPanel
            contentType={model.noteContentType}
            contentId={model.contentId}
            notesHref={model.notesHref}
            items={flatItems}
          />
          <OverviewFacts facts={model.facts} />
          <OverviewPeople people={model.people} />
        </aside>
      </div>
    </div>
  );
}

function OverviewMessage({
  icon,
  title,
  body,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  action: { href: string; label: string };
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-4 text-center">
      {icon}
      <h1 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{title}</h1>
      <p className="mt-2 text-[14px] leading-relaxed text-slate-500 dark:text-slate-400">{body}</p>
      <Link
        href={action.href}
        className="mt-6 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
      >
        {action.label}
      </Link>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6" aria-busy>
      <div className="h-44 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800/60" />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <div className="h-40 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
          <div className="h-64 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
        </div>
        <div className="space-y-4">
          <div className="h-48 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
          <div className="h-36 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/60" />
        </div>
      </div>
    </div>
  );
}
