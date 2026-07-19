// features/content/editor/extensions/slash-command.ts
// Notion-style "/" command menu. Wires @tiptap/suggestion to a React menu that
// inserts / converts blocks from the shared command palette (blockCommands.ts).

import { Extension } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import {
  SlashCommandMenu,
  type SlashCommandMenuRef,
} from "../components/SlashCommandMenu";
import { filterBlockCommands, type BlockCommand } from "../lib/blockCommands";

/** Position a floating popup below the "/" caret using the suggestion's clientRect. */
function positionPopup(popup: HTMLElement, clientRect?: (() => DOMRect | null) | null) {
  const rect = clientRect?.();
  if (!rect) return;
  popup.style.top = `${rect.bottom + window.scrollY + 6}px`;
  popup.style.left = `${rect.left + window.scrollX}px`;
}

const suggestion: Omit<SuggestionOptions<BlockCommand>, "editor"> = {
  char: "/",
  // Only trigger at the start of an empty-ish block or after whitespace — matches Notion.
  allowSpaces: false,
  startOfLine: false,
  items: ({ query }) => filterBlockCommands(query),
  command: ({ editor, range, props }) => {
    props.run(editor, range);
  },
  render: () => {
    let component: ReactRenderer<SlashCommandMenuRef> | null = null;
    let popup: HTMLDivElement | null = null;
    let currentClientRect: (() => DOMRect | null) | null | undefined = null;

    // The editor usually sits inside a scrollable panel, not the window itself. `scroll`
    // doesn't bubble, but ancestors still receive it in the capture phase, so a single
    // window-level capture listener catches scrolling on any nested container.
    const reposition = () => {
      if (popup) positionPopup(popup, currentClientRect);
    };

    return {
      onStart: (props) => {
        currentClientRect = props.clientRect;
        component = new ReactRenderer(SlashCommandMenu, {
          props,
          editor: props.editor,
        });
        popup = document.createElement("div");
        popup.className = "arcade-slash-popup";
        popup.appendChild(component.element);
        document.body.appendChild(popup);
        positionPopup(popup, props.clientRect);
        window.addEventListener("scroll", reposition, true);
        window.addEventListener("resize", reposition);
      },
      onUpdate: (props) => {
        currentClientRect = props.clientRect;
        component?.updateProps(props);
        if (popup) {
          popup.style.display = "";
          positionPopup(popup, props.clientRect);
        }
      },
      onKeyDown: (props) => {
        if (props.event.key === "Escape") {
          if (popup) popup.style.display = "none";
          return true;
        }
        return component?.ref?.onKeyDown(props.event) ?? false;
      },
      onExit: () => {
        window.removeEventListener("scroll", reposition, true);
        window.removeEventListener("resize", reposition);
        popup?.remove();
        component?.destroy();
        popup = null;
        component = null;
        currentClientRect = null;
      },
    };
  },
};

export const SlashCommand = Extension.create({
  name: "slashCommand",
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...suggestion,
      }),
    ];
  },
});
