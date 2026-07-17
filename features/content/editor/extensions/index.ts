// features/content/editor/extensions/index.ts
// Single source of truth for the shared Tiptap extension array.
// All content-type editors import from this file — extensions are never duplicated.

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Collaboration from "@tiptap/extension-collaboration";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import StarterKit from "@tiptap/starter-kit";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Highlight } from "@tiptap/extension-highlight";
import { TextAlign } from "@tiptap/extension-text-align";
import { TextStyleKit } from "@tiptap/extension-text-style";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Typography } from "@tiptap/extension-typography";
import { TableKit } from "@tiptap/extension-table";
import { Youtube } from "@tiptap/extension-youtube";
import { Focus } from "@tiptap/extensions";
import { createLowlight, common } from "lowlight";
import type * as Y from "yjs";
import { RoadmapNode } from "../roadmap/extensions/roadmap";
import { SlashCommand } from "./slash-command";

const lowlight = createLowlight(common);

/**
 * Build the shared Tiptap extension array.
 *
 * When a `ydoc` is supplied the editor runs in collaborative mode: content lives
 * in the Y.Doc (the CRDT source of truth for version history) and StarterKit's
 * own undo/redo is disabled because Collaboration provides history via Yjs.
 */
export function buildExtensions(placeholder?: string, ydoc?: Y.Doc) {
  return [
    StarterKit.configure({
      // Disable the built-in code block — we use CodeBlockLowlight instead.
      codeBlock: false,
      // In collaborative mode Yjs owns undo/redo; StarterKit's history must be off.
      ...(ydoc ? { undoRedo: false as const } : {}),
      // Link ships inside StarterKit v3 — configure it here rather than adding a
      // second Link extension (a duplicate would trigger Tiptap's duplicate-name
      // warning and unstable behaviour).
      link: {
        autolink: true,
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      },
      // Fatter, indigo drop cursor so block drag-and-drop reads clearly.
      dropcursor: { color: "#6366f1", width: 3 },
    }),
    ...(ydoc ? [Collaboration.configure({ document: ydoc })] : []),

    // ── Media ──────────────────────────────────────────────────────────────
    Image.configure({ allowBase64: false, inline: false }),
    Youtube.configure({
      controls: true,
      nocookie: true,
      HTMLAttributes: { class: "arcade-youtube" },
    }),

    // ── Block types ────────────────────────────────────────────────────────
    TaskList,
    TaskItem.configure({ nested: true }),
    TableKit.configure({ table: { resizable: true } }),
    CodeBlockLowlight.configure({ lowlight }),

    // ── Inline marks & text styling ────────────────────────────────────────
    Highlight.configure({ multicolor: true }),
    Subscript,
    Superscript,
    TextStyleKit, // TextStyle + Color + FontFamily + BackgroundColor + LineHeight
    TextAlign.configure({ types: ["heading", "paragraph"] }),

    // ── Editing niceties ───────────────────────────────────────────────────
    Typography, // smart quotes, dashes, arrows, fractions, ©/™ …
    Focus.configure({ className: "has-focus", mode: "shallowest" }),
    Placeholder.configure({
      placeholder: placeholder ?? "Start writing your lesson content…",
      includeChildren: true,
    }),
    CharacterCount,

    // ── Domain nodes & command surfaces ────────────────────────────────────
    RoadmapNode,
    SlashCommand,
  ];
}
