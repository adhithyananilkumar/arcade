'use client';

// A main exam's overview page, reached from Explore > Exams, My Learning > Exams, or a course's
// certification card. It
// matches the course and event landing pages and composes ExamOverview with the three things only
// this page supplies: registration/payment (the shared enrolment checkout, on an EXAM resource),
// the identity-verification step, and a way to the tied content when its completion is still a
// prerequisite. Results are read on grade cards, which this page links to.
//
// Every decision — may they register, may they start, why not — comes from the landing response.

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import {
  ExamOverview,
  RetakePanel,
  getAssessmentLanding,
  openRetakeOffer,
  type AssessmentLandingResponse,
  type RetakeOffer,
} from '@/domains/assessments';
import { toast } from 'sonner';
import { EnrollmentButton } from '@/domains/enrollment';
import { courseRoutes, eventRoutes, examRoutes, openExamSitting } from '@/shared/routes/content.routes';
import { formatMoney } from '@/shared/utils/money';
import { IdentityCapture } from '@/apps/learner/components/exams/IdentityCapture';
import { goBackTo, safeReturnTo } from '@/infrastructure/state/navigationHistory';

export default function ExamPage() {
  const router = useRouter();
  const params = useParams();
  const search = useSearchParams();
  const examId = params.examId as string;
  const planId = search.get('planId');
  const returnTo = safeReturnTo(search.get('returnTo'));

  const [landing, setLanding] = useState<AssessmentLandingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  // The retake offer being paid for, once the candidate asked for one.
  const [retakeOffer, setRetakeOffer] = useState<RetakeOffer | null>(null);
  const [openingRetake, setOpeningRetake] = useState(false);

  const load = useCallback(() => {
    getAssessmentLanding(examId, { planId })
      .then((data) => {
        setLanding(data);
        setError(null);
      })
      .catch((err) => setError(err?.message ?? 'Could not load this exam.'));
  }, [examId, planId]);

  useEffect(() => {
    load();
  }, [load]);

  // Returning from checkout or an attempt lands back here; re-read so the state is current.
  useEffect(() => {
    const onVisible = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [load]);

  // A linked assessment (graded, practice or the final one) is sat inside its course or event, not
  // here: this is the catalogue page for certifications and standalone exams, with enrolment and
  // sharing that make no sense for a step of a course. Managers still see it, to check the terms.
  const insideContent =
    landing && !landing.hubListed && !landing.canManage && landing.tieType && landing.tiedContentId
      ? landing.tieType === 'EVENT'
        ? landing.placementId
          ? eventRoutes.assessment(landing.tiedContentId, landing.placementId)
          : eventRoutes.overview(landing.tiedContentId)
        : landing.placementId
          ? courseRoutes.lesson(landing.tiedContentId, landing.placementId)
          : courseRoutes.overview(landing.tiedContentId)
      : null;
  useEffect(() => {
    if (insideContent) router.replace(insideContent);
  }, [insideContent, router]);

  if (error || !landing || insideContent) {
    return (
      <main className="arcade-wash theme-page-bg theme-wallpaper-frost flex min-h-screen items-center justify-center px-4">
        {error ? (
          <p className="text-center text-[14px] font-semibold text-rose-600 dark:text-rose-400">{error}</p>
        ) : (
          <Loader2 className="animate-spin text-slate-400" size={26} />
        )}
      </main>
    );
  }

  const start = () => {
    const q = new URLSearchParams();
    if (landing.planId) q.set('planId', landing.planId);
    // Back here after the attempt, still knowing where this page itself goes back to.
    const back = new URLSearchParams();
    if (landing.planId) back.set('planId', landing.planId);
    if (returnTo) back.set('returnTo', returnTo);
    q.set('returnTo', `${examRoutes.landing(examId)}${back.toString() ? `?${back.toString()}` : ''}`);
    // The sitting runs in its own tab; this page re-reads when the learner comes back to it.
    openExamSitting(examId, `${examRoutes.attempt(examId)}?${q.toString()}`);
  };

  const openPrerequisite = landing.prerequisite
    ? () =>
        router.push(
          landing.prerequisite!.contentType === 'EVENT'
            ? eventRoutes.landing(landing.prerequisite!.contentId)
            : courseRoutes.landing(landing.prerequisite!.contentId)
        )
    : undefined;

  const registration = (
    <EnrollmentButton
      resourceType="EXAM"
      resourceId={examId}
      initialState={landing.registered ? 'ENROLLED' : 'NOT_ENROLLED'}
      onStateChange={(state) => state === 'ENROLLED' && load()}
      onGoToResource={load}
    />
  );

  const getRetake = async () => {
    if (!landing.planId) return;
    setOpeningRetake(true);
    try {
      const offer = await openRetakeOffer(examId, landing.planId);
      if (offer.granted) {
        toast.success('Your retake is ready');
        setRetakeOffer(null);
        load();
      } else {
        setRetakeOffer(offer);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not prepare a retake');
    } finally {
      setOpeningRetake(false);
    }
  };

  // Paying goes through the shared enrolment checkout on the server's offer (EXAM_RETAKE), so the
  // price, receipts and refunds are the platform's own.
  const retake = landing.retake ? (
    <RetakePanel
      quote={landing.retake}
      onGetRetake={getRetake}
      busy={openingRetake}
      checkoutSlot={
        retakeOffer ? (
          <EnrollmentButton
            resourceType="EXAM_RETAKE"
            resourceId={retakeOffer.offerId}
            initialState="NOT_ENROLLED"
            idleLabel={`Pay ${formatMoney(retakeOffer.amountMinor, retakeOffer.currency)} for a retake`}
            onStateChange={(state) => {
              if (state === 'ENROLLED') {
                toast.success('Retake purchased — you can sit the exam again');
                setRetakeOffer(null);
                load();
              }
            }}
            onGoToResource={load}
          />
        ) : undefined
      }
    />
  ) : undefined;

  const identity =
    landing.planId && landing.blockedReason === 'IDENTITY_REQUIRED' ? (
      <IdentityCapture
        examId={examId}
        planId={landing.planId}
        rejected={landing.identityStatus === 'REJECTED'}
        onSubmitted={load}
      />
    ) : undefined;

  // Back to where the learner came from: a course passes returnTo; a linked assessment belongs to its
  // course or event; a certification or standalone exam to the Exams catalogue.
  const tiedHome =
    landing.tieType && landing.tiedContentId
      ? landing.tieType === 'EVENT'
        ? eventRoutes.overview(landing.tiedContentId)
        : courseRoutes.overview(landing.tiedContentId)
      : null;
  const backHref = returnTo ?? (tiedHome && !landing.hubListed ? tiedHome : examRoutes.catalogue);
  const backLabel =
    backHref === examRoutes.catalogue
      ? 'Back to Exams'
      : landing.tiedContentTitle
        ? `Back to ${landing.tiedContentTitle}`
        : 'Back';

  return (
    <ExamOverview
      landing={landing}
      hubHref={examRoutes.catalogue}
      back={{ label: backLabel, onClick: () => goBackTo(router, backHref) }}
      onStart={start}
      onSelectPlan={(id) =>
        router.replace(`${examRoutes.landing(examId)}?planId=${id}${returnTo ? `&returnTo=${encodeURIComponent(returnTo)}` : ''}`)
      }
      onViewGradeCard={(id) => router.push(examRoutes.gradeCard(id))}
      registrationSlot={registration}
      identitySlot={identity}
      retakeSlot={retake}
      feeLabel={landing.feeMinor > 0 ? formatMoney(landing.feeMinor, landing.currency ?? 'INR') : null}
      onOpenPrerequisite={openPrerequisite}
    />
  );
}
