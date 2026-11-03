"use client";

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { Ban, Clock, Loader2, MoreHorizontal, Plus, RotateCcw, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { formatMoney } from "@/shared/utils/money";
import {
  cancelExamAttempt,
  extendExamAttempt,
  grantExtraAttempts,
  listAttemptsForExam,
  listExamRetakes,
  getProctorTimeline,
  type ExamAttemptSummaryResponse,
  type ProctorTimelineEntry,
  type RetakeAuditRow,
  type ExamPlanResponse,
} from "@/domains/assessments";
import { useStudioConfirm } from "@/apps/creator/studio/core/useStudioConfirm";
import { StudioRowMenu } from "@/apps/creator/studio/core/StudioRowMenu";

/**
 * Who has sat this exam, how they did, and the administrator's levers: the integrity timeline, ending an
 * attempt, extra time as an accommodation, and extra attempts for one learner. Every action is
 * authorised and audited server-side; this tab only calls it.
 */

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

function StatusBadge({ attempt }: { attempt: ExamAttemptSummaryResponse }) {
  const [label, cls] =
    attempt.status === "IN_PROGRESS"
      ? ["In progress", "bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300"]
      : attempt.status === "CANCELLED"
      ? [attempt.terminationReason === "PROCTORING_VIOLATIONS" ? "Ended: violations" : "Cancelled", "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"]
      : attempt.awaitingMarking
      ? ["Awaiting marking", "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"]
      : attempt.terminationReason === "PROCTORING_VIOLATIONS"
      ? ["Ended: violations", "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300"]
      : attempt.passed === true
      ? ["Passed", "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"]
      : attempt.passed === false
      ? ["Not passed", "bg-slate-100 text-slate-600"]
      : ["Submitted", "bg-slate-100 text-slate-600"];
  return <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${cls}`}>{label}</span>;
}

/** A silence this long means the sitting went dark; mirrors the server's `ProctoringService.SILENCE_SECONDS`. */
const SILENCE_SECONDS = 75;

const EVENT_LABELS: Record<string, string> = {
  FULLSCREEN_EXIT: "Left full screen",
  TAB_HIDDEN: "Switched tab or minimised",
  WINDOW_BLUR: "Window lost focus",
  COPY_PASTE: "Copy, cut or paste attempt",
  PASTED_CONTENT: "Text inserted in bulk",
  DEVTOOLS_OPEN: "Developer tools",
  MULTIPLE_DISPLAYS: "More than one display",
  AUTOMATION_DETECTED: "Automated browser",
  SCREEN_CAPTURE: "Print Screen key",
  VIEWPORT_CHANGED: "Window resized",
  POINTER_LEFT: "Pointer left the paper",
  LONG_IDLE: "Long idle stretch",
  CONNECTION_GAP: "No signal from the sitting",
  KEYBOARD_SHORTCUT: "Blocked shortcut",
  SESSION_RESUMED: "Sitting resumed",
};

function gapLabel(seconds: number) {
  const m = Math.floor(seconds / 60);
  return m > 0 ? `${m}m ${seconds % 60}s` : `${seconds}s`;
}

function SignalCell({ attempt }: { attempt: ExamAttemptSummaryResponse }) {
  if (attempt.longestGapSeconds < SILENCE_SECONDS) {
    return <span className="text-[11px] text-slate-400">{attempt.status === "IN_PROGRESS" ? "Steady" : "—"}</span>;
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300">
      <ShieldAlert size={12} /> Silent {gapLabel(attempt.longestGapSeconds)}
    </span>
  );
}

/** Everything the sitting's scripts reported, oldest first: strikes in rose, audit entries in grey. */
function Timeline({ attemptId }: { attemptId: string }) {
  const [rows, setRows] = useState<ProctorTimelineEntry[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    getProctorTimeline(attemptId)
      .then((r) => !cancelled && setRows(r))
      .catch(() => !cancelled && setRows([]));
    return () => {
      cancelled = true;
    };
  }, [attemptId]);

  if (rows === null) return <Loader2 className="animate-spin text-slate-400" size={14} />;
  if (rows.length === 0) return <p className="text-xs text-slate-500">Nothing was reported for this sitting.</p>;
  return (
    <ol className="space-y-1">
      {rows.map((e, i) => (
        <li key={i} className="flex flex-wrap items-baseline gap-x-3 text-xs">
          <span className="w-36 shrink-0 tabular-nums text-slate-400">{formatDate(e.occurredAt)}</span>
          <span className={e.violation ? "font-bold text-rose-700 dark:text-rose-300" : "font-semibold text-slate-600"}>
            {EVENT_LABELS[e.eventType] ?? e.eventType}
            {e.violation ? " · strike" : ""}
          </span>
          {e.detail && <span className="text-slate-400">{e.detail}</span>}
        </li>
      ))}
    </ol>
  );
}

export function ExamAttemptsWorkspace({ examId, plans }: { examId: string; plans: ExamPlanResponse[] }) {
  const [attempts, setAttempts] = useState<ExamAttemptSummaryResponse[] | null>(null);
  const [error, setError] = useState(false);
  const [planFilter, setPlanFilter] = useState<string>("");
  const [openLog, setOpenLog] = useState<string | null>(null);
  const { confirm, dialog } = useStudioConfirm();

  const load = useCallback(() => {
    listAttemptsForExam(examId)
      .then((list) => {
        setAttempts(list);
        setError(false);
      })
      .catch(() => setError(true));
  }, [examId]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(
    () => (attempts ?? []).filter((a) => !planFilter || a.planId === planFilter),
    [attempts, planFilter]
  );

  const act = async (fn: () => Promise<unknown>, done: string) => {
    try {
      await fn();
      toast.success(done);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "That didn't work.");
      throw err;
    }
  };

  if (error) return <p className="text-sm text-rose-600 dark:text-rose-400">Failed to load attempts.</p>;
  if (attempts === null) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin text-slate-400" size={20} />
      </div>
    );
  }
  if (attempts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-surface px-6 py-14 text-center">
        <p className="text-sm font-semibold text-ink">No attempts yet</p>
        <p className="mt-1 text-xs text-slate-500">Attempts appear here as soon as a learner starts.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="rounded-xl border border-slate-200 bg-surface px-3 py-1.5 text-xs font-semibold text-slate-700"
        >
          <option value="">All plans</option>
          {plans.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-surface">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3">Learner</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Signal</th>
              <th className="px-4 py-3">Strikes</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.map((a) => (
              <Fragment key={a.attemptId}>
              <tr>
                <td className="px-4 py-3">
                  <span className="font-semibold text-ink">{a.userName}</span>
                  <span className="block text-[11px] text-slate-400">Attempt {a.attemptNumber}</span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">{a.planName ?? "—"}</td>
                <td className="px-4 py-3 text-slate-600">
                  {a.percentage !== null ? `${Number(a.percentage).toFixed(0)}%` : "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge attempt={a} />
                  {a.extraMinutes > 0 && (
                    <span className="mt-1 block text-[10px] font-semibold text-slate-400">+{a.extraMinutes} min</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <SignalCell attempt={a} />
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setOpenLog(openLog === a.attemptId ? null : a.attemptId)}
                    className="text-xs font-semibold tabular-nums text-slate-600 underline-offset-2 hover:underline"
                  >
                    {a.violationCount || "0"} · log
                  </button>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500">{formatDate(a.submittedAt)}</td>
                <td className="px-4 py-3 text-right">
                  <StudioRowMenu
                    label="Attempt actions"
                    trigger={<MoreHorizontal size={15} />}
                    items={[
                      ...(a.status === "IN_PROGRESS"
                        ? [
                            {
                              key: "time",
                              label: "Give extra time…",
                              icon: <Clock size={13} />,
                              onSelect: () =>
                                confirm({
                                  title: "Give extra time",
                                  message: `Adds minutes to ${a.userName}'s current attempt.`,
                                  confirmLabel: "Add time",
                                  input: { label: "Extra minutes", type: "number", defaultValue: "10", required: true },
                                  onConfirm: async (raw) => {
                                    const minutes = Number(raw);
                                    if (!Number.isFinite(minutes) || minutes <= 0) {
                                      toast.error("Enter a number of minutes above zero.");
                                      throw new Error("invalid minutes");
                                    }
                                    await act(() => extendExamAttempt(a.attemptId, minutes), `Added ${minutes} minutes`);
                                  },
                                }),
                            },
                            {
                              key: "cancel",
                              label: "Cancel attempt",
                              icon: <Ban size={13} />,
                              danger: true,
                              onSelect: () =>
                                confirm({
                                  title: "Cancel this attempt?",
                                  message: `${a.userName}'s attempt ends now and cannot pass.`,
                                  confirmLabel: "Cancel attempt",
                                  danger: true,
                                  onConfirm: () => act(() => cancelExamAttempt(a.attemptId), "Attempt cancelled"),
                                }),
                            },
                          ]
                        : []),
                      {
                        key: "extra",
                        label: "Grant an extra attempt…",
                        icon: <Plus size={13} />,
                        onSelect: () =>
                          confirm({
                            title: "Grant an extra attempt",
                            message: `${a.userName} gets one more attempt at ${a.planName ?? "this plan"}. The reason is kept in the audit log.`,
                            confirmLabel: "Grant attempt",
                            input: { label: "Reason (optional)", placeholder: "e.g. connection dropped mid-exam" },
                            onConfirm: (reason) =>
                              act(() => grantExtraAttempts(a.planId, a.userId, 1, reason || undefined), "Extra attempt granted"),
                          }),
                      },
                      { key: "refresh", label: "Refresh", icon: <RotateCcw size={13} />, onSelect: load },
                    ]}
                  />
                </td>
              </tr>
              {openLog === a.attemptId && (
                <tr className="bg-slate-50/60 dark:bg-white/[0.02]">
                  <td colSpan={8} className="px-4 py-3">
                    <Timeline attemptId={a.attemptId} />
                  </td>
                </tr>
              )}
            </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <RetakeAudit examId={examId} attempts={attempts} plans={plans} />
      {dialog}
    </div>
  );
}

/**
 * Every retake offered on this exam under the certification standard — paid, second-chance or
 * free — and whether it was taken up. The record behind each extra attempt that no person granted.
 */
function RetakeAudit({
  examId,
  attempts,
  plans,
}: {
  examId: string;
  attempts: ExamAttemptSummaryResponse[];
  plans: ExamPlanResponse[];
}) {
  const [rows, setRows] = useState<RetakeAuditRow[] | null>(null);
  useEffect(() => {
    let cancelled = false;
    listExamRetakes(examId)
      .then((r) => !cancelled && setRows(r))
      .catch(() => !cancelled && setRows([]));
    return () => {
      cancelled = true;
    };
  }, [examId]);

  if (!rows || rows.length === 0) return null;
  const nameOf = (userId: string) => attempts.find((a) => a.userId === userId)?.userName ?? "A candidate";
  const planOf = (planId: string) => plans.find((p) => p.id === planId)?.name ?? "—";

  return (
    <section className="mt-2">
      <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">Retakes</h3>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-surface">
        <table className="w-full min-w-[640px] text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              <th className="px-4 py-2.5">Candidate</th>
              <th className="px-4 py-2.5">Plan</th>
              <th className="px-4 py-2.5">Kind</th>
              <th className="px-4 py-2.5">Price</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Offered</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.offerId}>
                <td className="px-4 py-2.5 font-semibold text-ink">{nameOf(r.userId)}</td>
                <td className="px-4 py-2.5 text-slate-600">{planOf(r.planId)}</td>
                <td className="px-4 py-2.5 text-slate-600">
                  {r.kind === "SECOND_CHANCE" ? `Second chance${r.discountPercent ? ` · ${r.discountPercent}% off` : ""}` : "Retake"}
                </td>
                <td className="px-4 py-2.5 tabular-nums text-slate-600">
                  {r.amountMinor === 0 ? "Free" : formatMoney(r.amountMinor, r.currency)}
                </td>
                <td className="px-4 py-2.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      r.status === "GRANTED"
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
                        : r.status === "OFFERED"
                        ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {r.status === "GRANTED" ? "Taken" : r.status === "OFFERED" ? "Awaiting payment" : r.status === "EXPIRED" ? "Lapsed" : "Replaced"}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-slate-500">{formatDate(r.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

