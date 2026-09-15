"use client";

import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";

/**
 * The Studio editor chrome — the frame every full-screen authoring surface in Studio sits in:
 * ambient background, floating top bar (logo · back · centered breadcrumb · actions), the
 * floating left structure sidebar, and the canvas column.
 *
 * Extracted from SharedContentEditorOrchestrator so a second authoring surface (the exam editor)
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

export function StudioEditorTopBar({
  onBack,
  backDisabled,
  backTitle = "Save and return to Content Studio",
  breadcrumb,
  actions,
}: {
  onBack: () => void;
  backDisabled?: boolean;
  backTitle?: string;
  /** Contents of the centered pill — a breadcrumb, or the content title when nothing is open. */
  breadcrumb: ReactNode;
  /** Right-hand side of the top bar (share, submit, publish, panel toggle …). */
  actions?: ReactNode;
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

        {/* Right actions */}
        <div className="pointer-events-auto flex flex-shrink-0 items-center justify-end gap-3.5">
          {actions}
        </div>
      </div>
    </div>
  );
}

export function StudioEditorBody({
  sidebarTitle,
  sidebarTree,
  sidebarActions,
  children,
}: {
  /** Sidebar heading, e.g. "Course structure" / "Question bank". */
  sidebarTitle: string;
  sidebarTree: ReactNode;
  /** Pinned bottom actions in the sidebar (Add Module, Add Exam …). */
  sidebarActions?: ReactNode;
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

      {/* ── Canvas: wide, centered pane. Fixed in place — only its own inner
           content scrolls, so the panel itself never shifts and the scrollbar
           sits at the panel's own edge instead of the browser window's. ── */}
      <main className="z-0 flex flex-col min-h-0 absolute inset-0 items-center">{children}</main>
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

/** The glass canvas card the lesson editor uses — reused so canvases sit identically. */
export const CANVAS_CARD_CLASS =
  "h-full overflow-y-auto rounded-3xl bg-white/30 backdrop-blur-xl border border-white/40 shadow-lg p-8 arcade-scrollbar-mini";

export const CANVAS_WRAPPER_CLASS = "w-full max-w-[1024px] flex-1 min-h-0 px-6 pb-6 pt-36 sm:px-12";


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
