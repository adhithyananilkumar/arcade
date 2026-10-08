// domains/assessments/components/QuestionBankImportDialog.tsx
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Check, CheckCircle2, FileJson, Loader2, Sparkles, UploadCloud, X } from "lucide-react";
import {
  parseQuestionImport,
  QUESTION_IMPORT_AI_PROMPT,
  QUESTION_IMPORT_EXAMPLE,
  type ImportedSection,
} from "../lib/questionImport";
import { TYPE_LABELS } from "./useSectionQuestions";
import type { BankQuestionType } from "../types";

/**
 * Import questions from JSON into an exam's question bank — whole sections at once.
 *
 * Pure UI: it parses and previews, and hands the parsed sections to `onImport`. Creating
 * sections and saving questions is the orchestrator's job (the exam workspace).
 */
export interface QuestionBankImportDialogProps {
  /** Titles of the bank's existing sections — a matching title adds to that section. */
  existingSectionTitles: string[];
  /** Where questions without a section title go, e.g. `"Section 2"` or `"a new section"`. */
  untitledTargetLabel: string;
  onImport: (sections: ImportedSection[]) => Promise<void>;
  onClose: () => void;
}

export function QuestionBankImportDialog({
  existingSectionTitles,
  untitledTargetLabel,
  onImport,
  onClose,
}: QuestionBankImportDialogProps) {
  const [jsonText, setJsonText] = useState("");
  const [copied, setCopied] = useState<"format" | "prompt" | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const result = useMemo(() => (jsonText.trim() ? parseQuestionImport(jsonText) : null), [jsonText]);
  const existing = useMemo(
    () => new Set(existingSectionTitles.map((t) => t.trim().toLowerCase())),
    [existingSectionTitles]
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !saving) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, saving]);

  const copy = useCallback(async (what: "format" | "prompt") => {
    try {
      await navigator.clipboard.writeText(what === "format" ? QUESTION_IMPORT_EXAMPLE : QUESTION_IMPORT_AI_PROMPT);
      setCopied(what);
      setTimeout(() => setCopied(null), 1800);
    } catch {
      setSaveError("Couldn't copy to the clipboard — select the text and copy it manually.");
    }
  }, []);

  const readFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => setJsonText(String(reader.result ?? ""));
    reader.onerror = () => setSaveError("Couldn't read that file.");
    reader.readAsText(file);
  }, []);

  const handleImport = async () => {
    if (!result?.ok) return;
    setSaving(true);
    setSaveError(null);
    try {
      await onImport(result.sections);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Import failed.");
    } finally {
      setSaving(false);
    }
  };

  // Portalled to <body>: the Studio frame is `position: fixed`, which makes it a stacking context,
  // so a dialog rendered inside it could never rise above the editor's floating toolbar (itself
  // portalled to <body> at z-70), however high its own z-index.
  return createPortal(
    <div data-studio-overlay className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 arcade-modal-backdrop" onClick={() => !saving && onClose()} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="question-import-title"
        className="relative flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden arcade-modal-box rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200/70 px-6 py-5">
          <div>
            <h3 id="question-import-title" className="text-base font-semibold text-ink">
              Import questions
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Paste questions in Arcade&apos;s JSON format. Sections, types, difficulty, points and tags are
              converted into editable questions.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close"
            className="rounded-tl-lg rounded-br-lg rounded-tr-xs rounded-bl-xs p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-ink cursor-pointer dark:hover:bg-slate-800"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-6 md:grid-cols-2">
          {/* ── Left: the format ─────────────────────────── */}
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/50">1 · The format</p>
              <div className="flex gap-1.5">
                <CopyButton
                  icon={<FileJson size={12} />}
                  label="Copy format"
                  done={copied === "format"}
                  onClick={() => copy("format")}
                />
                <CopyButton
                  icon={<Sparkles size={12} />}
                  label="Copy AI prompt"
                  done={copied === "prompt"}
                  onClick={() => copy("prompt")}
                />
              </div>
            </div>
            <pre className="max-h-[42vh] min-h-0 overflow-auto rounded-2xl border border-ink/5 bg-ink/[0.03] p-4 font-mono text-[11px] leading-relaxed text-ink/70 arcade-scrollbar-mini">
              {QUESTION_IMPORT_EXAMPLE}
            </pre>
            <ul className="space-y-1 text-xs leading-relaxed text-ink/55">
              <li>
                <b className="text-ink/70">type</b> — SINGLE, MULTIPLE, TRUE_FALSE or SENTENCE
              </li>
              <li>
                <b className="text-ink/70">difficulty</b> — EASY, MEDIUM (default) or HARD ·{" "}
                <b className="text-ink/70">points</b> — whole number, default 1
              </li>
              <li>
                Options as <code>{"{ text, correct }"}</code>, or plain strings plus <code>answer</code>
              </li>
              <li>A section whose title matches an existing one is added to it; others are created.</li>
              <li>
                Have a PDF or Word file? Use <b className="text-ink/70">Copy AI prompt</b> with any AI assistant and
                paste its answer here.
              </li>
            </ul>
          </div>

          {/* ── Right: paste + preview ───────────────────── */}
          <div className="flex min-w-0 flex-col gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/50">2 · Paste your questions</p>
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
              className={`relative rounded-2xl border transition-colors ${
                dragOver ? "border-indigo-400 bg-indigo-50/60 dark:bg-indigo-500/10" : "border-ink/10"
              }`}
            >
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='{ "sections": [ … ] }'
                spellCheck={false}
                rows={11}
                className="block w-full resize-y rounded-2xl bg-transparent px-4 py-3 font-mono text-xs text-ink outline-none placeholder:text-ink/30"
              />
              <div className="flex items-center justify-between gap-2 border-t border-ink/5 px-3 py-2 text-[11px] text-ink/45">
                <span className="flex items-center gap-1.5">
                  <UploadCloud size={12} /> Drop a .json file, or
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    choose one
                  </button>
                </span>
                {jsonText && (
                  <button type="button" onClick={() => setJsonText("")} className="font-semibold hover:text-ink">
                    Clear
                  </button>
                )}
              </div>
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

            {result && !result.ok && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300">
                <p className="mb-1.5 flex items-center gap-1.5 font-semibold">
                  <AlertTriangle size={13} /> Fix these before importing
                </p>
                <ul className="space-y-0.5 pl-5 [list-style:disc]">
                  {result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {result?.ok && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 text-xs text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300">
                <p className="mb-2 flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 size={13} /> Ready: {result.questionCount} question{result.questionCount === 1 ? "" : "s"}
                </p>
                <ul className="space-y-1.5">
                  {result.sections.map((s, i) => {
                    const chip =
                      s.title === null ? null : existing.has(s.title.toLowerCase()) ? "adds to existing" : "new section";
                    return (
                      <li key={i} className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="font-semibold text-ink">{s.title ?? untitledTargetLabel}</span>
                        {chip && (
                          <span className="rounded-full bg-surface/80 px-2 py-0.5 text-[10px] font-semibold text-ink/55">
                            {chip}
                          </span>
                        )}
                        <span className="text-ink/55">{summarizeTypes(s)}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {saveError && (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300">
                {saveError}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200/70 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-ink cursor-pointer disabled:opacity-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!result?.ok || saving}
            onClick={handleImport}
            className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-on-ink shadow-sm transition-colors hover:bg-ink-hover disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {saving
              ? "Importing..."
              : result?.ok
                ? `Import ${result.questionCount} question${result.questionCount === 1 ? "" : "s"}`
                : "Import"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function summarizeTypes(section: ImportedSection): string {
  const counts = new Map<BankQuestionType, number>();
  for (const q of section.questions) counts.set(q.type, (counts.get(q.type) ?? 0) + 1);
  return Array.from(counts.entries())
    .map(([type, n]) => `${n} ${TYPE_LABELS[type].toLowerCase()}`)
    .join(" · ");
}

function CopyButton({
  icon,
  label,
  done,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full border border-ink/10 bg-surface px-3 py-1.5 text-[11px] font-semibold text-ink/70 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:hover:border-indigo-500/40 dark:hover:text-indigo-400"
    >
      {done ? <Check size={12} className="text-emerald-600 dark:text-emerald-400" /> : icon}
      {done ? "Copied" : label}
    </button>
  );
}
