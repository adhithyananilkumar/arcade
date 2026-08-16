"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

// Reusable confirm dialog for destructive/irreversible actions (Delete, Archive).
// Uses React Portal (createPortal) to attach to document.body, escaping 3D stacking contexts.
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Darkened blur backdrop covering full viewport */}
      <div className="absolute inset-0 bg-[#14142b]/60 backdrop-blur-md" onClick={onClose} />
      
      {/* Modal Surface */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_24px_64px_rgba(20,20,43,0.28)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#14142b] cursor-pointer"
        >
          <X size={18} />
        </button>
        <h3 className="mb-2 text-[15px] font-bold tracking-tight text-[#14142b]">{title}</h3>
        <p className="mb-4 text-sm leading-relaxed text-slate-500">{description}</p>

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
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-[#14142b] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm || busy}
            className={`rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-60 cursor-pointer ${
              danger ? "bg-rose-600 hover:bg-rose-700" : "bg-[#14142b] hover:bg-[#232735]"
            }`}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );

  if (!mounted) return null;
  return createPortal(modalContent, document.body);
}
