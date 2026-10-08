/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Infrastructure
 * Module: Monitoring
 *
 * Purpose:
 * Browser-side diagnostics attached to bug reports: a small ring buffer of recent console
 * errors/warnings and uncaught failures, and a snapshot of the browser environment.
 *
 * Rules:
 * - Technical only — knows nothing about bug reports or any other domain.
 * - Never captures input values, storage, cookies or tokens.
 * ------------------------------------------------------------------
 */

export interface ConsoleEntry {
  level: "error" | "warn" | "uncaught" | "rejection";
  message: string;
  at: string;
}

const MAX_ENTRIES = 30;
const MAX_MESSAGE = 1500;
const buffer: ConsoleEntry[] = [];
let installed = false;

/** Bearer tokens and JWT-looking strings are scrubbed before anything is kept. */
function scrub(text: string): string {
  return text
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [redacted]")
    .replace(/eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, "[jwt redacted]");
}

function stringify(value: unknown): string {
  if (value instanceof Error) return `${value.name}: ${value.message}`;
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function push(level: ConsoleEntry["level"], parts: unknown[]) {
  const message = scrub(parts.map(stringify).join(" ")).slice(0, MAX_MESSAGE);
  if (!message.trim()) return;
  buffer.push({ level, message, at: new Date().toISOString() });
  if (buffer.length > MAX_ENTRIES) buffer.splice(0, buffer.length - MAX_ENTRIES);
}

/**
 * Starts recording. Idempotent — safe to call from any component that mounts more than once.
 * The original console methods still run; this only keeps a copy.
 */
export function installConsoleCapture() {
  if (installed || typeof window === "undefined") return;
  installed = true;

  const originalError = console.error.bind(console);
  const originalWarn = console.warn.bind(console);
  console.error = (...args: unknown[]) => {
    push("error", args);
    originalError(...args);
  };
  console.warn = (...args: unknown[]) => {
    push("warn", args);
    originalWarn(...args);
  };
  window.addEventListener("error", (event) => {
    push("uncaught", [event.error ?? event.message, event.filename ? `@ ${event.filename}:${event.lineno}` : ""]);
  });
  window.addEventListener("unhandledrejection", (event) => {
    push("rejection", [event.reason]);
  });
}

/** The most recent entries, oldest first. */
export function recentConsoleEntries(): ConsoleEntry[] {
  return buffer.slice();
}

/** What the browser can tell us about where the problem happened. */
export function captureEnvironment(): Record<string, unknown> {
  if (typeof window === "undefined") return {};
  const nav = navigator as Navigator & {
    connection?: { effectiveType?: string; downlink?: number; rtt?: number; saveData?: boolean };
    deviceMemory?: number;
    userAgentData?: { platform?: string; mobile?: boolean };
  };

  const perf = typeof performance !== 'undefined' ? (performance as unknown as {
    memory?: { jsHeapSizeLimit: number; totalJSHeapSize: number; usedJSHeapSize: number };
    timing?: { domComplete: number; domLoading: number; navigationStart: number };
  }) : undefined;

  // Active dialogs/modals currently displayed on the page
  const activeModals = Array.from(document.querySelectorAll('[role="dialog"], [role="alertdialog"]'))
    .map((el) => el.getAttribute('aria-label') || el.id || el.getAttribute('data-modal') || el.tagName.toLowerCase())
    .slice(0, 5);

  return {
    url: window.location.href,
    pathname: window.location.pathname,
    search: window.location.search || undefined,
    hash: window.location.hash || undefined,
    pageTitle: document.title || undefined,
    referrer: document.referrer || undefined,
    viewport: { width: window.innerWidth, height: window.innerHeight, dpr: window.devicePixelRatio },
    screen: {
      width: window.screen.width,
      height: window.screen.height,
      colorDepth: window.screen.colorDepth,
      orientation: window.screen.orientation?.type ?? undefined,
    },
    language: navigator.language,
    languages: Array.from(navigator.languages || []),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: nav.userAgentData?.platform ?? navigator.platform,
    userAgent: navigator.userAgent,
    mobile: nav.userAgentData?.mobile ?? /Mobi|Android/i.test(navigator.userAgent),
    online: navigator.onLine,
    cookiesEnabled: navigator.cookieEnabled,
    hardwareConcurrency: navigator.hardwareConcurrency ?? undefined,
    colorScheme: window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light",
    reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    forcedColors: window.matchMedia?.("(forced-colors: active)").matches ?? false,
    touch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
    maxTouchPoints: navigator.maxTouchPoints,
    ...(nav.connection
      ? {
          network: {
            type: nav.connection.effectiveType,
            downlinkMbps: nav.connection.downlink,
            rttMs: nav.connection.rtt,
            saveData: nav.connection.saveData,
          },
        }
      : {}),
    ...(nav.deviceMemory ? { deviceMemoryGb: nav.deviceMemory } : {}),
    ...(perf?.memory
      ? {
          memory: {
            usedHeapMb: Math.round(perf.memory.usedJSHeapSize / 1048576),
            totalHeapMb: Math.round(perf.memory.totalJSHeapSize / 1048576),
            heapLimitMb: Math.round(perf.memory.jsHeapSizeLimit / 1048576),
          },
        }
      : {}),
    activeModals: activeModals.length > 0 ? activeModals : undefined,
    recentErrorsCount: buffer.filter((b) => b.level === 'error' || b.level === 'uncaught').length,
    pageLoadedSecondsAgo: Math.round(performance.now() / 1000),
  };
}
