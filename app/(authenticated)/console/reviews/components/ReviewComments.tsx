'use client';

import { useState } from 'react';
import { useReviewWorkspace } from './ReviewWorkspaceProvider';
import { ReviewApi } from '@/shared/api/review.api';
import { MessageSquare, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export function ReviewComments() {
  const { workspace, refresh } = useReviewWorkspace();
  const [commentContent, setCommentContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!workspace) return null;

  const comments = workspace.comments || [];

  const handleSubmit = async () => {
    if (!commentContent.trim()) return;

    try {
      setIsSubmitting(true);
      await ReviewApi.addComment(workspace.reviewRound.id, commentContent);
      setCommentContent('');
      refresh();
    } catch (e) {
      console.error("Failed to post comment", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-b border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2">
        <MessageSquare size={16} className="text-gray-500" />
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
          Review Comments
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px]">
        {comments.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No comments yet.</p>
        ) : (
          comments.map(comment => (
            <div key={comment.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="flex justify-between items-start mb-1">
                <span className="text-sm font-semibold text-gray-900">{comment.authorName}</span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex flex-col gap-2">
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Add a comment..."
            className="w-full text-sm rounded-lg border-gray-300 p-2 min-h-[80px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
            disabled={isSubmitting || workspace.reviewRound.status !== 'PENDING'}
          />
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !commentContent.trim() || workspace.reviewRound.status !== 'PENDING'}
            className="self-end flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50"
          >
            <Send size={14} />
            Post
          </button>
        </div>
      </div>
    </div>
  );
}
