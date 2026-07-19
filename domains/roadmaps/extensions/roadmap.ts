import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { RoadmapView } from "../components/RoadmapView";

export const RoadmapNode = Node.create({
  name: "roadmap",
  group: "block",
  atom: true, // Represents a single atomic block unit, text cannot be inserted inside

  addAttributes() {
    return {
      roadmapId: {
        default: null,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="roadmap"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "roadmap" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(RoadmapView);
  },
});
