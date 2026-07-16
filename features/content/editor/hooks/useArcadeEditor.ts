// features/content/editor/hooks/useArcadeEditor.ts
"use client";

import { useEditor } from "@tiptap/react";
import debounce from "lodash.debounce";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type * as Y from "yjs";
import { buildExtensions } from "../extensions";
import type { TiptapDocument } from "@/types/editor";

export interface UseArcadeEditorOptions {
  /**
   * Pre-populate the editor with existing content. Ignored in collaborative mode
   * (when `ydoc` is set) — there the Y.Doc is the source of truth; use `seedContent`
   * to migrate legacy JSON into an empty Y.Doc instead.
   */
  initialContent?: TiptapDocument;
  /** Placeholder text shown when the editor is empty. */
  placeholder?: string;
  /** Set to true for learner view — editor is rendered read-only. */
  readOnly?: boolean;
  /**
   * Called with the serialised document 2 s after the last keystroke.
   * Defaults to a no-op if not provided.
   *
   * @param doc The current Tiptap document as a JSON object
   */
  onSave?: (doc: TiptapDocument) => void | Promise<void>;
  /**
   * Collaborative Y.Doc to bind the editor to. When provided, the editor's content
   * lives in this CRDT (the version-history source of truth) rather than in
   * `initialContent`. The caller owns the Y.Doc and hydrates it from persisted
   * state before mount.
   */
  ydoc?: Y.Doc;
  /**
   * Legacy Tiptap JSON to seed into the Y.Doc when it is empty (i.e. a lesson that
   * predates version history and has no persisted CRDT state). Applied once, after
   * mount; the resulting edit persists the migrated content on the next auto-save.
   */
  seedContent?: TiptapDocument;
}

const DEBOUNCE_MS = 2000;

/**
 * Abstraction over Tiptap's useEditor.
 *
 * Handles:
 * - SSR-safe rendering (immediatelyRender: false — mandatory for Next.js)
 * - Optional Yjs collaborative binding (version-history substrate)
 * - Debounced auto-save via onSave prop
 * - Memory-leak-safe cleanup (debouncedSave.cancel on unmount)
 */
export function useArcadeEditor({
  initialContent,
  placeholder,
  readOnly = false,
  onSave,
  ydoc,
  seedContent,
}: UseArcadeEditorOptions = {}) {
  const debouncedSave = useMemo(
    () =>
      debounce((doc: TiptapDocument) => {
        if (onSave) {
          onSave(doc);
        }
      }, DEBOUNCE_MS),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [] // stable ref — onSave is captured at creation; use closure pattern
  );

  // Cancel pending debounce on unmount to prevent state updates after unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  const editor = useEditor({
    // CRITICAL: prevents React hydration mismatch on Next.js SSR
    immediatelyRender: false,
    extensions: buildExtensions(placeholder, ydoc),
    // In collaborative mode the Y.Doc supplies content; passing `content` too would
    // duplicate it. Only seed `content` in the non-collaborative path.
    content: ydoc ? undefined : initialContent ?? null,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      debouncedSave(editor.getJSON() as TiptapDocument);
    },
  });

  // ── One-time legacy seeding ─────────────────────────────────────────────────
  // A lesson that predates version history has JSON but no persisted CRDT state.
  // On first mount its Y.Doc is empty, so we write the legacy JSON into it once;
  // that edit is then persisted as the document's initial CRDT state.
  const seededRef = useRef(false);
  useEffect(() => {
    if (!editor || !ydoc || seededRef.current) return;
    seededRef.current = true;
    if (editor.isEmpty && seedContent) {
      editor.commands.setContent(seedContent);
    }
  }, [editor, ydoc, seedContent]);

  /**
   * Persist the current document immediately, bypassing the debounce. Returns a
   * promise that resolves once onSave settles — call this before navigating away
   * so no in-flight edits are lost.
   */
  const flushSave = useCallback(async () => {
    debouncedSave.cancel();
    if (editor && onSave) {
      await onSave(editor.getJSON() as TiptapDocument);
    }
  }, [editor, onSave, debouncedSave]);

  /**
   * Replace the editor's content — used to restore a past version. In collaborative
   * mode this mutates the bound Y.Doc, so the change is recorded in history and
   * persisted by the auto-save that follows (non-destructive).
   */
  const setContent = useCallback(
    (doc: TiptapDocument) => {
      editor?.commands.setContent(doc);
    },
    [editor]
  );

  /** Current document as JSON, or null before the editor is ready. */
  const getJSON = useCallback(
    () => (editor ? (editor.getJSON() as TiptapDocument) : null),
    [editor]
  );

  return { editor, flushSave, setContent, getJSON };
}
