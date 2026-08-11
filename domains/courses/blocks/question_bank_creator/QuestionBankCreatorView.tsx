"use client";

import { useState, useCallback, useRef } from "react";
import { Check, Trash2, Plus, GripVertical, AlertCircle } from "lucide-react";
import { NodeViewWrapper, NodeViewContent, NodeViewProps } from "@tiptap/react";

const DIFF_PILL: Record<string, { label: string; className: string }> = {
  SINGLE:     { label: "MCQ",          className: "bg-violet-50 text-violet-700 border-violet-200" },
  MULTIPLE:   { label: "Multi",        className: "bg-blue-50 text-blue-700 border-blue-200" },
  TRUE_FALSE: { label: "True/False",   className: "bg-orange-50 text-orange-700 border-orange-200" },
};

const DIFF_COLOR: Record<string, string> = {
  EASY:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  HARD:   "bg-red-50 text-red-700 border-red-200",
};

export function QuestionBankCreatorView({ node, updateAttributes, deleteNode }: NodeViewProps) {
  const { questionType, difficulty, points, options } = node.attrs;
  const [focused, setFocused] = useState(false);

  const typePill = DIFF_PILL[questionType] ?? DIFF_PILL.SINGLE;

  const handleAddOption = useCallback(() => {
    updateAttributes({
      options: [...options, { id: crypto.randomUUID(), text: "", isCorrect: false }],
    });
  }, [options, updateAttributes]);

  const handleRemoveOption = useCallback((id: string) => {
    updateAttributes({
      options: options.filter((o: any) => o.id !== id),
    });
  }, [options, updateAttributes]);

  const handleOptionChange = useCallback((id: string, text: string) => {
    updateAttributes({
      options: options.map((o: any) => (o.id === id ? { ...o, text } : o)),
    });
  }, [options, updateAttributes]);

  const handleToggleCorrect = useCallback((id: string) => {
    if (questionType === "SINGLE" || questionType === "TRUE_FALSE") {
      updateAttributes({
        options: options.map((o: any) => ({ ...o, isCorrect: o.id === id })),
      });
    } else {
      updateAttributes({
        options: options.map((o: any) => (o.id === id ? { ...o, isCorrect: !o.isCorrect } : o)),
      });
    }
  }, [options, questionType, updateAttributes]);

  const hasCorrectAnswer = options.some((o: any) => o.isCorrect);

  return (
    <NodeViewWrapper className="not-prose my-5 group" data-drag-handle>
      <div
        className={`relative rounded-2xl border-2 bg-white transition-all duration-200 ${
          focused
            ? "border-indigo-300 shadow-[0_0_0_4px_rgba(99,102,241,0.08)] shadow-indigo-500/10"
            : "border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md"
        }`}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {/* Drag handle */}
        <div className="absolute -left-6 top-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab text-gray-300" contentEditable={false}>
          <GripVertical size={16} />
        </div>

        {/* Card header */}
        <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-gray-100" contentEditable={false}>
          {/* Badges */}
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${typePill.className}`}>
            {typePill.label}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${DIFF_COLOR[difficulty] ?? DIFF_COLOR.MEDIUM}`}>
            {difficulty}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md border border-gray-200 text-gray-500 bg-gray-50">
            {points ?? 1} {(points ?? 1) === 1 ? "pt" : "pts"}
          </span>

          {/* Not answered warning */}
          {!hasCorrectAnswer && (
            <span className="ml-auto flex items-center gap-1 text-[10px] font-medium text-amber-600">
              <AlertCircle size={11} /> No correct answer set
            </span>
          )}

          {/* Delete */}
          <button
            onClick={deleteNode}
            onMouseDown={(e) => e.stopPropagation()}
            title="Delete question"
            className={`${hasCorrectAnswer ? "ml-auto" : ""} p-1 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors`}
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Prompt — native Tiptap rich text */}
        <div className="px-5 pt-4 pb-2">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2" contentEditable={false}>
            Question Prompt
          </p>
          <NodeViewContent
            className="min-h-[48px] text-gray-900 text-sm leading-relaxed focus:outline-none empty:before:content-['Type_your_question_here…'] empty:before:text-gray-300"
          />
        </div>

        {/* Options */}
        <div className="px-5 pt-3 pb-5" contentEditable={false}>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
            Answer Options
          </p>
          <div className="space-y-2">
            {options.map((opt: any, i: number) => (
              <div key={opt.id} className="flex items-center gap-2.5 group/opt">
                {/* Correct answer toggle */}
                <button
                  onClick={() => handleToggleCorrect(opt.id)}
                  title={opt.isCorrect ? "Correct answer" : "Mark as correct"}
                  className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                    opt.isCorrect
                      ? "border-indigo-600 bg-indigo-600 shadow-sm"
                      : "border-gray-300 hover:border-indigo-400 bg-white"
                  }`}
                >
                  {opt.isCorrect && <Check size={10} className="text-white" strokeWidth={3} />}
                </button>

                {/* Letter label */}
                <span className="flex-shrink-0 w-5 text-xs font-bold text-gray-400 text-center">
                  {String.fromCharCode(65 + i)}
                </span>

                {/* Text input */}
                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                  placeholder={`Option ${String.fromCharCode(65 + i)}…`}
                  className={`flex-1 text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 transition-all ${
                    opt.isCorrect
                      ? "border-indigo-200 bg-indigo-50/50 text-indigo-900 focus:ring-indigo-200"
                      : "border-gray-200 bg-gray-50 text-gray-800 focus:ring-gray-200 focus:bg-white"
                  }`}
                />

                {/* Remove */}
                {options.length > 1 && (
                  <button
                    onClick={() => handleRemoveOption(opt.id)}
                    className="flex-shrink-0 p-1.5 rounded-lg text-transparent group-hover/opt:text-gray-300 hover:!text-red-500 hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add option */}
          {questionType !== "TRUE_FALSE" && (
            <button
              onClick={handleAddOption}
              className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-indigo-500 hover:text-indigo-700 transition-colors"
            >
              <Plus size={13} />
              Add option
            </button>
          )}
        </div>
      </div>
    </NodeViewWrapper>
  );
}
