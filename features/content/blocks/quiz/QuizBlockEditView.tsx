import { NodeViewWrapper, NodeViewProps } from "@tiptap/react";
import { FileQuestion, Pencil } from "lucide-react";

// Authoring stays a lightweight reference card, matching the existing Roadmap pattern — the quiz's
// questions are authored in the module's quiz editor (features/assessment/QuizEditor), not inline
// here. This node just places an existing quiz inline in the lesson flow for learners.
export function QuizBlockEditView({ node, updateAttributes, selected }: NodeViewProps) {
  const quizId = typeof node.attrs.quizId === "string" ? node.attrs.quizId : "";

  return (
    <NodeViewWrapper
      className={`my-2 rounded-lg border p-3 ${selected ? "border-indigo-400 ring-1 ring-indigo-200" : "border-gray-200"}`}
      data-drag-handle
    >
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-400">
        <FileQuestion size={13} /> Inline quiz
      </div>
      <div className="flex items-center gap-2">
        <input
          value={quizId}
          onChange={(e) => updateAttributes({ quizId: e.target.value })}
          placeholder="Quiz ID (from this course's module quiz list)"
          className="min-w-0 flex-1 rounded-md border border-gray-200 px-2.5 py-1.5 font-mono text-xs outline-none focus:border-indigo-400"
        />
      </div>
      <p className="mt-1.5 flex items-center gap-1 text-[11px] text-gray-400">
        <Pencil size={11} /> Hover a quiz in the sidebar and click the copy icon to grab its ID.
        Manage questions in the module&apos;s quiz editor.
      </p>
    </NodeViewWrapper>
  );
}
