import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ButtonEditView } from "./ButtonEditView";

export const ButtonNode = Node.create({
  name: "cta-button",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      label: { default: "Click me" },
      url: { default: "" },
      variant: { default: "primary" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="cta-button"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "cta-button" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ButtonEditView);
  },
});
