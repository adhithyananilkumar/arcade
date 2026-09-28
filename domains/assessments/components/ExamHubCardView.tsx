"use client";

// One main exam, in Explore > Exams and My Learning > Exams. Marks are not shown here — they are on
// the grade cards. Pure UI: status, prerequisite state, fee and windows are
// all computed by the server (ExamHubService) — this only chooses words and colours for them.

import { motion } from "framer-motion";
import { Award, CalendarClock, CheckCircle2, ClipboardCheck, Lock, ChevronRight } from "lucide-react";
import { formatMoney } from "@/shared/utils/money";
import { LetterVectorArt } from "@/apps/learner/components/my-learning/LetterVectorArt";
import type { ExamHubCard, ExamHubStatus } from "../types";

export interface ExamHubCardViewProps {
  card: ExamHubCard;
  onOpen: () => void;
  /** Opens the learner's grades for this exam; the button shows only when given. */
  onViewGrades?: () => void;
  index?: number;
}

const STATUS: Record<ExamHubStatus, { label: string; className: string }> = {
  OPEN: { label: "Registration open", className: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800" },
  NOT_YET_OPEN: { label: "Opens soon", className: "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800" },
  CLOSED: { label: "Closed", className: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700" },
  READY: { label: "Ready to sit", className: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800" },
  UPCOMING: { label: "Upcoming", className: "bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800" },
  IN_PROGRESS: { label: "In progress", className: "bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800" },
  ATTEMPTED: { label: "Attempted", className: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700" },
  PASSED: { label: "Passed", className: "bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-600 dark:text-white dark:border-emerald-500" },
};

export function ExamHubCardView({ card, onOpen, onViewGrades, index = 0 }: ExamHubCardViewProps) {
  const status = STATUS[card.status] ?? STATUS.CLOSED;
  const window = describeWindow(card);
  const totalQuestions = card.plans.reduce((n, p) => n + p.questionCount, 0);
  const longest = card.plans.reduce((m, p) => Math.max(m, p.durationMinutes), 0);

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: Math.min(index * 0.04, 0.2) }}
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-4 sm:p-5 shadow-[0_8px_30px_rgba(20,20,43,0.05)] transition-all hover:shadow-[0_12px_36px_rgba(20,20,43,0.08)] hover:-translate-y-1 backdrop-blur-sm"
    >
      {/* Decorative ambient background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-12 -bottom-12 h-44 w-44 rounded-full bg-gradient-to-br from-[#2962D6]/10 via-[#27C5D8]/8 to-transparent blur-2xl"
      />

      <div className="relative z-10 flex flex-1 flex-col justify-between gap-4">
        {/* Banner / Cover */}
        <div className="relative h-44 sm:h-48 w-full shrink-0 overflow-hidden rounded-tl-[1.75rem] rounded-br-[1.75rem] rounded-tr-md rounded-bl-md border border-slate-200/70 dark:border-slate-800 shadow-sm transition-transform duration-500 group-hover:scale-[1.02] bg-slate-100 dark:bg-slate-800">
          {card.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={card.coverImageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <LetterVectorArt title={card.title} id={card.examId} />
          )}

          <span
            className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide backdrop-blur-md shadow-xs ${status.className}`}
          >
            {card.status === "PASSED" && <CheckCircle2 size={11} />}
            {status.label}
          </span>
        </div>

        {/* Content details */}
        <div className="space-y-2">
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

            <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
              {card.feeMinor > 0 ? formatMoney(card.feeMinor, card.currency ?? "INR") : "Free"}
            </span>

          </div>

          <h2 className="line-clamp-2 text-base sm:text-lg font-bold tracking-tight text-[#14142b] dark:text-white group-hover:text-[#2962D6] dark:group-hover:text-[#3B82F6] transition-colors">
            {card.title}
          </h2>

          {card.channelName && (
            <p className="text-[12px] font-medium text-slate-400 dark:text-slate-500">{card.channelName}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-2 text-[12px] font-medium text-slate-500 dark:text-slate-400">
            {totalQuestions > 0 && <span>{totalQuestions} questions</span>}
            {totalQuestions > 0 && longest > 0 && <span>·</span>}
            {longest > 0 && <span>{longest} min</span>}
          </div>

          {card.tiedContentTitle && card.prerequisiteMet !== null && (
            <div
              className={`mt-2 flex items-start gap-2 rounded-xl border px-3 py-2 text-[12px] font-medium ${
                card.prerequisiteMet
                  ? "border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300"
                  : "border-amber-200 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300"
              }`}
            >
              <span className="mt-0.5 shrink-0">
                {card.prerequisiteMet ? <CheckCircle2 size={13} /> : <Lock size={13} />}
              </span>
              <span>
                {card.prerequisiteMet ? "Completed " : "Requires completing "}
                <b>{card.tiedContentTitle}</b>
              </span>
            </div>
          )}

          {window && (
            <p className="flex items-center gap-1.5 pt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
              <CalendarClock size={12} className="shrink-0 text-slate-400 dark:text-slate-500" />
              {window}
            </p>
          )}
        </div>

        {/* Actions: the exam, and — once sat — its grades */}
        <div className="flex gap-2 pt-2">
          {onViewGrades && (
            <button
              type="button"
              onClick={onViewGrades}
              className="inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-[#12141C] hover:bg-[#232735] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 px-4 py-3 text-[13px] font-bold transition-all shadow-sm hover:shadow-md"
            >
              <Award size={14} />
              <span>Grades</span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpen}
            className={`inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md px-4 py-3 text-[13px] font-bold transition-all ${
              onViewGrades
                ? "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
                : "bg-[#12141C] hover:bg-[#232735] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 shadow-sm hover:shadow-md"
            }`}
          >
            <span>
              {card.status === "READY"
                ? "Sit Exam"
                : card.status === "OPEN"
                ? "Register Now"
                : "View Exam"}
            </span>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </motion.div>
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

