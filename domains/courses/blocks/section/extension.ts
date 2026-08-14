import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { SectionEditView } from "./SectionEditView";

export const SectionNode = Node.create({
  name: "section",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      backgroundImage: {
        default: null,
        parseHTML: (el) => el.getAttribute("data-background-image"),
        renderHTML: (attrs) =>
          attrs.backgroundImage ? { "data-background-image": attrs.backgroundImage } : {},
      },
      overlayOpacity: {
        default: 0.35,
        parseHTML: (el) => {
          const raw = el.getAttribute("data-overlay-opacity");
          return raw ? Number(raw) : 0.35;
        },
        renderHTML: (attrs) => ({ "data-overlay-opacity": String(attrs.overlayOpacity ?? 0.35) }),
      },
      focalPoint: {
        default: "center",
        parseHTML: (el) => el.getAttribute("data-focal-point") || "center",
        renderHTML: (attrs) => ({ "data-focal-point": attrs.focalPoint || "center" }),
      },
      minHeight: {
        default: 240,
        parseHTML: (el) => {
          const raw = el.getAttribute("data-min-height");
          return raw ? Number(raw) : 240;
        },
        renderHTML: (attrs) => ({ "data-min-height": String(attrs.minHeight ?? 240) }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="section"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "section" }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SectionEditView);
  },
});
