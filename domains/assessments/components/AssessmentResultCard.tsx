"use client";

import {
  Award,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Clock,
  FileText,
  Flag,
  Hourglass,
  Lock,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { TiptapContentView } from "@/domains/learning";
import type { AssessmentLandingResponse, AttemptHistoryItem } from "../types";

export interface AssessmentResultCardProps {
  landing: AssessmentLandingResponse;
  onStart?: () => void;
  onViewGradeCard?: (gradeCardId: string) => void;
  onNextItem?: () => void;
  onReportIssue?: () => void;
  registrationSlot?: ReactNode;
  readOnly?: boolean;
  starting?: boolean;
}

export function AssessmentResultCard({
  landing,
  onStart,
  onViewGradeCard,
  onNextItem,
  onReportIssue,
  registrationSlot,
  readOnly = false,
  starting = false,
}: AssessmentResultCardProps) {
  const [showInstructions, setShowInstructions] = useState(false);

  const isBadgeExam = landing.assessmentType === "BADGE_EXAM";
  const categoryLabel = isBadgeExam ? "Badge Exam" : "Graded Assessment";

  const latestAttempt = landing.latestAttempt ?? landing.history[0] ?? null;
  const bestAttempt = landing.bestAttempt ?? null;

  const isAwaitingReview = latestAttempt?.awaitingReview ?? false;
  const hasPassed = landing.passed ?? bestAttempt?.passed ?? latestAttempt?.passed ?? false;

  // Determine which score to display prominently
  const displayScore =
    landing.score ??
    bestAttempt?.percentage ??
    latestAttempt?.percentage ??
    null;

  const scoreLabel =
    landing.gradingPolicy === "HIGHEST_SCORE" && bestAttempt
      ? "Best score"
      : "Latest attempt";

  const feedbackGradeCardId =
    bestAttempt?.gradeCardId ?? latestAttempt?.gradeCardId ?? null;

  const resuming = landing.openAttemptId !== null;
  const retakeAllowed = landing.startable && !resuming;

  const needsRegistration =
    landing.blockedReason === "REGISTRATION_REQUIRED" ||
    landing.blockedReason === "PAYMENT_REQUIRED";

  return (
    <article className="mx-auto w-full max-w-3xl">
      {/* ── Top Header & Hero ────────────────────────────────────────── */}
      <header className="mb-7">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
              isBadgeExam
                ? "bg-violet-100/80 text-violet-800"
                : "bg-[#14142b]/[0.06] text-[#14142b]"
            }`}
          >
            {isBadgeExam ? <Award size={13} /> : <FileText size={13} />}
            {categoryLabel}
          </span>

          {landing.requiredForCompletion && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-800">
              Required to complete
            </span>
          )}

          {isBadgeExam && landing.badgeName && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-800">
              <Award size={12} />
              {landing.badgeName}
            </span>
          )}
        </div>

        <h1 className="text-[1.65rem] font-bold leading-tight tracking-tight text-[#14142b] sm:text-[1.85rem]">
          {landing.title}
        </h1>

        {landing.planName && (
          <p className="mt-1.5 text-[13px] font-semibold text-slate-500">
            {landing.planName}
          </p>
        )}

        {/* Academic integrity / anti-cheat subtext */}
        <div className="mt-3 flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
          <ShieldCheck size={14} className="text-slate-400 shrink-0" />
          <span>Assessment monitored for academic integrity and compliance.</span>
        </div>

        {/* Action Buttons Bar */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {readOnly ? (
            <span className="rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-[13px] font-medium text-slate-500">
              Preview mode — actions disabled
            </span>
          ) : needsRegistration && registrationSlot ? (
            <div>{registrationSlot}</div>
          ) : (
            <>
              {/* Primary "Go to next item" when passed and next item is available */}
              {hasPassed && onNextItem && (
                <button
                  type="button"
                  onClick={onNextItem}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#14142b] px-6 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#232735] shadow-[0_4px_14px_rgba(20,20,43,0.12)] cursor-pointer"
                >
                  <span>Go to next item</span>
                  <ChevronRight size={16} />
                </button>
              )}

              {/* In-progress resume action */}
              {resuming && (
                <button
                  type="button"
                  onClick={onStart}
                  disabled={starting}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#FF6B4A] px-6 py-3 text-[14px] font-semibold text-white transition-colors hover:bg-[#e85a3c] shadow-[0_4px_14px_rgba(255,107,74,0.25)] cursor-pointer"
                >
                  <Clock size={16} />
                  <span>Resume assessment</span>
                </button>
              )}

              {/* Retake / Try again action */}
              {retakeAllowed && (
                <button
                  type="button"
                  onClick={onStart}
                  disabled={starting}
                  className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-[14px] font-semibold transition-all cursor-pointer ${
                    hasPassed && onNextItem
                      ? "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50"
                      : "bg-[#14142b] text-white hover:bg-[#232735] shadow-[0_4px_14px_rgba(20,20,43,0.15)]"
                  }`}
                >
                  <RotateCcw size={15} />
                  <span>{hasPassed ? "Retake assessment" : "Try again"}</span>
                </button>
              )}

              {/* Blocked / Locked states when no retry allowed */}
              {!landing.startable && !resuming && (
                <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100/90 px-4 py-2.5 text-[13px] font-medium text-slate-600">
                  <Lock size={15} className="text-slate-400" />
                  <span>
                    {landing.blockedMessage ?? "No additional attempts available."}
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </header>

      {/* ── Two Summary Panels (Result Card + What to Expect) ──────── */}
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-12">
        {/* Left Card: Learner's Result Banner */}
        <div
          className={`sm:col-span-7 flex flex-col justify-between rounded-2xl border p-5 sm:p-6 transition-all ${
            hasPassed
              ? "border-emerald-200/90 bg-emerald-50/75 text-emerald-950"
              : isAwaitingReview
              ? "border-amber-200/90 bg-amber-50/75 text-amber-950"
              : "border-slate-200 bg-slate-50/90 text-slate-900"
          }`}
        >
          <div>
            <div className="mb-2 flex items-center gap-2">
              {hasPassed ? (
                <>
                  <CheckCircle2 className="text-emerald-600" size={19} />
                  <span className="text-[15px] font-bold text-emerald-900">
                    You passed!
                  </span>
                </>
              ) : isAwaitingReview ? (
                <>
                  <Hourglass className="text-amber-600" size={19} />
                  <span className="text-[15px] font-bold text-amber-900">
                    Awaiting marking
                  </span>
                </>
              ) : (
                <>
                  <XCircle className="text-slate-400" size={19} />
                  <span className="text-[15px] font-bold text-slate-800">
                    Not passed yet
                  </span>
                </>
              )}
            </div>

            <p className="text-[13px] font-medium text-slate-600">
              To pass you need a grade of at least {landing.passPercentage}%.
            </p>

            <div className="mt-4 flex flex-wrap items-baseline gap-3">
              {displayScore !== null ? (
                <div className="flex items-baseline gap-2">
                  <span
                    className={`text-[2.5rem] font-extrabold leading-none tracking-tight tabular-nums ${
                      hasPassed
                        ? "text-emerald-700"
                        : "text-slate-800"
                    }`}
                  >
                    {displayScore}%
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    {scoreLabel}
                  </span>
                </div>
              ) : (
                <span className="text-[1.8rem] font-bold text-slate-400">—</span>
              )}

              {feedbackGradeCardId && onViewGradeCard && (
                <button
                  type="button"
                  onClick={() => onViewGradeCard(feedbackGradeCardId)}
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-[12px] font-semibold text-slate-700 shadow-xs transition-colors hover:bg-slate-50 cursor-pointer"
                >
                  View feedback
                </button>
              )}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-black/[0.06] text-[11px] font-medium text-slate-500">
            {latestAttempt?.submittedAt ? (
              <>Submitted {formatWhen(latestAttempt.submittedAt)}.</>
            ) : resuming ? (
              <>Current attempt in progress.</>
            ) : (
              <>No completed submission yet.</>
            )}
          </div>
        </div>

        {/* Right Card: What to expect */}
        <div className="sm:col-span-5 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="mb-4 text-[13px] font-bold uppercase tracking-wider text-[#14142b]">
              What to expect
            </h2>

            <ul className="space-y-3.5">
              {/* Deadline */}
              <li className="flex items-start gap-3">
                <Calendar size={16} className="mt-0.5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-[#14142b]">
                    {landing.closesAt
                      ? `Due ${formatWhen(landing.closesAt)}`
                      : "Self-paced"}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {landing.deliveryMode === "SCHEDULED"
                      ? "Strict delivery window"
                      : "No fixed deadline"}
                  </p>
                </div>
              </li>

              {/* Attempts */}
              <li className="flex items-start gap-3">
                <RotateCcw size={16} className="mt-0.5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-[#14142b]">
                    {landing.maxAttempts === 1
                      ? "1 attempt allowed"
                      : `${landing.maxAttempts} attempts allowed`}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {landing.attemptsRemaining > 0
                      ? `${landing.attemptsRemaining} remaining`
                      : "All attempts used"}
                  </p>
                </div>
              </li>

              {/* Duration */}
              <li className="flex items-start gap-3">
                <Clock size={16} className="mt-0.5 text-slate-400 shrink-0" />
                <div>
                  <p className="text-[13px] font-semibold text-[#14142b]">
                    {landing.durationMinutes} min limit
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Timer starts when you begin
                  </p>
                </div>
              </li>
            </ul>
          </div>

          {onReportIssue && (
            <div className="mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onReportIssue}
                className="inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <Flag size={13} />
                <span>Report an issue</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Attempt History Breakdown ──────────────────────────────── */}
      {landing.history.length > 0 && (
        <section className="mb-7">
          <h2 className="mb-3 text-[12px] font-bold uppercase tracking-wider text-slate-400">
            Attempt history
          </h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <ul className="divide-y divide-slate-100">
              {landing.history.map((attempt) => (
                <li
                  key={attempt.attemptId}
                  className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-semibold text-[#14142b]">
                        Attempt {attempt.attemptNumber}
                      </p>
                      {bestAttempt?.attemptId === attempt.attemptId && (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          Highest
                        </span>
                      )}
                      {latestAttempt?.attemptId === attempt.attemptId &&
                        bestAttempt?.attemptId !== attempt.attemptId && (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                            Latest
                          </span>
                        )}
                    </div>
                    <p className="text-[11px] font-medium text-slate-400">
                      {attempt.submittedAt
                        ? formatWhen(attempt.submittedAt)
                        : attempt.status === "IN_PROGRESS"
                        ? "In progress"
                        : "Not submitted"}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    {attempt.awaitingReview ? (
                      <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-amber-700">
                        <Hourglass size={13} />
                        Awaiting marking
                      </span>
                    ) : attempt.percentage !== null ? (
                      <span
                        className={`inline-flex items-center gap-1.5 text-[13px] font-bold tabular-nums ${
                          attempt.passed ? "text-emerald-700" : "text-slate-600"
                        }`}
                      >
                        {attempt.passed && <CheckCircle2 size={14} />}
                        {attempt.percentage}%
                      </span>
                    ) : (
                      <span className="text-[12px] text-slate-400">—</span>
                    )}

                    {attempt.gradeCardId && onViewGradeCard && (
                      <button
                        type="button"
                        onClick={() => onViewGradeCard(attempt.gradeCardId!)}
                        className="rounded-lg border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-100 cursor-pointer"
                      >
                        Grade card
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Collapsible Instructions / Syllabus Terms ──────────────── */}
      {(landing.instructions != null || landing.planDescription) && (
        <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-5">
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex w-full items-center justify-between text-left cursor-pointer"
          >
            <span className="text-[13px] font-bold uppercase tracking-wider text-slate-600">
              Assessment Instructions & Guidelines
            </span>
            <span className="text-slate-400">
              {showInstructions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </span>
          </button>

          {showInstructions && (
            <div className="mt-4 pt-4 border-t border-slate-100 text-[14px] leading-relaxed text-slate-700">
              {landing.instructions != null ? (
                <TiptapContentView
                  body={JSON.stringify(landing.instructions)}
                  emptyMessage=""
                />
              ) : (
                <p>{landing.planDescription}</p>
              )}
            </div>
          )}
        </section>
      )}
    </article>
  );
}

function formatWhen(iso: string): string {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
