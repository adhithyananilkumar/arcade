// features/assessment/components/QuestionBankImportDialog.tsx
"use client";

import { useCallback, useRef, useState } from "react";
import { Check, Copy, Loader2, UploadCloud, X } from "lucide-react";
import { getBankQuestions, saveBankQuestions } from "../api";
import type {
  BankQuestionRequest,
  QuestionBankQuestionsRequest,
  BankQuestionType,
} from "../types";

const VALID_TYPES: BankQuestionType[] = ["SINGLE", "MULTIPLE", "TRUE_FALSE", "SENTENCE"];

const AI_PROMPT = `You are converting a question bank document into a strict JSON format for an import tool.

Read the attached document and extract every question. Output ONLY raw JSON — no markdown code fences, no commentary, no explanation before or after — matching exactly this schema:

{
  "questions": [
    {
      "type": "SINGLE" | "MULTIPLE" | "TRUE_FALSE" | "SENTENCE",
      "prompt": "the question text",
      "points": 1,
      "options": [
        { "text": "option text", "correct": true }
      ],
      "sampleAnswer": "model answer text"
    }
  ]
}

Rules:
- "type": "SINGLE" = exactly one correct option (radio button). "MULTIPLE" = one or more correct options (checkboxes). "TRUE_FALSE" = exactly two options, "True" and "False", exactly one marked correct. "SENTENCE" = a free-text short-answer question with no options.
- For SINGLE, MULTIPLE, and TRUE_FALSE questions: include "options" (omit "sampleAnswer" or set it to an empty string).
- For SENTENCE questions: omit "options" (or set it to an empty array) and include "sampleAnswer" with the expected answer.
- "points" is a positive integer; default to 1 if the source doesn't specify a point value.
- Preserve the original order of questions.
- Do not invent questions that aren't in the source document.
- Output must be valid JSON that can be parsed directly — nothing else in the response.`;

interface ParsedQuestion {
  type: BankQuestionType;
  prompt: string;
  points: number;
  options: { text: string; correct: boolean }[];
  sampleAnswer: string;
}

function validate(raw: unknown): { questions: ParsedQuestion[] } | { error: string } {
  if (typeof raw !== "object" || raw === null || !("questions" in raw)) {
    return { error: 'Root object must have a "questions" array.' };
  }
  const questions = (raw as { questions: unknown }).questions;
  if (!Array.isArray(questions)) {
    return { error: '"questions" must be an array.' };
  }
  if (questions.length === 0) {
    return { error: '"questions" array is empty — nothing to import.' };
  }

  const parsed: ParsedQuestion[] = [];
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const idx = i + 1;
    if (typeof q !== "object" || q === null) {
      return { error: `Question ${idx} is not an object.` };
    }
    const { type, prompt, points, options, sampleAnswer } = q as Record<string, unknown>;

    if (typeof type !== "string" || !VALID_TYPES.includes(type as BankQuestionType)) {
      return {
        error: `Question ${idx}: "type" must be one of ${VALID_TYPES.join(", ")}.`,
      };
    }
    if (typeof prompt !== "string" || prompt.trim() === "") {
      return { error: `Question ${idx}: "prompt" must be a non-empty string.` };
    }
    if (points !== undefined && (typeof points !== "number" || !Number.isFinite(points))) {
      return { error: `Question ${idx}: "points" must be a number.` };
    }

    const t = type as BankQuestionType;
    if (t === "SENTENCE") {
      if (typeof sampleAnswer !== "string" || sampleAnswer.trim() === "") {
        return { error: `Question ${idx}: SENTENCE questions require a non-empty "sampleAnswer".` };
      }
      parsed.push({ type: t, prompt, points: points ?? 1, options: [], sampleAnswer });
      continue;
    }

    if (!Array.isArray(options) || options.length === 0) {
      return { error: `Question ${idx}: "options" must be a non-empty array for type ${t}.` };
    }
    const parsedOptions: { text: string; correct: boolean }[] = [];
    for (const o of options) {
      if (typeof o !== "object" || o === null) {
        return { error: `Question ${idx}: each option must be an object.` };
      }
      const { text, correct } = o as Record<string, unknown>;
      if (typeof text !== "string" || text.trim() === "") {
        return { error: `Question ${idx}: option "text" must be a non-empty string.` };
      }
      if (typeof correct !== "boolean") {
        return { error: `Question ${idx}: option "correct" must be true or false.` };
      }
      parsedOptions.push({ text, correct });
    }
    const correctCount = parsedOptions.filter((o) => o.correct).length;
    if (correctCount === 0) {
      return { error: `Question ${idx}: at least one option must be marked correct.` };
    }
    if (t === "SINGLE" && correctCount !== 1) {
      return { error: `Question ${idx}: SINGLE questions must have exactly one correct option.` };
    }
    if (t === "TRUE_FALSE" && parsedOptions.length !== 2) {
      return { error: `Question ${idx}: TRUE_FALSE questions must have exactly two options.` };
    }

    parsed.push({ type: t, prompt, points: points ?? 1, options: parsedOptions, sampleAnswer: "" });
  }

  return { questions: parsed };
}

interface QuestionBankImportDialogProps {
  bankId: string;
  hasExistingQuestions: boolean;
  onClose: () => void;
  onImported: () => void;
}

export function QuestionBankImportDialog({
  bankId,
  hasExistingQuestions,
  onClose,
  onImported,
}: QuestionBankImportDialogProps) {
  const [copied, setCopied] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [mode, setMode] = useState<"replace" | "append">(
    hasExistingQuestions ? "append" : "replace"
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const copyPrompt = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(AI_PROMPT);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Couldn't copy to clipboard — select and copy the prompt manually.");
    }
  }, []);

  const readFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => setJsonText(String(reader.result ?? ""));
    reader.onerror = () => setError("Couldn't read that file.");
    reader.readAsText(file);
  }, []);

  const handleImport = useCallback(async () => {
    setError(null);
    let raw: unknown;
    try {
      raw = JSON.parse(jsonText);
    } catch {
      setError("That isn't valid JSON. Check for stray text or missing commas/brackets.");
      return;
    }

    const result = validate(raw);
    if ("error" in result) {
      setError(result.error);
      return;
    }

    setSaving(true);
    try {
      const imported: BankQuestionRequest[] = result.questions;
      let finalQuestions: BankQuestionRequest[] = imported;
      if (mode === "append") {
        const existing = await getBankQuestions(bankId);
        finalQuestions = [
          ...existing.map((q) => ({
            type: q.type,
            prompt: q.prompt,
            points: q.points,
            options: q.options.map((o) => ({ text: o.text, correct: o.correct })),
            sampleAnswer: q.sampleAnswer,
          })),
          ...imported,
        ];
      }
      const payload: QuestionBankQuestionsRequest = { questions: finalQuestions };
      await saveBankQuestions(bankId, payload);
      onImported();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed.");
    } finally {
      setSaving(false);
    }
  }, [jsonText, mode, bankId, onImported]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mx-4 flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl bg-white p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>

        <h3 className="mb-1 text-lg font-semibold text-gray-900">Import question bank from JSON</h3>
        <p className="mb-4 text-sm text-gray-500">
          Have a question bank in a PDF, Word doc, or spreadsheet? Convert it with an AI assistant
          first, then paste the result below.
        </p>

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto pr-1">
          {/* Step 1 */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Step 1 — Convert your document
              </p>
              <button
                type="button"
                onClick={copyPrompt}
                className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-600 hover:border-indigo-300 hover:text-indigo-600"
              >
                {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                {copied ? "Copied" : "Copy prompt"}
              </button>
            </div>
            <p className="mb-2 text-xs text-gray-500">
              Copy this prompt and paste it into ChatGPT (or another AI assistant), along with your
              question bank document attached or pasted in. Copy the JSON it returns and paste it
              into Step 2 below.
            </p>
            <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 p-3 text-xs leading-relaxed text-gray-600">
              {AI_PROMPT}
            </pre>
          </div>

          {/* Step 2 */}
          <div>
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Step 2 — Paste or drop the JSON
            </p>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files?.[0];
                if (file) readFile(file);
              }}
              className={`mb-2 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-3 text-xs text-gray-400 transition-colors ${
                dragOver ? "border-indigo-400 bg-indigo-50" : "border-gray-200"
              }`}
            >
              <UploadCloud size={14} />
              Drop a .json file here, or{" "}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="font-medium text-indigo-600 hover:underline"
              >
                choose a file
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) readFile(file);
                  e.target.value = "";
                }}
              />
            </div>
            <textarea
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder='{"questions": [...]}'
              rows={8}
              className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 font-mono text-xs text-gray-800 outline-none placeholder:text-gray-300 focus:ring-1 focus:ring-indigo-200"
            />
          </div>

          {hasExistingQuestions && (
            <div className="flex items-center gap-4 text-xs text-gray-600">
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  checked={mode === "append"}
                  onChange={() => setMode("append")}
                />
                Add to existing questions
              </label>
              <label className="flex items-center gap-1.5">
                <input
                  type="radio"
                  checked={mode === "replace"}
                  onChange={() => setMode("replace")}
                />
                Replace existing questions
              </label>
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
              {error}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!jsonText.trim() || saving}
            onClick={handleImport}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
