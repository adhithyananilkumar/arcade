import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { QuestionBankCreatorView } from "./QuestionBankCreatorView";

export const QuestionBankCreatorNode = Node.create({
  name: "question_bank_creator",
  group: "block",
  content: "block+",

  addAttributes() {
    return {
      questionType: { default: "SINGLE" },
      difficulty: { default: "MEDIUM" },
      points: { default: 1 },
      options: {
        default: [
          { id: "1", text: "", isCorrect: false },
          { id: "2", text: "", isCorrect: false },
        ],
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="question_bank_creator"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "question_bank_creator" }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(QuestionBankCreatorView);
  },
});
