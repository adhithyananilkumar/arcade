import { FileQuestion } from "lucide-react";
import type { BlockDefinition } from "../types";
import { QuizBlockNode } from "./extension";
import { QuizBlockRender } from "./QuizBlockRender";

export const quizBlock: BlockDefinition = {
  type: "quiz-block",
  extension: QuizBlockNode,
  renderComponent: QuizBlockRender,
  command: {
    id: "quiz-block",
    title: "Quiz",
    description: "Embed an existing module quiz inline in this lesson",
    icon: FileQuestion,
    keywords: ["quiz", "knowledge check", "question", "assessment", "test"],
    run: (editor, range) => {
      const quizId = window.prompt("Enter the quiz ID to embed:") || "";
      const chain = editor.chain().focus();
      (range ? chain.deleteRange(range) : chain)
        .insertContent({ type: "quiz-block", attrs: { quizId } })
        .run();
    },
  },
};
