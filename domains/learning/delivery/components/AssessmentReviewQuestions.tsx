"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  FileQuestion,
  HelpCircle,
  Lightbulb,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tag,
  AlertCircle,
  Award,
  BookOpen,
} from "lucide-react";
import {
  getExamQuestions,
  promptToPlainText,
  type BankQuestionResponse,
  type Difficulty,
} from "@/domains/assessments";
import { TiptapContentView } from "./TiptapContentView";

const DIFFICULTY_CONFIG: Record<
  Difficulty,
  { label: string; badge: string; pill: string }
> = {
  EASY: {
    label: "Easy",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    pill: "bg-emerald-500",
  },
  MEDIUM: {
    label: "Medium",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    pill: "bg-amber-500",
  },
  HARD: {
    label: "Hard",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    pill: "bg-rose-500",
  },
};

function formatTypeLabel(type: string): string {
  switch (type?.toUpperCase()) {
    case "SINGLE":
      return "Single Choice";
    case "MULTIPLE":
      return "Multiple Choice";
    case "TRUE_FALSE":
      return "True / False";
    case "ESSAY":
      return "Long Answer / Essay";
    default:
      return type || "Question";
  }
}

interface AssessmentReviewQuestionsProps {
  examId: string;
  examTitle?: string;
  className?: string;
}

export function AssessmentReviewQuestions({
  examId,
  examTitle,
  className = "",
}: AssessmentReviewQuestionsProps) {
  const [questions, setQuestions] = useState<BankQuestionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("ALL");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getExamQuestions(examId)
      .then((data) => {
        if (cancelled) return;
        setQuestions(data);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load questions for this assessment."
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [examId]);

  const totalPoints = useMemo(
    () => questions.reduce((sum, q) => sum + (q.points || 1), 0),
    [questions]
  );

  const countsByDifficulty = useMemo(() => {
    const counts = { EASY: 0, MEDIUM: 0, HARD: 0 };
    for (const q of questions) {
      if (q.difficulty in counts) {
        counts[q.difficulty as Difficulty]++;
      }
    }
    return counts;
  }, [questions]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      if (difficultyFilter !== "ALL" && q.difficulty !== difficultyFilter) {
        return false;
      }
      if (search.trim()) {
        const query = search.toLowerCase();
        const plainText = promptToPlainText(q.prompt).toLowerCase();
        const inOptions = q.options?.some((o) =>
          o.text?.toLowerCase().includes(query)
        );
        const inTags = q.tags?.some((t) => t.toLowerCase().includes(query));
        const inAnswer = q.sampleAnswer?.toLowerCase().includes(query);
        if (!plainText.includes(query) && !inOptions && !inTags && !inAnswer) {
          return false;
        }
      }
      return true;
    });
  }, [questions, difficultyFilter, search]);

  if (loading) {
    return (
      <div className={`space-y-4 pt-4 ${className}`}>
        <div className="flex items-center justify-between animate-pulse">
          <div className="h-6 w-48 rounded-lg bg-slate-200" />
          <div className="h-6 w-32 rounded-lg bg-slate-200" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs animate-pulse space-y-4"
            >
              <div className="flex gap-2">
                <div className="h-6 w-8 rounded-md bg-slate-200" />
                <div className="h-6 w-3/4 rounded-md bg-slate-200" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-10 rounded-lg bg-slate-100" />
                <div className="h-10 rounded-lg bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-6 text-rose-900">
        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle size={18} className="text-rose-600" />
          Unable to inspect questions
        </div>
        <p className="mt-1 text-sm text-rose-700">{error}</p>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            setError(null);
            getExamQuestions(examId)
              .then(setQuestions)
              .catch((err) => setError(err.message))
              .finally(() => setLoading(false));
          }}
          className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-rose-700 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 pt-2 ${className}`}>
      {/* Question Bank Header & Stats */}
      <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-br from-white via-slate-50/50 to-indigo-50/20 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#14142b] text-white">
                <FileQuestion size={16} />
              </span>
              <h3 className="text-[17px] font-bold tracking-tight text-[#14142b]">
                Question Paper & Assessment Blueprint
              </h3>
            </div>
            <p className="mt-1 text-[13px] text-slate-500">
              Complete review of questions, candidate answer options, scoring keys, and explanations.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">
              <span className="text-[11px] font-medium text-slate-400 block">Total Questions</span>
              <span className="text-[15px] font-bold text-[#14142b]">
                {questions.length} {questions.length === 1 ? "item" : "items"}
              </span>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-2xs">
              <span className="text-[11px] font-medium text-slate-400 block">Total Marks</span>
              <span className="text-[15px] font-bold text-indigo-600">
                {totalPoints} {totalPoints === 1 ? "mark" : "marks"}
              </span>
            </div>
          </div>
        </div>

        {/* Filter bar */}
        {questions.length > 0 && (
          <div className="mt-5 pt-4 border-t border-slate-200/70 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions, options, tags..."
                className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-[#14142b] placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setDifficultyFilter("ALL")}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                  difficultyFilter === "ALL"
                    ? "bg-[#14142b] text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                All ({questions.length})
              </button>
              {(["EASY", "MEDIUM", "HARD"] as Difficulty[]).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setDifficultyFilter(diff)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-all ${
                    difficultyFilter === diff
                      ? "bg-[#14142b] text-white shadow-xs"
                      : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {DIFFICULTY_CONFIG[diff].label} ({countsByDifficulty[diff]})
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {questions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
            <FileQuestion size={24} />
          </div>
          <h4 className="mt-4 text-[16px] font-bold text-[#14142b]">
            No questions in this assessment yet
          </h4>
          <p className="mt-1 text-[13px] text-slate-500 max-w-md mx-auto">
            The author has placed this exam into the course, but has not yet added questions to its
            question bank.
          </p>
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-8 text-center">
          <p className="text-sm font-medium text-slate-500">
            No questions matched your search criteria.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setDifficultyFilter("ALL");
            }}
            className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 underline"
          >
            Reset filters
          </button>
        </div>
      ) : (
        /* Questions list */
        <div className="space-y-4">
          {filteredQuestions.map((q, idx) => {
            const diff = DIFFICULTY_CONFIG[q.difficulty as Difficulty] || {
              label: q.difficulty || "Standard",
              badge: "bg-slate-100 text-slate-600 border-slate-200",
              pill: "bg-slate-400",
            };

            const promptJsonString =
              typeof q.prompt === "string" ? q.prompt : JSON.stringify(q.prompt);

            const hasPromptContent = Boolean(promptToPlainText(q.prompt).trim());

            return (
              <div
                key={q.id || idx}
                className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Question top badges */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#14142b] text-[11px] font-bold text-white shadow-2xs">
                      {idx + 1}
                    </span>
                    <span className="text-[12px] font-semibold text-slate-500">
                      {formatTypeLabel(q.type)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${diff.badge}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${diff.pill}`} />
                      {diff.label}
                    </span>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                      {q.points || 1} {q.points === 1 ? "point" : "points"}
                    </span>
                    {q.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-700"
                      >
                        <Tag size={10} /> {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Prompt content */}
                <div className="text-[14px] leading-relaxed text-[#14142b] font-medium">
                  {hasPromptContent ? (
                    <TiptapContentView body={promptJsonString} />
                  ) : (
                    <span className="italic text-slate-400">
                      Untitled question prompt
                    </span>
                  )}
                </div>

                {/* Options / Answer choices */}
                {q.options && q.options.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Options & Answer Key
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {q.options.map((opt, optIdx) => {
                        const letter = String.fromCharCode(65 + optIdx);
                        const isCorrect = Boolean(opt.correct);

                        return (
                          <div
                            key={opt.id || optIdx}
                            className={`relative flex items-start gap-3 rounded-xl border p-3 text-xs transition-all ${
                              isCorrect
                                ? "border-emerald-500 bg-emerald-50/70 text-emerald-950 font-medium shadow-2xs"
                                : "border-slate-200/90 bg-slate-50/40 text-slate-700"
                            }`}
                          >
                            <span
                              className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-lg text-[10px] font-bold ${
                                isCorrect
                                  ? "bg-emerald-600 text-white"
                                  : "border border-slate-300 bg-white text-slate-600"
                              }`}
                            >
                              {letter}
                            </span>

                            <div className="flex-1 min-w-0 pr-1">
                              <p className="leading-snug break-words">
                                {opt.text || <span className="italic text-slate-400">Empty option text</span>}
                              </p>
                            </div>

                            {isCorrect && (
                              <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-2xs flex-shrink-0">
                                <Check size={10} /> Correct
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Explanation / Solution Key */}
                {q.sampleAnswer && q.sampleAnswer.trim() && (
                  <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3.5 text-xs text-amber-950 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900 text-[11px] uppercase tracking-wider">
                      <Lightbulb size={13} className="text-amber-600" /> Explanation / Answer Key
                    </div>
                    <p className="text-[13px] leading-relaxed text-amber-900">
                      {q.sampleAnswer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
