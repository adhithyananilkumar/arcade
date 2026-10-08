'use client';

import { useState, useEffect, useCallback, useMemo, useRef, useSyncExternalStore } from 'react';
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
  Send,
  Maximize2,
  Lock,
  Layers,
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
  SITTING_BASELINE_RULES,
  SITTING_MAX_VIOLATIONS,
} from '@/domains/assessments';
import { TiptapContentView } from '@/domains/learning';
import { examRoutes } from '@/shared/routes/content.routes';

/** How long after the last keystroke a written answer is persisted. */
const TEXT_ANSWER_DEBOUNCE_MS = 600;

/** Two reports this close together are one incident (blur and visibilitychange fire as a pair). */
const REPORT_DEDUPE_MS = 1500;

/**
 * What the sitting runs under. Every sitting gets the baseline — full screen, monitored, a hard
 * violation limit — and the server sends the limit it enforces (the plan's, when stricter). A
 * preview runs the same locks and counts its strikes locally.
 */
interface SittingRules {
  proctored: boolean;
  fullscreen: boolean;
  maxViolations: number;
}

const BASELINE: SittingRules = { proctored: false, fullscreen: true, maxViolations: SITTING_MAX_VIOLATIONS };

/** Chrome and Edge's Keyboard Lock: while full screen, system keys reach the page instead of the OS. */
type KeyboardLock = { lock?: (keyCodes?: string[]) => Promise<void>; unlock?: () => void };
const keyboardLock = (): KeyboardLock | undefined =>
  (navigator as Navigator & { keyboard?: KeyboardLock }).keyboard;

const subscribeFullscreen = (cb: () => void) => {
  document.addEventListener('fullscreenchange', cb);
  return () => document.removeEventListener('fullscreenchange', cb);
};
const noopSubscribe = () => () => {};

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
  const [rules, setRules] = useState<SittingRules>(BASELINE);
  // Violations are counted by the server; this mirrors the count it last reported.
  const [violations, setViolations] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const leaveTo = returnTo ?? examRoutes.landing(examId);

  /** The sitting runs in its own tab: leaving closes it, back to the page that started it. */
  const leave = useCallback(() => {
    window.close();
    // Not a tab the page may close (opened by hand): go back in place instead.
    if (!window.closed) router.push(leaveTo);
  }, [router, leaveTo]);

  const isFullscreen = useSyncExternalStore(subscribeFullscreen, () => !!document.fullscreenElement, () => false);
  const canFullscreen = useSyncExternalStore(noopSubscribe, () => !!document.fullscreenEnabled, () => false);

  /**
   * Must run inside a click: browsers only grant full screen to a user gesture. Then, where the
   * browser supports it, lock the keyboard — Alt+Tab and the Windows key stop switching away, and
   * Esc has to be held down to leave full screen.
   */
  const enterFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
    } catch {
      return;
    }
    try {
      await keyboardLock()?.lock?.();
    } catch {
      // Unsupported or refused; the focus monitoring still records every switch away.
    }
  }, []);

  // One tab per sitting. A tab that opens this exam's paper claims it; any other tab holding it
  // steps aside until the candidate chooses to continue there.
  const [heldElsewhere, setHeldElsewhere] = useState(false);
  const claimTabRef = useRef<() => void>(() => {});
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;
    const me = Math.random().toString(36).slice(2);
    const channel = new BroadcastChannel(`arcade-exam-sitting:${examId}`);
    channel.onmessage = (e: MessageEvent<{ type?: string; tab?: string }>) => {
      if (e.data?.type === 'claim' && e.data.tab !== me) setHeldElsewhere(true);
    };
    claimTabRef.current = () => {
      channel.postMessage({ type: 'claim', tab: me });
      setHeldElsewhere(false);
    };
    channel.postMessage({ type: 'claim', tab: me });
    return () => channel.close();
  }, [examId]);

  const adoptAttempt = useCallback((attempt: AttemptResponse) => {
    setAttemptId(attempt.id);
    setTimeLeft(attempt.secondsRemaining);
    setViolations(attempt.violationCount);
    setRules({
      proctored: attempt.proctoringRequired,
      // The baseline makes both always on; the server says so, and an older server is overruled.
      fullscreen: true,
      maxViolations: attempt.maxViolations > 0 ? attempt.maxViolations : SITTING_MAX_VIOLATIONS,
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
    keyboardLock()?.unlock?.();
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

  const previewStrikesRef = useRef(0);
  const finalSubmitRef = useRef(executeFinalSubmit);
  useEffect(() => {
    finalSubmitRef.current = executeFinalSubmit;
  }, [executeFinalSubmit]);

  // Integrity monitoring — the sitting baseline, on for every sitting. The browser can only detect
  // and deter; the server counts each violation and ends the sitting at the limit. A preview runs
  // the same locks and counts its strikes locally.
  useEffect(() => {
    if (!attemptId) return;

    let lastReport = 0;
    const report = (eventType: string, detail: string) => {
      if (isSubmittingRef.current) return;
      const now = Date.now();
      if (now - lastReport < REPORT_DEDUPE_MS) return;
      lastReport = now;
      setShowWarning(true);
      if (isPreview) {
        // No server to end a preview: at the limit it ends itself, as a real sitting would.
        const strikes = ++previewStrikesRef.current;
        setViolations(strikes);
        if (strikes >= SITTING_MAX_VIOLATIONS) {
          toast.error('Preview: a real sitting would have been ended for violations here.');
          void finalSubmitRef.current();
        }
        return;
      }
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
    /** Recorded for the author's review; costs the candidate nothing. */
    const audit = (eventType: string, detail: string) => {
      if (isPreview || isSubmittingRef.current) return;
      recordProctorEvent(attemptId, eventType, detail).catch(() => {});
    };
    const editable = (t: EventTarget | null) => t instanceof HTMLTextAreaElement || t instanceof HTMLInputElement;

    const onFullscreenChange = () => {
      if (document.fullscreenEnabled && !document.fullscreenElement) report('FULLSCREEN_EXIT', 'Exited fullscreen');
    };
    const onVisibility = () => {
      if (document.hidden) report('TAB_HIDDEN', 'Switched tabs or minimised');
    };
    const onBlur = () => {
      // Focus moving into an embed inside the paper (a video in a question) is not leaving it.
      if (document.activeElement instanceof HTMLIFrameElement) return;
      report('WINDOW_BLUR', 'Window lost focus');
    };
    const onClipboard = (e: ClipboardEvent) => {
      e.preventDefault();
      report('COPY_PASTE', `Blocked ${e.type}`);
    };
    const onPreventDefault = (e: Event) => e.preventDefault();
    const onSelectStart = (e: Event) => {
      if (!editable(e.target)) e.preventDefault();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      if (
        e.key === 'F12' ||
        (mod && e.shiftKey && ['i', 'j', 'c'].includes(key)) ||
        (e.metaKey && e.altKey && ['i', 'j', 'c'].includes(key))
      ) {
        e.preventDefault();
        report('DEVTOOLS_OPEN', 'Developer tools shortcut');
        return;
      }
      // Print, save page, view source, and select-all outside the answer box.
      if (mod && (['p', 's', 'u'].includes(key) || (key === 'a' && !editable(e.target)))) {
        e.preventDefault();
        return;
      }
      // These only reach the page under the keyboard lock; swallowing them keeps the candidate here.
      if ((e.altKey && e.key === 'Tab') || e.key === 'Meta' || e.key === 'OS') e.preventDefault();
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key !== 'PrintScreen') return;
      navigator.clipboard?.writeText('').catch(() => {});
      audit('SCREEN_CAPTURE', 'Print Screen key');
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isPreview || isSubmittingRef.current) return;
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
    document.addEventListener('dragstart', onPreventDefault);
    document.addEventListener('drop', onPreventDefault);
    document.addEventListener('selectstart', onSelectStart);
    document.addEventListener('keydown', onKeyDown, true);
    document.addEventListener('keyup', onKeyUp, true);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('copy', onClipboard);
      document.removeEventListener('cut', onClipboard);
      document.removeEventListener('paste', onClipboard);
      document.removeEventListener('contextmenu', onPreventDefault);
      document.removeEventListener('dragstart', onPreventDefault);
      document.removeEventListener('drop', onPreventDefault);
      document.removeEventListener('selectstart', onSelectStart);
      document.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('keyup', onKeyUp, true);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [attemptId, isPreview, examId, router]);

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

  const handleReturnToFullscreen = () => {
    setShowWarning(false);
    void enterFullscreen();
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

  const sections = useMemo(() => paperSections(questions), [questions]);

  if (!honorCodeAccepted) {
    return (
      <div
        className="flex min-h-screen items-center justify-center text-[13px] font-medium text-slate-500"
        style={{ background: 'var(--theme-wash, linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 40%, #FFFFFF 100%))' }}
      >
        <HonorCodeModal
          isOpen={true}
          onClose={leave}
          sittingRules={SITTING_BASELINE_RULES}
          continueLabel="Start in full screen"
          onContinue={() => {
            // Still inside the click, so the browser grants full screen.
            void enterFullscreen();
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
          onClick={leave}
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

  const multiSection = sections.length > 1;
  const sectionIdx = Math.max(0, sections.findIndex((sec) => currentIdx >= sec.start && currentIdx < sec.end));
  const currentSection = sections[sectionIdx];
  const goToSection = (i: number) => {
    const target = sections[i];
    if (target) setCurrentIdx(target.start);
  };
  const paletteRange =
    multiSection && currentSection
      ? Array.from({ length: currentSection.end - currentSection.start }, (_, i) => currentSection.start + i)
      : questions.map((_, i) => i);
  const sectionAnswered = currentSection
    ? questions.slice(currentSection.start, currentSection.end).filter(isAnswered).length
    : 0;

  // Where the browser has no full screen (iOS Safari), the rest of the baseline still applies.
  const needsFullscreen = canFullscreen && !isFullscreen && !isSubmitting;
  const watermark = watermarkTile(`${isPreview ? 'PREVIEW · ' : ''}${candidateName} · ${shortAttemptId}`);
  const violationNotice = isPreview
    ? `Preview: a real sitting records this as a violation (${violations} of ${rules.maxViolations}). Reaching the limit ends the sitting.`
    : `This was recorded — ${violations} of ${rules.maxViolations} violations. Reaching the limit ends your sitting automatically and flags it for review.`;

  return (
    <div
      className="relative flex min-h-screen select-none flex-col font-sans selection:bg-ink/10 theme-page-bg theme-wallpaper-frost"
      style={{ background: 'var(--theme-wash, linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 28%, #FFFFFF 70%))' }}
    >
      {/* Printing the page gives a blank sheet. */}
      <style>{'@media print { body { visibility: hidden !important; } }'}</style>

      {/* This sitting was opened in another tab: this one steps aside. */}
      {heldElsewhere && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/60 p-4 backdrop-blur-xl">
          <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-surface p-7 text-center shadow-[0_24px_60px_rgba(20,20,43,0.22)]">
            <div className="mx-auto mb-5 grid size-14 place-items-center rounded-2xl border border-slate-200 bg-slate-50">
              <Layers className="text-slate-600" size={24} />
            </div>
            <h2 className="text-[1.25rem] font-bold tracking-tight text-ink">This exam is open in another tab</h2>
            <p className="mt-2 text-[13px] font-medium leading-relaxed text-slate-500">
              A sitting can only be held in one tab. Close the other tab, or continue here.
            </p>
            <button
              type="button"
              onClick={() => claimTabRef.current()}
              className="mt-6 w-full cursor-pointer rounded-full bg-ink py-3 text-[13px] font-semibold text-on-ink shadow-sm transition-colors hover:bg-ink-hover"
            >
              Continue in this tab
            </button>
          </div>
        </div>
      )}

      {/* Left the window without leaving full screen (tab switch, Alt+Tab, another app). */}
      <AnimatePresence>
        {showWarning && !needsFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-xl"
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
              <h2 className="text-[1.25rem] font-bold tracking-tight text-ink">You left the exam window</h2>
              <p className="mt-2 text-[13px] font-medium leading-relaxed text-slate-500">{violationNotice}</p>
              <ViolationMeter count={violations} limit={rules.maxViolations} />
              <button
                type="button"
                onClick={handleReturnToFullscreen}
                className="mt-6 w-full cursor-pointer rounded-full bg-ink py-3 text-[13px] font-semibold text-on-ink shadow-sm transition-colors hover:bg-ink-hover"
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
                        : `This sitting is monitored. Leaving full screen, switching tabs or windows, copying, pasting or opening developer tools each count as a violation — ${rules.maxViolations} end the sitting. Your answers are saved as you go.`}
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
              {isPreview ? 'Preview' : rules.proctored ? 'Proctored' : 'Secured Sitting'}
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

      {needsFullscreen ? (
        /* The paper is only ever on screen in full screen. */
        <main className="flex flex-1 items-center justify-center px-4 pt-28 pb-10">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200/80 bg-surface/90 p-7 text-center shadow-[0_24px_60px_rgba(20,20,43,0.18)] backdrop-blur-xl sm:p-8">
            <div
              className={`mx-auto mb-5 grid size-14 place-items-center rounded-2xl border ${
                violations > 0
                  ? 'border-rose-100 bg-rose-50 dark:border-rose-500/25 dark:bg-rose-500/10'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              {violations > 0 ? (
                <AlertTriangle className="text-rose-600 dark:text-rose-400" size={26} />
              ) : (
                <Maximize2 className="text-slate-600" size={24} />
              )}
            </div>
            <h2 className="text-[1.25rem] font-bold tracking-tight text-ink">
              {violations > 0 ? 'You left full screen' : 'This exam is taken in full screen'}
            </h2>
            <p className="mt-2 text-[13px] font-medium leading-relaxed text-slate-500">
              {violations > 0
                ? violationNotice
                : `The paper stays hidden outside full screen. Leaving it, switching windows, copying or pasting each count as a violation — ${rules.maxViolations} end the sitting.`}
            </p>
            <ViolationMeter count={violations} limit={rules.maxViolations} />
            <button
              type="button"
              onClick={handleReturnToFullscreen}
              className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-ink py-3 text-[13px] font-semibold text-on-ink shadow-sm transition-colors hover:bg-ink-hover"
            >
              <Maximize2 size={15} />
              {violations > 0 ? 'Return to full screen' : 'Enter full screen'}
            </button>
            <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <Lock size={11} /> In full screen, hold Esc to leave it.
            </p>
          </div>
        </main>
      ) : (
      <main className="mx-auto w-full max-w-[1440px] flex-1 px-4 sm:px-6 md:px-10 pt-28 md:pt-32 pb-8">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* The question, in its card. Watermarked with the candidate and attempt. */}
          <section
            aria-label={`Question ${currentIdx + 1} of ${questions.length}`}
            className="relative overflow-hidden rounded-3xl border border-slate-200/70 bg-surface/80 shadow-[0_18px_50px_-20px_rgba(20,20,43,0.28)] backdrop-blur-xl"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-0"
              style={{ backgroundImage: watermark }}
            />

            <div className="relative z-10 p-5 sm:p-8">
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 pb-4">
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-ink text-[12px] font-bold text-on-ink shadow-xs">
                    {currentIdx + 1}
                  </span>
                  <div className="min-w-0">
                    <span className="block text-[14px] font-bold tracking-tight text-ink">
                      Question {currentIdx + 1} of {questions.length}
                    </span>
                    {multiSection && currentSection && (
                      <span className="block truncate text-[11px] font-semibold text-slate-500">
                        Section {sectionIdx + 1} · {currentSection.title ?? 'Untitled section'}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-slate-200/80 bg-surface/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-700 shadow-xs">
                    {currentQ.points} pt{currentQ.points === 1 ? '' : 's'}
                  </span>
                  <span className="rounded-full border border-slate-200/80 bg-surface/90 px-3 py-1 text-[11px] font-semibold text-slate-500 shadow-xs">
                    {currentQ.type === 'MULTIPLE' ? 'Multi-Choice' : currentQ.type === 'SENTENCE' ? 'Written Answer' : 'Single Choice'}
                  </span>
                </div>
              </div>

              {/* Question Prompt */}
              <div className="mt-5 text-[1.05rem] font-medium leading-relaxed text-ink md:text-[1.15rem]">
                <TiptapContentView body={promptBody(currentQ.prompt)} emptyMessage="" />
              </div>

              {currentQ.type === 'MULTIPLE' && (
                <div className="mt-3 flex items-center gap-1.5 text-[12px] font-semibold text-indigo-600 dark:text-indigo-400">
                  <Sparkles size={14} />
                  <span>Select all options that apply.</span>
                </div>
              )}

              {/* Answer Options or Sentence Input */}
              <div className="mt-6">
                {currentQ.type === 'SENTENCE' ? (
                  <div>
                    <textarea
                      value={textAnswers[currentQ.id] ?? ''}
                      onChange={(e) => handleTextAnswer(e.target.value)}
                      rows={8}
                      spellCheck={false}
                      autoComplete="off"
                      placeholder="Type your answer here…"
                      className="w-full select-text resize-y rounded-2xl border border-slate-200/90 bg-surface p-5 text-[14px] font-medium leading-relaxed text-ink shadow-xs outline-none transition-all placeholder:text-slate-400 focus:border-ink focus:shadow-sm"
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
                      const optLetter = OPTION_LETTERS[optIndex] || `${optIndex + 1}`;

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectOption(opt.id)}
                          aria-pressed={selected}
                          className={`group flex w-full cursor-pointer items-center rounded-2xl border p-4 text-left transition-all ${
                            selected
                              ? 'border-ink bg-surface ring-1 ring-ink shadow-[0_4px_18px_rgba(20,20,43,0.08)]'
                              : 'border-slate-200/80 bg-slate-50/70 hover:border-slate-300 hover:bg-surface'
                          }`}
                        >
                          <span
                            className={`mr-3.5 grid size-8 shrink-0 place-items-center text-[12px] font-bold transition-all ${
                              multi ? 'rounded-lg' : 'rounded-full'
                            } ${
                              selected
                                ? 'bg-ink text-on-ink'
                                : 'border border-slate-200 bg-surface text-slate-600 group-hover:border-slate-300'
                            }`}
                          >
                            {selected && multi ? <Check size={15} strokeWidth={3} /> : optLetter}
                          </span>
                          <span
                            className={`flex-1 text-[14.5px] leading-relaxed ${
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
              </div>

              {/* Question Footer Navigation Controls */}
              <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 pt-5">
                <button
                  type="button"
                  onClick={toggleReview}
                  className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-[12px] font-semibold shadow-xs transition-all ${
                    isReviewed
                      ? 'border border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200'
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
                    className="inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-full border border-slate-200/80 bg-surface px-5 text-[12px] font-semibold text-slate-700 shadow-xs transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                    <span>Previous</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                    disabled={currentIdx === questions.length - 1}
                    className="inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-full bg-ink px-6 text-[12px] font-semibold text-on-ink shadow-xs transition-all hover:bg-ink-hover disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <span>Next</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Right column: progress, the question palette, and Submit at the bottom. */}
          <aside className="flex flex-col gap-4 lg:sticky lg:top-32 lg:h-[calc(100dvh-10rem)]">
            {/* Progress Overview */}
            <div className="rounded-3xl border border-slate-200/70 bg-surface/80 p-4 shadow-xs backdrop-blur-xl">
              <div className="mb-2.5 flex items-center justify-between">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Exam Progress</h3>
                <span className="text-[12px] font-bold text-ink">
                  {answeredCount} / {questions.length}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80 shadow-inner">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{ width: `${(answeredCount / Math.max(1, questions.length)) * 100}%` }}
                />
              </div>
              <div className="mt-3.5 grid grid-cols-3 gap-2">
                <Stat value={answeredCount} label="Answered" />
                <Stat value={markedForReview.size} label="Review" tone="amber" />
                <Stat
                  value={`${violations}/${rules.maxViolations}`}
                  label="Strikes"
                  tone={violations > 0 ? 'rose' : undefined}
                />
              </div>
            </div>

            {/* Question palette — one section at a time when the paper has sections. */}
            <div className="flex min-h-0 flex-1 flex-col rounded-3xl border border-slate-200/70 bg-surface/80 p-4 shadow-xs backdrop-blur-xl">
              {multiSection && currentSection ? (
                <div className="mb-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => goToSection(sectionIdx - 1)}
                    disabled={sectionIdx === 0}
                    aria-label="Previous section"
                    className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full border border-slate-200/80 bg-surface text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <div className="min-w-0 flex-1 text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Section {sectionIdx + 1} of {sections.length}
                    </p>
                    <p className="truncate text-[13px] font-bold text-ink" title={currentSection.title ?? undefined}>
                      {currentSection.title ?? 'Untitled section'}
                    </p>
                    <p className="text-[10px] font-semibold text-slate-400">
                      {sectionAnswered} of {currentSection.end - currentSection.start} answered
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => goToSection(sectionIdx + 1)}
                    disabled={sectionIdx === sections.length - 1}
                    aria-label="Next section"
                    className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full border border-slate-200/80 bg-surface text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              ) : (
                <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Questions</p>
              )}

              <div className="-m-1 min-h-0 flex-1 overflow-y-auto p-1">
                <div className="grid grid-cols-5 gap-2">
                  {paletteRange.map((idx) => {
                    const q = questions[idx];
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
                        aria-current={isActive ? 'step' : undefined}
                        className={`relative flex h-10 cursor-pointer items-center justify-center rounded-xl border text-[13px] font-bold shadow-xs transition-all ${bgClass} ${
                          isActive ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-surface' : ''
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
            </div>

            {/* Submit — at the bottom of the column; opens the confirmation summary. */}
            <button
              type="button"
              onClick={() => setConfirmSubmitOpen(true)}
              disabled={isSubmitting}
              className="flex w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-full bg-ink py-3.5 text-[13px] font-semibold text-on-ink shadow-sm transition-all hover:bg-ink-hover disabled:opacity-60"
            >
              <CheckCircle2 size={16} />
              <span>Submit Exam</span>
            </button>
          </aside>
        </div>
      </main>
      )}
    </div>
  );
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

/** A run of consecutive questions from one paper section. `end` is exclusive. */
interface PaperSection {
  title: string | null;
  start: number;
  end: number;
}

/** The paper's sections in order, from each frozen question's section title. */
function paperSections(questions: AttemptQuestionResponse[]): PaperSection[] {
  const sections: PaperSection[] = [];
  questions.forEach((q, i) => {
    const title = q.sectionTitle?.trim() || null;
    const last = sections[sections.length - 1];
    if (last && last.title === title) last.end = i + 1;
    else sections.push({ title, start: i, end: i + 1 });
  });
  return sections;
}

/**
 * A faint diagonal tile of the candidate's name and attempt, behind the paper: a photo or
 * screenshot of a question names whose sitting it came from.
 */
function watermarkTile(text: string): string {
  const safe = text.replace(/[<>&'"]/g, '');
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='340' height='190'>` +
    `<text x='20' y='110' transform='rotate(-22 170 95)' font-family='ui-monospace,monospace' ` +
    `font-size='13' font-weight='600' fill='rgb(128,128,128)' fill-opacity='0.11'>${safe}</text></svg>`;
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
}

function Stat({ value, label, tone }: { value: number | string; label: string; tone?: 'amber' | 'rose' }) {
  const color =
    tone === 'amber'
      ? 'text-amber-600 dark:text-amber-400'
      : tone === 'rose'
      ? 'text-rose-600 dark:text-rose-400'
      : 'text-ink';
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-surface p-2.5 text-center shadow-xs">
      <div className={`text-lg font-extrabold tabular-nums ${color}`}>{value}</div>
      <div className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
    </div>
  );
}

/** One pip per allowed violation, filled as they are recorded. */
function ViolationMeter({ count, limit }: { count: number; limit: number }) {
  if (count <= 0 || limit <= 0) return null;
  return (
    <div className="mt-4 flex items-center justify-center gap-1.5" aria-label={`${count} of ${limit} violations`}>
      {Array.from({ length: limit }, (_, i) => (
        <span
          key={i}
          className={`h-1.5 w-8 rounded-full ${i < count ? 'bg-rose-500' : 'bg-slate-200'}`}
        />
      ))}
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
