import { QuizPlayer } from "@/features/assessment";
import type { BlockRenderProps } from "../types";

export function QuizBlockRender({ node }: BlockRenderProps) {
  const quizId = typeof node.attrs?.quizId === "string" ? node.attrs.quizId : "";
  if (!quizId) return null;

  return (
    <div className="mb-4">
      <QuizPlayer quizId={quizId} />
    </div>
  );
}
