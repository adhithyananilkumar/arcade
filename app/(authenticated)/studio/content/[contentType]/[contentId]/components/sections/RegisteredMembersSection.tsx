"use client";

import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  MoreVertical,
  X,
  Loader2,
  Trash2,
} from "lucide-react";
import { api } from "@/infrastructure/http/api";
import { useStudioConfirm } from "@/apps/creator/studio/core/useStudioConfirm";
import { StudioRowMenu } from "@/apps/creator/studio/core/StudioRowMenu";
import { EventInvitationManager } from "@/domains/events";
import { EventCollaboratorsManager } from "@/app/(authenticated)/studio/events/components/wizard/review/EventCollaboratorsManager";
import type { Event as EventDto } from "@/domains/events";
import type { FetchResult, EventParticipant } from "../../lib/fetchOverviewData";

const SURFACE_CARD = "rounded-2xl border border-slate-200/80 bg-surface p-6 sm:p-8 shadow-xs";

// ── Types ─────────────────────────────────────────────────────────────────────

type RegistrationStatus = "CONFIRMED" | "PENDING" | "CANCELLED" | "WAITLISTED";
type PaymentStatus = "PAID" | "PENDING" | "REFUNDED" | "PARTIAL_REFUND" | "FAILED" | "FREE" | "NOT_APPLICABLE";
type AttendanceStatus = "ATTENDED" | "NOT_ATTENDED" | "UNKNOWN";

interface EnrichedParticipant extends EventParticipant {
  paymentStatus?: PaymentStatus;
  attendanceStatus?: AttendanceStatus;
  phone?: string;
  _regStatus: RegistrationStatus;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

function avatarColor(name: string): string {
  const colors = [
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
    "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
    "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
    "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    "bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300",
  ];
  const idx = (name.charCodeAt(0) || 0) % colors.length;
  return colors[idx];
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function normalizeStatus(raw: string): RegistrationStatus {
  const up = raw?.toUpperCase() || "";
  if (up === "APPROVED" || up === "COMPLETED" || up === "CONFIRMED" || up === "REGISTERED") return "CONFIRMED";
  if (up === "CANCELLED" || up === "CANCELED" || up === "REJECTED") return "CANCELLED";
  if (up === "WAITLISTED" || up === "WAITLIST") return "WAITLISTED";
  return "PENDING";
}

// ── Badges ────────────────────────────────────────────────────────────────────

function RegBadge({ status }: { status: RegistrationStatus }) {
  const map: Record<RegistrationStatus, string> = {
    CONFIRMED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    PENDING: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    CANCELLED: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    WAITLISTED: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${map[status]}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function PayBadge({ status }: { status?: PaymentStatus }) {
  if (!status || status === "NOT_APPLICABLE") return <span className="text-xs text-slate-400">—</span>;
  const map: Record<PaymentStatus, string> = {
    PAID: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300",
    PENDING: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    REFUNDED: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    PARTIAL_REFUND: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    NOT_APPLICABLE: "",
    FAILED: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
    FREE: "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${map[status]}`}>
      {status === "PARTIAL_REFUND" ? "Part Refunded" : status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

// ── Action Menu ───────────────────────────────────────────────────────────────

function ActionMenu({
  participant,
  eventId,
  onChanged,
}: {
  participant: EnrichedParticipant;
  eventId: string;
  onChanged: () => void;
}) {
  const { confirm, dialog } = useStudioConfirm();
  const alreadyCancelled = participant._regStatus === "CANCELLED";

  function removeMember() {
    confirm({
      title: alreadyCancelled ? "Remove from roster?" : "Remove this member?",
      message: alreadyCancelled
        ? `${participant.name}'s registration is already cancelled. This removes them from the roster.`
        : `This cancels ${participant.name}'s registration and removes them from the event.`,
      confirmLabel: alreadyCancelled ? "Remove" : "Remove member",
      danger: true,
      onConfirm: async () => {
        try {
          await api.delete(`/api/v1/events/${eventId}/participants/${participant.id}`);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Could not remove member");
          throw err;
        }
        toast.success(alreadyCancelled ? "Removed from roster" : "Registration cancelled");
        onChanged();
      },
    });
  }

  return (
    <>
      <StudioRowMenu
        trigger={<MoreVertical size={16} />}
        width={192}
        items={[
          {
            key: "remove",
            label: alreadyCancelled ? "Remove from roster" : "Cancel registration",
            icon: <Trash2 size={13} />,
            danger: true,
            onSelect: removeMember,
          },
        ]}
      />
      {dialog}
    </>
  );
}

// ── Invite Members Modal ──────────────────────────────────────────────────────

function InviteMembersModal({ eventId, onClose }: { eventId: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200/80 bg-surface shadow-2xl overflow-hidden dark:border-slate-800">
        <div className="flex items-center justify-between px-7 pt-6 pb-2">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Invite Attendees</h3>
            <p className="text-xs text-slate-500 mt-0.5">Send direct registration invitations via email.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-6">
          <EventInvitationManager eventId={eventId} className="border-0 p-0 shadow-none" />
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function RegisteredMembersSection({
  eventId,
  eventDetails,
  participantsResult,
  onChanged,
}: {
  eventId: string;
  eventDetails?: FetchResult<EventDto>;
  participantsResult?: FetchResult<EventParticipant[]>;
  onChanged: () => void;
}) {
  const [search, setSearch] = useState("");
  const [regFilter, setRegFilter] = useState<RegistrationStatus | "ALL">("ALL");
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Seats capacity state
  const rawCapacity = eventDetails?.status === "ok" ? eventDetails.data?.capacity : undefined;
  const [savedSeats, setSavedSeats] = useState<{ limited: boolean; seatLimit?: number }>(() => ({
    limited: !!(rawCapacity && rawCapacity > 0),
    seatLimit: rawCapacity && rawCapacity > 0 ? rawCapacity : undefined,
  }));
  const [seatsForm, setSeatsForm] = useState(savedSeats);
  const [savingSeats, setSavingSeats] = useState(false);

  useEffect(() => {
    if (eventDetails?.status === "ok") {
      const cap = eventDetails.data?.capacity;
      const next = {
        limited: !!(cap && cap > 0),
        seatLimit: cap && cap > 0 ? cap : undefined,
      };
      setSavedSeats(next);
      setSeatsForm(next);
    }
  }, [eventDetails]);

  const seatsDirty = JSON.stringify(seatsForm) !== JSON.stringify(savedSeats);
  const seatsInvalid = seatsForm.limited && !((seatsForm.seatLimit ?? 0) >= 1);

  const saveSeats = async () => {
    if (seatsInvalid) {
      toast.error("Please enter a seat limit of at least 1, or select Unlimited");
      return;
    }
    setSavingSeats(true);
    try {
      await api.patch(`/api/v1/events/${eventId}`, {
        capacity: seatsForm.limited ? seatsForm.seatLimit : 0,
      });
      setSavedSeats(seatsForm);
      toast.success("Seat capacity updated successfully");
      onChanged();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save seat capacity");
    } finally {
      setSavingSeats(false);
    }
  };

  if (participantsResult?.status === "error") {
    return (
      <div className={`${SURFACE_CARD} flex flex-col items-center justify-center gap-3 p-14 text-center max-w-2xl mx-auto`}>
        <h3 className="text-base font-bold text-slate-900">Member roster is temporarily unavailable</h3>
        <p className="text-sm text-slate-500">We could not load participants right now. Please refresh the page to retry.</p>
      </div>
    );
  }

  const rawList: EventParticipant[] = participantsResult?.status === "ok" ? participantsResult.data : [];

  const enriched: EnrichedParticipant[] = rawList.map((p) => ({
    ...p,
    paymentStatus: (p as EnrichedParticipant).paymentStatus,
    attendanceStatus: (p as EnrichedParticipant).attendanceStatus,
    _regStatus: normalizeStatus(p.status),
  }));

  // Stats
  const total = enriched.length;
  const confirmed = enriched.filter((p) => p._regStatus === "CONFIRMED").length;
  const pending = enriched.filter((p) => p._regStatus === "PENDING").length;
  const cancelled = enriched.filter((p) => p._regStatus === "CANCELLED").length;

  // Filter
  const filtered = useMemo(() => {
    return enriched.filter((p) => {
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.email ?? "").toLowerCase().includes(q);
      const matchesReg = regFilter === "ALL" || p._regStatus === regFilter;
      return matchesSearch && matchesReg;
    });
  }, [enriched, search, regFilter]);

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-16">
      {/* 1. TOP OVERVIEW METRICS */}
      <div className={`${SURFACE_CARD} grid grid-cols-2 gap-6 sm:grid-cols-4`}>
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Enrolled</span>
          <p className="mt-2 text-3xl sm:text-4xl font-black text-slate-900">{total}</p>
          <p className="text-sm text-slate-500 mt-1">Registered members</p>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Confirmed</span>
          <p className="mt-2 text-3xl sm:text-4xl font-black text-slate-900">{confirmed}</p>
          <p className="text-sm text-slate-500 mt-1">Active attendees</p>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Seat Capacity</span>
          <p className="mt-2 text-3xl sm:text-4xl font-black text-slate-900">
            {savedSeats.limited && savedSeats.seatLimit != null ? `${confirmed}/${savedSeats.seatLimit}` : "Unlimited"}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            {savedSeats.limited && savedSeats.seatLimit != null
              ? `${Math.max(0, savedSeats.seatLimit - confirmed)} seats left`
              : "Open registration"}
          </p>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending / Other</span>
          <p className="mt-2 text-3xl sm:text-4xl font-black text-slate-900">{pending + cancelled}</p>
          <p className="text-sm text-slate-500 mt-1">
            {pending > 0 ? `${pending} pending confirmation` : "No pending invites"}
          </p>
        </div>
      </div>

      {/* 2. SEAT CAPACITY CONFIGURATION CARD */}
      <section className={`${SURFACE_CARD} space-y-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Seat Capacity & Limits</h2>
            <p className="text-sm text-slate-500 mt-1">
              Cap attendance or allow open registration for this event.
            </p>
          </div>

          <div className="inline-flex rounded-full bg-slate-100/90 p-1.5 dark:bg-slate-800/90 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setSeatsForm((p) => ({ ...p, limited: false }))}
              className={`rounded-full px-5 py-2 text-sm font-bold transition-all cursor-pointer ${
                !seatsForm.limited
                  ? "bg-surface text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Unlimited
            </button>
            <button
              type="button"
              onClick={() => {
                setSeatsForm((p) => ({
                  ...p,
                  limited: true,
                  seatLimit: p.seatLimit || 50,
                }));
              }}
              className={`rounded-full px-5 py-2 text-sm font-bold transition-all cursor-pointer ${
                seatsForm.limited
                  ? "bg-surface text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Capped Seats
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {seatsForm.limited ? (
            <motion.div
              key="capped-limit"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-4 pt-1"
            >
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200">
                Maximum Attendee Seat Limit
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="number"
                  min={1}
                  aria-label="Maximum seat limit"
                  value={seatsForm.seatLimit ?? ""}
                  onChange={(e) =>
                    setSeatsForm((p) => ({
                      ...p,
                      seatLimit: e.target.value ? Number(e.target.value) : undefined,
                    }))
                  }
                  className="w-36 rounded-2xl border border-slate-200 bg-surface px-4 py-3 text-base font-black text-slate-900 shadow-2xs focus:border-slate-400 focus:outline-none dark:border-slate-700"
                  placeholder="50"
                />
                <span className="text-sm text-slate-500">
                  Tickets will automatically close once {seatsForm.seatLimit || 0} participants register.
                </span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="unlimited-notice"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="rounded-2xl bg-slate-50/80 p-6 space-y-2 dark:bg-slate-900/40"
            >
              <h3 className="text-base font-bold text-slate-900">Unlimited Attendance Enabled</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                There is no participant limit on this event. Anyone can register without being placed on a waitlist.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {seatsDirty && (
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setSeatsForm(savedSeats)}
              className="cursor-pointer text-sm font-bold text-slate-500 hover:text-slate-800 px-3 py-2 transition-colors"
            >
              Discard
            </button>
            <button
              type="button"
              onClick={saveSeats}
              disabled={savingSeats}
              className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-40 dark:bg-slate-100 dark:text-slate-900"
            >
              {savingSeats ? (
                <div className="flex items-center gap-2">
                  <Loader2 size={15} className="animate-spin" />
                  <span>Saving…</span>
                </div>
              ) : (
                <span>Save Seat Limit</span>
              )}
            </button>
          </div>
        )}
      </section>

      {/* 3. ATTENDEE ROSTER & SEARCH CARD */}
      <section className={`${SURFACE_CARD} space-y-6`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Attendee Roster</h2>
            <p className="text-sm text-slate-500 mt-1">
              View confirmed members, registration records, and invite attendees.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 active:scale-[0.98] self-start sm:self-auto dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            Invite Members
          </button>
        </div>

        {/* Search & Filter Pills */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by attendee name or email…"
              className="w-full rounded-2xl border border-slate-200 bg-surface py-3 pl-11 pr-4 text-sm font-medium text-slate-800 shadow-2xs outline-none focus:border-slate-400 dark:border-slate-700"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {(["ALL", "CONFIRMED", "PENDING", "CANCELLED"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setRegFilter(s)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  regFilter === s
                    ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                    : "bg-slate-100/90 text-slate-600 hover:bg-slate-200/80 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                {s === "ALL" ? "All Members" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Table or Empty State */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl bg-slate-50/70 p-10 text-center space-y-2 dark:bg-slate-900/30">
            <p className="text-base font-bold text-slate-900">
              {total === 0 ? "No attendees registered yet" : "No attendees match your search"}
            </p>
            <p className="text-sm text-slate-500">
              {total === 0
                ? "Send invitations by email or publish your event to start accepting registrations."
                : "Try clearing your search query or switching your status filter."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-4 pl-2 font-bold">Attendee</th>
                  <th className="pb-4 font-bold">Status</th>
                  <th className="pb-4 font-bold">Payment</th>
                  <th className="pb-4 font-bold">Registered</th>
                  <th className="pb-4 pr-2 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="space-y-2">
                {filtered.map((p) => (
                  <tr key={p.id} className="group transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
                    {/* Attendee Info */}
                    <td className="py-3.5 pl-2">
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-xs font-black ${avatarColor(p.name)}`}
                        >
                          {initials(p.name)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{p.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{p.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Registration Status */}
                    <td className="py-3.5">
                      <RegBadge status={p._regStatus} />
                    </td>

                    {/* Payment Status */}
                    <td className="py-3.5">
                      <PayBadge status={p.paymentStatus} />
                    </td>

                    {/* Registered On Date */}
                    <td className="py-3.5 text-xs font-semibold text-slate-500">
                      {formatDate(p.registrationDate)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 pr-2 text-right">
                      <ActionMenu participant={p} eventId={eventId} onChanged={onChanged} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 4. EVENT COLLABORATORS CARD */}
      <section className={`${SURFACE_CARD} space-y-6`}>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Event Collaborators</h2>
          <p className="text-sm text-slate-500 mt-1">
            Team members and co-hosts with access to manage or review this event.
          </p>
        </div>

        <div className="pt-2">
          <EventCollaboratorsManager eventId={eventId} layout="studio" startStep={1} />
        </div>
      </section>

      {/* Invite Modal */}
      {addModalOpen && (
        <InviteMembersModal eventId={eventId} onClose={() => setAddModalOpen(false)} />
      )}
    </div>
  );
}
