"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpRight,
  Award,
  ClipboardCheck,
  Clock,
  FileQuestion,
  Flag,
  HelpCircle,
  ListChecks,
  MapPin,
  Pencil,
  Repeat,
  Send,
  Target,
  type LucideIcon,
} from "lucide-react";
import {
  getCourseExam,
  getEventExam,
  listAssessmentPlacementsForCourse,
  listExamPlans,
  planKindLabel,
  planTypeMeta,
  type AssessmentPlacementResponse,
  type ExamPlanResponse,
  type ExamPlanType,
  type ExamResponse,
} from "@/domains/assessments";
import { WorkspaceLoading, WorkspaceMessage, workspaceSecondaryButton } from "@/apps/creator/studio/core/StudioWorkspaceKit";
import { withReturnTo } from "@/infrastructure/state/navigationHistory";
import { editorHref } from "../../lib/contentTypeRouting";

type Segment = "course" | "event";

type Loaded = {
  exam: ExamResponse | null;
  plans: ExamPlanResponse[];
  placements: AssessmentPlacementResponse[];
};

/** The exam dashboard, opened on a tab, remembering where the creator came from. */
export function examDashboardHref(examId: string, tab: string, from?: { segment: Segment; id: string }, planId?: string) {
  const params = new URLSearchParams({ tab });
  if (from) params.set(from.segment === "course" ? "fromCourse" : "fromEvent", from.id);
  if (planId) params.set("plan", planId);
  return `/studio/content/exam/${examId}?${params.toString()}`;
}

const TYPE_ICON: Record<ExamPlanType, LucideIcon> = {
  ASSESSMENT: ClipboardCheck,
  COMPLETION: Flag,
  CERTIFICATION: Award,
};

/** What each kind of plan is for, in the words a creator needs before choosing one. */
function typeGuide(segment: Segment): Array<{ type: ExamPlanType; title: string; body: string }> {
  return [
    {
      type: "ASSESSMENT",
      title: "Assessment",
      body: `A graded or practice check placed between lessons. Learners take it inside the ${segment}.`,
    },
    {
      type: "COMPLETION",
      title: "Completion",
      body: `The final check. Passing it marks the ${segment} as completed. At most one.`,
    },
    {
      type: "CERTIFICATION",
      title: "Certification",
      body: `Listed in Explore → Exams. Learners must complete this ${segment} first; passing issues a certificate. At most one.`,
    },
  ];
}

/** Where a learner meets this plan, in one line. */
function whereLearnersFindIt(plan: ExamPlanResponse, placed: boolean, segment: Segment): { text: string; warn: boolean } {
  if (plan.planType === "CERTIFICATION") {
    return { text: `Explore → Exams, after completing this ${segment}`, warn: false };
  }
  if (!placed) {
    return { text: `Not placed in the ${segment} yet — learners can't reach it. Place it from the ${segment} editor.`, warn: true };
  }
  return {
    text: plan.planType === "COMPLETION" ? `Inside the ${segment} · passing completes it` : `Inside the ${segment} curriculum`,
    warn: false,
  };
}

/**
 * A course's or event's "Assessment & Exams" tab.
 *
 * <p>Rebuilt because creators found linked exams hard to follow: the tab listed plan names with a
 * terse "Graded assessment · 0 questions" line and sent everything else to the exam dashboard. It
 * now says what a linked exam is and what each kind of plan does, shows where learners meet each
 * plan, flags what stops a plan from working (no questions, not placed, not live), and says when a
 * change still needs this content to be submitted before learners see it — the reason a new
 * certification never appeared in Explore.
 */
export function ContentAssessmentsSection({ segment, contentId }: { segment: Segment; contentId: string }) {
  const [data, setData] = useState<Loaded | null | "error">(null);
  const [showGuide, setShowGuide] = useState(false);

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
  const here = `/studio/content/${segment}/${contentId}?tab=exams`;
  const publishingHref = `/studio/content/${segment}/${contentId}?tab=publishing`;

  if (!exam) {
    return (
      <div className="flex flex-col gap-6">
        <Intro segment={segment} />
        <WorkspaceMessage
          icon={ListChecks}
          title={`This ${segment} has no exam yet`}
          action={
            <Link href={editorHref(segment, contentId)} className={workspaceSecondaryButton}>
              <Pencil size={14} /> Open the {segment} editor
            </Link>
          }
        >
          {segment === "course"
            ? "In the course editor, use “Add assessment” under a module. The first one creates the course's exam; every later assessment draws questions from the same question bank."
            : "In the event editor, use “Set up exam” to create the event's exam."}
        </WorkspaceMessage>
        <TypeGuide segment={segment} />
      </div>
    );
  }

  const placedPlanIds = new Set(placements.map((p) => p.planId));
  // A plan with a placement on the plan itself counts as placed too (events place per day).
  plans.forEach((p) => p.placement && placedPlanIds.add(p.id));
  const draftPlans = plans.filter((p) => p.active && p.live === false);
  const pendingChanges = exam.hasUnpublishedChanges || draftPlans.length > 0;
  const inReview = exam.status === "SUBMITTED";
  const hasCertification = plans.some((p) => p.planType === "CERTIFICATION");
  const order = { COMPLETION: 1, ASSESSMENT: 0, CERTIFICATION: 2 } as const;
  const sorted = plans.slice().sort((a, b) => order[a.planType] - order[b.planType] || a.position - b.position);

  return (
    <div className="flex flex-col gap-6">
      <Intro segment={segment} />

      {/* What still has to happen before learners see the latest version. */}
      {pendingChanges && (
        <div
          role="status"
          className={`flex flex-col gap-3 rounded-2xl border px-4 py-3.5 sm:flex-row sm:items-center ${
            inReview
              ? "border-sky-200 bg-sky-50/80 text-sky-900 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-200"
              : "border-amber-200 bg-amber-50/80 text-amber-900 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200"
          }`}
        >
          <AlertTriangle size={18} className="shrink-0" />
          <div className="min-w-0 flex-1 text-[12.5px] leading-relaxed">
            <p className="font-bold">
              {inReview ? "Your exam changes are in review" : "Exam changes aren’t live yet"}
            </p>
            <p className="font-medium opacity-90">
              {draftPlans.length > 0
                ? `${draftPlans.map((p) => `“${p.name}”`).join(", ")} ${draftPlans.length === 1 ? "is" : "are"} saved as a draft only. `
                : "Edits made since the last approval are saved as a draft. "}
              {inReview
                ? `Learners get them when the ${segment} is approved.`
                : `This exam is reviewed with the ${segment}: learners see changes after you submit the ${segment} and it is approved.`}
              {draftPlans.some((p) => p.planType === "CERTIFICATION") &&
                !inReview &&
                " Until then the certification is not listed in Explore → Exams."}
            </p>
          </div>
          {!inReview && (
            <Link
              href={publishingHref}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-ink px-4 py-2 text-xs font-extrabold text-on-ink hover:bg-ink-hover"
            >
              <Send size={13} /> Submit {segment} for review
            </Link>
          )}
        </div>
      )}

      {/* The exam itself */}
      <section className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-surface/80 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Linked exam</p>
            <p className="mt-0.5 truncate text-lg font-extrabold text-ink">{exam.title}</p>
            <p className="mt-1 max-w-xl text-xs font-medium leading-relaxed text-slate-500">
              One question bank for this {segment}. Every assessment, the completion check and the certification below draw
              their questions from it.
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
              exam.published
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {exam.published ? "Live" : "Not published yet"}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href={withReturnTo(editorHref("exam", exam.id), here)}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-xs font-extrabold text-on-ink shadow-md transition-all hover:bg-ink-hover"
          >
            <Pencil size={14} /> Write questions
          </Link>
          <Link href={withReturnTo(examDashboardHref(exam.id, "plans", from), here)} className={workspaceSecondaryButton}>
            <ArrowUpRight size={14} /> Plans, pools & results
          </Link>
        </div>
      </section>

      {/* Plans */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-ink">Exam plans</h3>
            <p className="text-xs font-medium text-slate-500">
              A plan is one way of sitting the exam: its own questions, time limit, attempts and pass mark.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowGuide((v) => !v)}
            className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold text-[#205ca8] hover:underline dark:text-blue-400"
            aria-expanded={showGuide}
          >
            <HelpCircle size={13} /> {showGuide ? "Hide" : "What are"} the plan types?
          </button>
        </div>

        {showGuide && <TypeGuide segment={segment} />}

        {sorted.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-xs font-medium text-slate-500">
            No plans yet. Add an assessment from the {segment} editor, or a certification from the exam’s plans.
          </p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {sorted.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                placed={placedPlanIds.has(plan.id)}
                segment={segment}
                configureHref={withReturnTo(examDashboardHref(exam.id, "plans", from, plan.id), here)}
              />
            ))}
          </ul>
        )}

        {!hasCertification && (
          <Link
            href={withReturnTo(examDashboardHref(exam.id, "plans", from), here)}
            className="flex items-center gap-3 rounded-2xl border border-dashed border-violet-200 bg-violet-50/40 px-4 py-3 text-xs font-semibold text-violet-800 transition-colors hover:bg-violet-50 dark:border-violet-500/25 dark:bg-violet-500/5 dark:text-violet-200"
          >
            <Award size={16} className="shrink-0" />
            <span className="flex-1">
              Offer a certificate: add a <b>Certification</b> plan. It is listed in Explore → Exams for learners who
              complete this {segment}.
            </span>
            <ArrowUpRight size={14} className="shrink-0" />
          </Link>
        )}
      </section>
    </div>
  );
}

function Intro({ segment }: { segment: Segment }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-slate-50/80 px-4 py-3 dark:bg-white/[0.03]">
      <ListChecks size={18} className="mt-0.5 shrink-0 text-slate-400" />
      <p className="text-xs font-medium leading-relaxed text-slate-600">
        A {segment} has <b>one linked exam</b>: a question bank plus the <b>plans</b> learners sit. It is reviewed and
        published together with the {segment} — there is nothing to publish separately.
      </p>
    </div>
  );
}

function TypeGuide({ segment }: { segment: Segment }) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      {typeGuide(segment).map((g) => {
        const Icon = TYPE_ICON[g.type];
        return (
          <div key={g.type} className="rounded-2xl border border-slate-200/80 bg-surface/80 p-3.5">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${planTypeMeta(g.type).chip}`}>
              <Icon size={11} /> {g.title}
            </span>
            <p className="mt-2 text-[11.5px] font-medium leading-relaxed text-slate-600">{g.body}</p>
          </div>
        );
      })}
    </div>
  );
}

function PlanCard({
  plan,
  placed,
  segment,
  configureHref,
}: {
  plan: ExamPlanResponse;
  placed: boolean;
  segment: Segment;
  configureHref: string;
}) {
  const meta = planTypeMeta(plan.planType);
  const Icon = TYPE_ICON[plan.planType];
  const where = whereLearnersFindIt(plan, placed, segment);
  const tooFew = plan.totalQuestions < Math.max(1, plan.minQuestions);
  const showsPass = plan.graded || plan.planType !== "ASSESSMENT";

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-surface p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${meta.chip}`}>
            <Icon size={11} /> {planKindLabel(plan.planType, plan.graded)}
          </span>
          <p className="mt-1.5 truncate text-sm font-extrabold text-ink" title={plan.name}>
            {plan.name}
          </p>
        </div>
        <span
          title={
            !plan.active
              ? "Hidden: learners don't see this plan."
              : plan.live
                ? "Learners can see and take this plan."
                : `Saved as a draft. Learners get it after the ${segment} is submitted and approved.`
          }
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
            !plan.active
              ? "bg-slate-100 text-slate-500"
              : plan.live
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
          }`}
        >
          {!plan.active ? "Hidden" : plan.live ? "Live" : "Draft"}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11.5px] font-semibold text-slate-600">
        <Stat icon={ListChecks} warn={tooFew}>
          {plan.totalQuestions} question{plan.totalQuestions === 1 ? "" : "s"}
          {tooFew && plan.minQuestions > 0 ? ` · needs ${plan.minQuestions}` : ""}
        </Stat>
        <Stat icon={Clock}>{plan.durationMinutes} min</Stat>
        <Stat icon={Repeat}>
          {plan.maxAttempts} attempt{plan.maxAttempts === 1 ? "" : "s"}
        </Stat>
        {showsPass ? <Stat icon={Target}>Pass at {Number(plan.passPercentage)}%</Stat> : <Stat icon={Target}>Practice · no pass mark</Stat>}
      </dl>

      <p className={`flex items-start gap-1.5 text-[11.5px] font-medium ${where.warn ? "text-amber-700 dark:text-amber-300" : "text-slate-500"}`}>
        <MapPin size={13} className="mt-0.5 shrink-0" />
        {where.text}
      </p>

      {tooFew && (
        <p className="flex items-start gap-1.5 rounded-xl bg-rose-50 px-3 py-2 text-[11.5px] font-semibold text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          <AlertTriangle size={13} className="mt-0.5 shrink-0" />
          {plan.totalQuestions === 0
            ? "No questions yet. Add questions to the bank, then choose which ones this plan uses — submitting is blocked until then."
            : `This plan draws ${plan.totalQuestions} but needs at least ${plan.minQuestions}.`}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        <p className="text-[11px] font-medium text-slate-400">{meta.effect}</p>
        <Link
          href={configureHref}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[#205ca8] hover:underline dark:text-blue-400"
        >
          {tooFew ? "Choose questions" : "Configure"} <ArrowUpRight size={13} />
        </Link>
      </div>
    </li>
  );
}

function Stat({ icon: Icon, warn, children }: { icon: LucideIcon; warn?: boolean; children: React.ReactNode }) {
  return (
    <div className={`flex items-center gap-1.5 ${warn ? "text-rose-600 dark:text-rose-400" : ""}`}>
      <Icon size={13} className={warn ? "" : "text-slate-400"} />
      <span>{children}</span>
    </div>
  );
}

