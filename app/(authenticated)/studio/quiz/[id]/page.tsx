// app/(authenticated)/studio/quiz/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { api } from "@/infrastructure/http/api";
import { StandaloneQuizEditor } from "@/domains/assessments";
import { toast } from "sonner";
import { use } from "react";

interface QuizMetadata {
  id: string;
  title: string;
  passingScore: number;
}

export default function StandaloneQuizEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [quiz, setQuiz] = useState<QuizMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingTitle, setSavingTitle] = useState(false);

  useEffect(() => {
    let active = true;
    api
      .get<QuizMetadata>(`/api/quizzes/${id}`)
      .then((data) => {
        if (active) setQuiz(data);
      })
      .catch((err) => {
        if (active) setError("Failed to load quiz.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const handleTitleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const newTitle = e.target.value.trim();
    if (!newTitle || !quiz || newTitle === quiz.title) return;

    setSavingTitle(true);
    try {
      const updated = await api.patch<QuizMetadata>(`/api/quizzes/${id}`, {
        title: newTitle,
      });
      setQuiz(updated);
      toast.success("Title updated");
    } catch {
      toast.error("Failed to update title");
    } finally {
      setSavingTitle(false);
    }
  };

  const handlePassingScoreBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const newScore = parseInt(e.target.value, 10);
    if (isNaN(newScore) || !quiz || newScore === quiz.passingScore) return;

    setSavingTitle(true);
    try {
      const updated = await api.patch<QuizMetadata>(`/api/quizzes/${id}`, {
        passingScore: newScore,
      });
      setQuiz(updated);
      toast.success("Passing score updated");
    } catch {
      toast.error("Failed to update passing score");
    } finally {
      setSavingTitle(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC]">
        <Loader2 className="animate-spin text-slate-400" size={24} />
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC]">
        <p className="text-slate-500">{error || "Quiz not found"}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm font-semibold text-slate-500 transition-colors hover:text-[#14142b]"
            >
              <ArrowLeft size={16} />
              Back
            </Link>
            <div className="h-6 w-px bg-slate-200" />
            <div className="relative flex items-center gap-4">
              <input
                type="text"
                defaultValue={quiz.title}
                onBlur={handleTitleBlur}
                className="w-80 border-none bg-transparent px-2 text-lg font-bold text-[#14142b] outline-none placeholder:text-slate-300 focus:ring-2 focus:ring-[#14142b]/20 rounded-md"
              />
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>Passing Marks:</span>
                <input
                  type="number"
                  min="0"
                  defaultValue={quiz.passingScore ?? 0}
                  onBlur={handlePassingScoreBlur}
                  className="w-16 rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-[#14142b] outline-none focus:ring-2 focus:ring-[#14142b]/20"
                />
              </div>
              {savingTitle && (
                <Loader2 className="animate-spin text-slate-400" size={14} />
              )}
            </div>
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-500">
              <Save size={12} />
              Autosaved
            </span>
          </div>
        </div>
      </header>

      {/* Editor Content */}
      <main className="mx-auto max-w-3xl px-6 pt-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-[#14142b]">Question Bank</h1>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            Add questions to this quiz. Changes are saved automatically. To embed this quiz in a course, lesson, or article, use the <strong>/quiz</strong> command in the content editor and select this quiz.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <StandaloneQuizEditor quizId={id} />
        </div>
      </main>
    </div>
  );
}
