"use client";

import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import {
  StudioActionButton,
  StudioPanelToggle,
  StudioPresenceStack,
  StudioSaveStatus,
  StudioShareControl,
  type StudioSaveState,
} from "./StudioHeader";
import type { ActiveCollaborator } from "../../editor/hooks/useArcadeEditor";

/**
 * The Studio editor chrome — the frame every full-screen authoring surface in Studio sits in:
 * ambient background, floating top bar (logo · back · centered breadcrumb · actions), the
 * floating left structure sidebar, and the canvas column.
 *
 * Extracted from ContentEditorRuntime so a second authoring surface (the exam editor)
 * is literally the same chrome rather than a look-alike copy of it. Deliberately compound
 * (Frame / TopBar / Body) rather than one component with a dozen slot props: the pieces then sit
 * in the same source order as the markup they replaced, so adopting it is a wrap, not a rewrite.
 *
 * These components own geometry and styling only. What the tree contains, what the canvas edits
 * and which actions exist stay with each editor.
 */

export function StudioEditorFrame({ children }: { children: ReactNode }) {
  return (
    // `fixed inset-0` rather than `h-screen` — a height utility still lets this box
    // contribute to the document's scrollable area if any ancestor's height
    // resolution is off (e.g. the immersive-route check in LearnerShell misses this
    // path), which is what produced the page-wide scrollbar on top of the canvas's
    // own. Taking it out of flow entirely removes that possibility outright: the
    // canvas's `overflow-y-auto` below is the only scroll container left.
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[#fafafa]">
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -left-[10%] -top-[20%] h-[70%] w-[50%] animate-pulse rounded-full bg-indigo-500/15 blur-[120px] duration-10000" />
        <div className="absolute -right-[10%] top-[10%] h-[60%] w-[45%] animate-pulse rounded-full bg-rose-500/15 blur-[120px] duration-7000" />
        <div className="absolute -bottom-[20%] left-[20%] h-[60%] w-[60%] animate-pulse rounded-full bg-emerald-500/15 blur-[120px] duration-10000" />
      </div>
      {children}
    </div>
  );
}

/** Configures the Studio-owned Share control; omit (or pass `null`) to hide Share entirely. */
export interface StudioShareConfig {
  onOpenCollaborators?: () => void;
  note?: string;
}

/**
 * Configures the Studio-owned primary action button; the workspace supplies the business
 * operation (what "Submit"/"Publish" actually does) and its label/icon, never the button
 * implementation itself. Omit (or pass `null`) to hide the primary action (e.g. Course already
 * submitted, or a read-only Exam).
 */
export interface StudioPrimaryAction {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
  title?: string;
}

export function StudioEditorTopBar({
  onBack,
  backDisabled,
  backTitle = "Save and return to Content Studio",
  breadcrumb,
  saveState,
  collaborators = [],
  share,
  panelOpen,
  onTogglePanel,
  workspaceActionsBefore,
  primaryAction,
  workspaceActionsAfter,
}: {
  onBack: () => void;
  backDisabled?: boolean;
  backTitle?: string;
  /** Contents of the centered pill — a breadcrumb, or the content title when nothing is open. */
  breadcrumb: ReactNode;
  /**
   * The Studio-owned save-state pill. Omit entirely for a workspace whose save status doesn't
   * belong in the header (Course/Event show it in-canvas instead, via `SaveStatusFooter`) — never
   * render a workspace's own save-status component here instead.
   */
  saveState?: StudioSaveState;
  /** Feeds the Studio-owned presence stack. Defaults to none. */
  collaborators?: ActiveCollaborator[];
  /** Configures the Studio-owned Share control. Omit/`null` to hide Share for this render. */
  share?: StudioShareConfig | null;
  /** Whether the Studio right panel is open — feeds the Studio-owned panel toggle. */
  panelOpen: boolean;
  onTogglePanel: () => void;
  /**
   * Genuinely workspace-specific actions with no Studio-owned equivalent (Event's Day Settings
   * icon, rendered before the primary action). Never a replacement for Share/Save/History/
   * Collaboration/Panel/primary-action — those are dedicated props above, not part of this slot,
   * so a workspace cannot inject a second implementation of any of them here even by accident.
   */
  workspaceActionsBefore?: ReactNode;
  /** Configures the Studio-owned primary action button. Omit/`null` to hide it for this render. */
  primaryAction?: StudioPrimaryAction | null;
  /** Genuinely workspace-specific actions rendered after the primary action (Event's Manage button). */
  workspaceActionsAfter?: ReactNode;
}) {
  return (
    <div className="absolute inset-x-0 top-4 z-30 pointer-events-none flex justify-center px-4 sm:px-6">
      <div className="relative flex w-full items-center justify-between">
        {/* Left: Logo & Back Button */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="flex h-10 shrink-0 items-center rounded-full px-5 bg-white/60 shadow-sm border border-white/40 backdrop-blur-md">
            <Link href="/" className="group flex cursor-pointer items-center">
              <Image
                src="/arcade.svg"
                alt="Arcade"
                width={85}
                height={24}
                className="h-5 w-auto transition-transform duration-200 group-hover:scale-[1.02]"
              />
            </Link>
          </div>

          <button
            type="button"
            onClick={onBack}
            disabled={backDisabled}
            title={backTitle}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-white/40 bg-white/60 text-[#14142b] shadow-sm transition-all duration-300 hover:bg-white hover:shadow-md disabled:opacity-60 backdrop-blur-md"
          >
            <ArrowLeft size={16} />
          </button>
        </div>

        {/* Center: breadcrumb / title pill */}
        <div className="pointer-events-auto absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
          <div className="flex h-8 items-center justify-center rounded-full border border-white/40 bg-white/60 px-4 py-1 text-xs font-bold tracking-tight text-[#14142b] shadow-sm backdrop-blur-md">
            {breadcrumb}
          </div>
        </div>

        {/*
         * Right actions — every shared control below is rendered by Studio Core itself, from
         * plain data props, never from a ReactNode a workspace could use to substitute its own
         * implementation. `workspaceActionsBefore`/`workspaceActionsAfter` are the only slots a
         * workspace actually fills, and they sit alongside these, never in place of them.
         */}
        <div className="pointer-events-auto flex flex-shrink-0 items-center justify-end gap-3.5">
          {saveState && <StudioSaveStatus state={saveState} />}
          <StudioPresenceStack collaborators={collaborators} />
          {share && <StudioShareControl onOpenCollaborators={share.onOpenCollaborators} note={share.note} />}
          <StudioPanelToggle open={panelOpen} onToggle={onTogglePanel} />
          {workspaceActionsBefore}
          {primaryAction && (
            <StudioActionButton
              onClick={primaryAction.onClick}
              disabled={primaryAction.disabled}
              title={primaryAction.title}
              icon={primaryAction.icon}
              label={primaryAction.label}
            />
          )}
          {workspaceActionsAfter}
        </div>
      </div>
    </div>
  );
}

export function StudioEditorBody({
  sidebarTitle,
  sidebarTree,
  sidebarActions,
  toolbarClearance = true,
  children,
}: {
  /** Sidebar heading, e.g. "Course structure" / "Question bank". */
  sidebarTitle: string;
  sidebarTree: ReactNode;
  /** Pinned bottom actions in the sidebar (Add Module, Add Exam …). */
  sidebarActions?: ReactNode;
  /**
   * Whether the canvas this render mounts ArcadeEditor's own floating toolbar (portalled to
   * `top-[70px]`, see FloatingToolbar). When it does, the canvas needs extra top clearance so its
   * content doesn't start underneath that toolbar; when it doesn't (a list, an empty state, a
   * settings panel), the canvas only needs to clear the Studio top bar itself.
   *
   * This is the ONE legitimate reason a workspace's top offset varies — never a reason to
   * hand-derive or override the offset itself. Defaults to `true` (every render clears the
   * toolbar), matching every editor's steady-state; pass `false` only for a render you know
   * mounts no editor.
   */
  toolbarClearance?: boolean;
  /** The canvas column. */
  children: ReactNode;
}) {
  return (
    <div className="relative min-h-0 flex-1 flex flex-col pt-36">
      {/* ── Floating sidebar: content structure ─────────── */}
      <aside className="absolute left-10 top-28 z-20 flex flex-col h-[calc(100vh-14rem)] w-[268px] pointer-events-none">
        <div className="pointer-events-auto flex flex-col w-full h-full overflow-hidden">
          {/* ── Sidebar header ───────────────── */}
          <div className="flex flex-shrink-0 items-center justify-between mb-3">
            <span className="min-w-0 flex-1 truncate px-1 text-[11px] font-bold uppercase tracking-[0.15em] text-[#14142b]/60">
              {sidebarTitle}
            </span>
          </div>

          {/* ── Body ──────────────────────────────── */}
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-4 pr-1 arcade-scrollbar-mini">
            {sidebarTree}
          </div>

          {/* ── Sidebar actions (pinned at the bottom) ───────────────── */}
          {sidebarActions}
        </div>
      </aside>

      {/*
       * ── Canvas viewport: the ONE header-safe, ONE scroll-owning region every workspace's
       * content renders into.
       *
       * This element — not each workspace — owns:
       *   1. Top clearance under the floating top bar (and, when `toolbarClearance`, the
       *      floating rich-text toolbar too).
       *   2. The scroll container: `overflow-y-auto` lives HERE, on the same element as the
       *      padding, so padding can never end up inside a differently-scrolled child and get
       *      scrolled away — which is exactly how content previously ended up rendering behind
       *      the header (padding and `overflow-y-auto` were split across two different elements,
       *      or combined on one element in an order-dependent way, per workspace).
       *   3. Horizontal centering, so a workspace only has to declare its own `max-w-[Npx]`.
       *
       * A workspace MAY still nest its own scroll container inside this (e.g. a bordered "page"
       * card whose own edge is the visible scrollbar, as the lesson editor does) — that's a
       * legitimate visual choice about where the scrollbar appears, not a second owner of the
       * safe area. Wherever the actual scrolling ends up happening, content can never start above
       * this element's own padding, because that padding is never delegated away.
       */}
      <main
        className={`z-0 flex flex-col min-h-0 absolute inset-0 items-center overflow-y-auto px-6 pb-6 sm:px-12 arcade-scrollbar-mini ${
          toolbarClearance ? "pt-36" : "pt-28"
        }`}
      >
        {children}
      </main>
    </div>
  );
}

// ── Shared tree/canvas styling ────────────────────────────────────────────────
// So a second editor's structure sidebar is the same object as the course editor's, not a
// visual approximation of it.

export const TREE_CONTAINER_ROW_CLASS =
  "group flex items-center gap-2 rounded-2xl border border-white/40 bg-white/60 backdrop-blur-md px-3 py-2 shadow-sm transition-all hover:border-white/60 hover:bg-white/80";

export const TREE_SIDEBAR_BUTTON_CLASS =
  "flex w-full items-center justify-center gap-2 rounded-2xl border border-white/40 bg-white/70 px-4 py-2.5 text-xs font-bold text-[#14142b] shadow-sm backdrop-blur-md transition-all hover:bg-white/90 hover:shadow disabled:opacity-60";

export const TREE_SIDEBAR_ACTIONS_CLASS =
  "flex shrink-0 flex-col gap-2 mt-auto pt-4 pb-2 px-1 border-t border-slate-100/50";

export const TREE_EMPTY_STATE_CLASS =
  "flex flex-col items-center gap-3 px-4 py-8 text-center rounded-3xl border border-white/40 bg-white/30 backdrop-blur-md shadow-sm";

/**
 * The glass canvas card the lesson editor uses — reused so canvases sit identically. This is a
 * legitimate NESTED scroll container (see `StudioEditorBody`'s doc comment): its own edge is the
 * visible scrollbar for a "page within the canvas" look, distinct from and inside the Studio
 * viewport's own header-safe scroll region.
 */
export const CANVAS_CARD_CLASS =
  "h-full overflow-y-auto rounded-3xl bg-white/30 backdrop-blur-xl border border-white/40 shadow-lg p-8 arcade-scrollbar-mini";

/**
 * Width-constrains and centers a workspace's canvas content inside the Studio viewport. Carries
 * no padding or scroll properties of its own — `StudioEditorBody`'s `<main>` owns both, so a
 * workspace can never misplace them the way earlier ad-hoc per-workspace variants did (padding
 * placed inside a differently-scrolled element let content render behind the header).
 */
export const CANVAS_WRAPPER_CLASS = "w-full max-w-[1024px] flex-1 min-h-0";


// ── Shared canvas states ──────────────────────────────────────────────────────
// Every Studio workspace needs the same four: loading, empty, error, and permission-denied. They
// live here so a new workspace gets them by default and they read identically everywhere, rather
// than each surface inventing its own centred spinner and its own grey "Nothing here" sentence.

export function StudioCanvasLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3" role="status">
      <Loader2 size={20} className="animate-spin text-[#14142b]/40" />
      <p className="text-sm font-medium text-[#14142b]/50">{label}</p>
    </div>
  );
}

/**
 * The empty state. `title` says what is missing, `description` says why it matters, and `action`
 * is the one thing to do next — an empty workspace should never be a blank canvas with an
 * ambiguous sentence on it.
 */
export function StudioCanvasEmpty({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: ComponentType<{ size?: number | string; className?: string }>;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/60 shadow-sm ring-1 ring-black/[0.03]">
        <Icon size={24} className="text-indigo-400" />
      </div>
      <div className="max-w-md">
        <h3 className="text-base font-semibold text-[#14142b]">{title}</h3>
        {description && <p className="mt-1.5 text-sm leading-relaxed text-[#14142b]/50">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function StudioCanvasError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 px-6 text-center" role="alert">
      <AlertTriangle size={22} className="text-rose-500" />
      <p className="max-w-md text-sm font-semibold text-rose-600">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-[#14142b] transition-colors hover:bg-slate-50"
        >
          Try again
        </button>
      )}
    </div>
  );
}

/** A canvas that scrolls its own content without the glass card — for tables and lists. */
export const CANVAS_PLAIN_CLASS = "h-full overflow-y-auto pr-1 arcade-scrollbar-mini";
