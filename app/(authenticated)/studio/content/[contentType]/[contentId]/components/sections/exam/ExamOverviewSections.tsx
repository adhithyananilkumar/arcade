"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import type { ExamResponse } from "@/domains/assessments";
import { ExamManagementSections } from "@/apps/creator/studio/workspaces/exam/management/ExamManagementSections";
import { editorHref } from "../../../lib/contentTypeRouting";

/**
 * The exam's Content Overview body.
 *
 * <p>Everything about how this exam is configured, offered, previewed and monitored lives here —
 * plans, pools, settings, preview, attempts — each behind its own tab. Writing the questions
 * themselves happens in Studio, the same way a course's lessons do.
 *
 * <p>That division is the point: an editor authors content, and the workspace around it configures
 * and operates that content. Splitting an exam any other way is what produced two front doors into
 * the same exam.
 */
export function ExamOverviewSections({
  exam,
  onExamChange,
}: {
  exam: ExamResponse;
  onExamChange: (exam: ExamResponse) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4">
        <div>
          <h3 className="text-sm font-black tracking-tight text-slate-900">Questions</h3>
          <p className="mt-0.5 text-xs font-medium text-slate-500">
            Write and organise this exam&apos;s question bank in Studio. Plans below draw from it.
          </p>
        </div>
        <Link
          href={editorHref("exam", exam.id)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-extrabold text-white shadow-xs transition-all duration-200 hover:bg-blue-700 active:scale-[0.98] cursor-pointer"
        >
          <Pencil size={15} /> Edit Question Bank
        </Link>
      </div>

      <ExamManagementSections exam={exam} onExamChange={onExamChange} />
    </div>
  );
}
