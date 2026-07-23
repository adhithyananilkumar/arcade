'use client';

import { useReviewWorkspace } from './ReviewWorkspaceProvider';
import { formatDistanceToNow } from 'date-fns';
import { Shield } from 'lucide-react';
import Link from 'next/link';

export function ReviewHeader() {
  const { workspace } = useReviewWorkspace();

  if (!workspace) return null;

  const { reviewRound, course } = workspace;

  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4 shadow-sm z-10 shrink-0">
      <div className="flex items-center gap-4">
        <Link 
          href="/console/reviews"
          className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          ← Back to Queue
        </Link>
        <div className="h-6 w-px bg-gray-300" />
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">
            {course.title}
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
            <span className="font-medium text-indigo-600">v{reviewRound.versionNumber}</span>
            <span>•</span>
            <span>Review #{reviewRound.reviewNumber}</span>
            <span>•</span>
            <span>Submitted by {reviewRound.submittedByName} {formatDistanceToNow(new Date(reviewRound.submittedAt))} ago</span>
            {reviewRound.snapshotCreatedAt && (
              <>
                <span>•</span>
                <span>Snapshot Created {formatDistanceToNow(new Date(reviewRound.snapshotCreatedAt))} ago</span>
              </>
            )}
            <span>•</span>
            <span className="font-medium">Status: {reviewRound.status === 'PENDING' ? 'Pending' : 'Completed'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100">
          <Shield size={16} />
          Platform Governance
        </div>
      </div>
    </header>
  );
}
