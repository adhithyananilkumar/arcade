// features/assessment/components/QuestionBankPreview.tsx
"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { getAllBankQuestions, listSections } from "../api";
import type { BankQuestionResponse, BankQuestionType, Difficulty, SectionResponse } from "../types";
import { PromptView } from "./prompt-editor/PromptView";

const TYPE_LABELS: Record<BankQuestionType, string> = {
  SINGLE: "Single answer",
  MULTIPLE: "Multiple select",
  TRUE_FALSE: "True / False",
  SENTENCE: "Sentence answer",
};

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  EASY: "bg-emerald-50 text-emerald-700 border-emerald-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  HARD: "bg-rose-50 text-rose-700 border-rose-200",
};

interface QuestionBankPreviewProps {
  bankId: string;
  onClose: () => void;
}

/**
 * Full-screen creator preview of a question bank — same fixed-overlay/per-question-card visual
 * language as QuizPlayer, but client-side only (no attempt is persisted): a practice/self-check
 * tool, not a graded assessment.
 */
export function QuestionBankPreview({ bankId, onClose }: QuestionBankPreviewProps) {
  const [questions, setQuestions] = useState<BankQuestionResponse[] | null>(null);
  const [sections, setSections] = useState<SectionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selections, setSelections] = useState<Record<string, Set<string>>>({});
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [sentenceAnswers, setSentenceAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([getAllBankQuestions(bankId), listSections(bankId)])
      .then(([qs, secs]) => {
        if (!cancelled) {
          setQuestions(qs);
          setSections(secs);
        }
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load bank");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [bankId]);

  function selectOption(questionId: string, optionId: string, type: BankQuestionType) {
    setSelections((prev) => {
      const next = { ...prev };
      if (type === "MULTIPLE") {
        const current = new Set(prev[questionId]);
        if (current.has(optionId)) current.delete(optionId);
        else current.add(optionId);
        next[questionId] = current;
      } else {
        next[questionId] = new Set([optionId]);
      }
      return next;
    });
  }

  function reveal(questionId: string) {
    setRevealed((prev) => new Set(prev).add(questionId));
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
        <h3 className="text-lg font-bold text-gray-900">Question bank preview</h3>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
        >
          <X size={20} />
        </button>
      </div>

      <div className="mx-auto min-h-0 w-full max-w-3xl flex-1 overflow-y-auto px-6 py-6">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-indigo-400" size={22} />
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        {questions && sections.map((section) => {
          const sectionQuestions = questions.filter((q) => q.sectionId === section.id);
          if (sectionQuestions.length === 0) return null;
          return (
            <div key={section.id} className="mb-8">
              <h4 className="mb-3 text-xs font-bold uppercase tracking-wide text-gray-400">
                {section.title}
              </h4>
              <div className="space-y-4">
                {sectionQuestions.map((q, qi) => (
                  <div key={q.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center gap-2">
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-600">
                        {qi + 1}
                      </span>
                      <span className="text-xs font-medium text-gray-400">{TYPE_LABELS[q.type]}</span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold capitalize ${DIFFICULTY_STYLES[q.difficulty]}`}
                  >
                    {q.difficulty.toLowerCase()}
                  </span>
                </div>

                <PromptView doc={q.prompt} className="mb-3" />

                {q.type === "SENTENCE" ? (
                  <div className="space-y-2">
                    <textarea
                      value={sentenceAnswers[q.id] ?? ""}
                      onChange={(e) =>
                        setSentenceAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                      }
                      placeholder="Type your answer…"
                      rows={2}
                      className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-300 focus:ring-1 focus:ring-indigo-200"
                    />
                    {revealed.has(q.id) ? (
                      <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                        <span className="font-semibold">Model answer:</span> {q.sampleAnswer}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => reveal(q.id)}
                        className="text-xs font-medium text-indigo-600 hover:underline"
                      >
                        Reveal model answer
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {q.options.map((o) => {
                      const single = q.type === "SINGLE" || q.type === "TRUE_FALSE";
                      const selected = selections[q.id]?.has(o.id) ?? false;
                      const showGrading = revealed.has(q.id);

                      let boxClass =
                        "border-gray-300 bg-white text-transparent hover:border-indigo-400";
                      if (showGrading && o.correct) {
                        boxClass = "border-emerald-500 bg-emerald-500 text-white";
                      } else if (showGrading && selected && !o.correct) {
                        boxClass = "border-red-500 bg-red-500 text-white";
                      } else if (!showGrading && selected) {
                        boxClass = "border-indigo-500 bg-indigo-500 text-white";
                      }

                      return (
                        <button
                          key={o.id}
                          type="button"
                          onClick={() => selectOption(q.id, o.id, q.type)}
                          className="flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left"
                        >
                          <span
                            className={`flex h-5 w-5 flex-shrink-0 items-center justify-center border transition-colors ${
                              single ? "rounded-full" : "rounded"
                            } ${boxClass}`}
                          >
                            <Check size={12} />
                          </span>
                          <span className="flex-1 rounded-lg px-2 py-1.5 text-sm text-gray-800">
                            {o.text}
                          </span>
                        </button>
                      );
                    })}
                    {!revealed.has(q.id) && (
                      <button
                        type="button"
                        onClick={() => reveal(q.id)}
                        className="mt-1 text-xs font-medium text-indigo-600 hover:underline"
                      >
                        Reveal correct answer
                      </button>
                    )}
                  </div>
                )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {questions && questions.length === 0 && (
          <p className="py-12 text-center text-sm text-gray-400">
            This bank has no questions yet.
          </p>
        )}
      </div>
    </div>
  );
}
