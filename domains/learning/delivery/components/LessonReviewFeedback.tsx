"use client";

import { useState } from "react";
import type { CommentResponse } from "@/shared/types/api.types";
import { MessageSquare, Send } from "lucide-react";

interface LessonReviewFeedbackProps {
  comments: CommentResponse[];
  loading: boolean;
  error: string | null;
  onAddComment: (content: string) => Promise<void>;
  currentUser: any;
  className?: string;
  hideHeader?: boolean;
}

export function LessonReviewFeedback({
  comments,
  loading,
  error,
  onAddComment,
  currentUser,
  className = "",
  hideHeader = false,
}: LessonReviewFeedbackProps) {
  const [newComment, setNewComment] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || sending) return;

    setSending(true);
    try {
      await onAddComment(newComment.trim());
      setNewComment("");
    } catch {
      // Error handled by orchestrator
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-white ${className}`}>
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-[#14142b]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-white px-6 text-center ${className}`}>
        <p className="text-[12px] font-medium text-rose-600">{error}</p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col overflow-hidden bg-white ${className}`}>
      {!hideHeader && (
        <div className="flex shrink-0 items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
          <MessageSquare size={15} className="text-[#14142b]" />
          <h3 className="text-[13px] font-bold text-[#14142b]">Reviewer feedback</h3>
          <span className="ml-auto rounded-full bg-slate-200/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
            Internal
          </span>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-4 py-4">
        {comments.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-slate-50">
              <MessageSquare size={20} className="text-slate-300" />
            </span>
            <p className="text-[13px] font-semibold text-[#14142b]">No feedback yet</p>
            <p className="max-w-[200px] text-[11px] leading-relaxed text-slate-400">
              Leave notes for the author — visible only to reviewers and creators.
            </p>
          </div>
        ) : (
          comments.map((c) => {
            const mine = c.authorId === currentUser?.id;
            return (
              <div
                key={c.id}
                className={`flex max-w-[88%] flex-col gap-1 ${
                  mine ? "items-end self-end" : "items-start self-start"
                }`}
              >
                <div className="flex items-center gap-1.5 px-1">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    {mine ? "You" : c.authorName}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(c.createdAt).toLocaleString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div
                  className={`px-3.5 py-2.5 text-[13px] leading-relaxed ${
                    mine
                      ? "rounded-2xl rounded-tr-md bg-[#14142b] text-white"
                      : "rounded-2xl rounded-tl-md border border-slate-100 bg-slate-50 text-[#14142b]"
                  }`}
                >
                  {c.content}
                </div>
              </div>
            );
          })
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex shrink-0 items-center gap-2 border-t border-slate-100 bg-slate-50/60 px-3 py-3"
      >
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write internal feedback…"
          className="min-w-0 flex-1 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-[13px] text-[#14142b] outline-none placeholder:text-slate-400 focus:border-[#14142b]/25 focus:ring-4 focus:ring-slate-200/60"
        />
        <button
          type="submit"
          disabled={!newComment.trim() || sending}
          className="grid size-10 shrink-0 place-items-center rounded-full bg-[#14142b] text-white shadow-[0_6px_14px_rgba(20,20,43,0.18)] transition-colors hover:bg-[#232735] disabled:opacity-40"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
