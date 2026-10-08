'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Loader2, TriangleAlert } from 'lucide-react';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * The one confirmation surface for destructive/sensitive IAM actions (granting or revoking a
 * policy, removing a Platform Owner). Replaces window.confirm() — which can't show structured
 * "here's exactly what changes" content and is easy to blind-dismiss out of habit.
 */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!open || !mounted) return null;

  // Portaled to <body> so it stacks above body-level portals such as the Sheet.
  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 arcade-modal-backdrop"
        onClick={busy ? undefined : onCancel}
      />
      <div
        className="relative w-full max-w-md arcade-modal-box rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 space-y-3">
          <div className="min-w-0">
            <h2 className="text-base font-bold text-ink">{title}</h2>
            {description && (
              <div className="mt-2 text-sm text-slate-500 leading-relaxed space-y-1.5">
                {description}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-slate-200/70 bg-slate-50/60 dark:bg-slate-900/40">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:text-ink rounded-xl hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer dark:hover:bg-slate-800"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={`flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
              danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-ink text-on-ink hover:bg-ink-hover shadow-sm'
            }`}
          >
            {busy ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
