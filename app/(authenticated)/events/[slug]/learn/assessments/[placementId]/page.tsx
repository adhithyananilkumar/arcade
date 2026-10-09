'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { getEventBySlugOrId } from '@/domains/events';
import { getEventAssessments } from '@/domains/assessments';
import { eventRoutes } from '@/shared/routes/content.routes';
import { AssessmentLandingPane } from '@/app/(authenticated)/courses/[id]/learn/[lessonId]/AssessmentLandingPane';

/**
 * `/events/{slug}/learn/assessments/{placementId}` — one of an event's linked assessments, as its
 * learner meets it: inside the event, with the way back to it.
 *
 * <p>Linked assessments are not catalogue items. They used to be reachable only through the exam's
 * standalone page — the one with enrolment, sharing and "Retake Exam" — which belongs to
 * certification and standalone exams. The completion (final) assessment shows what must be done
 * first; the server decides and enforces it.
 */
export default function EventAssessmentRoute() {
  const params = useParams<{ slug: string; placementId: string }>();
  const slug = params.slug as string;
  const placementId = params.placementId as string;
  const router = useRouter();

  const eventQuery = useQuery({
    queryKey: ['events', 'detail', slug],
    queryFn: () => getEventBySlugOrId(slug),
    enabled: Boolean(slug),
  });
  const eventId = eventQuery.data?.id;

  const assessmentsQuery = useQuery({
    queryKey: ['events', 'assessments', eventId],
    queryFn: () => getEventAssessments(eventId!),
    enabled: Boolean(eventId),
    retry: false,
  });

  const node = assessmentsQuery.data?.find((a) => a.placementId === placementId);
  const loading = eventQuery.isLoading || assessmentsQuery.isLoading;

  return (
    <div className="min-h-screen w-full bg-surface theme-page-bg theme-wallpaper-frost text-slate-900">
      <div className="mx-auto w-full max-w-4xl px-4 pb-24 pt-28 sm:px-6 sm:pt-32 space-y-6">
        <Link
          href={eventRoutes.overview(slug)}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} /> {eventQuery.data?.title ?? 'Back to the event'}
        </Link>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-8 w-2/3 rounded-lg bg-slate-100" />
            <div className="h-48 rounded-2xl bg-slate-100" />
          </div>
        ) : !node ? (
          <div className="rounded-2xl border border-slate-200 bg-surface px-6 py-12 text-center">
            <p className="text-sm font-semibold text-ink">This assessment isn&apos;t available</p>
            <p className="mt-1 text-sm text-slate-500">
              Register for the event to sit its assessments, or it may have been removed.
            </p>
          </div>
        ) : (
          <AssessmentLandingPane
            key={node.placementId}
            assessment={node}
            returnTo={eventRoutes.assessment(slug, node.placementId)}
            onOpenPlacement={(id) => router.push(eventRoutes.assessment(slug, id))}
          />
        )}
      </div>
    </div>
  );
}
