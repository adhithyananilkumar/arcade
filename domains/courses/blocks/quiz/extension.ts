import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { QuizBlockEditView } from "./QuizBlockEditView";

export const QuizBlockNode = Node.create({
  name: "quiz-block",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      quizId: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="quiz-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "quiz-block" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(QuizBlockEditView);
  },
});
