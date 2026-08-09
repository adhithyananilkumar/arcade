import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { QuizQuestionView } from "./QuizQuestionView";

export const QuizQuestionNode = Node.create({
  name: "quizQuestion",
  group: "block",
  content: "quizPrompt quizOption*",

  addAttributes() {
    return {
      questionType: { default: "text" },
      answerSelectionType: { default: "single" },
      point: { default: 10 },
      segment: { default: "" },
      explanation: { default: "" },
      messageForCorrectAnswer: { default: "" },
      messageForIncorrectAnswer: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="quiz-question"]' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "quiz-question" }), 0];
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(QuizQuestionView);
  },
});
