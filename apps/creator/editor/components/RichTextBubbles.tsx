// apps/creator/editor/components/RichTextBubbles.tsx
// Direct port of the reactjs-tiptap-editor demo's per-node bubble menus, drag handle, and
// slash command list — plus our own backend-tied blocks (button/toggle/quiz/roadmap)
// merged into the slash menu's default command groups (they have no library equivalent,
// so they aren't in `renderCommandListDefault`'s output on their own).
"use client";

import { memo, useMemo } from "react";
import { useEditorState, type Editor } from "@tiptap/react";
import { NodeSelection } from "@tiptap/pm/state";
// These stylesheets belong to the Excalidraw / easydrawer / KaTeX surfaces, which are
// only reachable through the bubble layer. Importing them here rather than in
// ArcadeEditor keeps them in this lazily-loaded chunk instead of the route entry.
import "@excalidraw/excalidraw/index.css";
import "easydrawer/styles.css";
import "katex/dist/katex.min.css";
import {
  RichTextBubbleColumns,
  RichTextBubbleDrawer,
  RichTextBubbleExcalidraw,
  RichTextBubbleIframe,
  RichTextBubbleKatex,
  RichTextBubbleLink,
  RichTextBubbleImage,
  RichTextBubbleVideo,
  RichTextBubbleImageGif,
  RichTextBubbleMermaid,
  RichTextBubbleTable,
  RichTextBubbleText,
  RichTextBubbleTwitter,
  RichTextBubbleCallout,
  RichTextBubbleCodeBlock,
  RichTextBubbleMenuDragHandle,
} from "reactjs-tiptap-editor/bubble";
import { SlashCommandList, renderCommandListDefault } from "reactjs-tiptap-editor/slashcommand";
import { useLocale } from "reactjs-tiptap-editor/locale-bundle";
import { getBlockDefinitions } from "@/domains/courses";

/**
 * Node types that can appear in the ancestor chain of a plain-text caret without any
 * node-specific bubble being relevant. Anything outside this set (a table cell, a
 * callout, a column, an image…) means a node bubble may need to be on screen.
 *
 * Deliberately conservative: unknown node types fall outside the set, so the default
 * is to mount everything. A wrong guess costs performance, never a missing menu.
 */
const PLAIN_TEXT_ANCESTORS = new Set([
  "doc",
  "paragraph",
  "heading",
  "text",
  "bulletList",
  "orderedList",
  "listItem",
  "taskList",
  "taskItem",
  "blockquote",
  // NOTE: codeBlock is deliberately absent — RichTextBubbleCodeBlock needs to mount
  // when the caret is inside one.
]);

/**
 * True when the caret is sitting in ordinary prose, so none of the 13 node-specific
 * bubbles can possibly need to render.
 *
 * Why this matters: every mounted bubble subscribes to the editor and re-evaluates on
 * every transaction, and the library's buttons call `editor.can()` — which dry-runs a
 * command against a copy of the document. That cost scales with document size. Measured
 * on a 120-paragraph lesson, the 13 node bubbles alone accounted for ~1,055 ms of the
 * ~1,770 ms the bubble layer spent per 49 keystrokes.
 */
function isPlainTextContext(editor: Editor): boolean {
  const { selection } = editor.state;
  // A NodeSelection means a node is directly selected — always show node bubbles.
  // Not `constructor.name` (minification mangles it) and not `instanceof` alone: this
  // project currently resolves duplicate copies of some editor packages, which makes
  // cross-instance `instanceof` unreliable. The structural `node` property is the
  // distinguishing feature of a NodeSelection and survives both problems.
  if (selection instanceof NodeSelection || "node" in selection) return false;
  const { $from } = selection;
  for (let depth = 0; depth <= $from.depth; depth++) {
    if (!PLAIN_TEXT_ANCESTORS.has($from.node(depth).type.name)) return false;
  }
  // A non-collapsed selection can span into a node that the ancestor walk above misses.
  if (!selection.empty) {
    const { $to } = selection;
    for (let depth = 0; depth <= $to.depth; depth++) {
      if (!PLAIN_TEXT_ANCESTORS.has($to.node(depth).type.name)) return false;
    }
  }
  return true;
}

interface RichTextBubblesProps {
  editor: Editor;
}

// The bubble layer mounts up to 16 ProseMirror-backed menus plus the slash list and the
// drag handle. Re-rendering it on unrelated host state was the single largest source of
// typing stalls, hence the memo; the node-specific menus are additionally gated on the
// caret actually being somewhere they could apply.
export const RichTextBubbles = memo(function RichTextBubbles({ editor }: RichTextBubblesProps) {
  const { t } = useLocale();

  // Cheap selector: walks at most a handful of ancestor nodes, returns a boolean, so
  // this subscription costs O(selection depth) rather than O(document).
  const plainText = useEditorState({
    editor,
    selector: ({ editor }) => isPlainTextContext(editor),
  });

  const commandList = useMemo(() => {
    const defaults = renderCommandListDefault({ t });
    const customCommands = getBlockDefinitions()
      .map((b) => b.command)
      .filter((c): c is NonNullable<typeof c> => Boolean(c))
      .map((c) => ({
        name: c.id,
        label: c.title,
        description: c.description,
        aliases: c.keywords,
        action: ({ editor: e, range }: { editor: Editor; range: { from: number; to: number } }) =>
          c.run(e, range),
      }));
    if (customCommands.length === 0) return defaults;
    return [...defaults, { name: "course-blocks", title: "Course Blocks", commands: customCommands }];
  }, [t]);

  return (
    <>
      {/* Always mounted: these must be listening while the user types in prose. */}
      <RichTextBubbleText />
      <RichTextBubbleLink />
      <SlashCommandList commandList={commandList} />
      <RichTextBubbleMenuDragHandle />

      {/* Node-specific menus — mounted only once the caret is somewhere one of them
          could apply. In plain prose none of them can match, so paying their
          per-transaction cost on every keystroke buys nothing. */}
      {!plainText && (
        <>
          <RichTextBubbleColumns />
          <RichTextBubbleDrawer />
          <RichTextBubbleExcalidraw />
          <RichTextBubbleIframe />
          <RichTextBubbleKatex />

          <RichTextBubbleImage />
          <RichTextBubbleVideo />
          <RichTextBubbleImageGif />

          <RichTextBubbleMermaid />
          <RichTextBubbleTable />
          <RichTextBubbleTwitter />
          <RichTextBubbleCallout />
          <RichTextBubbleCodeBlock />
        </>
      )}
    </>
  );
});
