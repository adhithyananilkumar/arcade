// app/(authenticated)/studio/course/[courseId]/question-bank/page.tsx
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getOrCreateCourseQuestionBank, QuestionBankEditor, type QuestionBankSummary } from "@/domains/assessments";

export default function CourseQuestionBankPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const router = useRouter();
  const [bank, setBank] = useState<QuestionBankSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getOrCreateCourseQuestionBank(courseId)
      .then((data) => {
        if (active) setBank(data);
      })
      .catch(() => {
        if (active) setError("Failed to load the question bank for this course.");
      });
    return () => {
      active = false;
    };
  }, [courseId]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC]">
        <p className="text-slate-500">{error}</p>
      </div>
    );
  }

  if (!bank) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F9FC]">
        <Loader2 className="animate-spin text-slate-400" size={24} />
      </div>
    );
  }

  return (
    <div className="relative h-screen overflow-hidden bg-[#F7F9FC]">
      {/* ── Floating header — same visual language as the course editor's ── */}
      <header className="absolute inset-x-0 top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto grid max-w-[1200px] grid-cols-[1fr_auto_1fr] items-center gap-2 px-4 py-2 sm:px-6">
          <div className="justify-self-start">
            <button
              type="button"
              onClick={() => router.push(`/studio/course/${courseId}/edit`)}
              title="Back to course"
              className="flex flex-shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Course</span>
            </button>
          </div>

          <div className="min-w-0 justify-self-center">
            <span className="block max-w-[60vw] truncate px-1.5 py-1 text-center text-sm font-bold tracking-tight text-[#14142b] sm:max-w-md">
              {bank.title}
            </span>
          </div>

          <div className="justify-self-end" />
        </div>
      </header>

      <div className="relative h-full">
        <QuestionBankEditor bankId={bank.id} className="absolute inset-0" />
      </div>
    </div>
  );
}
