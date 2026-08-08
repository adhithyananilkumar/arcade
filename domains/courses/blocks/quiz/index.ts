import { FileQuestion } from "lucide-react";
import type { BlockDefinition } from "../types";
import { QuizExtension } from "./extension";

export const quizBlock: BlockDefinition = {
  type: "quizBlock", // Important: must match the outer block name
  extension: QuizExtension,
  command: {
    id: "quiz-block",
    title: "Quiz",
    description: "Create an interactive quiz inline",
    icon: FileQuestion,
    keywords: ["quiz", "knowledge check", "question", "assessment", "test"],
    run: (editor, range) => {
      const chain = editor.chain().focus();
      (range ? chain.deleteRange(range) : chain)
        .insertContent({
          type: "quizBlock",
          content: [
            {
              type: "quizQuestion",
              content: [
                { type: "quizPrompt", content: [] },
                { type: "quizOption", attrs: { isCorrect: true }, content: [] },
                { type: "quizOption", attrs: { isCorrect: false }, content: [] },
              ],
            },
          ],
        })
        .run();
    },
  },
};
