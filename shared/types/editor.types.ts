// types/editor.ts
// Structured JSON Contract between the Tiptap authoring engine and the Course Renderer.
// Every document produced by Tiptap must conform to TiptapDocument.
// See: AGENTS.md §3 — Guiding Principle 4

import type { Editor, Range } from "@tiptap/react";
import type { LucideIcon } from "lucide-react";

export type TiptapNodeType =
  | "doc"
  | "paragraph"
  | "heading"
  | "text"
  | "bulletList"
  | "orderedList"
  | "listItem"
  | "taskList"
  | "taskItem"
  | "codeBlock"
  | "blockquote"
  | "horizontalRule"
  | "image"
  | "hardBreak"
  | "table"
  | "tableRow"
  | "tableCell"
  | "tableHeader"
  | "youtube"
  // Custom renderer nodes (future Course Renderer targets):
  | "video-player"
  | "pdf-viewer"
  | "quiz-block"
  | "resource-card"
  | "roadmap"
  // Registry-backed blocks — see features/content/blocks/registry.ts:
  | "cta-button"
  | "toggle"
  | "callout"
  | string;

export type TiptapMarkType =
  | "bold"
  | "italic"
  | "strike"
  | "code"
  | "link"
  | "highlight"
  | "subscript"
  | "superscript"
  | "textStyle";

export interface TiptapMark {
  type: TiptapMarkType;
  attrs?: Record<string, unknown>;
}

export interface TiptapNode {
  type: TiptapNodeType;
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
  marks?: TiptapMark[];
  text?: string;
}

export interface TiptapDocument {
  type: "doc";
  content: TiptapNode[];
}

export interface BlockCommand {
  /** Stable id, used as React key and for equality checks. */
  id: string;
  /** Human label shown in menus. */
  title: string;
  /** One-line description shown under the title in the slash menu. */
  description: string;
  /** Icon rendered in the gutter menus. */
  icon: LucideIcon;
  /** Extra fuzzy-search terms for the slash menu (all lowercase). */
  keywords: string[];
  /**
   * Apply the command. When invoked from the slash menu, `range` is the "/query"
   * range to delete first; the "+" button and "Turn into" pass no range.
   */
  run: (editor: Editor, range?: Range) => void;
}
