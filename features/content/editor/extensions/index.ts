// features/content/editor/extensions/index.ts
// Single source of truth for the shared Tiptap extension array.
// All four content-type editors import from this file — extensions are never duplicated.

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Collaboration from "@tiptap/extension-collaboration";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import StarterKit from "@tiptap/starter-kit";
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
      // Disable the built-in code block — we use CodeBlockLowlight instead
      codeBlock: false,
      // In collaborative mode Yjs owns undo/redo; StarterKit's history must be off.
      ...(ydoc ? { undoRedo: false as const } : {}),
    }),
    ...(ydoc ? [Collaboration.configure({ document: ydoc })] : []),
    Image.configure({
      allowBase64: false,
      inline: false,
    }),
    Link.configure({
      autolink: true,
      openOnClick: false,
      HTMLAttributes: {
        rel: "noopener noreferrer",
        target: "_blank",
      },
    }),
    Placeholder.configure({
      placeholder: placeholder ?? "Start writing your lesson content…",
    }),
    CharacterCount,
    CodeBlockLowlight.configure({
      lowlight,
    }),
    RoadmapNode,
    SlashCommand,
  ];
}
