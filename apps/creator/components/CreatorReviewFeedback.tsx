'use client';

import { useState, useEffect } from 'react';
import { api } from '@/infrastructure/http/api';
import { ReviewCommentResponse } from '@/shared/api/review.api';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';

export function CreatorReviewFeedback({ courseId, onNavigate }: { courseId: string, onNavigate: (type: string, id: string) => void }) {
  const [comments, setComments] = useState<ReviewCommentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFeedback() {
      try {
        const data = await api.get<ReviewCommentResponse[]>(`/api/courses/${courseId}/review-feedback`);
        setComments(data);
      } catch (e) {
        console.error("Failed to load review feedback", e);
      } finally {
        setIsLoading(false);
      }
    }
    loadFeedback();
  }, [courseId]);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading feedback...</div>;
  }

  if (comments.length === 0) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center pt-24">
        <MessageSquare size={32} className="text-gray-300 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No review feedback yet</h3>
        <p className="text-gray-500 max-w-md mt-2">
          When reviewers leave feedback on your course, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 pb-40">
      <h2 className="text-2xl font-bold text-gray-900 mb-8">Reviewer Feedback</h2>
      
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start gap-4">
            {comment.authorAvatarUrl ? (
              <img src={comment.authorAvatarUrl} alt={comment.authorName} className="w-10 h-10 rounded-full flex-shrink-0 bg-slate-100" />
            ) : (
              <div className="w-10 h-10 rounded-full flex-shrink-0 bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                {comment.authorName.charAt(0)}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-900 text-sm">{comment.authorName}</span>
                <span className="text-xs text-gray-500">{formatDistanceToNow(new Date(comment.createdAt))} ago</span>
              </div>
              
              <p className="text-gray-700 text-sm whitespace-pre-wrap mb-3">{comment.content}</p>
              
              <div className="flex items-center justify-between">
                {comment.resolved ? (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                    <CheckCircle2 size={12} /> Resolved
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded">
                    Needs attention
                  </span>
                )}
                
                {comment.targetType && comment.targetId && (
                  <button 
                    onClick={() => onNavigate(comment.targetType!, comment.targetId!)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    Go to {comment.targetType.toLowerCase()} <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
