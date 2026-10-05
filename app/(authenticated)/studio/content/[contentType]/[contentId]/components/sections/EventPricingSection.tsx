"use client";

import { useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Users } from "lucide-react";
import { api } from "@/infrastructure/http/api";
import type { FetchResult } from "../../lib/fetchOverviewData";
import type { EventPricing, SaveEventPricingRequest } from "@/app/(authenticated)/studio/events/types";
import { PricingModel, RegistrationType, SeatType, RefundPolicy } from "@/app/(authenticated)/studio/events/types";
import type { Event as EventDto } from "@/domains/events";
import {
  WorkspaceChoice,
  WorkspaceLabel,
  WorkspaceMessage,
  WorkspaceRow,
  WorkspaceRows,
  WorkspaceSaveBar,
  WorkspaceStat,
  workspaceField,
} from "@/apps/creator/studio/core/StudioWorkspaceKit";

function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function requestOf(p: EventPricing): SaveEventPricingRequest {
  return {
    pricingModel: p.pricingModel,
    price: p.price,
    currency: p.currency,
    registrationType: p.registrationType,
    seatType: p.seatType,
    seatLimit: p.seatLimit,
    waitlistEnabled: p.waitlistEnabled,
    registrationStart: p.registrationStart,
    registrationEnd: p.registrationEnd,
    earlyBirdEnabled: p.earlyBirdEnabled,
    earlyBirdPrice: p.earlyBirdPrice,
    earlyBirdEndDate: p.earlyBirdEndDate,
    couponEnabled: p.couponEnabled,
    refundPolicy: p.refundPolicy,
    allowCancellation: p.allowCancellation,
  };
}

function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="inline-flex cursor-pointer select-none items-center gap-2.5 text-xs font-semibold text-slate-700">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 rounded border-slate-300 accent-[#205ca8]" />
      {children}
    </label>
  );
}

/** The event's pricing derived from the event record, for events with no dedicated pricing row. */
function pricingFromEvent(eventId: string, event?: EventDto | null): EventPricing {
  const isPaid = (event?.priceAmount || 0) > 0;
  return {
    id: "",
    eventId,
    pricingModel: isPaid ? PricingModel.PAID : PricingModel.FREE,
    price: (event?.priceAmount || 0) / 100,
    currency: event?.currency || "INR",
    registrationType: RegistrationType.OPEN,
    seatType: event?.capacity ? SeatType.LIMITED : SeatType.UNLIMITED,
    seatLimit: event?.capacity,
    waitlistEnabled: false,
    earlyBirdEnabled: false,
    couponEnabled: false,
    allowCancellation: true,
    createdAt: "",
    updatedAt: "",
  };
}

/**
 * An event's Pricing tab: registration fee, who can register and when, seats, early-bird and
 * refunds — the numbered rows every Content Overview form uses, saved together. The figures
 * strip on top reads from what is saved, not the draft.
 */
export function EventPricingSection({
  eventId,
  pricingResult,
  eventDetails,
  participantCount,
  onChanged,
}: {
  eventId: string;
  pricingResult?: FetchResult<EventPricing>;
  eventDetails?: FetchResult<EventDto>;
  participantCount: number;
  onChanged: () => void;
}) {
  // The page has loaded the event before this tab renders, and a save keeps `saved` current
  // itself, so the initial value is all this needs from props.
  const [saved, setSaved] = useState<EventPricing>(() =>
    pricingResult?.status === "ok" ? pricingResult.data : pricingFromEvent(eventId, eventDetails?.status === "ok" ? eventDetails.data : null)
  );
  const [form, setForm] = useState<SaveEventPricingRequest>(() => requestOf(saved));
  const [saving, setSaving] = useState(false);

  if (pricingResult?.status === "error" && eventDetails?.status !== "ok") {
    return (
      <WorkspaceMessage icon={AlertTriangle} tone="warning" title="Pricing is temporarily unavailable">
        Try again shortly.
      </WorkspaceMessage>
    );
  }

  const update = <K extends keyof SaveEventPricingRequest>(key: K, val: SaveEventPricingRequest[K]) => setForm((p) => ({ ...p, [key]: val }));
  const dirty = JSON.stringify(form) !== JSON.stringify(requestOf(saved));
  const isFree = form.pricingModel === PricingModel.FREE;
  const savedFree = saved.pricingModel === PricingModel.FREE;

  const save = async () => {
    setSaving(true);
    try {
      const priceAmount = isFree ? 0 : Math.round((form.price || 0) * 100);
      const capacity = form.seatType === SeatType.LIMITED ? (form.seatLimit ?? null) : null;

      // The event aggregate stores price_amount, currency and capacity.
      await api.patch(`/api/v1/events/${eventId}`, { priceAmount, currency: form.currency || "INR", capacity });

      // Best effort on the dedicated pricing table, where the endpoint exists.
      let updated: EventPricing;
      try {
        updated = await api.put<EventPricing>(`/api/v1/events/${eventId}/pricing`, form);
      } catch {
        updated = {
          ...saved,
          ...form,
          id: saved.id || eventId,
          eventId,
          createdAt: saved.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as EventPricing;
      }
      setSaved(updated);
      setForm(requestOf(updated));
      toast.success("Pricing saved");
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save pricing");
    } finally {
      setSaving(false);
    }
  };

  const toLocal = (iso?: string) => (iso ? iso.slice(0, 16) : "");
  const fromLocal = (value: string) => (value ? new Date(value).toISOString() : undefined);
  let step = 0;
  const next = () => ++step;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 gap-6 border-b border-slate-200/70 pb-8 sm:grid-cols-4">
        <WorkspaceStat icon={Users} label="Registrations" value={participantCount} />
        <WorkspaceStat
          icon={TrendingUp}
          label={savedFree ? "Price" : "Revenue"}
          value={savedFree ? "Free" : formatCurrency(saved.price * participantCount, saved.currency)}
          hint={savedFree ? undefined : `${formatCurrency(saved.price, saved.currency)} per participant`}
        />
        <WorkspaceStat
          icon={CheckCircle}
          label="Seats"
          value={saved.seatType === SeatType.LIMITED && saved.seatLimit != null ? saved.seatLimit : "Unlimited"}
          hint={saved.waitlistEnabled ? "Waitlist on" : undefined}
        />
        <WorkspaceStat icon={Clock} label="Registration closes" value={formatDate(saved.registrationEnd)} />
      </div>

      <WorkspaceRows>
        <WorkspaceRow step={next()} title="Pricing model" description="How participants get a place.">
          <WorkspaceChoice
            value={form.pricingModel}
            onChange={(v) => update("pricingModel", v)}
            options={[
              { value: PricingModel.FREE, label: "Free" },
              { value: PricingModel.PAID, label: "Paid" },
              { value: PricingModel.MEMBERSHIP, label: "Membership" },
              { value: PricingModel.INVITE_ONLY, label: "Invite only" },
              { value: PricingModel.COMING_SOON, label: "Coming soon" },
            ]}
          />
        </WorkspaceRow>

        {!isFree && (
          <WorkspaceRow step={next()} title="Price" description="What each participant pays to register.">
            <div className="grid gap-3 sm:grid-cols-[1fr_9rem]">
              <input
                type="number"
                min={0}
                aria-label="Price"
                value={form.price ?? ""}
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

        <WorkspaceRow step={next()} title="Registration" description="Who can register, and the window in which they can.">
          <div className="flex flex-col gap-3">
            <select
              aria-label="Registration type"
              value={form.registrationType}
              onChange={(e) => update("registrationType", e.target.value as RegistrationType)}
              className={workspaceField.select}
            >
              <option value={RegistrationType.OPEN}>Open — anyone can register</option>
              <option value={RegistrationType.APPROVAL_REQUIRED}>Approval required</option>
              <option value={RegistrationType.INVITE_ONLY}>Invite only</option>
              <option value={RegistrationType.PRIVATE}>Private</option>
            </select>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <WorkspaceLabel htmlFor="reg-opens">Opens</WorkspaceLabel>
                <input
                  id="reg-opens"
                  type="datetime-local"
                  value={toLocal(form.registrationStart)}
                  onChange={(e) => update("registrationStart", fromLocal(e.target.value))}
                  className={workspaceField.input}
                />
              </div>
              <div>
                <WorkspaceLabel htmlFor="reg-closes">Closes</WorkspaceLabel>
                <input
                  id="reg-closes"
                  type="datetime-local"
                  value={toLocal(form.registrationEnd)}
                  onChange={(e) => update("registrationEnd", fromLocal(e.target.value))}
                  className={workspaceField.input}
                />
              </div>
            </div>
          </div>
        </WorkspaceRow>

        <WorkspaceRow step={next()} title="Seats" description="Cap the number of participants, with an optional waitlist.">
          <div className="flex flex-col gap-3">
            <WorkspaceChoice
              value={form.seatType}
              onChange={(v) => update("seatType", v)}
              options={[
                { value: SeatType.UNLIMITED, label: "Unlimited" },
                { value: SeatType.LIMITED, label: "Limited" },
              ]}
            />
            {form.seatType === SeatType.LIMITED && (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="number"
                  min={1}
                  aria-label="Maximum seats"
                  value={form.seatLimit ?? ""}
                  onChange={(e) => update("seatLimit", Number(e.target.value))}
                  className={`${workspaceField.input} sm:max-w-[12rem]`}
                  placeholder="Maximum seats"
                />
                <Check checked={form.waitlistEnabled} onChange={(v) => update("waitlistEnabled", v)}>
                  Enable waitlist when full
                </Check>
              </div>
            )}
          </div>
        </WorkspaceRow>

        {!isFree && (
          <WorkspaceRow step={next()} title="Early-bird" description="A lower price for those who register before a date.">
            <div className="flex flex-col gap-3">
              <Check checked={form.earlyBirdEnabled} onChange={(v) => update("earlyBirdEnabled", v)}>
                Offer early-bird pricing
              </Check>
              {form.earlyBirdEnabled && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <WorkspaceLabel htmlFor="eb-price">Early-bird price</WorkspaceLabel>
                    <input
                      id="eb-price"
                      type="number"
                      min={0}
                      value={form.earlyBirdPrice ?? ""}
                      onChange={(e) => update("earlyBirdPrice", Number(e.target.value))}
                      className={workspaceField.input}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <WorkspaceLabel htmlFor="eb-ends">Ends</WorkspaceLabel>
                    <input
                      id="eb-ends"
                      type="date"
                      value={form.earlyBirdEndDate ?? ""}
                      onChange={(e) => update("earlyBirdEndDate", e.target.value || undefined)}
                      className={workspaceField.input}
                    />
                  </div>
                </div>
              )}
            </div>
          </WorkspaceRow>
        )}

        <WorkspaceRow step={next()} title="Refunds & cancellation" description="What happens when a participant changes their mind.">
          <div className="flex flex-col gap-3">
            {!isFree && (
              <select
                aria-label="Refund policy"
                value={form.refundPolicy ?? ""}
                onChange={(e) => update("refundPolicy", (e.target.value as RefundPolicy) || undefined)}
                className={workspaceField.select}
              >
                <option value="">No refund policy set</option>
                <option value={RefundPolicy.NO_REFUND}>No refund</option>
                <option value={RefundPolicy.FULL_REFUND}>Full refund</option>
                <option value={RefundPolicy.PARTIAL_REFUND}>Partial refund</option>
                <option value={RefundPolicy.CUSTOM}>Custom</option>
              </select>
            )}
            <Check checked={form.allowCancellation} onChange={(v) => update("allowCancellation", v)}>
              Participants can cancel their registration
            </Check>
          </div>
        </WorkspaceRow>

        <WorkspaceSaveBar onSave={save} saving={saving} dirty={dirty} label="Save pricing" savedLabel="Pricing saved" />
      </WorkspaceRows>
    </div>
  );
}
