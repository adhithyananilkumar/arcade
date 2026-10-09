"use client";

import { useState, type ReactNode } from "react";
import { X } from "lucide-react";

// Small reusable confirm dialog for destructive/irreversible header actions
// (Delete, Archive). Mirrors the existing modal shell used across
// studio/page.tsx. `requireTitleMatch` implements the backend's
// type-the-title-to-confirm contract (course soft-delete) instead of a bare
// confirm button.
export function ConfirmActionModal({
  title,
  description,
  confirmLabel,
  danger,
  requireTitleMatch,
  onClose,
  onConfirm,
  children,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  requireTitleMatch?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  /** Extra content between the description and the buttons — e.g. what else the delete removes. */
  children?: ReactNode;
}) {
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canConfirm = !requireTitleMatch || typed.trim() === requireTitleMatch;

  async function handleConfirm() {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      // Callers that report a failure themselves resolve instead of throwing; without this the
      // button stayed on "Working…" for good and the dialog could only be left with the X (BUG-1064).
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 arcade-modal-backdrop" onClick={onClose} />
      <div className="relative w-full max-w-sm overflow-hidden arcade-modal-box rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface p-6 shadow-[0_24px_64px_rgba(20,20,43,0.22)]">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-tl-lg rounded-br-lg rounded-tr-xs rounded-bl-xs p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-ink cursor-pointer dark:hover:bg-slate-800"
        >
          <X size={18} />
        </button>
        <h3 className="mb-2 text-base font-bold tracking-tight text-ink">{title}</h3>
        <p className="mb-4 text-sm text-slate-500">{description}</p>
        {children}

        {requireTitleMatch && (
          <input
            autoFocus
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={requireTitleMatch}
            className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink/30 focus:bg-surface focus:ring-4 focus:ring-slate-200/60"
          />
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-ink cursor-pointer dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm || busy}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer ${
              danger ? "bg-rose-600 text-white hover:bg-rose-700" : "bg-ink text-on-ink hover:bg-ink-hover shadow-sm"
            }`}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
