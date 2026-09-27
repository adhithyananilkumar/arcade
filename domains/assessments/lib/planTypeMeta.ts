// How an exam plan type is presented. Presentation only — what a type *does* (completing content,
// issuing a certificate) is decided and enforced by the server; this just names it consistently
// everywhere a plan appears, so "Completion" in Studio is "Completion" on the learner's page.

import type { ExamPlanType } from "../types";

export interface PlanTypeMeta {
  label: string;
  /** One line on what passing this plan does. */
  effect: string;
  /** Tailwind classes for the type chip. */
  chip: string;
}

const META: Record<ExamPlanType, PlanTypeMeta> = {
  CERTIFICATION: {
    label: "Certification",
    effect: "Passing issues a certificate.",
    chip: "bg-violet-100/80 text-violet-800",
  },
  COMPLETION: {
    label: "Completion",
    effect: "Passing completes the course or event it belongs to.",
    chip: "bg-amber-50 text-amber-800",
  },
  ASSESSMENT: {
    label: "Assessment",
    effect: "A check on your progress.",
    chip: "bg-[#14142b]/[0.06] text-[#14142b]",
  },
};

export function planTypeMeta(type: ExamPlanType | null | undefined): PlanTypeMeta {
  return META[type ?? "ASSESSMENT"] ?? META.ASSESSMENT;
}

/** "Assessment" is split in two for learners: a graded one counts, a practice one only reports a score. */
export function planKindLabel(type: ExamPlanType | null | undefined, graded: boolean): string {
  if (type === "ASSESSMENT" || type == null) return graded ? "Graded assessment" : "Practice";
  return planTypeMeta(type).label;
}

export const PLAN_TYPES: ExamPlanType[] = ["CERTIFICATION", "COMPLETION", "ASSESSMENT"];
