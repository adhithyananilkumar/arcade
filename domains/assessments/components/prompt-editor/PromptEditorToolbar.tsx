"use client";

// domains/assessments/components/prompt-editor/PromptEditorToolbar.tsx
// A small fixed toolbar — not the content engine's 43-button chrome. Just what a question
// prompt needs: text formatting, headings, lists, blockquote, link, code block, math, image.

import { useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link2,
  Code,
  Sigma,
  ImagePlus,
} from "lucide-react";

function ToolbarButton({
  active,
  disabled,
  title,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center rounded-md transition-colors disabled:cursor-not-allowed disabled:opacity-30 ${
        active ? "bg-indigo-50 text-indigo-600" : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span className="mx-1 h-4 w-px bg-gray-200" />;
}

export function PromptEditorToolbar({
  editor,
  onInsertImage,
}: {
  editor: Editor;
  onInsertImage: () => void;
}) {
  const [, forceRender] = useState(0);

  // Re-render on every transaction so active states (bold/heading/etc.) stay accurate.
  useEffect(() => {
    const rerender = () => forceRender((n) => n + 1);
    editor.on("transaction", rerender);
    return () => {
      editor.off("transaction", rerender);
    };
  }, [editor]);

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const insertMath = () => {
    const latex = window.prompt("LaTeX expression", "");
    if (!latex) return;
    editor.chain().focus().insertInlineMath({ latex }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-gray-100 px-2 py-1.5">
      <ToolbarButton
        title="Bold"
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold size={14} />
      </ToolbarButton>
      <ToolbarButton
        title="Italic"
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic size={14} />
      </ToolbarButton>
      <ToolbarButton
        title="Underline"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline size={14} />
      </ToolbarButton>
      <ToolbarButton
        title="Strikethrough"
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough size={14} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        title="Heading 1"
        active={editor.isActive("heading", { level: 1 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 size={14} />
      </ToolbarButton>
      <ToolbarButton
        title="Heading 2"
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 size={14} />
      </ToolbarButton>
      <ToolbarButton
        title="Heading 3"
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 size={14} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton
        title="Bullet list"
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List size={14} />
      </ToolbarButton>
      <ToolbarButton
        title="Numbered list"
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered size={14} />
      </ToolbarButton>
      <ToolbarButton
        title="Blockquote"
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote size={14} />
      </ToolbarButton>

      <Divider />

      <ToolbarButton title="Link" active={editor.isActive("link")} onClick={setLink}>
        <Link2 size={14} />
      </ToolbarButton>
      <ToolbarButton
        title="Code block"
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        <Code size={14} />
      </ToolbarButton>
      <ToolbarButton title="Math (LaTeX)" onClick={insertMath}>
        <Sigma size={14} />
      </ToolbarButton>
      <ToolbarButton title="Image" onClick={onInsertImage}>
        <ImagePlus size={14} />
      </ToolbarButton>
    </div>
  );
}
