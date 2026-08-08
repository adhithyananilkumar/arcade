"use client";

import { useCallback } from "react";
import { Plus, Trash2, Check, Loader2, CircleCheck, Image as ImageIcon } from "lucide-react";

export interface QuizQuestionData {
  key: string;
  question: string;
  questionType: "text" | "photo";
  questionPic?: string;
  answerSelectionType: "single" | "multiple";
  answers: string[];
  correctAnswer: string | number[];
  messageForCorrectAnswer?: string;
  messageForIncorrectAnswer?: string;
  explanation?: string;
  point: number;
  segment?: string;
}

export type SaveState = "idle" | "saving" | "saved" | "error";

export const newKey = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export function newQuestion(): QuizQuestionData {
  return {
    key: newKey(),
    question: "",
    questionType: "text",
    answerSelectionType: "single",
    answers: ["", ""],
    correctAnswer: "1",
    point: 10,
  };
}

export interface QuizEditorProps {
  questions: QuizQuestionData[];
  onChange: (questions: QuizQuestionData[]) => void;
  saveState?: SaveState;
  className?: string;
}

export function QuizEditor({ questions, onChange, saveState = "idle", className = "" }: QuizEditorProps) {
  const mapQuestion = useCallback(
    (qKey: string, fn: (q: QuizQuestionData) => QuizQuestionData) => {
      onChange(questions.map((q) => (q.key === qKey ? fn(q) : q)));
    },
    [questions, onChange]
  );

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const addQuestion = () => onChange([...questions, newQuestion()]);
  const removeQuestion = (qKey: string) => onChange(questions.filter((q) => q.key !== qKey));

  const updateField = <K extends keyof QuizQuestionData>(qKey: string, field: K, value: QuizQuestionData[K]) =>
    mapQuestion(qKey, (q) => ({ ...q, [field]: value }));

  const addOption = (qKey: string) =>
    mapQuestion(qKey, (q) => ({ ...q, answers: [...q.answers, ""] }));

  const removeOption = (qKey: string, indexToRemove: number) =>
    mapQuestion(qKey, (q) => {
      const answers = q.answers.filter((_, i) => i !== indexToRemove);
      let correctAnswer = q.correctAnswer;
      const index1Based = indexToRemove + 1;
      
      if (q.answerSelectionType === "single") {
        if (String(correctAnswer) === String(index1Based)) correctAnswer = "1";
        else if (parseInt(String(correctAnswer)) > index1Based) correctAnswer = String(parseInt(String(correctAnswer)) - 1);
      } else {
        let arr = Array.isArray(correctAnswer) ? correctAnswer : [parseInt(String(correctAnswer))];
        arr = arr.filter(v => v !== index1Based).map(v => v > index1Based ? v - 1 : v);
        if (arr.length === 0) arr = [1];
        correctAnswer = arr;
      }
      return { ...q, answers, correctAnswer };
    });

  const setOptionText = (qKey: string, index: number, text: string) =>
    mapQuestion(qKey, (q) => {
      const answers = [...q.answers];
      answers[index] = text;
      return { ...q, answers };
    });

  const toggleCorrect = (qKey: string, index: number) =>
    mapQuestion(qKey, (q) => {
      const index1Based = index + 1;
      if (q.answerSelectionType === "single") {
        return { ...q, correctAnswer: String(index1Based) };
      } else {
        let arr = Array.isArray(q.correctAnswer) ? [...q.correctAnswer] : [parseInt(String(q.correctAnswer))];
        if (arr.includes(index1Based)) {
          arr = arr.filter(v => v !== index1Based);
          if (arr.length === 0) arr = [index1Based]; // enforce at least one correct
        } else {
          arr.push(index1Based);
          arr.sort((a, b) => a - b);
        }
        return { ...q, correctAnswer: arr };
      }
    });

  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="font-medium text-gray-700">
            {questions.length} {questions.length === 1 ? "question" : "questions"}
          </span>
        </div>
        <SaveIndicator state={saveState} />
      </div>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto pb-8">
        {questions.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center">
            <CircleCheck size={26} className="text-gray-300" />
            <p className="text-sm text-gray-400">
              No questions yet. Add your first question below.
            </p>
          </div>
        )}

        {questions.map((q, qi) => {
          const isMultiple = q.answerSelectionType === "multiple";
          const correctArr = Array.isArray(q.correctAnswer)
            ? q.correctAnswer
            : [parseInt(String(q.correctAnswer)) || 1];

          return (
            <div key={q.key} className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              {/* Question Header */}
              <div className="flex flex-wrap items-center gap-3 border-b border-gray-100 bg-gray-50/50 px-4 py-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                  {qi + 1}
                </span>
                
                <select
                  value={q.questionType}
                  onChange={(e) => updateField(q.key, "questionType", e.target.value as "text" | "photo")}
                  className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 outline-none focus:border-indigo-400"
                >
                  <option value="text">Text Question</option>
                  <option value="photo">Photo Question</option>
                </select>

                <select
                  value={q.answerSelectionType}
                  onChange={(e) => updateField(q.key, "answerSelectionType", e.target.value as "single" | "multiple")}
                  className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 outline-none focus:border-indigo-400"
                >
                  <option value="single">Single Answer</option>
                  <option value="multiple">Multiple Answers</option>
                </select>

                <div className="ml-auto flex flex-wrap items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 whitespace-nowrap">
                    Points
                    <input
                      type="number"
                      min={0}
                      value={q.point}
                      onChange={(e) => updateField(q.key, "point", parseInt(e.target.value) || 0)}
                      className="w-14 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-800 outline-none focus:border-indigo-400"
                    />
                  </label>
                  <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 whitespace-nowrap">
                    Segment
                    <input
                      type="text"
                      placeholder="e.g. Hooks"
                      value={q.segment || ""}
                      onChange={(e) => updateField(q.key, "segment", e.target.value)}
                      className="w-24 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-800 outline-none focus:border-indigo-400"
                    />
                  </label>
                  <div className="h-4 w-px bg-gray-200 mx-1 hidden sm:block"></div>
                  <button
                    type="button"
                    title="Delete question"
                    onClick={() => removeQuestion(q.key)}
                    className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-5">
                {/* Prompt */}
                <div>
                  <textarea
                    value={q.question}
                    onChange={(e) => updateField(q.key, "question", e.target.value)}
                    placeholder="Enter your question prompt..."
                    rows={2}
                    className="w-full resize-y rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-400 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                  />
                  {q.questionType === "photo" && (
                    <div className="mt-2 flex items-center gap-2">
                      <ImageIcon size={16} className="text-gray-400" />
                      <input
                        type="url"
                        value={q.questionPic || ""}
                        onChange={(e) => updateField(q.key, "questionPic", e.target.value)}
                        placeholder="Image URL (e.g. https://dummyimage.com/...)"
                        className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-800 outline-none focus:border-indigo-400"
                      />
                    </div>
                  )}
                </div>

                {/* Options */}
                <div>
                  <div className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Answers</div>
                  <div className="space-y-2">
                    {q.answers.map((ans, i) => {
                      const isCorrect = correctArr.includes(i + 1);
                      return (
                        <div key={i} className="flex items-center gap-2">
                          <button
                            type="button"
                            title={isCorrect ? "Correct answer" : "Mark as correct"}
                            onClick={() => toggleCorrect(q.key, i)}
                            className={`flex h-5 w-5 flex-shrink-0 items-center justify-center border transition-colors ${
                              isMultiple ? "rounded" : "rounded-full"
                            } ${
                              isCorrect
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-gray-300 bg-white text-transparent hover:border-emerald-400"
                            }`}
                          >
                            <Check size={12} />
                          </button>
                          <input
                            type="text"
                            value={ans}
                            onChange={(e) => setOptionText(q.key, i, e.target.value)}
                            placeholder={`Option ${i + 1}`}
                            className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-800 outline-none placeholder:text-gray-300 focus:border-indigo-400 focus:ring-1 focus:ring-indigo-100"
                          />
                          <button
                            type="button"
                            title="Remove option"
                            onClick={() => removeOption(q.key, i)}
                            className="rounded-md p-1.5 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-500"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => addOption(q.key)}
                    className="mt-3 flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    <Plus size={14} />
                    Add Answer
                  </button>
                </div>

                {/* Feedback & Explanation */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
                  <div className="space-y-3">
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-medium text-gray-600">Correct Message</span>
                      <textarea
                        value={q.messageForCorrectAnswer || ""}
                        onChange={(e) => updateField(q.key, "messageForCorrectAnswer", e.target.value)}
                        placeholder="Great job!"
                        rows={1}
                        className="w-full resize-y rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-800 outline-none focus:border-emerald-400"
                      />
                    </label>
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-medium text-gray-600">Incorrect Message</span>
                      <textarea
                        value={q.messageForIncorrectAnswer || ""}
                        onChange={(e) => updateField(q.key, "messageForIncorrectAnswer", e.target.value)}
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
                        value={q.explanation || ""}
                        onChange={(e) => updateField(q.key, "explanation", e.target.value)}
                        placeholder="Explain the correct answer..."
                        className="h-[104px] w-full resize-y rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-800 outline-none focus:border-indigo-400"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={addQuestion}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 bg-white py-4 text-sm font-semibold text-gray-500 transition-colors hover:border-indigo-300 hover:text-indigo-600"
        >
          <Plus size={16} />
          Add Question
        </button>
      </div>
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "saving")
    return (
      <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
        <Loader2 size={12} className="animate-spin" />
        Saving...
      </span>
    );
  if (state === "saved")
    return (
      <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
        <Check size={12} />
        Saved
      </span>
    );
  if (state === "error")
    return <span className="text-xs text-red-500 bg-red-50 px-2 py-1 rounded-md">Save failed</span>;
  return null;
}
