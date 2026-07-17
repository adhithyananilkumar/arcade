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

    return {
      onStart: (props) => {
        component = new ReactRenderer(SlashCommandMenu, {
          props,
          editor: props.editor,
        });
        popup = document.createElement("div");
        popup.className = "arcade-slash-popup";
        popup.appendChild(component.element);
        document.body.appendChild(popup);
        positionPopup(popup, props.clientRect);
      },
      onUpdate: (props) => {
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
        popup?.remove();
        component?.destroy();
        popup = null;
        component = null;
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
