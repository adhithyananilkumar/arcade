// features/assessment/components/QuestionBankEditor.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Trash2, Check, Loader2, CircleCheck, Upload, Eye } from "lucide-react";
import { getBankQuestions, saveBankQuestions } from "../api";
import type { BankQuestionType, QuestionBankQuestionsRequest } from "../types";
import { QuestionBankImportDialog } from "./QuestionBankImportDialog";
import { QuestionBankPreview } from "./QuestionBankPreview";

/** Debounce for autosaving question edits. */
const SAVE_DEBOUNCE_MS = 1200;

// ── Local model (client keys for stable React identity while editing) ──────────

interface LocalOption {
  key: string;
  text: string;
  correct: boolean;
}

interface LocalQuestion {
  key: string;
  type: BankQuestionType;
  prompt: string;
  points: number;
  options: LocalOption[];
  sampleAnswer: string;
}

type SaveState = "idle" | "saving" | "saved" | "error";

const newKey = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

function blankOption(text = "", correct = false): LocalOption {
  return { key: newKey(), text, correct };
}

function trueFalseOptions(): LocalOption[] {
  return [blankOption("True", true), blankOption("False", false)];
}

function newQuestion(): LocalQuestion {
  return {
    key: newKey(),
    type: "SINGLE",
    prompt: "",
    points: 1,
    options: [blankOption("", true), blankOption()],
    sampleAnswer: "",
  };
}

function toRequest(questions: LocalQuestion[]): QuestionBankQuestionsRequest {
  return {
    questions: questions.map((q) => ({
      type: q.type,
      prompt: q.prompt,
      points: q.points,
      options:
        q.type === "SENTENCE" ? [] : q.options.map((o) => ({ text: o.text, correct: o.correct })),
      sampleAnswer: q.type === "SENTENCE" ? q.sampleAnswer : "",
    })),
  };
}

const TYPE_LABELS: Record<BankQuestionType, string> = {
  SINGLE: "Single answer",
  MULTIPLE: "Multiple select",
  TRUE_FALSE: "True / False",
  SENTENCE: "Sentence answer",
};

interface QuestionBankEditorProps {
  bankId: string;
  className?: string;
}

export function QuestionBankEditor({ bankId, className = "" }: QuestionBankEditorProps) {
  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [importOpen, setImportOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<LocalQuestion[] | null>(null);

  const fromServer = useCallback(
    (server: Awaited<ReturnType<typeof getBankQuestions>>): LocalQuestion[] =>
      server.map((q) => ({
        key: newKey(),
        type: q.type,
        prompt: q.prompt,
        points: q.points,
        options: q.options.map((o) => ({
          key: newKey(),
          text: o.text,
          correct: o.correct,
        })),
        sampleAnswer: q.sampleAnswer ?? "",
      })),
    []
  );

  // ── Load ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const server = await getBankQuestions(bankId);
        if (cancelled) return;
        setQuestions(fromServer(server));
      } catch (e) {
        console.warn("Failed to load question bank", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bankId, fromServer]);

  // ── Save (debounced) ──────────────────────────────────────────────────────────
  const flushSave = useCallback(async () => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
    }
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;
    setSaveState("saving");
    try {
      await saveBankQuestions(bankId, toRequest(pending));
      setSaveState("saved");
    } catch (e) {
      console.warn("Question bank save failed", e);
      setSaveState("error");
    }
  }, [bankId]);

  const scheduleSave = useCallback(
    (next: LocalQuestion[]) => {
      pendingRef.current = next;
      setSaveState("saving");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(flushSave, SAVE_DEBOUNCE_MS);
    },
    [flushSave]
  );

  // Flush any pending edit when unmounting (e.g. switching to another item).
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      const pending = pendingRef.current;
      if (pending) {
        pendingRef.current = null;
        saveBankQuestions(bankId, toRequest(pending)).catch(() => {});
      }
    };
  }, [bankId]);

  /** Apply a change and schedule a save. */
  const commit = useCallback(
    (next: LocalQuestion[]) => {
      setQuestions(next);
      scheduleSave(next);
    },
    [scheduleSave]
  );

  const mapQuestion = useCallback(
    (qKey: string, fn: (q: LocalQuestion) => LocalQuestion) => {
      commit(questions.map((q) => (q.key === qKey ? fn(q) : q)));
    },
    [questions, commit]
  );

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const addQuestion = () => commit([...questions, newQuestion()]);

  const removeQuestion = (qKey: string) =>
    commit(questions.filter((q) => q.key !== qKey));

  const setPrompt = (qKey: string, prompt: string) =>
    mapQuestion(qKey, (q) => ({ ...q, prompt }));

  const setPoints = (qKey: string, points: number) =>
    mapQuestion(qKey, (q) => ({ ...q, points: Number.isFinite(points) ? Math.max(0, points) : 0 }));

  const setSampleAnswer = (qKey: string, sampleAnswer: string) =>
    mapQuestion(qKey, (q) => ({ ...q, sampleAnswer }));

  const setType = (qKey: string, type: BankQuestionType) =>
    mapQuestion(qKey, (q) => {
      if (type === q.type) return q;
      if (type === "TRUE_FALSE") return { ...q, type, options: trueFalseOptions() };
      if (type === "SENTENCE") return { ...q, type };
      // Leaving TRUE_FALSE/SENTENCE — start from two fresh options.
      let options =
        q.type === "TRUE_FALSE" || q.type === "SENTENCE"
          ? [blankOption("", true), blankOption()]
          : q.options;
      // SINGLE requires exactly one correct option.
      if (type === "SINGLE" && options.filter((o) => o.correct).length !== 1) {
        options = options.map((o, i) => ({ ...o, correct: i === 0 }));
      }
      return { ...q, type, options };
    });

  const addOption = (qKey: string) =>
    mapQuestion(qKey, (q) => ({ ...q, options: [...q.options, blankOption()] }));

  const removeOption = (qKey: string, oKey: string) =>
    mapQuestion(qKey, (q) => {
      const options = q.options.filter((o) => o.key !== oKey);
      // SINGLE must always have one correct option.
      if (q.type === "SINGLE" && !options.some((o) => o.correct) && options.length) {
        options[0] = { ...options[0], correct: true };
      }
      return { ...q, options };
    });

  const setOptionText = (qKey: string, oKey: string, text: string) =>
    mapQuestion(qKey, (q) => ({
      ...q,
      options: q.options.map((o) => (o.key === oKey ? { ...o, text } : o)),
    }));

  const toggleCorrect = (qKey: string, oKey: string) =>
    mapQuestion(qKey, (q) => {
      const single = q.type === "SINGLE" || q.type === "TRUE_FALSE";
      return {
        ...q,
        options: q.options.map((o) =>
          single
            ? { ...o, correct: o.key === oKey }
            : o.key === oKey
              ? { ...o, correct: !o.correct }
              : o
        ),
      };
    });

  // Called by the import dialog once it has fetched+saved questions server-side.
  const handleImported = useCallback(
    async () => {
      setLoading(true);
      try {
        const server = await getBankQuestions(bankId);
        setQuestions(fromServer(server));
      } finally {
        setLoading(false);
      }
    },
    [bankId, fromServer]
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <Loader2 className="animate-spin text-indigo-400" size={22} />
      </div>
    );
  }

  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <span className="font-medium text-gray-700">
            {questions.length} {questions.length === 1 ? "question" : "questions"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <SaveIndicator state={saveState} />
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            disabled={questions.length === 0}
            title="Preview"
            className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-indigo-300 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Eye size={13} />
            Preview
          </button>
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:border-indigo-300 hover:text-indigo-600"
          >
            <Upload size={13} />
            Import from JSON
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-8">
        {questions.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-gray-200 bg-white px-4 py-12 text-center">
            <CircleCheck size={26} className="text-gray-300" />
            <p className="text-sm text-gray-400">
              No questions yet. Add your first question below, or import a bank as JSON.
            </p>
          </div>
        )}

        {questions.map((q, qi) => (
          <div
            key={q.key}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            {/* Question header */}
            <div className="mb-3 flex items-center gap-2">
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-semibold text-indigo-600">
                {qi + 1}
              </span>
              <select
                value={q.type}
                onChange={(e) => setType(q.key, e.target.value as BankQuestionType)}
                className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-700 outline-none focus:ring-1 focus:ring-indigo-200"
              >
                {(Object.keys(TYPE_LABELS) as BankQuestionType[]).map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
              <div className="ml-auto flex items-center gap-1.5">
                <label className="flex items-center gap-1 text-xs text-gray-400">
                  Points
                  <input
                    type="number"
                    min={0}
                    value={q.points}
                    onChange={(e) => setPoints(q.key, parseInt(e.target.value, 10))}
                    className="w-14 rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-700 outline-none focus:ring-1 focus:ring-indigo-200"
                  />
                </label>
                <button
                  type="button"
                  title="Delete question"
                  onClick={() => removeQuestion(q.key)}
                  className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Prompt */}
            <textarea
              value={q.prompt}
              onChange={(e) => setPrompt(q.key, e.target.value)}
              placeholder="Enter your question…"
              rows={2}
              className="mb-3 w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-300 focus:ring-1 focus:ring-indigo-200"
            />

            {q.type === "SENTENCE" ? (
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">
                  Model answer (shown to learners as a self-check reference)
                </label>
                <textarea
                  value={q.sampleAnswer}
                  onChange={(e) => setSampleAnswer(q.key, e.target.value)}
                  placeholder="Expected answer…"
                  rows={2}
                  className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-300 focus:ring-1 focus:ring-indigo-200"
                />
              </div>
            ) : (
              <>
                {/* Options */}
                <div className="space-y-1.5">
                  {q.options.map((o) => {
                    const single = q.type === "SINGLE" || q.type === "TRUE_FALSE";
                    const readOnlyText = q.type === "TRUE_FALSE";
                    return (
                      <div key={o.key} className="flex items-center gap-2">
                        <button
                          type="button"
                          title={o.correct ? "Correct answer" : "Mark as correct"}
                          onClick={() => toggleCorrect(q.key, o.key)}
                          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center border transition-colors ${
                            single ? "rounded-full" : "rounded"
                          } ${
                            o.correct
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-gray-300 bg-white text-transparent hover:border-emerald-400"
                          }`}
                        >
                          <Check size={12} />
                        </button>
                        <input
                          type="text"
                          value={o.text}
                          readOnly={readOnlyText}
                          onChange={(e) => setOptionText(q.key, o.key, e.target.value)}
                          placeholder="Answer option"
                          className={`flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-800 outline-none placeholder:text-gray-300 focus:ring-1 focus:ring-indigo-200 ${
                            readOnlyText ? "bg-gray-50 text-gray-500" : ""
                          }`}
                        />
                        {!readOnlyText && (
                          <button
                            type="button"
                            title="Remove option"
                            onClick={() => removeOption(q.key, o.key)}
                            className="rounded-md p-1.5 text-gray-300 transition-colors hover:bg-gray-100 hover:text-gray-500"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {q.type !== "TRUE_FALSE" && (
                  <button
                    type="button"
                    onClick={() => addOption(q.key)}
                    className="mt-2 flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-indigo-600"
                  >
                    <Plus size={12} />
                    Add option
                  </button>
                )}
              </>
            )}
          </div>
        ))}

        {/* Add question */}
        <button
          type="button"
          onClick={addQuestion}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 bg-white py-3 text-sm font-medium text-gray-500 transition-colors hover:border-indigo-300 hover:text-indigo-600"
        >
          <Plus size={16} />
          Add question
        </button>
      </div>

      {importOpen && (
        <QuestionBankImportDialog
          bankId={bankId}
          hasExistingQuestions={questions.length > 0}
          onClose={() => setImportOpen(false)}
          onImported={() => {
            setImportOpen(false);
            handleImported();
          }}
        />
      )}

      {previewOpen && (
        <QuestionBankPreview bankId={bankId} onClose={() => setPreviewOpen(false)} />
      )}
    </div>
  );
}

function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "saving")
    return (
      <span className="flex items-center gap-1.5 text-xs text-gray-400">
        <Loader2 size={12} className="animate-spin" />
        Saving…
      </span>
    );
  if (state === "saved")
    return (
      <span className="flex items-center gap-1.5 text-xs text-emerald-600">
        <Check size={12} />
        Saved
      </span>
    );
  if (state === "error")
    return <span className="text-xs text-red-500">Save failed — retrying on next edit</span>;
  return null;
}
