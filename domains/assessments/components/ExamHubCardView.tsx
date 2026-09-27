"use client";

// One main exam in the learner Exams hub. Pure UI: status, prerequisite state, fee and windows are
// all computed by the server (ExamHubService) — this only chooses words and colours for them.

import { Award, CalendarClock, CheckCircle2, ClipboardCheck, Lock } from "lucide-react";
import { formatMoney } from "@/shared/utils/money";
import type { ExamHubCard, ExamHubStatus } from "../types";

export interface ExamHubCardViewProps {
  card: ExamHubCard;
  onOpen: () => void;
}

const STATUS: Record<ExamHubStatus, { label: string; className: string }> = {
  OPEN: { label: "Registration open", className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  NOT_YET_OPEN: { label: "Registration opens soon", className: "bg-sky-50 text-sky-800 border-sky-200" },
  CLOSED: { label: "Closed", className: "bg-slate-100 text-slate-600 border-slate-200" },
  READY: { label: "Ready to sit", className: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  UPCOMING: { label: "Upcoming", className: "bg-sky-50 text-sky-800 border-sky-200" },
  IN_PROGRESS: { label: "In progress", className: "bg-orange-50 text-orange-800 border-orange-200" },
  ATTEMPTED: { label: "Attempted", className: "bg-slate-50 text-slate-700 border-slate-200" },
  PASSED: { label: "Passed", className: "bg-emerald-600 text-white border-emerald-600" },
};

export function ExamHubCardView({ card, onOpen }: ExamHubCardViewProps) {
  const status = STATUS[card.status] ?? STATUS.CLOSED;
  const window = describeWindow(card);
  const totalQuestions = card.plans.reduce((n, p) => n + p.questionCount, 0);
  const longest = card.plans.reduce((m, p) => Math.max(m, p.durationMinutes), 0);

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_6px_20px_rgba(20,20,43,0.05)] transition-shadow hover:shadow-[0_10px_28px_rgba(20,20,43,0.09)]">
      <button type="button" onClick={onOpen} className="flex flex-1 cursor-pointer flex-col text-left">
        <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
          {card.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={card.coverImageUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{ background: "linear-gradient(160deg, #EEF1F8 0%, #DDE3F0 100%)" }}
            >
              {card.certification ? (
                <Award size={40} className="text-[#14142b]/25" />
              ) : (
                <ClipboardCheck size={40} className="text-[#14142b]/25" />
              )}
            </div>
          )}
          <span
            className={`absolute left-3 top-3 inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${status.className}`}
          >
            {card.status === "PASSED" && <CheckCircle2 size={11} />}
            {status.label}
          </span>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="mb-2 flex flex-wrap items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                card.certification ? "bg-violet-100/80 text-violet-800" : "bg-[#14142b]/[0.06] text-[#14142b]"
              }`}
            >
              {card.certification ? <Award size={11} /> : <ClipboardCheck size={11} />}
              {card.certification ? "Certification" : "Exam"}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              {card.feeMinor > 0 ? formatMoney(card.feeMinor, card.currency ?? "INR") : "Free"}
            </span>
          </div>

          <h2 className="line-clamp-2 text-[15px] font-bold tracking-tight text-[#14142b]">{card.title}</h2>
          {card.channelName && (
            <p className="mt-0.5 text-[12px] font-medium text-slate-400">{card.channelName}</p>
          )}

          <p className="mt-2 text-[12px] font-medium text-slate-500">
            {totalQuestions > 0 && <>{totalQuestions} questions · </>}
            {longest > 0 && <>{longest} min</>}
            {card.bestPercentage !== null && <> · best {card.bestPercentage}%</>}
          </p>

          {card.tiedContentTitle && card.prerequisiteMet !== null && (
            <div
              className={`mt-3 flex items-start gap-2 rounded-xl border px-3 py-2 text-[12px] font-medium ${
                card.prerequisiteMet
                  ? "border-emerald-200 bg-emerald-50/60 text-emerald-900"
                  : "border-amber-200 bg-amber-50/60 text-amber-900"
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
            <p className="mt-auto flex items-center gap-1.5 pt-3 text-[11px] font-semibold text-slate-500">
              <CalendarClock size={12} className="shrink-0 text-slate-400" />
              {window}
            </p>
          )}
        </div>
      </button>
    </article>
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
