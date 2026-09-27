'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Clock, AlertTriangle, ChevronLeft, ChevronRight, Flag, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  startExamAttempt,
  getExamAttempt,
  getExamAttemptQuestions,
  saveExamAnswer,
  submitExamAttempt,
  recordProctorEvent,
  previewAttemptPaper,
  gradePreviewPaper,
  type AttemptQuestionResponse,
  type AttemptResponse,
  HonorCodeModal,
} from '@/domains/assessments';
import { TiptapContentView } from '@/domains/learning';
import { examRoutes } from '@/shared/routes/content.routes';

/** How long after the last keystroke a written answer is persisted. */
const TEXT_ANSWER_DEBOUNCE_MS = 600;

/** What the plan asks of the sitting. Preview sittings are never monitored. */
interface SittingRules {
  proctored: boolean;
  fullscreen: boolean;
  maxViolations: number;
}

const UNMONITORED: SittingRules = { proctored: false, fullscreen: false, maxViolations: 0 };

export default function ExamEnginePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const examId = params.examId as string;

  const planId = searchParams.get('planId');
  const returnTo = searchParams.get('returnTo');
  const isPreview = searchParams.get('preview') === 'true';

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<AttemptQuestionResponse[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());

  // The server is the only authority on remaining time — this is a display-only countdown
  // seeded from the attempt's `secondsRemaining` and decremented locally. Reaching zero triggers
  // a submit, but the server independently rejects/auto-submits anything past its own deadline
  // regardless of what the client's clock says.
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [rules, setRules] = useState<SittingRules>(UNMONITORED);
  // Violations are counted by the server; this mirrors the count it last reported.
  const [violations, setViolations] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const leaveTo = returnTo ?? examRoutes.landing(examId);

  const adoptAttempt = useCallback((attempt: AttemptResponse) => {
    setAttemptId(attempt.id);
    setTimeLeft(attempt.secondsRemaining);
    setViolations(attempt.violationCount);
    setRules({
      proctored: attempt.proctoringRequired,
      fullscreen: attempt.fullscreenRequired || attempt.proctoringRequired,
      maxViolations: attempt.maxViolations,
    });
  }, []);

  const beginAttempt = useCallback(() => {
    if (isPreview) {
      previewAttemptPaper(examId, planId)
        .then((previewQuestions) => {
          setAttemptId(`preview-${examId}`);
          setTimeLeft(3600); // An author's preview sitting is untimed in practice.
          setQuestions(previewQuestions);
          setAnswers({});
          setTextAnswers({});
        })
        .catch((err) => setLoadError(err?.message ?? 'Failed to start this exam.'));
      return;
    }

    startExamAttempt(examId, planId)
      .then((attempt) => {
        adoptAttempt(attempt);
        return getExamAttemptQuestions(attempt.id);
      })
      .then((withQuestions) => {
        setQuestions(withQuestions.questions);
        const initialAnswers: Record<string, string[]> = {};
        const initialText: Record<string, string> = {};
        withQuestions.questions.forEach((q) => {
          if (q.selectedOptionIds && q.selectedOptionIds.length > 0) initialAnswers[q.id] = q.selectedOptionIds;
          if (q.textAnswer) initialText[q.id] = q.textAnswer;
        });
        setAnswers(initialAnswers);
        setTextAnswers(initialText);
      })
      // The start path re-checks everything the landing page showed (registration, prerequisite,
      // window, identity, attempts). If any of it no longer holds, say so and send them back.
      .catch((err) => setLoadError(err?.message ?? 'Failed to start this exam.'));
  }, [examId, planId, isPreview, adoptAttempt]);

  const [honorCodeAccepted, setHonorCodeAccepted] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('arcade_honor_code_accepted') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    if (!honorCodeAccepted) return;
    beginAttempt();
  }, [beginAttempt, honorCodeAccepted]);

  // The countdown is decremented locally, so a backgrounded tab drifts (browsers throttle timers
  // in hidden tabs). Re-read the server's own `secondsRemaining` whenever the tab comes back —
  // the server remains the only authority on the deadline either way.
  useEffect(() => {
    if (!attemptId || isPreview) return;
    const resync = () => {
      if (document.visibilityState !== 'visible') return;
      getExamAttempt(attemptId)
        .then((attempt) => {
          if (attempt.status !== 'IN_PROGRESS') {
            router.replace(examRoutes.results(examId, attempt.id));
            return;
          }
          setTimeLeft(attempt.secondsRemaining);
          setViolations(attempt.violationCount);
        })
        .catch(() => {
          // Transient failure — keep counting down locally; the server still enforces expiry.
        });
    };
    document.addEventListener('visibilitychange', resync);
    return () => document.removeEventListener('visibilitychange', resync);
  }, [attemptId, isPreview, examId, router]);

  const exitFullscreenThen = (go: () => void) => {
    if (document.fullscreenElement) {
      document.exitFullscreen().then(go).catch(go);
    } else {
      go();
    }
  };

  const handleSubmit = useCallback(async () => {
    if (!attemptId || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    const back = returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : '';
    try {
      if (isPreview) {
        const payloadAnswers: Record<string, { selectedOptionIds?: string[]; textAnswer?: string | null }> = {};
        questions.forEach((q) => {
          payloadAnswers[q.id] = {
            selectedOptionIds: answers[q.id] || [],
            textAnswer: textAnswers[q.id] || null,
          };
        });
        // The whole paper goes with the answers, so skipped questions still count towards the total.
        const result = await gradePreviewPaper(examId, {
          planId,
          questions: questions.map((q) => ({ questionId: q.id, points: q.points })),
          answers: payloadAnswers,
        });
        sessionStorage.setItem(`preview_result_${examId}`, JSON.stringify(result));
        exitFullscreenThen(() =>
          router.push(`/exams/${examId}/results?preview=true&attemptId=${attemptId}${back}`)
        );
        return;
      }

      await submitExamAttempt(attemptId);
      exitFullscreenThen(() => router.push(`${examRoutes.results(examId, attemptId)}${back}`));
    } catch (err) {
      console.error('Failed to submit exam', err);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [attemptId, examId, returnTo, router, isPreview, planId, questions, answers, textAnswers]);

  // Integrity monitoring. Only switched on when the plan asks for it, and only ever reports: the
  // server counts violations and ends the attempt at the plan's limit.
  useEffect(() => {
    if (!attemptId || isPreview || (!rules.fullscreen && !rules.proctored)) return;

    const enterFullscreen = async () => {
      try {
        if (rules.fullscreen && document.documentElement.requestFullscreen && !document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch {
        // The browser may refuse without a user gesture; the warning dialog offers a button.
      }
    };
    void enterFullscreen();

    let lastReport = 0;
    const report = (eventType: string, detail: string) => {
      if (isSubmittingRef.current) return;
      // blur and visibilitychange usually fire together for one tab switch; count it once.
      const now = Date.now();
      if (now - lastReport < 1500) return;
      lastReport = now;
      setShowWarning(true);
      if (!rules.proctored) return;
      recordProctorEvent(attemptId, eventType, detail)
        .then((attempt) => {
          setViolations(attempt.violationCount);
          if (attempt.status !== 'IN_PROGRESS') {
            isSubmittingRef.current = true;
            exitFullscreenThen(() => router.replace(examRoutes.terminated(examId)));
          }
        })
        .catch(() => {
          // Best-effort: a lost report must never interrupt the candidate's sitting.
        });
    };

    const onFullscreenChange = () => {
      if (rules.fullscreen && !document.fullscreenElement) report('FULLSCREEN_EXIT', 'Exited fullscreen');
    };
    const onVisibility = () => {
      if (document.hidden) report('TAB_HIDDEN', 'Switched tabs or minimised');
    };
    const onBlur = () => report('WINDOW_BLUR', 'Window lost focus');
    const onClipboard = (e: Event) => {
      e.preventDefault();
      report('COPY_PASTE', `Blocked ${e.type}`);
    };
    const onPreventDefault = (e: Event) => e.preventDefault();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key))) {
        e.preventDefault();
        report('DEVTOOLS_OPEN', 'Developer tools shortcut');
      }
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('copy', onClipboard);
    document.addEventListener('cut', onClipboard);
    document.addEventListener('paste', onClipboard);
    document.addEventListener('contextmenu', onPreventDefault);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('copy', onClipboard);
      document.removeEventListener('cut', onClipboard);
      document.removeEventListener('paste', onClipboard);
      document.removeEventListener('contextmenu', onPreventDefault);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
    // exitFullscreenThen is a stable helper in behaviour; re-subscribing on its identity is pointless.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId, isPreview, rules, examId, router]);

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
    if (!rules.fullscreen) return;
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen failed', err);
    }
  };

  /**
   * MULTIPLE accumulates a selection set; SINGLE and TRUE_FALSE replace it. The server applies the
   * same rule authoritatively (`normalizeSelectedOptions` rejects more than one option for the
   * single-answer types and drops ids that aren't on the frozen paper), so this only keeps the UI
   * honest — it is not the enforcement point.
   */
  const handleSelectOption = (optionId: string) => {
    const current = questions[currentIdx];
    if (!current || !attemptId) return;

    const existing = answers[current.id] ?? [];
    const nextSelection =
      current.type === 'MULTIPLE'
        ? existing.includes(optionId)
          ? existing.filter((id) => id !== optionId)
          : [...existing, optionId]
        : [optionId];

    setAnswers((prev) => ({ ...prev, [current.id]: nextSelection }));
    if (!isPreview) {
      saveExamAnswer(attemptId, current.id, { selectedOptionIds: nextSelection }).catch(() => {
        console.error('Failed to save answer — it may not be recorded.');
      });
    }
  };

  // One timer per question id, so typing in one written answer never cancels another's pending save.
  const textSaveTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    const timers = textSaveTimers.current;
    return () => Object.values(timers).forEach(clearTimeout);
  }, []);

  const handleTextAnswer = (value: string) => {
    const current = questions[currentIdx];
    if (!current || !attemptId) return;
    const questionId = current.id;
    setTextAnswers((prev) => ({ ...prev, [questionId]: value }));

    if (isPreview) return;

    clearTimeout(textSaveTimers.current[questionId]);
    textSaveTimers.current[questionId] = setTimeout(() => {
      saveExamAnswer(attemptId, questionId, {
        selectedOptionIds: [],
        textAnswer: value,
      }).catch(() => {
        console.error('Failed to save answer — it may not be recorded.');
      });
    }, TEXT_ANSWER_DEBOUNCE_MS);
  };

  /** A question counts as answered when it has a selection or non-blank written text. */
  const isAnswered = (question: AttemptQuestionResponse) =>
    question.type === 'SENTENCE'
      ? (textAnswers[question.id] ?? '').trim().length > 0
      : (answers[question.id] ?? []).length > 0;

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

  if (!honorCodeAccepted) {
    return (
      <div
        className="flex min-h-screen items-center justify-center text-[13px] font-medium text-slate-500"
        style={{ background: 'linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 40%, #FFFFFF 100%)' }}
      >
        <HonorCodeModal
          isOpen={true}
          onClose={() => router.push(leaveTo)}
          onContinue={() => {
            try {
              sessionStorage.setItem('arcade_honor_code_accepted', 'true');
            } catch {}
            setHonorCodeAccepted(true);
          }}
        />
      </div>
    );
  }

  if (loadError) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center"
        style={{ background: 'linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 40%, #FFFFFF 100%)' }}
      >
        <p className="max-w-md text-[14px] font-semibold text-rose-600">{loadError}</p>
        <button
          type="button"
          onClick={() => router.push(leaveTo)}
          className="cursor-pointer rounded-full bg-[#14142b] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#232735]"
        >
          Go back
        </button>
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
                You left the exam
              </h2>
              <p className="mt-2 text-[13px] font-medium leading-relaxed text-slate-500">
                {rules.proctored && rules.maxViolations > 0
                  ? `This was recorded (${violations} of ${rules.maxViolations}). Reaching the limit ends your attempt.`
                  : rules.proctored
                  ? 'This was recorded and will be visible to the exam administrator.'
                  : 'Stay in the exam window until you submit.'}
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
            {isPreview ? 'Preview — nothing is saved' : rules.proctored ? 'Proctored session' : 'In progress'}
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

            {/* The prompt is a frozen Tiptap document — rendered, not flattened, so images,
                formatting, code blocks and equations survive into the exam. */}
            <div className="mb-7 text-[1.05rem] leading-relaxed text-[#14142b]">
              <TiptapContentView body={promptBody(currentQ.prompt)} emptyMessage="" />
            </div>

            {currentQ.type === 'MULTIPLE' && (
              <p className="mb-3 text-[12px] font-semibold text-slate-500">
                Select all that apply.
              </p>
            )}

            {currentQ.type === 'SENTENCE' ? (
              <div>
                <textarea
                  value={textAnswers[currentQ.id] ?? ''}
                  onChange={(e) => handleTextAnswer(e.target.value)}
                  rows={8}
                  placeholder="Write your answer here…"
                  className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[14px] font-medium leading-relaxed text-[#14142b] outline-none transition-colors placeholder:text-slate-400 focus:border-[#14142b]"
                />
                <p className="mt-2 text-[11px] font-medium text-slate-400">
                  Saved automatically as you type.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {currentQ.options.map((opt) => {
                  const selected = (answers[currentQ.id] ?? []).includes(opt.id);
                  const multi = currentQ.type === 'MULTIPLE';
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(opt.id)}
                      aria-pressed={selected}
                      className={`flex w-full items-center rounded-2xl border px-4 py-4 text-left transition-all ${
                        selected
                          ? 'border-[#14142b] bg-[#14142b]/[0.04] shadow-[0_4px_12px_rgba(20,20,43,0.06)]'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {/* Square for multi-select, circle for single — the shape is the only cue a
                          candidate gets that more than one answer is allowed. */}
                      <span
                        className={`mr-3.5 grid size-5 shrink-0 place-items-center border-2 ${
                          multi ? 'rounded-[6px]' : 'rounded-full'
                        } ${selected ? 'border-[#14142b]' : 'border-slate-300'}`}
                      >
                        {selected &&
                          (multi ? (
                            <CheckCircle2 size={13} className="text-[#14142b]" strokeWidth={3} />
                          ) : (
                            <span className="size-2.5 rounded-full bg-[#14142b]" />
                          ))}
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
            )}

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
                  {questions.filter(isAnswered).length}
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
                const hasAnswer = isAnswered(q);
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

/**
 * Frozen prompts arrive as a Tiptap document object; TiptapContentView takes the serialized form.
 * A prompt that is already a string is passed through rather than double-encoded.
 */
function promptBody(prompt: unknown): string | null {
  if (prompt == null) return null;
  if (typeof prompt === 'string') return prompt;
  return JSON.stringify(prompt);
}
