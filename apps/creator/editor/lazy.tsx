// apps/creator/editor/lazy.tsx
"use client";

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Creator
 * Type: Editor entry (lazy)
 *
 * Purpose:
 * The rich-text editor, loaded on demand. Hosts import `LazyArcadeEditor` from here — never from
 * the editor barrel — so a page that *can* show the editor doesn't download it until it does.
 * ------------------------------------------------------------------
 */

import { Component, forwardRef, lazy, Suspense, useState, type ReactNode } from "react";
import type { ComponentProps } from "react";
import type { ArcadeEditor as ArcadeEditorType, ArcadeEditorHandle } from "./components/ArcadeEditor";

export type { ArcadeEditorHandle };
type ArcadeEditorProps = ComponentProps<typeof ArcadeEditorType>;

/*
 * The editor engine (Tiptap, ProseMirror, Yjs, KaTeX, the Word importer, the emoji index, code
 * highlighting) is several megabytes of script. Imported statically it was parsed before the
 * Studio tree could even show, which on a low-end phone or a 3G connection meant tens of seconds
 * of a page doing nothing. Loaded here instead, it arrives behind a skeleton the moment a lesson
 * is opened — or earlier, via `preloadArcadeEditor()`, once the page around it is idle.
 */
let pending: Promise<typeof import("./components/ArcadeEditor")> | null = null;

function loadEditorModule() {
  if (!pending) {
    pending = retry(() => import("./components/ArcadeEditor"), 3).catch((error) => {
      // Let the next attempt start over instead of replaying the same failure forever.
      pending = null;
      throw error;
    });
  }
  return pending;
}

/** A dropped packet on a weak connection shouldn't cost the author their editor. */
async function retry<T>(fn: () => Promise<T>, attempts: number): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      await new Promise((resolve) => setTimeout(resolve, 800 * (i + 1)));
    }
  }
  throw lastError;
}

/** Starts downloading the editor without rendering it. Safe to call any number of times. */
export function preloadArcadeEditor() {
  void loadEditorModule().catch(() => {
    // Preloading is best-effort; opening a lesson retries and reports.
  });
}

function createLazyEditor() {
  return lazy(() => loadEditorModule().then((m) => ({ default: m.ArcadeEditor })));
}

interface BoundaryProps {
  children: ReactNode;
  onRetry: () => void;
}

/**
 * Keeps an editor failure inside the canvas. Without it, a chunk that never arrives or an editor
 * crash unmounts the whole Studio page and the author is left with a blank screen.
 */
class EditorErrorBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Editor failed to load", error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-sm font-semibold text-slate-900">The editor didn&apos;t load</p>
        <p className="max-w-sm text-sm text-slate-500">
          Your work is saved. This usually means the connection dropped while the editor was downloading.
        </p>
        <button
          type="button"
          onClick={() => {
            this.setState({ failed: false });
            this.props.onRetry();
          }}
          className="h-9 rounded-full bg-ink px-5 text-sm font-semibold text-on-ink transition-colors hover:bg-ink-hover"
        >
          Try again
        </button>
      </div>
    );
  }
}

/** Drop-in for `ArcadeEditor`: same props, same ref handle, loaded on first render. */
export const LazyArcadeEditor = forwardRef<ArcadeEditorHandle, ArcadeEditorProps>(function LazyArcadeEditor(props, ref) {
  // A fresh lazy() per retry: React caches a rejected lazy component for good.
  const [Editor, setEditor] = useState(createLazyEditor);
  return (
    <EditorErrorBoundary onRetry={() => setEditor(createLazyEditor)}>
      {/* Reserves the writing area's height while the engine downloads — no placeholder chrome. */}
      <Suspense fallback={<div style={{ minHeight: props.minHeight ?? 300 }} aria-busy="true" />}>
        <Editor {...props} ref={ref} />
      </Suspense>
    </EditorErrorBoundary>
  );
});
