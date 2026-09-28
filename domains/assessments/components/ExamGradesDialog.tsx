"use client";

// A learner's grades for one exam, in a single view: the standing across every sitting, then each
// attempt as a row that opens onto its section-by-section marks. Pure UI — the host passes the
// exam's grade cards (already narrowed to its hub plans) and decides where "Printable card" goes.

import { Fragment, useMemo, useState } from "react";
import {
  Award,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  FileText,
  Printer,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/shared/design-system/ui/dialog";
import type { GradeCardResponse } from "../types";
import { planKindLabel } from "../lib/planTypeMeta";

export interface ExamGradesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examTitle: string;
  /** The exam's attempt grade cards, any order. */
  cards: GradeCardResponse[];
  /** Opens one attempt's printable grade card. */
  onOpenPrintable?: (cardId: string) => void;
}

export function ExamGradesDialog({ open, onOpenChange, examTitle, cards, onOpenPrintable }: ExamGradesDialogProps) {
  // One block per plan (an untied exam can offer several), attempts newest first.
  const plans = useMemo(() => {
    const byPlan = new Map<string, GradeCardResponse[]>();
    for (const c of cards) {
      const key = c.planId ?? "none";
      byPlan.set(key, [...(byPlan.get(key) ?? []), c]);
    }
    return [...byPlan.values()].map((list) =>
      [...list].sort((a, b) => (b.sitting?.attemptNumber ?? 0) - (a.sitting?.attemptNumber ?? 0))
    );
  }, [cards]);

  const candidate = cards[0]?.candidateName;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] gap-0 overflow-y-auto rounded-2xl bg-white p-0 text-slate-700 sm:max-w-4xl">
        <header className="border-b border-slate-200 px-6 pb-5 pt-6 sm:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Grade report</p>
          <DialogTitle className="mt-1.5 pr-8 text-[1.45rem] font-bold leading-tight tracking-tight text-[#14142b]">
            {examTitle}
          </DialogTitle>
          {candidate && (
            <p className="mt-1.5 text-[13px] font-medium text-slate-500">
              Candidate <span className="font-semibold text-[#14142b]">{candidate}</span>
            </p>
          )}
        </header>

        {plans.length === 0 ? (
          <p className="px-8 py-14 text-center text-[13px] font-medium text-slate-500">
            No graded attempts yet. Your grade card is issued when an attempt is submitted and marked.
          </p>
        ) : (
          plans.map((attempts) => (
            <PlanReport
              key={attempts[0].planId ?? "none"}
              attempts={attempts}
              showPlanName={plans.length > 1}
              onOpenPrintable={onOpenPrintable}
            />
          ))
        )}

        <footer className="border-t border-slate-200 bg-slate-50/70 px-6 py-3.5 text-[11.5px] font-medium text-slate-500 sm:px-8">
          Each attempt has its own grade card with a verification code anyone can check.
        </footer>
      </DialogContent>
    </Dialog>
  );
}

function PlanReport({
  attempts,
  showPlanName,
  onOpenPrintable,
}: {
  attempts: GradeCardResponse[];
  showPlanName: boolean;
  onOpenPrintable?: (cardId: string) => void;
}) {
  const first = attempts[0];
  const graded = first.sitting ? first.sitting.graded : true;
  const valid = attempts.filter((a) => !a.revoked);
  const best = valid.reduce<GradeCardResponse | null>(
    (b, a) => (b === null || Number(a.percentage) > Number(b.percentage) ? a : b),
    null
  );
  const passed = valid.some((a) => a.passed);
  const [expanded, setExpanded] = useState<string | null>(best?.id ?? first.id);

  return (
    <section className="border-b border-slate-100 last:border-b-0">
      {/* Standing across every attempt */}
      <div className="px-6 pt-5 sm:px-8">
        <div className="flex flex-wrap items-center gap-2">
          {first.sitting?.planType && (
            <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-slate-600">
              {planKindLabel(first.sitting.planType, graded)}
            </span>
          )}
          {showPlanName && first.planName && (
            <span className="text-[13px] font-semibold text-[#14142b]">{first.planName}</span>
          )}
        </div>
        <dl className="mt-4 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200 sm:grid-cols-4">
          <Summary label="Best score" value={best ? `${fmt(best.percentage)}%` : "—"} strong />
          <Summary
            label="Result"
            value={!graded ? "Not graded" : passed ? "Passed" : "Not passed"}
            tone={!graded ? "text-sky-700" : passed ? "text-emerald-700" : "text-slate-600"}
          />
          <Summary label="Pass mark" value={graded ? `${fmt(first.passPercentage)}%` : "—"} />
          <Summary label="Attempts" value={String(attempts.length)} />
        </dl>
      </div>

      {/* Attempts */}
      <div className="px-6 pb-6 pt-5 sm:px-8">
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead className="bg-slate-50 text-[10.5px] uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-2.5 font-bold">Attempt</th>
                <th className="px-4 py-2.5 font-bold">Submitted</th>
                <th className="px-4 py-2.5 text-right font-bold">Marks</th>
                <th className="px-4 py-2.5 text-right font-bold">Score</th>
                <th className="px-4 py-2.5 text-center font-bold">C / W / S</th>
                <th className="px-4 py-2.5 text-right font-bold">Time</th>
                <th className="px-4 py-2.5 font-bold">Result</th>
                <th className="w-10 px-2 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {attempts.map((card) => {
                const open = expanded === card.id;
                const s = card.sitting;
                return (
                  <Fragment key={card.id}>
                    <tr
                      onClick={() => setExpanded(open ? null : card.id)}
                      className={`cursor-pointer border-t border-slate-100 transition-colors hover:bg-slate-50/80 ${
                        open ? "bg-slate-50/60" : ""
                      }`}
                    >
                      <td className="px-4 py-3 font-semibold text-[#14142b]">
                        <span className="inline-flex items-center gap-2">
                          #{s?.attemptNumber ?? "—"}
                          {best?.id === card.id && attempts.length > 1 && (
                            <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                              Best
                            </span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{formatDateTime(s?.submittedAt ?? card.issuedAt)}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-600">
                        {fmt(card.marksObtained)} / {fmt(card.maximumMarks)}
                      </td>
                      <td className="px-4 py-3 text-right font-bold tabular-nums text-[#14142b]">
                        {fmt(card.percentage)}%
                      </td>
                      <td className="px-4 py-3 text-center tabular-nums text-slate-500">
                        {s ? (
                          <>
                            <span className="text-emerald-600">{s.correctAnswers}</span> /{" "}
                            <span className="text-rose-500">{s.wrongAnswers}</span> / {s.unanswered}
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-500">
                        {formatDuration(s?.timeTakenSeconds ?? null)}
                      </td>
                      <td className="px-4 py-3">
                        <Outcome card={card} graded={graded} />
                      </td>
                      <td className="px-2 py-3 text-slate-400">
                        <ChevronDown size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
                      </td>
                    </tr>
                    {open && (
                      <tr className="border-t border-slate-100 bg-slate-50/40">
                        <td colSpan={8} className="px-4 pb-5 pt-4">
                          <AttemptDetail card={card} onOpenPrintable={onOpenPrintable} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function AttemptDetail({
  card,
  onOpenPrintable,
}: {
  card: GradeCardResponse;
  onOpenPrintable?: (cardId: string) => void;
}) {
  return (
    <div className="space-y-4">
      {card.revoked && (
        <p className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] font-semibold text-rose-700">
          <ShieldAlert size={14} /> Revoked{card.revokedReason ? `: ${card.revokedReason}` : ""}
        </p>
      )}

      {card.sections.length > 0 ? (
        <table className="w-full text-[12.5px]">
          <thead className="text-[10.5px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="pb-2 text-left font-bold">Section</th>
              <th className="pb-2 text-right font-bold">Questions</th>
              <th className="pb-2 text-right font-bold">Attempted</th>
              <th className="pb-2 text-right font-bold">Correct</th>
              <th className="pb-2 text-right font-bold">Marks</th>
              <th className="w-40 pb-2 pl-4 text-left font-bold">Score</th>
            </tr>
          </thead>
          <tbody>
            {card.sections.map((sec, i) => {
              const pct = sec.maximumMarks > 0 ? Math.round((sec.marksObtained / sec.maximumMarks) * 100) : 0;
              return (
                <tr key={sec.sectionId ?? i} className="border-t border-slate-200/70">
                  <td className="py-2 font-semibold text-[#14142b]">{sec.sectionTitle}</td>
                  <td className="py-2 text-right tabular-nums text-slate-600">{sec.questions}</td>
                  <td className="py-2 text-right tabular-nums text-slate-600">{sec.attempted}</td>
                  <td className="py-2 text-right tabular-nums text-slate-600">{sec.correct}</td>
                  <td className="py-2 text-right font-semibold tabular-nums text-[#14142b]">
                    {fmt(sec.marksObtained)} / {fmt(sec.maximumMarks)}
                  </td>
                  <td className="py-2 pl-4">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full rounded-full bg-[#14142b]" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-9 text-right tabular-nums text-slate-500">{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <p className="text-[12px] text-slate-500">No section breakdown was recorded for this attempt.</p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/70 pt-3 text-[12px] text-slate-500">
        <span className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span>
            Verification <b className="font-mono tracking-wider text-[#14142b]">{card.verificationCode}</b>
          </span>
          {card.certificateIssued && (
            <span className="inline-flex items-center gap-1 font-semibold text-violet-700">
              <BadgeCheck size={13} /> Certificate issued
            </span>
          )}
        </span>
        {onOpenPrintable && (
          <button
            type="button"
            onClick={() => onOpenPrintable(card.id)}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            <Printer size={13} /> Printable card
          </button>
        )}
      </div>
    </div>
  );
}

function Summary({
  label,
  value,
  tone = "text-[#14142b]",
  strong = false,
}: {
  label: string;
  value: string;
  tone?: string;
  strong?: boolean;
}) {
  return (
    <div className="border-slate-200 px-4 py-3 [&:not(:last-child)]:border-r max-sm:[&:nth-child(2)]:border-r-0 max-sm:[&:nth-child(-n+2)]:border-b">
      <dt className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400">{label}</dt>
      <dd className={`mt-1 font-bold tabular-nums ${strong ? "text-[1.35rem] leading-none" : "text-[15px]"} ${tone}`}>
        {value}
      </dd>
    </div>
  );
}

function Outcome({ card, graded }: { card: GradeCardResponse; graded: boolean }) {
  if (card.revoked) return <span className="text-[12px] font-semibold text-rose-600">Revoked</span>;
  if (!graded) {
    return (
      <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-sky-700">
        <FileText size={13} /> Practice
      </span>
    );
  }
  return card.passed ? (
    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-700">
      {card.certificateIssued ? <Award size={13} /> : <CheckCircle2 size={13} />} Passed
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-500">
      <XCircle size={13} /> Not passed
    </span>
  );
}

/** Marks arrive as decimals (e.g. 8.00); show them without trailing zeros. */
function fmt(n: number): string {
  const v = Number(n);
  return Number.isInteger(v) ? String(v) : v.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

function formatDuration(seconds: number | null): string {
  if (seconds == null) return "—";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m >= 60) return `${Math.floor(m / 60)}h ${m % 60}m`;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" });
}
