import { NodeViewWrapper, NodeViewContent, NodeViewProps } from "@tiptap/react";
import { FileQuestion, Plus } from "lucide-react";

export function QuizBlockView({ node, selected, editor }: NodeViewProps) {
  const addQuestion = () => {
    const endPos = node.nodeSize;
    editor.commands.insertContent({
      type: "quizQuestion",
      content: [
        { type: "quizPrompt", content: [] },
        { type: "quizOption", attrs: { isCorrect: true }, content: [] },
        { type: "quizOption", attrs: { isCorrect: false }, content: [] },
      ],
    });
  };

  return (
    <NodeViewWrapper
      className={`my-6 rounded-2xl border shadow-sm transition-all bg-slate-50/20 ${
        selected ? "border-indigo-400 ring-2 ring-indigo-200" : "border-slate-200"
      }`}
    >
      <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-3 rounded-t-2xl text-sm font-semibold text-slate-700">
        <FileQuestion size={18} className="text-indigo-500" />
        Interactive Quiz
      </div>
      
      <div className="p-4 space-y-6">
        <NodeViewContent className="quiz-block-content" />
        
        <button
          type="button"
          onClick={addQuestion}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 bg-white py-4 text-sm font-semibold text-gray-500 transition-colors hover:border-indigo-300 hover:text-indigo-600"
        >
          <Plus size={16} />
          Add Question
        </button>
      </div>
    </NodeViewWrapper>
  );
}
