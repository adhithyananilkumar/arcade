"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, BarChart3, CheckCircle, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { api } from "@/infrastructure/http/api";
import type { FetchResult } from "../../lib/fetchOverviewData";
import { RefundPolicy } from "@/app/(authenticated)/studio/events/types";
import type { Event as EventDto } from "@/domains/events";
import {
  WorkspaceChoice,
  WorkspaceHeading,
  WorkspaceMessage,
  WorkspaceRow,
  WorkspaceRows,
  WorkspaceSaveBar,
  WorkspaceStat,
  workspaceField,
} from "@/apps/creator/studio/core/StudioWorkspaceKit";
import { MetricsGrid, type Metric } from "./MetricsGrid";

function humanizeKey(key: string): string {
  const spaced = key.replace(/([a-z])([A-Z])/g, "$1 $2");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

const MONEY_KEYS = new Set(["totalRevenue", "pendingRevenue", "refundedRevenue", "netRevenue", "platformCommission", "organizerEarnings"]);

export function analyticsToMetrics(analytics?: Record<string, unknown>): Metric[] {
  if (!analytics) return [];
  const currency = (analytics.currency as string) || "INR";
  return Object.entries(analytics)
    .filter(([, value]) => typeof value === "number" || typeof value === "string")
    .map(([key, value]) => ({
      label: humanizeKey(key),
      value:
        MONEY_KEYS.has(key) && typeof value === "number"
          ? new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(value / 100)
          : (value as string | number),
    }));
}

function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

const REFUND_LABEL: Record<RefundPolicy, string> = {
  [RefundPolicy.NO_REFUND]: "No refund",
  [RefundPolicy.FULL_REFUND]: "Full refund",
  [RefundPolicy.PARTIAL_REFUND]: "Partial refund",
  [RefundPolicy.CUSTOM]: "Custom",
};

/** Everything on this tab that the event actually stores. */
interface PricingForm {
  paid: boolean;
  /** Major units, as typed. */
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
    refundPolicy: (event?.refundPolicy as RefundPolicy | null | undefined) ?? undefined,
  };
}

/**
 * An event's Pricing tab: fee, seats and refund policy, saved together on the event.
 *
 * <p>It used to also offer registration type, a registration window, waitlist, early-bird and
 * coupons, and saved those to an endpoint that does not exist — swallowing the failure, so the
 * page said "Pricing saved" and a refresh put everything back (BUG-1029). Only settings the
 * backend stores are shown now; the registration window lives on the Schedule tab.
 */
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
  // The page has loaded the event before this tab renders, and a save keeps `saved` current
  // itself, so the initial value is all this needs from props.
  const [saved, setSaved] = useState<PricingForm>(() => formOf(eventDetails?.status === "ok" ? eventDetails.data : null));
  const [form, setForm] = useState<PricingForm>(saved);
  const [saving, setSaving] = useState(false);

  if (eventDetails?.status === "error") {
    return (
      <WorkspaceMessage icon={AlertTriangle} tone="warning" title="Pricing is temporarily unavailable">
        Try again shortly.
      </WorkspaceMessage>
    );
  }

  const update = <K extends keyof PricingForm>(key: K, val: PricingForm[K]) => setForm((p) => ({ ...p, [key]: val }));
  const dirty = JSON.stringify(form) !== JSON.stringify(saved);
  const priceInvalid = form.paid && !(form.price > 0);
  const seatsInvalid = form.limited && !((form.seatLimit ?? 0) >= 1);
  const metrics = eventAnalytics?.status === "ok" ? analyticsToMetrics(eventAnalytics.data) : [];

  const save = async () => {
    if (priceInvalid || seatsInvalid) {
      toast.error(priceInvalid ? "Enter a price above zero, or choose Free" : "Enter at least one seat, or choose Unlimited");
      return;
    }
    setSaving(true);
    try {
      const updated = await api.patch<EventDto>(`/api/v1/events/${eventId}`, {
        priceAmount: form.paid ? Math.round(form.price * 100) : 0,
        currency: form.currency || "INR",
        // 0 clears the cap; null would leave the old limit in place.
        capacity: form.limited ? form.seatLimit : 0,
        refundPolicy: form.refundPolicy ?? null,
      });
      const next = formOf(updated);
      setSaved(next);
      setForm(next);
      toast.success("Pricing saved");
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save pricing");
    } finally {
      setSaving(false);
    }
  };

  let step = 0;
  const next = () => ++step;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-6 border-b border-slate-200/70 pb-8 sm:grid-cols-4">
        <WorkspaceStat icon={Users} label="Registrations" value={participantCount} />
        <WorkspaceStat
          icon={TrendingUp}
          label={saved.paid ? "Revenue" : "Price"}
          value={saved.paid ? formatCurrency(saved.price * participantCount, saved.currency) : "Free"}
          hint={saved.paid ? `${formatCurrency(saved.price, saved.currency)} per participant` : undefined}
        />
        <WorkspaceStat icon={CheckCircle} label="Seats" value={saved.limited && saved.seatLimit != null ? saved.seatLimit : "Unlimited"} />
        <WorkspaceStat
          icon={ShieldCheck}
          label="Refunds"
          value={saved.paid ? (saved.refundPolicy ? REFUND_LABEL[saved.refundPolicy] : "Not set") : "—"}
        />
      </div>

      <WorkspaceRows>
        <WorkspaceRow step={next()} title="Pricing model" description="Whether participants pay to register.">
          <WorkspaceChoice
            value={form.paid ? "PAID" : "FREE"}
            onChange={(v) => update("paid", v === "PAID")}
            options={[
              { value: "FREE", label: "Free" },
              { value: "PAID", label: "Paid" },
            ]}
          />
        </WorkspaceRow>

        {form.paid && (
          <WorkspaceRow step={next()} title="Price" description="What each participant pays to register.">
            <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
              <input
                type="number"
                min={0}
                aria-label="Price"
                value={form.price || ""}
                onChange={(e) => update("price", Number(e.target.value))}
                className={workspaceField.input}
                placeholder="0"
              />
              <select aria-label="Currency" value={form.currency} onChange={(e) => update("currency", e.target.value)} className={workspaceField.select}>
                {["INR", "USD", "EUR", "GBP", "AUD", "SGD"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </WorkspaceRow>
        )}

        <WorkspaceRow step={next()} title="Seats" description="Cap the number of participants.">
          <div className="flex flex-col gap-3">
            <WorkspaceChoice
              value={form.limited ? "LIMITED" : "UNLIMITED"}
              onChange={(v) => update("limited", v === "LIMITED")}
              options={[
                { value: "UNLIMITED", label: "Unlimited" },
                { value: "LIMITED", label: "Limited" },
              ]}
            />
            {form.limited && (
              <input
                type="number"
                min={1}
                aria-label="Maximum seats"
                value={form.seatLimit ?? ""}
                onChange={(e) => update("seatLimit", e.target.value ? Number(e.target.value) : undefined)}
                className={`${workspaceField.input} sm:max-w-[12rem]`}
                placeholder="Maximum seats"
              />
            )}
          </div>
        </WorkspaceRow>

        {form.paid && (
          <WorkspaceRow step={next()} title="Refund policy" description="What a participant can expect if they ask for their money back.">
            <select
              aria-label="Refund policy"
              value={form.refundPolicy ?? ""}
              onChange={(e) => update("refundPolicy", (e.target.value as RefundPolicy) || undefined)}
              className={workspaceField.select}
            >
              <option value="">No refund policy set</option>
              {Object.values(RefundPolicy).map((p) => (
                <option key={p} value={p}>
                  {REFUND_LABEL[p]}
                </option>
              ))}
            </select>
          </WorkspaceRow>
        )}

        <WorkspaceSaveBar onSave={save} saving={saving} dirty={dirty} label="Save pricing" savedLabel="Pricing saved" />
      </WorkspaceRows>

      {/* Analytics */}
      <div className="flex flex-col gap-6 pt-6 border-t border-slate-200/70">
        <WorkspaceHeading
          icon={BarChart3}
          title="Revenue & Analytics"
          description="Breakdown of event earnings, ticket sales, platform commissions, and attendee registrations."
        />
        {eventAnalytics?.status === "error" ? (
          <WorkspaceMessage icon={AlertTriangle} tone="warning" title="Analytics temporarily unavailable">
            Try again shortly.
          </WorkspaceMessage>
        ) : metrics.length === 0 ? (
          <WorkspaceMessage icon={BarChart3} title="No learner activity yet">
            Analytics will appear once learners register or interact with this event.
          </WorkspaceMessage>
        ) : (
          <MetricsGrid metrics={metrics} />
        )}
      </div>
    </div>
  );
}
