"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { api } from "@/infrastructure/http/api";
import type { FetchResult } from "../../lib/fetchOverviewData";
import { RefundPolicy } from "@/app/(authenticated)/studio/events/types";
import type { Event as EventDto } from "@/domains/events";

const SURFACE_CARD = "rounded-2xl border border-slate-200/80 bg-surface p-6 sm:p-8 shadow-xs";

function humanizeKey(key: string): string {
  const spaced = key.replace(/([a-z])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
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
    id: RefundPolicy.NO_REFUND,
    title: "No Refunds",
    desc: "Ticket sales are final. No refunds are permitted after purchase.",
    badge: "Strict",
  },
  {
    id: RefundPolicy.FULL_REFUND,
    title: "100% Full Refund",
    desc: "Attendees can request a full refund anytime before the event starts.",
    badge: "Recommended",
  },
  {
    id: RefundPolicy.PARTIAL_REFUND,
    title: "Partial Refund",
    desc: "Refund ticket fee minus standard payment gateway charges.",
    badge: "Flexible",
  },
  {
    id: RefundPolicy.CUSTOM,
    title: "Custom Organizer Policy",
    desc: "Your team evaluates and processes cancellation requests manually.",
    badge: "Manual",
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
      <div className={`${SURFACE_CARD} flex flex-col items-center justify-center gap-3 p-14 text-center max-w-2xl mx-auto`}>
        <h3 className="text-base font-bold text-slate-900">Pricing is temporarily unavailable</h3>
        <p className="text-sm text-slate-500">We could not load pricing information right now. Please refresh the page to retry.</p>
      </div>
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

  const scrollToRevenue = () => {
    const el = document.getElementById("revenue-settlement-summary");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

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
        description: form.paid ? `Event ticket price set to ${formatCurrency(form.price, form.currency)}.` : "Event set to Free Admission.",
      });
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update pricing");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      {/* 1. TOP OVERVIEW METRIC STRIP (WITH CLICKABLE REVENUE SCROLL) */}
      <div className={`${SURFACE_CARD} grid grid-cols-2 gap-6 sm:grid-cols-4`}>
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Registered</span>
          <p className="mt-2 text-3xl sm:text-4xl font-black text-slate-900">{participantCount}</p>
          <p className="text-sm text-slate-500 mt-1">Confirmed attendees</p>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Admission</span>
          <p className="mt-2 text-3xl sm:text-4xl font-black text-slate-900">
            {saved.paid ? formatCurrency(saved.price, saved.currency) : "Free"}
          </p>
          <p className="text-sm text-slate-500 mt-1">{saved.paid ? "Per attendee" : "No charge"}</p>
        </div>

        {/* Clickable Revenue Tile that scrolls down to Settlement Summary */}
        <button
          type="button"
          onClick={scrollToRevenue}
          title="Click to jump to Revenue & Settlement Summary"
          className="text-left cursor-pointer rounded-2xl transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50 p-2 -m-2 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
              Total Revenue
            </span>
            <span className="text-[11px] font-bold text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors">
              View ↓
            </span>
          </div>
          <p className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {saved.paid ? formatCurrency(saved.price * participantCount, saved.currency) : "—"}
          </p>
          <p className="text-sm text-slate-500 mt-1 group-hover:underline">
            {saved.paid ? "Gross sales (Jump to ledger)" : "Free event"}
          </p>
        </button>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Capacity</span>
          <p className="mt-2 text-3xl sm:text-4xl font-black text-slate-900">
            {saved.limited && saved.seatLimit != null ? `${saved.seatLimit}` : "Unlimited"}
          </p>
          <p className="text-sm text-slate-500 mt-1 truncate">
            {saved.limited ? "Seats capped" : "Open registration"}
          </p>
        </div>
      </div>

      {/* 2. ADMISSION MODEL & TICKET PRICE CARD */}
      <section className={`${SURFACE_CARD} space-y-7`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Admission & Ticket Price</h2>
            <p className="text-sm text-slate-500 mt-1">
              Select how attendees register and set your ticket price.
            </p>
          </div>

          <div className="inline-flex rounded-full bg-slate-100/90 p-1.5 dark:bg-slate-800/90 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => update("paid", false)}
              className={`rounded-full px-6 py-2.5 text-sm font-bold transition-all cursor-pointer ${
                !form.paid
                  ? "bg-surface text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Free Event
            </button>
            <button
              type="button"
              onClick={() => update("paid", true)}
              className={`rounded-full px-6 py-2.5 text-sm font-bold transition-all cursor-pointer ${
                form.paid
                  ? "bg-surface text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Paid Tickets
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {form.paid ? (
            <motion.div
              key="paid-inputs"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-6 pt-1"
            >
              <div className="space-y-3">
                <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                  Ticket Price per Attendee
                </label>
                <div className="flex flex-wrap items-center gap-3.5">
                  <select
                    aria-label="Currency"
                    value={form.currency}
                    onChange={(e) => update("currency", e.target.value)}
                    className="rounded-2xl border border-slate-200 bg-surface px-4 py-3.5 text-sm font-bold text-slate-800 shadow-2xs focus:border-slate-400 focus:outline-none dark:border-slate-700"
                  >
                    {["INR", "USD", "EUR", "GBP", "AUD", "SGD"].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>

                  <div className="relative flex-1 max-w-sm">
                    <input
                      type="number"
                      min={1}
                      step="1"
                      aria-label="Ticket price"
                      value={form.price || ""}
                      onChange={(e) => update("price", Number(e.target.value))}
                      className="w-full rounded-2xl border border-slate-200 bg-surface px-5 py-3.5 text-lg font-black text-slate-900 shadow-2xs focus:border-slate-400 focus:outline-none dark:border-slate-700"
                      placeholder="e.g. 499"
                    />
                  </div>
                </div>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Attendees will pay this price at checkout. At current capacity ({form.limited && form.seatLimit ? `${form.seatLimit} seats` : "30 attendees"}), estimated gross is <strong className="text-slate-900 font-bold">{formatCurrency(projectedAtCapacity, form.currency)}</strong>.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="free-note"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="rounded-2xl bg-slate-50/80 p-6 space-y-2 dark:bg-slate-900/40"
            >
              <h3 className="text-base font-bold text-slate-900">Free Community Event</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Participants can enroll with one click without entering payment details. Perfect for open community webinars, tutorials, and onboarding sessions.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 3. SEAT CAPACITY CARD */}
      <section className={`${SURFACE_CARD} space-y-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Seat Capacity & Limits</h2>
            <p className="text-sm text-slate-500 mt-1">
              Control the maximum number of attendees who can register.
            </p>
          </div>

          <div className="inline-flex rounded-full bg-slate-100/90 p-1.5 dark:bg-slate-800/90 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => update("limited", false)}
              className={`rounded-full px-5 py-2 text-sm font-bold transition-all cursor-pointer ${
                !form.limited
                  ? "bg-surface text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Unlimited
            </button>
            <button
              type="button"
              onClick={() => {
                update("limited", true);
                if (!form.seatLimit) update("seatLimit", 50);
              }}
              className={`rounded-full px-5 py-2 text-sm font-bold transition-all cursor-pointer ${
                form.limited
                  ? "bg-surface text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Capped Seats
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {form.limited ? (
            <motion.div
              key="capped-capacity"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-3 pt-1"
            >
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                Maximum Attendee Seat Limit
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="number"
                  min={1}
                  aria-label="Maximum seat limit"
                  value={form.seatLimit ?? ""}
                  onChange={(e) => update("seatLimit", e.target.value ? Number(e.target.value) : undefined)}
                  className="w-36 rounded-2xl border border-slate-200 bg-surface px-4 py-3 text-base font-black text-slate-900 shadow-2xs focus:border-slate-400 focus:outline-none dark:border-slate-700"
                  placeholder="50"
                />
                <span className="text-sm text-slate-500">
                  Registration will automatically close once {form.seatLimit || 0} tickets are booked.
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="unlimited-capacity"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="rounded-2xl bg-slate-50/80 p-6 space-y-2 dark:bg-slate-900/40"
            >
              <h3 className="text-base font-bold text-slate-900">Unlimited Capacity Enabled</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                There is no attendance cap on this event. Anyone can register and participate without being placed on a waitlist.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 4. CANCELLATION & REFUND POLICY (When Paid) */}
      {form.paid && (
        <section className={`${SURFACE_CARD} space-y-6`}>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Cancellation & Refund Policy</h2>
            <p className="text-sm text-slate-500 mt-1">
              Select clear refund terms displayed to attendees during checkout.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {REFUND_OPTIONS.map((opt) => {
              const isSelected = form.refundPolicy === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => update("refundPolicy", opt.id)}
                  className={`flex items-start justify-between rounded-2xl border p-5 text-left transition-all cursor-pointer ${
                    isSelected
                      ? "border-slate-900 bg-slate-50 ring-2 ring-slate-900 dark:border-white dark:bg-slate-800 dark:ring-white"
                      : "border-slate-200/80 bg-surface hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="space-y-1.5 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{opt.title}</span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">{opt.desc}</p>
                  </div>
                  <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    isSelected ? "border-slate-900 bg-slate-900 dark:border-white dark:bg-white" : "border-slate-300 bg-surface"
                  }`}>
                    {isSelected && <div className="h-2 w-2 rounded-full bg-white dark:bg-slate-900" />}
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. SAVE PRICING CHANGES CONTAINER (POSITIONED ABOVE REVENUE & SETTLEMENT) */}
      <div className={`${SURFACE_CARD} flex flex-col sm:flex-row items-center justify-between gap-4 py-6`}>
        <div className="text-sm font-medium">
          {dirty ? (
            <span className="font-bold text-amber-600">• You have unsaved pricing changes</span>
          ) : (
            <span className="text-slate-500">All pricing settings are saved and up to date.</span>
          )}
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
          {dirty && (
            <button
              type="button"
              onClick={() => setForm(saved)}
              className="cursor-pointer text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors px-3 py-2"
            >
              Discard Changes
            </button>
          )}

          <button
            type="button"
            onClick={save}
            disabled={saving || !dirty}
            className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-8 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span>Saving Changes…</span>
              </div>
            ) : (
              <span>Save Pricing Changes</span>
            )}
          </button>
        </div>
      </div>

      {/* 6. REVENUE & FINANCIAL SETTLEMENT SUMMARY CONTAINER (LOCATED AT THE BOTTOM WITH TARGET ID) */}
      <section id="revenue-settlement-summary" className={`${SURFACE_CARD} space-y-6 scroll-mt-24`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Revenue & Settlement Summary</h2>
            <p className="text-sm text-slate-500 mt-1">
              Live breakdown of ticket sales and channel payout details.
            </p>
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {form.paid ? "Paid event" : "Free admission"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 py-1">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Sales</span>
            <p className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">
              {form.paid ? formatCurrency(totalCurrentSales, form.currency) : "Free"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {participantCount} attendee{participantCount === 1 ? "" : "s"} enrolled
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Seat Capacity</span>
            <p className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">
              {form.limited && form.seatLimit ? `${form.seatLimit}` : "Unlimited"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {form.limited && form.seatLimit ? `${Math.max(0, form.seatLimit - participantCount)} seats open` : "Open registration"}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Projected Full Revenue</span>
            <p className="mt-1 text-2xl sm:text-3xl font-black text-slate-900">
              {form.paid ? formatCurrency(projectedAtCapacity, form.currency) : "—"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {form.paid ? "Estimated gross if sold out" : "Free event"}
            </p>
          </div>
        </div>

        {metrics.length > 0 && (
          <div className="pt-2 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Settlement Ledger
            </span>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {metrics.map((m) => (
                <div key={m.label} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{m.label}</span>
                  <span className="text-base font-black tabular-nums text-slate-900 dark:text-white">{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-slate-400 pt-1">
          Payouts transfer automatically to your verified channel payout account following the event's completion.
        </p>
      </section>
    </div>
  );
}
