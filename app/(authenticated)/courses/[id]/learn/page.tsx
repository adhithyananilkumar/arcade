'use client';

import { useParams } from 'next/navigation';
import { ContentOverviewPage } from '@/apps/learner/components/content-overview/ContentOverviewPage';
import { useCourseOverviewModel } from '@/apps/learner/components/content-overview/adapters/useCourseOverviewModel';

/**
 * `/courses/{id}/learn` — the course overview hub.
 *
 * <p>Where "Go to course" lands after enrolling, instead of dropping straight into the player.
 */
export default function CourseOverviewRoute() {
  const params = useParams<{ id: string }>();
  const model = useCourseOverviewModel(params.id as string);
  return <ContentOverviewPage model={model} />;
}
