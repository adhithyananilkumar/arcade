// domains/assessments/components/SectionQuestionsEditor.tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Trash2, Check, Loader2, CircleCheck, Upload, Eye, ChevronUp, ChevronDown } from "lucide-react";
import { getSectionQuestions, saveSectionQuestions } from "../api";
import type { BankQuestionType, Difficulty, QuestionBankQuestionsRequest } from "../types";
import type { TiptapDocument } from "@/shared/types/editor.types";
import { QuestionPromptEditor } from "./prompt-editor/QuestionPromptEditor";
import { QuestionBankImportDialog } from "./QuestionBankImportDialog";
import { QuestionBankPreview } from "./QuestionBankPreview";

/** Debounce for autosaving question edits. */
const SAVE_DEBOUNCE_MS = 1200;

const EMPTY_DOC: TiptapDocument = { type: "doc", content: [] };

// ── Local model (client keys for stable React identity while editing) ──────────

interface LocalOption {
  key: string;
  text: string;
  correct: boolean;
}

interface LocalQuestion {
  key: string;
  /** Server id, if this question already exists — omitted for questions created client-side. */
  id?: string;
  type: BankQuestionType;
  difficulty: Difficulty;
  prompt: TiptapDocument;
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
    difficulty: "MEDIUM",
    prompt: EMPTY_DOC,
    points: 1,
    options: [blankOption("", true), blankOption()],
    sampleAnswer: "",
  };
}

function toRequest(questions: LocalQuestion[]): QuestionBankQuestionsRequest {
  return {
    questions: questions.map((q) => ({
      id: q.id,
      type: q.type,
      difficulty: q.difficulty,
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

const DIFFICULTIES_BG: Record<Difficulty, string> = {
  EASY: "bg-emerald-50 text-emerald-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  HARD: "bg-rose-50 text-rose-700",
};

const DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD"];

const EditorNumberInput = ({ value, onChange }: { value: number; onChange: (val: number) => void }) => (
  <div className="relative flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-300 transition-all">
    <input
      type="number"
      min={0}
      value={value}
      onChange={(e) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val)) onChange(Math.max(0, val));
      }}
      className="w-12 appearance-none border-none bg-transparent px-2 py-1.5 text-center text-xs font-semibold text-[#14142b] outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
    />
    <div className="flex flex-col border-l border-slate-200 bg-slate-50">
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="flex h-[13.5px] w-[18px] items-center justify-center text-slate-400 hover:bg-slate-200 hover:text-[#14142b] transition-colors"
      >
        <ChevronUp size={10} strokeWidth={3} />
      </button>
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="flex h-[13.5px] w-[18px] items-center justify-center border-t border-slate-200 text-slate-400 hover:bg-slate-200 hover:text-[#14142b] transition-colors"
      >
        <ChevronDown size={10} strokeWidth={3} />
      </button>
    </div>
  </div>
);

interface SectionQuestionsEditorProps {
  bankId: string;
  sectionId: string;
  sectionTitle: string;
  className?: string;
  /** Called whenever this section's question count changes, so the sidebar's cached count (only
   * fetched once, on the bank's initial load) doesn't go stale while editing. */
  onQuestionCountChange?: (sectionId: string, count: number) => void;
}

export function SectionQuestionsEditor({
  bankId,
  sectionId,
  sectionTitle,
  className = "",
  onQuestionCountChange,
}: SectionQuestionsEditorProps) {
  const [questions, setQuestions] = useState<LocalQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [importOpen, setImportOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<LocalQuestion[] | null>(null);

  const fromServer = useCallback(
    (server: Awaited<ReturnType<typeof getSectionQuestions>>): LocalQuestion[] =>
      server.map((q) => ({
        key: newKey(),
        id: q.id,
        type: q.type,
        difficulty: q.difficulty,
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

  // ── Load (re-runs whenever the active section changes) ───────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const server = await getSectionQuestions(sectionId);
        if (cancelled) return;
        setQuestions(fromServer(server));
        onQuestionCountChange?.(sectionId, server.length);
      } catch (e) {
        console.warn("Failed to load section questions", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sectionId, fromServer, onQuestionCountChange]);

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
      await saveSectionQuestions(sectionId, toRequest(pending));
      setSaveState("saved");
    } catch (e) {
      console.warn("Question save failed", e);
      setSaveState("error");
    }
  }, [sectionId]);

  const scheduleSave = useCallback(
    (next: LocalQuestion[]) => {
      pendingRef.current = next;
      setSaveState("saving");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(flushSave, SAVE_DEBOUNCE_MS);
    },
    [flushSave]
  );

  // Flush any pending edit when unmounting (e.g. switching to another section).
  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      const pending = pendingRef.current;
      if (pending) {
        pendingRef.current = null;
        saveSectionQuestions(sectionId, toRequest(pending)).catch(() => {});
      }
    };
  }, [sectionId]);

  /** Apply a change and schedule a save. */
  const commit = useCallback(
    (next: LocalQuestion[]) => {
      setQuestions(next);
      scheduleSave(next);
      onQuestionCountChange?.(sectionId, next.length);
    },
    [scheduleSave, onQuestionCountChange, sectionId]
  );

  const mapQuestion = useCallback(
    (qKey: string, fn: (q: LocalQuestion) => LocalQuestion) => {
      commit(questions.map((q) => (q.key === qKey ? fn(q) : q)));
    },
    [questions, commit]
  );

  // ── Mutations ─────────────────────────────────────────────────────────────────
  const addQuestion = () => commit([...questions, newQuestion()]);

  const removeQuestion = (qKey: string) => commit(questions.filter((q) => q.key !== qKey));

  const setPrompt = (qKey: string, prompt: TiptapDocument) =>
    mapQuestion(qKey, (q) => ({ ...q, prompt }));

  const setDifficulty = (qKey: string, difficulty: Difficulty) =>
    mapQuestion(qKey, (q) => ({ ...q, difficulty }));

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
  const handleImported = useCallback(async () => {
    setLoading(true);
    try {
      const server = await getSectionQuestions(sectionId);
      setQuestions(fromServer(server));
      onQuestionCountChange?.(sectionId, server.length);
    } finally {
      setLoading(false);
    }
  }, [sectionId, fromServer, onQuestionCountChange]);

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
      <div className="mb-6 flex items-center justify-between gap-2 rounded-2xl border border-white/60 bg-white/60 px-5 py-4 shadow-sm backdrop-blur-xl">
        <div className="flex min-w-0 items-center gap-3">
          <h2 className="truncate text-lg font-bold tracking-tight text-[#14142b]">{sectionTitle}</h2>
          <span className="flex-shrink-0 rounded-full bg-[#14142b]/5 px-2.5 py-0.5 text-xs font-bold text-[#14142b]/70">
            {questions.length} {questions.length === 1 ? "question" : "questions"}
          </span>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <SaveIndicator state={saveState} />
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            title="Preview whole bank"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:text-[#14142b] hover:shadow"
          >
            <Eye size={14} />
            Preview
          </button>
          <button
            type="button"
            onClick={() => setImportOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200/60 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:border-slate-300 hover:text-[#14142b] hover:shadow"
          >
            <Upload size={14} />
            Import from JSON
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-8">
        {questions.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-14 text-center">
            <CircleCheck size={26} className="text-slate-300" />
            <p className="text-sm text-slate-400">
              No questions in this section yet. Add your first question below, or import a bank
              as JSON.
            </p>
          </div>
        )}

        {questions.map((q, qi) => (
          <div
            key={q.key}
            className="relative flex flex-col gap-4 rounded-[20px] bg-white p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-100 transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
          >
            <div className={`absolute bottom-6 left-0 top-6 w-[3px] rounded-r-full ${q.difficulty === 'EASY' ? 'bg-emerald-400' : q.difficulty === 'MEDIUM' ? 'bg-amber-400' : 'bg-rose-400'}`} />
            
            {/* Question header */}
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-[#14142b] text-xs font-bold text-white shadow-sm">
                {qi + 1}
              </span>
              <select
                value={q.type}
                onChange={(e) => setType(q.key, e.target.value as BankQuestionType)}
                className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none transition-colors hover:bg-slate-50 focus:border-slate-300 focus:bg-white focus:ring-1 focus:ring-slate-300"
              >
                {(Object.keys(TYPE_LABELS) as BankQuestionType[]).map((t) => (
                  <option key={t} value={t}>
                    {TYPE_LABELS[t]}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-1 rounded-xl border border-slate-200/60 bg-slate-50/50 p-1">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(q.key, d)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold capitalize transition-all ${
                      q.difficulty === d
                        ? `${DIFFICULTIES_BG[d]} shadow-sm`
                        : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    {d.toLowerCase()}
                  </button>
                ))}
              </div>

              <div className="ml-auto flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                  Points
                  <EditorNumberInput
                    value={q.points}
                    onChange={(val) => setPoints(q.key, val)}
                  />
                </label>
                <button
                  type="button"
                  title="Delete question"
                  onClick={() => removeQuestion(q.key)}
                  className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Prompt */}
            <QuestionPromptEditor
              value={q.prompt}
              onChange={(doc) => setPrompt(q.key, doc)}
              className="mb-3"
            />

            {q.type === "SENTENCE" ? (
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-400">
                  Model answer (shown to learners as a self-check reference)
                </label>
                <textarea
                  value={q.sampleAnswer}
                  onChange={(e) => setSampleAnswer(q.key, e.target.value)}
                  placeholder="Expected answer…"
                  rows={2}
                  className="w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-[#14142b] outline-none placeholder:text-slate-300 focus:ring-1 focus:ring-slate-300"
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
                          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center border-2 transition-all ${
                            single ? "rounded-full" : "rounded-md"
                          } ${
                            o.correct
                              ? "border-emerald-500 bg-emerald-500 text-white shadow-sm"
                              : "border-slate-300 bg-white text-transparent hover:border-emerald-400 hover:bg-emerald-50"
                          }`}
                        >
                          <Check size={13} strokeWidth={4} className={`transition-all duration-200 ${o.correct ? "opacity-100 scale-100" : "opacity-0 scale-50"}`} />
                        </button>
                        <input
                          type="text"
                          value={o.text}
                          readOnly={readOnlyText}
                          onChange={(e) => setOptionText(q.key, o.key, e.target.value)}
                          placeholder="Answer option"
                          className={`flex-1 rounded-xl border border-transparent bg-slate-50/50 px-4 py-2.5 text-sm font-medium text-[#14142b] outline-none placeholder:text-slate-400 transition-all focus:bg-white focus:shadow-sm focus:ring-1 focus:ring-slate-300 ${
                            readOnlyText ? "bg-slate-50 text-slate-500" : "hover:bg-slate-100/50"
                          }`}
                        />
                        {!readOnlyText && (
                          <button
                            type="button"
                            title="Remove option"
                            onClick={() => removeOption(q.key, o.key)}
                            className="rounded-md p-1.5 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500"
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
                    className="mt-3 flex items-center gap-1.5 rounded-xl border border-dashed border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-400 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-[#14142b]"
                  >
                    <Plus size={14} />
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
          className="flex w-full items-center justify-center gap-2 rounded-[20px] border-2 border-dashed border-slate-200/80 bg-slate-50/50 py-4 text-sm font-bold text-slate-400 transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-[#14142b]"
        >
          <Plus size={18} />
          Add question
        </button>
      </div>

      {importOpen && (
        <QuestionBankImportDialog
          sectionId={sectionId}
          hasExistingQuestions={questions.length > 0}
          onClose={() => setImportOpen(false)}
          onImported={() => {
            setImportOpen(false);
            handleImported();
          }}
        />
      )}

      {previewOpen && <QuestionBankPreview bankId={bankId} onClose={() => setPreviewOpen(false)} />}
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
