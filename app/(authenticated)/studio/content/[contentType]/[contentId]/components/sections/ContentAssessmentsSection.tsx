"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ClipboardList, FileQuestion, Pencil } from "lucide-react";
import {
  getCourseExam,
  getEventExam,
  listAssessmentPlacementsForCourse,
  listExamPlans,
  planKindLabel,
  type AssessmentPlacementResponse,
  type ExamPlanResponse,
  type ExamResponse,
} from "@/domains/assessments";
import {
  WorkspaceLoading,
  WorkspaceMessage,
  WorkspaceRow,
  WorkspaceRows,
  workspaceSecondaryButton,
} from "@/apps/creator/studio/core/StudioWorkspaceKit";
import { editorHref } from "../../lib/contentTypeRouting";

type Loaded = {
  exam: ExamResponse | null;
  plans: ExamPlanResponse[];
  placements: AssessmentPlacementResponse[];
};

/** The exam dashboard, opened on a tab, remembering where the creator came from. */
export function examDashboardHref(examId: string, tab: string, from?: { segment: "course" | "event"; id: string }) {
  const params = new URLSearchParams({ tab });
  if (from) params.set(from.segment === "course" ? "fromCourse" : "fromEvent", from.id);
  return `/studio/content/exam/${examId}?${params.toString()}`;
}

function examState(exam: ExamResponse): { label: string; cls: string } {
  if (exam.published && exam.hasUnpublishedChanges) {
    return { label: "Live · unpublished changes", cls: "bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200" };
  }
  if (exam.published) return { label: "Live", cls: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" };
  return { label: "Not published yet", cls: "bg-slate-100 text-slate-600" };
}

/**
 * A course's or event's "Assessment & Exams" tab: its exam (a course or event has at most one),
 * the plans that exam offers and, for a course, where each assessment sits in the curriculum.
 * Configuring any of it happens on the exam's own dashboard; this tab is the way there.
 */
export function ContentAssessmentsSection({ segment, contentId }: { segment: "course" | "event"; contentId: string }) {
  const [data, setData] = useState<Loaded | null | "error">(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const exam = await (segment === "event" ? getEventExam(contentId) : getCourseExam(contentId));
        const [plans, placements] = await Promise.all([
          exam ? listExamPlans(exam.id).catch(() => []) : Promise.resolve([]),
          segment === "course" ? listAssessmentPlacementsForCourse(contentId).catch(() => []) : Promise.resolve([]),
        ]);
        if (!cancelled) setData({ exam, plans, placements });
      } catch {
        if (!cancelled) setData("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [segment, contentId]);

  if (data === null) return <WorkspaceLoading />;
  if (data === "error") {
    return (
      <WorkspaceMessage icon={FileQuestion} tone="warning" title="Couldn’t load this exam">
        Reload the page to try again.
      </WorkspaceMessage>
    );
  }

  const { exam, plans, placements } = data;
  const from = { segment, id: contentId };

  if (!exam) {
    return (
      <WorkspaceMessage
        icon={ClipboardList}
        title={`This ${segment} has no exam yet`}
        action={
          <Link href={editorHref(segment, contentId)} className={workspaceSecondaryButton}>
            <Pencil size={14} /> Open the {segment} editor
          </Link>
        }
      >
        {segment === "course"
          ? "Add an assessment between lessons in the course editor. The first one creates the course's exam, and every later assessment draws from the same question bank."
          : "Add an assessment in the event editor to create the event's exam."}
      </WorkspaceMessage>
    );
  }

  const state = examState(exam);
  const planById = new Map(plans.map((p) => [p.id, p]));
  const orderedPlacements = placements.slice().sort((a, b) => a.position - b.position);

  return (
    <WorkspaceRows>
      <WorkspaceRow
        step={1}
        title="Exam"
        description={`The question bank and plans behind every assessment in this ${segment}. It is reviewed and published with the ${segment}.`}
        aside={<span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${state.cls}`}>{state.label}</span>}
      >
        <div className="flex flex-col gap-3">
          <p className="text-base font-extrabold text-ink">{exam.title}</p>
          {exam.description && <p className="text-xs font-medium leading-relaxed text-slate-500">{exam.description}</p>}
          <div className="flex flex-wrap gap-2 pt-1">
            <Link
              href={examDashboardHref(exam.id, "plans", from)}
              className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-xs font-extrabold text-on-ink shadow-md transition-all hover:bg-[#205ca8]"
            >
              <ArrowUpRight size={14} /> Open exam dashboard
            </Link>
            <Link href={editorHref("exam", exam.id)} className={workspaceSecondaryButton}>
              <Pencil size={14} /> Edit question bank
            </Link>
          </div>
        </div>
      </WorkspaceRow>

      <WorkspaceRow
        step={2}
        title="Exam plans"
        description="How the exam is sat: duration, attempts, pass mark and security are set per plan."
        aside={
          <Link href={examDashboardHref(exam.id, "plans", from)} className="text-xs font-bold text-[#205ca8] hover:underline dark:text-blue-400">
            Manage plans →
          </Link>
        }
      >
        {plans.length === 0 ? (
          <p className="text-xs font-medium text-slate-500">No plans yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {plans.map((plan) => (
              <li key={plan.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink">{plan.name}</p>
                  <p className="text-[11px] font-medium text-slate-400">
                    {planKindLabel(plan.planType, plan.graded)} · {plan.totalQuestions} questions · {plan.durationMinutes} min
                    {plan.graded || plan.planType === "CERTIFICATION" ? ` · pass ${plan.passPercentage}%` : ""}
                  </p>
                </div>
                {!plan.active && (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                    Hidden
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </WorkspaceRow>

      {segment === "course" && (
        <WorkspaceRow
          step={3}
          title="Assessments in the curriculum"
          description="Where learners meet the exam while working through the course, in course order. Move them in the course editor."
        >
          {orderedPlacements.length === 0 ? (
            <p className="text-xs font-medium text-slate-500">None placed in the course yet.</p>
          ) : (
            <ol className="divide-y divide-slate-100">
              {orderedPlacements.map((placement, i) => {
                const plan = planById.get(placement.planId);
                return (
                  <li key={placement.id} className="flex items-center gap-3 py-3 first:pt-0">
                    <span className="w-6 shrink-0 text-xs font-black tabular-nums text-slate-300">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-ink">{placement.titleOverride || plan?.name || "Assessment"}</p>
                      {plan && <p className="text-[11px] font-medium text-slate-400">{planKindLabel(plan.planType, plan.graded)}</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </WorkspaceRow>
      )}
    </WorkspaceRows>
  );
}
