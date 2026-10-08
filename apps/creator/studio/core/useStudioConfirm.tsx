"use client";

import { useCallback, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle } from "lucide-react";

/**
 * The destructive-action confirmation dialog every Studio workspace needs, plus a hook that
 * hands back a plain `confirm(options)` function instead of making every caller own dialog-open
 * state itself.
 *
 * <p>This was previously defined once inside the Course/Event content runtime and never adopted
 * by Exam — so deleting a section or a question there had no confirmation step at all, while
 * every equivalent action in Course/Event (delete module, delete lesson, delete badge, remove
 * exam) did. Centralizing it is what makes that consistent rather than leaving each workspace to
 * remember to build its own.
 */
export interface StudioConfirmOptions {
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  /**
   * Overrides the default warning triangle. Not every confirmation is a warning — some explain a
   * one-time setup step the author is about to take — and a hazard icon on those reads as a
   * problem where there isn't one.
   */
  icon?: ReactNode;
  onConfirm: () => void | Promise<void>;
}

export function useStudioConfirm() {
  const [options, setOptions] = useState<StudioConfirmOptions | null>(null);
  const [requestId, setRequestId] = useState(0);

  const confirm = useCallback((next: StudioConfirmOptions) => {
    setRequestId((id) => id + 1);
    setOptions(next);
  }, []);
  const close = useCallback(() => setOptions(null), []);

  // Keying by request id (rather than resetting `busy` in an effect keyed on `options`) gives
  // each confirm() call a fresh dialog instance, so `busy` starts false naturally.
  const dialog = <StudioConfirmDialog key={requestId} options={options} onClose={close} />;

  return { confirm, dialog };
}

function StudioConfirmDialog({ options, onClose }: { options: StudioConfirmOptions | null; onClose: () => void }) {
  const [busy, setBusy] = useState(false);

  if (!options || typeof document === "undefined") return null;
  const { title, message, confirmLabel, danger } = options;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 arcade-modal-backdrop" onClick={() => !busy && onClose()} />
      <div className="relative w-full max-w-sm overflow-hidden arcade-modal-box rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface p-6 shadow-[0_24px_64px_rgba(20,20,43,0.22)]">
        <div>
          <h3 className="text-[17px] font-bold tracking-tight text-ink">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">{message}</p>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-ink disabled:opacity-50 cursor-pointer dark:hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                await options.onConfirm();
                onClose();
              } finally {
                setBusy(false);
              }
            }}
            className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 cursor-pointer ${
              danger
                ? "bg-rose-600 text-white hover:bg-rose-700"
                : "bg-ink text-on-ink hover:bg-ink-hover shadow-sm"
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
