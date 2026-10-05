"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Eye, Lock, Play, RefreshCw, ShieldCheck } from "lucide-react";
import {
  planKindLabel,
  previewExamPaper,
  type ExamPlanResponse,
  type ExamResponse,
} from "@/domains/assessments";
import { TiptapContentView } from "@/domains/learning";
import {
  StudioCanvasEmpty,
  StudioCanvasError,
  StudioCanvasLoading,
} from "@/apps/creator/studio/core/StudioShell";

/**
 * Learner-facing preview of a plan.
 *
 * <p>What a candidate would be shown, not what an author edits: the instructions they read before
 * starting, the rules that apply to them, and a real generated paper. Answer keys, marks schemes
 * and administrative controls are deliberately absent — the preview's value is that it is the
 * candidate's view, so anything only an author can see would make it lie.
 *
 * <p>It samples a fresh paper each time through the preview endpoint, which persists nothing. The
 * learner endpoint would have generated and kept the author's own paper, permanently consuming the
 * single attempt paper they would be given as a candidate.
 */
export function ExamPreviewWorkspace({
  exam,
  plan,
}: {
  exam: ExamResponse;
  plan: ExamPlanResponse | null;
}) {
  const [paper, setPaper] = useState<
    Array<{ id: string; level: string; question: unknown; options: string[]; marks: number | null }> | null
  >(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!plan) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    previewExamPaper(exam.id, plan.id)
      .then((result) => {
        if (!cancelled) setPaper(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Couldn't build a preview paper.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [exam.id, plan?.id, nonce]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!plan) {
    return (
      <StudioCanvasEmpty
        icon={Eye}
        title="Create a plan to preview this exam"
        description="A preview shows what a candidate sees when they sit one particular plan — its instructions, its rules and a real paper built from its question selection."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* ── Candidate-facing cover ──────────────────────────────────────── */}
      <section className="border-t border-slate-200/70 pt-6 first:border-t-0 first:pt-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {planKindLabel(plan.planType, plan.graded)} · {plan.name}
            </span>
            <h2 className="mt-1 text-lg font-black tracking-tight text-ink">{exam.title}</h2>
            {exam.description && (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{exam.description}</p>
            )}
          </div>
          {/* Sits the plan's draft paper end to end as a candidate would, graded on submit. Nothing
              is saved and no attempt is used up. */}
          <Link
            href={`/exams/${exam.id}/attempt?planId=${plan.id}&preview=true&returnTo=${encodeURIComponent(`/studio/content/exam/${exam.id}`)}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-xs font-bold text-on-ink transition-colors hover:bg-ink-hover"
          >
            <Play size={13} /> Sit it as a candidate
          </Link>
        </div>

        <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Fact icon={Clock} label="Time allowed" value={`${plan.durationMinutes} minutes`} />
          <Fact icon={Eye} label="Questions" value={String(plan.totalQuestions)} />
          <Fact
            icon={ShieldCheck}
            label="Pass mark"
            value={plan.planType === "ASSESSMENT" && !plan.graded ? "Not graded" : `${plan.passPercentage}%`}
          />
          <Fact
            icon={RefreshCw}
            label="Attempts"
            value={plan.maxAttempts === 1 ? "One attempt" : `${plan.maxAttempts} attempts`}
          />
        </dl>

        {(plan.proctoringRequired || plan.identityVerificationRequired || plan.fullscreenRequired || plan.hubListed) && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-500/25 dark:bg-amber-500/10">
            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-200">
              <Lock size={13} /> Before you start
            </span>
            <ul className="mt-2 space-y-1 text-xs leading-relaxed text-amber-900/80 dark:text-amber-200">
              {plan.hubListed && (
                <li>
                  · You register for this exam from Explore &gt; Exams
                  {exam.tieType ? ` after completing ${exam.tiedContentTitle ?? "the tied content"}` : ""}.
                </li>
              )}
              {plan.identityVerificationRequired && <li>· You submit a photo of yourself before starting.</li>}
              {plan.proctoringRequired && (
                <li>
                  · This exam is proctored; leaving the window is recorded
                  {plan.maxViolations > 0 ? ` and ${plan.maxViolations} violations end the attempt` : ""}.
                </li>
              )}
              {plan.fullscreenRequired && <li>· You must stay in full screen for the whole attempt.</li>}
            </ul>
          </div>
        )}
      </section>
      <section className="border-t border-slate-200/70 pt-6 first:border-t-0 first:pt-0">
        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-500">{plan.name}</span>
        <h2 className="mt-1 text-xl font-black tracking-tight text-ink">{exam.title}</h2>
        {exam.description && (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">{exam.description}</p>
        )}

        <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Fact icon={Clock} label="Time allowed" value={`${plan.durationMinutes} minutes`} />
          <Fact icon={Eye} label="Questions" value={String(plan.totalQuestions)} />
          <Fact icon={ShieldCheck} label="Pass mark" value={`${plan.passPercentage}%`} />
          <Fact
            icon={RefreshCw}
            label="Attempts"
            value={plan.maxAttempts === 1 ? "One attempt" : `${plan.maxAttempts} attempts`}
          />
        </dl>

        {(plan.proctoringRequired || plan.identityVerificationRequired || plan.fullscreenRequired || plan.hubListed) && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-500/25 dark:bg-amber-500/10">
            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-800 dark:text-amber-200">
              <Lock size={13} /> Before you start
            </span>
            <ul className="mt-2 space-y-1 text-xs leading-relaxed text-amber-900/80 dark:text-amber-200">
              {plan.hubListed && (
                <li>
                  · You register for this exam from Explore &gt; Exams
                  {exam.tieType ? ` after completing ${exam.tiedContentTitle ?? "the tied content"}` : ""}.
                </li>
              )}
              {plan.identityVerificationRequired && <li>· You submit a photo of yourself before starting.</li>}
              {plan.proctoringRequired && (
                <li>
                  · This exam is proctored; leaving the window is recorded
                  {plan.maxViolations > 0 ? ` and ${plan.maxViolations} violations end the attempt` : ""}.
                </li>
              )}
              {plan.fullscreenRequired && <li>· You must stay in full screen for the whole attempt.</li>}
            </ul>
          </div>
        )}
      </section>

      {/* ── A real generated paper ──────────────────────────────────────── */}
      <section className="border-t border-slate-200/70 pt-6 first:border-t-0 first:pt-0">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold tracking-tight text-slate-900">Sample paper</h3>
            <p className="mt-0.5 text-[11px] text-slate-500">
              {plan.fixedPaper
                ? "Every candidate sits this same selection."
                : "Drawn from this plan's rules — each candidate gets their own selection."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setNonce((n) => n + 1)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-surface px-3 py-1.5 text-xs font-bold text-ink transition-colors hover:bg-slate-50"
          >
            <RefreshCw size={13} /> Draw again
          </button>
        </div>

        {loading ? (
          <StudioCanvasLoading label="Building a paper…" />
        ) : error ? (
          <StudioCanvasError message={error} onRetry={() => setNonce((n) => n + 1)} />
        ) : !paper || paper.length === 0 ? (
          <StudioCanvasEmpty
            icon={Eye}
            title="This plan can't build a paper yet"
            description="Its question selection doesn't match enough questions. Open the plan's Questions panel to see which line is short."
          />
        ) : (
          <ol className="flex flex-col gap-3">
            {paper.map((q, index) => (
              <li key={q.id} className="rounded-xl border border-slate-100 bg-surface p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-lg bg-ink text-[11px] font-bold text-on-ink">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-ink">
                      <TiptapContentView body={JSON.stringify(q.question)} />
                    </div>
                    {q.options.length > 0 && (
                      <ul className="mt-3 space-y-1.5">
                        {/* No correctness shown: a candidate sees options, not the answer key. */}
                        {q.options.map((option, i) => (
                          <li
                            key={`${q.id}-${i}`}
                            className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-1.5 text-xs text-slate-600"
                          >
                            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[9px] font-bold text-slate-400">
                              {String.fromCharCode(65 + i)}
                            </span>
                            {option}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                  {q.marks !== null && (
                    <span className="flex-shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                      {q.marks} mark{q.marks === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50/80 px-3 py-2.5">
      <dt className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        <Icon size={11} /> {label}
      </dt>
      <dd className="mt-0.5 text-sm font-bold text-ink">{value}</dd>
    </div>
  );
}
