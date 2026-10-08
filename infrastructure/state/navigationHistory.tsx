"use client";

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Infrastructure
 * Module: State
 *
 * Purpose:
 * Remembers the page the user was on before this one, so a "Back to X" control can go back the way
 * they came instead of pushing X on top of the history.
 *
 * Why: every "Back" in Studio used to router.push() its target. Course editor → exam editor → Back
 * left [course editor, exam editor, course editor] in history, so the browser's own back button
 * then returned to the exam editor — "back" bounced between pages instead of retracing steps.
 * ------------------------------------------------------------------
 */

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

let current: string | null = null;
let previous: string | null = null;

function pathOf(href: string): string {
  return href.split("#")[0].split("?")[0].replace(/\/+$/, "") || "/";
}

/** Mount once near the root: records every client-side navigation. */
export function NavigationTracker() {
  const pathname = usePathname();
  const search = useSearchParams();
  useEffect(() => {
    const here = `${pathname}${search?.toString() ? `?${search.toString()}` : ""}`;
    if (current !== null && pathOf(current) !== pathOf(here)) previous = current;
    current = here;
  }, [pathname, search]);
  return null;
}

/** The page before this one (path + query), if the user arrived by an in-app navigation. */
export function previousPage(): string | null {
  return previous;
}

/** Whether the user arrived here from `href` (by path; tabs and other query params are ignored). */
export function cameFrom(href: string): boolean {
  return previous !== null && pathOf(previous) === pathOf(href);
}

/**
 * Go to `href` as a Back action: steps back through history when that is where the user came
 * from (so history stays linear), otherwise navigates there.
 */
export function goBackTo(router: { back: () => void; push: (href: string) => void }, href: string): void {
  if (cameFrom(href) && typeof window !== "undefined" && window.history.length > 1) {
    router.back();
  } else {
    router.push(href);
  }
}

/** A `returnTo` value that is safe to navigate to: an in-app path, never an external URL. */
export function safeReturnTo(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

/** `href` with `?returnTo=` set to the current page, so the destination's Back can come here. */
export function withReturnTo(href: string, returnTo?: string): string {
  const from =
    returnTo ?? (typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : null);
  if (!from) return href;
  return `${href}${href.includes("?") ? "&" : "?"}returnTo=${encodeURIComponent(from)}`;
}
