import type { ExamPlanValidationResponse } from "../types";

/**
 * Turns a plan's validation result into the one sentence a creator needs.
 *
 * <p>Separate from the component that renders it because this is the judgement the publish gate
 * also makes: a plan is only publishable when every rule can be satisfied <em>and</em> it actually
 * asks for questions. A plan with no selection at all is not "valid because nothing is short" — it
 * would produce an empty paper, so it is reported as its own case.
 */
export type PlanReadiness =
  | { state: "ready"; message: string }
  | { state: "empty"; message: string }
  | { state: "short"; message: string; shortRules: number };

export function planReadiness(validation: ExamPlanValidationResponse): PlanReadiness {
  if (validation.totalRequired === 0) {
    return {
      state: "empty",
      message: "This plan doesn't select any questions yet.",
    };
  }

  const shortRules = validation.rules.filter((rule) => !rule.ok);
  if (shortRules.length > 0) {
    return {
      state: "short",
      shortRules: shortRules.length,
      message:
        shortRules.length === 1
          ? `"${shortRules[0].sourceLabel}" only has ${shortRules[0].available} of the ${shortRules[0].required} questions this plan asks for.`
          : `${shortRules.length} lines ask for more questions than are available.`,
    };
  }

  return {
    state: "ready",
    message: `Ready — ${validation.totalRequired} question${validation.totalRequired === 1 ? "" : "s"} can be drawn.`,
  };
}

/** True when this plan can build its paper, and so may be published. */
export function isPlanPublishable(validation: ExamPlanValidationResponse): boolean {
  return planReadiness(validation).state === "ready";
}
