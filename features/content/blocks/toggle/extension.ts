import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ToggleEditView } from "./ToggleEditView";

export const ToggleNode = Node.create({
  name: "toggle",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      title: { default: "Toggle" },
      // Stable per-instance id, stamped once at insert — the key that learner interaction
      // state (open/closed) is persisted against. Never regenerate this for an existing node.
      nodeId: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-node-id"),
        renderHTML: (attrs) => (attrs.nodeId ? { "data-node-id": attrs.nodeId } : {}),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="toggle"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "toggle" }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ToggleEditView);
  },
});
