/* eslint-disable react-hooks/set-state-in-effect -- loading/error flags reset when the query inputs change */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, History, Loader2, Percent, Plus, Search, Store, Undo2, X } from "lucide-react";
import { toast } from "sonner";
import {
  describeCommission,
  formatRate,
  PaymentAdminService,
  REFUND_TREATMENT_HINT,
  REFUND_TREATMENT_LABEL,
  type CommissionChannelOption,
  type CommissionPolicyView,
  type CommissionRefundTreatment,
  type CommissionSettings,
  type CommissionState,
} from "@/domains/payment";
import { formatMoney, toMinorUnits } from "@/shared/utils/money";

const CURRENCIES = ["INR", "USD"];

const STATE_STYLE: Record<CommissionState, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
  SCHEDULED: "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300",
  SUPERSEDED: "bg-slate-100 text-slate-500",
  CANCELLED: "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400",
};

const STATE_LABEL: Record<CommissionState, string> = {
  ACTIVE: "In force",
  SCHEDULED: "Scheduled",
  SUPERSEDED: "Replaced",
  CANCELLED: "Cancelled",
};

function when(iso?: string | null): string {
  return iso ? new Date(iso).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";
}

function errorMessage(err: unknown, fallback: string): string {
  const e = err as { response?: { data?: { message?: string } }; message?: string };
  return e?.response?.data?.message || e?.message || fallback;
}

function terms(p: Pick<CommissionPolicyView, "inherit" | "rateBps" | "fixedFeeMinor" | "fixedFeeCurrency">): string {
  return p.inherit ? "Follows the platform rate" : describeCommission(p);
}

function StateBadge({ state }: { state: CommissionState }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10.5px] font-bold ${STATE_STYLE[state]}`}>
      {STATE_LABEL[state]}
    </span>
  );
}

/** What the change form is editing: the platform-wide rate, or one channel's override. */
type Target = { kind: "global" } | { kind: "channel"; channel: CommissionChannelOption };

/**
 * Console → Payments → Commission. The platform's share of every sale, and per-channel exceptions.
 *
 * Every change is a new version from now or a scheduled time. The backend snapshots the rate onto
 * each order when it is paid, so nothing here can alter a sale that already happened.
 */
export function CommissionTab({ canManage }: { canManage: boolean }) {
  const [settings, setSettings] = useState<CommissionSettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<Target | null>(null);
  const [pickingChannel, setPickingChannel] = useState(false);

  const load = useCallback(() => {
    setError(null);
    PaymentAdminService.commission()
      .then(setSettings)
      .catch((err) => setError(errorMessage(err, "Couldn't load commission settings.")));
  }, []);

  useEffect(load, [load]);

  const cancel = async (policy: CommissionPolicyView) => {
    if (!window.confirm(`Cancel the scheduled change to ${terms(policy)} on ${when(policy.effectiveFrom)}?`)) return;
    try {
      setSettings(await PaymentAdminService.cancelCommission(policy.id));
      toast.success("Scheduled change cancelled.");
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't cancel that change."));
    }
  };

  const channelGroups = useMemo(() => {
    const groups = new Map<string, CommissionPolicyView[]>();
    settings?.channels.forEach((p) => {
      if (!p.channelId) return;
      groups.set(p.channelId, [...(groups.get(p.channelId) ?? []), p]);
    });
    return Array.from(groups.entries())
      .map(([channelId, versions]) => ({
        channelId,
        name: versions[0]?.channelName || "Deleted channel",
        active: versions.find((v) => v.state === "ACTIVE") ?? null,
        scheduled: versions.filter((v) => v.state === "SCHEDULED"),
      }))
      .filter((g) => (g.active && !g.active.inherit) || g.scheduled.length > 0);
  }, [settings]);

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300">
        {error}{" "}
        <button type="button" onClick={load} className="cursor-pointer font-bold underline">
          Retry
        </button>
      </div>
    );
  }
  if (!settings) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const current = settings.current;
  const activeGlobal = settings.global.find((p) => p.state === "ACTIVE");
  const scheduledGlobal = settings.global.filter((p) => p.state === "SCHEDULED");
  const history = [...settings.global, ...settings.channels].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="space-y-5">
      {/* Platform rate */}
      <section className="rounded-2xl border border-slate-200/80 bg-surface p-5 shadow-[0_2px_10px_rgba(20,20,43,0.03)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <Percent size={18} />
            </span>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Platform commission</p>
              <p className="mt-0.5 text-2xl font-bold tracking-tight text-ink">{describeCommission(current)}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {current.source === "NONE"
                  ? "Channels currently receive everything learners pay, less refunds."
                  : `${REFUND_TREATMENT_HINT[current.refundTreatment]} In force since ${when(current.since)}.`}
              </p>
              {activeGlobal && (
                <p className="mt-1 text-[11.5px] text-slate-400">
                  Set by {activeGlobal.createdByName || "an operator"} — “{activeGlobal.note}”
                </p>
              )}
            </div>
          </div>
          {canManage && (
            <button
              type="button"
              onClick={() => setTarget({ kind: "global" })}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-xs font-bold text-on-ink hover:bg-ink-hover"
            >
              Change platform rate
            </button>
          )}
        </div>

        {scheduledGlobal.length > 0 && (
          <div className="mt-4 space-y-2">
            {scheduledGlobal.map((p) => (
              <ScheduledRow key={p.id} policy={p} canManage={canManage} onCancel={() => cancel(p)} />
            ))}
          </div>
        )}
      </section>

      {target && (
        <CommissionForm
          target={target}
          defaults={
            target.kind === "global"
              ? current
              : (() => {
                  const g = channelGroups.find((c) => c.channelId === target.channel.id);
                  return g?.active && !g.active.inherit ? g.active : current;
                })()
          }
          onClose={() => setTarget(null)}
          onSaved={(next) => {
            setSettings(next);
            setTarget(null);
          }}
        />
      )}

      {/* Channel overrides */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-surface">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
              <Store size={15} className="text-slate-400" /> Channel rates
            </h3>
            <p className="mt-0.5 text-[11.5px] font-medium text-slate-500">
              A channel with its own rate ignores the platform rate until its override is removed.
            </p>
          </div>
          {canManage && (
            <button
              type="button"
              onClick={() => setPickingChannel(true)}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <Plus size={13} /> Set a channel rate
            </button>
          )}
        </div>
        {pickingChannel && (
          <ChannelPicker
            onPick={(channel) => {
              setPickingChannel(false);
              setTarget({ kind: "channel", channel });
            }}
            onClose={() => setPickingChannel(false)}
          />
        )}
        {channelGroups.length === 0 ? (
          <p className="px-5 py-8 text-center text-xs font-medium text-slate-400">
            Every channel pays the platform rate.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {channelGroups.map((g) => (
              <li key={g.channelId} className="px-5 py-3.5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{g.name}</p>
                    <p className="text-xs text-slate-500">
                      {g.active && !g.active.inherit ? (
                        <>
                          <span className="font-semibold text-slate-700">{terms(g.active)}</span> ·{" "}
                          {REFUND_TREATMENT_LABEL[g.active.refundTreatment].toLowerCase()} · since {when(g.active.effectiveFrom)}
                        </>
                      ) : (
                        "Platform rate for now"
                      )}
                    </p>
                  </div>
                  {canManage && (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setTarget({ kind: "channel", channel: { id: g.channelId, name: g.name, personal: false } })}
                        className="cursor-pointer rounded-lg border border-slate-200 px-2.5 py-1 text-[11.5px] font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Change
                      </button>
                      {g.active && !g.active.inherit && (
                        <RemoveOverrideButton channelId={g.channelId} channelName={g.name} onSaved={setSettings} />
                      )}
                    </div>
                  )}
                </div>
                {g.scheduled.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {g.scheduled.map((p) => (
                      <ScheduledRow key={p.id} policy={p} canManage={canManage} onCancel={() => cancel(p)} />
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* History */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-surface">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
            <History size={15} className="text-slate-400" /> History
          </h3>
          <p className="mt-0.5 text-[11.5px] font-medium text-slate-500">
            Every version ever set. Each sale keeps the rate that was in force when it was paid.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 text-[10.5px] font-bold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-2.5">Applies to</th>
                <th className="px-3 py-2.5">Terms</th>
                <th className="px-3 py-2.5">On refund</th>
                <th className="px-3 py-2.5">From</th>
                <th className="px-3 py-2.5">Set by</th>
                <th className="px-3 py-2.5">Reason</th>
                <th className="px-5 py-2.5">State</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-slate-400">
                    No commission has ever been set.
                  </td>
                </tr>
              )}
              {history.map((p) => (
                <tr key={p.id}>
                  <td className="px-5 py-3 font-semibold text-slate-800">{p.channelId ? p.channelName || "Deleted channel" : "Platform"}</td>
                  <td className="px-3 py-3 text-slate-700">{terms(p)}</td>
                  <td className="px-3 py-3 text-slate-500">{p.inherit ? "—" : REFUND_TREATMENT_LABEL[p.refundTreatment]}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-slate-500">{when(p.effectiveFrom)}</td>
                  <td className="px-3 py-3 text-slate-500">
                    {p.createdByName || "—"}
                    {p.cancelledAt && (
                      <span className="block text-[11px] text-rose-500">
                        cancelled by {p.cancelledByName || "—"}
                      </span>
                    )}
                  </td>
                  <td className="max-w-[260px] px-3 py-3 text-slate-500">{p.note}</td>
                  <td className="px-5 py-3">
                    <StateBadge state={p.state} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function ScheduledRow({
  policy,
  canManage,
  onCancel,
}: {
  policy: CommissionPolicyView;
  canManage: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-indigo-100 bg-indigo-50/50 px-3 py-2 text-xs dark:border-indigo-500/25 dark:bg-indigo-500/10">
      <span className="flex items-center gap-1.5 text-indigo-900 dark:text-indigo-200">
        <CalendarClock size={13} />
        Changes to <span className="font-bold">{terms(policy)}</span>
        {!policy.inherit && <> · {REFUND_TREATMENT_LABEL[policy.refundTreatment].toLowerCase()}</>} on{" "}
        {when(policy.effectiveFrom)}
      </span>
      {canManage && (
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer rounded-lg px-2 py-0.5 text-[11.5px] font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
        >
          Cancel
        </button>
      )}
    </div>
  );
}

function RemoveOverrideButton({
  channelId,
  channelName,
  onSaved,
}: {
  channelId: string;
  channelName: string;
  onSaved: (s: CommissionSettings) => void;
}) {
  const [busy, setBusy] = useState(false);
  const remove = async () => {
    const note = window.prompt(
      `Return ${channelName} to the platform rate from now? Give a reason (kept on the record).`,
    );
    if (note === null) return;
    setBusy(true);
    try {
      onSaved(
        await PaymentAdminService.changeCommission({
          channelId,
          inherit: true,
          rateBps: 0,
          fixedFeeMinor: 0,
          refundTreatment: "PROPORTIONAL",
          note: note.trim(),
        }),
      );
      toast.success(`${channelName} now pays the platform rate.`);
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't remove the override."));
    } finally {
      setBusy(false);
    }
  };
  return (
    <button
      type="button"
      disabled={busy}
      onClick={remove}
      className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[11.5px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
    >
      <Undo2 size={12} /> Use platform rate
    </button>
  );
}

function ChannelPicker({
  onPick,
  onClose,
}: {
  onPick: (channel: CommissionChannelOption) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<CommissionChannelOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(() => {
      PaymentAdminService.searchCommissionChannels(q.trim())
        .then((r) => !cancelled && setResults(r))
        .catch(() => !cancelled && setResults([]))
        .finally(() => !cancelled && setLoading(false));
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q]);

  return (
    <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Find a channel by name"
            className="w-full rounded-xl border border-slate-200 bg-surface py-2 pl-8 pr-3 text-sm outline-none focus:border-slate-400"
          />
        </div>
        <button type="button" onClick={onClose} className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-surface" aria-label="Close">
          <X size={15} />
        </button>
      </div>
      {loading && <Loader2 className="mx-auto mt-3 h-4 w-4 animate-spin text-slate-400" />}
      {!loading && results.length > 0 && (
        <ul className="mt-2 divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-surface">
          {results.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onPick(c)}
                className="flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                <span className="truncate font-semibold text-slate-800">{c.name}</span>
                <span className="shrink-0 text-[11px] text-slate-400">
                  {c.personal ? "Personal" : "Organization"}
                  {c.ownerName ? ` · ${c.ownerName}` : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {!loading && q.trim().length >= 2 && results.length === 0 && (
        <p className="mt-2 text-xs text-slate-400">No channel matches.</p>
      )}
    </div>
  );
}

/**
 * Sets a new rate for the platform or one channel. The example split is a preview only — the
 * backend computes and snapshots the real figure when each sale is paid.
 */
function CommissionForm({
  target,
  defaults,
  onClose,
  onSaved,
}: {
  target: Target;
  defaults: { rateBps: number; fixedFeeMinor: number; fixedFeeCurrency?: string | null; refundTreatment: CommissionRefundTreatment };
  onClose: () => void;
  onSaved: (s: CommissionSettings) => void;
}) {
  const [rateText, setRateText] = useState(String(defaults.rateBps / 100));
  const [feeText, setFeeText] = useState(defaults.fixedFeeMinor > 0 ? String(defaults.fixedFeeMinor / 100) : "");
  const [feeCurrency, setFeeCurrency] = useState(defaults.fixedFeeCurrency || "INR");
  const [treatment, setTreatment] = useState<CommissionRefundTreatment>(defaults.refundTreatment);
  const [timing, setTiming] = useState<"now" | "later">("now");
  const [startsAt, setStartsAt] = useState("");
  const [note, setNote] = useState("");
  const [sampleText, setSampleText] = useState("499");
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  // Hint only; the backend rejects a start in the past regardless of how long the form was open.
  const [openedAt] = useState(() => Date.now());

  const rate = Number(rateText);
  const rateValid = rateText.trim() !== "" && Number.isFinite(rate) && rate >= 0 && rate <= 100;
  const rateBps = rateValid ? Math.round(rate * 100) : 0;
  const fee = feeText.trim() === "" ? 0 : Number(feeText);
  const feeValid = Number.isFinite(fee) && fee >= 0;
  const feeMinor = feeValid ? toMinorUnits(fee) : 0;
  const startDate = timing === "later" && startsAt ? new Date(startsAt) : null;
  const startValid = timing === "now" || (!!startDate && startDate.getTime() > openedAt);
  const noteValid = note.trim().length >= 3;
  const valid = rateValid && feeValid && startValid && noteValid;

  const sampleMinor = toMinorUnits(Number(sampleText) || 0);
  const sampleCommission = Math.min(
    sampleMinor,
    Math.round((sampleMinor * rateBps) / 10_000) + (feeCurrency === "INR" ? feeMinor : 0),
  );

  const title = target.kind === "global" ? "Change the platform rate" : `Set a rate for ${target.channel.name}`;
  const startLabel = timing === "now" ? "immediately" : startDate ? `on ${when(startDate.toISOString())}` : "";

  const save = async () => {
    setSaving(true);
    try {
      const next = await PaymentAdminService.changeCommission({
        channelId: target.kind === "channel" ? target.channel.id : null,
        rateBps,
        fixedFeeMinor: feeMinor,
        fixedFeeCurrency: feeMinor > 0 ? feeCurrency : null,
        refundTreatment: treatment,
        effectiveFrom: startDate ? startDate.toISOString() : null,
        note: note.trim(),
      });
      toast.success(timing === "now" ? "Commission updated." : "Commission change scheduled.");
      onSaved(next);
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't save the commission."));
      setConfirming(false);
    } finally {
      setSaving(false);
    }
  };

  const input =
    "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-slate-400 disabled:bg-slate-50";

  return (
    <section className="rounded-2xl border border-slate-300 bg-surface p-5 shadow-[0_8px_30px_rgba(20,20,43,0.08)]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink">{title}</h3>
        <button type="button" onClick={onClose} className="cursor-pointer rounded-lg p-1 text-slate-400 hover:bg-slate-50" aria-label="Close">
          <X size={16} />
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-slate-600">
              Commission rate (%)
              <input
                type="number"
                min={0}
                max={100}
                step="0.01"
                value={rateText}
                disabled={confirming}
                onChange={(e) => setRateText(e.target.value)}
                className={input}
              />
              {!rateValid && <span className="mt-1 block text-[11px] text-rose-600 dark:text-rose-400">Between 0 and 100.</span>}
              {rateValid && rate > 50 && (
                <span className="mt-1 block text-[11px] text-amber-700 dark:text-amber-300">That is more than half of every sale.</span>
              )}
            </label>
            <label className="block text-xs font-semibold text-slate-600">
              Fixed fee per sale <span className="font-normal text-slate-400">(optional)</span>
              <div className="mt-1 flex gap-2">
                <select
                  value={feeCurrency}
                  disabled={confirming}
                  onChange={(e) => setFeeCurrency(e.target.value)}
                  className="rounded-xl border border-slate-200 px-2 text-sm font-semibold text-slate-700 outline-none"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  value={feeText}
                  disabled={confirming}
                  onChange={(e) => setFeeText(e.target.value)}
                  className={`${input} mt-0`}
                />
              </div>
              <span className="mt-1 block text-[11px] font-normal text-slate-400">Charged only on sales in this currency.</span>
            </label>
          </div>

          <fieldset>
            <legend className="text-xs font-semibold text-slate-600">When a sale is refunded</legend>
            <div className="mt-1 grid gap-2 sm:grid-cols-2">
              {(["PROPORTIONAL", "RETAINED"] as CommissionRefundTreatment[]).map((t) => (
                <label
                  key={t}
                  className={`cursor-pointer rounded-xl border px-3 py-2.5 ${
                    treatment === t ? "border-ink bg-slate-50" : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-800">
                    <input
                      type="radio"
                      name="refund-treatment"
                      checked={treatment === t}
                      disabled={confirming}
                      onChange={() => setTreatment(t)}
                    />
                    {REFUND_TREATMENT_LABEL[t]}
                  </span>
                  <span className="mt-1 block text-[11px] leading-snug text-slate-500">{REFUND_TREATMENT_HINT[t]}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-xs font-semibold text-slate-600">Takes effect</legend>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {(["now", "later"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  disabled={confirming}
                  onClick={() => setTiming(t)}
                  className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold ${
                    timing === t ? "bg-ink text-on-ink" : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {t === "now" ? "Immediately" : "Schedule"}
                </button>
              ))}
              {timing === "later" && (
                <input
                  type="datetime-local"
                  value={startsAt}
                  disabled={confirming}
                  onChange={(e) => setStartsAt(e.target.value)}
                  className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-slate-400"
                />
              )}
            </div>
            {timing === "later" && !startValid && (
              <span className="mt-1 block text-[11px] text-rose-600 dark:text-rose-400">Choose a time in the future.</span>
            )}
          </fieldset>

          <label className="block text-xs font-semibold text-slate-600">
            Reason <span className="font-normal text-slate-400">(kept on the record)</span>
            <textarea
              rows={2}
              value={note}
              disabled={confirming}
              onChange={(e) => setNote(e.target.value.slice(0, 500))}
              placeholder={target.kind === "global" ? "e.g. Platform fee from Q4 pricing review" : "e.g. Partner agreement signed 1 Oct"}
              className={`${input} font-medium`}
            />
          </label>
        </div>

        <aside className="space-y-3 rounded-2xl bg-slate-50 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Example</p>
          <label className="block text-xs font-semibold text-slate-600">
            A sale of (INR)
            <input type="number" min={0} value={sampleText} onChange={(e) => setSampleText(e.target.value)} className={input} />
          </label>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Arcade keeps</span>
              <span className="font-bold tabular-nums text-amber-700 dark:text-amber-300">{formatMoney(sampleCommission, "INR")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Channel is owed</span>
              <span className="font-bold tabular-nums text-ink">{formatMoney(sampleMinor - sampleCommission, "INR")}</span>
            </div>
          </div>
          <p className="text-[11px] leading-snug text-slate-400">
            {rateValid ? formatRate(rateBps) : "—"}
            {feeMinor > 0 ? ` + ${formatMoney(feeMinor, feeCurrency)}` : ""}, before gateway fees. Sales already made keep the
            rate they were charged.
          </p>
        </aside>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        {!confirming ? (
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="cursor-pointer rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button
              type="button"
              disabled={!valid}
              onClick={() => setConfirming(true)}
              className="cursor-pointer rounded-xl bg-ink px-4 py-2 text-xs font-bold text-on-ink hover:bg-ink-hover disabled:cursor-not-allowed disabled:opacity-40"
            >
              Review change
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/25 dark:bg-amber-500/10">
            <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
              {target.kind === "global" ? "Every channel without its own rate" : target.channel.name} will be charged{" "}
              <span className="font-bold">
                {describeCommission({ rateBps, fixedFeeMinor: feeMinor, fixedFeeCurrency: feeCurrency })}
              </span>{" "}
              ({REFUND_TREATMENT_LABEL[treatment].toLowerCase()}) on sales paid {startLabel}. Payables drop accordingly.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => setConfirming(false)}
                className="cursor-pointer rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-surface"
              >
                Back
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={save}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-ink px-4 py-1.5 text-xs font-bold text-on-ink hover:bg-ink-hover disabled:opacity-50"
              >
                {saving && <Loader2 size={12} className="animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
