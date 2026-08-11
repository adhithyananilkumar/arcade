import { NodeViewWrapper, NodeViewContent, NodeViewProps } from "@tiptap/react";
import { Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

export function QuizQuestionView({ node, updateAttributes, deleteNode, getPos }: NodeViewProps) {
  // Use local state for text inputs to prevent Tiptap from stealing focus on every keystroke
  const [segment, setSegment] = useState(node.attrs.segment || "");
  const [explanation, setExplanation] = useState(node.attrs.explanation || "");
  const [msgCorrect, setMsgCorrect] = useState(node.attrs.messageForCorrectAnswer || "");
  const [msgIncorrect, setMsgIncorrect] = useState(node.attrs.messageForIncorrectAnswer || "");

  // Debounce the text inputs to sync with Tiptap automatically
  useEffect(() => {
    const timer = setTimeout(() => {
      let changed = false;
      const updates: any = {};
      
      if (node.attrs.segment !== segment) { updates.segment = segment; changed = true; }
      if (node.attrs.explanation !== explanation) { updates.explanation = explanation; changed = true; }
      if (node.attrs.messageForCorrectAnswer !== msgCorrect) { updates.messageForCorrectAnswer = msgCorrect; changed = true; }
      if (node.attrs.messageForIncorrectAnswer !== msgIncorrect) { updates.messageForIncorrectAnswer = msgIncorrect; changed = true; }
      
      if (changed) {
        updateAttributes(updates);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [segment, explanation, msgCorrect, msgIncorrect, node.attrs, updateAttributes]);

  return (
    <NodeViewWrapper className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden mb-6">
      {/* Question Header - Native UI Wrapper */}
      <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 bg-gray-50/50 px-4 py-3" contentEditable={false}>
        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
          Q
        </span>
        
        <select
          value={node.attrs.questionType}
          onChange={(e) => updateAttributes({ questionType: e.target.value })}
          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 outline-none focus:border-indigo-400"
        >
          <option value="text">Text Question</option>
          <option value="photo">Photo Question</option>
        </select>

        <select
          value={node.attrs.answerSelectionType}
          onChange={(e) => updateAttributes({ answerSelectionType: e.target.value })}
          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 outline-none focus:border-indigo-400"
        >
          <option value="single">Single Answer</option>
          <option value="multiple">Multiple Answers</option>
        </select>

        <select
          value={node.attrs.difficulty || "MEDIUM"}
          onChange={(e) => updateAttributes({ difficulty: e.target.value })}
          className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 outline-none focus:border-indigo-400"
        >
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>

        <div className="ml-auto flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 whitespace-nowrap">
            Points
            <input
              type="number"
              min={0}
              value={node.attrs.point}
              onChange={(e) => updateAttributes({ point: parseInt(e.target.value) || 0 })}
              className="w-14 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-800 outline-none focus:border-indigo-400"
            />
          </label>
          <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 whitespace-nowrap">
            Segment
            <input
              type="text"
              placeholder="e.g. Hooks"
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              className="w-24 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-800 outline-none focus:border-indigo-400"
            />
          </label>
          <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block"></div>
          <button
            type="button"
            title="Delete question"
            onClick={deleteNode}
            onMouseDown={(e) => e.stopPropagation()}
            className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-5">
        {/* TIPTAP NATIVE CONTENT AREA */}
        {/* This will render the quizPrompt and quizOption nodes natively */}
        <NodeViewContent className="quiz-question-content" />

        {/* Feedback & Explanation */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100" contentEditable={false}>
          <div className="space-y-3">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-gray-600">Correct Message</span>
              <textarea
                value={msgCorrect}
                onChange={(e) => setMsgCorrect(e.target.value)}
                placeholder="Great job!"
                rows={1}
                className="w-full resize-y rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-800 outline-none focus:border-emerald-400"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-gray-600">Incorrect Message</span>
              <textarea
                value={msgIncorrect}
                onChange={(e) => setMsgIncorrect(e.target.value)}
                placeholder="Not quite..."
                rows={1}
                className="w-full resize-y rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-800 outline-none focus:border-red-400"
              />
            </label>
          </div>
          <div>
            <label className="block h-full">
              <span className="mb-1.5 block text-xs font-medium text-gray-600">Explanation</span>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Explain the correct answer..."
                className="h-[104px] w-full resize-y rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-800 outline-none focus:border-indigo-400"
              />
            </label>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
}
