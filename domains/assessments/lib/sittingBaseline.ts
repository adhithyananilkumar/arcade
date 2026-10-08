/**
 * The integrity floor every real exam sitting runs under, whatever its plan says. Mirrors the
 * backend's `ExamSittingBaseline`, which is the enforcement point: the server records each
 * violation and ends the sitting at the limit. This file only describes the rules (Console → Exam
 * standards, the honor code, the sitting itself) and gives the browser the same numbers.
 */

/** Violations that end a sitting when its plan sets no stricter limit. */
export const SITTING_MAX_VIOLATIONS = 3;

/** The limit a plan's sitting runs under: the plan's own, when it is stricter than the baseline. */
export function sittingViolationLimit(planLimit: number): number {
  return planLimit > 0 ? Math.min(planLimit, SITTING_MAX_VIOLATIONS) : SITTING_MAX_VIOLATIONS;
}

export interface SittingRule {
  title: string;
  detail: string;
}

export const SITTING_BASELINE_RULES: SittingRule[] = [
  {
    title: 'Own tab',
    detail: 'The paper always opens in its own tab, and only one tab can hold a sitting at a time.',
  },
  {
    title: 'Full screen',
    detail: 'The paper is shown only in full screen. Leaving full screen hides it and counts as a violation.',
  },
  {
    title: 'Focus lock',
    detail:
      'Switching tab or window — Alt+Tab, another app, a browser sidebar or AI assistant — counts as a violation.',
  },
  {
    title: 'No copy or paste',
    detail: 'Copy, cut and paste are blocked, and each try counts as a violation.',
  },
  {
    title: 'No developer tools',
    detail: 'Developer-tools shortcuts count as a violation; the right-click menu, printing and saving the page are blocked.',
  },
  {
    title: `${SITTING_MAX_VIOLATIONS} strikes`,
    detail: `Reaching ${SITTING_MAX_VIOLATIONS} violations ends the sitting — scored on what was answered, never a pass — and the exam's author is notified to review it. A plan may set a stricter limit, never a looser one.`,
  },
  {
    title: 'Watermarked',
    detail: "The candidate's name and attempt ID are watermarked across the paper.",
  },
];
