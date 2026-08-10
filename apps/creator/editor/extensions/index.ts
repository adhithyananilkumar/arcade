// apps/creator/editor/extensions/index.ts
// Single source of truth for the shared Tiptap extension array.
//
// The editing *chrome* (toolbar, bubble menus, slash menu, drag handle) now comes from
// reactjs-tiptap-editor — see apps/creator/editor/components/ArcadeEditor.tsx. This file
// only assembles the underlying Tiptap extension set: reactjs-tiptap-editor's node/mark
// extensions (each configured to use our own backend upload endpoint), plus our own
// backend-tied domain blocks (button/toggle/quiz/roadmap) that have no library equivalent.

import { Document } from "@tiptap/extension-document";
import { HardBreak } from "@tiptap/extension-hard-break";
import { ListItem } from "@tiptap/extension-list";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Text } from "@tiptap/extension-text";
import { TextStyle } from "@tiptap/extension-text-style";
import { CharacterCount, Dropcursor, Gapcursor, Placeholder, TrailingNode } from "@tiptap/extensions";
import Collaboration from "@tiptap/extension-collaboration";
import { CollaborationCursor } from "./collaborationCursor";
import { createLowlight, common } from "lowlight";
import type * as Y from "yjs";

import { Attachment } from "reactjs-tiptap-editor/attachment";
import { Blockquote } from "reactjs-tiptap-editor/blockquote";
import { Bold } from "reactjs-tiptap-editor/bold";
import { BulletList } from "reactjs-tiptap-editor/bulletlist";
import { Callout } from "reactjs-tiptap-editor/callout";
import { Clear } from "reactjs-tiptap-editor/clear";
import { Code } from "reactjs-tiptap-editor/code";
import { CodeBlock } from "reactjs-tiptap-editor/codeblock";
import { CodeView } from "reactjs-tiptap-editor/codeview";
import { Color } from "reactjs-tiptap-editor/color";
import { Column, ColumnNode, MultipleColumnNode } from "reactjs-tiptap-editor/column";
import { Emoji } from "reactjs-tiptap-editor/emoji";
import { Excalidraw } from "reactjs-tiptap-editor/excalidraw";
import { ExportWord } from "reactjs-tiptap-editor/exportword";
import { FontFamily } from "reactjs-tiptap-editor/fontfamily";
import { FontSize } from "reactjs-tiptap-editor/fontsize";
import { Heading } from "reactjs-tiptap-editor/heading";
import { Highlight } from "reactjs-tiptap-editor/highlight";
import { History } from "reactjs-tiptap-editor/history";
import { HorizontalRule } from "reactjs-tiptap-editor/horizontalrule";
import { Iframe } from "reactjs-tiptap-editor/iframe";
import { Image } from "reactjs-tiptap-editor/image";
import { ImageGif } from "reactjs-tiptap-editor/imagegif";
import { ImportWord } from "reactjs-tiptap-editor/importword";
import { Indent } from "reactjs-tiptap-editor/indent";
import { Italic } from "reactjs-tiptap-editor/italic";
import { Katex } from "reactjs-tiptap-editor/katex";
import { LineHeight } from "reactjs-tiptap-editor/lineheight";
import { Link } from "reactjs-tiptap-editor/link";
import { Mention } from "reactjs-tiptap-editor/mention";
import { Mermaid } from "reactjs-tiptap-editor/mermaid";
import { MoreMark } from "reactjs-tiptap-editor/moremark";
import { OrderedList } from "reactjs-tiptap-editor/orderedlist";
import { SearchAndReplace } from "reactjs-tiptap-editor/searchandreplace";
import { SlashCommand } from "reactjs-tiptap-editor/slashcommand";
import { Strike } from "reactjs-tiptap-editor/strike";
import { Table } from "reactjs-tiptap-editor/table";
import { TaskList } from "reactjs-tiptap-editor/tasklist";
import { TextAlign } from "reactjs-tiptap-editor/textalign";
import { TextDirection } from "reactjs-tiptap-editor/textdirection";
import { TextUnderline } from "reactjs-tiptap-editor/textunderline";
import { Video } from "reactjs-tiptap-editor/video";

import { getBlockExtensions } from "@/domains/courses";
import { EMOJI_LIST } from "../lib/emojiList";
import { uploadImageFile, uploadMediaFile } from "../lib/imageUpload";
import { searchUsersForMention } from "../lib/mentionSuggestion";

const lowlight = createLowlight(common);

// Both lists replace the library's literal "Default" sentinel entry with the app's
// real base value (Geist / 16px — same values as the `localeActions.setMessage`
// trigger-label override in RichTextToolbar.tsx, and the `.ProseMirror` rule in
// editor.css). One entry, not two: it's both what unstyled text already looks like
// *and* a normal, explicitly-selectable preset, so there's nothing left to say
// "Default" — that word never described anything the other entry didn't already
// cover, once the trigger stopped using it too.
const FONT_FAMILY_LIST = [
  "Geist",
  "Inter",
  "Comic Sans MS, Comic Sans",
  "serif",
  "cursive",
  "Arial",
  "Arial Black",
  "Georgia",
  "Impact",
  "Tahoma",
  "Times New Roman",
  "Verdana",
  "Courier New",
  "Lucida Console",
  "Monaco",
  "monospace",
];
const FONT_SIZE_LIST = [
  "16px",
  "10px",
  "11px",
  "12px",
  "14px",
  "18px",
  "20px",
  "22px",
  "24px",
  "26px",
  "28px",
  "36px",
  "48px",
  "72px",
];

/** Doc-level schema needs to allow the `columns` node as a top-level sibling of `block`. */
const DocumentColumn = Document.extend({
  content: "(block|columns)+",
});

const BaseKit = [
  DocumentColumn,
  Text,
  Dropcursor.configure({ color: "#6366f1", width: 2 }),
  Gapcursor,
  HardBreak,
  Paragraph,
  TrailingNode,
  ListItem,
  TextStyle,
];

/**
 * Build the shared Tiptap extension array.
 *
 * When a `ydoc` is supplied the editor runs in collaborative mode: content lives in the
 * Y.Doc (the CRDT source of truth for version history), so the library's own `History`
 * extension is dropped — Yjs owns undo/redo instead (mirrors the previous StarterKit
 * `undoRedo: false` behaviour).
 */
/** Helper for deterministic color generation for user cursors */
function getRandomColor(id?: string) {
  const colors = ["#f43f5e", "#ec4899", "#d946ef", "#a855f7", "#8b5cf6", "#6366f1", "#3b82f6", "#0ea5e9", "#06b6d4", "#14b8a6", "#10b981", "#84cc16", "#eab308", "#f97316"];
  if (!id) return colors[Math.floor(Math.random() * colors.length)];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function buildExtensions(placeholder?: string, ydoc?: Y.Doc, provider?: any, user?: { id?: string; name?: string; avatar?: string }) {
  const effectiveYDoc = ydoc || provider?.document;

  return [
    ...BaseKit,
    Placeholder.configure({
      placeholder: placeholder ?? "Press '/' for commands",
    }),
    CharacterCount,
    ...(effectiveYDoc ? [Collaboration.configure({ document: effectiveYDoc })] : [History]),
    ...(provider && effectiveYDoc ? [
      CollaborationCursor.configure({
        provider,
        user: {
          name: user?.name || "Anonymous Author",
          color: getRandomColor(user?.id),
        },
      })
    ] : []),

    SearchAndReplace,
    Clear,
    FontFamily.configure({ fontFamilyList: FONT_FAMILY_LIST }),
    Heading,
    FontSize.configure({ fontSizes: FONT_SIZE_LIST }),
    Bold,
    Italic,
    TextUnderline,
    Strike,
    MoreMark,
    Emoji.configure({
      suggestion: {
        items: async ({ query }: { query: string }) => {
          const q = query?.toLowerCase() ?? "";
          return EMOJI_LIST.filter(({ name }) => name.toLowerCase().includes(q));
        },
      },
    }),
    Color,
    Highlight,
    BulletList,
    OrderedList,
    TextAlign,
    Indent,
    LineHeight,
    TaskList,
    Link,
    Image.configure({
      upload: uploadImageFile,
      resourceImage: "both",
      maxSize: 8 * 1024 * 1024,
    }),
    Video.configure({ upload: uploadMediaFile }),
    ImageGif.configure({
      provider: "giphy",
      API_KEY: process.env.NEXT_PUBLIC_GIPHY_API_KEY ?? "",
    }),
    Blockquote,
    HorizontalRule,
    Code,
    CodeBlock.configure({ lowlight }),
    Column,
    ColumnNode,
    MultipleColumnNode,
    Table,
    Iframe,
    ImportWord,
    ExportWord,
    TextDirection,
    Attachment.configure({ upload: uploadMediaFile }),
    Katex,
    Excalidraw,
    Mermaid.configure({ upload: uploadMediaFile }),
    Mention.configure({
      suggestion: {
        char: "@",
        items: ({ query }: { query: string }) => searchUsersForMention(query),
      },
    }),
    SlashCommand,
    CodeView,
    Callout,

    // ── Our own backend-tied domain blocks (no library equivalent) ──────────
    ...getBlockExtensions(),
  ];
}
