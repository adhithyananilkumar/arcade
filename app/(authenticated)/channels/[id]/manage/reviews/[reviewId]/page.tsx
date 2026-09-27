'use client';

// One organization-stage review, inside the channel that owns it. The same review page the
// platform queue uses — only the way back differs.

import { useParams } from 'next/navigation';
import { ReviewDetail } from '@/apps/core/components/reviews/ReviewDetail';

export default function ChannelReviewPage() {
  const params = useParams();
  const channelId = params.id as string;
  return (
    <main className="min-h-screen px-4 pb-24 pt-28 sm:px-6">
      <ReviewDetail
        reviewId={params.reviewId as string}
        backHref={`/channels/${channelId}/manage?tab=REVIEWS`}
        backLabel="Back to channel reviews"
      />
    </main>
  );
}
