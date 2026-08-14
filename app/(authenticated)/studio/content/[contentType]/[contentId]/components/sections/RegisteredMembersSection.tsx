"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Search,
  UserPlus,
  MoreVertical,
  X,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  UserCheck,
  Eye,
  Pencil,
  Trash2,
  CalendarCheck,
} from "lucide-react";
import { api } from "@/infrastructure/http/api";
import type { FetchResult, EventParticipant } from "../../lib/fetchOverviewData";

// ── Types ─────────────────────────────────────────────────────────────────────

type RegistrationStatus = "CONFIRMED" | "PENDING" | "CANCELLED" | "WAITLISTED";
type PaymentStatus = "PAID" | "PENDING" | "REFUNDED" | "FAILED" | "FREE";
type AttendanceStatus = "ATTENDED" | "NOT_ATTENDED" | "UNKNOWN";

interface EnrichedParticipant extends EventParticipant {
  paymentStatus?: PaymentStatus;
  attendanceStatus?: AttendanceStatus;
  phone?: string;
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
    "bg-indigo-100 text-indigo-700",
    "bg-violet-100 text-violet-700",
    "bg-sky-100 text-sky-700",
    "bg-emerald-100 text-emerald-700",
    "bg-rose-100 text-rose-700",
    "bg-amber-100 text-amber-700",
    "bg-teal-100 text-teal-700",
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function normalizeStatus(raw: string): RegistrationStatus {
  const up = raw.toUpperCase();
  if (up === "CONFIRMED" || up === "REGISTERED") return "CONFIRMED";
  if (up === "CANCELLED" || up === "CANCELED") return "CANCELLED";
  if (up === "WAITLISTED" || up === "WAITLIST") return "WAITLISTED";
  return "PENDING";
}

// ── Badge components ──────────────────────────────────────────────────────────

function RegBadge({ status }: { status: RegistrationStatus }) {
  const map: Record<RegistrationStatus, string> = {
    CONFIRMED: "bg-emerald-50 text-emerald-700",
    PENDING: "bg-amber-50 text-amber-700",
    CANCELLED: "bg-red-50 text-red-600",
    WAITLISTED: "bg-slate-100 text-slate-600",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${map[status]}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function PayBadge({ status }: { status?: PaymentStatus }) {
  if (!status) return <span className="text-xs text-slate-400">—</span>;
  const map: Record<PaymentStatus, string> = {
    PAID: "bg-emerald-50 text-emerald-700",
    PENDING: "bg-amber-50 text-amber-700",
    REFUNDED: "bg-slate-100 text-slate-600",
    FAILED: "bg-red-50 text-red-600",
    FREE: "bg-indigo-50 text-indigo-600",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${map[status]}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function AttBadge({ status }: { status?: AttendanceStatus }) {
  if (!status || status === "UNKNOWN") return <span className="text-xs text-slate-400">—</span>;
  return status === "ATTENDED" ? (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
      <CalendarCheck size={11} /> Attended
    </span>
  ) : (
    <span className="text-[11px] font-semibold text-slate-400">Not attended</span>
  );
}

// ── Stat chip ─────────────────────────────────────────────────────────────────

function Chip({ icon: Icon, label, value, color }: { icon: typeof CheckCircle2; label: string; value: number; color: string }) {
  return (
    <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 ${color}`}>
      <Icon size={15} className="shrink-0" />
      <div>
        <p className="text-[18px] font-bold leading-none">{value}</p>
        <p className="text-[11px] font-medium opacity-75">{label}</p>
      </div>
    </div>
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
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  async function markAttended() {
    setBusy(true);
    try {
      await api.patch(`/api/v1/events/${eventId}/participants/${participant.id}`, { attendanceStatus: "ATTENDED" });
      toast.success("Marked as attended");
      onChanged();
    } catch {
      toast.error("Could not update attendance");
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  async function cancelRegistration() {
    if (!confirm(`Cancel registration for ${participant.name}?`)) return;
    setBusy(true);
    try {
      await api.patch(`/api/v1/events/${eventId}/participants/${participant.id}`, { status: "CANCELLED" });
      toast.success("Registration cancelled");
      onChanged();
    } catch {
      toast.error("Could not cancel registration");
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  async function removeMember() {
    if (!confirm(`Remove ${participant.name} from this event?`)) return;
    setBusy(true);
    try {
      await api.delete(`/api/v1/events/${eventId}/participants/${participant.id}`);
      toast.success("Member removed");
      onChanged();
    } catch {
      toast.error("Could not remove member");
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        disabled={busy}
        onClick={() => setOpen((p) => !p)}
        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#14142b] cursor-pointer disabled:opacity-40"
      >
        <MoreVertical size={15} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-48 rounded-xl border border-slate-200 bg-white shadow-xl">
            {[
              { icon: Eye, label: "View details", action: () => setOpen(false) },
              { icon: UserCheck, label: "Mark attended", action: markAttended },
              { icon: Pencil, label: "Edit registration", action: () => setOpen(false) },
              { icon: XCircle, label: "Cancel registration", action: cancelRegistration },
              { icon: Trash2, label: "Remove member", action: removeMember },
            ].map(({ icon: Icon, label, action }) => (
              <button
                key={label}
                type="button"
                onClick={action}
                className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-xs font-medium transition-colors hover:bg-slate-50 cursor-pointer ${
                  label.startsWith("Remove") || label.startsWith("Cancel")
                    ? "text-red-500 hover:text-red-600"
                    : "text-slate-700"
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Add Member Modal ──────────────────────────────────────────────────────────

function AddMemberModal({
  eventId,
  onAdded,
  onClose,
}: {
  eventId: string;
  onAdded: () => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    registrationType: "OPEN",
    paymentStatus: "FREE",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  function update(k: string, v: string) {
    setForm((p) => ({ ...p, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setSaving(true);
    try {
      await api.post(`/api/v1/events/${eventId}/participants`, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        registrationType: form.registrationType,
        paymentStatus: form.paymentStatus,
        notes: form.notes.trim() || undefined,
      });
      toast.success(`${form.name} added`);
      onAdded();
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not add member");
    } finally {
      setSaving(false);
    }
  }

  const labelCls = "mb-1.5 block text-[12px] font-semibold text-[#14142b]";
  const inputCls =
    "w-full rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm outline-none focus:border-[#14142b]/30 focus:bg-white focus:ring-2 focus:ring-slate-200/60";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-sm font-bold text-[#14142b]">Add Member</h3>
          <button type="button" onClick={onClose} className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className={labelCls}>Full name *</label>
              <input
                type="text"
                required
                autoFocus
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                className={inputCls}
                placeholder="e.g. Aloshy Antony"
              />
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Email *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className={inputCls}
                placeholder="e.g. aloshy@example.com"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className={labelCls}>Phone (optional)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                className={inputCls}
                placeholder="+91 98765 43210"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className={labelCls}>Payment status</label>
              <select value={form.paymentStatus} onChange={(e) => update("paymentStatus", e.target.value)} className={inputCls}>
                <option value="FREE">Free</option>
                <option value="PAID">Paid</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className={labelCls}>Notes (optional)</label>
              <textarea
                rows={2}
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                className={inputCls + " resize-none"}
                placeholder="Any notes about this registration…"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !form.name.trim() || !form.email.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#14142b] px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#232735] disabled:opacity-60 cursor-pointer"
            >
              <UserPlus size={13} />
              {saving ? "Adding…" : "Add member"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function RegisteredMembersSection({
  eventId,
  participantsResult,
  onChanged,
}: {
  eventId: string;
  participantsResult?: FetchResult<EventParticipant[]>;
  onChanged: () => void;
}) {
  const [search, setSearch] = useState("");
  const [regFilter, setRegFilter] = useState<RegistrationStatus | "ALL">("ALL");
  const [addModalOpen, setAddModalOpen] = useState(false);

  if (participantsResult?.status === "error") {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
        <AlertTriangle size={14} />
        Member list is temporarily unavailable — try again shortly.
      </div>
    );
  }

  const rawList: EnrichedParticipant[] =
    participantsResult?.status === "ok"
      ? participantsResult.data.map((p) => ({
          ...p,
          paymentStatus: (p as EnrichedParticipant).paymentStatus,
          attendanceStatus: (p as EnrichedParticipant).attendanceStatus,
        }))
      : [];

  // Normalize statuses
  const enriched = rawList.map((p) => ({
    ...p,
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
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        (p.email ?? "").toLowerCase().includes(q);
      const matchesReg = regFilter === "ALL" || p._regStatus === regFilter;
      return matchesSearch && matchesReg;
    });
  }, [enriched, search, regFilter]);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-[#14142b]">Registered Members</h2>
          <p className="mt-0.5 text-xs text-slate-500">People who registered to attend this event</p>
        </div>
        <button
          type="button"
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#14142b] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#232735] cursor-pointer"
        >
          <UserPlus size={13} />
          Add member
        </button>
      </div>

      {/* Stat chips */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Chip icon={CheckCircle2} label="Total" value={total} color="border-slate-200 bg-white/80 text-[#14142b]" />
        <Chip icon={CheckCircle2} label="Confirmed" value={confirmed} color="border-emerald-200 bg-emerald-50 text-emerald-700" />
        <Chip icon={Clock} label="Pending" value={pending} color="border-amber-200 bg-amber-50 text-amber-700" />
        <Chip icon={XCircle} label="Cancelled" value={cancelled} color="border-red-200 bg-red-50 text-red-600" />
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="w-full rounded-lg border border-slate-200 bg-white/80 py-2 pl-8 pr-3 text-sm outline-none focus:border-[#14142b]/30 focus:ring-2 focus:ring-slate-200/60"
          />
        </div>
        <div className="flex items-center gap-2">
          {(["ALL", "CONFIRMED", "PENDING", "CANCELLED", "WAITLISTED"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setRegFilter(s)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors cursor-pointer ${
                regFilter === s
                  ? "bg-[#14142b] text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/40 bg-white/60 py-14 text-center shadow-lg backdrop-blur-xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <UserCheck size={22} />
          </div>
          <p className="text-sm font-semibold text-[#14142b]">
            {total === 0 ? "No members yet" : "No members match your filters"}
          </p>
          <p className="max-w-xs text-xs text-slate-500">
            {total === 0
              ? "Registered attendees will appear here once people sign up."
              : "Try adjusting your search or filter."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-white/40 bg-white/95 shadow-lg backdrop-blur-xl">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                <th className="px-4 py-3">Member</th>
                <th className="px-4 py-3">Registration</th>
                <th className="px-4 py-3">Payment</th>
                <th className="px-4 py-3">Registered on</th>
                <th className="px-4 py-3">Attendance</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((p) => (
                <tr key={p.id} className="group transition-colors hover:bg-slate-50/60">
                  {/* Member */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${avatarColor(p.name)}`}
                      >
                        {initials(p.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-[#14142b] leading-tight">{p.name}</p>
                        <p className="text-[11px] text-slate-400">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  {/* Registration status */}
                  <td className="px-4 py-3">
                    <RegBadge status={p._regStatus} />
                  </td>
                  {/* Payment */}
                  <td className="px-4 py-3">
                    <PayBadge status={p.paymentStatus} />
                  </td>
                  {/* Registered on */}
                  <td className="px-4 py-3 text-xs text-slate-500">{formatDate(p.registrationDate)}</td>
                  {/* Attendance */}
                  <td className="px-4 py-3">
                    <AttBadge status={p.attendanceStatus} />
                  </td>
                  {/* Actions */}
                  <td className="px-4 py-3">
                    <ActionMenu participant={p} eventId={eventId} onChanged={onChanged} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add member modal */}
      {addModalOpen && (
        <AddMemberModal eventId={eventId} onAdded={onChanged} onClose={() => setAddModalOpen(false)} />
      )}
    </div>
  );
}
