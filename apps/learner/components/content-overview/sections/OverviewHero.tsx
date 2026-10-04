'use client';

import { Dancing_Script } from 'next/font/google';
import type { ContentOverviewModel } from '../contentOverview.types';

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['600', '700'],
});

export function OverviewHero({ model }: { model: ContentOverviewModel }) {
  const defaultSubtitle =
    'Build intuitive, beautiful user interfaces and improve user experience with practical design techniques.';

  return (
    <header className="relative pt-2 pb-4 text-center">
      {/* Main Centered Content */}
      <div className="mx-auto max-w-3xl space-y-3">
        {/* Title in Cursive Script Font */}
        <div className="relative inline-block px-4">
          <h1 className={`${dancingScript.className} text-4xl sm:text-5xl md:text-6xl font-bold tracking-normal text-slate-900 dark:text-white leading-tight`}>
            {model.title}
          </h1>

          {/* Hand-drawn blue underline flourish */}
          <div className="flex justify-center mt-1">
            <svg
              className="h-3 w-48 sm:w-60 text-blue-300 dark:text-blue-400 opacity-90"
              viewBox="0 0 200 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 8C45 3.5 155 9.5 197 5"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Subtitle */}
        <p className="mx-auto max-w-2xl pt-2 text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300 font-normal">
          {model.subtitle || model.description || defaultSubtitle}
        </p>
      </div>
    </header>
  );
}
