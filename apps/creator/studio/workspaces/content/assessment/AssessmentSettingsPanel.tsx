"use client";

// The authoring page for one assessment placed in a container.
//
// Selecting an assessment in the tree opens this in the canvas, the same way selecting a lesson
// opens the lesson editor. It used to show the plan read-only and send every change ("make it
// practice", "allow 2 attempts") out to the exam workspace; authors found that jump confusing and
// the way back worse. The everyday settings of the assessment's plan are edited right here now —
// graded or practice, time, attempts, pass mark, shuffling — with the questions it draws listed.
// Choosing questions and the rarer settings still open the exam's own pages.

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  GraduationCap,
  ListChecks,
  Loader2,
  Lock,
  Pencil,
  Repeat,
  Shuffle,
  Target,
  type LucideIcon,
} from "lucide-react";
import { LazyArcadeEditor as ArcadeEditor } from "@/apps/creator/editor/lazy";
import type { TiptapDocument } from "@/shared/types/editor.types";
import {
  getExamPlan,
  planTypeMeta,
  updateAssessmentPlacement,
  updateExamPlan,
  type ExamPlanRequest,
  type ExamPlanResponse,
  type ExamSettingKey,
} from "@/domains/assessments";
import { withReturnTo } from "@/infrastructure/state/navigationHistory";
import type { AssessmentLeaf } from "../types";

export interface AssessmentSettingsPanelProps {
  assessment: AssessmentLeaf;
  readOnly?: boolean;
  /** Opens the Exam workspace, where the question bank lives. */
  onEditExam: (examId: string) => void;
  /** Lets the runtime keep its sidebar copy of this assessment in step with edits made here. */
  onChange: (patch: Partial<AssessmentLeaf>) => void;
}

const EMPTY_DOC: TiptapDocument = { type: "doc", content: [] };

export function AssessmentSettingsPanel({ assessment, readOnly = false, onEditExam, onChange }: AssessmentSettingsPanelProps) {
  const router = useRouter();
  const [title, setTitle] = useState(assessment.title);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The initial document is read once: re-deriving it on every render would reset the editor's
  // content mid-typing, since the editor treats initialContent as a mount-time seed.
  const initialInstructions = useRef<TiptapDocument>(parseInstructions(assessment.instructions));

  const [plan, setPlan] = useState<ExamPlanResponse | null>(null);
  const [planError, setPlanError] = useState(false);
  useEffect(() => {
    if (!assessment.planId) {
      setPlan(null);
      return;
    }
    let cancelled = false;
    setPlanError(false);
    getExamPlan(assessment.planId)
      .then((p) => !cancelled && setPlan(p))
      .catch(() => !cancelled && setPlanError(true));
    return () => {
      cancelled = true;
    };
  }, [assessment.planId]);

  const persist = useCallback(
    async (patch: Parameters<typeof updateAssessmentPlacement>[1]) => {
      setSaving(true);
      setError(null);
      try {
        await updateAssessmentPlacement(assessment.id, patch);
      } catch (e) {
        console.error("Failed to save assessment", e);
        setError("Could not save. Your last change may not have been recorded.");
      } finally {
        setSaving(false);
      }
    },
    [assessment.id]
  );

  /** Saves one plan setting; the server checks it against the platform standard. */
  const patchPlan = useCallback(
    async (req: ExamPlanRequest, label: string) => {
      if (!plan) return;
      setSaving(true);
      try {
        const next = await updateExamPlan(plan.id, req);
        setPlan(next);
        toast.success(`${label} saved`);
      } catch (e) {
        toast.error(e instanceof Error ? `Couldn't save ${label.toLowerCase()}: ${e.message}` : `Couldn't save ${label.toLowerCase()}.`);
      } finally {
        setSaving(false);
      }
    },
    [plan]
  );

  const commitTitle = () => {
    const next = title.trim();
    if (!next || next === assessment.title) {
      setTitle(assessment.title);
      return;
    }
    onChange({ title: next });
    void persist({ titleOverride: next });
  };

  const saveInstructions = useCallback((doc: TiptapDocument) => persist({ instructions: JSON.stringify(doc) }), [persist]);

  const setting = (key: ExamSettingKey) => plan?.settings.find((s) => s.key === key);
  const locked = (key: ExamSettingKey) => readOnly || saving || (setting(key) ? !setting(key)!.editable : false);
  const isCompletion = assessment.planType === "COMPLETION";
  const graded = plan ? plan.graded : true;
  const here = typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : undefined;
  const planPageHref = (tab = "plans") =>
    withReturnTo(`/studio/content/exam/${assessment.examId}?tab=${tab}${assessment.planId ? `&plan=${assessment.planId}` : ""}`, here);
  const tooFew = plan ? plan.totalQuestions < Math.max(1, plan.minQuestions) : false;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-1 py-2">
      {/* ── Title ─────────────────────────────────────────────────────── */}
      <header>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-ink/[0.06] text-ink">
            <GraduationCap size={15} />
          </span>
          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${planTypeMeta(assessment.planType).chip}`}>
            {isCompletion ? "Completion assessment" : graded ? "Graded assessment" : "Practice"}
          </span>
          {plan && (
            <span
              title={plan.live ? "Learners see this version." : "Saved as a draft — learners get it after the course is next approved."}
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                plan.live
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
              }`}
            >
              {plan.live ? "Live" : "Draft"}
            </span>
          )}
          <span className="ml-auto flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
            {saving ? (
              <>
                <Loader2 size={12} className="animate-spin" /> Saving…
              </>
            ) : (
              <>
                <CheckCircle2 size={12} /> Changes save automatically
              </>
            )}
          </span>
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={commitTitle}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
            if (e.key === "Escape") {
              setTitle(assessment.title);
              e.currentTarget.blur();
            }
          }}
          disabled={readOnly}
          placeholder="Assessment title"
          aria-label="Assessment title"
          className="w-full border-0 bg-transparent p-0 text-[1.6rem] font-bold leading-tight tracking-tight text-ink outline-none placeholder:text-slate-300"
        />
        {error && <p className="mt-2 text-[12px] font-semibold text-rose-600 dark:text-rose-400">{error}</p>}
      </header>

      {/* ── Kind: graded or practice ─────────────────────────────────── */}
      <Card title="What kind of check is this?">
        {isCompletion ? (
          <p className="text-[12.5px] font-medium leading-relaxed text-slate-600">
            The <b>completion assessment</b>: passing it marks the course as completed for the learner. A course has one.
          </p>
        ) : (
          <>
            <div role="radiogroup" aria-label="Graded or practice" className="grid gap-2 sm:grid-cols-2">
              <Choice
                selected={graded}
                disabled={!plan || locked("GRADED")}
                onSelect={() => !graded && patchPlan({ graded: true }, "Graded")}
                title="Graded"
                body="Has a pass mark and counts: the result appears on the learner's assessment transcript."
              />
              <Choice
                selected={!graded}
                disabled={!plan || locked("GRADED")}
                onSelect={() => graded && patchPlan({ graded: false }, "Practice")}
                title="Practice"
                body="For learning only: learners see their score, nothing is recorded as pass or fail."
              />
            </div>
            {plan && setting("GRADED") && !setting("GRADED")!.editable && <LockNote />}
          </>
        )}
      </Card>

      {/* ── Everyday plan settings ───────────────────────────────────── */}
      <Card
        title="Timing & scoring"
        hint="Within the platform's limits for this type — a locked field is set by the platform."
      >
        {!plan ? (
          planError ? (
            <p className="text-[12px] font-semibold text-rose-600 dark:text-rose-400">Couldn&apos;t load this assessment&apos;s settings. Reload to try again.</p>
          ) : (
            <Loader2 size={16} className="animate-spin text-slate-300" />
          )
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            <NumberSetting
              icon={Clock}
              label="Time limit"
              suffix="min"
              value={plan.durationMinutes}
              setting={setting("DURATION_MINUTES")}
              disabled={locked("DURATION_MINUTES")}
              onCommit={(v) => patchPlan({ durationMinutes: v }, "Time limit")}
            />
            <NumberSetting
              icon={Repeat}
              label="Attempts allowed"
              value={plan.maxAttempts}
              setting={setting("MAX_ATTEMPTS")}
              disabled={locked("MAX_ATTEMPTS")}
              onCommit={(v) => patchPlan({ maxAttempts: v }, "Attempts")}
            />
            {graded || isCompletion ? (
              <NumberSetting
                icon={Target}
                label="Pass mark"
                suffix="%"
                value={Number(plan.passPercentage)}
                setting={setting("PASS_PERCENTAGE")}
                disabled={locked("PASS_PERCENTAGE")}
                onCommit={(v) => patchPlan({ passPercentage: v }, "Pass mark")}
              />
            ) : (
              <div className="flex flex-col justify-center rounded-xl border border-dashed border-slate-200 px-3 py-2 text-[11.5px] font-medium text-slate-500">
                <span className="font-bold text-slate-600">No pass mark</span>
                Practice checks aren&apos;t passed or failed.
              </div>
            )}
          </div>
        )}
        {plan && (
          <div className="mt-3 flex flex-col divide-y divide-slate-100 rounded-xl border border-slate-200/80">
            <Toggle
              label="Shuffle question order"
              help="Each candidate gets the questions in a different order."
              value={plan.shuffleQuestions}
              disabled={locked("SHUFFLE_QUESTIONS")}
              onChange={(v) => patchPlan({ shuffleQuestions: v }, "Question order")}
            />
            <Toggle
              label="Shuffle answer options"
              help="The correct option isn't always in the same place. Fixed once per attempt."
              value={plan.shuffleOptions}
              disabled={locked("SHUFFLE_OPTIONS")}
              onChange={(v) => patchPlan({ shuffleOptions: v }, "Answer order")}
            />
            <Toggle
              label="Same paper for everyone"
              help="Every candidate gets the same questions instead of a fresh random draw."
              value={plan.fixedPaper}
              disabled={locked("FIXED_PAPER")}
              onChange={(v) => patchPlan({ fixedPaper: v }, "Same paper")}
            />
          </div>
        )}
        {plan && (
          <a
            href={planPageHref()}
            onClick={(e) => {
              e.preventDefault();
              router.push(planPageHref());
            }}
            className="mt-3 inline-flex items-center gap-1 text-[12px] font-bold text-[#205ca8] hover:underline dark:text-blue-400"
          >
            Security & more settings (proctoring, full screen…) <ArrowUpRight size={13} />
          </a>
        )}
      </Card>

      {/* ── Questions this assessment draws ──────────────────────────── */}
      <Card
        title="Questions"
        hint="Drawn from the course's question bank — one bank is shared by every assessment in this course."
        aside={plan && <span className="text-[12px] font-bold text-ink">{plan.totalQuestions} per attempt</span>}
      >
        {plan && plan.sections.some((s) => s.rules.length > 0) ? (
          <ul className="flex flex-col gap-1.5">
            {plan.sections.flatMap((section) =>
              section.rules.map((rule) => (
                <li key={rule.id} className="flex items-center gap-2.5 rounded-lg bg-slate-50/80 px-3 py-2 text-[12.5px] dark:bg-white/[0.03]">
                  <ListChecks size={14} className="shrink-0 text-slate-400" />
                  <span className="min-w-0 flex-1 truncate font-medium text-slate-700">
                    {plan.sections.length > 1 && <span className="text-slate-400">{section.title} · </span>}
                    {rule.sourceLabel}
                    {rule.difficulty ? ` · ${rule.difficulty.toLowerCase()}` : ""}
                  </span>
                  <span className="shrink-0 font-bold tabular-nums text-ink">
                    {rule.count} {rule.selectionMode === "MANUAL" ? "picked" : "random"}
                  </span>
                </li>
              ))
            )}
          </ul>
        ) : plan ? (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-[12px] font-semibold text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
            No questions chosen yet — candidates can&apos;t start it, and the course can&apos;t be submitted until you choose some.
          </p>
        ) : null}
        {plan && tooFew && plan.totalQuestions > 0 && (
          <p className="mt-2 text-[12px] font-semibold text-rose-600 dark:text-rose-400">
            Draws {plan.totalQuestions}; this type needs at least {plan.minQuestions}.
          </p>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => router.push(planPageHref())}
            className="inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[12px] font-semibold text-on-ink transition-colors hover:bg-ink-hover"
          >
            <ListChecks size={13} /> {plan && plan.totalQuestions > 0 ? "Change selection" : "Choose questions"}
          </button>
          <button
            type="button"
            onClick={() => onEditExam(assessment.examId)}
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-surface px-4 py-2 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Pencil size={13} /> Write questions in the bank
          </button>
        </div>
      </Card>

      {/* ── Instructions ─────────────────────────────────────────────── */}
      <Card title="Instructions" hint="Shown above the Start button — what it covers and anything a candidate should know first.">
        <div className="arcade-compact-editor rounded-xl border border-slate-200 bg-surface px-4 py-3">
          <ArcadeEditor
            key={assessment.id}
            initialContent={initialInstructions.current}
            onSave={saveInstructions}
            placeholder="Tell candidates what to expect…"
            readOnly={readOnly}
            chromeless
            minHeight={140}
          />
        </div>
      </Card>
    </div>
  );
}

function Card({
  title,
  hint,
  aside,
  children,
}: {
  title: string;
  hint?: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-surface/80 px-4 py-4 sm:px-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[13.5px] font-bold text-ink">{title}</h2>
          {hint && <p className="mt-0.5 text-[12px] font-medium leading-relaxed text-slate-500">{hint}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Choice({
  selected,
  disabled,
  onSelect,
  title,
  body,
}: {
  selected: boolean;
  disabled?: boolean;
  onSelect: () => void;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={`flex cursor-pointer flex-col gap-1 rounded-xl border px-3.5 py-3 text-left transition-all disabled:cursor-not-allowed ${
        selected
          ? "border-[#205ca8] bg-blue-50/70 ring-1 ring-[#205ca8] dark:border-blue-400 dark:bg-blue-500/10 dark:ring-blue-400"
          : "border-slate-200 bg-surface hover:border-slate-300 disabled:opacity-60"
      }`}
    >
      <span className="flex items-center gap-2 text-[13px] font-bold text-ink">
        <span className={`grid size-4 place-items-center rounded-full border-2 ${selected ? "border-[#205ca8] dark:border-blue-400" : "border-slate-300"}`}>
          {selected && <span className="size-1.5 rounded-full bg-[#205ca8] dark:bg-blue-400" />}
        </span>
        {title}
      </span>
      <span className="text-[11.5px] font-medium leading-relaxed text-slate-500">{body}</span>
    </button>
  );
}

function NumberSetting({
  icon: Icon,
  label,
  suffix,
  value,
  setting,
  disabled,
  onCommit,
}: {
  icon: LucideIcon;
  label: string;
  suffix?: string;
  value: number;
  setting?: { min: number | null; max: number | null; editable: boolean };
  disabled?: boolean;
  onCommit: (v: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);
  const min = setting?.min ?? 1;
  const max = setting?.max ?? undefined;
  const commit = () => {
    const n = Number(draft);
    if (!Number.isFinite(n) || draft.trim() === "") return setDraft(String(value));
    if (n < min || (max != null && n > max)) {
      toast.error(`${label} must be between ${min} and ${max ?? "any"}${suffix ? ` ${suffix}` : ""}.`);
      return setDraft(String(value));
    }
    if (n !== value) onCommit(n);
  };
  return (
    <label className="flex flex-col gap-1 rounded-xl border border-slate-200/80 px-3 py-2.5 focus-within:border-[#205ca8]">
      <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">
        <Icon size={12} /> {label}
        {setting && !setting.editable && <Lock size={11} aria-label="Set by the platform" />}
      </span>
      <span className="flex items-baseline gap-1">
        <input
          type="number"
          inputMode="numeric"
          value={draft}
          min={min}
          max={max}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          className="w-full min-w-0 bg-transparent text-lg font-extrabold tabular-nums text-ink outline-none disabled:text-slate-400"
        />
        {suffix && <span className="text-xs font-bold text-slate-400">{suffix}</span>}
      </span>
      {(setting?.min != null || setting?.max != null) && setting?.editable && (
        <span className="text-[10.5px] font-medium text-slate-400">
          {setting.min ?? 1}–{setting.max ?? "∞"}
          {suffix ? ` ${suffix}` : ""} allowed
        </span>
      )}
    </label>
  );
}

function Toggle({
  label,
  help,
  value,
  disabled,
  onChange,
}: {
  label: string;
  help: string;
  value: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className={`flex items-center gap-3 px-3.5 py-2.5 ${disabled ? "opacity-60" : "cursor-pointer"}`}>
      <Shuffle size={14} className="shrink-0 text-slate-400" />
      <span className="min-w-0 flex-1">
        <span className="block text-[12.5px] font-bold text-ink">{label}</span>
        <span className="block text-[11.5px] font-medium text-slate-500">{help}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!value)}
        className={`relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed ${value ? "bg-[#205ca8]" : "bg-slate-300 dark:bg-slate-600"}`}
      >
        <span className={`absolute top-0.5 size-4 rounded-full bg-white shadow transition-all ${value ? "left-[18px]" : "left-0.5"}`} />
      </button>
    </label>
  );
}

function LockNote() {
  return (
    <p className="mt-2 flex items-center gap-1.5 text-[11.5px] font-medium text-slate-500">
      <Lock size={12} /> Set by the platform for this kind of exam.
    </p>
  );
}

function parseInstructions(raw: string | null | undefined): TiptapDocument {
  if (!raw) return EMPTY_DOC;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as TiptapDocument) : EMPTY_DOC;
  } catch {
    return EMPTY_DOC;
  }
}
