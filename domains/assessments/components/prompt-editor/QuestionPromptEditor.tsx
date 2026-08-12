"use client";

// domains/assessments/components/prompt-editor/QuestionPromptEditor.tsx
// A standalone, self-contained rich-text editor for question bank prompts. Deliberately NOT
// ArcadeEditor (apps/creator/editor) — a domain may never import from apps/ (ADR-001), and this
// editor must stay independent of the course content engine's Yjs/version-history/block-registry
// machinery. Extension set is intentionally small: text formatting, code blocks, math, images.
// No tables/embeds/Mermaid/Excalidraw/video — those stay exclusive to the content engine.

import { useEffect, useMemo, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";
import { Mathematics } from "@tiptap/extension-mathematics";
import { common, createLowlight } from "lowlight";
import "katex/dist/katex.min.css";
import "./prompt-editor.css";
import type { TiptapDocument } from "@/shared/types/editor.types";
import { PromptEditorToolbar } from "./PromptEditorToolbar";
import { ImagePickerDialog } from "./ImagePickerDialog";

const lowlight = createLowlight(common);

const EMPTY_DOC: TiptapDocument = { type: "doc", content: [] };

function buildExtensions(placeholder: string) {
  return [
    StarterKit.configure({
      codeBlock: false,
      link: { openOnClick: false, autolink: true },
    }),
    CodeBlockLowlight.configure({ lowlight }),
    Image.configure({ inline: false }),
    Mathematics.configure({ katexOptions: { throwOnError: false } }),
    Placeholder.configure({ placeholder }),
  ];
}

interface QuestionPromptEditorProps {
  value: TiptapDocument;
  onChange: (doc: TiptapDocument) => void;
  placeholder?: string;
  className?: string;
}

export function QuestionPromptEditor({
  value,
  onChange,
  placeholder = "Enter your question…",
  className = "",
}: QuestionPromptEditorProps) {
  const extensions = useMemo(() => buildExtensions(placeholder), [placeholder]);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const editor = useEditor({
    extensions,
    content: value && value.content?.length ? value : EMPTY_DOC,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChangeRef.current(editor.getJSON() as TiptapDocument);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none focus:outline-none min-h-[64px] px-3 py-2 prose-p:my-1 prose-headings:my-2",
      },
    },
  });

  // Re-sync content only when the identity of the underlying question changes (e.g. switching
  // which question is being edited), not on every keystroke — onUpdate already owns local edits.
  const lastSyncedRef = useRef(value);
  useEffect(() => {
    if (!editor || value === lastSyncedRef.current) return;
    lastSyncedRef.current = value;
    const current = JSON.stringify(editor.getJSON());
    const next = JSON.stringify(value && value.content?.length ? value : EMPTY_DOC);
    if (current !== next) {
      editor.commands.setContent(value && value.content?.length ? value : EMPTY_DOC, {
        emitUpdate: false,
      });
    }
  }, [editor, value]);

  return (
    <div
      className={`qb-prompt rounded-lg border border-gray-200 bg-white transition-colors focus-within:border-indigo-300 focus-within:ring-1 focus-within:ring-indigo-200 ${className}`}
    >
      {editor && (
        <PromptEditorToolbar editor={editor} onInsertImage={() => setImagePickerOpen(true)} />
      )}
      <EditorContent editor={editor} />
      <ImagePickerDialog
        open={imagePickerOpen}
        onOpenChange={setImagePickerOpen}
        onInsert={(src) => editor?.chain().focus().setImage({ src }).run()}
      />
    </div>
  );
}
