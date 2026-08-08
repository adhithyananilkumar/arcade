import { Extension } from "@tiptap/core";
import { QuizBlockNode } from "./native/QuizBlock";
import { QuizQuestionNode } from "./native/QuizQuestion";
import { QuizPromptNode } from "./native/QuizPrompt";
import { QuizOptionNode } from "./native/QuizOption";

export const QuizExtension = Extension.create({
  name: "quizExtension",
  
  addExtensions() {
    return [
      QuizBlockNode,
      QuizQuestionNode,
      QuizPromptNode,
      QuizOptionNode,
    ];
  },
});
