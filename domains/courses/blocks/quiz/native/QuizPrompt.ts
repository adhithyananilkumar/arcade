import { Node, mergeAttributes } from "@tiptap/core";

export const QuizPromptNode = Node.create({
  name: "quizPrompt",
  group: "block",
  content: "inline*",
  
  parseHTML() {
    return [{ tag: 'div[data-type="quiz-prompt"]' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { 
      "data-type": "quiz-prompt", 
      class: "mb-3 w-full text-base font-medium text-gray-800 focus:outline-none outline-none",
      "data-placeholder": "Enter your question prompt..."
    }), 0];
  },
});
