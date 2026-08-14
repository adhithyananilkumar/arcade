import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ExamNodeView } from "./ExamNodeView";

export const ExamNode = Node.create({
  name: "exam",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      examType: { default: "BADGED" },
      rules: { default: { EASY: 20, MEDIUM: 50, HARD: 30 } },
      selectedPool: { default: [] },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="exam"]' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "exam" })];
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(ExamNodeView);
  },
});
