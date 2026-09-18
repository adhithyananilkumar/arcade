"use client";

import { useState } from "react";
import { History, X, AlertTriangle } from "lucide-react";
import type { ContentVersionSummary } from "../api/platformReview";

interface RollbackDialogProps {
  target: ContentVersionSummary;
  currentLiveVersionNumber?: number | null;
  /** True when governance would publish the rollback immediately rather than review it. */
  publishesImmediately?: boolean;
  busy?: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

/**
 * Confirms a rollback, and explains what it actually does.
 *
 * The wording matters more than usual here. "Rollback" sounds like undo — like the old version is
 * restored in place — and a reviewer who believes that will be surprised when a new version appears
 * in their queue. The dialog states plainly that a new version is created, that the existing
 * published version is untouched, and whether review will follow.
 */
export function RollbackDialog({
  target,
  currentLiveVersionNumber,
  publishesImmediately = false,
  busy = false,
  onConfirm,
  onCancel,
}: RollbackDialogProps) {
  const [reason, setReason] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="rollback-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <header className="flex items-start justify-between gap-4 pb-3">
          <div className="flex items-center gap-2">
            <History size={18} className="text-[#14142b]" />
            <h2 id="rollback-title" className="text-[16px] font-bold text-[#14142b]">
              Roll back to version {target.versionNumber}?
            </h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Close"
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
          >
            <X size={18} />
          </button>
        </header>

        <div className="space-y-3 text-[13px] leading-relaxed text-slate-600">
          <p>
            This creates a <strong>new version</strong> containing the content of version{" "}
            {target.versionNumber}.
            {currentLiveVersionNumber != null ? (
              <>
                {" "}
                Version {currentLiveVersionNumber} stays live and unchanged until the new one is
                published.
              </>
            ) : null}
          </p>

          <p className="rounded-xl bg-slate-50 px-3 py-2.5 text-[12px]">
            Published versions are never modified or reactivated, so the history of what was live and
            when stays accurate.
          </p>

          {publishesImmediately ? (
            <p className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-[12px] text-amber-900">
              <AlertTriangle size={14} className="mt-0.5 shrink-0" />
              Your channel is exempt from review, so this will go live immediately.
            </p>
          ) : (
            <p className="text-[12px] text-slate-500">
              The new version goes through review before it goes live.
            </p>
          )}
        </div>

        <label className="mt-4 block">
          <span className="text-[12px] font-semibold text-[#14142b]">
            Why are you rolling back?
          </span>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder="Recorded in the content's history"
            className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2 text-[13px] outline-none focus:border-[#14142b]"
          />
        </label>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => onConfirm(reason.trim())}
            className="rounded-full bg-[#14142b] px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-[#232735] disabled:opacity-40"
          >
            {busy ? "Rolling back…" : `Roll back to version ${target.versionNumber}`}
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={onCancel}
            className="rounded-full border border-slate-300 px-4 py-2.5 text-[12px] font-semibold text-[#14142b] hover:bg-slate-50 disabled:opacity-40"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
