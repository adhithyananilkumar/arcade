"use client";

import { useEffect, useState } from "react";
import { X, Loader2, FileQuestion, Plus } from "lucide-react";
import { api } from "@/infrastructure/http/api";
import type { QuizResponse } from "../types";
import { useRouter } from "next/navigation";

interface QuizSelectorModalProps {
  onSelect: (quizId: string) => void;
  onClose: () => void;
  channelId?: string;
}

export function QuizSelectorModal({ onSelect, onClose, channelId }: QuizSelectorModalProps) {
  const [quizzes, setQuizzes] = useState<QuizResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let active = true;
    const fetchQuizzes = async () => {
      try {
        const url = channelId ? `/api/quizzes?channelId=${channelId}` : `/api/quizzes`;
        const data = await api.get<QuizResponse[]>(url);
        if (active) {
          setQuizzes(data);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError("Failed to load quizzes");
          setLoading(false);
        }
      }
    };
    fetchQuizzes();
    return () => {
      active = false;
    };
  }, [channelId]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#14142b]/45 backdrop-blur-md" onClick={onClose} />
      <div className="relative flex h-[500px] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_24px_64px_rgba(20,20,43,0.22)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50">
              <FileQuestion size={20} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Select a Quiz</h2>
              <p className="text-xs text-slate-500">Choose a quiz to embed into this document.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="animate-spin text-slate-400" size={24} />
            </div>
          ) : error ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          ) : quizzes.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
                <FileQuestion size={24} className="text-slate-300" />
              </div>
              <h3 className="text-sm font-semibold text-slate-900">No Quizzes Found</h3>
              <p className="mt-1 max-w-[250px] text-xs text-slate-500">
                You haven&apos;t created any quizzes yet. Head to the Studio dashboard to create one.
              </p>
              <button
                onClick={() => router.push("/studio/content")}
                className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                <Plus size={16} />
                Create Quiz
              </button>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {quizzes.map((quiz) => (
                <button
                  key={quiz.id}
                  onClick={() => onSelect(quiz.id)}
                  className="group flex flex-col items-start gap-1 rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-500/5"
                >
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600">
                    {quiz.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-medium text-slate-500">
                      ID: {quiz.id.substring(0, 8)}...
                    </span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span className="text-[11px] font-medium text-slate-500">
                      Pass: {quiz.passingScore}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
