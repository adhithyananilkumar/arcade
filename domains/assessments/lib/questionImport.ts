/**
 * Parses the question-import JSON format into Arcade's question shape.
 *
 * Pure: no I/O, no React. The exam editor's orchestrator turns the result into section creates
 * and section saves; the dialog uses it to validate and preview as the author types.
 *
 * The format is deliberately forgiving about spelling (case, common type aliases, options as
 * plain strings with a separate `answer`) because authors paste output from spreadsheets and AI
 * assistants — but every question still has to resolve to something the editor can open
 * unchanged: a known type, a non-empty prompt, and a valid set of correct options.
 */

import type { BankQuestionType, Difficulty } from "../types";
import type { TiptapDocument } from "@/shared/types/editor.types";

export const QUESTION_IMPORT_LIMIT = 500;

export interface ImportedQuestion {
  type: BankQuestionType;
  difficulty: Difficulty;
  prompt: TiptapDocument;
  /** Plain-text prompt, for previews. */
  promptText: string;
  points: number;
  options: { text: string; correct: boolean }[];
  sampleAnswer: string;
  tags: string[];
}

export interface ImportedSection {
  /** Null when the JSON had a bare `questions` list — the caller decides where those go. */
  title: string | null;
  questions: ImportedQuestion[];
}

export type QuestionImportResult =
  | { ok: true; sections: ImportedSection[]; questionCount: number }
  | { ok: false; errors: string[] };

export const QUESTION_IMPORT_EXAMPLE = `{
  "sections": [
    {
      "title": "Algebra",
      "questions": [
        {
          "type": "SINGLE",
          "difficulty": "EASY",
          "points": 1,
          "prompt": "What is 2 + 2?",
          "options": [
            { "text": "3", "correct": false },
            { "text": "4", "correct": true },
            { "text": "5", "correct": false }
          ],
          "tags": ["arithmetic"]
        },
        {
          "type": "MULTIPLE",
          "difficulty": "MEDIUM",
          "points": 2,
          "prompt": "Which of these are prime?",
          "options": ["2", "4", "5", "9"],
          "answer": ["2", "5"]
        }
      ]
    },
    {
      "title": "General",
      "questions": [
        {
          "type": "TRUE_FALSE",
          "difficulty": "EASY",
          "prompt": "The Earth orbits the Sun.",
          "answer": true
        },
        {
          "type": "SENTENCE",
          "difficulty": "HARD",
          "points": 5,
          "prompt": "Explain photosynthesis in one sentence.",
          "sampleAnswer": "Plants turn light, water and CO2 into glucose and oxygen."
        }
      ]
    }
  ]
}`;

export const QUESTION_IMPORT_AI_PROMPT = `Convert the questions in the attached document into JSON for the Arcade exam importer.
Output ONLY the raw JSON — no code fences, no commentary — in exactly this format:

${QUESTION_IMPORT_EXAMPLE}

Rules:
- Group questions into "sections" (use the document's own headings/chapters; one section is fine).
- "type": SINGLE (exactly one correct option), MULTIPLE (one or more correct options),
  TRUE_FALSE (use "answer": true or false), SENTENCE (free-text answer; give "sampleAnswer", no options).
- "difficulty": EASY, MEDIUM or HARD — your best judgement, MEDIUM if unclear.
- "points": a whole number, 1 if the source doesn't say.
- Options are either objects { "text", "correct" } or plain strings plus "answer" (the correct option text, or a list of them).
- "tags" is optional: short topic words.
- Keep the source's order. Don't invent questions.`;

const TYPE_ALIASES: Record<string, BankQuestionType> = {
  SINGLE: "SINGLE",
  SINGLE_ANSWER: "SINGLE",
  SINGLE_CHOICE: "SINGLE",
  MCQ: "SINGLE",
  RADIO: "SINGLE",
  MULTIPLE: "MULTIPLE",
  MULTIPLE_SELECT: "MULTIPLE",
  MULTIPLE_CHOICE: "MULTIPLE",
  MULTI: "MULTIPLE",
  CHECKBOX: "MULTIPLE",
  TRUE_FALSE: "TRUE_FALSE",
  TRUEFALSE: "TRUE_FALSE",
  TF: "TRUE_FALSE",
  BOOLEAN: "TRUE_FALSE",
  SENTENCE: "SENTENCE",
  SENTENCE_ANSWER: "SENTENCE",
  SHORT_ANSWER: "SENTENCE",
  SHORT: "SENTENCE",
  TEXT: "SENTENCE",
};

const DIFFICULTY_ALIASES: Record<string, Difficulty> = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  MODERATE: "MEDIUM",
  HARD: "HARD",
  DIFFICULT: "HARD",
};

const MAX_ERRORS = 20;

const normKey = (v: string) => v.trim().toUpperCase().replace(/[\s/-]+/g, "_");

function textToDoc(text: string): TiptapDocument {
  const paragraphs = text.split(/\r?\n/).map((line) => line.trim());
  return {
    type: "doc",
    content: paragraphs.map((line) =>
      line ? { type: "paragraph", content: [{ type: "text", text: line }] } : { type: "paragraph" }
    ),
  } as TiptapDocument;
}

function docToText(doc: unknown): string {
  const walk = (node: unknown): string => {
    if (!node || typeof node !== "object") return "";
    const n = node as { text?: unknown; content?: unknown };
    if (typeof n.text === "string") return n.text;
    return Array.isArray(n.content) ? n.content.map(walk).join(" ") : "";
  };
  return walk(doc).replace(/\s+/g, " ").trim();
}

function parseTags(raw: unknown): string[] | null {
  if (raw === undefined || raw === null) return [];
  const list = typeof raw === "string" ? raw.split(",") : Array.isArray(raw) ? raw : null;
  if (!list || list.some((t) => typeof t !== "string")) return null;
  return Array.from(new Set((list as string[]).map((t) => t.trim()).filter(Boolean))).slice(0, 25);
}

function parseQuestion(raw: unknown, where: string, errors: string[]): ImportedQuestion | null {
  const fail = (msg: string) => {
    errors.push(`${where}: ${msg}`);
    return null;
  };
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) return fail("must be an object.");
  const q = raw as Record<string, unknown>;

  // Type
  const type = typeof q.type === "string" ? TYPE_ALIASES[normKey(q.type)] : q.type === undefined ? "SINGLE" : undefined;
  if (!type) return fail(`"type" must be SINGLE, MULTIPLE, TRUE_FALSE or SENTENCE (got ${JSON.stringify(q.type)}).`);

  // Difficulty
  let difficulty: Difficulty = "MEDIUM";
  if (q.difficulty !== undefined && q.difficulty !== null && q.difficulty !== "") {
    const d = typeof q.difficulty === "string" ? DIFFICULTY_ALIASES[normKey(q.difficulty)] : undefined;
    if (!d) return fail(`"difficulty" must be EASY, MEDIUM or HARD (got ${JSON.stringify(q.difficulty)}).`);
    difficulty = d;
  }

  // Prompt — plain text, or an already-built Tiptap document.
  const rawPrompt = q.prompt ?? q.question ?? q.text;
  let prompt: TiptapDocument;
  let promptText: string;
  if (typeof rawPrompt === "string") {
    promptText = rawPrompt.replace(/\s+/g, " ").trim();
    prompt = textToDoc(rawPrompt.trim());
  } else if (rawPrompt && typeof rawPrompt === "object" && (rawPrompt as { type?: unknown }).type === "doc") {
    prompt = rawPrompt as TiptapDocument;
    promptText = docToText(rawPrompt);
  } else {
    return fail(`"prompt" is required.`);
  }
  if (!promptText) return fail(`"prompt" is empty.`);

  // Points
  let points = 1;
  if (q.points !== undefined && q.points !== null) {
    const p = typeof q.points === "string" ? Number(q.points) : q.points;
    if (typeof p !== "number" || !Number.isInteger(p) || p < 0 || p > 1000) {
      return fail(`"points" must be a whole number from 0 to 1000.`);
    }
    points = p;
  }

  const tags = parseTags(q.tags);
  if (!tags) return fail(`"tags" must be a list of strings.`);

  const base = { type, difficulty, prompt, promptText, points, tags };

  if (type === "SENTENCE") {
    const sample = q.sampleAnswer ?? q.answer;
    if (sample !== undefined && typeof sample !== "string") return fail(`"sampleAnswer" must be text.`);
    return { ...base, options: [], sampleAnswer: (sample ?? "").trim() };
  }

  if (type === "TRUE_FALSE" && q.options === undefined) {
    const a = typeof q.answer === "string" ? q.answer.trim().toLowerCase() : q.answer;
    const value = a === true || a === "true" ? true : a === false || a === "false" ? false : null;
    if (value === null) return fail(`TRUE_FALSE needs "answer": true or false.`);
    return {
      ...base,
      options: [
        { text: "True", correct: value },
        { text: "False", correct: !value },
      ],
      sampleAnswer: "",
    };
  }

  // Options — objects with `correct`, or strings marked by `answer`.
  if (!Array.isArray(q.options) || q.options.length < 2) return fail(`"options" needs at least two entries.`);
  const answers =
    q.answer === undefined
      ? null
      : (Array.isArray(q.answer) ? q.answer : [q.answer]).map((a) => String(a).trim().toLowerCase());

  const options: { text: string; correct: boolean }[] = [];
  for (const [i, o] of q.options.entries()) {
    if (typeof o === "string" || typeof o === "number") {
      const text = String(o).trim();
      options.push({ text, correct: answers?.includes(text.toLowerCase()) ?? false });
    } else if (o && typeof o === "object" && typeof (o as { text?: unknown }).text === "string") {
      const opt = o as { text: string; correct?: unknown };
      const text = opt.text.trim();
      const correct = opt.correct === true || opt.correct === "true" || (answers?.includes(text.toLowerCase()) ?? false);
      options.push({ text, correct });
    } else {
      return fail(`option ${i + 1} must be text or { "text", "correct" }.`);
    }
    if (!options[options.length - 1].text) return fail(`option ${i + 1} is empty.`);
  }

  const correctCount = options.filter((o) => o.correct).length;
  if (answers && correctCount < answers.length) {
    return fail(`"answer" names an option that isn't in "options".`);
  }
  if (correctCount === 0) return fail(`mark at least one option correct.`);
  if ((type === "SINGLE" || type === "TRUE_FALSE") && correctCount !== 1) {
    return fail(`${type} questions need exactly one correct option (found ${correctCount}).`);
  }
  if (type === "TRUE_FALSE" && options.length !== 2) return fail(`TRUE_FALSE questions have exactly two options.`);

  return { ...base, options, sampleAnswer: "" };
}

/**
 * Accepts `{ "sections": [{ "title", "questions": [...] }] }`, `{ "questions": [...] }`, or a bare
 * array of questions. Reports every problem found (up to a cap), each with its location, rather
 * than stopping at the first one.
 */
export function parseQuestionImport(input: string): QuestionImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(input);
  } catch (e) {
    return { ok: false, errors: [`Not valid JSON — ${e instanceof Error ? e.message : "check commas and brackets"}.`] };
  }

  let rawSections: { title: unknown; questions: unknown }[];
  if (Array.isArray(raw)) {
    rawSections = [{ title: null, questions: raw }];
  } else if (raw && typeof raw === "object" && Array.isArray((raw as { sections?: unknown }).sections)) {
    rawSections = (raw as { sections: unknown[] }).sections.map((s) =>
      s && typeof s === "object"
        ? { title: (s as { title?: unknown }).title ?? null, questions: (s as { questions?: unknown }).questions }
        : { title: null, questions: undefined }
    );
  } else if (raw && typeof raw === "object" && Array.isArray((raw as { questions?: unknown }).questions)) {
    rawSections = [{ title: null, questions: (raw as { questions: unknown[] }).questions }];
  } else {
    return { ok: false, errors: [`Expected an object with a "sections" list (see the format).`] };
  }

  const errors: string[] = [];
  const sections: ImportedSection[] = [];
  let questionCount = 0;

  rawSections.forEach((s, si) => {
    const sectionLabel = typeof s.title === "string" && s.title.trim() ? `"${s.title.trim()}"` : `Section ${si + 1}`;
    if (s.title !== null && typeof s.title !== "string") {
      errors.push(`${sectionLabel}: "title" must be text.`);
      return;
    }
    if (!Array.isArray(s.questions)) {
      errors.push(`${sectionLabel}: "questions" must be a list.`);
      return;
    }
    const questions: ImportedQuestion[] = [];
    s.questions.forEach((q, qi) => {
      const parsed = parseQuestion(q, `${sectionLabel} › Question ${qi + 1}`, errors);
      if (parsed) questions.push(parsed);
    });
    questionCount += s.questions.length;
    const title = typeof s.title === "string" && s.title.trim() ? s.title.trim().slice(0, 200) : null;
    sections.push({ title, questions });
  });

  if (questionCount === 0 && errors.length === 0) errors.push("There are no questions to import.");
  if (questionCount > QUESTION_IMPORT_LIMIT) {
    errors.push(`At most ${QUESTION_IMPORT_LIMIT} questions per import (found ${questionCount}). Split it into batches.`);
  }
  if (errors.length > 0) {
    const shown = errors.slice(0, MAX_ERRORS);
    if (errors.length > MAX_ERRORS) shown.push(`…and ${errors.length - MAX_ERRORS} more.`);
    return { ok: false, errors: shown };
  }

  // Two entries with the same title land in the same section.
  const merged: ImportedSection[] = [];
  for (const s of sections) {
    const existing = merged.find(
      (m) => (m.title ?? "").toLowerCase() === (s.title ?? "").toLowerCase() && (m.title === null) === (s.title === null)
    );
    if (existing) existing.questions.push(...s.questions);
    else merged.push({ title: s.title, questions: [...s.questions] });
  }

  return { ok: true, sections: merged.filter((s) => s.questions.length > 0), questionCount };
}
