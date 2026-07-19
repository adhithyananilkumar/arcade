// features/assessment/components/QuizPlayer.tsx
"use client";

import { useEffect, useState } from "react";
import { Check, CircleCheck, Loader2, RotateCcw, X } from "lucide-react";
import { getQuizAttempts, getQuizForTaking, submitQuizAttempt } from "../api";
import type {
  QuestionType,
  QuizAttemptResponse,
  QuizAttemptSummaryResponse,
  QuizTakeResponse,
} from "../types";

const TYPE_LABELS: Record<QuestionType, string> = {
  SINGLE: "Single answer",
  MULTIPLE: "Multiple select",
  TRUE_FALSE: "True / False",
};

interface QuizPlayerProps {
  quizId: string;
  className?: string;
  /** Called after a successful submission so the caller can refresh sidebar best-score badges. */
  onAttemptGraded?: (attempt: QuizAttemptResponse) => void;
}

export function QuizPlayer({ quizId, className = "", onAttemptGraded }: QuizPlayerProps) {
  const [quiz, setQuiz] = useState<QuizTakeResponse | null>(null);
  const [history, setHistory] = useState<QuizAttemptSummaryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, Set<string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizAttemptResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setResult(null);
    setAnswers({});
    setError(null);
    Promise.all([getQuizForTaking(quizId), getQuizAttempts(quizId)])
      .then(([q, h]) => {
        if (cancelled) return;
        setQuiz(q);
        setHistory(h);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load quiz");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [quizId]);

  function selectOption(questionId: string, optionId: string, type: QuestionType) {
    if (result) return; // locked after submission
    setAnswers((prev) => {
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

  const allAnswered =
    !!quiz && quiz.questions.every((q) => (answers[q.id]?.size ?? 0) > 0);

  async function handleSubmit() {
    if (!quiz || !allAnswered || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload: Record<string, string[]> = {};
      for (const [qid, set] of Object.entries(answers)) payload[qid] = Array.from(set);
      const graded = await submitQuizAttempt(quizId, payload);
      setResult(graded);
      setHistory((prev) => [
        { attemptId: graded.attemptId, score: graded.score, maxScore: graded.maxScore, submittedAt: graded.submittedAt },
        ...prev,
      ]);
      onAttemptGraded?.(graded);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetake() {
    setResult(null);
    setAnswers({});
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Loader2 className="animate-spin text-indigo-400" size={22} />
      </div>
    );
  }

  if (error && !quiz) {
    return <p className={`text-sm text-red-500 ${className}`}>{error}</p>;
  }

  if (!quiz) return null;

  const resultByQuestion = new Map(result?.results.map((r) => [r.questionId, r]) ?? []);

  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">{quiz.title}</h3>
        {history.length > 0 && (
          <span className="text-xs text-gray-400">
            Best: {Math.max(...history.map((h) => h.score))}/{history[0].maxScore} ·{" "}
            {history.length} {history.length === 1 ? "attempt" : "attempts"}
          </span>
        )}
      </div>

      {result && (
        <div
          className={`mb-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${
            result.score === result.maxScore
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-indigo-200 bg-indigo-50 text-indigo-700"
          }`}
        >
          <CircleCheck size={18} />
          Score: {result.score} / {result.maxScore}
        </div>
      )}

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-8">
        {quiz.questions.map((q, qi) => {
          const questionResult = resultByQuestion.get(q.id);
          return (
            <div key={q.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-600">
                  {qi + 1}
                </span>
                <span className="text-xs font-medium text-gray-400">{TYPE_LABELS[q.type]}</span>
                {questionResult && (
                  <span
                    className={`ml-auto flex items-center gap-1 text-xs font-semibold ${
                      questionResult.correct ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {questionResult.correct ? <Check size={13} /> : <X size={13} />}
                    {questionResult.correct ? "Correct" : "Incorrect"}
                  </span>
                )}
              </div>

              <p className="mb-3 text-sm text-gray-800">{q.prompt}</p>

              <div className="space-y-1.5">
                {q.options.map((o) => {
                  const single = q.type === "SINGLE" || q.type === "TRUE_FALSE";
                  const selected = answers[q.id]?.has(o.id) ?? false;
                  const isCorrectOption = questionResult?.correctOptionIds.includes(o.id);
                  const showGrading = !!questionResult;

                  let boxClass =
                    "border-gray-300 bg-white text-transparent hover:border-indigo-400";
                  if (showGrading && isCorrectOption) {
                    boxClass = "border-emerald-500 bg-emerald-500 text-white";
                  } else if (showGrading && selected && !isCorrectOption) {
                    boxClass = "border-red-500 bg-red-500 text-white";
                  } else if (!showGrading && selected) {
                    boxClass = "border-indigo-500 bg-indigo-500 text-white";
                  }

                  return (
                    <button
                      key={o.id}
                      type="button"
                      disabled={!!result}
                      onClick={() => selectOption(q.id, o.id, q.type)}
                      className="flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left disabled:cursor-default"
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
              </div>
            </div>
          );
        })}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex justify-end gap-2">
          {result ? (
            <button
              type="button"
              onClick={handleRetake}
              className="flex items-center gap-1.5 rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-600 hover:border-indigo-300 hover:text-indigo-600"
            >
              <RotateCcw size={14} />
              Retake quiz
            </button>
          ) : (
            <button
              type="button"
              disabled={!allAnswered || submitting}
              onClick={handleSubmit}
              className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Submit answers
            </button>
          )}
        </div>

        {history.length > 0 && (
          <div className="mt-6 border-t border-gray-100 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Attempt history
            </p>
            <ul className="space-y-1">
              {history.map((h) => (
                <li
                  key={h.attemptId}
                  className="flex items-center justify-between text-xs text-gray-500"
                >
                  <span>{new Date(h.submittedAt).toLocaleString()}</span>
                  <span className="font-medium text-gray-700">
                    {h.score}/{h.maxScore}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
