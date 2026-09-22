'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Trophy, Award, Loader2, ChevronLeft } from 'lucide-react';
import { getExamResult, type ExamResultResponse } from '@/domains/assessments';

const pageBg = {
  background: 'linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 32%, #FFFFFF 70%)',
};

export default function ExamResultsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const examId = params.examId as string;

  const [result, setResult] = useState<ExamResultResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const attemptId = searchParams.get('attemptId') ?? sessionStorage.getItem(`exam_attempt_${examId}`);
    if (!attemptId) {
      router.push(`/exam`);
      return;
    }
    getExamResult(attemptId)
      .then(setResult)
      .catch(() => setError('We could not load your result. Try again from Today\'s exams.'));
  }, [examId, router, searchParams]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center" style={pageBg}>
        <p className="text-[13px] font-medium text-rose-600">{error}</p>
        <Link href="/exams" className="text-[13px] font-semibold text-[#14142b] underline">
          Back to exams
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

  const isPassed = result.passed;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pb-28 pt-28" style={pageBg}>
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 text-center shadow-[0_12px_40px_rgba(20,20,43,0.08)]">
        <div className={`px-8 py-8 ${isPassed ? 'bg-emerald-50' : 'bg-slate-50'}`}>
          <div
            className={`mx-auto grid size-16 place-items-center rounded-2xl ${
              isPassed ? 'bg-white text-amber-500 shadow-sm' : 'bg-white text-slate-400 shadow-sm'
            }`}
          >
            {isPassed ? <Trophy size={28} /> : <Award size={28} />}
          </div>
          <h1 className="mt-5 text-[1.5rem] font-bold tracking-tight text-[#14142b]">
            {isPassed ? 'Congratulations' : 'Exam completed'}
          </h1>
          <p className="mx-auto mt-2 max-w-sm text-[13px] font-medium leading-relaxed text-slate-500">
            {isPassed
              ? 'You passed this exam.'
              : `You did not meet the passing score of ${result.passPercentage}%. Review the material and try again when available.`}
          </p>
        </div>

        <div className="px-8 py-8">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Final score</p>
          <p className="mt-2 text-5xl font-bold tabular-nums tracking-tight text-[#14142b]">
            {result.marksObtained}
            <span className="text-2xl font-semibold text-slate-300"> / {result.maximumMarks}</span>
          </p>
          <span className="mt-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-[12px] font-bold text-[#14142b]">
            {result.percentage.toFixed(0)}%
          </span>

          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
              <div className="text-lg font-bold tabular-nums text-emerald-600">{result.correctAnswers}</div>
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
              href="/exams"
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#14142b] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#232735]"
            >
              <ChevronLeft size={16} />
              Today&apos;s exams
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
