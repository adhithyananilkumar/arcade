// features/content/editor/components/VersionHistoryPanel.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { History, X, RotateCcw, Clock, Loader2, Bookmark, Zap, GitCommitVertical } from "lucide-react";
import { api } from "@/lib/api";
import type { TiptapDocument } from "@/types/editor";
import { ArcadeEditor } from "./ArcadeEditor";

// ── Wire types (mirror the backend DTOs) ──────────────────────────────────────

interface VersionSummary {
  id: string;
  seq: number;
  kind: "AUTO" | "MANUAL" | "WORKFLOW";
  label: string | null;
  createdAt: string;
  createdById: string | null;
  createdByName: string | null;
}

interface VersionDetail extends VersionSummary {
  body: string | null; // JSON string of the Tiptap document
}

interface VersionHistoryPanelProps {
  lessonId: string;
  open: boolean;
  onClose: () => void;
  /**
   * Bumped by the parent whenever a new snapshot is written, so the list refetches.
   */
  refreshKey?: number;
  /** Restore a version's content into the live editor. Resolves once persisted. */
  onRestore: (body: TiptapDocument, source: VersionSummary) => Promise<void>;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatAbsolute(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.round(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

const KIND_META: Record<
  VersionSummary["kind"],
  { icon: typeof Zap; label: string; className: string }
> = {
  AUTO: { icon: Zap, label: "Auto-saved", className: "text-gray-400" },
  MANUAL: { icon: Bookmark, label: "Named", className: "text-indigo-500" },
  WORKFLOW: { icon: GitCommitVertical, label: "Milestone", className: "text-green-500" },
};

// ── Component ───────────────────────────────────────────────────────────────────

export function VersionHistoryPanel({
  lessonId,
  open,
  onClose,
  refreshKey,
  onRestore,
}: VersionHistoryPanelProps) {
  const [versions, setVersions] = useState<VersionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selected, setSelected] = useState<VersionDetail | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // ── Load the timeline ──────────────────────────────────────────────────────
  const loadVersions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.get<VersionSummary[]>(
        `/api/lessons/${lessonId}/document/versions`
      );
      setVersions(list ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    // Re-sync the timeline from the API whenever the panel opens or a snapshot lands.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (open) loadVersions();
  }, [open, refreshKey, loadVersions]);

  // ── Preview a version ──────────────────────────────────────────────────────
  const selectVersion = useCallback(
    async (v: VersionSummary) => {
      setPreviewLoading(true);
      try {
        const detail = await api.get<VersionDetail>(
          `/api/lessons/${lessonId}/document/versions/${v.id}`
        );
        setSelected(detail);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load version");
      } finally {
        setPreviewLoading(false);
      }
    },
    [lessonId]
  );

  const previewDoc: TiptapDocument | undefined = (() => {
    if (!selected?.body) return undefined;
    try {
      return JSON.parse(selected.body) as TiptapDocument;
    } catch {
      return undefined;
    }
  })();

  const handleRestore = useCallback(async () => {
    if (!selected || !previewDoc) return;
    setRestoring(true);
    try {
      await onRestore(previewDoc, selected);
      setSelected(null);
    } finally {
      setRestoring(false);
    }
  }, [selected, previewDoc, onRestore]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Scrim */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <aside className="relative flex h-full w-full max-w-md flex-col border-l border-gray-200 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <History size={18} className="text-indigo-500" />
            <h2 className="text-sm font-semibold text-gray-900">Version history</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col">
          {loading ? (
            <div className="flex flex-1 items-center justify-center text-gray-400">
              <Loader2 size={22} className="animate-spin" />
            </div>
          ) : error ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={loadVersions}
                className="text-xs font-medium text-indigo-600 hover:underline"
              >
                Try again
              </button>
            </div>
          ) : versions.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
              <Clock size={28} className="text-gray-300" />
              <p className="text-sm text-gray-500">No versions yet</p>
              <p className="text-xs text-gray-400">
                A snapshot is saved automatically as you keep editing.
              </p>
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-y-auto px-2 py-2">
              {versions.map((v) => {
                const meta = KIND_META[v.kind];
                const Icon = meta.icon;
                const isActive = selected?.id === v.id;
                return (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => selectVersion(v)}
                    className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                      isActive ? "bg-indigo-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <Icon size={15} className={`mt-0.5 flex-shrink-0 ${meta.className}`} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span
                          className={`truncate text-sm ${
                            isActive ? "font-semibold text-indigo-700" : "font-medium text-gray-800"
                          }`}
                        >
                          {v.label ?? formatAbsolute(v.createdAt)}
                        </span>
                        <span className="flex-shrink-0 text-[11px] text-gray-400">
                          {formatRelative(v.createdAt)}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-gray-400">
                        <span>{meta.label}</span>
                        {v.createdByName && (
                          <>
                            <span>·</span>
                            <span className="truncate">{v.createdByName}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Preview + restore footer */}
        {selected && (
          <div className="flex max-h-[55%] flex-shrink-0 flex-col border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between px-4 py-2.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Preview · {formatAbsolute(selected.createdAt)}
              </span>
              <button
                type="button"
                onClick={handleRestore}
                disabled={restoring || !previewDoc}
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-50"
              >
                {restoring ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <RotateCcw size={13} />
                )}
                {restoring ? "Restoring…" : "Restore this version"}
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">
              {previewLoading ? (
                <div className="flex items-center justify-center py-8 text-gray-400">
                  <Loader2 size={18} className="animate-spin" />
                </div>
              ) : previewDoc ? (
                <ArcadeEditor
                  key={selected.id}
                  readOnly
                  initialContent={previewDoc}
                  className="bg-white"
                />
              ) : (
                <p className="py-6 text-center text-xs text-gray-400">
                  This version has no previewable content.
                </p>
              )}
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}
