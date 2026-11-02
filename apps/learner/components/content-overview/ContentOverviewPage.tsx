'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertTriangle, Play, RotateCcw } from 'lucide-react';
import { OverviewHero } from './sections/OverviewHero';
import { OverviewSyllabus } from './sections/OverviewSyllabus';
import { OverviewNotesPanel } from './sections/OverviewNotesPanel';
import { OverviewFacts, OverviewPeople } from './sections/OverviewAside';
import { OverviewVideoPlayer } from './sections/OverviewVideoPlayer';
import { CertificationCard } from './sections/CertificationCard';
import { OverviewRatingCard } from './sections/OverviewRatingCard';
import { OverviewReport } from './sections/OverviewReport';
import type { ContentOverviewModel } from './contentOverview.types';

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

  const outcomes = model.outcomes;

  const isComplete = model.progress.state === 'COMPLETED';

  return (
    <div className="min-h-screen w-full bg-surface theme-page-bg text-slate-900">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 space-y-8">
      {/* Top Hero Banner */}
      <OverviewHero model={model} />

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_21rem]">
        {/* Left Main Content Column */}
        <main className="min-w-0 space-y-8">
          {/* Interactive Course Video/Media Preview Player if previewUrl is set */}
          {model.previewUrl && (
            <OverviewVideoPlayer
              previewUrl={model.previewUrl}
              posterUrl={model.coverImageUrl}
              title={model.title}
            />
          )}

          {/* About, then what the learner takes away — each only when the content provides it */}
          {(model.description || outcomes.length > 0) && (
            <div className="space-y-6">
              {model.description && (
                <section>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">About</h2>
                  <p className="mt-2 whitespace-pre-line text-sm sm:text-base leading-relaxed text-slate-600 font-normal">
                    {model.description}
                  </p>
                </section>
              )}

              {outcomes.length > 0 && (
                <section>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    What You&apos;ll Learn:
                  </h2>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600">
                    {outcomes.map((outcome) => (
                      <li key={outcome} className="flex items-start gap-2.5">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-900" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}

          {/* Course Curriculum / Syllabus */}
          <OverviewSyllabus
            sections={model.sections}
            contentType={model.noteContentType}
            contentId={model.contentId}
            currentItemId={
              flatItems.find((item) => item.href === model.resume?.href)?.id ?? null
            }
          />
        </main>

        {/* Right Sidebar Column */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          {/* Primary action — same ink button as the dashboard's "Continue Learning" */}
          {model.resume && (
            <Link
              href={model.resume.href}
              className="group flex w-full items-center justify-center gap-2.5 rounded-tl-2xl rounded-br-2xl rounded-tr-md rounded-bl-md bg-ink px-6 py-3.5 text-center text-[15px] font-semibold text-on-ink shadow-[0_8px_24px_-8px_rgba(20,20,43,0.45)] transition-all hover:-translate-y-0.5 hover:bg-ink-hover hover:shadow-[0_12px_28px_-8px_rgba(20,20,43,0.5)] active:translate-y-0 active:scale-[0.98]"
            >
              {isComplete ? (
                <RotateCcw size={17} className="transition-transform duration-300 group-hover:-rotate-90" />
              ) : (
                <Play size={17} className="fill-current" />
              )}
              <span>{model.resume.label}</span>
            </Link>
          )}

          {/* Course Includes : Card */}
          <OverviewFacts facts={model.facts} />

          {/* Instructor Card */}
          <OverviewPeople people={model.people} />

          {/* Notes Panel */}
          <OverviewNotesPanel
            contentType={model.noteContentType}
            contentId={model.contentId}
            notesHref={model.notesHref}
            items={flatItems}
          />

          {/* Course Rating Section — allowing viewing and editing ratings */}
          {model.contentType === 'COURSE' && (
            <OverviewRatingCard courseId={model.contentId} />
          )}

          {/* Certification Status */}
          <CertificationCard
            contentType={model.contentType}
            contentId={model.contentId}
            completed={model.progress.state === 'COMPLETED'}
          />

          {/* Report — only reachable by enrolled learners, since this page is entitlement-gated */}
          <OverviewReport contentType={model.contentType} contentId={model.contentId} />
        </aside>
      </div>
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
      <h1 className="mt-4 text-lg font-bold text-slate-900">{title}</h1>
      <p className="mt-2 text-[14px] leading-relaxed text-slate-500">{body}</p>
      <Link
        href={action.href}
        className="mt-6 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-on-ink transition hover:bg-slate-800"
      >
        {action.label}
      </Link>
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6" aria-busy>
      <div className="h-44 animate-pulse rounded-3xl bg-slate-100" />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-4">
          <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
        </div>
        <div className="space-y-4">
          <div className="h-48 animate-pulse rounded-2xl bg-slate-100" />
          <div className="h-36 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    </div>
  );
}

