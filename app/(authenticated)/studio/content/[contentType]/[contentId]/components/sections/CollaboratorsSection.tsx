"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Users, Plus, AlertTriangle, UserCheck, Shield, ChevronDown, Check } from "lucide-react";
import type { CollaboratorLite } from "../../lib/fetchOverviewData";
import type { ContentTypeSegment } from "../../lib/contentTypeRouting";
import { inviteCollaborator } from "../../lib/contentActions";
import { EmptyState } from "./EmptyState";

function AddCollaboratorForm({
  segment,
  contentId,
  onAdded,
  onCancel,
}: {
  segment: ContentTypeSegment;
  contentId: string;
  onAdded: () => void;
  onCancel: () => void;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"EDITOR" | "MANAGER" | "VIEWER">("EDITOR");
  const [busy, setBusy] = useState(false);
  const [openRoleDropdown, setOpenRoleDropdown] = useState(false);

  const ROLE_OPTIONS = [
    { value: "EDITOR", label: "Editor", desc: "Can edit content & settings" },
    { value: "MANAGER", label: "Manager", desc: "Full management privileges" },
    { value: "VIEWER", label: "Viewer", desc: "Read-only access" },
  ] as const;

  const currentRole = ROLE_OPTIONS.find((r) => r.value === role) || ROLE_OPTIONS[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy(true);
    try {
      await inviteCollaborator(segment, contentId, email.trim(), role);
      toast.success(`Invited ${email.trim()}`);
      setEmail("");
      onAdded();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not invite collaborator");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-3 rounded-2xl border border-purple-200 bg-white p-4 shadow-sm relative">
      <input
        type="email"
        required
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter team member email..."
        className="min-w-[220px] flex-1 rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-purple-500 focus:bg-white"
      />

      {/* Custom Styled Role Dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpenRoleDropdown(!openRoleDropdown)}
          className="inline-flex items-center gap-2 rounded-xl border border-purple-300 bg-purple-50/60 px-3.5 py-2 text-xs font-extrabold text-purple-900 shadow-2xs hover:bg-purple-100/80 transition-all cursor-pointer min-w-[110px] justify-between"
        >
          <span>{currentRole.label}</span>
          <ChevronDown size={14} className={`text-purple-600 transition-transform duration-200 ${openRoleDropdown ? "rotate-180" : ""}`} />
        </button>

        {openRoleDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpenRoleDropdown(false)} />
            <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-purple-200 bg-white p-1.5 shadow-xl z-50 flex flex-col gap-1 animate-in fade-in-50 zoom-in-95">
              {ROLE_OPTIONS.map((opt) => {
                const isSelected = opt.value === role;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      setRole(opt.value);
                      setOpenRoleDropdown(false);
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? "bg-purple-100/80 text-purple-950 font-black"
                        : "hover:bg-purple-50/60 text-slate-700 font-bold"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="text-xs tracking-tight">{opt.label}</span>
                      <span className="text-[10px] font-medium text-slate-400">{opt.desc}</span>
                    </div>
                    {isSelected && <Check size={14} className="text-purple-600 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      <button
        type="submit"
        disabled={busy || !email.trim()}
        className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-black text-white hover:bg-purple-700 transition-colors disabled:opacity-60 cursor-pointer shadow-xs"
      >
        {busy ? "Inviting…" : "Send Invite"}
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer px-2"
      >
        Cancel
      </button>
    </form>
  );
}

export function CollaboratorsSection({
  segment,
  contentId,
  collaborators,
  unavailable,
  canManage,
  onChanged,
}: {
  segment: ContentTypeSegment;
  contentId: string;
  collaborators?: CollaboratorLite[];
  unavailable?: boolean;
  canManage?: boolean;
  onChanged?: () => void;
}) {
  const [adding, setAdding] = useState(false);

  if (unavailable) {
    return (
      <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
        <AlertTriangle size={14} /> Collaborators temporarily unavailable — try again shortly.
      </div>
    );
  }

  if (!collaborators || collaborators.length === 0) {
    if (adding) {
      return (
        <AddCollaboratorForm
          segment={segment}
          contentId={contentId}
          onAdded={() => {
            setAdding(false);
            onChanged?.();
          }}
          onCancel={() => setAdding(false)}
        />
      );
    }
    return (
      <EmptyState
        title="No collaborators added"
        description="Invite team members to manage or edit this content together."
        action={
          canManage ? (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white px-5 py-2.5 text-xs font-black tracking-wide shadow-md hover:opacity-95 transition-all cursor-pointer"
            >
              <Plus size={15} /> Add collaborator
            </button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 3D Offset Pastel Card for Collaborators Roster */}
      <div className="rounded-[24px] border-[1.5px] border-purple-400/80 bg-gradient-to-b from-purple-50/40 via-white to-white p-6 sm:p-7 shadow-[4px_-4px_0px_0px_#E9D5FF] flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-100/80 pb-4">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
              <Users size={18} className="text-purple-600" />
              Collaborators & Team Access
            </h3>
            <p className="text-xs font-semibold text-slate-500">
              Active team members with authoring and management privileges
            </p>
          </div>
          {canManage && !adding && (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 text-white px-4 py-2 text-xs font-black tracking-wide shadow-xs hover:bg-purple-700 transition-all cursor-pointer self-start sm:self-auto"
            >
              <Plus size={14} /> Add collaborator
            </button>
          )}
        </div>

        {adding && (
          <AddCollaboratorForm
            segment={segment}
            contentId={contentId}
            onAdded={() => {
              setAdding(false);
              onChanged?.();
            }}
            onCancel={() => setAdding(false)}
          />
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse table-fixed">
            <thead>
              <tr className="border-b border-purple-100 text-[10px] font-black uppercase tracking-wider text-purple-700">
                <th className="py-3 px-3 w-1/3 text-left">Team Member</th>
                <th className="py-3 px-3 w-1/3 text-center">Email Address</th>
                <th className="py-3 px-3 w-1/3 text-right">Assigned Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-50/80">
              {collaborators.map((c) => {
                const roleUpper = c.role?.toUpperCase() || "MEMBER";
                const roleBadgeStyle =
                  roleUpper === "OWNER" || roleUpper === "MANAGER"
                    ? "border-purple-200 bg-purple-100 text-purple-800"
                    : roleUpper === "EDITOR"
                    ? "border-blue-200 bg-blue-100 text-blue-800"
                    : "border-emerald-200 bg-emerald-100 text-emerald-800";

                return (
                  <tr key={c.userId} className="hover:bg-purple-50/40 transition-colors">
                    <td className="py-3.5 px-3 w-1/3 text-left">
                      <div className="flex items-center gap-3">
                        <div className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-900 text-white font-extrabold text-xs shadow-md ring-2 ring-white">
                          {c.name ? c.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <span className="font-extrabold text-slate-900 truncate tracking-tight">{c.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 w-1/3 text-center font-semibold text-slate-500">{c.email}</td>
                    <td className="py-3.5 px-3 w-1/3 text-right">
                      <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-2xs ${roleBadgeStyle}`}>
                        <Shield size={10} /> {c.role}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
