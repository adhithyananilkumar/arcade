"use client";

import { useEffect, useRef, useState } from "react";
import { Award, ClipboardCheck, Flag, Loader2, Plus } from "lucide-react";
import {
  PLAN_TYPES,
  planTypeMeta,
  type ExamPlanResponse,
  type ExamPlanType,
  type ExamResponse,
} from "@/domains/assessments";

const ICON: Record<ExamPlanType, typeof Award> = {
  CERTIFICATION: Award,
  COMPLETION: Flag,
  ASSESSMENT: ClipboardCheck,
};

/**
 * Why a type can't be added right now, or null if it can. A hint only — the server enforces the
 * same rules (one certification and one completion per exam, completion only on a tied exam) with
 * unique indexes and a publish check, and its error is shown if this ever disagrees.
 */
export function planTypeUnavailable(
  type: ExamPlanType,
  exam: ExamResponse,
  plans: ExamPlanResponse[]
): string | null {
  if (type === "CERTIFICATION" && plans.some((p) => p.planType === "CERTIFICATION")) {
    return "This exam already has a certification.";
  }
  if (type === "COMPLETION") {
    if (!exam.tieType) return "Tie this exam to a course or event first.";
    if (plans.some((p) => p.planType === "COMPLETION")) return "This exam already has a completion assessment.";
  }
  return null;
}

const DESCRIPTIONS: Record<ExamPlanType, (exam: ExamResponse) => string> = {
  CERTIFICATION: (exam) =>
    exam.tieType
      ? `Listed in Explore > Exams. Completing ${exam.tiedContentTitle ?? "the tied content"} is a prerequisite; passing issues a certificate.`
      : "Listed in Explore > Exams. Passing issues a certificate.",
  COMPLETION: (exam) =>
    `Placed inside ${exam.tiedContentTitle ?? "the tied content"}. Passing it completes it.`,
  ASSESSMENT: (exam) =>
    exam.tieType
      ? `A graded or practice check placed inside ${exam.tiedContentTitle ?? "the tied content"}.`
      : "A standalone exam, listed in Explore > Exams.",
};

export function NewPlanMenu({
  exam,
  plans,
  creating,
  onCreate,
  variant = "list",
}: {
  exam: ExamResponse;
  plans: ExamPlanResponse[];
  creating?: boolean;
  onCreate: (type: ExamPlanType) => void;
  variant?: "list" | "primary";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={creating}
        className={
          variant === "primary"
            ? "inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-xs font-extrabold text-on-ink shadow-md transition-colors hover:bg-[#205ca8] disabled:opacity-50"
            : "mt-1 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-full border border-dashed border-slate-300 px-3 py-2 text-xs font-bold text-slate-500 transition-colors hover:border-slate-400 hover:bg-surface hover:text-ink disabled:opacity-50"
        }
      >
        {creating ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
        New plan
      </button>

      {open && (
        <div className="absolute left-0 z-30 mt-2 w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-surface p-1.5 shadow-[0_18px_40px_rgba(20,20,43,0.14)]">
          {PLAN_TYPES.map((type) => {
            const Icon = ICON[type];
            const blocked = planTypeUnavailable(type, exam, plans);
            return (
              <button
                key={type}
                type="button"
                disabled={!!blocked}
                onClick={() => {
                  setOpen(false);
                  onCreate(type);
                }}
                className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
              >
                <span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg ${planTypeMeta(type).chip}`}>
                  <Icon size={14} />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-bold text-ink">{planTypeMeta(type).label}</span>
                  <span className="block text-[11px] leading-relaxed text-slate-500">
                    {blocked ?? DESCRIPTIONS[type](exam)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
