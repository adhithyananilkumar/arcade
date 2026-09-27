'use client';

// A main exam's page, reached from the Exams hub (or a course's certification card). Composes the
// shared AssessmentLanding with the three things only this page supplies: registration/payment
// (the shared enrolment checkout, on an EXAM resource), the identity-verification step, and a way
// to the tied content when its completion is still a prerequisite.
//
// Every decision — may they register, may they start, why not — comes from the landing response.

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import {
  AssessmentLanding,
  getAssessmentLanding,
  planKindLabel,
  type AssessmentLandingResponse,
} from '@/domains/assessments';
import { EnrollmentButton } from '@/domains/enrollment';
import { courseRoutes, eventRoutes, examRoutes } from '@/shared/routes/content.routes';
import { formatMoney } from '@/shared/utils/money';
import { IdentityCapture } from '@/apps/learner/components/exams/IdentityCapture';

const pageBg = {
  background: 'linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 32%, #FFFFFF 70%)',
};

export default function ExamPage() {
  const router = useRouter();
  const params = useParams();
  const search = useSearchParams();
  const examId = params.examId as string;
  const planId = search.get('planId');

  const [landing, setLanding] = useState<AssessmentLandingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  if (error) {
    return (
      <Shell>
        <p className="py-24 text-center text-[14px] font-semibold text-rose-600">{error}</p>
      </Shell>
    );
  }
  if (!landing) {
    return (
      <Shell>
        <div className="flex justify-center py-24">
          <Loader2 className="animate-spin text-slate-400" size={26} />
        </div>
      </Shell>
    );
  }

  const start = () => {
    const q = new URLSearchParams();
    if (landing.planId) q.set('planId', landing.planId);
    q.set('returnTo', `${examRoutes.landing(examId)}${landing.planId ? `?planId=${landing.planId}` : ''}`);
    router.push(`${examRoutes.attempt(examId)}?${q.toString()}`);
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
    <div className="max-w-sm space-y-2">
      {landing.feeMinor > 0 && (
        <p className="text-[13px] font-semibold text-[#14142b]">
          Registration fee {formatMoney(landing.feeMinor, landing.currency ?? 'INR')}
        </p>
      )}
      <EnrollmentButton
        resourceType="EXAM"
        resourceId={examId}
        initialState={landing.registered ? 'ENROLLED' : 'NOT_ENROLLED'}
        onStateChange={(state) => state === 'ENROLLED' && load()}
        onGoToResource={load}
      />
    </div>
  );

  const identity =
    landing.planId && landing.blockedReason === 'IDENTITY_REQUIRED' ? (
      <IdentityCapture
        examId={examId}
        planId={landing.planId}
        rejected={landing.identityStatus === 'REJECTED'}
        onSubmitted={load}
      />
    ) : undefined;

  return (
    <Shell>
      {landing.plans.length > 1 && (
        <nav className="mx-auto mb-6 flex w-full max-w-3xl flex-wrap gap-2">
          {landing.plans.map((p) => (
            <button
              key={p.planId}
              type="button"
              onClick={() => router.replace(`${examRoutes.landing(examId)}?planId=${p.planId}`)}
              className={`cursor-pointer rounded-full border px-4 py-1.5 text-[12px] font-semibold transition-colors ${
                p.planId === landing.planId
                  ? 'border-[#14142b] bg-[#14142b] text-white'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {p.name}
              <span className="ml-1.5 opacity-60">{planKindLabel(p.planType, true)}</span>
            </button>
          ))}
        </nav>
      )}

      <AssessmentLanding
        landing={landing}
        onStart={start}
        registrationSlot={registration}
        identitySlot={identity}
        onOpenPrerequisite={openPrerequisite}
        onViewGradeCard={(id) => router.push(examRoutes.gradeCard(id))}
      />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen pb-32" style={pageBg}>
      <div className="mx-auto w-full max-w-4xl px-4 pt-28 sm:px-6 md:pt-32">
        <Link
          href="/exams"
          className="mb-6 inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 transition-colors hover:text-[#14142b]"
        >
          <ArrowLeft size={14} /> Exams
        </Link>
        {children}
      </div>
    </main>
  );
}
