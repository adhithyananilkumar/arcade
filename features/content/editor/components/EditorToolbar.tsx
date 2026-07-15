// features/content/editor/components/EditorToolbar.tsx
"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code2,
  Link,
  Image as ImageIcon,
  Minus,
  Undo,
  Redo,
  AlignLeft,
  Check,
  Loader2,
  Map,
} from "lucide-react";

interface ToolbarButtonProps {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  title: string;
  children: React.ReactNode;
}

function ToolbarButton({
  onClick,
  active,
  disabled,
  title,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault(); // prevent editor blur
        onClick();
      }}
      disabled={disabled}
      title={title}
      aria-label={title}
      className={[
        "flex h-7 w-7 items-center justify-center rounded transition-colors",
        "text-gray-500 hover:text-gray-900 hover:bg-gray-100",
        "disabled:opacity-30 disabled:cursor-not-allowed",
        active
          ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700"
          : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {children}
    </button>
  );
}

function Divider() {
  return (
    <div className="h-5 w-px bg-gray-200 mx-1" aria-hidden />
  );
}

interface EditorToolbarProps {
  editor: Editor | null;
  saveStatus?: "idle" | "saving" | "saved";
}

export function EditorToolbar({ editor, saveStatus = "idle" }: EditorToolbarProps) {
  if (!editor) return null;

  const addLink = () => {
    const url = window.prompt("Enter URL:");
    if (!url) return;
    editor.chain().focus().setLink({ href: url }).run();
  };

  const addImage = () => {
    const url = window.prompt("Enter image URL:");
    if (!url) return;
    editor.chain().focus().setImage({ src: url }).run();
  };

  const addRoadmap = () => {
    // Temporary hardcoded roadmapId or prompt
    const id = window.prompt("Enter roadmap ID (or leave blank for demo):") || "00000000-0000-0000-0000-000000000000";
    editor.chain().focus().insertContent({ type: "roadmap", attrs: { roadmapId: id } }).run();
  };

  return (
    <div
      className="sticky top-0 z-20 flex items-center flex-wrap gap-0.5 border-b border-gray-200 bg-white/95 backdrop-blur-sm px-4 py-2"
      role="toolbar"
      aria-label="Editor toolbar"
    >
      {/* History */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        title="Undo (Ctrl+Z)"
      >
        <Undo size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo size={14} />
      </ToolbarButton>

      <Divider />

      {/* Block type */}
      <ToolbarButton
        onClick={() => editor.chain().focus().setParagraph().run()}
        active={editor.isActive("paragraph")}
        title="Paragraph"
      >
        <AlignLeft size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        active={editor.isActive("heading", { level: 1 })}
        title="Heading 1"
      >
        <Heading1 size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        title="Heading 2"
      >
        <Heading2 size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        title="Heading 3"
      >
        <Heading3 size={14} />
      </ToolbarButton>

      <Divider />

      {/* Inline formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        title="Bold (Ctrl+B)"
      >
        <Bold size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        title="Italic (Ctrl+I)"
      >
        <Italic size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        active={editor.isActive("strike")}
        title="Strikethrough"
      >
        <Strikethrough size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        active={editor.isActive("code")}
        title="Inline Code (Ctrl+E)"
      >
        <Code size={14} />
      </ToolbarButton>

      <Divider />

      {/* Block structure */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        title="Bullet List"
      >
        <List size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        title="Ordered List"
      >
        <ListOrdered size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        active={editor.isActive("blockquote")}
        title="Blockquote"
      >
        <Quote size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        active={editor.isActive("codeBlock")}
        title="Code Block"
      >
        <Code2 size={14} />
      </ToolbarButton>

      <Divider />

      {/* Insert */}
      <ToolbarButton onClick={addLink} active={editor.isActive("link")} title="Insert Link">
        <Link size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={addImage} title="Insert Image">
        <ImageIcon size={14} />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        title="Horizontal Rule"
      >
        <Minus size={14} />
      </ToolbarButton>
      <ToolbarButton onClick={addRoadmap} title="Insert Roadmap">
        <Map size={14} />
      </ToolbarButton>

      {/* Auto-save status — right-aligned */}
      <div className="ml-auto flex items-center gap-1.5 text-xs">
        {saveStatus === "saving" && (
          <>
            <Loader2 size={11} className="animate-spin text-gray-400" />
            <span className="text-gray-400">Saving…</span>
          </>
        )}
        {saveStatus === "saved" && (
          <>
            <Check size={11} className="text-green-500" />
            <span className="text-green-600">Saved</span>
          </>
        )}
      </div>
    </div>
  );
}
