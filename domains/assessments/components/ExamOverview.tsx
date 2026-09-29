"use client";

// A main exam's public overview — the page a learner reaches from Explore > Exams. It follows the
// same layout as a course's or event's landing page (hero with the headline, facts and the one
// action; an overview body below), using only the parts an exam needs.
//
// Marks are deliberately not shown here: a finished sitting is reported on its grade card, and this
// page links to it.
//
// Pure UI: every value — including whether the action is enabled and why not — comes from the
// server's landing response.

import {
  AlertCircle,
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
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
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { TiptapContentView } from "@/domains/learning";
import type { AssessmentLandingResponse } from "../types";
import { HonorCodeModal } from "./HonorCodeModal";
import { planKindLabel, planTypeMeta } from "../lib/planTypeMeta";
import { PrerequisiteNotice, attemptStatusLabel } from "./LandingParts";

export interface ExamOverviewProps {
  landing: AssessmentLandingResponse;
  /** Where the breadcrumb's "Exams" leads (Explore's Exams tab). */
  hubHref: string;
  /** Begin or resume, after the honor code is accepted. */
  onStart: () => void;
  /** Switches to another plan of the same exam. */
  onSelectPlan: (planId: string) => void;
  onViewGradeCard: (gradeCardId: string) => void;
  /** The shared enrolment checkout, shown when the blocker is registration or payment. */
  registrationSlot?: ReactNode;
  /** The identity capture step, shown when the blocker is identity verification. */
  identitySlot?: ReactNode;
  /** The registration fee, already formatted; omitted when free. */
  feeLabel?: string | null;
  onOpenPrerequisite?: () => void;
}

const HEADLINE_FONT = { fontFamily: '"Clash Display", var(--font-sora), sans-serif' };
const SERIF_FONT = { fontFamily: "var(--font-fraunces), ui-serif, Georgia, serif" };

export function ExamOverview({
  landing,
  hubHref,
  onStart,
  onSelectPlan,
  onViewGradeCard,
  registrationSlot,
  identitySlot,
  feeLabel,
  onOpenPrerequisite,
}: ExamOverviewProps) {
  const [showHonorCode, setShowHonorCode] = useState(false);

  const meta = planTypeMeta(landing.planType);
  const kind = planKindLabel(landing.planType, landing.graded);
  const needsRegistration =
    landing.blockedReason === "REGISTRATION_REQUIRED" || landing.blockedReason === "PAYMENT_REQUIRED";
  const needsIdentity = landing.blockedReason === "IDENTITY_REQUIRED";
  const resuming = landing.openAttemptId !== null;
  const retaking = !resuming && landing.attemptsUsed > 0;
  const latest = landing.latestAttempt ?? landing.history[0] ?? null;

  const words = landing.title.trim().split(/\s+/);
  const lastWord = words.pop() ?? "";
  const firstPart = words.join(" ");

  const facts = [
    { icon: Clock, label: `${landing.durationMinutes} min` },
    ...(landing.questionCount > 0
      ? [{ icon: ListChecks, label: `${landing.questionCount} question${landing.questionCount === 1 ? "" : "s"}` }]
      : []),
    { icon: Target, label: landing.graded ? `Pass mark ${landing.passPercentage}%` : "Not graded" },
    {
      icon: RotateCcw,
      label: `${landing.maxAttempts} attempt${landing.maxAttempts === 1 ? "" : "s"}`,
    },
  ];

  const action = needsRegistration && registrationSlot ? (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-3xl font-medium text-ink" style={SERIF_FONT}>
        {feeLabel ?? "Free"}
      </span>
      <div className="min-w-[220px] sm:min-w-[240px]">{registrationSlot}</div>
    </div>
  ) : needsIdentity && identitySlot ? (
    <div className="max-w-md">{identitySlot}</div>
  ) : landing.startable ? (
    <button
      type="button"
      onClick={() => setShowHonorCode(true)}
      className="inline-flex min-w-[220px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98]"
    >
      {resuming ? "Resume exam" : retaking ? "Retake exam" : "Start exam"}
      <ChevronRight size={16} />
    </button>
  ) : (
    <div className="inline-flex items-center gap-2 rounded-xl border border-line bg-paper px-4 py-3 text-[13px] font-medium text-subtle">
      <span className="text-slate-400">{blockedIcon(landing.blockedReason)}</span>
      {landing.blockedMessage ?? "This exam isn't available right now."}
    </div>
  );

  return (
    <main className="min-h-screen bg-white text-ink">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="arcade-wash w-full">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-28 sm:px-8 sm:pt-32">
          <section className="arcade-fade">
            <nav aria-label="Breadcrumb" className="mb-8">
              <ol className="flex flex-wrap items-center gap-2 text-[13.5px]">
                <li className="flex items-center gap-2">
                  <Link href={hubHref} className="font-bold text-slate-700 transition-colors hover:text-ink">
                    Explore Exams
                  </Link>
                  <ChevronRight size={13} className="text-subtle/50" />
                </li>
                <li className="font-bold text-ink">{landing.title}</li>
              </ol>
            </nav>

            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${meta.chip}`}
                  >
                    {landing.planType === "ASSESSMENT" ? <FileText size={12} /> : <Award size={12} />}
                    {kind}
                  </span>
                  {landing.planType === "COMPLETION" && landing.tiedContentTitle && (
                    <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-amber-800">
                      Completes {landing.tiedContentTitle}
                    </span>
                  )}
                  {landing.proctoringRequired && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600">
                      <ShieldCheck size={12} /> Proctored
                    </span>
                  )}
                </div>

                <h1
                  className="mt-5 text-[2.75rem] font-bold leading-[1.05] tracking-tight text-ink text-balance sm:text-[4rem]"
                  style={HEADLINE_FONT}
                >
                  {firstPart}{firstPart ? " " : ""}
                  <span className="bg-gradient-to-r from-[#00c885] via-[#0284c7] to-[#4f46e5] bg-clip-text text-transparent">
                    {lastWord}
                  </span>
                </h1>
                {landing.planName && (
                  <p className="mt-3 text-[15px] font-semibold text-subtle">{landing.planName}</p>
                )}

                <div className="mt-7 flex flex-wrap gap-2.5">
                  {facts.map(({ icon: Icon, label }) => (
                    <span
                      key={label}
                      className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-2 text-[13px] font-medium text-ink"
                    >
                      <Icon size={14} className="shrink-0 text-subtle" />
                      {label}
                    </span>
                  ))}
                </div>

                <div className="mt-8">{action}</div>

                {landing.attemptsUsed > 0 && (
                  <p className="mt-4 text-[13px] font-medium text-subtle">
                    {landing.attemptsUsed} of {landing.maxAttempts} attempt{landing.maxAttempts === 1 ? "" : "s"} used
                    {latest?.gradeCardId && (
                      <>
                        {" · "}
                        <button
                          type="button"
                          onClick={() => onViewGradeCard(latest.gradeCardId!)}
                          className="cursor-pointer font-semibold text-ink underline decoration-slate-300 underline-offset-4 hover:decoration-ink"
                        >
                          View your grade card
                        </button>
                      </>
                    )}
                  </p>
                )}
              </div>

              <ExamCover landing={landing} kind={kind} />
            </div>
          </section>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div className="w-full bg-white">
        <div className="mx-auto max-w-6xl px-5 pb-28 pt-14 sm:px-8 sm:pb-36 sm:pt-16">
          {landing.plans.length > 1 && (
            <div className="mb-14 flex justify-center">
              <div className="flex max-w-full gap-1 overflow-x-auto rounded-full border border-line bg-slate-50 p-1.5 shadow-[0_8px_30px_rgba(20,22,28,0.05)]">
                {landing.plans.map((p) => {
                  const active = p.planId === landing.planId;
                  return (
                    <button
                      key={p.planId}
                      type="button"
                      onClick={() => onSelectPlan(p.planId)}
                      aria-pressed={active}
                      className={`relative shrink-0 cursor-pointer rounded-full px-4 py-2 text-[13px] font-semibold transition-colors sm:px-5 ${
                        active ? "text-paper" : "text-subtle hover:text-ink"
                      }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="examPlanPill"
                          className="absolute inset-0 rounded-full bg-ink"
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="relative z-10">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {landing.prerequisite && !landing.prerequisite.met && (
            <div className="mb-12">
              <PrerequisiteNotice prerequisite={landing.prerequisite} onOpen={onOpenPrerequisite} />
            </div>
          )}

          <div className="grid gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <h2 className="text-2xl font-light text-ink" style={SERIF_FONT}>
                About this exam
              </h2>
              {landing.description || landing.planDescription || landing.purpose ? (
                <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-subtle">
                  {landing.description && <p className="whitespace-pre-wrap">{landing.description}</p>}
                  {landing.planDescription && <p className="whitespace-pre-wrap">{landing.planDescription}</p>}
                  {landing.purpose && <p className="whitespace-pre-wrap">{landing.purpose}</p>}
                </div>
              ) : (
                <p className="mt-4 text-[15px] leading-relaxed text-subtle">
                  {meta.effect}
                </p>
              )}

              {landing.instructions != null && (
                <>
                  <h3 className="mt-10 text-xl font-light text-ink" style={SERIF_FONT}>
                    Instructions
                  </h3>
                  <div className="mt-3 text-[15px] leading-relaxed text-slate-700">
                    <TiptapContentView body={JSON.stringify(landing.instructions)} emptyMessage="" />
                  </div>
                </>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-light text-ink" style={SERIF_FONT}>
                What to expect
              </h2>
              <ul className="mt-5 space-y-4">
                <Expect
                  icon={<CalendarDays size={16} />}
                  title={
                    landing.accessWindow?.closesAt
                      ? `Closes ${formatWhen(landing.accessWindow.closesAt)}`
                      : landing.accessWindow?.opensAt
                      ? `Opens ${formatWhen(landing.accessWindow.opensAt)}`
                      : "Self-paced"
                  }
                  sub={landing.accessWindow?.opensAt || landing.accessWindow?.closesAt ? "Set by the creator" : "No fixed deadline"}
                />
                <Expect
                  icon={<Clock size={16} />}
                  title={`${landing.durationMinutes} minute limit`}
                  sub="The timer starts when you begin"
                />
                <Expect
                  icon={<RotateCcw size={16} />}
                  title={`${landing.maxAttempts} attempt${landing.maxAttempts === 1 ? "" : "s"} allowed`}
                  sub={
                    landing.attemptsRemaining > 0
                      ? `${landing.attemptsRemaining} remaining`
                      : "All attempts used"
                  }
                />
                <Expect
                  icon={<Award size={16} />}
                  title="A grade card for every sitting"
                  sub={
                    landing.graded
                      ? `Marks by section, and pass or fail against ${landing.passPercentage}%`
                      : "Your marks by section, for your own reference"
                  }
                />
                {landing.proctoringRequired && (
                  <Expect
                    icon={<ShieldCheck size={16} />}
                    title="Proctored"
                    sub={
                      landing.maxViolations > 0
                        ? `Leaving the window is recorded; ${landing.maxViolations} violation${landing.maxViolations === 1 ? "" : "s"} end the attempt`
                        : "Leaving the window is recorded"
                    }
                  />
                )}
                {landing.identityVerificationRequired && (
                  <Expect
                    icon={<ShieldCheck size={16} />}
                    title="Identity check"
                    sub="You submit a photo before starting; an administrator reviews it"
                  />
                )}
                {landing.fullscreenRequired && (
                  <Expect
                    icon={<Maximize2 size={16} />}
                    title="Fullscreen"
                    sub="The exam runs in fullscreen; leaving it is recorded"
                  />
                )}
              </ul>
            </div>
          </div>

          {landing.history.length > 0 && (
            <section className="mt-16">
              <h2 className="text-2xl font-light text-ink" style={SERIF_FONT}>
                Your attempts
              </h2>
              <p className="mt-2 text-[14px] text-subtle">
                Each finished attempt has a grade card with your full marks.
              </p>
              <ul className="mt-6 divide-y divide-slate-100 overflow-hidden rounded-2xl border border-line bg-white">
                {landing.history.map((attempt) => (
                  <li key={attempt.attemptId} className="flex items-center justify-between gap-3 px-5 py-4">
                    <div className="min-w-0">
                      <p className="text-[14px] font-semibold text-ink">Attempt {attempt.attemptNumber}</p>
                      <p className="text-[12px] font-medium text-slate-400">
                        {attempt.submittedAt
                          ? formatWhen(attempt.submittedAt)
                          : attempt.status === "IN_PROGRESS"
                          ? "In progress"
                          : "Not submitted"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <AttemptOutcome attempt={attempt} graded={landing.graded} />
                      {attempt.gradeCardId && (
                        <button
                          type="button"
                          onClick={() => onViewGradeCard(attempt.gradeCardId!)}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-line px-3.5 py-1.5 text-[12px] font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                        >
                          Grade card <ChevronRight size={13} />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>

      <HonorCodeModal
        isOpen={showHonorCode}
        onClose={() => setShowHonorCode(false)}
        onContinue={() => {
          setShowHonorCode(false);
          try {
            sessionStorage.setItem("arcade_honor_code_accepted", "true");
          } catch {}
          onStart();
        }}
      />
    </main>
  );
}

/** The hero's right side: the exam's cover, or a composed card when it has none. */
function ExamCover({ landing, kind }: { landing: AssessmentLandingResponse; kind: string }) {
  return (
    <div className="relative mx-auto w-full max-w-[560px]">
      <div className="overflow-hidden rounded-[1.6rem] border-[6px] border-[#2a2d3a] bg-[#2a2d3a] shadow-[0_30px_80px_rgba(20,22,28,0.22)]">
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[1.1rem]">
          {landing.coverImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={landing.coverImageUrl} alt="" className="absolute inset-0 size-full object-cover" />
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_20%_10%,#dff7ee_0%,#e6efff_45%,#efe9ff_100%)]">
              <Award
                aria-hidden="true"
                strokeWidth={1}
                className="absolute -bottom-6 -right-6 size-56 text-[#4f46e5]/10"
              />
              <div className="absolute inset-0 flex flex-col justify-end p-7">
                <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-slate-500">{kind}</p>
                <p className="mt-1 line-clamp-2 text-[1.6rem] font-bold leading-tight text-ink" style={HEADLINE_FONT}>
                  {landing.title}
                </p>
              </div>
            </div>
          )}
          <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-black/55 px-3 py-1.5 text-[12px] font-semibold text-white backdrop-blur">
            <span className="size-2 rounded-full bg-emerald-400" />
            {landing.questionCount > 0 ? `${landing.questionCount} questions · ${landing.durationMinutes} min` : `${landing.durationMinutes} min`}
          </span>
        </div>
      </div>
    </div>
  );
}

function Expect({ icon, title, sub }: { icon: ReactNode; title: string; sub: string }) {
  return (
    <li className="flex items-start gap-3.5">
      <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-700">
        {icon}
      </span>
      <div>
        <p className="text-[15px] font-semibold text-ink">{title}</p>
        <p className="text-[13px] text-subtle">{sub}</p>
      </div>
    </li>
  );
}

/** An attempt's outcome in words; the marks themselves are on its grade card. */
function AttemptOutcome({
  attempt,
  graded,
}: {
  attempt: AssessmentLandingResponse["history"][number];
  graded: boolean;
}) {
  if (attempt.awaitingReview) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-amber-700">
        <Hourglass size={13} /> Awaiting marking
      </span>
    );
  }
  if (attempt.percentage === null) {
    return <span className="text-[12px] font-medium text-slate-400">{attemptStatusLabel(attempt)}</span>;
  }
  if (!graded) {
    return <span className="text-[12px] font-semibold text-slate-500">Completed</span>;
  }
  return attempt.passed ? (
    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700">
      <CheckCircle2 size={13} /> Passed
    </span>
  ) : (
    <span className="text-[12px] font-semibold text-slate-500">Not passed</span>
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
