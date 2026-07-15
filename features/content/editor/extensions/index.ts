// features/content/editor/extensions/index.ts
// Single source of truth for the shared Tiptap extension array.
// All four content-type editors import from this file — extensions are never duplicated.

import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";
import StarterKit from "@tiptap/starter-kit";
import { createLowlight, common } from "lowlight";
import { RoadmapNode } from "../roadmap/extensions/roadmap";

const lowlight = createLowlight(common);

export function buildExtensions(placeholder?: string) {
  return [
    StarterKit.configure({
      // Disable the built-in code block — we use CodeBlockLowlight instead
      codeBlock: false,
    }),
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
  ];
}
