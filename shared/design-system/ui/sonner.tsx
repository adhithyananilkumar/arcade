/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Shared
 * Subsystem: Design System
 *
 * Purpose:
 * The app-wide toast/alert surface (wraps `sonner`). Renders as a floating
 * glass pill — same visual family as the bottom Dock, ContentWorkspaceDock,
 * and the channel-manage floating toolbar (rounded-full, white/90 +
 * backdrop-blur-xl, soft shadow) — instead of sonner's boxy defaults, so a
 * toast reads as one more piece of Arcade chrome, not a foreign widget.
 * Tap anywhere on a toast (outside its action/cancel button) to dismiss it
 * early — there's no close button, the whole pill is the affordance.
 *
 * Mount exactly once, near the root (see apps/core/Providers.tsx). Trigger
 * toasts from anywhere via `import { toast } from "sonner"` — this file only
 * swaps the shell, not the API.
 *
 * Rules:
 * - Never mention business models (e.g. "Course", "Quiz").
 * - Must not have external side-effects.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

"use client"

import { useEffect, useState, type CSSProperties, type MouseEvent } from "react"
import { Toaster as Sonner, toast, type ToasterProps } from "sonner"
import { CheckCircle2, XCircle, AlertTriangle, Info, Loader2 } from "lucide-react"

/**
 * Tracks whether `.dark` is on `<html>`, without importing the app's theme
 * store — this file must stay infrastructure-free (shared → infrastructure
 * is a reverse dependency). Only feeds sonner's own `theme` prop (its
 * internal gray-scale and spinner vars); every color this file actually
 * renders comes from the `dark:` Tailwind classNames below and reacts to
 * `.dark` on its own regardless of this value.
 */
function useDocumentTheme(): "light" | "dark" {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  useEffect(() => {
    const root = document.documentElement
    const sync = () => setTheme(root.classList.contains("dark") ? "dark" : "light")
    sync()
    const observer = new MutationObserver(sync)
    observer.observe(root, { attributes: true, attributeFilter: ["class"] })
    return () => observer.disconnect()
  }, [])

  return theme
}

// Clears the app's floating bottom dock family (fixed bottom-6, ~60px tall
// pill) with room to spare, on every screen that has one — and costs nothing
// on screens that don't; toasts sit at the bottom everywhere regardless.
const DOCK_CLEARANCE = 112

// How long a toast stays before it auto-dismisses (a call site's own
// `duration` still wins over this default).
const AUTO_DISMISS_MS = 3000

// Pill body. `!` overrides sonner's own hardcoded (non-themeable) inline
// declarations for background/border/shadow/gap so this actually wins the
// cascade regardless of stylesheet order. Corner radius isn't overridden
// here — sonner already reads it from --border-radius (set below via
// style), which is the one property it exposes as a var.
//
// The exit is fully custom (not sonner's default lift-and-fade): whether a
// toast leaves because it timed out, got swiped, or was tapped, it slides
// to the side and dissolves — the "click it away" gesture the tap handler
// below performs is just the same motion, triggered early.
const TOAST_CLASSNAME = [
  "!items-center !gap-3 !border !p-4 cursor-pointer select-none",
  "!border-slate-200/80 !bg-white/90 !text-[#14142b]",
  "!shadow-[0_16px_40px_rgba(20,20,43,0.15)] backdrop-blur-xl backdrop-saturate-150 !ring-1 !ring-black/[0.04]",
  "dark:!border-white/[0.18] dark:!bg-neutral-800/90 dark:!text-neutral-50",
  "dark:!shadow-[0_16px_40px_rgba(0,0,0,0.45)] dark:!ring-white/[0.04]",
  // A single fully-arbitrary, fully-important shorthand — sonner's own
  // transition is a plain (non-important) shorthand too, and shorthands
  // don't merge: whichever applies resets every sub-property (duration,
  // timing, delay) it doesn't mention, so a longhand utility here wouldn't
  // reliably win. `transform`/`height` are kept at sonner's own timings so
  // its entrance slide-up and stack/expand resize stay exactly as smooth;
  // `translate`/`scale` (added, at 300ms) are the ones this exit motion
  // actually uses, since `!translate-x-10`/`!scale-95` below compile to
  // those standalone properties, not `transform`.
  "![transition:transform_400ms_ease,translate_300ms_ease-out,scale_300ms_ease-out,opacity_400ms_ease,box-shadow_200ms_ease-out,height_400ms_ease]",
  "hover:!shadow-[0_20px_48px_rgba(20,20,43,0.20)] active:!scale-[0.98]",
  "data-[removed=true]:!translate-x-10 data-[removed=true]:!opacity-0 data-[removed=true]:!scale-95",
].join(" ")

// A small colored circle behind the type icon — one per toast type, picked
// via an ancestor attribute selector (`[data-type=…] &`) so it all lives in
// this one classNames.icon string instead of four separate per-type
// className hooks. Falls back to a neutral slate circle for a bare
// `toast("…")` call (no type). `.toast-icon-pop` (globals.css) gives it a
// snappy scale-and-settle entrance instead of just appearing flat.
const ICON_CLASSNAME = [
  "!m-0 !flex !h-8 !w-8 shrink-0 !items-center !justify-center !rounded-full toast-icon-pop",
  "!bg-slate-100 !text-slate-600 dark:!bg-white/10 dark:!text-neutral-300",
  "[&>svg]:!m-0 [&>svg]:!h-4 [&>svg]:!w-4",
  "[[data-type=success]_&]:!bg-emerald-500/15 [[data-type=success]_&]:!text-emerald-600 dark:[[data-type=success]_&]:!bg-emerald-500/20 dark:[[data-type=success]_&]:!text-emerald-400",
  "[[data-type=error]_&]:!bg-rose-500/15 [[data-type=error]_&]:!text-rose-600 dark:[[data-type=error]_&]:!bg-rose-500/20 dark:[[data-type=error]_&]:!text-rose-400",
  "[[data-type=warning]_&]:!bg-amber-500/15 [[data-type=warning]_&]:!text-amber-600 dark:[[data-type=warning]_&]:!bg-amber-500/20 dark:[[data-type=warning]_&]:!text-amber-400",
  "[[data-type=info]_&]:!bg-indigo-500/15 [[data-type=info]_&]:!text-indigo-600 dark:[[data-type=info]_&]:!bg-indigo-500/20 dark:[[data-type=info]_&]:!text-indigo-400",
  "[[data-type=loading]_&]:!bg-indigo-500/15 [[data-type=loading]_&]:!text-indigo-600 dark:[[data-type=loading]_&]:!bg-indigo-500/20 dark:[[data-type=loading]_&]:!text-indigo-400",
].join(" ")

/**
 * There is no per-toast onClick in sonner's API, so this delegates: find the
 * `[data-sonner-toast]` the click landed on, read the render-order index
 * sonner already puts on it (`data-index`), and look up that same position
 * in `toast.getToasts()` — both come from the one live toasts array, so they
 * stay in sync. A click on the action/cancel button is left alone; those
 * already have their own behavior (and normally dismiss the toast anyway).
 */
function handleTapToDismiss(event: MouseEvent<HTMLDivElement>) {
  const target = event.target as HTMLElement
  if (target.closest("[data-button]")) return

  const toastEl = target.closest<HTMLElement>("[data-sonner-toast]")
  if (!toastEl) return

  const index = Number(toastEl.dataset.index)
  if (Number.isNaN(index)) return

  const active = toast.getToasts()[index]
  if (active) toast.dismiss(active.id)
}

function Toaster({ style, ...props }: ToasterProps) {
  const theme = useDocumentTheme()
  return (
    <div onClick={handleTapToDismiss}>
      <Sonner
        theme={theme}
        position="bottom-center"
        offset={{ bottom: DOCK_CLEARANCE }}
        mobileOffset={{ bottom: DOCK_CLEARANCE, left: 12, right: 12 }}
        gap={12}
        duration={AUTO_DISMISS_MS}
        closeButton={false}
        richColors={false}
        icons={{
          success: <CheckCircle2 strokeWidth={2.5} />,
          error: <XCircle strokeWidth={2.5} />,
          warning: <AlertTriangle strokeWidth={2.5} />,
          info: <Info strokeWidth={2.5} />,
          loading: <Loader2 strokeWidth={2.5} className="animate-spin" />,
        }}
        toastOptions={{
          unstyled: false,
          classNames: {
            toast: TOAST_CLASSNAME,
            icon: ICON_CLASSNAME,
            content: "!gap-0.5",
            title: "!text-[13px] !font-bold !leading-snug !text-[#14142b] dark:!text-neutral-50",
            description:
              "!text-[12px] !font-medium !leading-snug !text-slate-500 dark:!text-neutral-400",
            actionButton: [
              "!h-8 !shrink-0 !rounded-full !border-0 !px-4 !text-[12px] !font-semibold",
              "!bg-[#14142b] !text-white hover:!bg-[#232735]",
              "dark:!bg-white dark:!text-[#14142b] dark:hover:!bg-neutral-200",
              "transition-colors",
            ].join(" "),
            cancelButton: [
              "!h-8 !shrink-0 !rounded-full !border-0 !px-3.5 !text-[12px] !font-semibold",
              "!bg-slate-100 !text-slate-600 hover:!bg-slate-200",
              "dark:!bg-white/10 dark:!text-neutral-300 dark:hover:!bg-white/15",
              "transition-colors",
            ].join(" "),
          },
        }}
        style={
          {
            "--border-radius": "9999px",
            "--width": "380px",
            ...style,
          } as CSSProperties
        }
        {...props}
      />
    </div>
  )
}

export { Toaster }
