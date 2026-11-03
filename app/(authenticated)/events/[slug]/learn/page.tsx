'use client';

import { Suspense, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { ContentOverviewPage } from '@/apps/learner/components/content-overview/ContentOverviewPage';
import { useEventOverviewModel } from '@/apps/learner/components/content-overview/adapters/useEventOverviewModel';
import { TeamBoardService } from '@/domains/events';
import { eventRoutes } from '@/shared/routes/content.routes';

/**
 * `/events/{slug}/learn` — the event overview hub.
 *
 * <p>Replaces the four placeholder cards that stood here with the same hub courses use, fed by the
 * event adapter: the real session schedule, join links for entitled learners, and their notes.
 *
 * <p>A hackathon's home is its team board, not a course-style hub, so an event with a live team
 * competition sends learners there; `?view=sessions` (the board's "Sessions & resources" link)
 * keeps them here.
 */
function EventOverviewRouteInner() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params.slug as string;
  const model = useEventOverviewModel(slug);
  const wantsSessions = searchParams?.get('view') === 'sessions';

  const competition = useQuery({
    queryKey: ['competition', model.contentId, 'brief'],
    queryFn: () => TeamBoardService.competition(model.contentId),
    enabled: Boolean(model.contentId) && !wantsSessions,
    retry: false,
  });

  useEffect(() => {
    if (competition.data?.settings.enabled) router.replace(eventRoutes.team(slug));
  }, [competition.data, router, slug]);

  return <ContentOverviewPage model={model} />;
}

export default function EventOverviewRoute() {
  return (
    <Suspense>
      <EventOverviewRouteInner />
    </Suspense>
  );
}
