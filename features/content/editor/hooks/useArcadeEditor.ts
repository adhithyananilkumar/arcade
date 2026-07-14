// features/content/editor/hooks/useArcadeEditor.ts
"use client";

import { useEditor } from "@tiptap/react";
import debounce from "lodash.debounce";
import { useCallback, useEffect, useMemo } from "react";
import { buildExtensions } from "../extensions";
import type { TiptapDocument } from "@/types/editor";

export interface UseArcadeEditorOptions {
  /** Pre-populate the editor with existing content (e.g., restored from DB or draft). */
  initialContent?: TiptapDocument;
  /** Placeholder text shown when the editor is empty. */
  placeholder?: string;
  /** Set to true for learner view — editor is rendered read-only. */
  readOnly?: boolean;
  /**
   * Called with the serialised document 2 s after the last keystroke.
   * Defaults to a no-op if not provided.
   * Swap this for an API call when the backend is ready — no other changes needed.
   *
   * @param doc The current Tiptap document as a JSON object
   */
  onSave?: (doc: TiptapDocument) => void | Promise<void>;
  /**
   * Yjs collaboration provider slot — reserved for Phase 2.
   * Wiring collaboration in = one line change, zero component refactoring.
   * collaborationProvider?: CollaborationProvider;
   */
}

const DEBOUNCE_MS = 2000;

/**
 * Abstraction over Tiptap's useEditor.
 *
 * Handles:
 * - SSR-safe rendering (immediatelyRender: false — mandatory for Next.js)
 * - Debounced auto-save via onSave prop
 * - Memory-leak-safe cleanup (debouncedSave.cancel on unmount)
 */
export function useArcadeEditor({
  initialContent,
  placeholder,
  readOnly = false,
  onSave,
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
    extensions: buildExtensions(placeholder),
    content: initialContent ?? null,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      debouncedSave(editor.getJSON() as TiptapDocument);
    },
  });

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

  return { editor, flushSave };
}
