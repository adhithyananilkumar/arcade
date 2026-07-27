'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Trophy, Award, ChevronLeft } from 'lucide-react';

const pageBg = {
  background: 'linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 32%, #FFFFFF 70%)',
};

export default function ExamResultsPage() {
  const router = useRouter();
  const params = useParams();

  const [score, setScore] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);

  useEffect(() => {
    const s = sessionStorage.getItem('examScore');
    const t = sessionStorage.getItem('examTotal');
    if (s && t) {
      setScore(parseInt(s, 10));
      setTotal(parseInt(t, 10));
    } else {
      router.push(`/learn/${params.courseId}`);
    }
  }, [router, params.courseId]);

  if (score === null || total === null) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[13px] text-slate-400" style={pageBg}>
        Loading…
      </div>
    );
  }

  const percentage = (score / total) * 100;
  const isPassed = percentage >= 60;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pb-28 pt-28" style={pageBg}>
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 text-center shadow-[0_12px_40px_rgba(20,20,43,0.08)]">
        <div
          className={`px-8 py-8 ${
            isPassed ? 'bg-emerald-50' : 'bg-slate-50'
          }`}
        >
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
              ? 'You passed the final assessment.'
              : 'You did not meet the passing score. Review the material and try again when available.'}
          </p>
        </div>

        <div className="px-8 py-8">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Final score</p>
          <p className="mt-2 text-5xl font-bold tabular-nums tracking-tight text-[#14142b]">
            {score}
            <span className="text-2xl font-semibold text-slate-300"> / {total}</span>
          </p>
          <span className="mt-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1 text-[12px] font-bold text-[#14142b]">
            {percentage.toFixed(0)}%
          </span>

          <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link
              href="/exam"
              className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#14142b] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#232735]"
            >
              <ChevronLeft size={16} />
              Today&apos;s exams
            </Link>
            <Link
              href={`/learn/${params.courseId}`}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-[13px] font-semibold text-slate-600 hover:border-slate-300"
            >
              Back to course
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
