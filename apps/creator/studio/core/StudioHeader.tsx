"use client";

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Creator
 * Type: Shared Studio chrome
 *
 * Purpose:
 * The controls that sit on the right of the Studio top bar, shared by every content type.
 * ------------------------------------------------------------------
 */

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Copy, Menu, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/design-system/ui/dropdown-menu";
import type { ActiveCollaborator } from "../../editor/hooks/useArcadeEditor";

/**
 * These pieces were previously written inline in the course/event orchestrator, which is why the
 * exam editor — built later, against the same visual language — ended up with a header that looked
 * similar but shared no code with it, and so drifted: no presence, no share, no side panel.
 *
 * Extracting them makes "the Studio header" a real object every content type mounts rather than a
 * pattern each editor re-implements. What appears inside it still differs per content type (an
 * exam publishes, a course submits for review); the interaction model no longer can.
 */

// ── Presence ─────────────────────────────────────────────────────────────────

const PRESENCE_COLORS = ["#7c3aed", "#2563eb", "#059669", "#d97706"];

/** Overlapping avatars for everyone currently connected to this document, Google-Docs style. */
export function StudioPresenceStack({ collaborators }: { collaborators: ActiveCollaborator[] }) {
  const [popoverOpen, setPopoverOpen] = useState(false);

  const activeList = useMemo(() => {
    if (!collaborators || collaborators.length === 0) return [];
    // One entry per person, not per connection: the same user with two tabs open is one
    // collaborator, and showing them twice reads as a bug.
    const map = new Map<string, ActiveCollaborator>();
    for (const c of collaborators) {
      const key = c.user?.id || c.user?.name || String(c.clientId);
      if (!map.has(key)) map.set(key, c);
    }
    return Array.from(map.values());
  }, [collaborators]);

  if (activeList.length === 0) return null;

  const MAX_VISIBLE = 3;
  const visible = activeList.slice(0, MAX_VISIBLE);
  const overflowCount = activeList.length - MAX_VISIBLE;

  return (
    <div className="relative flex items-center">
      <div
        onClick={() => setPopoverOpen((prev) => !prev)}
        className="flex cursor-pointer items-center -space-x-2 transition-transform hover:scale-[1.02]"
        title="View live connected collaborators"
      >
        {visible.map((c, i) => {
          const name = c.user?.name || "Collaborator";
          const bgColor = c.user?.color || PRESENCE_COLORS[i % PRESENCE_COLORS.length];
          return (
            <div
              key={c.user?.id || c.clientId}
              title={`${name} (Editing now)`}
              style={{ backgroundColor: bgColor }}
              className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white shadow-sm ring-1 ring-black/5"
            >
              {name.charAt(0).toUpperCase()}
            </div>
          );
        })}

        {overflowCount > 0 && (
          <div
            title={`${overflowCount} more active collaborator${overflowCount > 1 ? "s" : ""}`}
            className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-700 text-xs font-semibold text-white shadow-sm ring-1 ring-black/5"
          >
            +{overflowCount}
          </div>
        )}
      </div>

      {popoverOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setPopoverOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-56 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl ring-1 ring-black/5">
            <div className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Collaborators ({activeList.length})
            </div>
            <div className="max-h-48 space-y-1.5 overflow-y-auto">
              {activeList.map((c, i) => {
                const name = c.user?.name || "Collaborator";
                const bgColor = c.user?.color || PRESENCE_COLORS[i % PRESENCE_COLORS.length];
                return (
                  <div
                    key={c.user?.id || c.clientId}
                    className="flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-slate-50"
                  >
                    <div
                      style={{ backgroundColor: bgColor }}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                    >
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-semibold text-slate-800">{name}</div>
                      <div className="flex items-center gap-1 text-[10px] font-medium text-emerald-600">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                        Editing now
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Share ────────────────────────────────────────────────────────────────────

/**
 * The Share split-pill: primary opens collaborators, the caret offers copy-link.
 *
 * <p>`onOpenCollaborators` is optional because not every content type has a per-item collaborator
 * list. Where it has none, the control still exists — the Studio header should not change shape
 * between content types — but it copies the link and says where access actually comes from,
 * rather than opening an invite dialog that posts to an endpoint the platform doesn't have.
 */
export function StudioShareControl({
  onOpenCollaborators,
  note,
}: {
  onOpenCollaborators?: () => void;
  /** Shown in the menu when there is no collaborator list, e.g. "Access is managed on the channel." */
  note?: string;
}) {
  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Editor link copied to clipboard!");
  };

  if (!onOpenCollaborators) {
    return (
      <div className="relative inline-flex items-center overflow-hidden rounded-full bg-[#c2e7ff] text-[#001d35] shadow-sm transition-all hover:bg-[#b5e0ff] hover:shadow-md">
        <button
          type="button"
          onClick={copyLink}
          className="flex cursor-pointer items-center gap-2 py-2.5 pl-4 pr-3 text-xs font-semibold tracking-tight text-[#001d35]"
          title={note ?? "Copy a link to this editor"}
        >
          <Copy size={15} className="text-[#001d35]" />
          <span>Share</span>
        </button>
        {note && (
          <>
            <div className="h-4 w-[1px] bg-white/90" />
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div
                  className="flex cursor-pointer items-center justify-center py-2.5 pl-2 pr-3 text-xs text-[#001d35] transition-colors hover:bg-[#a6d9ff]"
                  title="Share options"
                >
                  <ChevronDown size={14} />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="z-50 w-64 rounded-xl border border-slate-100 bg-white p-2 shadow-lg"
              >
                <p className="px-2 py-1.5 text-[11px] leading-relaxed text-slate-500">{note}</p>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="relative inline-flex items-center overflow-hidden rounded-full bg-[#c2e7ff] text-[#001d35] shadow-sm transition-all hover:bg-[#b5e0ff] hover:shadow-md">
      <button
        type="button"
        onClick={onOpenCollaborators}
        className="flex cursor-pointer items-center gap-2 py-2.5 pl-4 pr-3 text-xs font-semibold tracking-tight text-[#001d35] transition-colors"
        title="Add Collaborators"
      >
        <Users size={15} className="text-[#001d35]" />
        <span>Share</span>
      </button>
      <div className="h-4 w-[1px] bg-white/90" />
      <DropdownMenu>
        <DropdownMenuTrigger>
          <div
            className="flex cursor-pointer items-center justify-center py-2.5 pl-2 pr-3 text-xs text-[#001d35] transition-colors hover:bg-[#a6d9ff]"
            title="Share options"
          >
            <ChevronDown size={14} />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="z-50 w-52 rounded-xl border border-slate-100 bg-white p-1.5 shadow-lg"
        >
          <DropdownMenuItem
            onClick={onOpenCollaborators}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Users size={14} className="text-indigo-600" />
            View Collaborators
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Editor link copied to clipboard!");
            }}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <Copy size={14} className="text-slate-500" />
            Copy Link
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ── Panel toggle ─────────────────────────────────────────────────────────────

/** Single entry point into the Studio right-hand panel (Status / History / Team). */
export function StudioPanelToggle({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={open ? "Close panel" : "Open panel"}
      aria-expanded={open}
      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border shadow-sm transition-all duration-300 ease-in-out ${
        open
          ? "border-[#14142b] bg-[#14142b] text-white"
          : "border-white/40 bg-white/60 text-[#14142b] backdrop-blur-md hover:border-[#14142b] hover:bg-[#14142b] hover:text-white"
      }`}
    >
      <Menu size={16} />
    </button>
  );
}

// ── Primary / secondary actions ──────────────────────────────────────────────

/**
 * The Studio's top-bar action button. Every content type's primary action (Submit for a course,
 * Publish for an exam) is this same control, so the header never varies in weight or geometry
 * between content types — only in what it says.
 */
export function StudioActionButton({
  onClick,
  disabled,
  title,
  icon,
  label,
  tone = "default",
}: {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  icon: ReactNode;
  label: string;
  /** "primary" fills the button — reserve it for the single most important action on screen. */
  tone?: "default" | "primary";
}) {
  const base =
    "flex h-10 flex-shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-5 py-2 text-sm font-bold shadow-sm transition-all duration-300 ease-in-out disabled:cursor-not-allowed disabled:opacity-50";
  const toneClass =
    tone === "primary"
      ? "border border-[#14142b] bg-[#14142b] text-white hover:bg-black hover:shadow-md"
      : "border border-white/40 bg-white/60 text-[#14142b] backdrop-blur-md hover:border-[#14142b] hover:bg-[#14142b] hover:text-white hover:shadow-md";

  return (
    <button type="button" onClick={onClick} disabled={disabled} title={title} className={`${base} ${toneClass}`}>
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

/** Icon-only variant of {@link StudioActionButton}, for secondary header actions. */
export function StudioIconAction({
  onClick,
  title,
  active,
  children,
}: {
  onClick: () => void;
  title: string;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border shadow-sm transition-colors ${
        active
          ? "border-[#14142b] bg-[#14142b] text-white"
          : "border-white/40 bg-white/60 text-slate-600 hover:bg-white hover:text-[#14142b]"
      }`}
    >
      {children}
    </button>
  );
}
