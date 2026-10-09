"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Check,
  ClipboardList,
  Copy,
  Layers,
  Loader2,
  Lock,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  createPlanSection,
  deleteExamPlan,
  deletePlanSection,
  duplicateExamPlan,
  planKindLabel,
  planReadiness,
  planTypeMeta,
  renamePlanSection,
  savePlanSectionRules,
  sittingViolationLimit,
  SITTING_MAX_VIOLATIONS,
  updateExamPlan,
  validateExamPlan,
  type Difficulty,
  type ExamPlanResponse,
  type ExamPlanSettingView,
  type ExamPlanValidationResponse,
  type ExamSelectionRuleRequest,
  type ExamSelectionRuleResponse,
  type ExamSettingKey,
  type QuestionPoolDetail,
  type SectionResponse,
} from "@/domains/assessments";
import { StudioCanvasEmpty } from "@/apps/creator/studio/core/StudioShell";

/**
 * The Exam Plan workspace — one sitting this exam offers.
 *
 * <p>A plan's type (Certification, Completion, Assessment) is platform-defined and fixed at
 * creation; it decides what passing does and which platform standard governs the settings. Every
 * setting is rendered from the server's resolved view of that standard: a locked setting shows the
 * platform's value and cannot be changed, a default one can be changed within the platform's
 * limits. The server enforces both — the controls only reflect what it reported.
 *
 * <p>When the plan runs (its window) is not a plan setting: it follows the schedule of the exam, or
 * of the course or event it is tied to.
 */

const DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD"];

type PanelId = "selection" | "attempt" | "security" | "availability";

const PANELS: { id: PanelId; label: string; help: string }[] = [
  {
    id: "selection",
    label: "1 · Questions",
    help: "Choose which questions from the bank this plan uses: whole sections, a number picked at random, or hand-picked ones. Each candidate's paper is built from these rules.",
  },
  {
    id: "attempt",
    label: "2 · Attempt & scoring",
    help: "Time limit, number of attempts, and the score needed to pass. Some limits are fixed by the platform for certifications — those show a lock.",
  },
  {
    id: "security",
    label: "3 · Security",
    help: "Optional proctoring, identity check and full-screen mode, and how many violations end an attempt.",
  },
  {
    id: "availability",
    label: "4 · Availability",
    help: "Where learners meet this plan and whether it is offered right now. Hiding a plan keeps its results.",
  },
];

export function PlanWorkspace({
  plan,
  pools,
  bankSections,
  onChanged,
  createSlot,
  readOnly,
}: {
  plan: ExamPlanResponse | null;
  pools: QuestionPoolDetail[];
  bankSections: SectionResponse[];
  onChanged: () => void;
  /** The "New plan" type picker, shown when there is no plan yet. */
  createSlot?: ReactNode;
  readOnly?: boolean;
}) {
  const [panel, setPanel] = useState<PanelId>("selection");
  const [validation, setValidation] = useState<ExamPlanValidationResponse | null>(null);
  const [validating, setValidating] = useState(false);
  const [busy, setBusy] = useState(false);

  const revalidate = useCallback(async (planId: string) => {
    setValidating(true);
    try {
      setValidation(await validateExamPlan(planId));
    } catch {
      setValidation(null);
    } finally {
      setValidating(false);
    }
  }, []);

  useEffect(() => {
    if (plan) revalidate(plan.id);
  }, [plan?.id, plan?.totalQuestions, revalidate]); // eslint-disable-line react-hooks/exhaustive-deps

  const patchPlan = async (changes: Parameters<typeof updateExamPlan>[1]) => {
    if (!plan) return;
    setBusy(true);
    try {
      await updateExamPlan(plan.id, changes);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save this plan");
    } finally {
      setBusy(false);
    }
  };

  const availabilityFor = (ruleId: string) => validation?.rules.find((r) => r.ruleId === ruleId) ?? null;

  if (!plan) {
    return (
      <StudioCanvasEmpty
        icon={ClipboardList}
        title="Add a plan to decide how this exam is sat"
        description="Each plan is one sitting of a platform-defined type: a Certification (listed in Explore > Exams, issues a certificate), a Completion assessment (completes the tied course or event), or an Assessment (graded or practice). Its settings follow the platform's standard for that type."
        action={!readOnly && createSlot}
      />
    );
  }

  const setting = (key: ExamSettingKey) => plan.settings.find((s) => s.key === key) ?? null;
  const locked = (key: ExamSettingKey) => {
    const s = setting(key);
    return s ? !s.editable : false;
  };
  const meta = planTypeMeta(plan.planType);

  return (
    <div className="flex flex-col gap-4">
      {/* ── Plan header ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.chip}`}>
            {planKindLabel(plan.planType, plan.graded)}
          </span>
          {/* Uncontrolled and committed on blur: the plan list re-renders on every save, and a
              controlled value would fight the author's cursor mid-word. */}
          <input
            key={plan.id}
            defaultValue={plan.name}
            disabled={readOnly}
            onBlur={(e) => {
              const name = e.target.value.trim();
              if (name && name !== plan.name) patchPlan({ name });
            }}
            aria-label="Plan name"
            className="w-full truncate rounded-xl border border-transparent bg-transparent px-2 py-1 text-xl font-black tracking-tight text-ink outline-none hover:border-slate-200 focus:border-indigo-300 focus:bg-surface focus:ring-2 focus:ring-indigo-100 dark:focus:border-indigo-500/40 dark:focus:ring-indigo-500/25"
          />
          <p className="mt-0.5 px-2 text-xs font-medium text-ink/50">
            {plan.totalQuestions} question{plan.totalQuestions === 1 ? "" : "s"} · {plan.durationMinutes} min
            {plan.planType !== "ASSESSMENT" || plan.graded ? ` · pass at ${plan.passPercentage}%` : " · not graded"}
            {plan.minQuestions > 0 && ` · platform minimum ${plan.minQuestions} questions`}
          </p>
          <p className="mt-1 px-2 text-[11px] font-medium text-slate-500">{meta.effect}</p>
          {plan.live === false && plan.active && (
            <p className="mx-2 mt-2 inline-flex items-start gap-1.5 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
              Draft — saved, but learners don’t see this plan yet. It goes live with the next approved submission
              {plan.hubListed ? "." : " of the course or event it belongs to."}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <PlanStatusBadge validation={validation} validating={validating} />
          {!readOnly && (
            <>
              {plan.planType === "ASSESSMENT" && (
                <button
                  type="button"
                  title="Duplicate this plan"
                  onClick={async () => {
                    try {
                      await duplicateExamPlan(plan.id);
                      toast.success("Plan duplicated");
                      onChanged();
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Couldn't duplicate this plan");
                    }
                  }}
                  className="cursor-pointer rounded-full border border-slate-200 bg-surface p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-ink"
                >
                  <Copy size={14} />
                </button>
              )}
              <button
                type="button"
                title="Delete this plan"
                onClick={async () => {
                  if (!window.confirm(`Delete "${plan.name}"? Learners' past results on it are kept.`)) return;
                  try {
                    await deleteExamPlan(plan.id);
                    toast.success("Plan deleted");
                    onChanged();
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Couldn't delete this plan");
                  }
                }}
                className="cursor-pointer rounded-full border border-slate-200 bg-surface p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Panel switcher ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200/70 pb-4">
        {PANELS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPanel(p.id)}
            aria-current={panel === p.id ? "page" : undefined}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold transition-colors ${
              panel === p.id
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-slate-200/80 bg-surface text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <p className="-mt-1 text-xs font-medium leading-relaxed text-slate-500">
        {PANELS.find((p) => p.id === panel)?.help}
      </p>

      {/* ── Panel body ──────────────────────────────────────────────────── */}
      <div>
        {panel === "selection" && (
          <SelectionPanel
            plan={plan}
            pools={pools}
            bankSections={bankSections}
            availabilityFor={availabilityFor}
            onChanged={() => {
              onChanged();
              revalidate(plan.id);
            }}
            readOnly={readOnly}
          />
        )}

        {panel === "attempt" && (
          <SettingsCard title="Attempt & scoring" description="How long candidates get, how many tries, and what counts as a pass.">
            {plan.planType === "ASSESSMENT" && (
              <ToggleField
                label="Graded"
                description="A graded assessment has a pass mark and appears on the learner's transcript. A practice one only shows the learner their score."
                value={plan.graded}
                setting={setting("GRADED")}
                disabled={readOnly || busy || locked("GRADED")}
                onChange={(v) => patchPlan({ graded: v })}
              />
            )}
            <NumberField
              key={`duration:${plan.durationMinutes}`}
              label="Duration"
              suffix="minutes"
              value={plan.durationMinutes}
              setting={setting("DURATION_MINUTES")}
              disabled={readOnly || busy || locked("DURATION_MINUTES")}
              onCommit={(v) => patchPlan({ durationMinutes: v })}
            />
            <NumberField
              key={`attempts:${plan.maxAttempts}`}
              label="Attempts allowed"
              value={plan.maxAttempts}
              setting={setting("MAX_ATTEMPTS")}
              disabled={readOnly || busy || locked("MAX_ATTEMPTS")}
              onCommit={(v) => patchPlan({ maxAttempts: v })}
            />
            {(plan.planType !== "ASSESSMENT" || plan.graded) && (
              <NumberField
                key={`pass:${plan.passPercentage}`}
                label="Pass mark"
                suffix="%"
                value={plan.passPercentage}
                setting={setting("PASS_PERCENTAGE")}
                disabled={readOnly || busy || locked("PASS_PERCENTAGE")}
                onCommit={(v) => patchPlan({ passPercentage: v })}
              />
            )}
            <ToggleField
              label="Everyone sits the same paper"
              description="Off means each attempt draws a fresh paper from the rules, avoiding questions the learner has already seen where the bank allows."
              value={plan.fixedPaper}
              setting={setting("FIXED_PAPER")}
              disabled={readOnly || busy || locked("FIXED_PAPER")}
              onChange={(v) => patchPlan({ fixedPaper: v })}
            />
            <ToggleField
              label="Shuffle question order"
              value={plan.shuffleQuestions}
              setting={setting("SHUFFLE_QUESTIONS")}
              disabled={readOnly || busy || locked("SHUFFLE_QUESTIONS")}
              onChange={(v) => patchPlan({ shuffleQuestions: v })}
            />
            <ToggleField
              label="Shuffle answer options"
              description="Fixed once per attempt, so a candidate's options never move under them."
              value={plan.shuffleOptions}
              setting={setting("SHUFFLE_OPTIONS")}
              disabled={readOnly || busy || locked("SHUFFLE_OPTIONS")}
              onChange={(v) => patchPlan({ shuffleOptions: v })}
            />
          </SettingsCard>
        )}

        {panel === "security" && (
          <SettingsCard
            title="Security"
            description="Every sitting runs under the platform's sitting baseline: its own tab, full screen, and tab switches, focus loss, copy/paste and developer tools recorded on the server. Proctoring marks the sitting for your review; identity verification asks for a photo that you approve in Attempts."
          >
            <ToggleField
              label="Proctoring"
              value={plan.proctoringRequired}
              setting={setting("PROCTORING_REQUIRED")}
              disabled={readOnly || busy || locked("PROCTORING_REQUIRED")}
              onChange={(v) => patchPlan({ proctoringRequired: v })}
            />
            <ToggleField
              label="Identity verification"
              value={plan.identityVerificationRequired}
              setting={setting("IDENTITY_VERIFICATION_REQUIRED")}
              disabled={readOnly || busy || locked("IDENTITY_VERIFICATION_REQUIRED")}
              onChange={(v) => patchPlan({ identityVerificationRequired: v })}
            />
            <div className="flex items-start gap-3 py-3">
              <Lock size={15} className="mt-0.5 shrink-0 text-slate-400" />
              <p className="text-xs leading-relaxed text-slate-600">
                <span className="font-semibold text-ink">Full screen — always on.</span> Part of the sitting
                baseline for every exam; it cannot be switched off.
              </p>
            </div>
            <NumberField
              key={`violations:${plan.maxViolations}`}
              label="Violations before the attempt ends"
              value={plan.maxViolations}
              allowZero
              hint={`At most ${SITTING_MAX_VIOLATIONS} (sitting baseline); 0 uses ${SITTING_MAX_VIOLATIONS}. This plan runs at ${sittingViolationLimit(plan.maxViolations)}.`}
              setting={setting("MAX_VIOLATIONS")}
              disabled={readOnly || busy || locked("MAX_VIOLATIONS")}
              onCommit={(v) => patchPlan({ maxViolations: v })}
            />
          </SettingsCard>
        )}

        {panel === "availability" && (
          <SettingsCard title="Availability" description="Where learners meet this plan, and whether it is offered.">
            <div className="flex items-start gap-3 py-3">
              <MapPin size={15} className="mt-0.5 shrink-0 text-slate-400" />
              <p className="text-xs leading-relaxed text-slate-600">
                {plan.hubListed
                  ? "Listed in Explore > Exams. Learners register for this exam to sit it; its registration and sitting windows follow the exam's schedule."
                  : plan.placement
                  ? `Placed inside the tied ${plan.placement.hostType === "COURSE_MODULE" ? "course module" : plan.placement.hostType.toLowerCase()}. Learners enrolled there sit it from the course or event; move it from the course editor.`
                  : "Not placed yet. It is placed at the root of the tied course or event automatically."}
              </p>
            </div>
            <ToggleField
              label="Available to candidates"
              description="Turn off to keep this plan hidden while you work on it, even after the exam is published."
              value={plan.active}
              disabled={readOnly || busy}
              onChange={(v) => patchPlan({ active: v })}
            />
            {plan.planType === "CERTIFICATION" && <RetakePolicySummary settings={plan.settings} />}
          </SettingsCard>
        )}
      </div>
    </div>
  );
}

/**
 * The certification standard's retake rules as this exam's candidates will meet them. Read-only:
 * they are platform-wide (Console → Exam standards), so the creator sees them rather than sets them.
 */
function RetakePolicySummary({ settings }: { settings: { key: string; value: number | null }[] }) {
  const v = (k: string) => settings.find((s) => s.key === k)?.value ?? null;
  if (v("RETAKE_PURCHASE_ENABLED") === null) return null;
  const lines: string[] = [];
  if ((v("RETAKE_PURCHASE_ENABLED") ?? 0) <= 0) {
    lines.push("Once a candidate's attempts run out, only you can allow another (Attempts & results).");
  } else {
    const pct = v("RETAKE_FEE_PERCENT") ?? 100;
    lines.push(
      pct === 0
        ? "Candidates who run out of attempts can take another for free."
        : `Candidates who run out of attempts can buy another at ${pct}% of the registration fee.`
    );
    const cooldown = v("RETAKE_COOLDOWN_HOURS") ?? 0;
    if (cooldown > 0) lines.push(`They wait ${cooldown} hour${cooldown === 1 ? "" : "s"} after their last sitting first.`);
    const max = v("RETAKE_MAX_PURCHASES") ?? 0;
    if (max > 0) lines.push(`At most ${max} bought retake${max === 1 ? "" : "s"} per candidate.`);
    if ((v("SECOND_CHANCE_ENABLED") ?? 0) > 0) {
      const off = v("SECOND_CHANCE_DISCOUNT_PERCENT") ?? 0;
      const days = v("SECOND_CHANCE_WINDOW_DAYS") ?? 0;
      lines.push(
        `The first retake after a fail is a second chance at ${off >= 100 ? "no charge" : `${off}% off`}${days > 0 ? `, within ${days} days` : ""}.`
      );
    }
  }
  if ((v("VIOLATION_RETAKE_NEEDS_APPROVAL") ?? 1) > 0) {
    lines.push("After a sitting ended for proctoring violations, you approve the next attempt.");
  }
  return (
    <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
      <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">Retakes · platform standard</p>
      <ul className="space-y-1 text-xs leading-relaxed text-slate-600">
        {lines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}

// ── Validation badge ─────────────────────────────────────────────────────────

function PlanStatusBadge({
  validation,
  validating,
}: {
  validation: ExamPlanValidationResponse | null;
  validating: boolean;
}) {
  if (validating) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-bold text-slate-500">
        <Loader2 size={12} className="animate-spin" /> Checking
      </span>
    );
  }
  if (!validation) return null;

  const readiness = planReadiness(validation);
  if (readiness.state === "ready") {
    return (
      <span
        title={readiness.message}
        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
      >
        <Check size={12} /> Ready
      </span>
    );
  }
  const label =
    readiness.state === "empty"
      ? "No questions selected"
      : readiness.state === "belowMinimum"
      ? `Needs ${validation.minQuestions}+ questions`
      : `${readiness.shortRules} line${readiness.shortRules === 1 ? "" : "s"} short`;
  return (
    <span
      title={readiness.message}
      className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
    >
      <AlertTriangle size={12} />
      {label}
    </span>
  );
}

// ── Question selection ───────────────────────────────────────────────────────

function SelectionPanel({
  plan,
  pools,
  bankSections,
  availabilityFor,
  onChanged,
  readOnly,
}: {
  plan: ExamPlanResponse;
  pools: QuestionPoolDetail[];
  bankSections: SectionResponse[];
  availabilityFor: (ruleId: string) => ExamPlanValidationResponse["rules"][number] | null;
  onChanged: () => void;
  readOnly?: boolean;
}) {
  const [savingSection, setSavingSection] = useState<string | null>(null);

  const saveRules = async (sectionId: string, rules: ExamSelectionRuleRequest[]) => {
    setSavingSection(sectionId);
    try {
      await savePlanSectionRules(sectionId, rules);
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save the question selection");
    } finally {
      setSavingSection(null);
    }
  };

  const toRequest = (rule: ExamSelectionRuleResponse): ExamSelectionRuleRequest => ({
    selectionMode: rule.selectionMode,
    poolId: rule.poolId,
    bankSectionId: rule.bankSectionId,
    difficulty: rule.difficulty,
    tags: rule.tags,
    marksPerQuestion: rule.marksPerQuestion,
    count: rule.count,
    manualQuestionIds: rule.manualQuestionIds,
  });

  if (plan.sections.length === 0) {
    return (
      <StudioCanvasEmpty
        icon={Layers}
        title="Add a part to start choosing questions"
        description="A plan's paper is made of parts, and each part says what to draw from the question bank."
        action={
          !readOnly && (
            <button
              type="button"
              onClick={async () => {
                await createPlanSection(plan.id, "Questions");
                onChanged();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-xs font-bold text-on-ink transition-colors hover:bg-ink-hover"
            >
              <Plus size={14} /> Add part
            </button>
          )
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-3 pb-4">
      {plan.sections.map((section) => (
        <div
          key={section.id}
          className="border-t border-slate-200/70 pt-6 first:border-t-0 first:pt-0"
        >
          <div className="mb-4 flex items-center gap-2">
            <input
              defaultValue={section.title}
              disabled={readOnly}
              onBlur={(e) => {
                const title = e.target.value.trim();
                if (title && title !== section.title) {
                  renamePlanSection(section.id, title).then(onChanged);
                }
              }}
              aria-label="Part name"
              className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-bold text-ink outline-none hover:border-slate-200 focus:border-indigo-300 focus:bg-surface dark:focus:border-indigo-500/40"
            />
            {savingSection === section.id && <Loader2 size={13} className="animate-spin text-slate-400" />}
            {!readOnly && plan.sections.length > 1 && (
              <button
                type="button"
                title="Remove this part"
                onClick={() => deletePlanSection(section.id).then(onChanged)}
                className="rounded-md p-1.5 text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {section.rules.map((rule, index) => (
              <RuleRow
                key={`${rule.id}:${rule.count}`}
                rule={rule}
                pools={pools}
                bankSections={bankSections}
                availability={availabilityFor(rule.id)}
                readOnly={readOnly}
                onChange={(changes) => {
                  const next = section.rules.map((r, i) =>
                    i === index ? { ...toRequest(r), ...changes } : toRequest(r)
                  );
                  saveRules(section.id, next);
                }}
                onRemove={() => {
                  const next = section.rules.filter((_, i) => i !== index).map(toRequest);
                  saveRules(section.id, next);
                }}
              />
            ))}

            {section.rules.length === 0 && (
              <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs font-medium text-slate-400">
                Nothing selected for this part yet.
              </p>
            )}

            {!readOnly && (
              <button
                type="button"
                onClick={() =>
                  saveRules(section.id, [
                    ...section.rules.map(toRequest),
                    { selectionMode: "RULE_BASED", count: 5, poolId: null, bankSectionId: null, difficulty: null },
                  ])
                }
                className="mt-1 flex items-center gap-1.5 rounded-xl border border-dashed border-slate-200 px-3 py-2 text-xs font-bold text-slate-400 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-ink"
              >
                <Plus size={14} /> Add questions
              </button>
            )}
          </div>
        </div>
      ))}

      {!readOnly && (
        <button
          type="button"
          onClick={() => createPlanSection(plan.id).then(onChanged)}
          className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-xs font-bold text-slate-400 transition-colors hover:border-slate-300 hover:bg-surface/60 hover:text-ink"
        >
          <Plus size={14} /> Add another part
        </button>
      )}
    </div>
  );
}

/**
 * One line of selection, written as a sentence: take N questions from somewhere, optionally at one
 * difficulty, optionally worth fixed marks. The availability figure sits on the same row because
 * "10 required, 7 available" is the single most important thing to notice while editing.
 */
function RuleRow({
  rule,
  pools,
  bankSections,
  availability,
  readOnly,
  onChange,
  onRemove,
}: {
  rule: ExamSelectionRuleResponse;
  pools: QuestionPoolDetail[];
  bankSections: SectionResponse[];
  availability: ExamPlanValidationResponse["rules"][number] | null;
  readOnly?: boolean;
  onChange: (changes: Partial<ExamSelectionRuleRequest>) => void;
  onRemove: () => void;
}) {
  // Local while typing, committed on blur. Keyed on the saved value by the caller, so a save
  // elsewhere re-seeds this input by remounting it rather than through a syncing effect.
  const [count, setCount] = useState(rule.count);

  const sourceValue = rule.poolId ? `pool:${rule.poolId}` : rule.bankSectionId ? `section:${rule.bankSectionId}` : "bank";

  const short = availability && !availability.ok;

  return (
    <div
      className={`flex flex-wrap items-center gap-2 rounded-xl border px-3 py-2.5 transition-colors ${
        short ? "border-amber-200 bg-amber-50/40 dark:border-amber-500/25 dark:bg-amber-500/10" : "border-slate-200 bg-surface"
      }`}
    >
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Take</span>
      <input
        type="number"
        min={1}
        value={count}
        disabled={readOnly}
        onChange={(e) => setCount(Math.max(0, parseInt(e.target.value, 10) || 0))}
        onBlur={() => count !== rule.count && onChange({ count })}
        aria-label="How many questions"
        className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-center text-xs font-bold text-ink outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200 dark:focus:border-indigo-500/40 dark:focus:ring-indigo-500/25"
      />

      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">from</span>
      <select
        value={sourceValue}
        disabled={readOnly}
        onChange={(e) => {
          const [kind, id] = e.target.value.split(":");
          if (kind === "pool") onChange({ poolId: id, bankSectionId: null });
          else if (kind === "section") onChange({ poolId: null, bankSectionId: id });
          else onChange({ poolId: null, bankSectionId: null });
        }}
        aria-label="Where the questions come from"
        className="min-w-0 max-w-[220px] flex-1 rounded-lg border border-slate-200 bg-surface px-2 py-1 text-xs font-semibold text-ink outline-none focus:border-indigo-300 dark:focus:border-indigo-500/40"
      >
        <option value="bank">Question Bank (all)</option>
        {bankSections.length > 0 && (
          <optgroup label="Question Bank sections">
            {bankSections.map((s) => (
              <option key={s.id} value={`section:${s.id}`}>
                {s.title}
              </option>
            ))}
          </optgroup>
        )}
        {pools.length > 0 && (
          <optgroup label="Pools">
            {pools.map((p) => (
              <option key={p.id} value={`pool:${p.id}`}>
                {p.title} ({p.questionCount})
              </option>
            ))}
          </optgroup>
        )}
      </select>

      <select
        value={rule.difficulty ?? ""}
        disabled={readOnly}
        onChange={(e) => onChange({ difficulty: (e.target.value || null) as Difficulty | null })}
        aria-label="Difficulty"
        className="rounded-lg border border-slate-200 bg-surface px-2 py-1 text-xs font-semibold text-ink outline-none focus:border-indigo-300 dark:focus:border-indigo-500/40"
      >
        <option value="">Any difficulty</option>
        {DIFFICULTIES.map((d) => (
          <option key={d} value={d}>
            {d.charAt(0) + d.slice(1).toLowerCase()}
          </option>
        ))}
      </select>

      <input
        type="number"
        min={1}
        placeholder="Marks"
        defaultValue={rule.marksPerQuestion ?? ""}
        disabled={readOnly}
        onBlur={(e) => {
          const raw = e.target.value.trim();
          const next = raw === "" ? null : Math.max(1, parseInt(raw, 10) || 1);
          if (next !== rule.marksPerQuestion) onChange({ marksPerQuestion: next });
        }}
        aria-label="Marks per question (leave blank to use each question's own marks)"
        title="Marks per question — leave blank to use each question's own marks"
        className="w-[76px] rounded-lg border border-slate-200 px-2 py-1 text-center text-xs font-semibold text-ink outline-none placeholder:text-slate-300 focus:border-indigo-300 dark:focus:border-indigo-500/40"
      />

      <div className="ml-auto flex items-center gap-2">
        {availability && (
          <span
            className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${
              availability.ok ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200"
            }`}
            title={`${availability.available} available in ${availability.sourceLabel}`}
          >
            {availability.ok
              ? `${availability.available} available`
              : `Only ${availability.available} available`}
          </span>
        )}
        {!readOnly && (
          <button
            type="button"
            title="Remove this line"
            onClick={onRemove}
            className="rounded-md p-1.5 text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10 dark:hover:text-rose-400"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    </div>
  );
}

// ── Settings primitives ──────────────────────────────────────────────────────

function SettingsCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid grid-cols-1 items-start gap-6 md:grid-cols-12">
      <div className="md:col-span-4">
        <h3 className="text-base font-extrabold tracking-tight text-slate-900">{title}</h3>
        {description && <p className="mt-1 text-xs font-medium leading-relaxed text-slate-500">{description}</p>}
      </div>
      <div className="divide-y divide-slate-100 md:col-span-8">{children}</div>
    </section>
  );
}

/** "Set by the platform" or the creator's allowed range, from the server's resolved standard. */
function SettingHint({ setting, hint }: { setting?: ExamPlanSettingView | null; hint?: string }) {
  if (setting && !setting.editable && setting.binds) {
    return (
      <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400">
        <Lock size={10} /> Set by the platform standard
      </span>
    );
  }
  const range =
    setting && setting.binds && (setting.min !== null || setting.max !== null)
      ? `Allowed ${setting.min ?? "any"}–${setting.max ?? "any"}`
      : null;
  if (!range && !hint) return null;
  return (
    <span className="mt-0.5 block text-[10px] font-medium text-slate-400">
      {[range, hint].filter(Boolean).join(" · ")}
    </span>
  );
}

function NumberField({
  label,
  suffix,
  value,
  setting,
  hint,
  allowZero,
  disabled,
  onCommit,
}: {
  label: string;
  suffix?: string;
  value: number;
  setting?: ExamPlanSettingView | null;
  hint?: string;
  allowZero?: boolean;
  disabled?: boolean;
  onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  const floor = allowZero ? 0 : 1;

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <label className="text-xs font-bold text-ink">{label}</label>
        <SettingHint setting={setting} hint={hint} />
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <input
          type="number"
          min={setting?.min ?? floor}
          max={setting?.max ?? undefined}
          value={draft}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            const next = Number(draft);
            if (Number.isFinite(next) && next >= floor && next !== value) onCommit(next);
            else setDraft(String(value));
          }}
          className="w-20 rounded-full border border-slate-200/90 bg-surface px-2 py-1.5 text-center text-xs font-bold text-ink shadow-2xs outline-none focus:border-[#205ca8] focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50 disabled:text-slate-500"
        />
        {suffix && <span className="text-[11px] font-semibold text-slate-400">{suffix}</span>}
      </div>
    </div>
  );
}

function ToggleField({
  label,
  description,
  value,
  setting,
  disabled,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  setting?: ExamPlanSettingView | null;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <span className="text-xs font-bold text-ink">{label}</span>
        {description && <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{description}</p>}
        <SettingHint setting={setting} />
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!value)}
        className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
          value ? "bg-[#205ca8] dark:bg-blue-500" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-surface shadow-sm transition-transform ${
            value ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
