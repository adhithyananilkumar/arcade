'use client';

import { useParams } from 'next/navigation';
import { NotesWorkspacePage } from '@/apps/learner/components/content-overview/NotesWorkspacePage';
import { useEventOverviewModel } from '@/apps/learner/components/content-overview/adapters/useEventOverviewModel';

/** `/events/{slug}/notes` — every note this learner wrote for this event. */
export default function EventNotesRoute() {
  const params = useParams<{ slug: string }>();
  const model = useEventOverviewModel(params.slug as string);
  return <NotesWorkspacePage model={model} />;
}
