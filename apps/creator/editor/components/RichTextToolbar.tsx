// apps/creator/editor/components/RichTextToolbar.tsx
// Direct port of the reactjs-tiptap-editor demo's toolbar composition — every button is
// the library's own RichText* component, unmodified.
"use client";

import { memo } from "react";
import { RichTextUndo, RichTextRedo } from "reactjs-tiptap-editor/history";
import { RichTextSearchAndReplace } from "reactjs-tiptap-editor/searchandreplace";
import { RichTextClear } from "reactjs-tiptap-editor/clear";
import { RichTextFontFamily } from "reactjs-tiptap-editor/fontfamily";
import { RichTextHeading } from "reactjs-tiptap-editor/heading";
import { RichTextFontSize } from "reactjs-tiptap-editor/fontsize";
import { RichTextBold } from "reactjs-tiptap-editor/bold";
import { RichTextItalic } from "reactjs-tiptap-editor/italic";
import { RichTextUnderline } from "reactjs-tiptap-editor/textunderline";
import { RichTextStrike } from "reactjs-tiptap-editor/strike";
import { RichTextMoreMark } from "reactjs-tiptap-editor/moremark";
import { RichTextEmoji } from "reactjs-tiptap-editor/emoji";
import { RichTextColor } from "reactjs-tiptap-editor/color";
import { RichTextHighlight } from "reactjs-tiptap-editor/highlight";
import { RichTextBulletList } from "reactjs-tiptap-editor/bulletlist";
import { RichTextOrderedList } from "reactjs-tiptap-editor/orderedlist";
import { RichTextAlign } from "reactjs-tiptap-editor/textalign";
import { RichTextIndent } from "reactjs-tiptap-editor/indent";
import { RichTextLineHeight } from "reactjs-tiptap-editor/lineheight";
import { RichTextTaskList } from "reactjs-tiptap-editor/tasklist";
import { RichTextLink } from "reactjs-tiptap-editor/link";
import { RichTextImage } from "reactjs-tiptap-editor/image";
import { RichTextVideo } from "reactjs-tiptap-editor/video";
import { RichTextImageGif } from "reactjs-tiptap-editor/imagegif";
import { RichTextBlockquote } from "reactjs-tiptap-editor/blockquote";
import { RichTextHorizontalRule } from "reactjs-tiptap-editor/horizontalrule";
import { RichTextCode } from "reactjs-tiptap-editor/code";
import { RichTextCodeBlock } from "reactjs-tiptap-editor/codeblock";
import { RichTextColumn } from "reactjs-tiptap-editor/column";
import { RichTextTable } from "reactjs-tiptap-editor/table";
import { RichTextIframe } from "reactjs-tiptap-editor/iframe";
import { RichTextExportPdf } from "reactjs-tiptap-editor/exportpdf";
import { RichTextImportWord } from "reactjs-tiptap-editor/importword";
import { RichTextExportWord } from "reactjs-tiptap-editor/exportword";
import { RichTextTextDirection } from "reactjs-tiptap-editor/textdirection";
import { RichTextAttachment } from "reactjs-tiptap-editor/attachment";
import { RichTextKatex } from "reactjs-tiptap-editor/katex";
import { RichTextExcalidraw } from "reactjs-tiptap-editor/excalidraw";
import { RichTextMermaid } from "reactjs-tiptap-editor/mermaid";
import { RichTextDrawer } from "reactjs-tiptap-editor/drawer";
import { RichTextTwitter } from "reactjs-tiptap-editor/twitter";
import { RichTextCodeView } from "reactjs-tiptap-editor/codeview";
import { RichTextCallout } from "reactjs-tiptap-editor/callout";

// Memoized: the toolbar takes no props and every button subscribes to the editor
// itself via RichTextProvider. Without this, any host re-render walks all 43
// children — measurably hundreds of milliseconds per pass on a production build.
export const RichTextToolbar = memo(function RichTextToolbar() {
  return (
    <div className="flex items-center !p-1 gap-2 flex-wrap !border-b !border-solid !border-border">
      <RichTextUndo />
      <RichTextRedo />
      <RichTextSearchAndReplace />
      <RichTextClear />
      <RichTextFontFamily />
      <RichTextHeading />
      <RichTextFontSize />
      <RichTextBold />
      <RichTextItalic />
      <RichTextUnderline />
      <RichTextStrike />
      <RichTextMoreMark />
      <RichTextEmoji />
      <RichTextColor />
      <RichTextHighlight />
      <RichTextBulletList />
      <RichTextOrderedList />
      <RichTextAlign />
      <RichTextIndent />
      <RichTextLineHeight />
      <RichTextTaskList />
      <RichTextLink />
      <RichTextImage />
      <RichTextVideo />
      <RichTextImageGif />
      <RichTextBlockquote />
      <RichTextHorizontalRule />
      <RichTextCode />
      <RichTextCodeBlock />
      <RichTextColumn />
      <RichTextTable />
      <RichTextIframe />
      <RichTextExportPdf />
      <RichTextImportWord />
      <RichTextExportWord />
      <RichTextTextDirection />
      <RichTextAttachment />
      <RichTextKatex />
      <RichTextExcalidraw />
      <RichTextMermaid />
      <RichTextDrawer />
      <RichTextTwitter />
      <RichTextCodeView />
      <RichTextCallout />
    </div>
  );
});
