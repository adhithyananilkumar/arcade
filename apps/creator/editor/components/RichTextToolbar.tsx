"use client";

import { memo, useMemo } from "react";
import { useCurrentEditor } from "@tiptap/react";
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
import { RichTextImage } from "reactjs-tiptap-editor/image";
import { RichTextVideo } from "reactjs-tiptap-editor/video";
import { RichTextImageGif } from "reactjs-tiptap-editor/imagegif";
import { RichTextTable } from "reactjs-tiptap-editor/table";
import { RichTextColumn } from "reactjs-tiptap-editor/column";
import { RichTextIframe } from "reactjs-tiptap-editor/iframe";
import { RichTextExportPdf } from "reactjs-tiptap-editor/exportpdf";
import { RichTextImportWord } from "reactjs-tiptap-editor/importword";
import { RichTextAttachment } from "reactjs-tiptap-editor/attachment";
import { RichTextExcalidraw } from "reactjs-tiptap-editor/excalidraw";
import { RichTextDrawer } from "reactjs-tiptap-editor/drawer";
import { RichTextTwitter } from "reactjs-tiptap-editor/twitter";
import { RichTextHorizontalRule } from "reactjs-tiptap-editor/horizontalrule";
import { RichTextCodeBlock } from "reactjs-tiptap-editor/codeblock";

import { Separator } from "@/shared/design-system/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/design-system/ui/popover";
import { Button } from "@/shared/design-system/ui/button";
import { Plus, LayoutGrid, Palette, Maximize2, PlusCircle, MapPin } from "lucide-react";

export const RichTextToolbar = memo(function RichTextToolbar() {
  const { editor } = useCurrentEditor();
  const isRoadmap = useMemo(() => {
    if (!editor) return false;
    let found = false;
    editor.state.doc.descendants((node) => {
      if (node.type.name === "roadmap") {
        found = true;
        return false;
      }
    });
    return found;
  }, [editor, editor?.state.doc]);

  if (isRoadmap) {
    return (
      <div className="arcade-toolbar flex items-center justify-between px-3 py-1.5 overflow-x-auto whitespace-nowrap bg-white border-b border-gray-200 shadow-2xs">
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1">
            <RichTextUndo />
            <RichTextRedo />
          </div>

          <Separator orientation="vertical" className="h-5 mx-1" />

          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("arcade-roadmap-add-topic"))}
            className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-2xs"
          >
            <PlusCircle size={13} /> Add Topic
          </button>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("arcade-roadmap-auto-layout"))}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
          >
            <LayoutGrid size={13} /> Auto Layout
          </button>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("arcade-roadmap-appearance"))}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
          >
            <Palette size={13} /> Appearance
          </button>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("arcade-roadmap-fit-view"))}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
          >
            <Maximize2 size={13} /> Fit View
          </button>
        </div>

        <div className="flex items-center gap-1 text-xs text-indigo-700 font-semibold px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-md">
          <MapPin size={13} />
          <span>Roadmap Canvas</span>
        </div>
      </div>
    );
  }

  return (
    <div className="arcade-toolbar flex items-center px-2 py-1.5 overflow-x-auto whitespace-nowrap">
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
              <RichTextEmoji />
              <RichTextImage />
              <RichTextVideo />
              <RichTextImageGif />
              <RichTextTable />
              <RichTextColumn />
              <RichTextIframe />
              <RichTextExportPdf />
              <RichTextImportWord />
              <RichTextAttachment />
              <RichTextExcalidraw />
              <RichTextDrawer />
              <RichTextTwitter />
              <RichTextHorizontalRule />
              <RichTextCodeBlock />
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
});
