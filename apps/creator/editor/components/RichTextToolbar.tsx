"use client";

import { memo } from "react";
import type { Editor } from "@tiptap/react";
import { localeActions } from "reactjs-tiptap-editor/locale-bundle";
import { RichTextUndo, RichTextRedo } from "reactjs-tiptap-editor/history";
import { RichTextHeading } from "reactjs-tiptap-editor/heading";
import { RichTextFontFamily } from "reactjs-tiptap-editor/fontfamily";
import { RichTextFontSize } from "reactjs-tiptap-editor/fontsize";
import { RichTextBold } from "reactjs-tiptap-editor/bold";
import { RichTextItalic } from "reactjs-tiptap-editor/italic";
import { RichTextUnderline } from "reactjs-tiptap-editor/textunderline";
import { RichTextStrike } from "reactjs-tiptap-editor/strike";
import { RichTextLink } from "reactjs-tiptap-editor/link";
import { RichTextClear } from "reactjs-tiptap-editor/clear";
import { RichTextColor } from "reactjs-tiptap-editor/color";
import { RichTextHighlight } from "reactjs-tiptap-editor/highlight";
import { RichTextAlign } from "reactjs-tiptap-editor/textalign";
import { RichTextIndent } from "reactjs-tiptap-editor/indent";

// Insert tools
import { RichTextEmoji } from "reactjs-tiptap-editor/emoji";
import { RichTextImageGif } from "reactjs-tiptap-editor/imagegif";
import { RichTextTable } from "reactjs-tiptap-editor/table";
import { RichTextColumn } from "reactjs-tiptap-editor/column";
import { RichTextIframe } from "reactjs-tiptap-editor/iframe";
import { RichTextImportWord } from "reactjs-tiptap-editor/importword";
import { RichTextAttachment } from "reactjs-tiptap-editor/attachment";
import { RichTextExcalidraw } from "reactjs-tiptap-editor/excalidraw";
import { RichTextHorizontalRule } from "reactjs-tiptap-editor/horizontalrule";
import { RichTextCodeBlock } from "reactjs-tiptap-editor/codeblock";

import { Separator } from "@/shared/design-system/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/design-system/ui/popover";
import { Button } from "@/shared/design-system/ui/button";
import { Plus, Subscript, Superscript } from "lucide-react";
import { VideoUploadButton } from "./VideoUploadButton";
import { ImageUploadButton } from "./ImageUploadButton";
import { UploadQueuePanel } from "./UploadQueuePanel";

// The font family/size dropdowns show this string for unstyled text — the library's
// own copy is the literal word "Default", which is honest about "no override" but
// tells the author nothing about what they're actually looking at. Arcade's actual
// base typography (app/globals.css `body`, mirrored in editor.css's `.ProseMirror`
// rule) is Geist at 16px, so that's what unmarked text really renders as — the label
// should say so. This is a one-time i18n string override, not a document mutation:
// it changes what "no override" is *called*, not what's stored in any lesson's
// content, so redefining the actual default later is a one-line change here (plus
// the matching CSS rule), not a content migration.
localeActions.setMessage("en", {
  "editor.fontFamily.default.tooltip": "Geist",
  "editor.fontSize.default.tooltip": "16px",
});

interface RichTextToolbarProps {
  editor: Editor | null;
}

export const RichTextToolbar = memo(function RichTextToolbar({ editor }: RichTextToolbarProps) {
  return (
    <div className="flex justify-center mt-4 mb-2 pointer-events-none sticky top-16 z-10">
      <div className="pointer-events-auto flex items-center px-4 py-1.5 overflow-x-auto whitespace-nowrap rounded-full bg-white/80 backdrop-blur-xl border border-white/60 shadow-[0_8px_32px_rgba(20,20,43,0.12)]">
        {/* Groups are borderless and tightly packed — hairline separators carry the
            grouping instead, so the whole strip fits on one row without scrolling. */}
        <div className="flex items-center">
        <RichTextUndo />
        <RichTextRedo />
      </div>

      <Separator orientation="vertical" className="h-5 mx-1" />

      <div className="arcade-toolbar-selects flex items-center">
        <RichTextHeading />
        <RichTextFontFamily />
        <RichTextFontSize />
      </div>

      <Separator orientation="vertical" className="h-5 mx-1" />

      <div className="flex items-center">
        <RichTextBold />
        <RichTextItalic />
        <RichTextUnderline />
        <RichTextStrike />
      </div>

      <Separator orientation="vertical" className="h-5 mx-1" />

      <div className="flex items-center">
        <RichTextLink />
        <RichTextClear />
      </div>

      <Separator orientation="vertical" className="h-5 mx-1" />

      <div className="flex items-center">
        <RichTextColor />
        <RichTextHighlight />
      </div>

      <Separator orientation="vertical" className="h-5 mx-1" />

      <div className="flex items-center">
        <RichTextAlign />
        <RichTextIndent />
      </div>

      {/* Insert Dropdown (Popover) - pushed to the right */}
      <div className="ml-auto flex items-center pl-1">
        <Popover>
          <PopoverTrigger render={<Button variant="outline" size="sm" className="h-8 px-3 flex items-center gap-1.5 border-border bg-transparent hover:bg-muted text-foreground" />}>
            <Plus size={14} />
            <span className="text-xs font-semibold">Insert</span>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-3" align="end">
            <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Insert Elements
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted"
                onClick={() => editor?.chain().focus().toggleSubscript().run()}
                title="Subscript"
              >
                <Subscript size={16} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:bg-muted"
                onClick={() => editor?.chain().focus().toggleSuperscript().run()}
                title="Superscript"
              >
                <Superscript size={16} />
              </Button>
              <RichTextEmoji />
              <ImageUploadButton editor={editor} />
              <VideoUploadButton editor={editor} />
              <RichTextImageGif />
              <RichTextTable />
              <RichTextColumn />
              <RichTextIframe />
              <RichTextImportWord />
              <RichTextAttachment />
              <RichTextExcalidraw />
              <RichTextHorizontalRule />
              <RichTextCodeBlock />
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Portalled to <body> — tracks background uploads queued from ImageUploadButton /
          VideoUploadButton above, independent of where this toolbar sits on the page. */}
      <UploadQueuePanel />
      </div>
    </div>
  );
});

