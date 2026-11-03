'use client';

import { useRef, useState } from 'react';
import { ExternalLink, FileText, Lock, Paperclip, Upload, X } from 'lucide-react';
import type { SubmissionAnswer, SubmissionField, UploadedFile } from '../../types/competition.types';

/** Uploads one file for a FILE question; resolves with what to store in the answer. */
export type SubmissionFileUploader = (fieldId: string, file: File, onProgress: (percent: number) => void) => Promise<UploadedFile>;

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * The organiser-built submission form, as pure UI: inputs for the team, and a read-only view of
 * the answers for judges, organisers and the gallery. Validation is the backend's
 * (`SubmissionAnswers`); these only render and collect.
 */

const input =
  'w-full rounded-2xl border border-slate-200/90 bg-surface px-4 py-3 text-sm text-slate-800 placeholder-slate-400 shadow-2xs transition focus:border-[#205ca8] focus:outline-none focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60';

export const FIELD_TYPE_LABEL: Record<SubmissionField['type'], string> = {
  SHORT_TEXT: 'Short answer',
  LONG_TEXT: 'Paragraph',
  URL: 'Link',
  NUMBER: 'Number',
  EMAIL: 'Email',
  SELECT: 'Single choice',
  MULTI_SELECT: 'Multiple choice',
  CHECKBOX: 'Checkbox',
  FILE: 'File upload',
};

export function SubmissionFormFields({
  fields,
  answers,
  onChange,
  disabled,
  onUpload,
}: {
  fields: SubmissionField[];
  answers: Record<string, SubmissionAnswer>;
  onChange: (fieldId: string, value: SubmissionAnswer | null) => void;
  disabled?: boolean;
  /** Needed for FILE questions; without it they render as a description (e.g. the organiser preview). */
  onUpload?: SubmissionFileUploader;
}) {
  return (
    <div className="flex flex-col gap-5">
      {fields.map((f) => (
        <div key={f.id} className="flex flex-col gap-1.5">
          {f.type !== 'CHECKBOX' && (
            <label htmlFor={`f-${f.id}`} className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {f.label} {f.required && <span className="text-rose-500">*</span>}
              {f.privateToOrganisers && (
                <span className="inline-flex items-center gap-1 normal-case tracking-normal text-slate-400" title="Only organisers see this — not judges">
                  <Lock size={11} /> organisers only
                </span>
              )}
            </label>
          )}
          {f.type === 'FILE' ? (
            <FileInput field={f} value={answers[f.id]} onChange={(v) => onChange(f.id, v)} disabled={disabled} onUpload={onUpload} />
          ) : (
            <FieldInput field={f} value={answers[f.id]} onChange={(v) => onChange(f.id, v)} disabled={disabled} />
          )}
          {f.helpText && f.type !== 'CHECKBOX' && <p className="text-[11px] text-slate-500">{f.helpText}</p>}
        </div>
      ))}
    </div>
  );
}

function FieldInput({
  field: f,
  value,
  onChange,
  disabled,
}: {
  field: SubmissionField;
  value: SubmissionAnswer | undefined;
  onChange: (v: SubmissionAnswer | null) => void;
  disabled?: boolean;
}) {
  const id = `f-${f.id}`;
  const text = value == null || typeof value === 'boolean' || Array.isArray(value) ? '' : String(value);
  switch (f.type) {
    case 'LONG_TEXT':
      return <textarea id={id} rows={5} value={text} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={`${input} resize-y`} />;
    case 'URL':
      return <input id={id} type="url" value={text} onChange={(e) => onChange(e.target.value)} disabled={disabled} placeholder="https://…" className={input} />;
    case 'EMAIL':
      return <input id={id} type="email" value={text} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={input} />;
    case 'NUMBER':
      return <input id={id} type="number" value={text} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={input} />;
    case 'SELECT':
      return (
        <div role="radiogroup" className="flex flex-wrap gap-2">
          {f.options.map((o) => (
            <button
              key={o}
              type="button"
              role="radio"
              aria-checked={value === o}
              disabled={disabled}
              onClick={() => onChange(value === o ? null : o)}
              className={`cursor-pointer rounded-full border px-4 py-2 text-xs font-bold transition disabled:cursor-not-allowed ${
                value === o ? 'border-[#205ca8] bg-blue-50 text-[#205ca8] dark:bg-blue-500/10 dark:text-blue-300' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {o}
            </button>
          ))}
        </div>
      );
    case 'MULTI_SELECT': {
      const picked = Array.isArray(value) ? (value as unknown[]).filter((x): x is string => typeof x === 'string') : [];
      return (
        <div className="flex flex-wrap gap-2">
          {f.options.map((o) => {
            const on = picked.includes(o);
            return (
              <button
                key={o}
                type="button"
                aria-pressed={on}
                disabled={disabled}
                onClick={() => onChange(on ? picked.filter((x) => x !== o) : [...picked, o])}
                className={`cursor-pointer rounded-full border px-4 py-2 text-xs font-bold transition disabled:cursor-not-allowed ${
                  on ? 'border-[#205ca8] bg-blue-50 text-[#205ca8] dark:bg-blue-500/10 dark:text-blue-300' : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {o}
              </button>
            );
          })}
        </div>
      );
    }
    case 'CHECKBOX':
      return (
        <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl border border-slate-200/90 px-4 py-3 text-sm text-slate-700">
          <input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} disabled={disabled} className="mt-0.5 size-4 accent-[#205ca8]" />
          <span>
            <span className="font-semibold">{f.label}</span> {f.required && <span className="text-rose-500">*</span>}
            {f.helpText && <span className="mt-0.5 block text-[11px] text-slate-500">{f.helpText}</span>}
          </span>
        </label>
      );
    default:
      return <input id={id} value={text} onChange={(e) => onChange(e.target.value)} disabled={disabled} className={input} />;
  }
}

function FileInput({
  field: f,
  value,
  onChange,
  disabled,
  onUpload,
}: {
  field: SubmissionField;
  value: SubmissionAnswer | undefined;
  onChange: (v: SubmissionAnswer | null) => void;
  disabled?: boolean;
  onUpload?: SubmissionFileUploader;
}) {
  const files = (Array.isArray(value) ? value : []).filter(
    (x): x is UploadedFile => typeof x === 'object' && x !== null && 'key' in x,
  );
  const maxFiles = f.maxFiles ?? 1;
  const maxMb = f.maxFileMb ?? 10;
  const formats = f.allowedFormats ?? [];
  const limits = `${formats.length ? formats.join(', ').toUpperCase() : 'Any format'} · up to ${maxMb} MB each`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ name: string; pct: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canAdd = !disabled && !!onUpload && files.length < maxFiles && !progress;

  const pick = async (list: FileList | null) => {
    if (!list?.length || !onUpload) return;
    setError(null);
    let next = [...files];
    for (const file of Array.from(list).slice(0, maxFiles - next.length)) {
      const ext = file.name.includes('.') ? file.name.split('.').pop()!.toLowerCase() : '';
      // A quick hint before uploading; the server enforces the same limits.
      if (formats.length && !formats.includes(ext)) {
        setError(`${file.name}: only ${formats.join(', ').toUpperCase()} files are accepted.`);
        continue;
      }
      if (file.size > maxMb * 1024 * 1024) {
        setError(`${file.name} is over the ${maxMb} MB limit.`);
        continue;
      }
      setProgress({ name: file.name, pct: 0 });
      try {
        const uploaded = await onUpload(f.id, file, (pct) => setProgress({ name: file.name, pct }));
        next = [...next, uploaded];
        onChange(next);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Upload failed.');
      } finally {
        setProgress(null);
      }
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      {files.map((file) => (
        <div key={file.key} className="flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-surface px-4 py-2.5">
          <FileText size={16} className="shrink-0 text-[#205ca8] dark:text-blue-400" />
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">{file.name}</span>
          <span className="shrink-0 text-[11px] text-slate-400">{formatBytes(file.size)}</span>
          {!disabled && (
            <button
              type="button"
              aria-label={`Remove ${file.name}`}
              onClick={() => onChange(files.filter((x) => x.key !== file.key))}
              className="cursor-pointer rounded-full p-1 text-slate-400 hover:text-rose-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      ))}
      {progress && (
        <div className="rounded-2xl border border-slate-200/90 bg-surface px-4 py-2.5">
          <div className="flex justify-between text-xs font-semibold text-slate-600">
            <span className="truncate">{progress.name}</span>
            <span>{progress.pct}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-[#205ca8] transition-all" style={{ width: `${progress.pct}%` }} />
          </div>
        </div>
      )}
      {canAdd && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void pick(e.dataTransfer.files);
          }}
          className="flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-slate-200 px-4 py-5 text-center transition hover:border-[#205ca8] hover:bg-blue-50/40 dark:hover:bg-blue-500/5"
        >
          <Upload size={18} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Drop a file or click to upload</span>
          <span className="text-[11px] text-slate-400">
            {limits}
            {maxFiles > 1 ? ` · ${maxFiles - files.length} more allowed` : ''}
          </span>
        </button>
      )}
      {!onUpload && files.length === 0 && (
        <p className="flex items-center gap-1.5 rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-xs text-slate-400">
          <Paperclip size={13} /> {limits} · {maxFiles} file{maxFiles > 1 ? 's' : ''}
        </p>
      )}
      <input
        ref={inputRef}
        type="file"
        hidden
        multiple={maxFiles - files.length > 1}
        accept={formats.length ? formats.map((x) => `.${x}`).join(',') : undefined}
        onChange={(e) => void pick(e.target.files)}
      />
      {error && <p className="text-xs font-semibold text-rose-600">{error}</p>}
    </div>
  );
}

/** Read-only answers, in form order. Unanswered optional questions are skipped. */
export function SubmissionAnswersView({
  fields,
  answers,
  compact = false,
}: {
  fields: SubmissionField[];
  answers: Record<string, SubmissionAnswer>;
  compact?: boolean;
}) {
  const shown = fields.filter((f) => answers[f.id] != null && answers[f.id] !== '');
  if (shown.length === 0) return <p className="text-xs text-slate-400">No answers yet.</p>;
  return (
    <dl className={`flex flex-col ${compact ? 'gap-3' : 'gap-5'}`}>
      {shown.map((f) => (
        <div key={f.id}>
          <dt className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {f.label}
            {f.privateToOrganisers && <Lock size={11} aria-label="Organisers only" />}
          </dt>
          <dd className="mt-1">
            <AnswerValue field={f} value={answers[f.id]} />
          </dd>
        </div>
      ))}
    </dl>
  );
}

function AnswerValue({ field, value }: { field: SubmissionField; value: SubmissionAnswer }) {
  if (field.type === 'FILE' && Array.isArray(value)) {
    return (
      <div className="flex flex-col gap-1.5">
        {(value as UploadedFile[]).map((file) => (
          <a
            key={file.key}
            href={file.url ?? undefined}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex max-w-full items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-[#205ca8] hover:bg-blue-50/50 dark:text-blue-400 dark:hover:bg-blue-500/10"
          >
            <FileText size={14} className="shrink-0" />
            <span className="truncate">{file.name}</span>
            <span className="shrink-0 text-[11px] font-medium text-slate-400">{formatBytes(file.size)}</span>
          </a>
        ))}
      </div>
    );
  }
  if (field.type === 'URL' && typeof value === 'string') {
    return (
      <a href={value} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-1.5 break-all text-sm font-semibold text-[#205ca8] hover:underline dark:text-blue-400">
        <ExternalLink size={13} className="shrink-0" /> {value}
      </a>
    );
  }
  if (Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {(value as string[]).map((v) => (
          <span key={v} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
            {v}
          </span>
        ))}
      </div>
    );
  }
  if (typeof value === 'boolean') return <p className="text-sm text-slate-700">{value ? 'Yes' : 'No'}</p>;
  return <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{String(value)}</p>;
}
