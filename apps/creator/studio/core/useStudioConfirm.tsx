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
  /**
   * Asks for a value as part of the confirmation (a reason, a number of minutes). Replaces the
   * browser's own prompt(), which showed as a grey system alert at the top of the page (BUG-1068).
   */
  input?: {
    label: string;
    placeholder?: string;
    defaultValue?: string;
    type?: "text" | "number";
    required?: boolean;
  };
  /** Receives the input's trimmed value when `input` is set. Throw to keep the dialog open. */
  onConfirm: (value: string) => void | Promise<void>;
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
  const [value, setValue] = useState(options?.input?.defaultValue ?? "");

  if (!options || typeof document === "undefined") return null;
  const { title, message, confirmLabel, danger, input } = options;
  const canConfirm = !busy && (!input?.required || value.trim().length > 0);

  async function run() {
    if (!options || !canConfirm) return;
    setBusy(true);
    try {
      await options.onConfirm(value.trim());
      onClose();
    } catch {
      // The caller reported the failure; keep the dialog open so it can be retried or cancelled.
    } finally {
      setBusy(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 arcade-modal-backdrop" onClick={() => !busy && onClose()} />
      <div className="relative w-full max-w-sm overflow-hidden arcade-modal-box rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface p-6 shadow-[0_24px_64px_rgba(20,20,43,0.22)]">
        <div>
          <h3 className="text-[17px] font-bold tracking-tight text-ink">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">{message}</p>
        </div>
        {input && (
          <label className="mt-4 block">
            <span className="mb-1.5 block text-xs font-semibold text-slate-600">{input.label}</span>
            <input
              autoFocus
              type={input.type ?? "text"}
              min={input.type === "number" ? 1 : undefined}
              value={value}
              placeholder={input.placeholder}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") void run();
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-ink outline-none focus:border-ink/30 focus:bg-surface focus:ring-4 focus:ring-slate-200/60"
            />
          </label>
        )}
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
            disabled={!canConfirm}
            onClick={() => void run()}
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
