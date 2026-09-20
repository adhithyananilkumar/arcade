// features/content/editor/hooks/useArcadeEditor.ts
"use client";

import { useEditor } from "@tiptap/react";
import debounce from "lodash.debounce";
import { useCallback, useEffect, useMemo, useRef } from "react";
import type * as Y from "yjs";
import { buildExtensions } from "../extensions";
import type { TiptapDocument } from "@/shared/types/editor.types";
import { useAuthStore } from "@/infrastructure/auth/auth.store";
import {
  useCollaborativeDocument,
  type CollabStatus,
  type ActiveCollaborator,
} from "@/apps/creator/studio/core/collaboration/useCollaborativeDocument";

export type { CollabStatus, ActiveCollaborator };

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
  documentId?: string;
  contentType?: "course" | "workshop";
  /** Selection update callback */
  onSelectionUpdate?: (props: { editor: any }) => void;
  /** Document name/identifier for Hocuspocus collaboration (e.g. `lesson:<uuid>`) */
  documentName?: string;
}

const DEBOUNCE_MS = 2000;

export function useArcadeEditor({
  initialContent,
  placeholder,
  readOnly = false,
  onSave,
  ydoc,
  seedContent,
  documentId,
  contentType,
  onSelectionUpdate,
  documentName,
}: UseArcadeEditorOptions = {}) {
  const { user } = useAuthStore();

  // Room name is "{OWNER_TYPE}:{ownerId}" — the exact backend Document.OwnerType enum name (see
  // backend/collaboration/src/server.ts). Defaults to a course Lesson room; a caller editing any
  // other rich-text owner type (an event lesson) passes documentName explicitly.
  const effectiveDocumentName = documentName || (documentId ? `LESSON:${documentId}` : undefined);
  const [ownerType, ownerId] = effectiveDocumentName ? effectiveDocumentName.split(":") : [undefined, undefined];

  const {
    ydoc: resolvedYDoc,
    provider,
    status: statusState,
    collaborators,
  } = useCollaborativeDocument({
    ownerType: ownerType ?? "LESSON",
    ownerId,
    ydoc,
  });

  const onSaveRef = useRef(onSave);
  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  const runSave = useCallback((editorInstance: { getJSON: () => unknown }) => {
    // When connected to Hocuspocus, Hocuspocus handles server-side CRDT persistence.
    // We still notify onSave if provided (for instance, to update title/metadata or UI status).
    onSaveRef.current?.(editorInstance.getJSON() as TiptapDocument);
  }, []);

  const debouncedSave = useMemo(() => debounce(runSave, DEBOUNCE_MS), [runSave]);

  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  // Only treat this editor as collaborative when the caller actually supplied a Y.Doc or a
  // document name/id — useCollaborativeDocument always resolves *some* Y.Doc internally (it
  // needs one to construct), but that must not leak into plain, non-collaborative editors (quiz
  // text, comments, …) that never asked for one.
  const effectiveYDoc = ydoc || (effectiveDocumentName ? resolvedYDoc : undefined);

  const extensions = useMemo(
    () => buildExtensions(placeholder, effectiveYDoc, provider, user ? { id: user.id, name: user.fullName } : undefined, contentType),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveYDoc, contentType, provider, user] // placeholder changes shouldn't tear down the whole extension set
  );

  const editor = useEditor({
    // CRITICAL: prevents React hydration mismatch on Next.js SSR
    immediatelyRender: false,
    extensions,
    // In collaborative mode the Y.Doc supplies content; passing `content` too would
    // duplicate it. Only seed `content` in the non-collaborative path.
    content: effectiveYDoc ? undefined : initialContent ?? null,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      debouncedSave(editor);
    },
    onSelectionUpdate: onSelectionUpdate,
  });

  if (editor) {
    (editor as any).contentType = contentType;
  }

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
    if (editor && onSaveRef.current) {
      await onSaveRef.current(editor.getJSON() as TiptapDocument);
    }
  }, [editor, debouncedSave]);

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

  return { editor, flushSave, setContent, getJSON, provider, collabStatus: statusState, collaborators };
}
