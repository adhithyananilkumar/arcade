"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { api } from "@/infrastructure/http/api";
import type { FetchResult } from "../../lib/fetchOverviewData";
import { RefundPolicy } from "@/app/(authenticated)/studio/events/types";
import type { Event as EventDto } from "@/domains/events";
import {
  WorkspaceChoice,
  WorkspaceHeading,
  WorkspaceLabel,
  WorkspaceMessage,
  WorkspaceRow,
  WorkspaceRows,
  WorkspaceSaveBar,
  WorkspaceStat,
} from "@/apps/creator/studio/core/StudioWorkspaceKit";
function humanizeKey(key: string): string {
  const spaced = key.replace(/([a-z])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

// Helper for currency formatting
function formatCurrencyExact(amount: number, currency = "INR"): string {
  const symbolMap: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    AUD: "A$",
    SGD: "S$",
  };
  const sym = symbolMap[currency] || `${currency} `;
  return `${sym}${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount)}`;
}

const MONEY_KEYS = new Set([
  "totalRevenue",
  "pendingRevenue",
  "refundedRevenue",
  "netRevenue",
  "platformCommission",
  "organizerEarnings",
]);

export interface Metric {
  label: string;
  sublabel?: string;
  value: string | number;
}

export function analyticsToMetrics(analytics?: Record<string, unknown>): Metric[] {
  if (!analytics) return [];
  const currency = (analytics.currency as string) || "INR";
  return Object.entries(analytics)
    .filter(([, value]) => typeof value === "number" || typeof value === "string")
    .map(([key, value]) => ({
      label: humanizeKey(key),
      value:
        MONEY_KEYS.has(key) && typeof value === "number"
          ? new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(value / 100)
          : (value as string | number),
    }));
}

function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

const REFUND_OPTIONS = [
  {
    value: RefundPolicy.NO_REFUND,
    label: "No refunds",
    hint: "Ticket sales are final; no cancellations or refunds permitted.",
  },
  {
    value: RefundPolicy.FULL_REFUND,
    label: "100% full refund",
    hint: "Attendees can request a full refund anytime before the event starts.",
  },
  {
    value: RefundPolicy.PARTIAL_REFUND,
    label: "Partial refund",
    hint: "Refund ticket price minus standard payment gateway processing fees.",
  },
  {
    value: RefundPolicy.CUSTOM,
    label: "Custom organizer policy",
    hint: "Your team evaluates and processes cancellation requests manually.",
  },
];

interface PricingForm {
  paid: boolean;
  price: number;
  currency: string;
  limited: boolean;
  seatLimit?: number;
  refundPolicy?: RefundPolicy;
}

function formOf(event?: EventDto | null): PricingForm {
  const minor = event?.priceAmount || 0;
  return {
    paid: minor > 0,
    price: minor / 100,
    currency: event?.currency || "INR",
    limited: !!event?.capacity,
    seatLimit: event?.capacity ?? undefined,
    refundPolicy: (event?.refundPolicy as RefundPolicy | null | undefined) ?? RefundPolicy.FULL_REFUND,
  };
}

export function EventPricingSection({
  eventId,
  eventDetails,
  eventAnalytics,
  participantCount,
  onChanged,
}: {
  eventId: string;
  eventDetails?: FetchResult<EventDto>;
  eventAnalytics?: FetchResult<Record<string, unknown>>;
  participantCount: number;
  onChanged: () => void;
}) {
  const [saved, setSaved] = useState<PricingForm>(() =>
    formOf(eventDetails?.status === "ok" ? eventDetails.data : null)
  );
  const [form, setForm] = useState<PricingForm>(saved);
  const [saving, setSaving] = useState(false);

  if (eventDetails?.status === "error") {
    return (
      <WorkspaceMessage title="Pricing is temporarily unavailable" tone="warning">
        We could not load pricing information right now. Please refresh the page to retry.
      </WorkspaceMessage>
    );
  }

  const update = <K extends keyof PricingForm>(key: K, val: PricingForm[K]) =>
    setForm((p) => ({ ...p, [key]: val }));

  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const priceInvalid = form.paid && !(form.price > 0);
  const seatsInvalid = form.limited && !((form.seatLimit ?? 0) >= 1);
  const metrics = eventAnalytics?.status === "ok" ? analyticsToMetrics(eventAnalytics.data) : [];

  const totalCurrentSales = form.paid ? form.price * participantCount : 0;
  const projectedAtCapacity = useMemo(() => {
    if (!form.paid || form.price <= 0) return 0;
    const targetSeats = form.limited && form.seatLimit ? form.seatLimit : Math.max(participantCount, 30);
    return targetSeats * form.price;
  }, [form.paid, form.price, form.limited, form.seatLimit, participantCount]);

  const save = async () => {
    if (priceInvalid || seatsInvalid) {
      toast.error(
        priceInvalid
          ? "Please enter a valid ticket price greater than 0"
          : "Please enter a seat capacity limit of at least 1"
      );
      return;
    }
    setSaving(true);
    try {
      const updated = await api.patch<EventDto>(`/api/v1/events/${eventId}`, {
        priceAmount: form.paid ? Math.round(form.price * 100) : 0,
        currency: form.currency || "INR",
        capacity: form.limited ? form.seatLimit : 0,
        refundPolicy: form.refundPolicy ?? null,
      });
      const next = formOf(updated);
      setSaved(next);
      setForm(next);
      toast.success("Pricing updated successfully!", {
        description: form.paid
          ? `Event ticket price set to ${formatCurrency(form.price, form.currency)}.`
          : "Event set to Free Admission.",
      });
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update pricing");
    } finally {
      setSaving(false);
    }
  };

  const scrollToSettlement = () => {
    const el = document.getElementById("revenue-settlement-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Dynamic analytics breakdown calculations matching image schema
  const rawAnalytics = eventAnalytics?.status === "ok" ? eventAnalytics.data : {};
  const curr = (rawAnalytics?.currency as string) || form.currency || "INR";
  const totalGross =
    typeof rawAnalytics?.totalRevenue === "number"
      ? rawAnalytics.totalRevenue / 100
      : form.paid
      ? form.price * participantCount
      : 0;
  const organizerEarnings =
    typeof rawAnalytics?.organizerEarnings === "number"
      ? rawAnalytics.organizerEarnings / 100
      : totalGross;
  const netRevenue =
    typeof rawAnalytics?.netRevenue === "number"
      ? rawAnalytics.netRevenue / 100
      : totalGross;
  const pendingRevenue =
    typeof rawAnalytics?.pendingRevenue === "number"
      ? rawAnalytics.pendingRevenue / 100
      : totalGross;
  const refundedRevenue =
    typeof rawAnalytics?.refundedRevenue === "number"
      ? rawAnalytics.refundedRevenue / 100
      : 0;
  const platformCommission =
    typeof rawAnalytics?.platformCommission === "number"
      ? rawAnalytics.platformCommission / 100
      : 0;
  const paidRegistrations = form.paid
    ? participantCount
    : typeof rawAnalytics?.paidRegistrations === "number"
    ? rawAnalytics.paidRegistrations
    : 0;
  const freeRegistrations = !form.paid
    ? participantCount
    : typeof rawAnalytics?.freeRegistrations === "number"
    ? rawAnalytics.freeRegistrations
    : 0;
  const withdrawnCount =
    typeof rawAnalytics?.withdrawnCount === "number" ? rawAnalytics.withdrawnCount : 0;

  // Export CSV Report
  const exportReport = () => {
    try {
      const csvRows = [
        ["Report", "Event Settlement Ledger & Accounting"],
        ["Generated At", new Date().toISOString()],
        ["Event ID", eventId],
        ["Currency", curr],
        ["Admission Type", form.paid ? "Paid" : "Free"],
        ["Ticket Price", form.paid ? form.price : 0],
        ["Total Registrations", participantCount],
        ["Paid Registrations", paidRegistrations],
        ["Free Registrations", freeRegistrations],
        ["Withdrawn Registrations", withdrawnCount],
        ["Gross Revenue", totalGross],
        ["Organizer Earnings", organizerEarnings],
        ["Net Revenue", netRevenue],
        ["Pending Revenue", pendingRevenue],
        ["Refunded Revenue", refundedRevenue],
        ["Platform Commission", platformCommission],
      ];
      const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.map((cell) => `"${cell}"`).join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `settlement_report_${eventId}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Settlement ledger report exported successfully!");
    } catch {
      toast.error("Failed to export report.");
    }
  };

  return (
    <div className="flex flex-col gap-10">
      {/* 1. Stats strip (4 open statistics with quick scroll to settlement) */}
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 items-start">
        <WorkspaceStat label="Registered" value={participantCount} hint="Confirmed attendees" />
        <WorkspaceStat
          label="Admission"
          value={saved.paid ? formatCurrency(saved.price, saved.currency) : "Free"}
          hint={saved.paid ? "Per attendee" : "No charge"}
        />
        <div className="flex flex-col">
          <WorkspaceStat
            label="Total revenue"
            value={saved.paid ? formatCurrency(saved.price * participantCount, saved.currency) : "—"}
            hint={saved.paid ? "Gross sales" : "Free event"}
          />
          <button
            type="button"
            onClick={scrollToSettlement}
            className="mt-1.5 inline-flex items-center gap-1 text-left text-[11px] font-bold text-[#205ca8] hover:text-blue-700 hover:underline cursor-pointer dark:text-blue-400"
          >
            Scroll to settlement ↓
          </button>
        </div>
        <WorkspaceStat
          label="Capacity"
          value={saved.limited && saved.seatLimit != null ? String(saved.seatLimit) : "Unlimited"}
          hint={saved.limited ? "Seats capped" : "Open registration"}
        />
      </div>

      {/* 2. Numbered rows (Pricing & Capacity Configuration) */}
      <WorkspaceRows>
        {/* Step 1: Admission & pricing */}
        <WorkspaceRow
          step="01"
          title="Admission & ticket price"
          description="Choose whether attendees join for free or purchase a ticket."
        >
          <div className="flex flex-col gap-4">
            <WorkspaceChoice
              value={form.paid ? "PAID" : "FREE"}
              onChange={(v) => update("paid", v === "PAID")}
              options={[
                { value: "FREE", label: "Free event", hint: "One-click registration with no payment required." },
                { value: "PAID", label: "Paid tickets", hint: "Attendees pay before gaining access." },
              ]}
            />

            {form.paid && (
              <div className="flex flex-col gap-2 pt-2">
                <WorkspaceLabel>Ticket price per attendee</WorkspaceLabel>
                <div className="flex flex-wrap items-center gap-2.5">
                  <select
                    aria-label="Currency"
                    value={form.currency}
                    onChange={(e) => update("currency", e.target.value)}
                    className="h-10 w-24 rounded-xl border border-slate-200/90 bg-surface px-3 text-xs font-bold text-slate-800 shadow-2xs outline-none focus:border-[#205ca8] focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700"
                  >
                    {["INR", "USD", "EUR", "GBP", "AUD", "SGD"].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    step="1"
                    aria-label="Ticket price"
                    value={form.price || ""}
                    onChange={(e) => update("price", Number(e.target.value))}
                    className="h-10 w-44 rounded-xl border border-slate-200/90 bg-surface px-3 text-xs font-bold text-slate-900 shadow-2xs outline-none focus:border-[#205ca8] focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700"
                    placeholder="e.g. 499"
                  />
                </div>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  At target capacity ({form.limited && form.seatLimit ? `${form.seatLimit} seats` : "30 attendees"}), estimated gross is{" "}
                  <strong className="font-bold text-slate-900">{formatCurrency(projectedAtCapacity, form.currency)}</strong>.
                </p>
              </div>
            )}
          </div>
        </WorkspaceRow>

        {/* Step 2: Seat limit */}
        <WorkspaceRow step="02" title="Seat capacity" description="Cap the maximum number of registrations allowed.">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <WorkspaceChoice
                value={form.limited ? "LIMITED" : "UNLIMITED"}
                onChange={(v) => {
                  const isLimited = v === "LIMITED";
                  update("limited", isLimited);
                  if (isLimited && !form.seatLimit) update("seatLimit", 50);
                }}
                options={[
                  { value: "UNLIMITED", label: "Unlimited" },
                  { value: "LIMITED", label: "Limited" },
                ]}
              />
              {form.limited && (
                <input
                  type="number"
                  min={1}
                  aria-label="Maximum seat limit"
                  value={form.seatLimit ?? ""}
                  onChange={(e) => update("seatLimit", e.target.value ? Number(e.target.value) : undefined)}
                  className="h-9 w-28 rounded-full border border-slate-200/90 bg-surface px-3.5 text-center text-xs font-bold text-slate-900 shadow-2xs outline-none focus:border-[#205ca8] focus:ring-2 focus:ring-blue-500/10 dark:border-slate-700"
                  placeholder="e.g. 50"
                />
              )}
            </div>
            <p className="text-xs font-medium text-slate-500">
              {form.limited
                ? `Registration automatically closes once ${form.seatLimit || 0} tickets are booked.`
                : "Open registration with no attendance ceiling."}
            </p>
          </div>
        </WorkspaceRow>

        {/* Step 3: Cancellation policy (when paid) */}
        {form.paid && (
          <WorkspaceRow
            step="03"
            title="Cancellation & refund policy"
            description="Clear terms displayed to attendees during checkout."
          >
            <WorkspaceChoice
              value={form.refundPolicy ?? RefundPolicy.FULL_REFUND}
              onChange={(v) => update("refundPolicy", v)}
              options={REFUND_OPTIONS}
            />
          </WorkspaceRow>
        )}
      </WorkspaceRows>

      {/* 3. Save bar placed ABOVE Revenue & Settlement Summary */}
      <WorkspaceSaveBar onSave={save} saving={saving} dirty={dirty} label="Save pricing changes" />

      {/* 4. SETTLEMENT LEDGER & ACCOUNTING (Matching Reference UI, zero icons) */}
      <div id="revenue-settlement-section" className="scroll-mt-8 pt-4 flex flex-col gap-6">
        {/* Section Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-white">
              Settlement Ledger & Accounting
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Export CSV Report Button */}
            <button
              type="button"
              onClick={exportReport}
              className="inline-flex items-center justify-center rounded-full bg-ink hover:bg-[#205ca8] text-on-ink px-5 py-2 text-xs font-bold shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              Export Report
            </button>
          </div>
        </div>

        {/* 2-Column Open Grid — Completely borderless and seamless */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 pt-2">
          {/* Left Panel: Registration & Attendance */}
          <div className="flex flex-col gap-5">
            {/* Panel Header */}
            <div className="pb-1">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Registration & Attendance</h4>
            </div>

            {/* 2x2 Sub-Boxes */}
            <div className="grid grid-cols-2 gap-3">
              {/* Total Registrations */}
              <div className="rounded-xl bg-slate-50/80 p-3.5 dark:bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Total Registrations</span>
                </div>
                <p className="text-2xl font-black text-slate-900 mt-1 dark:text-white">{participantCount}</p>
              </div>

              {/* Paid Registrations */}
              <div className="rounded-xl bg-slate-50/80 p-3.5 dark:bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Paid Registrations</span>
                </div>
                <p className="text-2xl font-black text-slate-900 mt-1 dark:text-white">{paidRegistrations}</p>
              </div>

              {/* Free Registrations */}
              <div className="rounded-xl bg-slate-50/80 p-3.5 dark:bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Free Registrations</span>
                </div>
                <p className="text-2xl font-black text-slate-900 mt-1 dark:text-white">{freeRegistrations}</p>
              </div>

              {/* Withdrawn */}
              <div className="rounded-xl bg-slate-50/80 p-3.5 dark:bg-slate-900/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">Withdrawn</span>
                </div>
                <p className="text-2xl font-black text-slate-900 mt-1 dark:text-white">{withdrawnCount}</p>
              </div>
            </div>

            {/* Rates rows */}
            <div className="space-y-1">
              <div className="flex items-center justify-between py-2 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Attendance Rate</span>
                <span className="font-black tabular-nums text-slate-900 dark:text-white">0%</span>
              </div>
              <div className="flex items-center justify-between py-2 text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400">Completion Rate</span>
                <span className="font-black tabular-nums text-slate-900 dark:text-white">0%</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Financial Ledger & Payouts */}
          <div className="flex flex-col gap-5">
            {/* Panel Header */}
            <div className="flex items-start justify-between pb-1">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Financial Ledger & Payouts</h4>
              </div>
            </div>

            {/* Big Gross Box */}
            <div className="rounded-xl bg-slate-50/80 p-4 flex items-center justify-between dark:bg-slate-900/40">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  Total Revenue (Gross)
                </span>
                <p className="text-3xl font-black tracking-tight text-slate-900 mt-0.5 dark:text-white">
                  {formatCurrencyExact(totalGross, curr)}
                </p>
              </div>
              <div className="text-right">
                <span className="rounded-full bg-slate-200/70 px-2.5 py-0.5 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Gross Settled
                </span>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-1">
              {/* Organizer Earnings */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Organizer Earnings</span>
                </div>
                <span className="font-bold tabular-nums text-slate-900 text-sm dark:text-white">
                  {formatCurrencyExact(organizerEarnings, curr)}
                </span>
              </div>

              {/* Net Revenue */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Net Revenue</span>
                </div>
                <span className="font-bold tabular-nums text-slate-900 text-sm dark:text-white">
                  {formatCurrencyExact(netRevenue, curr)}
                </span>
              </div>

              {/* Pending Revenue */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Pending Revenue</span>
                </div>
                <span className="font-bold tabular-nums text-slate-900 text-sm dark:text-white">
                  {formatCurrencyExact(pendingRevenue, curr)}
                </span>
              </div>
            </div>

            {/* 2 Bottom Sub-Boxes */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50/80 p-3 dark:bg-slate-900/40 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">Refunded Revenue</span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {formatCurrencyExact(refundedRevenue, curr)}
                </span>
              </div>

              <div className="rounded-xl bg-slate-50/80 p-3 dark:bg-slate-900/40 flex items-center justify-between">
                <div>
                  <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">Platform Commission</span>
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {formatCurrencyExact(platformCommission, curr)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
