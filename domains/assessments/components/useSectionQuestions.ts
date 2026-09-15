// domains/assessments/components/useSectionQuestions.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSectionQuestions, saveSectionQuestions } from "../api";
import type { BankQuestionType, Difficulty, QuestionBankQuestionsRequest } from "../types";
import type { TiptapDocument } from "@/shared/types/editor.types";

/**
 * The question-authoring engine for one question-bank section: load, debounced autosave, and every
 * mutation a question supports. Deliberately headless — the stacked editor (SectionQuestionsEditor)
 * and the exam editor's tree/canvas layout are two presentations of this one state machine, so
 * "editing a question" behaves identically wherever a creator does it.
 */

/** Debounce for autosaving question edits. */
const SAVE_DEBOUNCE_MS = 1200;

const EMPTY_DOC: TiptapDocument = { type: "doc", content: [] };

// ── Local model (client keys for stable React identity while editing) ──────────

export interface LocalOption {
  key: string;
  text: string;
  correct: boolean;
}

export interface LocalQuestion {
  key: string;
  /** Server id, if this question already exists — omitted for questions created client-side. */
  id?: string;
  type: BankQuestionType;
  difficulty: Difficulty;
  prompt: TiptapDocument;
  points: number;
  options: LocalOption[];
  sampleAnswer: string;
  /** Free-form topic tags. Dynamic pools and plan selection rules filter on these. */
  tags: string[];
}

export type SaveState = "idle" | "saving" | "saved" | "error";

export const TYPE_LABELS: Record<BankQuestionType, string> = {
  SINGLE: "Single answer",
  MULTIPLE: "Multiple select",
  TRUE_FALSE: "True / False",
  SENTENCE: "Sentence answer",
};

export const DIFFICULTIES: Difficulty[] = ["EASY", "MEDIUM", "HARD"];

export const DIFFICULTIES_BG: Record<Difficulty, string> = {
  EASY: "bg-emerald-50 text-emerald-700",
  MEDIUM: "bg-amber-50 text-amber-700",
  HARD: "bg-rose-50 text-rose-700",
};

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
    tags: [],
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
      tags: q.tags,
    })),
  };
}

/** Plain-text preview of a Tiptap prompt — used for tree rows and list labels. */
export function promptToPlainText(prompt: TiptapDocument | undefined): string {
  if (!prompt) return "";
  const walk = (node: unknown): string => {
    if (!node || typeof node !== "object") return "";
    const n = node as { text?: string; content?: unknown[] };
    if (typeof n.text === "string") return n.text;
    if (Array.isArray(n.content)) return n.content.map(walk).join(" ");
    return "";
  };
  return walk(prompt).replace(/\s+/g, " ").trim();
}

export interface SectionQuestionsController {
  questions: LocalQuestion[];
  loading: boolean;
  saveState: SaveState;
  addQuestion: () => LocalQuestion;
  removeQuestion: (qKey: string) => void;
  setPrompt: (qKey: string, prompt: TiptapDocument) => void;
  setDifficulty: (qKey: string, difficulty: Difficulty) => void;
  setPoints: (qKey: string, points: number) => void;
  setSampleAnswer: (qKey: string, sampleAnswer: string) => void;
  setTags: (qKey: string, tags: string[]) => void;
  setType: (qKey: string, type: BankQuestionType) => void;
  addOption: (qKey: string) => void;
  removeOption: (qKey: string, oKey: string) => void;
  setOptionText: (qKey: string, oKey: string, text: string) => void;
  toggleCorrect: (qKey: string, oKey: string) => void;
  /** Re-reads the section from the server (after an import, for example). */
  reload: () => Promise<void>;
}

const NO_QUESTIONS: LocalQuestion[] = [];

export function useSectionQuestions(
  sectionId: string,
  onQuestionCountChange?: (sectionId: string, count: number) => void
): SectionQuestionsController {
  const [loadedQuestions, setQuestions] = useState<LocalQuestion[]>([]);
  const [loadingState, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  // With no section selected (the exam editor mounts before one is picked) there is nothing to
  // load and nothing to show. Derived rather than written into state by an effect, so mounting
  // without a section doesn't trigger a render just to blank things out.
  const questions = sectionId ? loadedQuestions : NO_QUESTIONS;
  const loading = sectionId ? loadingState : false;

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
        options: q.options.map((o) => ({ key: newKey(), text: o.text, correct: o.correct })),
        sampleAnswer: q.sampleAnswer ?? "",
        tags: q.tags ?? [],
      })),
    []
  );

  // ── Load (re-runs whenever the active section changes) ───────────────────────
  useEffect(() => {
    if (!sectionId) return;
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

  const addQuestion = useCallback(() => {
    const created = newQuestion();
    commit([...questions, created]);
    return created;
  }, [questions, commit]);

  const removeQuestion = useCallback(
    (qKey: string) => commit(questions.filter((q) => q.key !== qKey)),
    [questions, commit]
  );

  const setPrompt = useCallback(
    (qKey: string, prompt: TiptapDocument) => mapQuestion(qKey, (q) => ({ ...q, prompt })),
    [mapQuestion]
  );

  const setDifficulty = useCallback(
    (qKey: string, difficulty: Difficulty) => mapQuestion(qKey, (q) => ({ ...q, difficulty })),
    [mapQuestion]
  );

  const setPoints = useCallback(
    (qKey: string, points: number) =>
      mapQuestion(qKey, (q) => ({
        ...q,
        points: Number.isFinite(points) ? Math.max(0, points) : 0,
      })),
    [mapQuestion]
  );

  const setSampleAnswer = useCallback(
    (qKey: string, sampleAnswer: string) => mapQuestion(qKey, (q) => ({ ...q, sampleAnswer })),
    [mapQuestion]
  );

  const setTags = useCallback(
    (qKey: string, tags: string[]) =>
      mapQuestion(qKey, (q) => ({
        // Trimmed and de-duplicated here rather than at the input, so every path that sets tags
        // (typing, pasting a comma-separated list) stores the same normalized shape.
        ...q,
        tags: Array.from(new Set(tags.map((t) => t.trim()).filter(Boolean))).slice(0, 25),
      })),
    [mapQuestion]
  );

  const setType = useCallback(
    (qKey: string, type: BankQuestionType) =>
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
      }),
    [mapQuestion]
  );

  const addOption = useCallback(
    (qKey: string) => mapQuestion(qKey, (q) => ({ ...q, options: [...q.options, blankOption()] })),
    [mapQuestion]
  );

  const removeOption = useCallback(
    (qKey: string, oKey: string) =>
      mapQuestion(qKey, (q) => {
        const options = q.options.filter((o) => o.key !== oKey);
        // SINGLE must always have one correct option.
        if (q.type === "SINGLE" && !options.some((o) => o.correct) && options.length) {
          options[0] = { ...options[0], correct: true };
        }
        return { ...q, options };
      }),
    [mapQuestion]
  );

  const setOptionText = useCallback(
    (qKey: string, oKey: string, text: string) =>
      mapQuestion(qKey, (q) => ({
        ...q,
        options: q.options.map((o) => (o.key === oKey ? { ...o, text } : o)),
      })),
    [mapQuestion]
  );

  const toggleCorrect = useCallback(
    (qKey: string, oKey: string) =>
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
      }),
    [mapQuestion]
  );

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      const server = await getSectionQuestions(sectionId);
      setQuestions(fromServer(server));
      onQuestionCountChange?.(sectionId, server.length);
    } finally {
      setLoading(false);
    }
  }, [sectionId, fromServer, onQuestionCountChange]);

  return {
    questions,
    loading,
    saveState,
    addQuestion,
    removeQuestion,
    setPrompt,
    setDifficulty,
    setPoints,
    setSampleAnswer,
    setTags,
    setType,
    addOption,
    removeOption,
    setOptionText,
    toggleCorrect,
    reload,
  };
}
