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
    connection?: { effectiveType?: string; downlink?: number; saveData?: boolean };
    deviceMemory?: number;
    userAgentData?: { platform?: string; mobile?: boolean };
  };
  return {
    viewport: { width: window.innerWidth, height: window.innerHeight, dpr: window.devicePixelRatio },
    screen: { width: window.screen.width, height: window.screen.height },
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    platform: nav.userAgentData?.platform ?? navigator.platform,
    mobile: nav.userAgentData?.mobile ?? /Mobi|Android/i.test(navigator.userAgent),
    online: navigator.onLine,
    colorScheme: window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light",
    reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
    touch: "ontouchstart" in window || navigator.maxTouchPoints > 0,
    ...(nav.connection
      ? { network: { type: nav.connection.effectiveType, downlinkMbps: nav.connection.downlink, saveData: nav.connection.saveData } }
      : {}),
    ...(nav.deviceMemory ? { deviceMemoryGb: nav.deviceMemory } : {}),
    pageLoadedSecondsAgo: Math.round(performance.now() / 1000),
  };
}
