"use client";

import { useEffect } from "react";

/**
 * Warns the browser before a tab close, refresh, or external navigation would discard unsaved
 * changes.
 *
 * <p>Every Studio workspace already tracks a dirty flag (`hasDraftChanges` in the content
 * runtime, similar state in Exam) — it was written to on every mutation but never read anywhere,
 * so a learner could close the tab or hit refresh mid-edit with no warning at all. This is the
 * one thing that flag is actually for.
 *
 * <p>Scoped to what a page can do: `beforeunload` covers tab close, refresh and typing a new URL,
 * which is the case that actually loses data outright. In-app navigation (the Studio's own Back
 * button) already flushes pending saves itself before navigating and does not need this guard.
 */
export function useUnsavedChangesGuard(dirty: boolean) {
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Chrome requires returnValue to be set; the string itself is ignored by every modern
      // browser, which shows its own generic "leave site?" copy instead.
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
}
