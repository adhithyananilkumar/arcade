'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ShieldAlert, ChevronLeft } from 'lucide-react';
import { examRoutes } from '@/shared/routes/content.routes';

export default function ExamTerminatedPage() {
  const params = useParams();
  const examId = params.examId as string;
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'var(--theme-wash, linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 40%, #FFFFFF 100%))' }}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-rose-200/80 bg-surface text-center shadow-[0_20px_50px_rgba(20,20,43,0.12)] dark:border-rose-500/25">
        <div className="border-b border-rose-100 bg-rose-50 px-8 py-8 dark:border-rose-500/25 dark:bg-rose-500/10">
          <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-surface text-rose-600 shadow-sm dark:text-rose-400">
            <ShieldAlert size={28} />
          </div>
          <h1 className="mt-5 text-[1.5rem] font-bold tracking-tight text-ink">
            Attempt ended
          </h1>
          <p className="mt-2 text-[13px] font-semibold text-rose-700 dark:text-rose-300">
            This attempt reached the proctoring violation limit.
          </p>
        </div>

        <div className="px-8 py-7">
          <p className="text-[13px] font-medium leading-relaxed text-slate-500">
            Leaving the exam window was recorded each time. Your answers were submitted, but an attempt
            ended this way cannot pass. If you have attempts left you can sit the exam again.
          </p>

          <Link
            href={examRoutes.landing(examId)}
            className="mt-7 inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-on-ink hover:bg-ink-hover"
          >
            <ChevronLeft size={16} />
            Back to exam
          </Link>
        </div>
      </div>
    </div>
  );
}
