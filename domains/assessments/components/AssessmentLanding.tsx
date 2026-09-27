"use client";

// The page a candidate meets before sitting an assessment — what it is, the terms of the sitting,
// what they've already done, and one action.
//
// This is the "page, not a button" surface. An assessment placed in a course appears as a node in
// the structure exactly like a lesson does, and selecting it renders this in the content pane; the
// learner only leaves the course shell when an attempt actually begins, because a real attempt needs
// fullscreen and possibly proctoring.
//
// Pure UI: every value here — including whether the Start button is enabled and why not — is decided
// by the server and passed in. Nothing about eligibility is recomputed in the browser. The page this
// replaced hardcoded five invented "rules" that ignored the exam's actual configuration entirely.

import {
  AlertCircle,
  Award,
  CheckCircle2,
  Clock,
  FileText,
  Hourglass,
  ListChecks,
  Lock,
  Maximize2,
  RotateCcw,
  ShieldCheck,
  Target,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { TiptapContentView } from "@/domains/learning";
import type { AssessmentLandingResponse } from "../types";
import { HonorCodeModal } from "./HonorCodeModal";
import { planKindLabel, planTypeMeta } from "../lib/planTypeMeta";
import { PrerequisiteNotice, attemptStatusLabel } from "./LandingParts";

import { AssessmentResultCard } from "./AssessmentResultCard";

export interface AssessmentLandingProps {
  landing: AssessmentLandingResponse;
  /** Begin or resume. Omitted in preview, where a reviewer must not consume a real attempt. */
  onStart?: () => void;
  /** Opens a past sitting's grade card. */
  onViewGradeCard?: (gradeCardId: string) => void;
  /** Navigates to the next item when accessed from within a course player. */
  onNextItem?: () => void;
  /** Opens report issue modal or feedback form. */
  onReportIssue?: () => void;
  /**
   * Rendered in place of the Start button when the blocker is registration or payment — the host
   * passes the shared EnrollmentButton, so exam registration reuses the enrolment/checkout flow
   * rather than growing a second one.
   */
  registrationSlot?: ReactNode;
  /**
   * Rendered in place of the Start button when the candidate must verify their identity first —
   * the host owns the capture/upload flow (it needs the media endpoint).
   */
  identitySlot?: ReactNode;
  /** Opens the tied content a certification requires, when its prerequisite is unmet. */
  onOpenPrerequisite?: () => void;
  /** Preview mode: describes the assessment but never lets the viewer start it. */
  readOnly?: boolean;
  starting?: boolean;
}

export function AssessmentLanding({
  landing,
  onStart,
  onViewGradeCard,
  onNextItem,
  onReportIssue,
  registrationSlot,
  identitySlot,
  onOpenPrerequisite,
  readOnly = false,
  starting = false,
}: AssessmentLandingProps) {
  const needsRegistration =
    landing.blockedReason === "REGISTRATION_REQUIRED" ||
    landing.blockedReason === "PAYMENT_REQUIRED";

  const resuming = landing.openAttemptId !== null;
  const retaking = !resuming && landing.attemptsUsed > 0;
  const [showHonorCode, setShowHonorCode] = useState(false);

  const handleStartClick = () => {
    setShowHonorCode(true);
  };

  const handleHonorCodeContinue = () => {
    setShowHonorCode(false);
    try {
      sessionStorage.setItem("arcade_honor_code_accepted", "true");
    } catch {}
    onStart?.();
  };

  const meta = planTypeMeta(landing.planType);
  const needsIdentity = landing.blockedReason === "IDENTITY_REQUIRED";

  // STATE B — ATTEMPTED AT LEAST ONCE:
  // Render the post-attempt status and result card instead of the untouched landing view.
  if (landing.history && landing.history.length > 0) {
    return (
      <>
        <AssessmentResultCard
          landing={landing}
          onStart={handleStartClick}
          onViewGradeCard={onViewGradeCard}
          onNextItem={onNextItem}
          onReportIssue={onReportIssue}
          registrationSlot={registrationSlot}
          identitySlot={identitySlot}
          readOnly={readOnly}
          starting={starting}
        />
        <HonorCodeModal
          isOpen={showHonorCode}
          onClose={() => setShowHonorCode(false)}
          onContinue={handleHonorCodeContinue}
        />
      </>
    );
  }

  // STATE A — NEVER ATTEMPTED:
  return (
    <article className="mx-auto w-full max-w-3xl">
      <header className="mb-7">
        <div className="mb-2.5 flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${meta.chip}`}
          >
            {landing.planType === "ASSESSMENT" ? <FileText size={12} /> : <Award size={12} />}
            {planKindLabel(landing.planType, landing.graded)}
          </span>
          {landing.planType === "COMPLETION" && landing.tiedContentTitle && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-800">
              Completes {landing.tiedContentTitle}
            </span>
          )}
        </div>

        <h1 className="text-[1.6rem] font-bold leading-tight tracking-tight text-[#14142b]">
          {landing.title}
        </h1>
        {landing.planName && (
          <p className="mt-1.5 text-[13px] font-semibold text-slate-500">{landing.planName}</p>
        )}
      </header>

      {/* The terms of the sitting, as configured on the plan — not invented by this page. */}
      <dl className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Fact icon={<Clock size={15} />} label="Duration" value={`${landing.durationMinutes} min`} />
        <Fact
          icon={<ListChecks size={15} />}
          label="Questions"
          value={landing.questionCount > 0 ? String(landing.questionCount) : "—"}
        />
        <Fact
          icon={<Target size={15} />}
          label="Pass mark"
          value={landing.graded ? `${landing.passPercentage}%` : "Not graded"}
        />
        <Fact
          icon={<RotateCcw size={15} />}
          label="Attempts"
          value={`${landing.attemptsUsed} of ${landing.maxAttempts}`}
        />
      </dl>

      {(landing.instructions != null || landing.planDescription) && (
        <section className="mb-7">
          <h2 className="mb-2.5 text-[12px] font-bold uppercase tracking-wider text-slate-400">
            Instructions
          </h2>
          {landing.instructions != null ? (
            <div className="text-[14px] leading-relaxed text-slate-700">
              <TiptapContentView body={JSON.stringify(landing.instructions)} emptyMessage="" />
            </div>
          ) : (
            <p className="text-[14px] leading-relaxed text-slate-700">{landing.planDescription}</p>
          )}
        </section>
      )}

      {/* Only shown when the plan actually demands them — never as generic scary boilerplate. */}
      {(landing.proctoringRequired ||
        landing.identityVerificationRequired ||
        landing.fullscreenRequired) && (
        <section className="mb-7 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-[12px] font-bold uppercase tracking-wider text-slate-400">
            Before you begin
          </h2>
          <ul className="space-y-2.5">
            {landing.proctoringRequired && (
              <Requirement
                icon={<ShieldCheck size={15} />}
                text={
                  landing.maxViolations > 0
                    ? `This assessment is proctored. Switching tabs or leaving the window is recorded; ${landing.maxViolations} recorded violation${landing.maxViolations === 1 ? "" : "s"} end the attempt.`
                    : "This assessment is proctored. Switching tabs or leaving the window is recorded."
                }
              />
            )}
            {landing.identityVerificationRequired && (
              <Requirement
                icon={<ShieldCheck size={15} />}
                text="You'll submit a photo of yourself before starting. An administrator reviews it."
              />
            )}
            {landing.fullscreenRequired && (
              <Requirement
                icon={<Maximize2 size={15} />}
                text="The assessment runs in fullscreen. Leaving fullscreen is recorded."
              />
            )}
          </ul>
        </section>
      )}

      {landing.prerequisite && (
        <PrerequisiteNotice prerequisite={landing.prerequisite} onOpen={onOpenPrerequisite} />
      )}

      {landing.accessWindow && (landing.accessWindow.opensAt || landing.accessWindow.closesAt) && (
        <section className="mb-7 rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
          <p className="text-[13px] font-medium text-slate-600">
            {landing.accessWindow.opensAt && <>Opens {formatWhen(landing.accessWindow.opensAt)}. </>}
            {landing.accessWindow.closesAt && <>Closes {formatWhen(landing.accessWindow.closesAt)}.</>}
          </p>
        </section>
      )}

      {/* The action. Its state is the server's `startable`, never a local recomputation. */}
      <section className="mb-8">
        {readOnly ? (
          <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-3.5 text-[13px] font-medium text-slate-500">
            This is a preview — starting an assessment is disabled here.
          </p>
        ) : needsRegistration && registrationSlot ? (
          <div>
            {landing.blockedMessage && (
              <p className="mb-3 text-[13px] font-medium text-slate-600">{landing.blockedMessage}</p>
            )}
            {registrationSlot}
          </div>
        ) : needsIdentity && identitySlot ? (
          <div>{identitySlot}</div>
        ) : landing.startable ? (
          <button
            type="button"
            onClick={handleStartClick}
            disabled={starting}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#14142b] px-7 py-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-[#232735] disabled:opacity-60 cursor-pointer"
          >
            {resuming ? "Resume assessment" : retaking ? "Retake assessment" : "Start assessment"}
          </button>
        ) : (
          <div className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5">
            <span className="mt-0.5 text-slate-400">{blockedIcon(landing.blockedReason)}</span>
            <p className="text-[13px] font-medium text-slate-600">
              {landing.blockedMessage ?? "This assessment isn't available right now."}
            </p>
          </div>
        )}
      </section>

      {landing.history.length > 0 && (
        <section>
          <h2 className="mb-3 text-[12px] font-bold uppercase tracking-wider text-slate-400">
            Your attempts
          </h2>
          <ul className="space-y-2">
            {landing.history.map((attempt) => (
              <li
                key={attempt.attemptId}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#14142b]">
                    Attempt {attempt.attemptNumber}
                  </p>
                  <p className="text-[11px] font-medium text-slate-400">
                    {attempt.submittedAt ? formatWhen(attempt.submittedAt) : "Not submitted"}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  {attempt.awaitingReview ? (
                    // A provisional score is withheld rather than shown as if it were final.
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-amber-700">
                      <Hourglass size={13} />
                      Awaiting marking
                    </span>
                  ) : attempt.percentage !== null ? (
                    <span
                      className={`inline-flex items-center gap-1.5 text-[12px] font-semibold ${
                        attempt.passed ? "text-emerald-700" : "text-slate-500"
                      }`}
                    >
                      {attempt.passed && <CheckCircle2 size={13} />}
                      {attempt.percentage}%
                    </span>
                  ) : (
                    <span className="text-[12px] font-medium text-slate-400">{attemptStatusLabel(attempt)}</span>
                  )}

                  {attempt.gradeCardId && onViewGradeCard && (
                    <button
                      type="button"
                      onClick={() => onViewGradeCard(attempt.gradeCardId!)}
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      Grade card
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <HonorCodeModal
        isOpen={showHonorCode}
        onClose={() => setShowHonorCode(false)}
        onContinue={handleHonorCodeContinue}
      />
    </article>
  );
}

function Fact({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3">
      <dt className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        {icon}
        {label}
      </dt>
      <dd className="text-[15px] font-bold tabular-nums text-[#14142b]">{value}</dd>
    </div>
  );
}

function Requirement({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <li className="flex items-start gap-2.5 text-[13px] font-medium text-slate-600">
      <span className="mt-0.5 shrink-0 text-slate-400">{icon}</span>
      {text}
    </li>
  );
}

function blockedIcon(reason: AssessmentLandingResponse["blockedReason"]) {
  switch (reason) {
    case "NOT_STARTED_YET":
    case "WINDOW_CLOSED":
      return <Clock size={16} />;
    case "ATTEMPTS_EXHAUSTED":
    case "PREREQUISITE_NOT_MET":
      return <Lock size={16} />;
    case "IDENTITY_REQUIRED":
      return <ShieldCheck size={16} />;
    default:
      return <AlertCircle size={16} />;
  }
}

function formatWhen(iso: string): string {
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
