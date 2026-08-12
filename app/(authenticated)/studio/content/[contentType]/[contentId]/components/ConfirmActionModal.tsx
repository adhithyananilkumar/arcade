"use client";

import { useState } from "react";
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
}: {
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  requireTitleMatch?: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
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
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#14142b]/45 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_24px_64px_rgba(20,20,43,0.22)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
        >
          <X size={18} />
        </button>
        <h3 className="mb-2 text-[15px] font-bold tracking-tight text-[#14142b]">{title}</h3>
        <p className="mb-4 text-sm text-slate-500">{description}</p>

        {requireTitleMatch && (
          <input
            autoFocus
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={requireTitleMatch}
            className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-[#14142b] outline-none focus:border-[#14142b]/30 focus:bg-white focus:ring-4 focus:ring-slate-200/60"
          />
        )}

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm || busy}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 ${
              danger ? "bg-rose-600 hover:bg-rose-700" : "bg-[#14142b] hover:bg-[#232735]"
            }`}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
