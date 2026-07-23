'use client';

import { useReviewWorkspace } from './ReviewWorkspaceProvider';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle } from 'lucide-react';

export function ReviewVersionBanner() {
  const { workspace } = useReviewWorkspace();

  if (!workspace) return null;

  const { reviewRound } = workspace;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-6 py-3 flex items-start gap-3 shrink-0">
      <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-semibold text-amber-800">
          Reviewing Version {reviewRound.versionNumber} — Submitted {formatDistanceToNow(new Date(reviewRound.submittedAt))} ago
        </p>
        <p className="text-xs text-amber-700/80">
          The creator may continue editing their draft. This review applies ONLY to Version {reviewRound.versionNumber}. Later edits are NOT included in this review.
        </p>
      </div>
    </div>
  );
}
