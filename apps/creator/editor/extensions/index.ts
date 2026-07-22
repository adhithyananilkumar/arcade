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
import { Drawer } from "reactjs-tiptap-editor/drawer";
import { Emoji } from "reactjs-tiptap-editor/emoji";
import { Excalidraw } from "reactjs-tiptap-editor/excalidraw";
import { ExportPdf } from "reactjs-tiptap-editor/exportpdf";
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
import { Twitter } from "reactjs-tiptap-editor/twitter";
import { Video } from "reactjs-tiptap-editor/video";

import { getBlockExtensions } from "@/domains/courses";
import { EMOJI_LIST } from "../lib/emojiList";
import { uploadImageFile, uploadMediaFile } from "../lib/imageUpload";
import { searchUsersForMention } from "../lib/mentionSuggestion";

const lowlight = createLowlight(common);

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
export function buildExtensions(placeholder?: string, ydoc?: Y.Doc) {
  return [
    ...BaseKit,
    Placeholder.configure({
      placeholder: placeholder ?? "Press '/' for commands",
      includeChildren: true,
    }),
    CharacterCount,
    ...(ydoc ? [Collaboration.configure({ document: ydoc })] : [History]),

    SearchAndReplace,
    Clear,
    FontFamily,
    Heading,
    FontSize,
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
    ExportPdf,
    ImportWord,
    ExportWord,
    TextDirection,
    Attachment.configure({ upload: uploadMediaFile }),
    Katex,
    Excalidraw,
    Mermaid.configure({ upload: uploadMediaFile }),
    Drawer.configure({ upload: uploadMediaFile }),
    Twitter,
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
