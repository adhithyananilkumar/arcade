// features/content/editor/components/ArcadeEditor.tsx
"use client";

import { EditorContent } from "@tiptap/react";
import { forwardRef, useCallback, useImperativeHandle, useState } from "react";
import type * as Y from "yjs";
import { EditorSkeleton } from "./EditorSkeleton";
import { EditorToolbar } from "./EditorToolbar";
import { BlockHandle } from "./BlockHandle";
import { useArcadeEditor } from "../hooks/useArcadeEditor";
import "../styles/editor.css";
import type { TiptapDocument } from "@/shared/types/editor.types";

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
   * (Figma-style). The host owns padding + scrolling. The formatting toolbar and
   * character-count footer are suppressed in favour of {@link floatingToolbar}.
   */
  chromeless?: boolean;
  /** Render the formatting toolbar as a floating bottom-centre pill instead of a top strip. */
  floatingToolbar?: boolean;
}

type SaveStatus = "idle" | "saving" | "saved";

export const ArcadeEditor = forwardRef<ArcadeEditorHandle, ArcadeEditorProps>(
  function ArcadeEditor(
    {
      initialContent,
      placeholder,
      readOnly = false,
      onSave,
      ydoc,
      seedContent,
      className = "",
      chromeless = false,
      floatingToolbar = false,
    },
    ref
  ) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const handleSave = useCallback(
    async (doc: TiptapDocument) => {
      setSaveStatus("saving");
      try {
        await onSave?.(doc);
        setSaveStatus("saved");
        // Reset to idle after 3s
        setTimeout(() => setSaveStatus("idle"), 3000);
      } catch {
        setSaveStatus("idle");
      }
    },
    [onSave]
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
          ? `flex flex-col ${className}`
          : `rounded-xl border border-gray-200 bg-white overflow-hidden flex flex-col ${className}`
      }
    >
      {!readOnly && !floatingToolbar && (
        <EditorToolbar editor={editor} saveStatus={saveStatus} />
      )}
      <EditorContent
        editor={editor}
        className={
          chromeless
            ? "flex-1 min-h-[300px] focus-within:outline-none"
            : "flex-1 overflow-y-auto px-8 py-6 min-h-[300px] focus-within:outline-none"
        }
      />
      {/* Notion-style block gutter: drag-to-reorder handle + "+" add-block button.
          Self-positions against the hovered block; edit mode only. */}
      {!readOnly && <BlockHandle editor={editor} />}
      {/* Character count — subtle footer (card mode only) */}
      {!readOnly && !chromeless && (
        <div className="flex items-center justify-end px-8 py-2 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            {editor.storage.characterCount?.characters?.() ?? 0} characters
          </span>
        </div>
      )}
      {/* Floating bottom-centre toolbar (Figma-style) */}
      {!readOnly && floatingToolbar && (
        <EditorToolbar editor={editor} saveStatus={saveStatus} variant="floating" />
      )}
    </div>
  );
  }
);
