'use client';

import { useParams } from 'next/navigation';
import { ReviewWorkspaceProvider, useReviewWorkspace } from '../components/ReviewWorkspaceProvider';
import { ReviewHeader } from '../components/ReviewHeader';
import { ReviewSidebar } from '../components/ReviewSidebar';
import { ReviewContent } from '../components/ReviewContent';
import { ReviewDecisionPanel } from '../components/ReviewDecisionPanel';
import { ReviewTimeline } from '../components/ReviewTimeline';
import { ReviewComments } from '../components/ReviewComments';
import { ReviewVersionBanner } from '../components/ReviewVersionBanner';

function WorkspaceLayout() {
  const { workspace, isLoading, error } = useReviewWorkspace();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-8 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin mb-4"></div>
          <span className="text-gray-500 font-medium">Loading workspace...</span>
        </div>
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-red-500">Failed to load workspace.</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-100">
      <ReviewHeader />
      <ReviewVersionBanner />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Pane: Sidebar */}
        <div className="w-64 border-r border-gray-200 bg-white flex-shrink-0 flex flex-col">
          <ReviewSidebar />
        </div>

        {/* Center Pane: Content Viewer */}
        <div className="flex-1 bg-white overflow-y-auto">
          <ReviewContent />
        </div>

        {/* Right Pane: Decision & Timeline */}
        <div className="w-80 border-l border-gray-200 bg-gray-50 flex-shrink-0 flex flex-col">
          <ReviewDecisionPanel />
          <ReviewComments />
          <div className="flex-1 overflow-y-auto border-t border-gray-200">
            <ReviewTimeline />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PlatformReviewWorkspacePage() {
  const params = useParams();
  const roundId = params.reviewRoundId as string;

  return (
    <ReviewWorkspaceProvider roundId={roundId}>
      <WorkspaceLayout />
    </ReviewWorkspaceProvider>
  );
}
