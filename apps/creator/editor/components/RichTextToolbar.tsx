"use client";

import { memo, useEffect } from "react";
import { createPortal } from "react-dom";
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

// The library's own icon buttons (RichTextBold, RichTextColor, …) render a Radix
// Tooltip with no way to pass `side="bottom"` in — they take zero props. Radix's own
// collision-flip only kicks in when "top" genuinely doesn't fit, which it does here
// since the toolbar sits with room above it. So instead of fighting the component
// API, we watch for the tooltip's portal node landing in <body> and shove it below
// the trigger ourselves: `translate` is a distinct CSS property from `transform`
// (which Radix's positioning already occupies), so it composes with Radix's own
// placement instead of clobbering it.
//
// The delta is computed from real geometry, not a guessed button height: Radix
// links the tooltip to its trigger via `aria-describedby`, so we look the trigger
// up and re-derive the wrapper's target top from the trigger's actual bottom edge.
// That stays correct regardless of which button/dropdown is hovered or how tall
// its tooltip content is (a one-line "Bold" vs. a wider colour/line-spacing preview).
const TOOLTIP_SIDE_OFFSET = 4; // library's default Tooltip.Content sideOffset

function useForceTooltipsBelowToolbar() {
  useEffect(() => {
    const flip = (wrapper: HTMLElement) => {
      const content = wrapper.querySelector<HTMLElement>('[role="tooltip"][data-side="top"]');
      if (!content) return;
      const trigger = content.id
        ? document.querySelector<HTMLElement>(`[aria-describedby~="${content.id}"]`)
        : null;
      const currentTop = wrapper.getBoundingClientRect().top;
      const desiredTop = trigger
        ? trigger.getBoundingClientRect().bottom + TOOLTIP_SIDE_OFFSET
        : currentTop + content.offsetHeight + TOOLTIP_SIDE_OFFSET * 2;
      wrapper.style.translate = `0px ${desiredTop - currentTop}px`;
    };

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          const wrappers = node.matches("[data-radix-popper-content-wrapper]")
            ? [node]
            : Array.from(node.querySelectorAll<HTMLElement>("[data-radix-popper-content-wrapper]"));
          // Radix sometimes inserts the wrapper and its tooltip content in separate
          // mutation records — cover the case where the content lands on its own by
          // walking up from it too.
          const wrapperFromContent = node.matches('[role="tooltip"]')
            ? node.closest<HTMLElement>("[data-radix-popper-content-wrapper]")
            : null;
          if (wrapperFromContent) wrappers.push(wrapperFromContent);
          wrappers.forEach(flip);
        });
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
}

export const RichTextToolbar = memo(function RichTextToolbar({ editor }: RichTextToolbarProps) {
  useForceTooltipsBelowToolbar();

  // Portalled to <body> — mounted inside the lesson card, whose backdrop-blur
  // establishes a new containing block for `position: fixed` descendants (same
  // reason UploadQueuePanel below is portalled). Left in place, `fixed` here
  // resolves against that card instead of the viewport: the toolbar scrolls with
  // the card instead of staying pinned, and ends up visually "inside" it, clipped
  // by whatever paints on top of the card at that scroll position. Escaping to
  // <body> makes it a true floating island, positioned just under the lesson-name
  // pill (which sits ~28px–68px from the top) regardless of where in the DOM tree
  // the editor itself lives.
  return createPortal(
    <div className="flex justify-center pointer-events-none fixed top-[70px] inset-x-0 z-[70]">
      <div className="pointer-events-auto flex items-center max-w-[calc(100vw-2rem)] px-4 py-1.5 overflow-x-auto whitespace-nowrap rounded-full bg-white/60 backdrop-blur-md shadow-sm">
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

      {/* Also portalled to <body> — tracks background uploads queued from
          ImageUploadButton / VideoUploadButton above. Nesting it here is harmless
          now that this whole toolbar is itself body-portalled. */}
      <UploadQueuePanel />
      </div>
    </div>,
    document.body
  );
});

