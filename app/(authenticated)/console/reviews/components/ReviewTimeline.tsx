'use client';

import { useReviewWorkspace } from './ReviewWorkspaceProvider';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Clock, FileText } from 'lucide-react';

export function ReviewTimeline() {
  const { workspace } = useReviewWorkspace();

  if (!workspace) return null;

  const { timeline, comments } = workspace;

  // Combine timeline events and comments, sort chronologically
  const items: any[] = [
    ...timeline.map(t => ({ type: 'round', date: new Date(t.submittedAt), data: t })),
    ...comments.map(c => ({ type: 'comment', date: new Date(c.createdAt), data: c }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()); // newest first

  return (
    <div className="p-6">
      <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Clock size={16} className="text-gray-400" />
        Activity Feed
      </h3>
      
      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
        {items.map((item, i) => (
          <div key={i} className="relative flex items-start gap-4">
            <div className="absolute left-0 mt-1.5 w-10 flex justify-center z-10 bg-gray-50">
              {item.type === 'round' ? (
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center border-4 border-gray-50">
                  <FileText size={14} className="text-indigo-600" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border-4 border-gray-50">
                  <MessageSquare size={14} className="text-blue-600" />
                </div>
              )}
            </div>
            
            <div className="ml-12 flex-1">
              {item.type === 'round' ? (
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-gray-900 text-sm">
                      Review #{item.data.reviewNumber} Submitted
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(item.date)} ago
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Version v{item.data.versionNumber} was submitted for platform governance.
                  </p>
                  {item.data.decision && (
                    <div className={`mt-3 text-sm font-medium p-2 rounded-lg ${item.data.decision === 'APPROVED' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
                      Resolution: {item.data.decision.replace('_', ' ')}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900 text-sm">
                      {item.data.authorName}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(item.date)} ago
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {item.data.content}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
