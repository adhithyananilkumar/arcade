// features/content/editor/components/ArcadeEditor.tsx
"use client";

import { EditorContent } from "@tiptap/react";
import { useCallback, useState } from "react";
import { EditorSkeleton } from "./EditorSkeleton";
import { EditorToolbar } from "./EditorToolbar";
import { useArcadeEditor } from "../hooks/useArcadeEditor";
import "../styles/editor.css";
import type { TiptapDocument } from "@/types/editor";

interface ArcadeEditorProps {
  /** Pre-populate editor with existing content. */
  initialContent?: TiptapDocument;
  /** Placeholder text shown when empty. */
  placeholder?: string;
  /** Read-only mode for learner view. */
  readOnly?: boolean;
  /**
   * Called with the serialised doc 2s after the last keystroke.
   * Writes to localStorage + backend draft endpoint.
   */
  onSave?: (doc: TiptapDocument) => void | Promise<void>;
  /** Extra classes applied to the outer wrapper. */
  className?: string;
}

type SaveStatus = "idle" | "saving" | "saved";

export function ArcadeEditor({
  initialContent,
  placeholder,
  readOnly = false,
  onSave,
  className = "",
}: ArcadeEditorProps) {
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

  const editor = useArcadeEditor({
    initialContent,
    placeholder,
    readOnly,
    onSave: handleSave,
  });

  // editor is null during SSR — show skeleton
  if (!editor) {
    return (
      <div className={`rounded-xl border border-gray-200 bg-white overflow-hidden ${className}`}>
        <EditorSkeleton />
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border border-gray-200 bg-white overflow-hidden flex flex-col ${className}`}
    >
      {!readOnly && (
        <EditorToolbar editor={editor} saveStatus={saveStatus} />
      )}
      <EditorContent
        editor={editor}
        className="flex-1 px-8 py-6 min-h-[400px] focus-within:outline-none"
      />
      {/* Character count — subtle footer */}
      {!readOnly && (
        <div className="flex items-center justify-end px-8 py-2 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            {editor.storage.characterCount?.characters?.() ?? 0} characters
          </span>
        </div>
      )}
    </div>
  );
}
