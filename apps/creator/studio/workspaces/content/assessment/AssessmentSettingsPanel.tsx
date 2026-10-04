"use client";

// The authoring page for one assessment placed in a container.
//
// Selecting an assessment in the tree opens this in the canvas, the same way selecting a lesson
// opens the lesson editor — authoring an assessment is editing a page, not a trip to another part
// of the app. What lives here is everything about *this placement*: its title and how it introduces
// itself to a candidate. Its type (completion or assessment), questions and settings belong to its
// plan on the content's exam, so those open the Exam workspace explicitly.

import { useCallback, useEffect, useRef, useState } from "react";
import { ExternalLink, GraduationCap, Loader2 } from "lucide-react";
import { ArcadeEditor } from "@/apps/creator/editor";
import type { TiptapDocument } from "@/shared/types/editor.types";
import {
  getExamPlan,
  planKindLabel,
  planTypeMeta,
  updateAssessmentPlacement,
  type ExamPlanResponse,
} from "@/domains/assessments";
import type { AssessmentLeaf } from "../types";

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

  const saveInstructions = useCallback(
    (doc: TiptapDocument) => persist({ instructions: JSON.stringify(doc) }),
    [persist]
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-1 py-2">
      <header className="mb-7">
        <div className="mb-3 flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-lg bg-ink/[0.06] text-ink">
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
          className="w-full border-0 bg-transparent p-0 text-[1.6rem] font-bold leading-tight tracking-tight text-ink outline-none placeholder:text-slate-300"
        />

        {error && <p className="mt-2 text-[12px] font-semibold text-rose-600 dark:text-rose-400">{error}</p>}
      </header>

      <section className="mb-7 rounded-xl border border-slate-200 bg-surface px-4 py-3.5">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${planTypeMeta(assessment.planType).chip}`}
        >
          {planKindLabel(assessment.planType, plan?.graded ?? true)}
        </span>
        <p className="mt-2 text-[12px] font-medium text-slate-500">
          {assessment.planType === "COMPLETION"
            ? "Passing this completes the course for the learner. A course has one completion assessment."
            : plan && !plan.graded
            ? "A practice check: learners see their score, and it doesn't count towards anything."
            : "A graded check: it appears on the learner's assessment transcript when they complete the course."}
        </p>
      </section>

      <section className="mb-7">
        <h2 className="mb-1 text-[12px] font-bold uppercase tracking-wider text-slate-400">
          Instructions
        </h2>
        <p className="mb-3 text-[12px] font-medium text-slate-500">
          Shown on the assessment&apos;s page, above the Start button — what it covers, how to sit
          it, anything a candidate should know first.
        </p>
        <div className="rounded-xl border border-slate-200 bg-surface px-4 py-3">
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
        <h2 className="text-[13px] font-semibold text-ink">Questions & timing</h2>
        <p className="mt-1 text-[12px] font-medium leading-relaxed text-slate-500">
          This assessment is a <strong className="font-semibold text-slate-600">plan</strong> on the
          course&apos;s exam. Every assessment in this course shares that exam and its question bank;
          each plan sets which questions it draws, the time, attempts and pass mark — within the
          platform&apos;s standard for its type.
        </p>
        {plan && (
          <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[12px]">
            <span className="flex gap-1.5">
              <dt className="font-medium text-slate-400">Duration</dt>
              <dd className="font-semibold text-ink">{plan.durationMinutes} min</dd>
            </span>
            <span className="flex gap-1.5">
              <dt className="font-medium text-slate-400">Attempts</dt>
              <dd className="font-semibold text-ink">{plan.maxAttempts}</dd>
            </span>
            {(plan.planType !== "ASSESSMENT" || plan.graded) && (
              <span className="flex gap-1.5">
                <dt className="font-medium text-slate-400">Pass mark</dt>
                <dd className="font-semibold text-ink">{plan.passPercentage}%</dd>
              </span>
            )}
            <span className="flex gap-1.5">
              <dt className="font-medium text-slate-400">Questions</dt>
              <dd className="font-semibold text-ink">{plan.totalQuestions}</dd>
            </span>
            {plan.proctoringRequired && (
              <span className="flex gap-1.5">
                <dt className="font-medium text-slate-400">Proctored</dt>
                <dd className="font-semibold text-ink">Yes</dd>
              </span>
            )}
          </dl>
        )}
        {plan && plan.totalQuestions === 0 && (
          // Honest rather than silent: a plan with no selection rules generates an empty paper and
          // the attempt would be refused at start.
          <p className="mt-2.5 text-[12px] font-semibold text-amber-700 dark:text-amber-300">
            No questions selected yet — set this assessment&apos;s question selection before
            publishing, or candidates won&apos;t be able to start it.
          </p>
        )}
        <button
          type="button"
          onClick={() => onEditExam(assessment.examId)}
          className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-[12px] font-semibold text-on-ink transition-colors hover:bg-ink-hover"
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
