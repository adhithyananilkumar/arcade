"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { listAttemptsForExam, type ExamAttemptSummaryResponse } from "@/domains/assessments";

/**
 * Who has sat this exam and how they did.
 *
 * <p>A tab alongside plans, pools, preview and settings rather than a permanently-rendered section
 * below them: it is the operational view of the exam, consulted deliberately, and rendering it
 * always meant every visit to the overview fetched every attempt whether or not anyone looked.
 */

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

function StatusBadge({ attempt }: { attempt: ExamAttemptSummaryResponse }) {
  if (attempt.passed === true) {
    return (
      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
        Passed
      </span>
    );
  }
  if (attempt.passed === false) {
    return (
      <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-bold text-rose-700">
        Failed
      </span>
    );
  }
  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-500">
      {attempt.status === "IN_PROGRESS" ? "In progress" : attempt.status}
    </span>
  );
}

export function ExamAttemptsWorkspace({ examId }: { examId: string }) {
  const [attempts, setAttempts] = useState<ExamAttemptSummaryResponse[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    listAttemptsForExam(examId)
      .then(setAttempts)
      .catch(() => setError(true));
  }, [examId]);

  if (error) {
    return <p className="text-sm text-rose-600">Failed to load attempts.</p>;
  }

  if (attempts === null) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-slate-400" size={20} />
      </div>
    );
  }

  if (attempts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
        <p className="text-sm font-semibold text-[#14142b]">No attempts yet</p>
        <p className="mt-1 text-xs text-slate-500">Results appear here once a learner submits.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wide text-slate-400">
            <th className="px-4 py-3">Learner</th>
            <th className="px-4 py-3">Score</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Submitted</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {attempts.map((a) => (
            <tr key={a.attemptId}>
              <td className="px-4 py-3 font-semibold text-[#14142b]">{a.userName}</td>
              <td className="px-4 py-3 text-slate-600">
                {a.percentage !== null ? `${a.percentage.toFixed(0)}%` : "—"}
              </td>
              <td className="px-4 py-3">
                <StatusBadge attempt={a} />
              </td>
              <td className="px-4 py-3 text-slate-500">{formatDate(a.submittedAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
