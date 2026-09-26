'use client';

import { useParams } from 'next/navigation';
import { ContentOverviewPage } from '@/apps/learner/components/content-overview/ContentOverviewPage';
import { useEventOverviewModel } from '@/apps/learner/components/content-overview/adapters/useEventOverviewModel';

/**
 * `/events/{slug}/learn` — the event overview hub.
 *
 * <p>Replaces the four placeholder cards that stood here with the same hub courses use, fed by the
 * event adapter: the real session schedule, join links for entitled learners, and their notes.
 */
export default function EventOverviewRoute() {
  const params = useParams<{ slug: string }>();
  const model = useEventOverviewModel(params.slug as string);
  return <ContentOverviewPage model={model} />;
}
