// apps/creator/editor/components/ImageAlignBubble.tsx
// Align/delete toolbar for a selected image.
//
// Replaces the vendor RichTextBubbleImage, which never appeared in this app. Verified
// in a live editor (/dev-editor-perf?mode=bubbles): clicking an image does NOT create a
// NodeSelection — ProseMirror leaves a TextSelection spanning the node
// (`{type:"text",anchor:0,head:1}`) even though `.ProseMirror-selectednode` is applied.
// So any `selection instanceof NodeSelection` test is false whenever an image is
// clicked, which is why both the vendor bubble and a NodeSelection-based one stay
// hidden. Detection therefore scans the selected range for an image node instead,
// mirroring what the vendor's own `shouldShow` does.
//
// The same TextSelection quirk breaks the vendor `setAlignImage` command: it resolves
// its target node type from `state.selection.node`, which is undefined here, so it
// falls back to the inline `image` type and silently no-ops on an `imageBlock`. Setting
// an explicit NodeSelection on the image first makes it resolve correctly.
"use client";

import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/react";
import type { Node as PMNode } from "@tiptap/pm/model";
import { AlignLeft, AlignCenter, AlignRight, Trash2 } from "lucide-react";

const IMAGE_NODE_NAMES = new Set(["imageBlock", "image"]);
const ALIGNMENTS = [
  { value: "left", icon: AlignLeft, label: "Align left" },
  { value: "center", icon: AlignCenter, label: "Align center" },
  { value: "right", icon: AlignRight, label: "Align right" },
] as const;

/** The image node inside the current selection, with its position, or null. */
export function findSelectedImage(editor: Editor): { pos: number; node: PMNode } | null {
  const { from, to } = editor.state.selection;
  let found: { pos: number; node: PMNode } | null = null;
  editor.state.doc.nodesBetween(from, to, (node, pos) => {
    if (found) return false;
    if (IMAGE_NODE_NAMES.has(node.type.name)) {
      found = { pos, node };
      return false;
    }
    return true;
  });
  return found;
}

export function ImageAlignBubble({ editor }: { editor: Editor }) {
  const current = findSelectedImage(editor);
  const activeAlign = current?.node.attrs.align ?? "center";

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="imageAlignBubble"
      options={{ placement: "top", offset: 8 }}
      shouldShow={({ editor: e }) => !!findSelectedImage(e)}
    >
      <div className="flex items-center gap-1 rounded-md border border-gray-200 bg-white p-1 shadow-md">
        {ALIGNMENTS.map(({ value, icon: Icon, label }) => (
          <button
            key={value}
            type="button"
            title={label}
            // Keep the ProseMirror selection intact — a focus change would drop the
            // image selection before the command runs.
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              const target = findSelectedImage(editor);
              if (!target) return;
              editor.chain().focus().setNodeSelection(target.pos).setAlignImage(value).run();
            }}
            className={`rounded p-1.5 ${
              activeAlign === value ? "bg-indigo-600 text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Icon size={14} />
          </button>
        ))}
        <div className="mx-1 h-4 w-px bg-gray-200" />
        <button
          type="button"
          title="Delete image"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const target = findSelectedImage(editor);
            if (!target) return;
            editor.chain().focus().setNodeSelection(target.pos).deleteSelection().run();
          }}
          className="rounded p-1.5 text-gray-600 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </BubbleMenu>
  );
}
