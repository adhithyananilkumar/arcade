'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Profiles
 *
 * Purpose:
 * Filing a claim on a handle somebody else holds.
 *
 * Rules:
 * - Pure submission: the caller supplies `onSubmit`. Whether this is filed for
 *   a person or for a channel is the caller's decision, because only it knows
 *   which subject the form is open for.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { useState } from 'react';
import { AlertCircle, Gavel, X } from 'lucide-react';

export interface HandleAppealFormProps {
  /** The contested name, pre-filled and not editable — the appeal is about this one. */
  handle: string;
  /** Who currently holds it, when known. Shown so the claimant understands what they contest. */
  currentHolderName?: string | null;
  onSubmit: (input: { justification: string; evidenceUrl?: string }) => Promise<void>;
  onCancel: () => void;
}

const MAX_JUSTIFICATION = 4000;

export function HandleAppealForm({
  handle,
  currentHolderName,
  onSubmit,
  onCancel,
}: HandleAppealFormProps) {
  const [justification, setJustification] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tooLong = justification.length > MAX_JUSTIFICATION;
  const canSubmit = justification.trim().length >= 20 && !tooLong && !submitting;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        justification: justification.trim(),
        evidenceUrl: evidenceUrl.trim() || undefined,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not file that appeal.');
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-[20px] border border-slate-100 bg-white p-6 dark:border-neutral-900 dark:bg-black"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 dark:bg-amber-950/40">
            <Gavel size={16} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-[15px] font-extrabold tracking-tight text-slate-900 dark:text-white">
              Appeal for @{handle}
            </h3>
            <p className="mt-1 text-[12.5px] font-medium leading-relaxed text-slate-500 dark:text-neutral-400">
              {currentHolderName
                ? `This handle is currently held by ${currentHolderName}.`
                : 'This handle is reserved by Arcade.'}{' '}
              An Arcade administrator reviews every appeal. Filing one does not
              change anything on its own.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          aria-label="Cancel appeal"
          className="shrink-0 rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-slate-50 hover:text-slate-600 dark:text-neutral-600 dark:hover:bg-neutral-900 dark:hover:text-neutral-300"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-6 space-y-5">
        <div>
          <label
            htmlFor="appeal-justification"
            className="block text-[12.5px] font-extrabold tracking-tight text-slate-700 dark:text-neutral-200"
          >
            Why should this handle be yours?
          </label>
          <p className="mt-1 text-[12px] font-medium text-slate-400 dark:text-neutral-500">
            Name the registered entity, the trademark, or the prior use you are
            claiming. Specifics decide these; strength of feeling does not.
          </p>
          <textarea
            id="appeal-justification"
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            rows={5}
            className="mt-2.5 w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13.5px] font-medium leading-relaxed text-slate-900 outline-none transition-colors focus:border-slate-900 placeholder:text-slate-300 dark:border-neutral-800 dark:bg-black dark:text-white dark:focus:border-neutral-400 dark:placeholder:text-neutral-700"
            placeholder="We are Acme Institute of Technology, registered in 1998. Our registration certificate is linked below."
          />
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[11.5px] font-bold text-slate-400 dark:text-neutral-500">
              {justification.trim().length < 20
                ? 'At least 20 characters.'
                : ''}
            </span>
            <span
              className={`text-[11.5px] font-bold tabular-nums ${
                tooLong
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-slate-300 dark:text-neutral-600'
              }`}
            >
              {justification.length}/{MAX_JUSTIFICATION}
            </span>
          </div>
        </div>

        <div>
          <label
            htmlFor="appeal-evidence"
            className="block text-[12.5px] font-extrabold tracking-tight text-slate-700 dark:text-neutral-200"
          >
            Supporting link <span className="font-bold text-slate-300 dark:text-neutral-600">(optional)</span>
          </label>
          <p className="mt-1 text-[12px] font-medium text-slate-400 dark:text-neutral-500">
            A registration document, trademark record, or your official site.
          </p>
          <input
            id="appeal-evidence"
            type="url"
            value={evidenceUrl}
            onChange={(e) => setEvidenceUrl(e.target.value)}
            placeholder="https://"
            className="mt-2.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-[13.5px] font-semibold text-slate-900 outline-none transition-colors focus:border-slate-900 placeholder:font-medium placeholder:text-slate-300 dark:border-neutral-800 dark:bg-black dark:text-white dark:focus:border-neutral-400 dark:placeholder:text-neutral-700"
          />
        </div>
      </div>

      {error && (
        <p className="mt-4 flex items-center gap-1.5 text-[12px] font-bold text-rose-600 dark:text-rose-400">
          <AlertCircle size={13} /> {error}
        </p>
      )}

      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-4 py-2.5 text-[13px] font-extrabold tracking-tight text-slate-500 transition-colors hover:bg-slate-50 dark:text-neutral-400 dark:hover:bg-neutral-900"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-[13px] font-extrabold tracking-tight text-white transition-all hover:bg-slate-800 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          {submitting ? 'Filing…' : 'File appeal'}
        </button>
      </div>
    </form>
  );
}
