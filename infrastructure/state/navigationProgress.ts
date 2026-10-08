/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Infrastructure
 * Module: State
 *
 * Purpose:
 * Whether a client-side route change is in flight, so the app can show that a click was heard.
 *
 * The App Router has no "navigation started" event of its own for components to subscribe to;
 * Next calls `onRouterTransitionStart` in `instrumentation-client.ts` for every Link, `router.push`
 * / `replace` and back/forward, and that hook calls {@link startNavigation}. The navigation ends
 * the moment the new URL renders, which `NavigationProgress` (apps/core) reports through
 * {@link finishNavigation}.
 *
 * Rules:
 * - Must remain agnostic to Arcade business domains.
 * ------------------------------------------------------------------
 */

import { useSyncExternalStore } from 'react';

/**
 * A navigation that never commits — a push the app redirects straight back to the current URL,
 * say — would otherwise leave the indicator up forever. Long enough to outlast a slow first build
 * of a route in development.
 */
const MAX_PENDING_MS = 60_000;

let pendingSince: number | null = null;
let safetyTimer: ReturnType<typeof setTimeout> | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

/** `pathname + search` — what decides whether a navigation changes the page at all. */
function pageKey(url: URL): string {
  return url.pathname + url.search;
}

export function startNavigation(href: string): void {
  if (typeof window === 'undefined') return;
  let target: URL;
  try {
    target = new URL(href, window.location.href);
  } catch {
    return;
  }
  // Same page, or only the hash differs: nothing will load, and nothing would end the indicator.
  if (target.origin !== window.location.origin) return;
  if (pageKey(target) === pageKey(new URL(window.location.href))) return;

  pendingSince = Date.now();
  if (safetyTimer) clearTimeout(safetyTimer);
  safetyTimer = setTimeout(finishNavigation, MAX_PENDING_MS);
  emit();
}

export function finishNavigation(): void {
  if (safetyTimer) {
    clearTimeout(safetyTimer);
    safetyTimer = null;
  }
  if (pendingSince === null) return;
  pendingSince = null;
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** When the in-flight navigation started (epoch ms), or null when none is. */
export function useNavigationPendingSince(): number | null {
  return useSyncExternalStore(subscribe, () => pendingSince, () => null);
}
