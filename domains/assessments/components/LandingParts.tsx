"use client";

// Small pieces shared by the two landing states (never attempted / attempted). Pure UI.

import { CheckCircle2, Lock } from "lucide-react";
import type { AttemptHistoryItem, LandingPrerequisite } from "../types";

/**
 * A certification's prerequisite: completing the course or event the exam is tied to. `met` and
 * `message` come from the server's prerequisite evaluation — the same one that gates starting.
 */
export function PrerequisiteNotice({
  prerequisite,
  onOpen,
}: {
  prerequisite: LandingPrerequisite;
  onOpen?: () => void;
}) {
  const kind = prerequisite.contentType === "EVENT" ? "event" : "course";
  return (
    <section
      className={`mb-7 flex items-start gap-3 rounded-2xl border p-4 ${
        prerequisite.met ? "border-emerald-200 bg-emerald-50/60 dark:border-emerald-500/25 dark:bg-emerald-500/10" : "border-amber-200 bg-amber-50/60 dark:border-amber-500/25 dark:bg-amber-500/10"
      }`}
    >
      <span className={`mt-0.5 shrink-0 ${prerequisite.met ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
        {prerequisite.met ? <CheckCircle2 size={16} /> : <Lock size={16} />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-ink">
          {prerequisite.met ? `You completed the ${kind}` : `Complete the ${kind} first`}
        </p>
        <p className="mt-0.5 text-[12px] font-medium text-slate-600">
          {prerequisite.message ?? prerequisite.title}
        </p>
      </div>
      {onOpen && (
        <button
          type="button"
          onClick={onOpen}
          className="shrink-0 cursor-pointer rounded-full border border-slate-300 bg-surface px-3.5 py-1.5 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
        >
          Open {prerequisite.title}
        </button>
      )}
    </section>
  );
}

/** Words for an attempt that has no score to show. */
export function attemptStatusLabel(attempt: AttemptHistoryItem): string {
  if (attempt.status === "IN_PROGRESS") return "In progress";
  if (attempt.status === "CANCELLED") {
    return attempt.terminationReason === "PROCTORING_VIOLATIONS" ? "Ended: proctoring violations" : "Cancelled by an administrator";
  }
  if (attempt.status === "EXPIRED") return "Expired";
  return "—";
}
