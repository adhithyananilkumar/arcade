'use client';

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
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4"
      onClick={busy ? undefined : onCancel}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 space-y-3">
          <div className="flex items-start gap-3">
            {danger && (
              <div className="shrink-0 w-9 h-9 rounded-full bg-rose-50 flex items-center justify-center">
                <TriangleAlert size={16} className="text-rose-500" />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-gray-900">{title}</h2>
              {description && (
                <div className="mt-2 text-xs text-gray-600 leading-relaxed space-y-1.5">
                  {description}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 bg-gray-50/60">
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200/60 transition-colors disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onConfirm}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              danger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#14142b] hover:bg-[#232735]'
            }`}
          >
            {busy && <Loader2 size={12} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
