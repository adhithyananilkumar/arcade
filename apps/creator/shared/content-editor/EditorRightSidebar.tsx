"use client";

/**
 * Floating right-side panel for the editor chrome — status history and
 * real-time collaboration, switched by a pill-shaped tab control. Replaces
 * what used to be two disconnected surfaces (a full-bleed edge-to-edge modal
 * for status history, a plain popover for collaborators) with one glass
 * panel that matches the floating toolbar / title-pill language used
 * elsewhere in this chrome (translucent white, blurred, soft border, no hard
 * edges) instead of a flat, screen-docked modal.
 *
 * Pure presentational component — all data loading and mutation happen in
 * SharedContentEditorOrchestrator; this only renders what it's given.
 */

import { useEffect, useState } from "react";
import {
  History,
  MessageSquare,
  Users,
  UserPlus,
  CheckCircle,
  XCircle,
  Send,
  AlertCircle,
  RefreshCw,
  Trash2,
  MoreVertical,
  User,
  Shield,
} from "lucide-react";
import type { ContentStatusHistoryResponse } from "@/domains/publishing/components/VersionHistoryPanel";
import type { Collaborator } from "@/app/(authenticated)/studio/events/api/collaboration";
import type { CollabStatus, ActiveCollaborator } from "../../editor/hooks/useArcadeEditor";

function timeAgo(dateString: string) {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return `${Math.floor(interval)}y ago`;
  interval = seconds / 2592000;
  if (interval > 1) return `${Math.floor(interval)}mo ago`;
  interval = seconds / 86400;
  if (interval > 1) return `${Math.floor(interval)}d ago`;
  interval = seconds / 3600;
  if (interval > 1) return `${Math.floor(interval)}h ago`;
  interval = seconds / 60;
  if (interval > 1) return `${Math.floor(interval)}m ago`;
  return `${Math.floor(seconds)}s ago`;
}

function statusIcon(label: string) {
  const l = label.toLowerCase();
  if (l.startsWith("approved")) return <CheckCircle className="text-emerald-500" size={18} />;
  if (l.startsWith("rejected")) return <XCircle className="text-rose-500" size={18} />;
  if (l.startsWith("submitted")) return <Send className="text-blue-500" size={18} />;
  return <AlertCircle className="text-slate-400" size={18} />;
}

export type RightSidebarTab = "status" | "collab" | "history";

/**
 * A panel contributed by whichever editor is currently active (Badge's Design/
 * Properties/Layers, and eventually others) — plugs into this same shell/tab-bar
 * alongside the always-present workflow tabs (Status/History/Team), rather than
 * each editor building its own separate sidebar. See BadgeDesignPanel etc. in
 * domains/badges for the current consumer.
 */
export interface SidebarExtraPanel {
  id: string;
  label: string;
  icon: typeof History;
  content: React.ReactNode;
}

interface EditorRightSidebarProps {
  open: boolean;
  tab: string;
  onTabChange: (tab: string) => void;
  onClose: () => void;

  statusHistory: ContentStatusHistoryResponse[];
  statusHistoryLoading: boolean;
  statusHistoryError: string | null;
  onRetryStatusHistory: () => void;

  // The version-history tab's whole body — built by the orchestrator as an
  // embedded <VersionHistoryOrchestrator embedded /> so this component stays
  // presentational (it doesn't own that data-fetching/restore flow).
  historyContent: React.ReactNode;

  activeLessonId: string | null;
  collabState: { status: CollabStatus; collaborators: ActiveCollaborator[] };
  eventCollaborators: Collaborator[];
  loadingCollaborators: boolean;
  showAddForm: boolean;
  onShowAddFormChange: (v: boolean) => void;
  inviteEmail: string;
  onInviteEmailChange: (v: string) => void;
  inviteRole: "EDITOR" | "MANAGER" | "VIEWER";
  onInviteRoleChange: (v: "EDITOR" | "MANAGER" | "VIEWER") => void;
  userSearchResults: Array<{ id: string; label: string; avatarUrl: string | null }>;
  inviting: boolean;
  onAddCollaborator: (email?: string) => void;
  onRemoveCollaborator: (userId: string, name: string) => void;

  /** Extra tabs contributed by the active non-lesson editor (e.g. Badge's Design/Properties/Layers). */
  extraPanels?: SidebarExtraPanel[];
  /** Overrides the footer's "Document ID" row — e.g. a Badge ID instead of a lesson ID. */
  footerOverride?: { label: string; value: string } | null;
}

const BASE_TABS: { id: RightSidebarTab; label: string; icon: typeof History }[] = [
  { id: "status", label: "Status", icon: MessageSquare },
  { id: "history", label: "History", icon: History },
  { id: "collab", label: "Team", icon: Users },
];

export function EditorRightSidebar(props: EditorRightSidebarProps) {
  const { open, tab, onTabChange, onClose, extraPanels } = props;
  const TABS = [...BASE_TABS, ...(extraPanels ?? [])];
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Close menu when clicking anywhere outside
  useEffect(() => {
    if (!openMenuId) return;
    const handler = () => setOpenMenuId(null);
    window.addEventListener("click", handler);
    return () => window.removeEventListener("click", handler);
  }, [openMenuId]);

  // No visible close button — the hamburger button that opens this panel is
  // the toggle that closes it too — but Escape should still dismiss it.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="pointer-events-auto fixed right-4 top-20 bottom-4 z-[65] flex w-[340px] flex-col rounded-3xl border border-white/40 bg-white/70 shadow-xl backdrop-blur-xl">
      {/* Pill tab switcher — same rounded-full language as the toolbar's own
          controls. No close button here: the hamburger button that opened
          this panel (in the top bar) is the single toggle that closes it too. */}
      <div className="flex items-center gap-1.5 p-3">
        <div className="flex flex-1 items-center gap-1 rounded-full border border-white/40 bg-white/60 p-1">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                tab === id
                  ? "bg-[#14142b] text-white shadow-sm"
                  : "text-slate-500 hover:text-[#14142b]"
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div
        className={
          tab === "history"
            ? "flex min-h-0 flex-1 flex-col" // embedded panel owns its own internal scroll regions
            : "min-h-0 flex-1 overflow-y-auto px-4 pb-4"
        }
      >
        {tab === "history" ? (
          props.historyContent
        ) : tab !== "status" && tab !== "collab" ? (
          extraPanels?.find((p) => p.id === tab)?.content
        ) : tab === "status" ? (
          props.statusHistoryLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
              <RefreshCw className="h-6 w-6 animate-spin text-slate-300" />
              <p className="text-xs">Loading history…</p>
            </div>
          ) : props.statusHistoryError ? (
            <div className="rounded-2xl border border-rose-200/70 bg-rose-50/70 p-3 text-xs text-rose-600">
              {props.statusHistoryError}
              <button
                type="button"
                onClick={props.onRetryStatusHistory}
                className="mt-2 block font-semibold underline"
              >
                Retry
              </button>
            </div>
          ) : props.statusHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2.5 py-16 text-center">
              <span className="grid size-12 place-items-center rounded-2xl bg-white/60 border border-white/40">
                <AlertCircle className="h-6 w-6 text-slate-300" />
              </span>
              <p className="text-sm font-semibold text-[#14142b]">No status history yet</p>
              <p className="max-w-[200px] text-xs text-slate-400">
                Submits, approvals, and rejections will show up here.
              </p>
            </div>
          ) : (
            <div className="relative ml-2.5 space-y-6 border-l-2 border-white/60 pt-2">
              {props.statusHistory.map((event, idx) => (
                <div key={idx} className="relative pl-5">
                  <div className="absolute -left-[10px] top-0.5 rounded-full bg-white/90 p-0.5">
                    {statusIcon(event.label)}
                  </div>
                  <span className="text-sm font-semibold text-[#14142b]">
                    {event.label.split(":")[0]}
                  </span>
                  {event.label.includes(":") && (
                    <p className="mt-1 rounded-xl border border-white/50 bg-white/50 p-2 text-xs italic text-slate-600">
                      &quot;{event.label.substring(event.label.indexOf(":") + 1).trim()}&quot;
                    </p>
                  )}
                  <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="font-medium text-slate-500">{event.actorName}</span>
                    <span>·</span>
                    <span>{timeAgo(event.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Active now
              </span>
              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  props.collabState.status === "connected"
                    ? "bg-emerald-50 text-emerald-600"
                    : props.collabState.status === "connecting"
                      ? "bg-amber-50 text-amber-600"
                      : "bg-slate-100 text-slate-500"
                }`}
              >
                {props.collabState.status}
              </span>
            </div>
            {props.collabState.collaborators.length === 0 ? (
              <p className="text-xs italic text-slate-400">No other active editors</p>
            ) : (
              <div className="space-y-1.5">
                {props.collabState.collaborators.map((c) => (
                  <div
                    key={c.clientId}
                    className="flex items-center justify-between rounded-xl border border-emerald-100/70 bg-emerald-50/50 p-2 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-sm"
                        style={{ backgroundColor: c.user?.color || "#10b981" }}
                      >
                        {(c.user?.name || "A")[0].toUpperCase()}
                      </div>
                      <span className="font-semibold text-slate-800">
                        {c.user?.name || `User ${c.clientId}`}
                      </span>
                    </div>
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" title="Editing now" />
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-2 border-t border-white/50 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Collaborators ({props.eventCollaborators.length})
                </span>
                <button
                  type="button"
                  onClick={() => props.onShowAddFormChange(!props.showAddForm)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  <UserPlus size={13} />
                  Add
                </button>
              </div>

              {props.showAddForm && (
                <div className="space-y-2 rounded-xl border border-white/50 bg-white/60 p-2.5 text-xs">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="User email or name…"
                      value={props.inviteEmail}
                      onChange={(e) => props.onInviteEmailChange(e.target.value)}
                      className="w-full rounded-lg border border-white/60 bg-white/80 px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                    />
                    {props.userSearchResults.length > 0 && (
                      <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-36 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                        {props.userSearchResults.map((u) => (
                          <button
                            key={u.id}
                            type="button"
                            onClick={() => props.onInviteEmailChange(u.label)}
                            className="w-full px-2.5 py-1.5 text-left text-xs font-medium text-slate-800 hover:bg-indigo-50"
                          >
                            {u.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <select
                      value={props.inviteRole}
                      onChange={(e) => props.onInviteRoleChange(e.target.value as "EDITOR" | "MANAGER" | "VIEWER")}
                      className="rounded-lg border border-white/60 bg-white/80 px-2 py-1 text-xs font-medium text-slate-700 focus:outline-none"
                    >
                      <option value="EDITOR">Editor</option>
                      <option value="MANAGER">Manager</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => props.onShowAddFormChange(false)}
                        className="px-2 py-1 text-xs text-slate-500 hover:text-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={props.inviting || !props.inviteEmail.trim()}
                        onClick={() => props.onAddCollaborator()}
                        className="rounded-lg bg-[#14142b] px-3 py-1 text-xs font-semibold text-white hover:bg-[#232735] disabled:opacity-50"
                      >
                        {props.inviting ? "Adding…" : "Add"}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {props.loadingCollaborators ? (
                <p className="py-1 text-xs text-slate-400">Loading collaborators…</p>
              ) : props.eventCollaborators.length === 0 ? (
                <p className="py-1 text-xs italic text-slate-400">No collaborators added</p>
              ) : (
                <div className="space-y-1.5">
                  {props.eventCollaborators.map((member) => (
                    <div
                      key={member.userId}
                      className="flex items-center justify-between rounded-xl border border-white/50 bg-white/50 p-2 text-xs"
                    >
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-600">
                          {(member.name || member.email || "U")[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-800">{member.name || member.email}</p>
                          <p className="truncate text-[10px] text-slate-400">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-0.5">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                            member.role === "OWNER"
                              ? "bg-purple-100 text-purple-700"
                              : member.role === "MANAGER"
                                ? "bg-blue-100 text-blue-700"
                                : member.role === "EDITOR"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {member.role}
                        </span>
                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenMenuId(openMenuId === member.userId ? null : member.userId);
                              }}
                              className="rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                              title="More actions"
                            >
                              <MoreVertical size={14} />
                            </button>
                            {openMenuId === member.userId && (
                              <div className="absolute right-0 top-full mt-1 w-36 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg z-50">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenMenuId(null);
                                    // TODO: Implement View Profile
                                  }}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 transition-colors hover:bg-slate-50"
                                >
                                  <User size={13} />
                                  View Profile
                                </button>
                                {member.role === "OWNER" ? (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenMenuId(null);
                                      // TODO: Implement Transfer Ownership
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-purple-700 transition-colors hover:bg-purple-50 border-t border-slate-100"
                                  >
                                    <Shield size={13} />
                                    Transfer Ownership
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenMenuId(null);
                                      props.onRemoveCollaborator(member.userId, member.name || member.email);
                                    }}
                                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-rose-600 transition-colors hover:bg-rose-50 border-t border-slate-100"
                                  >
                                    <Trash2 size={13} />
                                    Remove
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer: Document ID */}
      <div className="mt-auto px-4 pb-4">
        <div className="flex items-center justify-between border-t border-white/50 pt-3 text-[11px] text-slate-400">
          <span>{props.footerOverride?.label ?? "Document ID"}</span>
          <span className="max-w-[140px] truncate rounded bg-white/60 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
            {props.footerOverride?.value ?? (props.activeLessonId ? `lesson:${props.activeLessonId}` : "None")}
          </span>
        </div>
      </div>
    </div>
  );
}
