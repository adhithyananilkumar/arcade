// apps/creator/editor/components/ArcadeEditor.tsx
"use client";

import { EditorContent } from "@tiptap/react";
import { RichTextProvider } from "reactjs-tiptap-editor";
import dynamic from "next/dynamic";
import { forwardRef, memo, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import type * as Y from "yjs";

// Suppress React 19 flushSync console error caused by reactjs-tiptap-editor
if (typeof console !== "undefined") {
  const originalError = console.error;
  console.error = (...args) => {
    if (typeof args[0] === "string" && args[0].includes("flushSync was called from inside a lifecycle method")) {
      return;
    }
    originalError.apply(console, args);
  };
}
import { EditorSkeleton } from "./EditorSkeleton";
import { ToolbarSkeleton } from "./ToolbarSkeleton";
import {
  createSaveStatusStore,
  SaveStatusFooter,
  type SaveStatusStore,
} from "./SaveStatusFooter";
import { useArcadeEditor } from "../hooks/useArcadeEditor";
import "reactjs-tiptap-editor/style.css";
import "../styles/editor.css";
import type { TiptapDocument } from "@/shared/types/editor.types";

// ── Code-split chrome ────────────────────────────────────────────────────────
// The toolbar (43 library buttons) and the bubble layer both resolve into
// `reactjs-tiptap-editor`'s barrel modules, which statically pull in Excalidraw,
// Mermaid, KaTeX and easydrawer — a single ~3.5 MB chunk fused with Tiptap itself.
// Loading them eagerly blocked first paint of the writing surface for seconds.
//
// Deferring them means the caret is live almost immediately and the heavy chrome
// streams in behind it. `ssr: false` is required: both trees reach for `document`
// during module evaluation. The Excalidraw/easydrawer/KaTeX stylesheets are imported
// inside RichTextBubbles so they travel with that chunk rather than the entry.
const RichTextToolbar = dynamic(
  () => import("./RichTextToolbar").then((m) => m.RichTextToolbar),
  { ssr: false, loading: () => <ToolbarSkeleton /> }
);

const RichTextBubbles = dynamic(
  () => import("./RichTextBubbles").then((m) => m.RichTextBubbles),
  { ssr: false }
);

/** Imperative handle exposed via ref — force-save, restore, or read current content. */
export interface ArcadeEditorHandle {
  flush: () => Promise<void>;
  /** Replace the document content (used to restore a version). */
  setContent: (doc: TiptapDocument) => void;
  /** Current document as JSON, or null before the editor is ready. */
  getJSON: () => TiptapDocument | null;
}

interface ArcadeEditorProps {
  /** Pre-populate editor with existing content (non-collaborative mode only). */
  initialContent?: TiptapDocument;
  /** Placeholder text shown when empty. */
  placeholder?: string;
  /** Read-only mode for learner view. */
  readOnly?: boolean;
  /**
   * Called with the serialised doc 2s after the last keystroke.
   * Writes to localStorage + backend document endpoint.
   */
  onSave?: (doc: TiptapDocument) => void | Promise<void>;
  /** Collaborative Y.Doc — binds the editor to the version-history CRDT. */
  ydoc?: Y.Doc;
  /** Legacy JSON to seed into an empty Y.Doc (migration for pre-history lessons). */
  seedContent?: TiptapDocument;
  /** Extra classes applied to the outer wrapper. */
  className?: string;
  /**
   * Drop the card border/background/scroll so the editor blends into a host canvas
   * (Figma-style). The host owns padding + scrolling.
   */
  chromeless?: boolean;
}

// Memoized because the host is a large orchestrator: a keystroke in the course-title
// field, a sidebar toggle, or any unrelated state change would otherwise re-render the
// entire editor tree. All props passed by the orchestrator are referentially stable
// (the Y.Doc, the useCallback'd onSave), so this is a clean cut.
export const ArcadeEditor = memo(
  forwardRef<ArcadeEditorHandle, ArcadeEditorProps>(function ArcadeEditor(
    { initialContent, placeholder, readOnly = false, onSave, ydoc, seedContent, className = "", chromeless = false },
    ref
  ) {
  // The autosave indicator lives in an external store, NOT in React state — see
  // SaveStatusFooter for the measurement that motivated this. Nothing in this
  // component re-renders when the save status changes.
  const [statusStore] = useState<SaveStatusStore>(createSaveStatusStore);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    },
    []
  );

  const handleSave = useCallback(
    async (doc: TiptapDocument) => {
      statusStore.set("saving");
      try {
        await onSave?.(doc);
        statusStore.set("saved");
        if (idleTimer.current) clearTimeout(idleTimer.current);
        idleTimer.current = setTimeout(() => statusStore.set("idle"), 3000);
      } catch {
        statusStore.set("idle");
      }
    },
    [onSave, statusStore]
  );

  const { editor, flushSave, setContent, getJSON } = useArcadeEditor({
    initialContent,
    placeholder,
    readOnly,
    onSave: handleSave,
    ydoc,
    seedContent,
  });

  useImperativeHandle(
    ref,
    () => ({ flush: flushSave, setContent, getJSON }),
    [flushSave, setContent, getJSON]
  );

  // editor is null during SSR — show skeleton
  if (!editor) {
    return (
      <div
        className={
          chromeless
            ? `min-h-[300px] ${className}`
            : `rounded-xl border border-gray-200 bg-white overflow-hidden ${className}`
        }
      >
        <EditorSkeleton />
      </div>
    );
  }

  return (
    <div
      className={
        chromeless
          ? `relative flex flex-col ${className}`
          : `relative rounded-xl border border-gray-200 bg-white overflow-hidden flex flex-col ${className}`
      }
    >
      <RichTextProvider editor={editor}>
        {!readOnly && <RichTextToolbar />}
        <EditorContent
          editor={editor}
          className={
            chromeless
              ? "flex-1 min-h-[300px] focus-within:outline-none"
              : "flex-1 overflow-y-auto px-8 py-6 min-h-[300px] focus-within:outline-none"
          }
        />
        {!readOnly && <RichTextBubbles editor={editor} />}
      </RichTextProvider>
      {/* Autosave status — subtle footer (card mode only) */}
      {!readOnly && !chromeless && (
        <SaveStatusFooter store={statusStore} editor={editor} />
      )}
    </div>
  );
  })
);
