"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Users, Plus, AlertTriangle, Shield, ChevronDown, Check, ShieldCheck, Mail, Crown } from "lucide-react";
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
    { value: "EDITOR", label: "Editor", desc: "Can edit content, modules & resources" },
    { value: "MANAGER", label: "Manager", desc: "Full management & publishing privileges" },
    { value: "VIEWER", label: "Viewer", desc: "Read-only preview & review access" },
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
    <form
      onSubmit={handleSubmit}
      className="p-5 sm:p-6 rounded-2xl border border-purple-200/90 dark:border-purple-900/50 bg-gradient-to-r from-purple-50/30 via-white to-white dark:from-purple-950/20 dark:via-neutral-900 dark:to-neutral-900 shadow-2xs transition-all w-full flex flex-col gap-4"
    >
      {/* Form Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-2xl bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 flex items-center justify-center shadow-2xs">
            <Mail size={16} />
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              New Collaborator
            </span>
            <span className="text-[11px] text-slate-500 dark:text-neutral-400">
              Send an invite to grant workspace and editorial access
            </span>
          </div>
        </div>

        {/* Role Selector */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setOpenRoleDropdown(!openRoleDropdown)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/90 dark:border-neutral-700 bg-white dark:bg-neutral-850 px-3.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-neutral-200 shadow-2xs hover:bg-slate-50 dark:hover:bg-neutral-800 transition-all cursor-pointer min-w-[110px] justify-between"
          >
            <span>{currentRole.label}</span>
            <ChevronDown
              size={12}
              className={`text-slate-400 transition-transform duration-200 ${
                openRoleDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {openRoleDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpenRoleDropdown(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-60 rounded-2xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-1.5 shadow-xl z-50 flex flex-col gap-1">
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
                      className={`flex items-start justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-purple-50 dark:bg-purple-950/50 text-purple-900 dark:text-purple-200 font-semibold"
                          : "hover:bg-slate-50 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-300 font-medium"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold">{opt.label}</span>
                        <span className="text-[10px] text-slate-400 dark:text-neutral-500 mt-0.5">
                          {opt.desc}
                        </span>
                      </div>
                      {isSelected && (
                        <Check size={13} className="text-purple-600 dark:text-purple-400 shrink-0 mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Email input filling full width */}
      <div className="relative w-full">
        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 dark:text-neutral-500" />
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="colleague@example.com"
          className="w-full rounded-xl border border-purple-300 dark:border-purple-800/80 bg-white dark:bg-neutral-850 pl-10 pr-4 py-2.5 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/15 transition-all shadow-2xs"
        />
      </div>

      {/* Bottom Action Row */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-slate-400 dark:text-neutral-500 hidden sm:inline-block">
          Invited members will receive an email notification with access instructions
        </span>
        <div className="flex items-center gap-2.5 ml-auto">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-neutral-400 dark:hover:text-white cursor-pointer px-3.5 py-2 rounded-xl hover:bg-slate-100/70 dark:hover:bg-neutral-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || !email.trim()}
            className="rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-neutral-100 px-5 py-2 text-xs font-semibold shadow-2xs transition-all disabled:opacity-50 cursor-pointer active:scale-[0.98]"
          >
            {busy ? "Inviting…" : "Invite"}
          </button>
        </div>
      </div>
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
      <div className="flex items-center gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-800 dark:bg-amber-950/40 dark:border-amber-900/60 dark:text-amber-300">
        <AlertTriangle size={15} className="shrink-0" />
        <span>Collaborators temporarily unavailable — please try again shortly.</span>
      </div>
    );
  }

  const hasCollaborators = collaborators && collaborators.length > 0;

  if (!hasCollaborators && !adding) {
    return (
      <EmptyState
        title="No collaborators added"
        description="Invite team members to manage or edit this content together."
        action={
          canManage ? (
            <button
              type="button"
              onClick={() => setAdding(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-neutral-900 px-4 py-2.5 text-xs font-semibold shadow-2xs hover:bg-slate-800 dark:hover:bg-neutral-100 transition-all cursor-pointer active:scale-[0.98]"
            >
              <Plus size={14} /> Add collaborator
            </button>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="size-10 shrink-0 flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-950/60 dark:to-indigo-950/60 border border-purple-200/80 dark:border-purple-800/40 text-purple-700 dark:text-purple-300 shadow-2xs">
            <Users size={18} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-sm font-bold text-slate-900 dark:text-neutral-100 tracking-tight">
              Collaborators & Team Access
            </h3>
            <p className="text-xs text-slate-500 dark:text-neutral-400">
              Active team members with authoring and management privileges
            </p>
          </div>
        </div>

        {canManage && !adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-neutral-900 px-3.5 py-2 text-xs font-semibold shadow-2xs hover:bg-slate-800 dark:hover:bg-neutral-100 transition-all cursor-pointer self-start sm:self-auto active:scale-[0.98]"
          >
            <Plus size={14} />
            <span>Add collaborator</span>
          </button>
        )}
      </div>

      {/* Full-width Invite Form spanning across the entire top container */}
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

      {/* ── Collaborators List below it as full-width floating row tiles ── */}
      {hasCollaborators ? (
        <div className="flex flex-col gap-2.5 w-full">
          {collaborators.map((c, idx) => {
            const roleUpper = c.role?.toUpperCase() || "MEMBER";
            const isOwner = roleUpper === "OWNER";
            const isManager = roleUpper === "MANAGER";
            const isEditor = roleUpper === "EDITOR";

            const collaboratorRowThemes = [
              "border-purple-200/80 hover:border-purple-400 bg-gradient-to-r from-purple-50/25 via-white to-white dark:from-purple-950/15 dark:via-neutral-900 dark:to-neutral-900",
              "border-indigo-200/80 hover:border-indigo-400 bg-gradient-to-r from-indigo-50/25 via-white to-white dark:from-indigo-950/15 dark:via-neutral-900 dark:to-neutral-900",
              "border-blue-200/80 hover:border-blue-400 bg-gradient-to-r from-blue-50/25 via-white to-white dark:from-blue-950/15 dark:via-neutral-900 dark:to-neutral-900",
            ];

            const avatarBgs = [
              "bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300",
              "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/70 dark:text-indigo-300",
              "bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300",
            ];

            const theme = collaboratorRowThemes[idx % collaboratorRowThemes.length];
            const avatarBg = avatarBgs[idx % avatarBgs.length];

            return (
              <div
                key={c.userId || idx}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border ${theme} shadow-2xs hover:shadow-xs transition-all group w-full`}
              >
                {/* Left: Avatar & Member Info */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`size-10 rounded-2xl ${avatarBg} font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}
                  >
                    {c.name ? c.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-neutral-100 truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {c.name}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-neutral-400 truncate">
                      {c.email}
                    </span>
                  </div>
                </div>

                {/* Right: Assigned Role Badge */}
                <div className="flex items-center gap-3 self-end sm:self-auto">
                  {isOwner ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 shadow-2xs">
                      <Crown size={12} className="text-purple-600 dark:text-purple-400" />
                      <span>OWNER</span>
                    </span>
                  ) : isManager ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs">
                      <Shield size={12} className="text-indigo-600 dark:text-indigo-400" />
                      <span>MANAGER</span>
                    </span>
                  ) : isEditor ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60 shadow-2xs">
                      <ShieldCheck size={12} className="text-sky-600 dark:text-sky-400" />
                      <span>EDITOR</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-neutral-800 dark:text-neutral-300 border border-slate-200/80 dark:border-neutral-700 shadow-2xs">
                      <span>{c.role || "MEMBER"}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : adding ? (
        <div className="p-6 rounded-2xl border border-dashed border-slate-200 dark:border-neutral-800 text-center flex flex-col items-center justify-center gap-1.5 w-full">
          <Users size={20} className="text-slate-400 dark:text-neutral-500 mb-1" />
          <p className="text-xs font-semibold text-slate-700 dark:text-neutral-300">
            No other team members yet
          </p>
          <p className="text-[11px] text-slate-400 dark:text-neutral-500">
            Send an invitation above to add collaborators to this course list.
          </p>
        </div>
      ) : null}

      {/* Summary Footer */}
      {hasCollaborators && (
        <div className="flex items-center justify-between px-1 text-xs pt-1">
          <span className="text-slate-500 dark:text-neutral-400 font-medium text-[11px]">
            <strong className="text-slate-900 dark:text-neutral-100 font-semibold">{collaborators.length}</strong> active {collaborators.length === 1 ? "team member" : "team members"}
          </span>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-neutral-400">
            <ShieldCheck size={13} className="text-emerald-500" />
            <span>Synced permissions</span>
          </div>
        </div>
      )}
    </div>
  );
}
