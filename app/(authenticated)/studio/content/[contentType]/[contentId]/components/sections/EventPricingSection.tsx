"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Tag,
  Edit2,
  X,
  Save,
  AlertTriangle,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
} from "lucide-react";
import { api } from "@/infrastructure/http/api";
import type { FetchResult } from "../../lib/fetchOverviewData";
import type {
  EventPricing,
  SaveEventPricingRequest,
} from "@/app/(authenticated)/studio/events/types";
import {
  PricingModel,
  RegistrationType,
  SeatType,
  RefundPolicy,
} from "@/app/(authenticated)/studio/events/types";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PricingStatusBadge({ model }: { model: PricingModel }) {
  const isF = model === PricingModel.FREE;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
        isF ? "bg-emerald-50 text-emerald-700" : "bg-indigo-50 text-indigo-700"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isF ? "bg-emerald-500" : "bg-indigo-500"}`} />
      {isF ? "Free Event" : "Paid Event"}
    </span>
  );
}

function StatBox({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: typeof Tag;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-slate-200/60 bg-white/80 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
        <Icon size={11} />
        {label}
      </div>
      <p className="text-[22px] font-bold text-[#14142b] leading-none">{value}</p>
      {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
    </div>
  );
}

// ── Edit Form ─────────────────────────────────────────────────────────────────

function EditPricingForm({
  eventId,
  initial,
  onSaved,
  onCancel,
}: {
  eventId: string;
  initial: EventPricing;
  onSaved: (updated: EventPricing) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<SaveEventPricingRequest>({
    pricingModel: initial.pricingModel,
    price: initial.price,
    currency: initial.currency,
    registrationType: initial.registrationType,
    seatType: initial.seatType,
    seatLimit: initial.seatLimit,
    waitlistEnabled: initial.waitlistEnabled,
    registrationStart: initial.registrationStart,
    registrationEnd: initial.registrationEnd,
    earlyBirdEnabled: initial.earlyBirdEnabled,
    earlyBirdPrice: initial.earlyBirdPrice,
    earlyBirdEndDate: initial.earlyBirdEndDate,
    couponEnabled: initial.couponEnabled,
    refundPolicy: initial.refundPolicy,
    allowCancellation: initial.allowCancellation,
  });
  const [saving, setSaving] = useState(false);

  const isFree = form.pricingModel === PricingModel.FREE;
  const isLimited = form.seatType === SeatType.LIMITED;

  function update<K extends keyof SaveEventPricingRequest>(key: K, val: SaveEventPricingRequest[K]) {
    setForm((p) => ({ ...p, [key]: val }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await api.put<EventPricing>(`/api/v1/events/${eventId}/pricing`, form);
      toast.success("Pricing saved");
      onSaved(updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save pricing");
    } finally {
      setSaving(false);
    }
  }

  const labelCls = "mb-1.5 block text-[12px] font-semibold text-[#14142b]";
  const inputCls =
    "w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm outline-none focus:border-[#14142b]/30 focus:bg-white focus:ring-2 focus:ring-slate-200/60";

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Pricing model */}
      <div>
        <p className={labelCls}>Pricing model</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {(
            [
              { v: PricingModel.FREE, label: "Free" },
              { v: PricingModel.PAID, label: "Paid" },
              { v: PricingModel.MEMBERSHIP, label: "Membership" },
              { v: PricingModel.INVITE_ONLY, label: "Invite only" },
              { v: PricingModel.COMING_SOON, label: "Coming soon" },
            ] as const
          ).map(({ v, label }) => (
            <button
              key={v}
              type="button"
              onClick={() => update("pricingModel", v)}
              className={`rounded-lg border px-3 py-2.5 text-left text-xs font-semibold transition-all cursor-pointer ${
                form.pricingModel === v
                  ? "border-[#14142b] bg-[#14142b] text-white"
                  : "border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100/60"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Price & Currency (only for paid) */}
      {!isFree && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Price</label>
            <input
              type="number"
              min={0}
              value={form.price ?? ""}
              onChange={(e) => update("price", Number(e.target.value))}
              className={inputCls}
              placeholder="0"
            />
          </div>
          <div>
            <label className={labelCls}>Currency</label>
            <select
              value={form.currency}
              onChange={(e) => update("currency", e.target.value)}
              className={inputCls}
            >
              {["INR", "USD", "EUR", "GBP", "AUD", "SGD"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Registration type */}
      <div>
        <label className={labelCls}>Registration type</label>
        <select
          value={form.registrationType}
          onChange={(e) => update("registrationType", e.target.value as RegistrationType)}
          className={inputCls}
        >
          <option value={RegistrationType.OPEN}>Open</option>
          <option value={RegistrationType.APPROVAL_REQUIRED}>Approval required</option>
          <option value={RegistrationType.INVITE_ONLY}>Invite only</option>
          <option value={RegistrationType.PRIVATE}>Private</option>
        </select>
      </div>

      {/* Seat type */}
      <div>
        <p className={labelCls}>Seat capacity</p>
        <div className="flex gap-3">
          {[
            { v: SeatType.UNLIMITED, label: "Unlimited" },
            { v: SeatType.LIMITED, label: "Limited" },
          ].map(({ v, label }) => (
            <button
              key={v}
              type="button"
              onClick={() => update("seatType", v)}
              className={`flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition-all cursor-pointer ${
                form.seatType === v
                  ? "border-[#14142b] bg-[#14142b] text-white"
                  : "border-slate-200 bg-slate-50/60 text-slate-600 hover:bg-slate-100/60"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {isLimited && (
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Maximum seats</label>
              <input
                type="number"
                min={1}
                value={form.seatLimit ?? ""}
                onChange={(e) => update("seatLimit", Number(e.target.value))}
                className={inputCls}
                placeholder="e.g. 100"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.waitlistEnabled}
                  onChange={(e) => update("waitlistEnabled", e.target.checked)}
                  className="rounded border-slate-300"
                />
                <span className="text-xs font-semibold text-slate-600">Enable waitlist</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Registration window */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Registration opens</label>
          <input
            type="datetime-local"
            value={form.registrationStart ? form.registrationStart.slice(0, 16) : ""}
            onChange={(e) =>
              update("registrationStart", e.target.value ? new Date(e.target.value).toISOString() : undefined)
            }
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Registration closes</label>
          <input
            type="datetime-local"
            value={form.registrationEnd ? form.registrationEnd.slice(0, 16) : ""}
            onChange={(e) =>
              update("registrationEnd", e.target.value ? new Date(e.target.value).toISOString() : undefined)
            }
            className={inputCls}
          />
        </div>
      </div>

      {/* Early-bird */}
      {!isFree && (
        <div className="rounded-xl border border-slate-200/60 bg-slate-50/40 p-4">
          <label className="flex items-center gap-2 cursor-pointer select-none mb-4">
            <input
              type="checkbox"
              checked={form.earlyBirdEnabled}
              onChange={(e) => update("earlyBirdEnabled", e.target.checked)}
              className="rounded border-slate-300"
            />
            <span className="text-xs font-semibold text-[#14142b]">Enable early-bird pricing</span>
          </label>
          {form.earlyBirdEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Early-bird price</label>
                <input
                  type="number"
                  min={0}
                  value={form.earlyBirdPrice ?? ""}
                  onChange={(e) => update("earlyBirdPrice", Number(e.target.value))}
                  className={inputCls}
                  placeholder="0"
                />
              </div>
              <div>
                <label className={labelCls}>Early-bird ends</label>
                <input
                  type="date"
                  value={form.earlyBirdEndDate ?? ""}
                  onChange={(e) => update("earlyBirdEndDate", e.target.value || undefined)}
                  className={inputCls}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Refund policy */}
      {!isFree && (
        <div>
          <label className={labelCls}>Refund policy</label>
          <select
            value={form.refundPolicy ?? ""}
            onChange={(e) => update("refundPolicy", (e.target.value as RefundPolicy) || undefined)}
            className={inputCls}
          >
            <option value="">No policy set</option>
            <option value={RefundPolicy.NO_REFUND}>No refund</option>
            <option value={RefundPolicy.FULL_REFUND}>Full refund</option>
            <option value={RefundPolicy.PARTIAL_REFUND}>Partial refund</option>
            <option value={RefundPolicy.CUSTOM}>Custom</option>
          </select>
        </div>
      )}

      {/* Cancellation */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={form.allowCancellation}
          onChange={(e) => update("allowCancellation", e.target.checked)}
          className="rounded border-slate-300"
        />
        <span className="text-xs font-semibold text-slate-600">Allow registration cancellation</span>
      </label>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#14142b] px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#232735] disabled:opacity-60 cursor-pointer"
        >
          <Save size={13} />
          {saving ? "Saving…" : "Save pricing"}
        </button>
      </div>
    </form>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function EventPricingSection({
  eventId,
  pricingResult,
  participantCount,
  onChanged,
}: {
  eventId: string;
  pricingResult?: FetchResult<EventPricing>;
  participantCount: number;
  onChanged: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [localPricing, setLocalPricing] = useState<EventPricing | null>(
    pricingResult?.status === "ok" ? pricingResult.data : null
  );

  const pricing = localPricing;

  if (pricingResult?.status === "error") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
        <AlertTriangle size={14} />
        Pricing information is temporarily unavailable — try again shortly.
      </div>
    );
  }

  const isFree = !pricing || pricing.pricingModel === PricingModel.FREE;
  const revenue = pricing && !isFree ? pricing.price * participantCount : 0;

  const defaultPricing: EventPricing = {
    id: "",
    eventId,
    pricingModel: PricingModel.FREE,
    price: 0,
    currency: "INR",
    registrationType: RegistrationType.OPEN,
    seatType: SeatType.UNLIMITED,
    waitlistEnabled: false,
    earlyBirdEnabled: false,
    couponEnabled: false,
    allowCancellation: true,
    createdAt: "",
    updatedAt: "",
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#14142b]">Pricing</h2>
          <p className="mt-0.5 text-xs text-slate-500">Configure registration pricing and seat management</p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-[#14142b] transition-colors hover:bg-slate-50 cursor-pointer"
          >
            <Edit2 size={13} />
            Edit pricing
          </button>
        )}
        {editing && (
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Overview card */}
      {!editing && (
        <div className="rounded-2xl border border-white/40 bg-white/60 p-6 shadow-lg backdrop-blur-xl">
          {!pricing || pricingResult?.status === "empty" ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Tag size={22} />
              </div>
              <p className="text-sm font-semibold text-[#14142b]">No pricing configured</p>
              <p className="max-w-xs text-xs text-slate-500">
                Set up pricing to control registration fees, seat limits, and early-bird offers.
              </p>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-[#14142b] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#232735] cursor-pointer"
              >
                <Edit2 size={12} />
                Configure pricing
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <PricingStatusBadge model={pricing.pricingModel} />

              {!isFree && (
                <div>
                  <p className="text-[32px] font-bold tracking-tight text-[#14142b]">
                    {formatCurrency(pricing.price, pricing.currency)}
                  </p>
                  <p className="text-xs text-slate-500">per participant</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <StatBox icon={Users} label="Registrations" value={String(participantCount)} />
                {!isFree && (
                  <StatBox
                    icon={TrendingUp}
                    label="Total revenue"
                    value={formatCurrency(revenue, pricing.currency)}
                  />
                )}
                {pricing.seatLimit != null && (
                  <StatBox
                    icon={CheckCircle}
                    label="Seat limit"
                    value={String(pricing.seatLimit)}
                    sub={pricing.waitlistEnabled ? "Waitlist enabled" : undefined}
                  />
                )}
                {pricing.registrationEnd && (
                  <StatBox icon={Clock} label="Closes" value={formatDate(pricing.registrationEnd)} />
                )}
              </div>

              {!isFree && pricing.earlyBirdEnabled && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3">
                  <p className="text-xs font-semibold text-amber-700">
                    🐦 Early-bird:{" "}
                    {formatCurrency(pricing.earlyBirdPrice ?? 0, pricing.currency)}
                    {pricing.earlyBirdEndDate && ` · ends ${formatDate(pricing.earlyBirdEndDate)}`}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4 text-[11px] text-slate-500">
                <span>
                  Registration:{" "}
                  <strong className="text-slate-700">{pricing.registrationType?.replace("_", " ")}</strong>
                </span>
                {pricing.refundPolicy && (
                  <span>
                    Refund:{" "}
                    <strong className="text-slate-700">{pricing.refundPolicy.replace("_", " ")}</strong>
                  </span>
                )}
                <span>
                  Cancellation:{" "}
                  <strong className="text-slate-700">
                    {pricing.allowCancellation ? "Allowed" : "Not allowed"}
                  </strong>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit form */}
      {editing && (
        <div className="rounded-2xl border border-white/40 bg-white/60 p-6 shadow-lg backdrop-blur-xl">
          <EditPricingForm
            eventId={eventId}
            initial={pricing ?? defaultPricing}
            onSaved={(updated) => {
              setLocalPricing(updated);
              setEditing(false);
              onChanged();
            }}
            onCancel={() => setEditing(false)}
          />
        </div>
      )}
    </div>
  );
}
