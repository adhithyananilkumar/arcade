'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { usePostComments, useAddComment } from '../api/forum.queries';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Send, MessageSquare, User, Loader2 } from 'lucide-react';
import { timeAgo } from '../utils/display';

interface CommentSectionProps {
  postId: string;
}

export function CommentSection({ postId }: CommentSectionProps) {
  const { user, status } = useAuthStore();
  const router = useRouter();
  const { data: comments, isLoading } = usePostComments(postId);
  const { mutate: addComment, isPending } = useAddComment(postId);

  const [content, setContent] = useState('');
  const isAuthenticated = status === 'authenticated' && !!user;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please sign in to comment on discussions!');
      router.push('/sign?returnTo=/forum');
      return;
    }
    if (!content.trim()) return;

    addComment(
      { content: content.trim() },
      {
        onSuccess: () => {
          setContent('');
        },
      }
    );
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-neutral-800 space-y-4 animate-in fade-in duration-200">
      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-3">
        <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-neutral-800 flex items-center justify-center text-slate-600 dark:text-neutral-300 font-semibold text-xs shrink-0">
          {isAuthenticated ? (user.username?.[0] || user.firstName?.[0] || 'U').toUpperCase() : <User className="w-4 h-4" />}
        </div>
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            placeholder={isAuthenticated ? 'Write a comment...' : 'Sign in to leave a comment...'}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="flex-1 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700 text-slate-800 dark:text-neutral-100 placeholder-slate-400 dark:placeholder-neutral-500 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
          />
          <button
            type="submit"
            disabled={isPending || !content.trim()}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-500 disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-sm shrink-0"
          >
            {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Reply
          </button>
        </div>
      </form>

      {/* Comment List */}
      <div className="space-y-3 pl-3 border-l-2 border-slate-100 dark:border-neutral-800/80">
        {isLoading ? (
          <div className="flex items-center justify-center py-4 text-slate-400 text-xs">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Loading discussions...
          </div>
        ) : comments && comments.length > 0 ? (
          comments.map((c) => (
            <div key={c.id} className="group p-3 rounded-xl bg-slate-50/50 dark:bg-neutral-800/40 hover:bg-slate-50 dark:hover:bg-neutral-800/80 transition-colors">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-xs text-slate-800 dark:text-neutral-200">
                    {c.authorUsername}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-neutral-500">
                    {timeAgo(c.createdAt)}
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-600 dark:text-neutral-300 leading-relaxed whitespace-pre-line">
                {c.content}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-slate-400 dark:text-neutral-500 text-xs flex flex-col items-center gap-1">
            <MessageSquare className="w-5 h-5 opacity-40" />
            No comments yet. Be the first to reply!
          </div>
        )}
      </div>
    </div>
  );
}
