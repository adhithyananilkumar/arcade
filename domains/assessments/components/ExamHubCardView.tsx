"use client";

// One main exam, in Explore > Exams and My Learning > Exams. Marks are not shown here — they are on
// the grade cards. Pure UI: status, prerequisite state, fee and windows are
// all computed by the server (ExamHubService) — this only chooses words and colours for them.

import React from "react";
import { Award, CalendarClock, CheckCircle2, ClipboardCheck, Lock, ChevronRight } from "lucide-react";
import { formatMoney } from "@/shared/utils/money";
import { UnifiedContentCard } from "@/shared/design-system/ui/cards";
import type { ExamHubCard, ExamHubStatus } from "../types";

export interface ExamHubCardViewProps {
  card: ExamHubCard;
  onOpen: () => void;
  /** Opens the learner's grades for this exam; the button shows only when given. */
  onViewGrades?: () => void;
  index?: number;
  hideTypeAndFeeBadge?: boolean;
}

const STATUS: Record<ExamHubStatus, { label: string; className: string }> = {
  OPEN: { label: "Registration open", className: "bg-emerald-500/90 text-white" },
  NOT_YET_OPEN: { label: "Opens soon", className: "bg-sky-500/90 text-white" },
  CLOSED: { label: "Closed", className: "bg-slate-500/90 text-white" },
  READY: { label: "Ready to sit", className: "bg-emerald-600/95 text-white ring-2 ring-white/30" },
  UPCOMING: { label: "Upcoming", className: "bg-sky-500/90 text-white" },
  IN_PROGRESS: { label: "In progress", className: "bg-amber-500/90 text-white" },
  ATTEMPTED: { label: "Attempted", className: "bg-slate-600/90 text-white" },
  PASSED: { label: "Passed", className: "bg-emerald-600 text-white" },
};

export function ExamHubCardView({ card, onOpen, onViewGrades, hideTypeAndFeeBadge }: ExamHubCardViewProps) {
  const status = STATUS[card.status] ?? STATUS.CLOSED;
  const window = describeWindow(card);
  const totalQuestions = card.plans.reduce((n, p) => n + p.questionCount, 0);
  const longest = card.plans.reduce((m, p) => Math.max(m, p.durationMinutes), 0);
  const showTypeAndFee = !hideTypeAndFeeBadge && !card.registered;

  const metaTags: Array<string | React.ReactNode> = [];
  if (totalQuestions > 0) metaTags.push(`${totalQuestions} questions`);
  if (longest > 0) metaTags.push(`${longest} min`);

  const metadataBadges = (
    <div className="flex flex-col gap-2 w-full">
      {showTypeAndFee && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              card.certification
                ? "bg-violet-100/90 text-violet-800 dark:bg-violet-950/80 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/60"
                : "bg-blue-100/90 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60"
            }`}
          >
            {card.certification ? <Award size={11} /> : <ClipboardCheck size={11} />}
            {card.certification ? "Certification" : "Exam"}
          </span>

          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200/60">
            {card.feeMinor > 0 ? formatMoney(card.feeMinor, card.currency ?? "INR") : "Free"}
          </span>
        </div>
      )}

      {/* A linked certification always says what it requires — signed out (no progress known) as
          well as signed in, where it also says whether the learner is there yet. */}
      {card.tiedContentTitle && card.certification && (
        <div
          className={`flex items-start gap-2 rounded-xl border px-3 py-2 text-[11.5px] font-medium ${
            card.prerequisiteMet === true
              ? "border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300"
              : card.prerequisiteMet === false
                ? "border-amber-200 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300"
                : "border-slate-200 bg-slate-50/70 text-slate-700"
          }`}
        >
          <span className="mt-0.5 shrink-0">
            {card.prerequisiteMet === true ? <CheckCircle2 size={13} /> : <Lock size={13} />}
          </span>
          <span>
            {card.prerequisiteMet === true ? "Prerequisite done: completed " : "Prerequisite: complete the "}
            {card.prerequisiteMet === true ? null : card.tieType === "EVENT" ? "event " : "course "}
            <b>{card.tiedContentTitle}</b>
            {card.prerequisiteMet === false && " first"}
          </span>
        </div>
      )}

      {window && (
        <p className="flex items-center gap-1.5 pt-0.5 text-[11px] font-semibold text-slate-500">
          <CalendarClock size={12} className="shrink-0 text-slate-400" />
          {window}
        </p>
      )}
    </div>
  );

  const actionLabel =
    card.status === "READY"
      ? "Sit Exam"
      : card.status === "OPEN"
      ? "Register Now"
      : "View Exam";

  const customActionNode = onViewGrades ? (
    <div className="flex gap-2 w-full">
      <button
        type="button"
        onClick={onViewGrades}
        className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2.5 text-[12.5px] font-semibold transition-all"
      >
        <Award size={13} />
        <span>Grades</span>
      </button>
      <button
        type="button"
        onClick={onOpen}
        className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-ink hover:bg-ink-hover text-on-ink px-3 py-2.5 text-[12.5px] font-semibold transition-all shadow-sm hover:shadow-md"
      >
        <span>{actionLabel}</span>
        <ChevronRight size={13} />
      </button>
    </div>
  ) : undefined;

  return (
    <UnifiedContentCard
      id={card.examId}
      title={card.title}
      type="EXAM"
      typeLabel={card.certification ? "Certification" : "Exam"}
      typeIcon={card.certification ? Award : ClipboardCheck}
      statusNode={
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md shadow-xs ${status.className}`}
        >
          {card.status === "PASSED" && <CheckCircle2 size={11} />}
          {status.label}
        </span>
      }
      categoryId={card.categoryId}
      description={card.description}
      channelName={card.channelName}
      channelIconUrl={card.channelIconUrl}
      metaTags={metaTags}
      metadataBadges={metadataBadges}
      actionLabel={actionLabel}
      onActionClick={onOpen}
      customActionNode={customActionNode}
    />
  );
}

/** The one date that matters for where the learner stands. */
function describeWindow(card: ExamHubCard): string | null {
  if (!card.registered) {
    if (card.status === "NOT_YET_OPEN" && card.enrollmentOpensAt) return `Registration opens ${short(card.enrollmentOpensAt)}`;
    if (card.enrollmentClosesAt) return `Register by ${short(card.enrollmentClosesAt)}`;
  }
  if (card.status === "UPCOMING" && card.accessStartsAt) return `Opens ${short(card.accessStartsAt)}`;
  if (card.accessEndsAt) return `Sit by ${short(card.accessEndsAt)}`;
  return null;
}

function short(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}


