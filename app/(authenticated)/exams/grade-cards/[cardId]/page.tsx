'use client';

// Grade cards are not published yet: results are released after each sitting is processed. Until
// then this route only says so, rather than showing marks.

import Link from 'next/link';
import { ArrowLeft, Hourglass } from 'lucide-react';
import { examRoutes } from '@/shared/routes/content.routes';

export default function GradeCardPage() {
  return (
    <main className="min-h-screen bg-surface text-ink theme-page-bg theme-wallpaper-frost">
      <div className="arcade-wash flex min-h-screen w-full items-center justify-center px-4 pb-28 pt-28">
        <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-surface/95 px-8 py-9 text-center shadow-[0_12px_40px_rgba(20,20,43,0.08)]">
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
            <Hourglass size={28} />
          </div>
          <h1 className="mt-5 text-[1.5rem] font-bold tracking-tight text-ink">Results not published yet</h1>
          <p className="mx-auto mt-2 max-w-sm text-[13px] font-medium leading-relaxed text-slate-500">
            Your grade card is released once your paper has been processed. You will be notified when it is ready.
          </p>
          <Link
            href={examRoutes.mine}
            className="mt-7 inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-5 py-3 text-[13px] font-semibold text-on-ink hover:bg-ink-hover"
          >
            <ArrowLeft size={15} />
            My exams
          </Link>
        </div>
      </div>
    </main>
  );
}
