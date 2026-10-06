"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, ArrowLeft, Loader2, PanelLeft, X } from "lucide-react";
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
    //
    // Theme: the frame is page ground, not a panel. `theme-page-bg` lets the viewer's glass
    // wallpaper show through, `theme-wallpaper-frost` blurs that wallpaper behind the writing
    // surface (as on the course player and exam attempt), and the ambient colour wash is a
    // `theme-page-layer` so it steps aside for glass and high contrast. In solid light/dark the
    // ground is the theme's own `bg-surface`.
    <div className="theme-page-bg theme-wallpaper-frost fixed inset-0 flex flex-col overflow-hidden bg-surface">
      <div className="theme-page-layer pointer-events-none absolute inset-0 z-0 overflow-hidden dark:opacity-60">
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

/** A round icon button beside Back: a second way out of the editor (e.g. an exam's settings). */
export interface StudioNavAction {
  icon: ReactNode;
  /** Tooltip and accessible name. */
  title: string;
  onClick: () => void;
  disabled?: boolean;
}

export function StudioEditorTopBar({
  onBack,
  backDisabled,
  backTitle = "Save and return to Content Studio",
  secondaryNav,
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
  /** Rendered right after Back, in the same style. Omit/`null` for none. */
  secondaryNav?: StudioNavAction | null;
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
    <header className="relative z-30 flex-shrink-0 w-full flex justify-center px-4 sm:px-6 pt-4 pb-2 pointer-events-none">
      <div className="relative flex w-full items-center justify-between">
        {/* Left: Logo & Back Button */}
        <div className="pointer-events-auto flex flex-shrink-0 items-center gap-2">
          <div className="hidden h-10 shrink-0 items-center rounded-full px-5 sm:flex bg-surface/60 shadow-sm border border-surface/40 backdrop-blur-md">
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
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-surface/40 bg-surface/60 text-ink shadow-sm transition-all duration-300 hover:bg-surface hover:shadow-md disabled:opacity-60 backdrop-blur-md"
          >
            <ArrowLeft size={16} />
          </button>

          {secondaryNav && (
            <button
              type="button"
              onClick={secondaryNav.onClick}
              disabled={secondaryNav.disabled}
              title={secondaryNav.title}
              aria-label={secondaryNav.title}
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-surface/40 bg-surface/60 text-ink shadow-sm transition-all duration-300 hover:bg-surface hover:shadow-md disabled:opacity-60 backdrop-blur-md"
            >
              {secondaryNav.icon}
            </button>
          )}
        </div>

        {/* Center: breadcrumb / title pill */}
        <div className="pointer-events-auto absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 lg:flex">
          <div className="flex h-8 items-center justify-center rounded-full border border-surface/40 bg-surface/60 px-4 py-1 text-xs font-bold tracking-tight text-ink shadow-sm backdrop-blur-md">
            {breadcrumb}
          </div>
        </div>

        {/*
         * Right actions — every shared control below is rendered by Studio Core itself, from
         * plain data props, never from a ReactNode a workspace could use to substitute its own
         * implementation. `workspaceActionsBefore`/`workspaceActionsAfter` are the only slots a
         * workspace actually fills, and they sit alongside these, never in place of them.
         */}
        <div className="pointer-events-auto flex min-w-0 flex-shrink-0 items-center justify-end gap-2 sm:gap-3.5">
          {saveState && (
            <span className="hidden md:inline-flex">
              <StudioSaveStatus state={saveState} />
            </span>
          )}
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
    </header>
  );
}

export function StudioEditorBody({
  sidebarTitle,
  sidebarTree,
  sidebarActions,
  toolbarClearance = true,
  rightPanelOpen = false,
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
  /**
   * Whether the Studio right panel (fixed, 340px) is open. On desktop the canvas then reserves
   * the panel's footprint instead of letting it draw over the content.
   */
  rightPanelOpen?: boolean;
  /** The canvas column. */
  children: ReactNode;
}) {
  // Below `lg` the structure sidebar is an off-canvas drawer rather than a flex column, so a
  // narrow viewport never has to share its width between the tree and the canvas.
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [drawerOpen]);

  return (
    <div className="relative min-h-0 flex-1 flex overflow-hidden">
      {/* Mobile/tablet: the button that opens the structure drawer. */}
      <button
        type="button"
        onClick={() => setDrawerOpen(true)}
        className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full border border-surface/40 bg-surface/80 px-4 py-2.5 text-xs font-bold text-ink shadow-md backdrop-blur-md transition-all hover:bg-surface lg:hidden"
      >
        <PanelLeft size={14} />
        {sidebarTitle}
      </button>

      {drawerOpen && (
        <div
          aria-hidden
          data-studio-overlay
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-[75] bg-slate-950/20 backdrop-blur-[2px] lg:hidden"
        />
      )}

      {/*
       * ── Sidebar: content structure ─────────────────────────────
       * From `lg` up, a real flex item (fixed width, no shrink) rather than absolutely
       * positioned, so the canvas next to it is never unaware of its footprint. Below `lg`, the
       * same element is a fixed drawer that slides in over a backdrop and is dismissed again —
       * it never sits on top of the canvas while you're working in it.
       */}
      <aside
        className={`relative z-20 ml-10 mt-4 mb-4 flex w-[268px] flex-shrink-0 flex-col overflow-visible
          max-lg:fixed max-lg:inset-y-3 max-lg:left-3 max-lg:z-[80] max-lg:m-0 max-lg:w-[min(300px,calc(100vw-1.5rem))] max-lg:rounded-3xl max-lg:border max-lg:border-surface/40 max-lg:bg-surface/90 max-lg:p-4 max-lg:shadow-xl max-lg:backdrop-blur-xl max-lg:transition-transform max-lg:duration-300
          ${drawerOpen ? "" : "max-lg:-translate-x-[calc(100%+1.5rem)]"}`}
      >
        {/* ── Sidebar header ───────────────── */}
        <div className="flex flex-shrink-0 items-center justify-between mb-3">
          <span className="min-w-0 flex-1 truncate px-1 text-[11px] font-bold uppercase tracking-[0.15em] text-ink/60">
            {sidebarTitle}
          </span>
          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            title="Close"
            aria-label="Close"
            className="rounded-full p-1.5 text-ink/50 transition-colors hover:bg-ink/5 hover:text-ink lg:hidden"
          >
            <X size={14} />
          </button>
        </div>

        {/* ── Body ──────────────────────────────── */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-4 pr-1 arcade-scrollbar-mini">
          {sidebarTree}
        </div>

        {/* ── Sidebar actions (pinned at the bottom) ───────────────── */}
        {sidebarActions}
      </aside>

      {/*
       * ── Canvas viewport: the ONE header-safe, ONE scroll-owning region every workspace's
       * content renders into.
       *
       * Viewport invariant:
       *   Studio Header (fixed non-scrolling chrome)
       *   ↓
       *   Studio Viewport (<main className="overflow-y-auto">)
       *   ↓
       *   Scrolling workspace content
       *
       * The scrollbar begins strictly below the Studio header, and content can NEVER
       * underlap or scroll behind the top bar.
       *
       * Horizontal centering: the canvas (CANVAS_WRAPPER_CLASS, max 1024px, `mx-auto`) is
       * centered on the *viewport*, not merely on the space right of the sidebar. The sidebar's
       * footprint plus the left padding is 332px (40 + 268 + 24), so mirroring that as right
       * padding puts the canvas dead center. When the viewport is too narrow to mirror it fully,
       * the right padding gives way first (clamp down to 24px) so the canvas keeps its width
       * rather than its symmetry. With the right panel open, its footprint is reserved instead.
       */}
      <main
        className={`z-0 flex flex-col min-h-0 min-w-0 flex-1 overflow-y-auto px-4 pb-20 sm:px-6 lg:pb-6 arcade-scrollbar-mini ${
          rightPanelOpen ? "lg:pr-[380px]" : "lg:pr-[clamp(1.5rem,calc(100%_-_1356px),332px)]"
        } ${toolbarClearance ? "pt-20" : "pt-6"}`}
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
  "group flex items-center gap-2 rounded-2xl border border-surface/40 bg-surface/60 backdrop-blur-md px-3 py-2 shadow-sm transition-all hover:border-surface/60 hover:bg-surface/80";

export const TREE_SIDEBAR_BUTTON_CLASS =
  "flex w-full items-center justify-center gap-2 rounded-2xl border border-surface/40 bg-surface/70 px-4 py-2.5 text-xs font-bold text-ink shadow-sm backdrop-blur-md transition-all hover:bg-surface/90 hover:shadow disabled:opacity-60";

export const TREE_SIDEBAR_ACTIONS_CLASS =
  "flex shrink-0 flex-col gap-2 mt-auto pt-4 pb-2 px-1 border-t border-slate-100/50";

export const TREE_EMPTY_STATE_CLASS =
  "flex flex-col items-center gap-3 px-4 py-8 text-center rounded-3xl border border-surface/40 bg-surface/30 backdrop-blur-md shadow-sm";

/**
 * The glass canvas card the lesson editor uses — reused so canvases sit identically. This is a
 * legitimate NESTED scroll container (see `StudioEditorBody`'s doc comment): its own edge is the
 * visible scrollbar for a "page within the canvas" look, distinct from and inside the Studio
 * viewport's own header-safe scroll region.
 */
export const CANVAS_CARD_CLASS =
  "h-full overflow-y-auto rounded-3xl bg-surface/30 backdrop-blur-xl border border-surface/40 shadow-lg p-8 arcade-scrollbar-mini";

/**
 * Width-constrains and centers a workspace's canvas content inside the Studio viewport. Carries
 * no padding or scroll properties of its own — `StudioEditorBody`'s `<main>` owns both, so a
 * workspace can never misplace them the way earlier ad-hoc per-workspace variants did (padding
 * placed inside a differently-scrolled element let content render behind the header).
 */
export const CANVAS_WRAPPER_CLASS = "mx-auto w-full max-w-[640px] md:max-w-[768px] lg:max-w-[1024px] flex-1 min-h-0 min-w-0";


// ── Shared canvas states ──────────────────────────────────────────────────────
// Every Studio workspace needs the same four: loading, empty, error, and permission-denied. They
// live here so a new workspace gets them by default and they read identically everywhere, rather
// than each surface inventing its own centred spinner and its own grey "Nothing here" sentence.

export function StudioCanvasLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3" role="status">
      <Loader2 size={20} className="animate-spin text-ink/40" />
      <p className="text-sm font-medium text-ink/50">{label}</p>
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
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface/60 shadow-sm ring-1 ring-slate-950/[0.03]">
        <Icon size={24} className="text-indigo-400" />
      </div>
      <div className="max-w-md">
        <h3 className="text-base font-semibold text-ink">{title}</h3>
        {description && <p className="mt-1.5 text-sm leading-relaxed text-ink/50">{description}</p>}
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
      <p className="max-w-md text-sm font-semibold text-rose-600 dark:text-rose-400">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-xl border border-slate-200 bg-surface px-4 py-2 text-xs font-bold text-ink transition-colors hover:bg-slate-50"
        >
          Try again
        </button>
      )}
    </div>
  );
}

/** A canvas that scrolls its own content without the glass card — for tables and lists. */
export const CANVAS_PLAIN_CLASS = "h-full overflow-y-auto pr-1 arcade-scrollbar-mini";
