'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';
import { TeamBoardPage } from '@/apps/learner/components/hackathon/TeamBoardPage';

/** `/events/{slug}/team` — the hackathon team board. `?join=CODE` arrives from an invite link. */
export default function EventTeamBoardRoute() {
  const params = useParams<{ slug: string }>();
  return (
    <Suspense>
      <TeamBoardPage slug={params.slug as string} />
    </Suspense>
  );
}
