'use client';

import { useParams } from 'next/navigation';
import { NotesWorkspacePage } from '@/apps/learner/components/content-overview/NotesWorkspacePage';
import { useCourseOverviewModel } from '@/apps/learner/components/content-overview/adapters/useCourseOverviewModel';

/** `/courses/{id}/notes` — every note this learner wrote for this course. */
export default function CourseNotesRoute() {
  const params = useParams<{ id: string }>();
  const model = useCourseOverviewModel(params.id as string);
  return <NotesWorkspacePage model={model} />;
}
