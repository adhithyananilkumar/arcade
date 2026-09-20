"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
} from "lucide-react";
import { ArcadeEditor, type ArcadeEditorHandle } from "@/apps/creator/editor";
import { useStudioConfirm } from "@/apps/creator/studio/core/useStudioConfirm";
import {
  QuestionTagEditor,
  DIFFICULTIES,
  DIFFICULTIES_BG,
  TYPE_LABELS,
  type BankQuestionType,
  type Difficulty,
  type LocalQuestion,
  type SectionQuestionsController,
} from "@/domains/assessments";
import type { TiptapDocument } from "@/shared/types/editor.types";

/**
 * One question, open for editing.
 *
 * <p>The prompt is written in <b>ArcadeEditor</b> — the same editor a course lesson is written in,
 * with the same floating toolbar portalled to the top of the screen. There is no second rich-text
 * editor in Arcade: the question bank used to ship its own Tiptap instance and its own cut-down
 * toolbar, so the two drifted in capability, styling and keyboard behaviour. Questions now get the
 * full writing surface, and a fix to the editor is a fix everywhere.
 *
 * <p>The editor's own 2s-idle save is the change signal: it hands back the document, which is fed
 * into the question engine, which runs its own debounced save of the whole section. Switching
 * questions flushes the editor first, so the last keystroke before a jump is never lost.
 */

const EMPTY_DOC: TiptapDocument = { type: "doc", content: [] };

export interface QuestionNavigation {
  index: number;
  total: number;
  onPrevious?: () => void;
  onNext?: () => void;
  /** Offered in place of "next" on the last question. */
  onAdd?: () => void;
  onBack: () => void;
}

export function QuestionEditorCard({
  question: q,
  actions,
  tagSuggestions = [],
  navigation,
  readOnly,
}: {
  question: LocalQuestion;
  actions: SectionQuestionsController;
  tagSuggestions?: string[];
  navigation: QuestionNavigation;
  readOnly?: boolean;
}) {
  const editorRef = useRef<ArcadeEditorHandle>(null);
  const { confirm, dialog: confirmDialog } = useStudioConfirm();

  // Flush the editor before leaving this question. Without it the last edit sits in the editor's
  // debounce and is discarded when the component unmounts on navigation.
  const leaveVia = useCallback(
    (go: (() => void) | undefined) => () => {
      if (!go) return;
      editorRef.current?.flush().finally(go);
    },
    []
  );

  useEffect(() => {
    const handle = editorRef.current;
    return () => {
      handle?.flush();
    };
  }, [q.key]);

  const isLast = navigation.index >= navigation.total - 1;

  return (
    <div className="flex flex-col gap-4">
      {/* ── Meta row ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/50 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-md">
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-[#14142b] text-xs font-bold text-white shadow-sm">
          {navigation.index + 1}
        </span>

        <select
          value={q.type}
          disabled={readOnly}
          onChange={(e) => actions.setType(q.key, e.target.value as BankQuestionType)}
          aria-label="Question type"
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#14142b] outline-none focus:border-indigo-300 disabled:bg-slate-50"
        >
          {(Object.keys(TYPE_LABELS) as BankQuestionType[]).map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1 rounded-lg bg-slate-100/70 p-0.5">
          {DIFFICULTIES.map((d: Difficulty) => (
            <button
              key={d}
              type="button"
              disabled={readOnly}
              onClick={() => actions.setDifficulty(q.key, d)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-bold capitalize transition-all ${
                q.difficulty === d ? `${DIFFICULTIES_BG[d]} shadow-sm` : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {d.toLowerCase()}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Points
            <PointsInput
              value={q.points}
              disabled={readOnly}
              onChange={(val) => actions.setPoints(q.key, val)}
            />
          </label>
          {!readOnly && (
            <button
              type="button"
              title="Delete question"
              onClick={() =>
                confirm({
                  title: "Delete question?",
                  message: "This question and its saved draft will be permanently deleted. This cannot be undone.",
                  confirmLabel: "Delete",
                  danger: true,
                  onConfirm: () => {
                    actions.removeQuestion(q.key);
                    navigation.onBack();
                  },
                })
              }
              className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-rose-50 hover:text-rose-600"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      {confirmDialog}

      {/* ── Prompt: the shared Arcade editor ──────────────────────────────── */}
      <div className="rounded-3xl border border-white/40 bg-white/30 p-4 shadow-lg backdrop-blur-xl sm:p-6">
        <ArcadeEditor
          // Keyed on the question so switching rebuilds the document rather than diffing one
          // question's content into another's.
          key={q.key}
          ref={editorRef}
          initialContent={q.prompt && q.prompt.content?.length ? q.prompt : EMPTY_DOC}
          placeholder="Write the question…"
          readOnly={readOnly}
          onSave={(doc) => actions.setPrompt(q.key, doc)}
          chromeless
          // A question prompt is a sentence or two, not a lesson's worth of prose — the editor's
          // 300px lesson-sized default was the biggest single contributor to this card's excessive
          // empty space.
          minHeight={120}
        />
      </div>

      {/* ── Answers ───────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/50 bg-white/70 p-5 shadow-sm backdrop-blur-md">
        {q.type === "SENTENCE" ? (
          <>
            <label
              htmlFor={`sample-${q.key}`}
              className="mb-2 block text-[11px] font-bold uppercase tracking-wider text-slate-400"
            >
              Model answer
            </label>
            <textarea
              id={`sample-${q.key}`}
              rows={3}
              value={q.sampleAnswer}
              disabled={readOnly}
              onChange={(e) => actions.setSampleAnswer(q.key, e.target.value)}
              placeholder="What a correct answer looks like…"
              className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-[#14142b] outline-none placeholder:text-slate-300 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
            />
          </>
        ) : (
          <>
            <span className="mb-3 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Answer options
            </span>
            <div className="flex flex-col gap-2">
              {q.options.map((o) => (
                <div key={o.key} className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={readOnly}
                    title={o.correct ? "Correct answer" : "Mark as correct"}
                    onClick={() => actions.toggleCorrect(q.key, o.key)}
                    className={`flex h-6 w-6 flex-shrink-0 items-center justify-center transition-all ${
                      q.type === "MULTIPLE" ? "rounded-md" : "rounded-full"
                    } ${
                      o.correct
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "border-2 border-slate-200 text-transparent hover:border-slate-300"
                    }`}
                  >
                    <Check size={13} strokeWidth={3} />
                  </button>
                  <input
                    value={o.text}
                    disabled={readOnly || q.type === "TRUE_FALSE"}
                    onChange={(e) => actions.setOptionText(q.key, o.key, e.target.value)}
                    placeholder="Answer option"
                    aria-label="Answer option"
                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-[#14142b] outline-none placeholder:text-slate-300 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
                  />
                  {!readOnly && q.type !== "TRUE_FALSE" && q.options.length > 2 && (
                    <button
                      type="button"
                      title="Remove option"
                      onClick={() => actions.removeOption(q.key, o.key)}
                      className="rounded-md p-1.5 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-500"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {!readOnly && q.type !== "TRUE_FALSE" && (
              <button
                type="button"
                onClick={() => actions.addOption(q.key)}
                className="mt-3 flex items-center gap-1.5 rounded-xl border border-dashed border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-400 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-[#14142b]"
              >
                <Plus size={14} />
                Add option
              </button>
            )}
          </>
        )}

        <div className="mt-5 border-t border-slate-100 pt-4">
          <QuestionTagEditor
            tags={q.tags}
            suggestions={tagSuggestions}
            disabled={readOnly}
            onChange={(tags) => actions.setTags(q.key, tags)}
          />
        </div>
      </div>

      {/* ── Move between questions ────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 pb-2">
        <button
          type="button"
          disabled={!navigation.onPrevious}
          onClick={leaveVia(navigation.onPrevious)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/50 bg-white/70 px-4 py-2 text-xs font-bold text-[#14142b] shadow-sm backdrop-blur-md transition-colors hover:bg-white disabled:opacity-40"
        >
          <ArrowLeft size={14} /> Previous
        </button>

        <span className="text-[11px] font-semibold text-[#14142b]/40">
          {navigation.index + 1} of {navigation.total}
        </span>

        {isLast ? (
          navigation.onAdd && !readOnly ? (
            <button
              type="button"
              onClick={leaveVia(navigation.onAdd)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#14142b] px-4 py-2 text-xs font-bold text-white shadow-sm transition-colors hover:bg-black"
            >
              <Plus size={14} /> Add question
            </button>
          ) : (
            <span className="w-[104px]" aria-hidden />
          )
        ) : (
          <button
            type="button"
            onClick={leaveVia(navigation.onNext)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/50 bg-white/70 px-4 py-2 text-xs font-bold text-[#14142b] shadow-sm backdrop-blur-md transition-colors hover:bg-white"
          >
            Next <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function PointsInput({
  value,
  disabled,
  onChange,
}: {
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <span className="relative flex items-center overflow-hidden rounded-lg border border-slate-200 bg-white transition-all focus-within:border-slate-400 focus-within:ring-1 focus-within:ring-slate-300">
      <input
        type="number"
        min={0}
        value={value}
        disabled={disabled}
        onChange={(e) => {
          const val = parseInt(e.target.value, 10);
          if (!Number.isNaN(val)) onChange(Math.max(0, val));
        }}
        aria-label="Points"
        className="w-12 appearance-none border-none bg-transparent px-2 py-1.5 text-center text-xs font-semibold text-[#14142b] outline-none [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <span className="flex flex-col border-l border-slate-200 bg-slate-50">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(value + 1)}
          aria-label="Increase points"
          className="flex h-[13.5px] w-[18px] items-center justify-center text-slate-400 transition-colors hover:bg-slate-200 hover:text-[#14142b]"
        >
          <ChevronUp size={10} strokeWidth={3} />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(Math.max(0, value - 1))}
          aria-label="Decrease points"
          className="flex h-[13.5px] w-[18px] items-center justify-center border-t border-slate-200 text-slate-400 transition-colors hover:bg-slate-200 hover:text-[#14142b]"
        >
          <ChevronDown size={10} strokeWidth={3} />
        </button>
      </span>
    </span>
  );
}
