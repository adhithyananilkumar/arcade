'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Clock, AlertTriangle, ChevronLeft, ChevronRight, Flag, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/infrastructure/http/api';
import {
  startExamAttempt,
  getExamAttemptQuestions,
  saveExamAnswer,
  submitExamAttempt,
  type AttemptQuestionResponse,
} from '@/domains/assessments';

export default function ExamEnginePage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.examId as string;

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<AttemptQuestionResponse[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());

  // The server is the only authority on remaining time — this is a display-only countdown
  // seeded from the attempt's `secondsRemaining` and decremented locally. Reaching zero triggers
  // a submit, but the server independently rejects/auto-submits anything past its own deadline
  // regardless of what the client's clock says.
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [strikes, setStrikes] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const [isProctored, setIsProctored] = useState(false);
  const [awaitingProctorGate, setAwaitingProctorGate] = useState(false);
  const [startingSession, setStartingSession] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const beginAttempt = useCallback(() => {
    startExamAttempt(examId)
      .then((attempt) => {
        setAttemptId(attempt.id);
        setAwaitingProctorGate(false);
        setTimeLeft(attempt.secondsRemaining);
        return getExamAttemptQuestions(attempt.id);
      })
      .then((withQuestions) => {
        if (!withQuestions) return;
        setQuestions(withQuestions.questions);
        const initialAnswers: Record<string, string[]> = {};
        withQuestions.questions.forEach((q) => {
          if (q.selectedOptionIds.length > 0) initialAnswers[q.id] = q.selectedOptionIds;
        });
        setAnswers(initialAnswers);
      })
      .catch((err) => {
        if (err?.status === 403) {
          setIsProctored(true);
          setAwaitingProctorGate(true);
        } else {
          setLoadError(err?.message ?? 'Failed to start this exam.');
        }
      });
  }, [examId]);

  useEffect(() => {
    beginAttempt();
  }, [beginAttempt]);

  const handleStartProctoring = async () => {
    setStartingSession(true);
    try {
      await api.post(`/api/exams/${examId}/proctoring/session/start`, {});
      await api.post(`/api/exams/${examId}/proctoring/session/verify-identity`, {});
      beginAttempt();
    } catch (err) {
      console.error('Failed to start proctoring session', err);
    } finally {
      setStartingSession(false);
    }
  };

  const reportProctorEvent = (eventType: string, detail: string) => {
    api
      .post(`/api/exams/${examId}/proctoring/session/events`, { eventType, detail })
      .catch(() => {
        // Best-effort — the client-side strike system is the source of truth for the UI.
      });
  };

  useEffect(() => {
    if (sessionStorage.getItem(`exam_terminated_${examId}`)) {
      router.replace(`/learn/exam/${examId}/terminated`);
    }
  }, [examId, router]);

  const handleSubmit = useCallback(async () => {
    if (!attemptId || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      await submitExamAttempt(attemptId);
      if (isProctored) {
        await api.post(`/api/exams/${examId}/proctoring/session/complete`, {}).catch(() => {});
      }
      sessionStorage.setItem(`exam_attempt_${examId}`, attemptId);
      const go = () => router.push(`/learn/exam/${examId}/results?attemptId=${attemptId}`);
      if (document.fullscreenElement) {
        document.exitFullscreen().then(go).catch(go);
      } else {
        go();
      }
    } catch (err) {
      console.error('Failed to submit exam', err);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [attemptId, examId, isProctored, router]);

  useEffect(() => {
    if (strikes >= 3) {
      sessionStorage.setItem(`exam_terminated_${examId}`, 'true');
      if (attemptId) submitExamAttempt(attemptId).catch(() => {});
      router.replace(`/learn/exam/${examId}/terminated`);
    } else if (strikes > 0) {
      setShowWarning(true);
    }
  }, [strikes, attemptId, examId, router]);

  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch {
        // Ignored
      }
    };
    enterFullscreen();

    const handleStrike = (reason: string) => {
      if (isSubmittingRef.current) return;
      console.warn('Anti-Cheat Strike:', reason);
      reportProctorEvent('INTEGRITY_STRIKE', reason);
      setStrikes((prev) => prev + 1);
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) handleStrike('Exited Fullscreen');
    };
    const handleVisibilityChange = () => {
      if (document.hidden) handleStrike('Switched Tabs or Minimized');
    };
    const handleBlur = () => handleStrike('Window Lost Focus');
    const handlePreventDefault = (e: Event) => e.preventDefault();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) ||
        (e.ctrlKey && ['U', 'u', 'C', 'c', 'V', 'v', 'X', 'x', 'A', 'a'].includes(e.key)) ||
        e.altKey
      ) {
        e.preventDefault();
        handleStrike('Prohibited Keyboard Shortcut');
      }
    };

    const handleResize = () => {
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;
      if (widthDiff > 200 || heightDiff > 200) {
        handleStrike('Developer Tools Detected');
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('contextmenu', handlePreventDefault);
    document.addEventListener('selectstart', handlePreventDefault);
    document.addEventListener('dragstart', handlePreventDefault);
    document.addEventListener('copy', handlePreventDefault);
    document.addEventListener('cut', handlePreventDefault);
    document.addEventListener('paste', handlePreventDefault);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('contextmenu', handlePreventDefault);
      document.removeEventListener('selectstart', handlePreventDefault);
      document.removeEventListener('dragstart', handlePreventDefault);
      document.removeEventListener('copy', handlePreventDefault);
      document.removeEventListener('cut', handlePreventDefault);
      document.removeEventListener('paste', handlePreventDefault);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (timeLeft === null) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => (prev === null ? null : prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, handleSubmit]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleReturnToFullscreen = async () => {
    setShowWarning(false);
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen failed', err);
    }
  };

  const handleSelectOption = (optionId: string) => {
    const current = questions[currentIdx];
    if (!current || !attemptId) return;
    const nextSelection = [optionId];
    setAnswers((prev) => ({ ...prev, [current.id]: nextSelection }));
    saveExamAnswer(attemptId, current.id, { selectedOptionIds: nextSelection }).catch(() => {
      console.error('Failed to save answer — it may not be recorded.');
    });
  };

  const toggleReview = () => {
    const current = questions[currentIdx];
    if (!current) return;
    setMarkedForReview((prev) => {
      const next = new Set(prev);
      if (next.has(current.id)) next.delete(current.id);
      else next.add(current.id);
      return next;
    });
  };

  if (awaitingProctorGate) {
    return (
      <div
        className="flex min-h-screen items-center justify-center p-4"
        style={{ background: 'linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 40%, #FFFFFF 100%)' }}
      >
        <div className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-7 text-center shadow-[0_24px_60px_rgba(20,20,43,0.12)]">
          <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-[#14142b]/[0.06]">
            <ShieldCheck className="text-[#14142b]" size={26} />
          </div>
          <h2 className="text-[1.25rem] font-bold tracking-tight text-[#14142b]">
            This is a proctored exam
          </h2>
          <p className="mt-2 text-[13px] font-medium leading-relaxed text-slate-500">
            Stay in fullscreen and don&apos;t switch tabs once you begin — leaving the exam
            environment is logged. Starting confirms you&apos;re the enrolled candidate and ready
            to proceed.
          </p>
          <button
            type="button"
            onClick={handleStartProctoring}
            disabled={startingSession}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#14142b] py-3 text-[13px] font-semibold text-white hover:bg-[#232735] disabled:opacity-60"
          >
            {startingSession ? <Loader2 size={15} className="animate-spin" /> : null}
            Start proctoring session
          </button>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-4 text-center text-[13px] font-medium text-rose-600"
        style={{ background: 'linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 40%, #FFFFFF 100%)' }}
      >
        {loadError}
      </div>
    );
  }

  if (questions.length === 0 || timeLeft === null) {
    return (
      <div
        className="flex min-h-screen items-center justify-center text-[13px] font-medium text-slate-500"
        style={{ background: 'linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 40%, #FFFFFF 100%)' }}
      >
        Loading exam environment…
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const isReviewed = markedForReview.has(currentQ.id);
  const urgent = timeLeft < 300;

  return (
    <div
      className="flex min-h-screen flex-col font-sans selection:bg-[#14142b]/10"
      style={{ background: 'linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 28%, #FFFFFF 70%)' }}
    >
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#14142b]/50 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              className="w-full max-w-md rounded-2xl border border-slate-200/80 bg-white p-7 text-center shadow-[0_24px_60px_rgba(20,20,43,0.22)]"
            >
              <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-rose-50">
                <AlertTriangle className="text-rose-600" size={26} />
              </div>
              <h2 className="text-[1.25rem] font-bold tracking-tight text-[#14142b]">
                Fullscreen exited
              </h2>
              <p className="mt-2 text-[13px] font-medium leading-relaxed text-slate-500">
                Strike {strikes} of 2. A third violation will terminate this exam.
              </p>
              <button
                type="button"
                onClick={handleReturnToFullscreen}
                className="mt-6 w-full rounded-full bg-[#14142b] py-3 text-[13px] font-semibold text-white hover:bg-[#232735]"
              >
                Return to exam
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/80 px-5 backdrop-blur-xl">
        <div>
          <p className="text-[13px] font-bold text-[#14142b]">Exam in progress</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            Secure session
          </p>
        </div>
        <div
          className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[15px] font-bold tabular-nums ${
            urgent ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-[#14142b]'
          }`}
        >
          <Clock size={16} />
          {formatTime(timeLeft)}
        </div>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Question {currentIdx + 1} of {questions.length}
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#14142b]">
                {currentQ.points} pt{currentQ.points === 1 ? '' : 's'}
              </span>
            </div>

            <h2 className="mb-7 text-[1.35rem] font-bold leading-snug tracking-tight text-[#14142b]">
              {extractPromptText(currentQ.prompt)}
            </h2>

            <div className="space-y-2.5">
              {currentQ.options.map((opt) => {
                const selected = (answers[currentQ.id] ?? []).includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectOption(opt.id)}
                    className={`flex w-full items-center rounded-2xl border px-4 py-4 text-left transition-all ${
                      selected
                        ? 'border-[#14142b] bg-[#14142b]/[0.04] shadow-[0_4px_12px_rgba(20,20,43,0.06)]'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span
                      className={`mr-3.5 grid size-5 shrink-0 place-items-center rounded-full border-2 ${
                        selected ? 'border-[#14142b]' : 'border-slate-300'
                      }`}
                    >
                      {selected && <span className="size-2.5 rounded-full bg-[#14142b]" />}
                    </span>
                    <span
                      className={`text-[14px] ${
                        selected ? 'font-semibold text-[#14142b]' : 'font-medium text-slate-600'
                      }`}
                    >
                      {opt.text}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-10 flex items-center justify-between gap-3 border-t border-slate-200/80 pt-6">
              <button
                type="button"
                onClick={toggleReview}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-[12px] font-semibold transition-all ${
                  isReviewed
                    ? 'bg-amber-50 text-amber-800'
                    : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Flag size={14} className={isReviewed ? 'fill-amber-700' : ''} />
                {isReviewed ? 'Marked' : 'Mark for review'}
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                  disabled={currentIdx === 0}
                  className="grid size-10 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={18} />
                </button>

                {currentIdx < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="inline-flex items-center gap-1.5 rounded-full bg-[#14142b] px-5 py-2.5 text-[12px] font-semibold text-white hover:bg-[#232735]"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-5 py-2.5 text-[12px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                    Submit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <aside className="hidden w-72 shrink-0 flex-col border-l border-slate-200/80 bg-white/80 backdrop-blur-xl lg:flex">
          <div className="border-b border-slate-100 p-5">
            <h3 className="mb-3 text-[12px] font-bold uppercase tracking-wider text-slate-400">
              Progress
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                <div className="text-xl font-bold tabular-nums text-[#14142b]">
                  {Object.keys(answers).length}
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Answered
                </div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center">
                <div className="text-xl font-bold tabular-nums text-amber-600">
                  {markedForReview.size}
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Review
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const hasAnswer = (answers[q.id] ?? []).length > 0;
                const isRev = markedForReview.has(q.id);
                const isActive = currentIdx === idx;

                let bgClass = 'border-slate-200 bg-white text-slate-600 hover:border-slate-300';
                if (hasAnswer) bgClass = 'border-[#14142b] bg-[#14142b] text-white';
                if (isRev && !hasAnswer) bgClass = 'border-amber-300 bg-amber-50 text-amber-800';
                if (isRev && hasAnswer) bgClass = 'border-amber-400 bg-amber-500 text-white';

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => setCurrentIdx(idx)}
                    className={`flex h-9 items-center justify-center rounded-lg border text-[12px] font-bold transition-all ${bgClass} ${
                      isActive ? 'ring-2 ring-[#14142b]/30 ring-offset-1' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 p-5">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full rounded-full bg-[#14142b] py-3 text-[13px] font-semibold text-white hover:bg-[#232735] disabled:opacity-60"
            >
              {isSubmitting ? 'Submitting…' : 'Submit exam'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}

/** Question prompts are frozen Tiptap documents; render their plain text for this simple player. */
function extractPromptText(prompt: unknown): string {
  if (typeof prompt === 'string') return prompt;
  if (prompt && typeof prompt === 'object') {
    const node = prompt as { text?: string; content?: unknown[] };
    if (typeof node.text === 'string') return node.text;
    if (Array.isArray(node.content)) {
      return node.content.map(extractPromptText).join(' ').trim();
    }
  }
  return '';
}
