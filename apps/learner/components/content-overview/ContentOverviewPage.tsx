'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Check } from 'lucide-react';
import { OverviewHero } from './sections/OverviewHero';
import { OverviewSyllabus } from './sections/OverviewSyllabus';
import { OverviewNotesPanel } from './sections/OverviewNotesPanel';
import { OverviewFacts, OverviewPeople } from './sections/OverviewAside';
import type { ContentOverviewModel } from './contentOverview.types';

/**
 * The page a learner opens after enrolling, and every time they come back.
 *
 * <p>It exists because "Go to course" used to drop straight into the player, which answers "what is
 * the next video" and nothing else. Between enrolling and studying there is a real question —
 * what is this, where am I, what did I conclude last time — and no surface was answering it.
 *
 * <p>One component for every content type. Courses and events supply the same {@link
 * ContentOverviewModel} through their own adapter; nothing below branches on which one it is.
 *
 * <p>This hub belongs to enrolled learners only, and its URL is inert for everyone else. Someone
 * who reaches it without an entitlement — a typed URL or an old bookmark, since nothing links here
 * for them — is sent to the content's own landing page, which is where the details and the enrol
 * button live. A holding card was tried first and replaced: it was a dead end that made the reader
 * click again to reach the only page that could actually help them.
 */
export function ContentOverviewPage({ model }: { model: ContentOverviewModel }) {
  const router = useRouter();

  // `replace`, not `push`: the hub was never a place this learner could be, so it must not sit in
  // history for Back to return to. Gated on `isLoading`/`error` because entitlement is unknown
  // until the model resolves, and an in-flight read must not read as "not entitled".
  const shouldRedirect = !model.isLoading && !model.error && !model.isEntitled;
  const landingHref = model.landingHref;
  useEffect(() => {
    if (shouldRedirect) router.replace(landingHref);
  }, [shouldRedirect, landingHref, router]);

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

  // The redirect above is already in flight; render the skeleton rather than a message the reader
  // would only see flash past.
  if (!model.isEntitled) return <OverviewSkeleton />;

  const flatItems = model.sections.flatMap((section) => section.items);

  return (
    <main className="min-h-screen bg-background pb-28">
      {/* `LearnerShell` is deliberately transparent so page backgrounds run under the floating
          navbar, which means every page must paint its own — without one, whatever sits behind
          shows through. `bg-background` rather than a hardcoded colour so the `.dark` theme
          applies. The top padding clears the fixed navbar and the bottom padding clears the dock;
          the shell must not supply either (see its comment). */}
      <div className="mx-auto w-full max-w-6xl px-4 pt-28 sm:px-6 md:px-8 md:pt-32">
        <OverviewHero model={model} />

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="min-w-0 space-y-6">
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
          </div>

          {/* Sticky on desktop so the resume-adjacent context — progress, notes, who made this —
            stays reachable while scrolling a long syllabus. */}
          <aside className="space-y-4 lg:sticky lg:top-32 lg:self-start">
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
    </main>
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
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center bg-background px-4 text-center">
      {icon}
      <h1 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{title}</h1>
      <p className="mt-2 text-[14px] leading-relaxed text-slate-500 dark:text-slate-400">{body}</p>
      <Link
        href={action.href}
        className="mt-6 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900"
      >
        {action.label}
      </Link>
    </main>
  );
}

function OverviewSkeleton() {
  return (
    <main className="min-h-screen bg-background pb-28" aria-busy>
      <div className="mx-auto w-full max-w-6xl px-4 pt-28 sm:px-6 md:px-8 md:pt-32">
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
    </main>
  );
}
