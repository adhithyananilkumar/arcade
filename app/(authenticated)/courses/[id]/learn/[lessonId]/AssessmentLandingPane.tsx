'use client';

// Connects the shared AssessmentLanding component to the API for one assessment node in the course
// player. AssessmentLanding itself is pure UI in the assessments domain; the fetching, the routing
// and the "did they just pass it" refresh live here, in the app layer, per this repo's rule that
// side effects belong to orchestrators rather than domain components.

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { courseRoutes, examRoutes } from '@/shared/routes/content.routes';
import { Loader2 } from 'lucide-react';
import {
  AssessmentLanding,
  getAssessmentLanding,
  type AssessmentLandingResponse,
} from '@/domains/assessments';
import type { AssessmentNodeResponse } from '@/shared/types/api.types';

import { PreviewExamModal } from './PreviewExamModal';
import { toast } from 'sonner';

interface AssessmentLandingPaneProps {
  assessment: AssessmentNodeResponse;
  courseId?: string;
  /** Called when a previously-unpassed assessment now shows a pass, so the progress bar catches up. */
  onPassed?: () => void;
  /** When true, runs in author preview mode with ephemeral session attempts and zero DB writes. */
  isPreview?: boolean;
}

export function AssessmentLandingPane({
  assessment,
  courseId,
  onPassed,
  isPreview = false,
}: AssessmentLandingPaneProps) {
  const router = useRouter();
  const [landing, setLanding] = useState<AssessmentLandingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSimulateModal, setShowSimulateModal] = useState(false);

  const previewStorageKey = `preview_attempts_${assessment.examId}`;

  const load = useCallback(() => {
    getAssessmentLanding(assessment.examId, {
      planId: assessment.planId,
      placementId: assessment.placementId,
    })
      .then((data) => {
        let finalData = data;
        if (isPreview && typeof window !== 'undefined') {
          const raw = sessionStorage.getItem(previewStorageKey);
          if (raw) {
            try {
              const previewAttempts = JSON.parse(raw);
              if (Array.isArray(previewAttempts) && previewAttempts.length > 0) {
                const latest = previewAttempts[0];
                const best =
                  [...previewAttempts]
                    .filter((h) => h.percentage !== null)
                    .sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0))[0] ?? null;
                const passed = best ? Boolean(best.passed) : Boolean(latest.passed);
                const score = best?.percentage ?? latest.percentage ?? null;

                finalData = {
                  ...data,
                  history: previewAttempts,
                  attemptsUsed: previewAttempts.length,
                  attemptsRemaining: Math.max(0, data.maxAttempts - previewAttempts.length),
                  latestAttempt: latest,
                  bestAttempt: best,
                  passed,
                  score,
                  startable: previewAttempts.length < data.maxAttempts,
                  blockedReason:
                    previewAttempts.length >= data.maxAttempts ? 'ATTEMPTS_EXHAUSTED' : null,
                  blockedMessage:
                    previewAttempts.length >= data.maxAttempts
                      ? "You've used all attempts."
                      : null,
                };
              }
            } catch {}
          }
        }
        setLanding(finalData);
        setError(null);
        if (finalData.history.some((h) => h.passed)) {
          onPassed?.();
        }
      })
      .catch((err) => setError(err?.message ?? 'Could not load this assessment.'));
    // onPassed is a fresh closure each render; depending on it would refetch on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessment.examId, assessment.planId, assessment.placementId, isPreview, previewStorageKey]);

  useEffect(() => {
    load();
  }, [load]);

  // Returning from an attempt lands back on this pane; re-reading on focus picks up the new result
  // without a full page reload.
  useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState === 'visible') load();
    };
    document.addEventListener('visibilitychange', onFocus);
    return () => document.removeEventListener('visibilitychange', onFocus);
  }, [load]);

  const handleStart = () => {
    const params = new URLSearchParams();
    if (landing?.planId) params.set('planId', landing.planId);
    // Return to this assessment's own place in the course, not the course's first lesson — the
    // learner came from here, and after an attempt this is where the result is shown.
    if (courseId) params.set('returnTo', courseRoutes.lesson(courseId, assessment.placementId));
    if (isPreview) params.set('preview', 'true');
    const query = params.toString();
    router.push(`${examRoutes.attempt(assessment.examId)}${query ? `?${query}` : ''}`);
  };

  const handleSimulateAttempt = (simulatedScore: number) => {
    setShowSimulateModal(false);
    if (!landing) return;

    const passThreshold = landing.passPercentage ?? 70;
    const isPassing = simulatedScore >= passThreshold;

    const raw = sessionStorage.getItem(previewStorageKey);
    const existing = raw ? JSON.parse(raw) : [];
    const attemptNumber = existing.length + 1;

    const newAttempt = {
      attemptId: `preview-att-${Date.now()}`,
      attemptNumber,
      status: 'SUBMITTED',
      submittedAt: new Date().toISOString(),
      percentage: simulatedScore,
      passed: isPassing,
      awaitingReview: false,
      gradeCardId: null,
    };

    const updatedHistory = [newAttempt, ...existing];
    sessionStorage.setItem(previewStorageKey, JSON.stringify(updatedHistory));

    const best =
      [...updatedHistory]
        .filter((h) => h.percentage !== null)
        .sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0))[0] ?? null;

    setLanding({
      ...landing,
      history: updatedHistory,
      attemptsUsed: updatedHistory.length,
      attemptsRemaining: Math.max(0, landing.maxAttempts - updatedHistory.length),
      latestAttempt: newAttempt,
      bestAttempt: best,
      passed: best ? Boolean(best.passed) : false,
      score: best?.percentage ?? newAttempt.percentage,
      startable: updatedHistory.length < landing.maxAttempts,
      blockedReason:
        updatedHistory.length >= landing.maxAttempts ? 'ATTEMPTS_EXHAUSTED' : null,
      blockedMessage:
        updatedHistory.length >= landing.maxAttempts ? "You've used all attempts." : null,
    });

    if (isPassing) {
      onPassed?.();
    }
    toast.success(`Simulated attempt recorded (${simulatedScore}%). Session only.`);
  };

  if (error) {
    return (
      <div className="rounded-lg border border-slate-200/80 bg-white/95 px-6 py-12 text-center">
        <p className="text-[14px] font-semibold text-rose-600">{error}</p>
      </div>
    );
  }

  if (!landing) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 size={22} className="animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200/80 bg-white/95 px-5 py-7 shadow-[0_8px_28px_rgba(20,20,43,0.05)] sm:px-8 sm:py-9 md:px-12 md:py-11">
      <AssessmentLanding
        landing={landing}
        onStart={handleStart}
        onViewGradeCard={(gradeCardId) => router.push(examRoutes.gradeCard(gradeCardId))}
      />

      {isPreview && (
        <PreviewExamModal
          isOpen={showSimulateModal}
          onClose={() => setShowSimulateModal(false)}
          title={landing.title}
          passPercentage={landing.passPercentage ?? 70}
          onSimulate={handleSimulateAttempt}
        />
      )}
    </div>
  );
}
