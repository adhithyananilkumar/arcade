import { GraduationCap } from "lucide-react";
import type { BlockDefinition } from "../types";
import { ExamNode } from "./extension";
import { ExamRender } from "./ExamRender";

export const examBlock: BlockDefinition = {
  type: "exam",
  extension: ExamNode,
  renderComponent: ExamRender,
  command: {
    id: "exam",
    title: "Exam",
    description: "Insert an exam component (Badged or Certified)",
    icon: GraduationCap,
    keywords: ["exam", "test", "certification", "certified", "badge", "badged"],
    run: (editor, range) => {
      const chain = editor.chain().focus();
      (range ? chain.deleteRange(range) : chain)
        .insertContent({
          type: "exam",
          attrs: { examType: "BADGED", rules: { EASY: 20, MEDIUM: 50, HARD: 30 } }
        })
        .run();
    },
  },
};
