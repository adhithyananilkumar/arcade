/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Infrastructure
 * Module: State
 *
 * Purpose:
 * Whether this browser can reach the internet right now.
 *
 * `navigator.onLine` alone is not enough: it is only false when the device has no network at all,
 * and stays true on Wi-Fi with no internet behind it. So a request that fails without an HTTP
 * answer (see `infrastructure/http/api.ts`) asks this store to check: it probes a static file on
 * the UI's own origin. If that also fails, the device is offline; if it loads, the internet is fine
 * and only the API is unreachable — a different problem with a different message.
 *
 * Also drives TanStack Query's `onlineManager`, so queries and mutations pause while offline and
 * resume (with a refetch) the moment the connection is back, however it was detected.
 *
 * Rules:
 * - Must remain agnostic to Arcade business domains.
 * ------------------------------------------------------------------
 */

import { create } from 'zustand';
import { onlineManager } from '@tanstack/react-query';

export type ConnectivityStatus = 'online' | 'offline';

/** A small static file the UI host serves; never cached, so a response proves the network works. */
const PROBE_PATH = '/favicon.svg';
const PROBE_TIMEOUT_MS = 5000;
/** How often to re-check while offline, for networks that come back without an `online` event. */
const RECHECK_MS = 5000;

interface ConnectivityState {
  status: ConnectivityStatus;
  checking: boolean;
  /** Re-check now; resolves to whether the internet is reachable. */
  check: () => Promise<boolean>;
}

let recheckTimer: ReturnType<typeof setInterval> | null = null;
let inFlight: Promise<boolean> | null = null;

async function probe(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return false;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);
  try {
    await fetch(`${PROBE_PATH}?connectivity=${Date.now()}`, {
      method: 'HEAD',
      cache: 'no-store',
      signal: controller.signal,
    });
    return true;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

export const useConnectivityStore = create<ConnectivityState>((set) => ({
  status: 'online',
  checking: false,
  check: () => {
    if (!inFlight) {
      set({ checking: true });
      inFlight = probe()
        .then((reachable) => {
          setStatus(reachable ? 'online' : 'offline');
          return reachable;
        })
        .finally(() => {
          inFlight = null;
          set({ checking: false });
        });
    }
    return inFlight;
  },
}));

function setStatus(status: ConnectivityStatus) {
  if (useConnectivityStore.getState().status === status) return;
  useConnectivityStore.setState({ status });

  if (status === 'offline' && !recheckTimer) {
    recheckTimer = setInterval(() => void useConnectivityStore.getState().check(), RECHECK_MS);
  } else if (status === 'online' && recheckTimer) {
    clearInterval(recheckTimer);
    recheckTimer = null;
  }
}

/** A request got no HTTP answer at all: find out whether the internet is the reason. */
export function reportNetworkFailure(): void {
  if (typeof window === 'undefined') return;
  if (navigator.onLine === false) {
    setStatus('offline');
    return;
  }
  void useConnectivityStore.getState().check();
}

/** A request got an HTTP answer, so the network is evidently working. */
export function reportReachable(): void {
  if (useConnectivityStore.getState().status !== 'online') setStatus('online');
}

/** True when we already know the device is offline — callers can skip a request doomed to fail. */
export function isKnownOffline(): boolean {
  return useConnectivityStore.getState().status === 'offline';
}

if (typeof window !== 'undefined') {
  if (navigator.onLine === false) setStatus('offline');
  window.addEventListener('offline', () => setStatus('offline'));
  // The `online` event only means a network interface came up — confirm there is internet behind it.
  window.addEventListener('online', () => void useConnectivityStore.getState().check());

  onlineManager.setEventListener((setOnline) => {
    setOnline(useConnectivityStore.getState().status === 'online');
    return useConnectivityStore.subscribe((state, prev) => {
      if (state.status !== prev.status) setOnline(state.status === 'online');
    });
  });
}
