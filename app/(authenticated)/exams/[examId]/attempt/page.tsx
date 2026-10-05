'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { 
  Clock, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  CheckCircle2, 
  Loader2,
  Copy,
  Check,
  X,
  ShieldAlert,
  ShieldCheck,
  User,
  Info,
  Sparkles,
  AlertCircle,
  Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { getAvatarUrl } from '@/shared/utils/avatar';
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
  const { user } = useAuthStore();

  const planId = searchParams.get('planId');
  const returnTo = searchParams.get('returnTo');
  const isPreview = searchParams.get('preview') === 'true';

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<AttemptQuestionResponse[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [textAnswers, setTextAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set());

  // Modals State
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [confirmSubmitOpen, setConfirmSubmitOpen] = useState(false);
  const [copiedAttemptId, setCopiedAttemptId] = useState(false);

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

  const executeFinalSubmit = useCallback(async () => {
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
      toast.error('Failed to submit exam. Please try again.');
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
      executeFinalSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft((prev) => (prev === null ? null : prev - 1)), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, executeFinalSubmit]);

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

  const handleCopyAttemptId = () => {
    if (!attemptId) return;
    navigator.clipboard.writeText(attemptId);
    setCopiedAttemptId(true);
    toast.success('Exam attempt ID copied to clipboard');
    setTimeout(() => setCopiedAttemptId(false), 2000);
  };

  if (!honorCodeAccepted) {
    return (
      <div
        className="flex min-h-screen items-center justify-center text-[13px] font-medium text-slate-500"
        style={{ background: 'var(--theme-wash, linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 40%, #FFFFFF 100%))' }}
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
        style={{ background: 'var(--theme-wash, linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 40%, #FFFFFF 100%))' }}
      >
        <p className="max-w-md text-[14px] font-semibold text-rose-600 dark:text-rose-400">{loadError}</p>
        <button
          type="button"
          onClick={() => router.push(leaveTo)}
          className="cursor-pointer rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-on-ink hover:bg-ink-hover"
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
        style={{ background: 'var(--theme-wash, linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 40%, #FFFFFF 100%))' }}
      >
        <div className="flex items-center gap-3 rounded-2xl bg-surface px-6 py-4 shadow-sm border border-slate-200/80">
          <Loader2 size={18} className="animate-spin text-indigo-600 dark:text-indigo-400" />
          <span>Loading exam environment…</span>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];
  const isReviewed = markedForReview.has(currentQ.id);
  const urgent = timeLeft < 300;
  const answeredCount = questions.filter(isAnswered).length;
  const unansweredCount = questions.length - answeredCount;
  const candidateName = user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username || 'Candidate';
  const shortAttemptId = attemptId ? attemptId.slice(0, 8) : '--------';

  return (
    <div
      className="relative flex min-h-screen flex-col font-sans selection:bg-ink/10 theme-page-bg theme-wallpaper-frost"
      style={{ background: 'var(--theme-wash, linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 28%, #FFFFFF 70%))' }}
    >
      {/* Proctoring Warning Modal */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-surface p-7 text-center shadow-[0_24px_60px_rgba(20,20,43,0.22)]"
            >
              <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl bg-rose-50 border border-rose-100 dark:bg-rose-500/10 dark:border-rose-500/25">
                <AlertTriangle className="text-rose-600 dark:text-rose-400" size={26} />
              </div>
              <h2 className="text-[1.25rem] font-bold tracking-tight text-ink">
                You left the exam window
              </h2>
              <p className="mt-2 text-[13px] font-medium leading-relaxed text-slate-500">
                {rules.proctored && rules.maxViolations > 0
                  ? `This was recorded (${violations} of ${rules.maxViolations} violations). Reaching the limit will automatically terminate your sitting.`
                  : rules.proctored
                  ? 'This activity was logged and will be reviewed by the exam proctor.'
                  : 'Please stay in the exam window until you finish and submit your answers.'}
              </p>
              <button
                type="button"
                onClick={handleReturnToFullscreen}
                className="mt-6 w-full rounded-full bg-ink py-3 text-[13px] font-semibold text-on-ink hover:bg-ink-hover transition-colors shadow-sm"
              >
                Return to exam
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Candidate Profile & Exam Details Modal */}
      <AnimatePresence>
        {candidateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setCandidateModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-950/5 bg-surface p-6 sm:p-7 shadow-[0_24px_60px_rgba(20,20,43,0.18)] z-10"
            >
              {/* Header with Close */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="flex size-7 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                    <User size={15} />
                  </div>
                  <h3 className="text-[15px] font-bold text-ink">Candidate Profile</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setCandidateModalOpen(false)}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Candidate Bio Header */}
              <div className="mt-5 flex items-center gap-4 rounded-2xl bg-slate-50/80 p-4 border border-slate-100">
                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-surface shadow-xs bg-surface">
                  {user?.avatarUrl ? (
                    <img
                      src={getAvatarUrl(user.avatarUrl)}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-indigo-50 text-base font-black text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                      {candidateName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-base font-bold text-ink">{candidateName}</h4>
                  <p className="truncate text-xs text-slate-500 font-medium">{user?.email || 'Registered Candidate'}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/25">
                      <ShieldCheck size={11} /> Verified Sitting
                    </span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="mt-4 space-y-3">
                {/* Attempt ID */}
                <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-surface p-3.5 shadow-xs">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Exam Attempt ID</p>
                    <p className="mt-0.5 font-mono text-[13px] font-bold text-ink">{attemptId || 'N/A'}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyAttemptId}
                    className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    {copiedAttemptId ? <Check size={13} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={13} />}
                    <span>{copiedAttemptId ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                {/* Session Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-100 bg-surface p-3.5 shadow-xs">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Time Remaining</p>
                    <div className="mt-1 flex items-center gap-1.5 font-mono text-[15px] font-bold text-ink">
                      <Clock size={15} className={urgent ? 'text-rose-500' : 'text-slate-400'} />
                      <span>{formatTime(timeLeft)}</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-surface p-3.5 shadow-xs">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Violations</p>
                    <div className="mt-1 flex items-center gap-1.5 font-mono text-[15px] font-bold">
                      <ShieldAlert size={15} className={violations > 0 ? 'text-rose-500' : 'text-slate-400'} />
                      <span className={violations > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>
                        {rules.maxViolations > 0 ? `${violations} / ${rules.maxViolations}` : `${violations}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Notice */}
                <div className="rounded-2xl border border-indigo-50 bg-indigo-50/50 p-3.5 text-xs font-medium leading-relaxed text-indigo-950 dark:border-indigo-500/25 dark:bg-indigo-500/10 dark:text-indigo-200">
                  <div className="flex items-start gap-2">
                    <Info size={15} className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                    <span>
                      {isPreview
                        ? 'You are previewing this exam paper. Responses are not submitted to official records.'
                        : rules.proctored
                        ? 'This session is actively proctored. Exiting fullscreen, switching tabs, or using dev tools will increment violation counts.'
                        : 'Your answers are continuously synced to our secure exam servers as you progress.'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div className="mt-5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCandidateModalOpen(false)}
                  className="w-full rounded-full bg-ink py-3 text-[13px] font-semibold text-on-ink hover:bg-ink-hover transition-colors shadow-sm"
                >
                  Resume Exam
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Submit Confirmation & Summary Modal */}
      <AnimatePresence>
        {confirmSubmitOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isSubmitting && setConfirmSubmitOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-slate-950/5 bg-surface p-6 sm:p-8 shadow-[0_24px_60px_rgba(20,20,43,0.2)] z-10"
            >
              {/* Top Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                    <Send size={17} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-ink">Ready to Submit Exam?</h3>
                    <p className="text-xs text-slate-500 font-medium">Please review your sitting summary before finalizing.</p>
                  </div>
                </div>
                {!isSubmitting && (
                  <button
                    type="button"
                    onClick={() => setConfirmSubmitOpen(false)}
                    className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Statistics Grid */}
              <div className="mt-5 grid grid-cols-3 gap-2.5">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 text-center">
                  <span className="block text-xl font-extrabold text-ink tabular-nums">
                    {answeredCount}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Answered
                  </span>
                </div>

                <div className={`rounded-2xl border p-3.5 text-center ${
                  unansweredCount > 0 
                    ? 'border-rose-100 bg-rose-50/60 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300' 
                    : 'border-slate-100 bg-slate-50/80 text-slate-700'
                }`}>
                  <span className={`block text-xl font-extrabold tabular-nums ${
                    unansweredCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-ink'
                  }`}>
                    {unansweredCount}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Unanswered
                  </span>
                </div>

                <div className={`rounded-2xl border p-3.5 text-center ${
                  markedForReview.size > 0 
                    ? 'border-amber-100 bg-amber-50/60 text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200' 
                    : 'border-slate-100 bg-slate-50/80 text-slate-700'
                }`}>
                  <span className={`block text-xl font-extrabold tabular-nums ${
                    markedForReview.size > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-ink'
                  }`}>
                    {markedForReview.size}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    For Review
                  </span>
                </div>
              </div>

              {/* Attention Warning Notice */}
              <div className="mt-4 space-y-3">
                {(unansweredCount > 0 || markedForReview.size > 0) && (
                  <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 text-xs leading-relaxed text-amber-900 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle size={16} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                      <div>
                        <span className="font-bold">Items requiring attention: </span>
                        {unansweredCount > 0 && (
                          <span>You have {unansweredCount} unanswered question{unansweredCount === 1 ? '' : 's'}. </span>
                        )}
                        {markedForReview.size > 0 && (
                          <span>You still have {markedForReview.size} question{markedForReview.size === 1 ? '' : 's'} marked for review. </span>
                        )}
                        <span>Unanswered items will receive 0 points.</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-xs leading-relaxed text-slate-600">
                  <div className="flex items-start gap-2.5">
                    <Info size={16} className="mt-0.5 shrink-0 text-slate-500" />
                    <div>
                      <span className="font-semibold text-slate-800">Finality Notice: </span>
                      Once you confirm submission, your attempt is locked and immediately evaluated. You cannot resume, change responses, or retake this exam attempt.
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between px-1 text-xs text-slate-500">
                  <span>Time remaining:</span>
                  <span className="font-mono font-bold text-ink">{formatTime(timeLeft)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setConfirmSubmitOpen(false)}
                  className="flex-1 rounded-full border border-slate-200 bg-surface py-3 text-[13px] font-semibold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  Continue Exam
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={executeFinalSubmit}
                  className="flex-1 rounded-full bg-ink py-3 text-[13px] font-semibold text-on-ink hover:bg-ink-hover transition-colors shadow-sm disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Submitting…</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Confirm & Submit</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Top Navigation Docks */}
      <header className="fixed top-5 left-0 right-0 z-40 flex items-center justify-between px-4 md:px-8 pointer-events-none">
        {/* Left Floating Island: Arcade Logo */}
        <div className="pointer-events-auto flex shrink-0 items-center gap-2">
          <div className="flex h-12 shrink-0 items-center gap-3 rounded-full px-5 apple-glass-dock shadow-none [box-shadow:none]">
            <Image
              src="/arcade.svg"
              alt="Arcade"
              width={85}
              height={24}
              priority
              className="h-6 w-auto"
            />
            <span className="hidden sm:inline-block h-3.5 w-px bg-slate-200" />
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-ink/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink">
              {isPreview ? 'Preview' : rules.proctored ? 'Proctored' : 'Exam Session'}
            </span>
          </div>
        </div>

        {/* Center Floating Island: Standalone Timer Pill */}
        <div className="pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center">
          <div
            className={`flex h-12 items-center gap-2.5 rounded-full px-5 font-mono text-[14px] font-bold tabular-nums apple-glass-dock shadow-none [box-shadow:none] transition-colors ${
              urgent ? 'bg-rose-50 text-rose-700 border-rose-200/80 shadow-xs dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/25' : 'text-ink'
            }`}
          >
            <Clock size={16} className={urgent ? 'text-rose-600 animate-pulse dark:text-rose-400' : 'text-slate-400'} />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>

        {/* Right Floating Island: Candidate Profile Button */}
        <div className="pointer-events-auto flex shrink-0 items-center gap-2.5">
          <button
            type="button"
            onClick={() => setCandidateModalOpen(true)}
            className="group flex h-12 items-center gap-2.5 rounded-full pl-4 pr-1.5 apple-glass-dock shadow-none [box-shadow:none] text-slate-800 hover:bg-surface/95 transition-all cursor-pointer"
            title="View candidate & sitting info"
          >
            <div className="flex flex-col text-left">
              <span className="max-w-[110px] truncate text-[12px] font-bold leading-tight text-ink group-hover:text-indigo-600 transition-colors dark:group-hover:text-indigo-400">
                {candidateName}
              </span>
              <span className="font-mono text-[9px] font-semibold text-slate-400 leading-none">
                ID: {shortAttemptId}
              </span>
            </div>
            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full border border-slate-950/5 shadow-xs bg-slate-100">
              {user?.avatarUrl ? (
                <img
                  src={getAvatarUrl(user.avatarUrl)}
                  alt="Avatar"
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-indigo-50 text-[11px] font-black text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                  {candidateName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </button>
        </div>
      </header>

      {/* Main Content Area (Keys & Options Placed Directly on Background) */}
      <main className="mx-auto w-full max-w-[1540px] flex-1 px-6 md:px-12 lg:px-16 pt-32 md:pt-36 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_310px] xl:grid-cols-[1fr_340px] 2xl:grid-cols-[1fr_360px] gap-12 lg:gap-16 xl:gap-24 2xl:gap-32 items-start">
          {/* Question Column (Directly on BG Canvas) */}
          <div className="space-y-6 max-w-4xl">
            {/* Question Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex size-7 items-center justify-center rounded-full bg-ink text-[12px] font-bold text-on-ink shadow-xs">
                  {currentIdx + 1}
                </span>
                <span className="text-[14px] font-bold tracking-tight text-ink">
                  Question {currentIdx + 1} of {questions.length}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-surface/90 border border-slate-200/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-700 shadow-xs">
                  {currentQ.points} pt{currentQ.points === 1 ? '' : 's'}
                </span>
                <span className="rounded-full bg-surface/90 border border-slate-200/80 px-3 py-1 text-[11px] font-semibold text-slate-500 shadow-xs">
                  {currentQ.type === 'MULTIPLE' ? 'Multi-Choice' : currentQ.type === 'SENTENCE' ? 'Written Answer' : 'Single Choice'}
                </span>
              </div>
            </div>

            {/* Question Prompt */}
            <div className="text-[1.1rem] md:text-[1.2rem] leading-relaxed font-medium text-ink">
              <TiptapContentView body={promptBody(currentQ.prompt)} emptyMessage="" />
            </div>

            {currentQ.type === 'MULTIPLE' && (
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-indigo-600 dark:text-indigo-400">
                <Sparkles size={14} />
                <span>Select all options that apply.</span>
              </div>
            )}

            {/* Answer Options or Sentence Input */}
            {currentQ.type === 'SENTENCE' ? (
              <div>
                <textarea
                  value={textAnswers[currentQ.id] ?? ''}
                  onChange={(e) => handleTextAnswer(e.target.value)}
                  rows={8}
                  placeholder="Type your comprehensive answer here…"
                  className="w-full resize-y rounded-2xl border border-slate-200/90 bg-surface p-5 text-[14px] font-medium leading-relaxed text-ink shadow-xs outline-none transition-all placeholder:text-slate-400 focus:border-ink focus:shadow-sm"
                />
                <div className="mt-2.5 flex items-center justify-between text-[11px] font-medium text-slate-400">
                  <span>Autosaved as you type</span>
                  <span>{(textAnswers[currentQ.id] ?? '').length} characters</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {currentQ.options.map((opt, optIndex) => {
                  const selected = (answers[currentQ.id] ?? []).includes(opt.id);
                  const multi = currentQ.type === 'MULTIPLE';
                  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
                  const optLetter = optionLetters[optIndex] || `${optIndex + 1}`;

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(opt.id)}
                      aria-pressed={selected}
                      className={`group flex w-full items-center rounded-2xl border p-4 text-left transition-all cursor-pointer ${
                        selected
                          ? 'border-ink bg-surface ring-1 ring-ink shadow-[0_4px_18px_rgba(20,20,43,0.08)]'
                          : 'border-slate-200/80 bg-surface shadow-xs hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      {/* Option Letter Tag / Indicator */}
                      <span
                        className={`mr-3.5 grid size-8 shrink-0 place-items-center text-[12px] font-bold transition-all ${
                          multi ? 'rounded-lg' : 'rounded-full'
                        } ${
                          selected
                            ? 'bg-ink text-on-ink'
                            : 'border border-slate-200 bg-slate-50 text-slate-600 group-hover:border-slate-300'
                        }`}
                      >
                        {selected ? (
                          multi ? <Check size={15} strokeWidth={3} /> : optLetter
                        ) : (
                          optLetter
                        )}
                      </span>
                      <span
                        className={`text-[14.5px] leading-relaxed flex-1 ${
                          selected ? 'font-semibold text-ink' : 'font-medium text-slate-700'
                        }`}
                      >
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Question Footer Navigation Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-6">
              <button
                type="button"
                onClick={toggleReview}
                className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-semibold transition-all shadow-xs cursor-pointer ${
                  isReviewed
                    ? 'bg-amber-50 text-amber-800 border border-amber-300 shadow-xs dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/40'
                    : 'border border-slate-200/80 bg-surface text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Flag size={14} className={isReviewed ? 'fill-amber-600 text-amber-600 dark:fill-amber-400 dark:text-amber-400' : 'text-slate-400'} />
                <span>{isReviewed ? 'Marked for Review' : 'Mark for Review'}</span>
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                  disabled={currentIdx === 0}
                  className="inline-flex h-11 items-center gap-1.5 rounded-full border border-slate-200/80 bg-surface px-5 text-[12px] font-semibold text-slate-700 shadow-xs hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition-all cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                  disabled={currentIdx === questions.length - 1}
                  className="inline-flex h-11 items-center gap-1.5 rounded-full bg-ink px-6 text-[12px] font-semibold text-on-ink shadow-xs hover:bg-ink-hover transition-all disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Progress & Question Matrix (Directly on BG Canvas) */}
          <aside className="lg:sticky lg:top-36 space-y-6">
            {/* Progress Overview */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Exam Progress
                </h3>
                <span className="text-[12px] font-bold text-ink">
                  {answeredCount} / {questions.length}
                </span>
              </div>

              {/* Progress Bar Track */}
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80 shadow-inner">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${(answeredCount / Math.max(1, questions.length)) * 100}%` }}
                />
              </div>

              <div className="mt-3.5 grid grid-cols-2 gap-2.5">
                <div className="rounded-2xl border border-slate-200/80 bg-surface p-3.5 text-center shadow-xs">
                  <div className="text-xl font-extrabold tabular-nums text-ink">
                    {answeredCount}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Answered
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200/80 bg-surface p-3.5 text-center shadow-xs">
                  <div className="text-xl font-extrabold tabular-nums text-amber-600 dark:text-amber-400">
                    {markedForReview.size}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    For Review
                  </div>
                </div>
              </div>
            </div>

            {/* Question Matrix Grid */}
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Questions
              </p>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const hasAnswer = isAnswered(q);
                  const isRev = markedForReview.has(q.id);
                  const isActive = currentIdx === idx;

                  let bgClass = 'border-slate-200/90 bg-surface text-slate-700 hover:border-slate-300 hover:bg-slate-50';
                  if (hasAnswer) bgClass = 'border-ink bg-ink text-on-ink';
                  if (isRev && !hasAnswer) bgClass = 'border-amber-300 bg-amber-50 text-amber-800 font-bold dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200';
                  if (isRev && hasAnswer) bgClass = 'border-amber-400 bg-amber-500 text-white font-bold';

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => setCurrentIdx(idx)}
                      className={`relative flex h-10 items-center justify-center rounded-xl border text-[13px] font-bold transition-all shadow-xs cursor-pointer ${bgClass} ${
                        isActive ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
                      }`}
                    >
                      {idx + 1}
                      {isRev && (
                        <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-amber-500 ring-2 ring-surface" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Action — Opens Confirmation Modal */}
            <div>
              <button
                type="button"
                onClick={() => setConfirmSubmitOpen(true)}
                disabled={isSubmitting}
                className="w-full rounded-full bg-ink py-3.5 text-[13px] font-semibold text-on-ink hover:bg-ink-hover transition-all shadow-sm disabled:opacity-60 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 size={16} />
                <span>Submit Exam</span>
              </button>
            </div>
          </aside>
        </div>
      </main>
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
