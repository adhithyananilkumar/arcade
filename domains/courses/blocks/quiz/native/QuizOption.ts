import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { QuizOptionView } from "./QuizOptionView";

export const QuizOptionNode = Node.create({
  name: "quizOption",
  group: "block",
  content: "inline*",
  defining: true,

  addAttributes() {
    return {
      isCorrect: { default: false },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="quiz-option"]' }];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "quiz-option" }), 0];
  },
  
  addNodeView() {
    return ReactNodeViewRenderer(QuizOptionView);
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => this.editor.commands.splitBlock(),
      Backspace: () => {
        const { empty, $anchor } = this.editor.state.selection;
        const isAtStart = empty && $anchor.parentOffset === 0;

        if (!isAtStart) return false;
        
        // If it's empty, delete the node entirely
        if ($anchor.parent.content.size === 0) {
          return this.editor.commands.deleteNode('quizOption');
        }

        return false;
      },
    };
  },
});
