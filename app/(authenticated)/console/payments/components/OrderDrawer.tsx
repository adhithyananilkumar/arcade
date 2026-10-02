/* eslint-disable react-hooks/set-state-in-effect -- loading/error flags reset when the query inputs change */
"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Copy, Loader2, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import {
  describeCommission,
  PaymentAdminService,
  PaymentStatusBadge,
  REFUND_TREATMENT_LABEL,
  type PaymentOrderDetail,
} from "@/domains/payment";
import { formatMoney, fromMinorUnits, toMinorUnits } from "@/shared/utils/money";

const TIMELINE_LABEL: Record<string, string> = {
  CREATED: "Checkout opened",
  CHECKOUT_REUSED: "Checkout reopened",
  ATTEMPT_FAILED: "Attempt declined",
  PAID: "Paid",
  LATE_CAPTURE: "Captured after expiry",
  AMOUNT_MISMATCH: "Amount mismatch",
  EXPIRED: "Closed",
  GATEWAY_RECOVERED: "Recovered from gateway",
  GRANT_RETRIED: "Access re-requested",
  REFUND_REQUESTED: "Refund requested",
  REFUND_COMPLETED: "Refund completed",
  REFUND_FAILED: "Refund failed",
};

const TIMELINE_TONE: Record<string, string> = {
  PAID: "bg-emerald-500",
  REFUND_COMPLETED: "bg-violet-500",
  ATTEMPT_FAILED: "bg-rose-400",
  REFUND_FAILED: "bg-rose-500",
  AMOUNT_MISMATCH: "bg-rose-600",
  LATE_CAPTURE: "bg-amber-500",
  GATEWAY_RECOVERED: "bg-sky-500",
};

function when(value?: string | null) {
  return value
    ? new Date(value).toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" })
    : "—";
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-xs">
      <span className="shrink-0 font-medium text-slate-400">{label}</span>
      <span className="min-w-0 text-right font-semibold text-slate-800 break-words">{children}</span>
    </div>
  );
}

/**
 * One order, everything about it, and the refund action. Money only leaves after an explicit
 * confirm; the request carries an idempotency key so a double click or retry cannot send it twice.
 */
export function OrderDrawer({
  orderId,
  canRefund,
  onClose,
  onChanged,
}: {
  orderId: string;
  canRefund: boolean;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [detail, setDetail] = useState<PaymentOrderDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  const [refundOpen, setRefundOpen] = useState(false);
  const [amountText, setAmountText] = useState("");
  const [reason, setReason] = useState("");
  const [revokeAccess, setRevokeAccess] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // One key per refund intent: stable across retries of the same submission.
  const [refundKey, setRefundKey] = useState(() => crypto.randomUUID());

  useEffect(() => {
    let cancelled = false;
    setError(null);
    PaymentAdminService.detail(orderId)
      .then((d) => {
        if (cancelled) return;
        setDetail(d);
        setAmountText(String(fromMinorUnits(d.refundableMinor)));
      })
      .catch((err) => !cancelled && setError(err?.message || "Could not load this order."));
    return () => {
      cancelled = true;
    };
  }, [orderId, reload]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const order = detail?.order;
  const amountMinor = useMemo(() => {
    const value = Number(amountText);
    return Number.isFinite(value) && value > 0 ? toMinorUnits(value) : null;
  }, [amountText]);
  const amountInvalid = !!detail && (amountMinor === null || amountMinor > detail.refundableMinor);

  const submitRefund = async () => {
    if (!detail || !order || amountMinor === null) return;
    setSubmitting(true);
    try {
      const result = await PaymentAdminService.refund(order.paymentOrderId, {
        amount: amountMinor === detail.refundableMinor ? undefined : amountMinor,
        reason: reason.trim(),
        revokeAccess,
        idempotencyKey: refundKey,
      });
      toast.success(
        result.status === "COMPLETED"
          ? `Refunded ${formatMoney(result.amount, result.currency)}.`
          : `Refund of ${formatMoney(result.amount, result.currency)} sent — the gateway will confirm it shortly.`,
      );
      setRefundOpen(false);
      setConfirming(false);
      setReason("");
      setRevokeAccess(false);
      setRefundKey(crypto.randomUUID());
      setReload((n) => n + 1);
      onChanged();
    } catch (err: unknown) {
      toast.error(err instanceof Error && err.message ? err.message : "The refund could not be sent.");
      setConfirming(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex justify-end" role="dialog" aria-modal="true" aria-label="Payment order">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 cursor-default bg-slate-900/30 backdrop-blur-[2px]" />
      <aside className="relative flex h-full w-full max-w-[520px] flex-col overflow-y-auto bg-white shadow-2xl">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Payment order</p>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(orderId);
                toast.success("Order ID copied");
              }}
              className="mt-0.5 inline-flex cursor-pointer items-center gap-1.5 font-mono text-xs font-semibold text-slate-700 hover:text-slate-900"
            >
              {orderId} <Copy size={11} />
            </button>
          </div>
          <button type="button" onClick={onClose} className="cursor-pointer rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <X size={18} />
          </button>
        </header>

        {error && <p className="m-5 rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">{error}</p>}
        {!detail && !error && (
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        )}

        {detail && order && (
          <div className="space-y-6 px-5 py-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-2xl font-bold tracking-tight text-[#14142b] tabular-nums">{formatMoney(order.amount, order.currency)}</p>
                <p className="mt-0.5 truncate text-xs font-medium text-slate-500">{order.resourceTitle || "Untitled"}</p>
              </div>
              <PaymentStatusBadge status={order.status} />
            </div>

            {(detail.refundedMinor > 0 || detail.refundInFlightMinor > 0) && (
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  ["Refunded", detail.refundedMinor],
                  ["In progress", detail.refundInFlightMinor],
                  ["Refundable", detail.refundableMinor],
                ].map(([label, value]) => (
                  <div key={label as string} className="rounded-xl border border-slate-200/80 px-2 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                    <p className="mt-0.5 text-xs font-bold tabular-nums text-slate-800">{formatMoney(value as number, order.currency)}</p>
                  </div>
                ))}
              </div>
            )}

            {order.paidAt && (
              <section className="rounded-2xl border border-slate-200/80 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Split</h4>
                  <span className="text-[11px] font-medium text-slate-500">
                    {describeCommission({
                      rateBps: detail.commission.rateBps,
                      fixedFeeMinor: detail.commission.fixedMinor,
                      fixedFeeCurrency: order.currency,
                    })}
                    {detail.commission.chargedMinor > 0 && ` · ${REFUND_TREATMENT_LABEL[detail.commission.refundTreatment].toLowerCase()}`}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-center">
                  <div className="rounded-xl bg-amber-50/70 px-2 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700/70">Platform commission</p>
                    <p className="mt-0.5 text-xs font-bold tabular-nums text-slate-800">
                      {formatMoney(detail.commission.retainedMinor, order.currency)}
                    </p>
                    {detail.commission.retainedMinor !== detail.commission.chargedMinor && (
                      <p className="text-[10.5px] text-slate-400">of {formatMoney(detail.commission.chargedMinor, order.currency)} charged</p>
                    )}
                  </div>
                  <div className="rounded-xl bg-indigo-50/70 px-2 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-700/70">Owed to channel</p>
                    <p
                      className={`mt-0.5 text-xs font-bold tabular-nums ${
                        detail.commission.channelPayableMinor < 0 ? "text-rose-600" : "text-slate-800"
                      }`}
                    >
                      {formatMoney(detail.commission.channelPayableMinor, order.currency)}
                    </p>
                  </div>
                </div>
              </section>
            )}

            <section className="divide-y divide-slate-100 rounded-2xl border border-slate-200/80 px-4 py-1.5">
              <Row label="Learner">
                {order.userName || "—"}
                {order.userEmail && <span className="block font-mono text-[11px] font-medium text-slate-400">{order.userEmail}</span>}
              </Row>
              <Row label="Channel">{order.channelName || "—"}</Row>
              <Row label="Credited to">{order.instructorName || "—"}</Row>
              <Row label="Content">{order.resourceType}</Row>
              <Row label="Enrollment">{detail.enrollmentStatus || "missing"}</Row>
              <Row label="Opened">{when(order.createdAt)}</Row>
              <Row label="Paid">{when(order.paidAt)}</Row>
              {!order.paidAt && <Row label="Expires">{when(order.expiresAt)}</Row>}
              {order.attemptCount > 0 && (
                <Row label="Declined attempts">
                  {order.attemptCount}
                  {order.lastFailureReason && <span className="block text-[11px] font-medium text-rose-500">{order.lastFailureReason}</span>}
                </Row>
              )}
            </section>

            {canRefund && detail.refundableMinor > 0 && (
              <section className="rounded-2xl border border-slate-200/80 p-4">
                {!refundOpen ? (
                  <button
                    type="button"
                    onClick={() => setRefundOpen(true)}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-700 hover:bg-rose-100"
                  >
                    <RotateCcw size={14} /> Refund
                  </button>
                ) : (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-[#14142b]">Refund this order</h4>
                    <label className="block text-xs font-semibold text-slate-600">
                      Amount ({order.currency})
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={amountText}
                        onChange={(e) => setAmountText(e.target.value)}
                        disabled={confirming}
                        className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-slate-400"
                      />
                      <span className={`mt-1 block text-[11px] font-medium ${amountInvalid ? "text-rose-600" : "text-slate-400"}`}>
                        Up to {formatMoney(detail.refundableMinor, order.currency)} refundable.
                      </span>
                      {detail.commission.chargedMinor > 0 && (
                        <span className="mt-0.5 block text-[11px] font-medium text-amber-700">
                          {detail.commission.refundTreatment === "RETAINED"
                            ? "Arcade keeps its commission on this sale; the channel's payable drops by the full refund."
                            : "Arcade's commission is returned in proportion to the amount refunded."}
                        </span>
                      )}
                    </label>
                    <label className="block text-xs font-semibold text-slate-600">
                      Reason <span className="font-normal text-slate-400">(kept on the record)</span>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value.slice(0, 500))}
                        disabled={confirming}
                        rows={2}
                        className="mt-1 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-400"
                      />
                    </label>
                    <label className="flex cursor-pointer items-start gap-2 text-xs font-medium text-slate-600">
                      <input
                        type="checkbox"
                        checked={revokeAccess}
                        onChange={(e) => setRevokeAccess(e.target.checked)}
                        disabled={confirming}
                        className="mt-0.5"
                      />
                      <span>
                        Also withdraw access
                        <span className="block text-[11px] text-slate-400">
                          Leave unticked for a goodwill refund where the learner keeps their place.
                        </span>
                      </span>
                    </label>

                    {confirming ? (
                      <div className="space-y-2 rounded-xl bg-rose-50 p-3">
                        <p className="flex items-start gap-1.5 text-xs font-semibold text-rose-800">
                          <AlertTriangle size={14} className="mt-px shrink-0" />
                          Send {amountMinor !== null ? formatMoney(amountMinor, order.currency) : ""} back to{" "}
                          {order.userName || "the learner"}
                          {revokeAccess ? " and withdraw their access" : ""}? This cannot be undone.
                        </p>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setConfirming(false)}
                            disabled={submitting}
                            className="flex-1 cursor-pointer rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                          >
                            Back
                          </button>
                          <button
                            type="button"
                            onClick={submitRefund}
                            disabled={submitting}
                            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-60"
                          >
                            {submitting && <Loader2 size={13} className="animate-spin" />} Confirm refund
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setRefundOpen(false)}
                          className="flex-1 cursor-pointer rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={amountInvalid || reason.trim().length < 3}
                          onClick={() => setConfirming(true)}
                          className="flex-1 cursor-pointer rounded-xl bg-[#14142b] px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          Review refund
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </section>
            )}

            {detail.refunds.length > 0 && (
              <section>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Refunds</h4>
                <div className="space-y-2">
                  {detail.refunds.map((r) => (
                    <div key={r.id} className="rounded-xl border border-slate-200/80 px-3 py-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold tabular-nums text-slate-900">{formatMoney(r.amount, r.currency)}</span>
                        <span className="text-[11px] font-bold text-slate-500">{r.status}</span>
                      </div>
                      <p className="mt-1 text-slate-600">{r.reason}</p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {r.requestedByName || "Operator"} · {when(r.requestedAt)}
                        {r.revokeAccess ? " · access withdrawn" : ""}
                      </p>
                      {r.lastError && <p className="mt-1 text-[11px] font-medium text-rose-600">{r.lastError}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {detail.transactions.length > 0 && (
              <section>
                <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Gateway attempts</h4>
                <div className="space-y-1.5">
                  {detail.transactions.map((t) => (
                    <div key={t.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-[11px]">
                      <span className="font-mono text-slate-600">{t.gatewayPaymentId || t.gatewayOrderId || "—"}</span>
                      <span className={`font-bold ${t.status === "SUCCESS" ? "text-emerald-600" : t.status === "FAILED" ? "text-rose-600" : "text-slate-500"}`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            <section>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Timeline</h4>
              {detail.timeline.length === 0 ? (
                <p className="text-xs text-slate-400">No recorded events (order predates the audit timeline).</p>
              ) : (
                <ol className="relative space-y-3 border-l border-slate-200 pl-4">
                  {detail.timeline.map((e, i) => (
                    <li key={i} className="relative text-xs">
                      <span className={`absolute -left-[21px] top-1 size-2.5 rounded-full ring-2 ring-white ${TIMELINE_TONE[e.type] ?? "bg-slate-300"}`} />
                      <p className="font-semibold text-slate-800">{TIMELINE_LABEL[e.type] ?? e.type}</p>
                      {e.detail && <p className="text-slate-500">{e.detail}</p>}
                      <p className="text-[11px] text-slate-400">
                        {when(e.at)}
                        {e.actorName ? ` · ${e.actorName}` : ""}
                      </p>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        )}
      </aside>
    </div>
  );
}
