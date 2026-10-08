"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Ban, Check, Clock, Loader2, MoreHorizontal, Plus, RotateCcw, ShieldAlert, X } from "lucide-react";
import { toast } from "sonner";
import {
  cancelExamAttempt,
  extendExamAttempt,
  grantExtraAttempts,
  listAttemptsForExam,
  reviewAttemptIdentity,
  type ExamAttemptSummaryResponse,
  type ExamPlanResponse,
} from "@/domains/assessments";
import { useStudioConfirm } from "@/apps/creator/studio/core/useStudioConfirm";
import { StudioRowMenu } from "@/apps/creator/studio/core/StudioRowMenu";

/**
 * Who has sat this exam, how they did, and the administrator's levers: identity review, ending an
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

function IdentityCell({
  attempt,
  onReview,
}: {
  attempt: ExamAttemptSummaryResponse;
  onReview: (approved: boolean) => void;
}) {
  if (!attempt.identityStatus || attempt.identityStatus === "NOT_SUBMITTED") {
    return <span className="text-[11px] text-slate-400">—</span>;
  }
  return (
    <div className="flex items-center gap-2">
      {attempt.identityEvidenceUrl && (
        <a href={attempt.identityEvidenceUrl} target="_blank" rel="noreferrer" title="Open photo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={attempt.identityEvidenceUrl} alt="" className="size-8 rounded-lg border border-slate-200 object-cover" />
        </a>
      )}
      {attempt.identityStatus === "SUBMITTED" ? (
        <span className="flex gap-1">
          <button
            type="button"
            title="Approve identity"
            onClick={() => onReview(true)}
            className="rounded-md border border-emerald-200 bg-emerald-50 p-1 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/15"
          >
            <Check size={12} />
          </button>
          <button
            type="button"
            title="Reject identity"
            onClick={() => onReview(false)}
            className="rounded-md border border-rose-200 bg-rose-50 p-1 text-rose-700 hover:bg-rose-100 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/15"
          >
            <X size={12} />
          </button>
        </span>
      ) : (
        <span
          className={`text-[11px] font-bold ${
            attempt.identityStatus === "APPROVED" ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"
          }`}
        >
          {attempt.identityStatus === "APPROVED" ? "Approved" : "Rejected"}
        </span>
      )}
    </div>
  );
}

export function ExamAttemptsWorkspace({ examId, plans }: { examId: string; plans: ExamPlanResponse[] }) {
  const [attempts, setAttempts] = useState<ExamAttemptSummaryResponse[] | null>(null);
  const [error, setError] = useState(false);
  const [planFilter, setPlanFilter] = useState<string>("");
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

  const pendingIdentity = attempts.filter((a) => a.identityStatus === "SUBMITTED").length;

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
        {pendingIdentity > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-[11px] font-bold text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
            <ShieldAlert size={12} /> {pendingIdentity} identity photo{pendingIdentity === 1 ? "" : "s"} to review
          </span>
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-surface">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wide text-slate-400">
              <th className="px-4 py-3">Learner</th>
              <th className="px-4 py-3">Plan</th>
              <th className="px-4 py-3">Score</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Identity</th>
              <th className="px-4 py-3">Violations</th>
              <th className="px-4 py-3">Submitted</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visible.map((a) => (
              <tr key={a.attemptId}>
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
                  <IdentityCell
                    attempt={a}
                    onReview={(approved) =>
                      void act(
                        () => reviewAttemptIdentity(a.attemptId, approved),
                        approved ? "Identity approved" : "Identity rejected"
                      ).catch(() => undefined)
                    }
                  />
                </td>
                <td className="px-4 py-3 text-xs tabular-nums text-slate-600">{a.violationCount || "—"}</td>
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
            ))}
          </tbody>
        </table>
      </div>
      {dialog}
    </div>
  );
}

