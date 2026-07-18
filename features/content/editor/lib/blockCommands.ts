// features/content/editor/lib/blockCommands.ts
// Single source of truth for the block-insert / turn-into command palette.
// Shared by three surfaces so they never drift:
//   • the slash (/) menu          → runs with the trigger `range` to delete the "/…"
//   • the "+" gutter button       → inserts a fresh block, then opens the slash menu
//   • the block-actions "Turn into" → runs with no range (selection is already inside the block)

import type { Editor, Range } from "@tiptap/react";
import {
  AlignLeft,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListChecks,
  Table as TableIcon,
  Video as YoutubeIcon,
  Quote,
  Code2,
  Minus,
  Image as ImageIcon,
  type LucideIcon,
} from "lucide-react";
import { getBlockDefinitions } from "../../blocks/registry";

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

/** Focused chain with the slash trigger removed (when a range is supplied). */
function at(editor: Editor, range?: Range) {
  const chain = editor.chain().focus();
  return range ? chain.deleteRange(range) : chain;
}

export function getBlockCommands(): BlockCommand[] {
  return [
    {
      id: "paragraph",
      title: "Text",
      description: "Plain paragraph",
      icon: AlignLeft,
      keywords: ["text", "paragraph", "p", "body"],
      run: (editor, range) => at(editor, range).setParagraph().run(),
    },
    {
      id: "heading1",
      title: "Heading 1",
      description: "Large section heading",
      icon: Heading1,
      keywords: ["h1", "title", "heading", "big"],
      run: (editor, range) => at(editor, range).toggleHeading({ level: 1 }).run(),
    },
    {
      id: "heading2",
      title: "Heading 2",
      description: "Medium section heading",
      icon: Heading2,
      keywords: ["h2", "subtitle", "heading"],
      run: (editor, range) => at(editor, range).toggleHeading({ level: 2 }).run(),
    },
    {
      id: "heading3",
      title: "Heading 3",
      description: "Small section heading",
      icon: Heading3,
      keywords: ["h3", "heading"],
      run: (editor, range) => at(editor, range).toggleHeading({ level: 3 }).run(),
    },
    {
      id: "bulletList",
      title: "Bullet list",
      description: "Unordered list",
      icon: List,
      keywords: ["bullet", "unordered", "ul", "list"],
      run: (editor, range) => at(editor, range).toggleBulletList().run(),
    },
    {
      id: "orderedList",
      title: "Numbered list",
      description: "Ordered list",
      icon: ListOrdered,
      keywords: ["numbered", "ordered", "ol", "list"],
      run: (editor, range) => at(editor, range).toggleOrderedList().run(),
    },
    {
      id: "taskList",
      title: "To-do list",
      description: "Checklist with checkboxes",
      icon: ListChecks,
      keywords: ["todo", "task", "checkbox", "checklist", "check"],
      run: (editor, range) => at(editor, range).toggleTaskList().run(),
    },
    {
      id: "blockquote",
      title: "Quote",
      description: "Callout / blockquote",
      icon: Quote,
      keywords: ["quote", "blockquote", "callout"],
      run: (editor, range) => at(editor, range).toggleBlockquote().run(),
    },
    {
      id: "codeBlock",
      title: "Code block",
      description: "Syntax-highlighted code",
      icon: Code2,
      keywords: ["code", "snippet", "pre", "```"],
      run: (editor, range) => at(editor, range).toggleCodeBlock().run(),
    },
    {
      id: "horizontalRule",
      title: "Divider",
      description: "Horizontal rule",
      icon: Minus,
      keywords: ["divider", "hr", "rule", "separator", "line"],
      run: (editor, range) => at(editor, range).setHorizontalRule().run(),
    },
    {
      id: "image",
      title: "Image",
      description: "Embed an image by URL",
      icon: ImageIcon,
      keywords: ["image", "picture", "photo", "img"],
      run: (editor, range) => {
        const url = window.prompt("Enter image URL:");
        if (!url) {
          // Still clear the "/query" so the editor isn't left with stray text.
          if (range) editor.chain().focus().deleteRange(range).run();
          return;
        }
        at(editor, range).setImage({ src: url }).run();
      },
    },
    {
      id: "table",
      title: "Table",
      description: "Insert a 3×3 table",
      icon: TableIcon,
      keywords: ["table", "grid", "rows", "columns", "cells"],
      run: (editor, range) =>
        at(editor, range)
          .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
          .run(),
    },
    {
      id: "youtube",
      title: "YouTube",
      description: "Embed a YouTube video",
      icon: YoutubeIcon,
      keywords: ["youtube", "video", "embed", "yt"],
      run: (editor, range) => {
        const url = window.prompt("Enter YouTube URL:");
        if (!url) {
          if (range) editor.chain().focus().deleteRange(range).run();
          return;
        }
        at(editor, range).setYoutubeVideo({ src: url }).run();
      },
    },
    // ── Registry-backed blocks (button, toggle, callout, roadmap, …) ────────
    // Defined once per block in features/content/blocks/<name>/index.ts — see registry.ts.
    ...getBlockDefinitions()
      .map((b) => b.command)
      .filter((c): c is BlockCommand => Boolean(c)),
  ];
}

/** Commands offered in the "Turn into" submenu — block-type conversions only. */
export function getTurnIntoCommands(): BlockCommand[] {
  const convertible = new Set([
    "paragraph",
    "heading1",
    "heading2",
    "heading3",
    "bulletList",
    "orderedList",
    "taskList",
    "blockquote",
    "codeBlock",
  ]);
  return getBlockCommands().filter((c) => convertible.has(c.id));
}

/** Filter the palette by a slash-menu query (matches title + keywords). */
export function filterBlockCommands(query: string): BlockCommand[] {
  const q = query.trim().toLowerCase();
  if (!q) return getBlockCommands();
  return getBlockCommands().filter(
    (c) =>
      c.title.toLowerCase().includes(q) ||
      c.keywords.some((k) => k.includes(q))
  );
}
