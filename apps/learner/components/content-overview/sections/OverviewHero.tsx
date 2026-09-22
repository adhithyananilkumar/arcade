'use client';

import Link from 'next/link';
import { ArrowLeft, Play, RotateCcw, Trophy } from 'lucide-react';
import type { ContentOverviewModel } from '../contentOverview.types';

/**
 * The top of the hub: what this is, how far in you are, and the one button that matters.
 *
 * <p>Progress is drawn as a ring around the primary action rather than as a bar somewhere else on
 * the page, because those two facts are one thought — "you are 3 of 18 in, here is number 4". The
 * button's own label carries the next item's title, so the learner never has to find it in the
 * syllabus first.
 */
export function OverviewHero({ model }: { model: ContentOverviewModel }) {
  const { progress, resume } = model;
  const isComplete = progress.state === 'COMPLETED';

  return (
    <header className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/70">
      {model.coverImageUrl && (
        <>
          <img
            src={model.coverImageUrl}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-20"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-white/90 via-white/80 to-white/95 dark:from-slate-900/90 dark:via-slate-900/85 dark:to-slate-900/95"
          />
        </>
      )}

      <div className="relative p-6 sm:p-8">
        <Link
          href={model.landingHref}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
        >
          <ArrowLeft size={13} />
          {model.contentType === 'COURSE' ? 'Course page' : 'Event page'}
        </Link>

        <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            {model.channel && (
              <p className="text-[13px] font-semibold text-indigo-600 dark:text-indigo-400">
                {model.channel.href ? (
                  <Link href={model.channel.href} className="hover:underline">
                    {model.channel.name}
                  </Link>
                ) : (
                  model.channel.name
                )}
              </p>
            )}
            <h1 className="mt-1 text-2xl font-bold leading-tight text-slate-900 sm:text-3xl dark:text-white">
              {model.title}
            </h1>
            {model.subtitle && (
              <p className="mt-2 max-w-2xl text-[15px] text-slate-500 dark:text-slate-400">
                {model.subtitle}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-4">
            <ProgressRing progress={progress} />

            {resume && (
              <Link
                href={resume.href}
                className="group flex min-w-0 items-center gap-2.5 rounded-2xl bg-slate-900 px-5 py-3.5 text-white shadow-sm transition hover:bg-slate-800 active:scale-[0.98] dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                {isComplete ? <RotateCcw size={17} /> : <Play size={17} className="fill-current" />}
                <span className="min-w-0 text-left">
                  <span className="block text-[13px] font-semibold leading-tight">
                    {resume.label}
                  </span>
                  {resume.itemTitle && (
                    <span className="block max-w-[15rem] truncate text-[11px] leading-tight opacity-70">
                      {resume.itemTitle}
                    </span>
                  )}
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function ProgressRing({ progress }: { progress: ContentOverviewModel['progress'] }) {
  // An event with no lesson-shaped progress has nothing honest to draw here, so it draws nothing
  // rather than a permanently empty ring that reads as "you have done none of this".
  if (progress.percent === null) return null;

  const RADIUS = 26;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const complete = progress.state === 'COMPLETED';

  return (
    <div className="relative h-[64px] w-[64px] shrink-0" title={`${progress.percent}% complete`}>
      <svg viewBox="0 0 64 64" className="h-full w-full -rotate-90">
        <circle
          cx="32"
          cy="32"
          r={RADIUS}
          fill="none"
          strokeWidth="5"
          className="stroke-slate-200 dark:stroke-slate-700"
        />
        <circle
          cx="32"
          cy="32"
          r={RADIUS}
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress.percent / 100)}
          className={complete ? 'stroke-emerald-500' : 'stroke-indigo-500'}
        />
      </svg>
      <span className="absolute inset-0 flex flex-col items-center justify-center">
        {complete ? (
          <Trophy size={20} className="text-emerald-500" />
        ) : (
          <>
            <span className="text-[15px] font-bold leading-none tabular-nums text-slate-900 dark:text-white">
              {progress.percent}
            </span>
            <span className="text-[9px] font-semibold leading-none text-slate-400">%</span>
          </>
        )}
      </span>
    </div>
  );
}
