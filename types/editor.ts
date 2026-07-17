// types/editor.ts
// Structured JSON Contract between the Tiptap authoring engine and the Course Renderer.
// Every document produced by Tiptap must conform to TiptapDocument.
// See: AGENTS.md §3 — Guiding Principle 4

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
