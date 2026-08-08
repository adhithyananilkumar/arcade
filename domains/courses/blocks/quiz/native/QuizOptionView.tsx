import { NodeViewWrapper, NodeViewContent, NodeViewProps } from "@tiptap/react";
import { Check, Trash2 } from "lucide-react";

export function QuizOptionView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const isCorrect = node.attrs.isCorrect;

  return (
    <NodeViewWrapper className="flex items-start gap-2 mb-2 group">
      <div className="pt-1" contentEditable={false}>
        <button
          type="button"
          onClick={() => updateAttributes({ isCorrect: !isCorrect })}
          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center border transition-colors rounded ${
            isCorrect
              ? "border-emerald-500 bg-emerald-500 text-white"
              : "border-gray-300 bg-white text-transparent hover:border-emerald-400"
          }`}
        >
          <Check size={12} />
        </button>
      </div>
      
      <div className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-800 focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-100 bg-white">
        <NodeViewContent 
          className="quiz-option-content outline-none"
          data-placeholder="Answer option..."
        />
      </div>

      <div className="pt-1 opacity-0 group-hover:opacity-100 transition-opacity" contentEditable={false}>
        <button
          type="button"
          onClick={deleteNode}
          className="rounded-md p-1.5 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-500"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </NodeViewWrapper>
  );
}
