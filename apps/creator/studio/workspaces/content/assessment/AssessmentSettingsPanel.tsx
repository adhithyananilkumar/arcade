"use client";

// The authoring page for one assessment placed in a container.
//
// Selecting an assessment in the tree opens this in the canvas, the same way selecting a lesson
// opens the lesson editor — authoring an assessment is editing a page, not a trip to another part
// of the app. What lives here is everything about *this placement*: how it introduces itself to a
// candidate, and whether passing it is required. The questions and plans belong to the exam itself,
// which is shared across every placement, so those open the Exam workspace explicitly.

import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, GraduationCap, Loader2 } from "lucide-react";
import { ArcadeEditor } from "@/apps/creator/editor";
import type { TiptapDocument } from "@/shared/types/editor.types";
import {
  getExamPlan,
  updateAssessmentPlacement,
  type AssessmentOutcome,
  type ExamPlanResponse,
} from "@/domains/assessments";
import type { AssessmentLeaf } from "../types";

/** Plain-English names for what passing produces, matching the Exam workspace's own wording. */
const OUTCOME_LABELS: Record<AssessmentOutcome, string> = {
  NONE: "Score only",
  COMPLETION: "Counts towards completion",
  GRADE_CARD: "Grade card",
  CERTIFICATE: "Certification",
};

export interface AssessmentSettingsPanelProps {
  assessment: AssessmentLeaf;
  readOnly?: boolean;
  /** Opens the Exam workspace, where the questions and plans for the underlying exam live. */
  onEditExam: (examId: string) => void;
  /** Lets the runtime keep its sidebar copy of this assessment in step with edits made here. */
  onChange: (patch: Partial<AssessmentLeaf>) => void;
}

const EMPTY_DOC: TiptapDocument = { type: "doc", content: [] };

export function AssessmentSettingsPanel({
  assessment,
  readOnly = false,
  onEditExam,
  onChange,
}: AssessmentSettingsPanelProps) {
  const [title, setTitle] = useState(assessment.title);
  const [required, setRequired] = useState(assessment.requiredForCompletion);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The initial document is read once: re-deriving it on every render would reset the editor's
  // content mid-typing, since the editor treats initialContent as a mount-time seed.
  const initialInstructions = useRef<TiptapDocument>(parseInstructions(assessment.instructions));

  // Read-only here: the plan is edited in the Exam workspace, where its question selection lives.
  // Showing it makes the shared-exam relationship visible rather than something authors infer.
  const [plan, setPlan] = useState<ExamPlanResponse | null>(null);
  useEffect(() => {
    if (!assessment.planId) {
      setPlan(null);
      return;
    }
    let cancelled = false;
    getExamPlan(assessment.planId)
      .then((p) => {
        if (!cancelled) setPlan(p);
      })
      .catch(() => {
        // Best-effort: the page is still useful without the summary.
      });
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

  const commitTitle = () => {
    const next = title.trim();
    if (!next || next === assessment.title) {
      setTitle(assessment.title);
      return;
    }
    onChange({ title: next });
    void persist({ titleOverride: next });
  };

  const toggleRequired = () => {
    const next = !required;
    setRequired(next);
    onChange({ requiredForCompletion: next });
    void persist({ requiredForCompletion: next });
  };

  const saveInstructions = useCallback(
    (doc: TiptapDocument) => persist({ instructions: JSON.stringify(doc) }),
    [persist]
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-1 py-2">
      <header className="mb-7">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-[#14142b]/[0.06] text-[#14142b]">
            <GraduationCap size={15} />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Assessment
          </span>
          {saving && <Loader2 size={13} className="animate-spin text-slate-300" />}
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
          className="w-full border-0 bg-transparent p-0 text-[1.6rem] font-bold leading-tight tracking-tight text-[#14142b] outline-none placeholder:text-slate-300"
        />

        {error && <p className="mt-2 text-[12px] font-semibold text-rose-600">{error}</p>}
      </header>

      <section className="mb-7 rounded-xl border border-slate-200 bg-white px-4 py-3.5">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={required}
            onChange={toggleRequired}
            disabled={readOnly}
            className="mt-0.5 size-4 rounded border-slate-300 accent-[#14142b]"
          />
          <span>
            <span className="block text-[13px] font-semibold text-[#14142b]">
              Required to complete this course
            </span>
            <span className="block text-[12px] font-medium text-slate-500">
              Learners must pass this before the course counts as complete. It also counts towards
              their progress.
            </span>
          </span>
        </label>
      </section>

      <section className="mb-7">
        <h2 className="mb-1 text-[12px] font-bold uppercase tracking-wider text-slate-400">
          Instructions
        </h2>
        <p className="mb-3 text-[12px] font-medium text-slate-500">
          Shown on the assessment&apos;s page, above the Start button — what it covers, how to sit
          it, anything a candidate should know first.
        </p>
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
          <ArcadeEditor
            key={assessment.id}
            initialContent={initialInstructions.current}
            onSave={saveInstructions}
            placeholder="Tell candidates what to expect…"
            readOnly={readOnly}
            chromeless
            minHeight={180}
          />
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3.5">
        <h2 className="text-[13px] font-semibold text-[#14142b]">Questions & timing</h2>
        <p className="mt-1 text-[12px] font-medium leading-relaxed text-slate-500">
          This assessment is a <strong className="font-semibold text-slate-600">plan</strong> on the
          course&apos;s exam. Every assessment in this course shares that one exam and its question
          bank — what makes them different from each other is their plan: which questions it draws,
          how long candidates get, how many attempts, the pass mark, proctoring, and what passing
          produces.
        </p>
        {plan && (
          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[12px]">
            <span className="flex gap-1.5">
              <dt className="font-medium text-slate-400">Duration</dt>
              <dd className="font-semibold text-[#14142b]">{plan.durationMinutes} min</dd>
            </span>
            <span className="flex gap-1.5">
              <dt className="font-medium text-slate-400">Attempts</dt>
              <dd className="font-semibold text-[#14142b]">{plan.maxAttempts}</dd>
            </span>
            <span className="flex gap-1.5">
              <dt className="font-medium text-slate-400">Pass mark</dt>
              <dd className="font-semibold text-[#14142b]">{plan.passPercentage}%</dd>
            </span>
            <span className="flex gap-1.5">
              <dt className="font-medium text-slate-400">Questions</dt>
              <dd className="font-semibold text-[#14142b]">{plan.totalQuestions}</dd>
            </span>
            <span className="flex gap-1.5">
              <dt className="font-medium text-slate-400">Outcome</dt>
              <dd className="font-semibold text-[#14142b]">{OUTCOME_LABELS[plan.outcome]}</dd>
            </span>
          </dl>
        )}
        {plan && plan.totalQuestions === 0 && (
          // Honest rather than silent: a plan with no selection rules generates an empty paper and
          // the attempt would be refused at start.
          <p className="mt-2.5 text-[12px] font-semibold text-amber-700">
            No questions selected yet — set this assessment&apos;s question selection before
            publishing, or candidates won&apos;t be able to start it.
          </p>
        )}
        <button
          type="button"
          onClick={() => onEditExam(assessment.examId)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-[#14142b] px-4 py-2 text-[12px] font-semibold text-white transition-colors hover:bg-[#232735]"
        >
          {plan ? "Edit questions & plan" : "Open exam"}
          <ExternalLink size={13} />
        </button>
      </section>
    </div>
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
