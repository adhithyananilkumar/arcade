'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight,
  AlertTriangle,
  ShieldCheck,
  Monitor,
  Eye,
  Clock,
  ListOrdered,
} from 'lucide-react';

const pageBg = {
  background: 'linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 32%, #FFFFFF 70%)',
};

const RULES = [
  {
    icon: Monitor,
    title: 'Fullscreen required',
    body: 'The exam runs in fullscreen. Starting will enter fullscreen mode automatically.',
  },
  {
    icon: Eye,
    title: 'Anti-cheat monitoring',
    body: 'Window focus and fullscreen are monitored. Leaving fullscreen registers a strike.',
  },
  {
    icon: AlertTriangle,
    title: 'Three strikes',
    body: 'Two warnings are allowed. A third violation terminates the exam and marks it failed.',
  },
  {
    icon: Clock,
    title: '60 minutes · 25 questions',
    body: 'The timer starts when you begin. Progress auto-submits if time runs out.',
  },
  {
    icon: ListOrdered,
    title: 'Navigation',
    body: 'Mark questions for review and jump via the progress panel. Answer everything before submit.',
  },
];

export default function ExamAcknowledgementPage() {
  const router = useRouter();
  const params = useParams();
  const [agreed, setAgreed] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(`exam_terminated_${params.examId}`)) {
      setIsTerminated(true);
    }
  }, [params.examId]);

  const canStart = agreed && !isTerminated;

  const handleStartExam = async () => {
    try {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn('Failed to enter fullscreen', err);
    }
    router.push(`/learn/exam/${params.examId}/start`);
  };

  return (
    <div className="min-h-screen pb-28" style={pageBg}>
      <div className="mx-auto max-w-3xl px-4 pt-28 sm:px-6 md:pt-32">
        <div className="mb-8 text-center">
          <span className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#14142b]">
            <ShieldCheck size={13} />
            Secure exam
          </span>
          <h1 className="text-[1.75rem] font-bold tracking-tight text-[#14142b] sm:text-[2rem]">
            Before you begin
          </h1>
          <p className="mx-auto mt-2 max-w-lg text-[13px] font-medium text-slate-500">
            Read the conditions carefully. Starting locks you into a monitored fullscreen session.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_8px_28px_rgba(20,20,43,0.06)]">
          <div className="divide-y divide-slate-100">
            {RULES.map((rule) => {
              const Icon = rule.icon;
              return (
                <div key={rule.title} className="flex gap-4 px-5 py-4 sm:px-6">
                  <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl bg-slate-50 text-[#14142b]">
                    <Icon size={16} />
                  </span>
                  <div>
                    <h2 className="text-[13px] font-bold text-[#14142b]">{rule.title}</h2>
                    <p className="mt-0.5 text-[12px] leading-relaxed text-slate-500">{rule.body}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {isTerminated && (
            <div className="mx-5 mb-4 flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 sm:mx-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-2.5 text-rose-700">
                <AlertTriangle size={18} className="mt-0.5 shrink-0" />
                <span className="text-[12px] font-medium leading-relaxed">
                  You cannot take this exam — a previous session was terminated for anti-cheat
                  violations.
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  sessionStorage.removeItem(`exam_terminated_${params.examId}`);
                  setIsTerminated(false);
                }}
                className="shrink-0 rounded-full bg-rose-100 px-3 py-1.5 text-[11px] font-bold text-rose-800 hover:bg-rose-200"
              >
                Reset (dev)
              </button>
            </div>
          )}

          <div className="flex flex-col gap-4 border-t border-slate-100 bg-slate-50/80 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-0.5 size-4 rounded border-slate-300 text-[#14142b] focus:ring-[#14142b]/30"
              />
              <span className="max-w-md text-[12px] font-medium leading-relaxed text-slate-600">
                I have read and agree to these conditions. I understand that violations may terminate
                the exam.
              </span>
            </label>

            <button
              type="button"
              disabled={!canStart}
              onClick={handleStartExam}
              className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-6 py-2.5 text-[13px] font-semibold transition-all ${
                canStart
                  ? 'bg-[#14142b] text-white shadow-[0_8px_16px_rgba(20,20,43,0.16)] hover:bg-[#232735]'
                  : 'cursor-not-allowed bg-slate-200 text-slate-400'
              }`}
            >
              Start exam <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/exam"
            className="text-[12px] font-semibold text-slate-400 transition-colors hover:text-[#14142b]"
          >
            ← Back to today&apos;s exams
          </Link>
        </div>
      </div>
    </div>
  );
}
