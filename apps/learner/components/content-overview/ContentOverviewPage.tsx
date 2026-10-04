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

  // Default outcomes matching reference image if none provided
  const outcomes =
    model.outcomes.length > 0
      ? model.outcomes
      : [
          'UI fundamentals and layout systems',
          'UX research and wireframing',
          'Prototyping tools like Figma',
          'Accessibility and user testing',
          'Design handoff for developers',
        ];

  const defaultImage =
    'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=1200&q=80';

  const isComplete = model.progress.state === 'COMPLETED';

  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 space-y-8">
      {/* Top Hero Banner */}
      <OverviewHero model={model} />

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_21rem]">
        {/* Left Main Content Column */}
        <main className="min-w-0 space-y-8">
          {/* Interactive Course Video Preview Player */}
          <OverviewVideoPlayer
            posterUrl={model.coverImageUrl || defaultImage}
            title={model.title}
          />

          {/* Course Description & Outcomes */}
          <div className="space-y-4">
            <p className="text-sm sm:text-base leading-relaxed text-slate-600 dark:text-slate-300 font-normal">
              {model.description ||
                'Great design goes beyond appearance — it creates intuitive, enjoyable user experiences. This course teaches design principles and UX thinking to create interfaces people love to use.'}
            </p>

            {/* What You'll Learn Section */}
            <div className="pt-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                What You&apos;ll Learn:
              </h2>

              <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                {outcomes.map((outcome) => (
                  <li key={outcome} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-900 dark:bg-slate-200" />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
                Through real projects, you&apos;ll go from user problem to clickable prototype with confidence.
              </p>
            </div>
          </div>

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
          {/* Prominent Action Button matching reference image */}
          {model.resume && (
            <Link
              href={model.resume.href}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2563EB] px-6 py-3.5 text-center text-base font-semibold text-white shadow-md transition-all hover:bg-[#1D4ED8] active:scale-[0.98]"
            >
              {isComplete ? (
                <RotateCcw size={18} />
              ) : (
                <Play size={18} className="fill-current" />
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

          {/* Certification Status */}
          <CertificationCard
            contentType={model.contentType}
            contentId={model.contentId}
            completed={model.progress.state === 'COMPLETED'}
          />
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

