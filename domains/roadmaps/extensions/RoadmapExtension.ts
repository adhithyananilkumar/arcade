import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { RoadmapNodeView } from "./RoadmapNodeView";

export interface RoadmapNodeAttributes {
  roadmapId?: string | null;
  graphJson?: string | null;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    roadmap: {
      addRoadmapTopic: () => ReturnType;
      autoLayoutRoadmap: () => ReturnType;
      toggleRoadmapAppearance: () => ReturnType;
      fitRoadmapView: () => ReturnType;
    };
  }
}

export const RoadmapNode = Node.create({
  name: "roadmap",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      roadmapId: {
        default: null,
      },
      graphJson: {
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
    return ReactNodeViewRenderer(RoadmapNodeView);
  },

  addCommands() {
    return {
      addRoadmapTopic:
        () =>
        () => {
          window.dispatchEvent(new CustomEvent("arcade-roadmap-add-topic"));
          return true;
        },
      autoLayoutRoadmap:
        () =>
        () => {
          window.dispatchEvent(new CustomEvent("arcade-roadmap-auto-layout"));
          return true;
        },
      toggleRoadmapAppearance:
        () =>
        () => {
          window.dispatchEvent(new CustomEvent("arcade-roadmap-appearance"));
          return true;
        },
      fitRoadmapView:
        () =>
        () => {
          window.dispatchEvent(new CustomEvent("arcade-roadmap-fit-view"));
          return true;
        },
    };
  },
});

export const RoadmapExtension = RoadmapNode;
