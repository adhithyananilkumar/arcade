"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { CommentResponse } from "@/types/api";
import { MessageSquare, Send } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

interface LessonReviewFeedbackProps {
  lessonId: string;
  className?: string;
}

export function LessonReviewFeedback({ lessonId, className = "" }: LessonReviewFeedbackProps) {
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .get<CommentResponse[]>(`/api/lessons/${lessonId}/comments`)
      .then(setComments)
      .catch((err) => {
        // If it's a 403 Forbidden, they probably aren't the author or a reviewer.
        // We can just hide the UI or show a soft error.
        setError("You do not have access to view reviewer feedback.");
      })
      .finally(() => setLoading(false));
  }, [lessonId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      const added = await api.post<CommentResponse>(
        `/api/lessons/${lessonId}/comments`,
        { content: newComment.trim() }
      );
      setComments((prev) => [...prev, added]);
      setNewComment("");
    } catch (err) {
      alert("Failed to post feedback.");
    }
  };

  if (loading) return null; // Or a subtle spinner

  if (error) {
    // If forbidden, we don't even render the comment box. This is appropriate
    // for standard users viewing a course (if we ever allow that), they just
    // won't see the internal reviewer feedback section at all.
    return null;
  }

  return (
    <div className={`flex flex-col bg-white overflow-hidden ${className}`}>
      <div className="bg-gray-50 px-5 py-4 border-b border-gray-200 flex items-center gap-2">
        <MessageSquare size={18} className="text-gray-500" />
        <h3 className="font-semibold text-gray-800 text-sm">Reviewer Feedback</h3>
        <span className="ml-auto text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full font-medium">
          Internal
        </span>
      </div>

      <div className="flex-1 min-h-0 p-5 overflow-y-auto flex flex-col gap-4">
        {comments.length === 0 ? (
          <p className="text-center text-xs text-gray-400 py-4">
            No feedback on this lesson yet.
          </p>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className={`flex flex-col gap-1 max-w-[85%] ${
                c.authorId === user?.id ? "self-end items-end" : "self-start items-start"
              }`}
            >
              <div className="flex items-center gap-1.5 px-1">
                {c.authorId !== user?.id && (
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                    {c.authorName}
                  </span>
                )}
                <span className="text-[10px] text-gray-400">
                  {new Date(c.createdAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </span>
                {c.authorId === user?.id && (
                  <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                    {c.authorName}
                  </span>
                )}
              </div>
              <div
                className={`px-4 py-2.5 rounded-2xl text-sm ${
                  c.authorId === user?.id
                    ? "bg-indigo-600 text-white rounded-tr-sm"
                    : "bg-gray-100 text-gray-800 rounded-tl-sm"
                }`}
              >
                {c.content}
              </div>
            </div>
          ))
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center gap-3"
      >
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write internal feedback..."
          className="flex-1 rounded-full border-gray-300 bg-white px-4 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          disabled={!newComment.trim()}
          className="flex-shrink-0 flex items-center justify-center rounded-full bg-indigo-600 p-2 text-white shadow-sm hover:bg-indigo-700 disabled:bg-indigo-300 transition-colors"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
