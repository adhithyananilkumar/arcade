'use client';

import { useParams } from 'next/navigation';
import { JudgeWorkspacePage } from '@/apps/learner/components/hackathon/JudgeWorkspacePage';

/** `/events/{slug}/judge` — the judge's scoring workspace. */
export default function EventJudgeRoute() {
  const params = useParams<{ slug: string }>();
  return <JudgeWorkspacePage slug={params.slug as string} />;
}
