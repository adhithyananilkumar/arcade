'use client';

// Connects the shared AssessmentLanding component to the API for one assessment node in the course
// player. AssessmentLanding itself is pure UI in the assessments domain; the fetching, the routing
// and the "did they just pass it" refresh live here, in the app layer, per this repo's rule that
// side effects belong to orchestrators rather than domain components.

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
  AssessmentLanding,
  getAssessmentLanding,
  type AssessmentLandingResponse,
} from '@/domains/assessments';
import type { AssessmentNodeResponse } from '@/shared/types/api.types';
import { examRoutes, courseRoutes } from '@/shared/routes/content.routes';
import { IdentityCapture } from '@/apps/learner/components/exams/IdentityCapture';

interface AssessmentLandingPaneProps {
  assessment: AssessmentNodeResponse;
  courseId?: string;
  /** Called when a previously-unpassed assessment now shows a pass, so the progress bar catches up. */
  onPassed?: () => void;
  /** Navigate to next item in course curriculum. */
  onNextItem?: () => void;
  /** Open feedback / report issue modal. */
  onReportIssue?: () => void;
  /** When true, runs in author preview mode with ephemeral session attempts and zero DB writes. */
  isPreview?: boolean;
}

export function AssessmentLandingPane({
  assessment,
  courseId,
  onPassed,
  onNextItem,
  onReportIssue,
  isPreview = false,
}: AssessmentLandingPaneProps) {
  const router = useRouter();
  const [landing, setLanding] = useState<AssessmentLandingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    getAssessmentLanding(assessment.examId, {
      planId: assessment.planId,
      placementId: assessment.placementId,
    })
      .then((data) => {
        setLanding(data);
        setError(null);
        if (data.history.some((h) => h.passed)) {
          onPassed?.();
        }
      })
      .catch((err) => setError(err?.message ?? 'Could not load this assessment.'));
    // onPassed is a fresh closure each render; depending on it would refetch on every parent render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assessment.examId, assessment.planId, assessment.placementId]);

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
    if (courseId) params.set('returnTo', courseRoutes.lesson(courseId, assessment.placementId));
    if (isPreview) params.set('preview', 'true');
    const query = params.toString();
    router.push(`${examRoutes.attempt(assessment.examId)}${query ? `?${query}` : ''}`);
  };

  if (error) {
    return (
      <div className="rounded-lg border border-slate-200/80 bg-surface/95 px-6 py-12 text-center">
        <p className="text-[14px] font-semibold text-rose-600 dark:text-rose-400">{error}</p>
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
    <div className="rounded-lg border border-slate-200/80 bg-surface/95 px-5 py-7 shadow-[0_8px_28px_rgba(20,20,43,0.05)] sm:px-8 sm:py-9 md:px-12 md:py-11">
      <AssessmentLanding
        landing={landing}
        onStart={handleStart}
        identitySlot={
          // An author preview writes nothing, so it has no identity step.
          !isPreview && landing.planId && landing.blockedReason === 'IDENTITY_REQUIRED' ? (
            <IdentityCapture
              examId={assessment.examId}
              planId={landing.planId}
              rejected={landing.identityStatus === 'REJECTED'}
              onSubmitted={load}
            />
          ) : undefined
        }
        onViewGradeCard={(gradeCardId) => router.push(examRoutes.gradeCard(gradeCardId))}
        onNextItem={onNextItem}
        onReportIssue={onReportIssue}
      />
    </div>
  );
}
