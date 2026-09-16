"use client";

import { useEffect, useState, useCallback } from "react";
import { History, RotateCcw, Eye, Clock, AlertCircle, RefreshCw, CheckCircle2 } from "lucide-react";
import type { StudioCapability } from "./StudioCapabilities";
import type { StudioHistoryAdapter, StudioRevision } from "./StudioHistory";

export interface StudioHistoryPanelProps<TRevision = unknown> {
  capability?: StudioCapability<StudioHistoryAdapter<TRevision>>;
  onPreview?: (revisionId: string, revision: TRevision) => void;
  onRestore?: (revisionId: string) => void;
}

export function StudioHistoryPanel<TRevision = unknown>({
  capability,
  onPreview,
  onRestore,
}: StudioHistoryPanelProps<TRevision>) {
  const [revisions, setRevisions] = useState<StudioRevision[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState<string | null>(null);

  const isAvailable = capability?.status === "available";
  const adapter = isAvailable ? capability.data : null;

  const loadRevisions = useCallback(async () => {
    if (!adapter) return;
    setLoading(true);
    setError(null);
    try {
      const list = await adapter.list();
      setRevisions(list);
    } catch (err) {
      console.error("Failed to load revisions:", err);
      setError(err instanceof Error ? err.message : "Failed to load version history.");
    } finally {
      setLoading(false);
    }
  }, [adapter]);

  useEffect(() => {
    if (isAvailable) {
      loadRevisions();
    }
  }, [isAvailable, loadRevisions]);

  if (!capability || capability.status === "unavailable") {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
          <History size={24} />
        </div>
        <h4 className="mt-3 text-sm font-semibold text-slate-800">History Unavailable</h4>
        <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-slate-500">
          {capability?.reason ?? "Revision history is not configured for this resource."}
        </p>
      </div>
    );
  }

  if (capability.status === "disabled") {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-500">
          <AlertCircle size={24} />
        </div>
        <h4 className="mt-3 text-sm font-semibold text-slate-800">History Disabled</h4>
        <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-slate-500">{capability.reason}</p>
      </div>
    );
  }

  const handleRestore = async (rev: StudioRevision) => {
    if (!adapter?.restore) return;
    const confirm = window.confirm(
      `Restore to version ${rev.versionNumber}${rev.label ? ` ("${rev.label}")` : ""}? Current unsaved edits will be replaced.`
    );
    if (!confirm) return;

    setRestoringId(rev.id);
    try {
      await adapter.restore(rev.id);
      setRestoreSuccess(`Restored to version ${rev.versionNumber}`);
      setTimeout(() => setRestoreSuccess(null), 3000);
      onRestore?.(rev.id);
      loadRevisions();
    } catch (err) {
      console.error("Failed to restore revision:", err);
      alert(err instanceof Error ? err.message : "Failed to restore version.");
    } finally {
      setRestoringId(null);
    }
  };

  const handlePreview = async (rev: StudioRevision) => {
    if (!adapter?.preview) return;
    setPreviewingId(rev.id);
    try {
      const data = await adapter.preview(rev.id);
      onPreview?.(rev.id, data);
    } catch (err) {
      console.error("Failed to preview revision:", err);
      alert(err instanceof Error ? err.message : "Failed to preview version.");
    } finally {
      setPreviewingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
          Revisions ({revisions.length})
        </span>
        <button
          type="button"
          onClick={loadRevisions}
          disabled={loading}
          className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 disabled:opacity-50"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {restoreSuccess && (
        <div className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          <CheckCircle2 size={14} className="text-emerald-600" />
          <span>{restoreSuccess}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-md bg-rose-50 px-3 py-2 text-xs text-rose-800">
          <AlertCircle size={14} className="text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {loading && revisions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-slate-400">
          <RefreshCw size={20} className="animate-spin text-slate-300" />
          <span className="mt-2 text-xs">Loading versions...</span>
        </div>
      )}

      {!loading && revisions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center text-slate-400">
          <History size={20} className="text-slate-300" />
          <span className="mt-2 text-xs font-medium text-slate-600">No revisions yet</span>
          <span className="mt-0.5 text-[11px] text-slate-400">
            Revisions will appear here as drafts or releases are saved.
          </span>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {revisions.map((rev) => {
          const formattedDate = new Date(rev.createdAt).toLocaleString(undefined, {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={rev.id}
              className="flex flex-col gap-2 rounded-lg border border-slate-200/80 bg-white p-3 shadow-sm transition-all hover:border-slate-300"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700">
                      v{rev.versionNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      {rev.label || `Version ${rev.versionNumber}`}
                    </span>
                  </div>
                  {rev.summary && (
                    <p className="mt-1 text-[11px] leading-tight text-slate-600">{rev.summary}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400">
                <div className="flex items-center gap-1">
                  <Clock size={11} />
                  <span>{formattedDate}</span>
                  {rev.authorName && <span>• {rev.authorName}</span>}
                </div>

                <div className="flex items-center gap-1.5">
                  {adapter?.preview && (
                    <button
                      type="button"
                      onClick={() => handlePreview(rev)}
                      disabled={previewingId === rev.id}
                      className="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
                      title="Preview this version"
                    >
                      <Eye size={11} />
                      Preview
                    </button>
                  )}
                  {adapter?.restore && (
                    <button
                      type="button"
                      onClick={() => handleRestore(rev)}
                      disabled={restoringId === rev.id}
                      className="flex items-center gap-1 rounded bg-slate-900 px-2 py-0.5 text-[10px] font-medium text-white transition-colors hover:bg-black disabled:opacity-50"
                      title="Restore to this version"
                    >
                      <RotateCcw size={10} />
                      Restore
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
