'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Trophy, Award, Loader2, ChevronLeft, Hourglass, FileText, CheckCircle2, ArrowRight } from 'lucide-react';
import { examRoutes } from '@/shared/routes/content.routes';
import { getExamResult, getMyGradeCards, type ExamResultResponse } from '@/domains/assessments';

const pageBg = {
  background: 'var(--theme-wash, linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 32%, #FFFFFF 70%))',
};

export default function ExamResultsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const examId = params.examId as string;

  const [result, setResult] = useState<ExamResultResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isPreview = searchParams.get('preview') === 'true';
  // The sitting's grade card — where the marks are read. Issued in the same transaction as a final
  // result, so it exists as soon as the result does (a paper awaiting marking has none yet).
  const [gradeCardId, setGradeCardId] = useState<string | null>(null);

  useEffect(() => {
    if (isPreview) {
      const mockStr = sessionStorage.getItem(`preview_result_${examId}`);
      if (mockStr) {
        try {
          setResult(JSON.parse(mockStr));
          return;
        } catch (e) {
          setError('We could not load your preview result.');
          return;
        }
      }
    }

    const attemptId = searchParams.get('attemptId');
    if (!attemptId) {
      router.push(examRoutes.landing(examId));
      return;
    }
    getExamResult(attemptId)
      .then((r) => {
        setResult(r);
        if (r.status !== 'PENDING_REVIEW') {
          getMyGradeCards()
            .then((cards) => setGradeCardId(cards.find((c) => c.attemptId === attemptId)?.id ?? null))
            .catch(() => undefined);
        }
      })
      .catch(() => setError('We could not load your result.'));
  }, [examId, isPreview, router, searchParams]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center" style={pageBg}>
        <p className="text-[13px] font-medium text-rose-600 dark:text-rose-400">{error}</p>
        <Link href={examRoutes.mine} className="text-[13px] font-semibold text-ink underline">
          Back to my exams
        </Link>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 text-[13px] text-slate-400" style={pageBg}>
        <Loader2 size={16} className="animate-spin" /> Loading your result…
      </div>
    );
  }

  const awaiting = result.status === 'PENDING_REVIEW';
  const isPassed = result.graded && result.passed && !awaiting;
  // Back to wherever the sitting was started — the course it sits in, or the exam's own page.
  const back = searchParams.get('returnTo') ?? examRoutes.landing(examId);
  const backLabel = back.startsWith('/courses') ? 'Back to course' : back.startsWith('/events') ? 'Back to event' : 'Back to exam';

  if (!isPreview) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 pb-28 pt-28" style={pageBg}>
        <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200/80 bg-surface/95 text-center shadow-[0_12px_40px_rgba(20,20,43,0.08)]">
          <div className="px-8 py-9">
            <div
              className={`mx-auto grid size-16 place-items-center rounded-2xl ${
                awaiting ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
              }`}
            >
              {awaiting ? <Hourglass size={28} /> : <CheckCircle2 size={28} />}
            </div>
            <h1 className="mt-5 text-[1.5rem] font-bold tracking-tight text-ink">
              {awaiting ? 'Submitted for marking' : 'Submission received'}
            </h1>
            <p className="mx-auto mt-2 max-w-sm text-[13px] font-medium leading-relaxed text-slate-500">
              {awaiting
                ? 'Some answers are written and need marking. Your grade card is issued, and you are notified, once they are marked.'
                : 'Your grade card has been issued. Open it for your marks, section by section.'}
            </p>

            <div className="mt-7 flex flex-col gap-2">
              {!awaiting && (
                <Link
                  href={gradeCardId ? examRoutes.gradeCard(gradeCardId) : examRoutes.mine}
                  className="inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-5 py-3 text-[13px] font-semibold text-on-ink hover:bg-ink-hover"
                >
                  <Award size={15} />
                  View grade card
                  <ArrowRight size={15} />
                </Link>
              )}
              <Link
                href={back}
                className="inline-flex items-center justify-center gap-1.5 rounded-full border border-slate-200 bg-surface px-5 py-3 text-[13px] font-semibold text-slate-700 hover:bg-slate-50"
              >
                <ChevronLeft size={16} />
                {backLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Preview (a reviewer's dry run): no grade card exists, so the score is shown here.
  return (
    <div className="flex min-h-screen items-center justify-center px-4 pb-28 pt-28" style={pageBg}>
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/80 bg-surface/95 text-center shadow-[0_12px_40px_rgba(20,20,43,0.08)]">
        <div className={`px-8 py-8 ${isPassed ? 'bg-emerald-50 dark:bg-emerald-500/10' : 'bg-slate-50'}`}>
          <div
            className={`mx-auto grid size-16 place-items-center rounded-2xl ${
              isPassed ? 'bg-surface text-amber-500 shadow-sm' : 'bg-surface text-slate-400 shadow-sm'
            }`}
          >
            {awaiting ? <Hourglass size={28} /> : isPassed ? <Trophy size={28} /> : result.graded ? <Award size={28} /> : <FileText size={28} />}
          </div>
          <h1 className="mt-5 text-[1.5rem] font-bold tracking-tight text-ink">
            {awaiting ? 'Submitted' : isPassed ? 'Congratulations' : 'Exam completed'}
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-[13px] font-medium leading-relaxed text-slate-500">
            {awaiting
              ? 'Some answers are written and need marking. Your result appears here, and you are notified, once they are marked.'
              : !result.graded
              ? 'This practice assessment is not graded. Your score is for your own reference.'
              : isPassed
              ? 'You passed this exam.'
              : `You did not meet the passing score of ${result.passPercentage}%. Review the material and try again when available.`}
          </p>
        </div>

        <div className="px-8 py-8">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {awaiting ? 'Provisional score (before marking)' : 'Final score'}
          </p>
          <p className="mt-2 text-5xl font-bold tabular-nums tracking-tight text-ink">
            {result.marksObtained}
            <span className="text-2xl font-semibold text-slate-300"> / {result.maximumMarks}</span>
          </p>
          <span className="mt-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-[12px] font-bold text-ink">
            {result.percentage.toFixed(0)}%
          </span>

          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">{result.correctAnswers}</div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Correct</div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="text-lg font-bold tabular-nums text-rose-500">{result.wrongAnswers}</div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Wrong</div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="text-lg font-bold tabular-nums text-slate-400">{result.unanswered}</div>
              <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Skipped</div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href={back}
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-on-ink hover:bg-ink-hover"
            >
              <ChevronLeft size={16} />
              {backLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
