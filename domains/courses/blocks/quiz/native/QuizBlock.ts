import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { QuizBlockView } from "./QuizBlockView";

export const QuizBlockNode = Node.create({
  name: "quizBlock",
  group: "block",
  content: "quizQuestion+",

  parseHTML() {
    return [{ tag: 'div[data-type="quiz-block"]' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "quiz-block" }), 0];
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(QuizBlockView);
  },
});
