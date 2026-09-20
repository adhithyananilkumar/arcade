"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Check,
  ClipboardList,
  Copy,
  Layers,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  createPlanSection,
  deleteExamPlan,
  deletePlanSection,
  duplicateExamPlan,
  planReadiness,
  renamePlanSection,
  savePlanSectionRules,
  updateExamPlan,
  validateExamPlan,
  type AssessmentOutcome,
  type Difficulty,
  type ExamPlanResponse,
  type ExamPlanValidationResponse,
  type ExamSelectionRuleRequest,
  type ExamSelectionRuleResponse,
  type QuestionPoolDetail,
  type SectionResponse,
} from "@/domains/assessments";
import { StudioCanvasEmpty } from "@/apps/creator/studio/core/StudioShell";

/**
 * The Exam Plan workspace — where a creator says how one way of running this examination works.
 *
 * <p>A plan is two things, and the layout says so: what paper it builds (Question selection) and
 * how it is conducted (Attempt, Delivery, Scoring, Security, Completion). Both are configuration,
 * never code: naming a plan "Recruitment Screening" and switching on proctoring is the entire act
 * of creating that kind of examination.
 *
 * <p>Question selection is deliberately sentence-shaped — "take N from X, difficulty Y" — with the
 * available/required check rendered next to each line. That check is server-computed against the
 * live bank, so a plan cannot be published asking for ten hard questions when seven exist.
 */

const DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD"];

type PanelId = "selection" | "attempt" | "delivery" | "security" | "completion";

const PANELS: { id: PanelId; label: string }[] = [
  { id: "selection", label: "Questions" },
  { id: "attempt", label: "Attempt & scoring" },
  { id: "delivery", label: "Delivery" },
  { id: "security", label: "Security" },
  { id: "completion", label: "Outcome" },
];

/**
 * The four things sitting a plan can produce. This is the one enum in the exam model, because it
 * genuinely branches behaviour — a "certification exam" is this value plus the security settings
 * above, not a separate kind of exam with its own code path.
 */
const OUTCOME_OPTIONS: { value: AssessmentOutcome; label: string; description: string }[] = [
  {
    value: "NONE",
    label: "Score only",
    description: "A result the candidate can see. Practice drills and formative checks.",
  },
  {
    value: "COMPLETION",
    label: "Counts towards completion",
    description: "Passing satisfies the course or event this assessment is placed in.",
  },
  {
    value: "GRADE_CARD",
    label: "Issues a grade card",
    description:
      "A durable, verifiable transcript with a per-section breakdown — issued on a fail as well as a pass.",
  },
  {
    value: "CERTIFICATE",
    label: "Certification",
    description: "A grade card, plus eligibility for a certificate.",
  },
];

export function PlanWorkspace({
  plan,
  pools,
  bankSections,
  onChanged,
  onCreate,
  readOnly,
}: {
  plan: ExamPlanResponse | null;
  pools: QuestionPoolDetail[];
  bankSections: SectionResponse[];
  onChanged: () => void;
  onCreate: () => void;
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
        title="Create an exam plan to define how this examination will be conducted"
        description="A plan decides which questions go on the paper, how long candidates get, how many attempts they have, what counts as a pass, and whether it is proctored. One exam can have several — a practice run and a certification, say."
        action={
          !readOnly && (
            <button
              type="button"
              onClick={onCreate}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#14142b] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-black"
            >
              <Plus size={14} /> New plan
            </button>
          )
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Plan header ─────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
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
            className="w-full truncate rounded-xl border border-transparent bg-transparent px-2 py-1 text-xl font-black tracking-tight text-[#14142b] outline-none hover:border-slate-200 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
          />
          <p className="mt-0.5 px-2 text-xs font-medium text-[#14142b]/50">
            {plan.totalQuestions} question{plan.totalQuestions === 1 ? "" : "s"} · {plan.durationMinutes} min
            · pass at {plan.passPercentage}%
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <PlanStatusBadge validation={validation} validating={validating} />
          {!readOnly && (
            <>
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
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-[#14142b]"
              >
                <Copy size={14} />
              </button>
              <button
                type="button"
                title="Delete this plan"
                onClick={async () => {
                  try {
                    await deleteExamPlan(plan.id);
                    toast.success("Plan deleted");
                    onChanged();
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Couldn't delete this plan");
                  }
                }}
                className="rounded-xl border border-slate-200 bg-white p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Panel switcher ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5">
        {PANELS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPanel(p.id)}
            aria-current={panel === p.id ? "page" : undefined}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors ${
              panel === p.id
                ? "bg-[#14142b] text-white shadow-sm"
                : "border border-white/50 bg-white/60 text-slate-500 backdrop-blur-md hover:bg-white hover:text-[#14142b]"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

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
            <NumberField
              key={`duration:${plan.durationMinutes}`}
              label="Duration"
              suffix="minutes"
              value={plan.durationMinutes}
              disabled={readOnly || busy}
              onCommit={(v) => patchPlan({ durationMinutes: v })}
            />
            <NumberField
              key={`attempts:${plan.maxAttempts}`}
              label="Attempts allowed"
              value={plan.maxAttempts}
              disabled={readOnly || busy}
              onCommit={(v) => patchPlan({ maxAttempts: v })}
            />
            <NumberField
              key={`pass:${plan.passPercentage}`}
              label="Pass mark"
              suffix="%"
              value={plan.passPercentage}
              disabled={readOnly || busy}
              onCommit={(v) => patchPlan({ passPercentage: v })}
            />
            <ToggleField
              label="Everyone sits the same paper"
              description="Off means each candidate gets their own selection drawn from the same rules."
              value={plan.fixedPaper}
              disabled={readOnly || busy}
              onChange={(v) => patchPlan({ fixedPaper: v })}
            />
            <ToggleField
              label="Shuffle question order"
              value={plan.shuffleQuestions}
              disabled={readOnly || busy}
              onChange={(v) => patchPlan({ shuffleQuestions: v })}
            />
            <ToggleField
              label="Shuffle answer options"
              description="Fixed once per attempt, so a candidate's options never move under them."
              value={plan.shuffleOptions}
              disabled={readOnly || busy}
              onChange={(v) => patchPlan({ shuffleOptions: v })}
            />
          </SettingsCard>
        )}

        {panel === "delivery" && (
          <SettingsCard title="Delivery" description="When candidates may sit this exam.">
            <div className="flex flex-col gap-2 py-3">
              <span className="text-xs font-bold text-[#14142b]">Availability</span>
              <div className="grid gap-2 sm:grid-cols-2">
                {(["ON_DEMAND", "SCHEDULED"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    disabled={readOnly || busy}
                    onClick={() => patchPlan({ deliveryMode: mode })}
                    className={`rounded-xl border p-3 text-left transition-all ${
                      plan.deliveryMode === mode
                        ? "border-indigo-300 bg-indigo-50/60 ring-1 ring-indigo-200"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs font-bold text-[#14142b]">
                      {mode === "ON_DEMAND" ? "Any time" : "Scheduled window"}
                    </span>
                    <span className="mt-1 block text-[11px] leading-relaxed text-slate-500">
                      {mode === "ON_DEMAND"
                        ? "Eligible candidates start whenever they are ready."
                        : "Only startable between the dates below."}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {plan.deliveryMode === "SCHEDULED" && (
              <>
                <DateField
                  label="Opens"
                  value={plan.opensAt}
                  disabled={readOnly || busy}
                  onCommit={(v) => patchPlan({ opensAt: v })}
                />
                <DateField
                  label="Closes"
                  value={plan.closesAt}
                  disabled={readOnly || busy}
                  onCommit={(v) => patchPlan({ closesAt: v })}
                />
              </>
            )}

            <ToggleField
              label="Require registration"
              description="Candidates must register before they can start."
              value={plan.registrationRequired}
              disabled={readOnly || busy}
              onChange={(v) => patchPlan({ registrationRequired: v })}
            />
            <ToggleField
              label="Available to candidates"
              description="Turn off to keep this plan hidden while you work on it, even after the exam is published."
              value={plan.active}
              disabled={readOnly || busy}
              onChange={(v) => patchPlan({ active: v })}
            />
          </SettingsCard>
        )}

        {panel === "security" && (
          <SettingsCard
            title="Security"
            description="Higher-stakes plans can require identity checks and monitoring. These are settings on this plan, so the same exam can be practised freely and sat under supervision."
          >
            <ToggleField
              label="Proctoring"
              description="Candidates are monitored during the attempt."
              value={plan.proctoringRequired}
              disabled={readOnly || busy}
              onChange={(v) => patchPlan({ proctoringRequired: v })}
            />
            <ToggleField
              label="Identity verification"
              value={plan.identityVerificationRequired}
              disabled={readOnly || busy}
              onChange={(v) => patchPlan({ identityVerificationRequired: v })}
            />
            <ToggleField
              label="Full screen required"
              value={plan.fullscreenRequired}
              disabled={readOnly || busy}
              onChange={(v) => patchPlan({ fullscreenRequired: v })}
            />
          </SettingsCard>
        )}

        {panel === "completion" && (
          <SettingsCard
            title="Outcome"
            description="What sitting this plan produces."
          >
            {/* One outcome replaces the two toggles that used to live here. Each step includes
                everything below it, so they read as increasing weight rather than as independent
                switches that could be combined into states nothing implemented. */}
            <div className="space-y-2">
              {OUTCOME_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  disabled={readOnly || busy}
                  onClick={() => patchPlan({ outcome: option.value })}
                  className={`flex w-full flex-col items-start gap-0.5 rounded-xl border px-4 py-3 text-left transition-colors disabled:opacity-60 ${
                    plan.outcome === option.value
                      ? "border-[#14142b] bg-[#14142b]/[0.04]"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <span className="text-[13px] font-semibold text-[#14142b]">{option.label}</span>
                  <span className="text-[12px] font-medium text-slate-500">
                    {option.description}
                  </span>
                </button>
              ))}
            </div>

            <ToggleField
              label="Require course completion first"
              description="Candidates must finish the course this assessment is placed in before they can sit it."
              value={plan.requiresHostCompletion}
              disabled={readOnly || busy}
              onChange={(v) => patchPlan({ requiresHostCompletion: v })}
            />
          </SettingsCard>
        )}
      </div>
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
        className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700"
      >
        <Check size={12} /> Ready
      </span>
    );
  }
  return (
    <span
      title={readiness.message}
      className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-[11px] font-bold text-amber-700"
    >
      <AlertTriangle size={12} />
      {readiness.state === "empty"
        ? "No questions selected"
        : `${readiness.shortRules} line${readiness.shortRules === 1 ? "" : "s"} short`}
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
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#14142b] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-black"
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
          className="rounded-2xl border border-white/50 bg-white/70 p-5 shadow-sm backdrop-blur-md"
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
              className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-bold text-[#14142b] outline-none hover:border-slate-200 focus:border-indigo-300 focus:bg-white"
            />
            {savingSection === section.id && <Loader2 size={13} className="animate-spin text-slate-400" />}
            {!readOnly && plan.sections.length > 1 && (
              <button
                type="button"
                title="Remove this part"
                onClick={() => deletePlanSection(section.id).then(onChanged)}
                className="rounded-md p-1.5 text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-600"
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
                className="mt-1 flex items-center gap-1.5 rounded-xl border border-dashed border-slate-200 px-3 py-2 text-xs font-bold text-slate-400 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-[#14142b]"
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
          className="flex items-center justify-center gap-1.5 rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-xs font-bold text-slate-400 transition-colors hover:border-slate-300 hover:bg-white/60 hover:text-[#14142b]"
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
        short ? "border-amber-200 bg-amber-50/40" : "border-slate-200 bg-white"
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
        className="w-16 rounded-lg border border-slate-200 px-2 py-1 text-center text-xs font-bold text-[#14142b] outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200"
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
        className="min-w-0 max-w-[220px] flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-[#14142b] outline-none focus:border-indigo-300"
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
        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-[#14142b] outline-none focus:border-indigo-300"
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
        className="w-[76px] rounded-lg border border-slate-200 px-2 py-1 text-center text-xs font-semibold text-[#14142b] outline-none placeholder:text-slate-300 focus:border-indigo-300"
      />

      <div className="ml-auto flex items-center gap-2">
        {availability && (
          <span
            className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${
              availability.ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-100 text-amber-800"
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
            className="rounded-md p-1.5 text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-600"
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
    <div className="rounded-2xl border border-white/50 bg-white/70 p-5 shadow-sm backdrop-blur-md">
      <h3 className="text-sm font-black tracking-tight text-[#14142b]">{title}</h3>
      {description && <p className="mt-1 text-xs leading-relaxed text-slate-500">{description}</p>}
      <div className="mt-3 divide-y divide-slate-100">{children}</div>
    </div>
  );
}

function NumberField({
  label,
  suffix,
  value,
  disabled,
  onCommit,
}: {
  label: string;
  suffix?: string;
  value: number;
  disabled?: boolean;
  onCommit: (value: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));

  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <label className="text-xs font-bold text-[#14142b]">{label}</label>
      <div className="flex shrink-0 items-center gap-1.5">
        <input
          type="number"
          min={1}
          value={draft}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={() => {
            const next = Number(draft);
            if (Number.isFinite(next) && next > 0 && next !== value) onCommit(next);
            else setDraft(String(value));
          }}
          className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-center text-xs font-bold text-[#14142b] outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-200 disabled:bg-slate-50"
        />
        {suffix && <span className="text-[11px] font-semibold text-slate-400">{suffix}</span>}
      </div>
    </div>
  );
}

function DateField({
  label,
  value,
  disabled,
  onCommit,
}: {
  label: string;
  value: string | null;
  disabled?: boolean;
  onCommit: (value: string | null) => void;
}) {
  // <input type="datetime-local"> speaks local time without an offset; the API wants an ISO
  // instant, so the conversion happens here rather than being pushed onto the server.
  const local = value ? new Date(value).toISOString().slice(0, 16) : "";
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <label className="text-xs font-bold text-[#14142b]">{label}</label>
      <input
        type="datetime-local"
        defaultValue={local}
        disabled={disabled}
        onBlur={(e) => {
          const raw = e.target.value;
          onCommit(raw ? new Date(raw).toISOString() : null);
        }}
        className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-semibold text-[#14142b] outline-none focus:border-indigo-300 disabled:bg-slate-50"
      />
    </div>
  );
}

function ToggleField({
  label,
  description,
  value,
  disabled,
  onChange,
}: {
  label: string;
  description?: string;
  value: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <div className="min-w-0">
        <span className="text-xs font-bold text-[#14142b]">{label}</span>
        {description && <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!value)}
        className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
          value ? "bg-indigo-600" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            value ? "translate-x-[18px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
