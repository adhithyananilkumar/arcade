// features/content/version-history/components/VersionHistoryPanel.tsx
"use client";

import { useCallback, useState } from "react";
import {
  History,
  X,
  RotateCcw,
  Clock,
  Loader2,
  Bookmark,
  Save,
  GitCommitVertical,
  CheckCircle,
  XCircle,
  Send,
  AlertCircle,
  MessageSquareText,
  FileClock,
} from "lucide-react";

import type { TiptapDocument } from "@/shared/types/editor.types";

// ── Wire types (mirror the backend DTOs) ──────────────────────────────────────

export interface VersionSummary {
  id: string;
  seq: number;
  kind: "AUTO" | "MANUAL" | "WORKFLOW";
  label: string | null;
  createdAt: string;
  createdById: string | null;
  createdByName: string | null;
}

export interface VersionDetail extends VersionSummary {
  body: string | null; // JSON string of the Tiptap document
}

export interface ContentStatusHistoryResponse {
  label: string;
  actorName: string;
  createdAt: string;
}

interface VersionHistoryPanelProps {
  open: boolean;
  onClose: () => void;
  versions: VersionSummary[];
  loading: boolean;
  error: string | null;
  selected: VersionDetail | null;
  previewLoading: boolean;
  onSelectVersion: (v: VersionSummary) => void;
  onRetryLoad: () => void;
  onRestore: (body: TiptapDocument, source: VersionSummary) => Promise<void>;
  renderEditor: (previewDoc: TiptapDocument, selectedId: string) => React.ReactNode;
  isSuView?: boolean;
  statusHistory?: ContentStatusHistoryResponse[];
  statusHistoryLoading?: boolean;
  /**
   * Renders as inline content sized to fill its parent instead of its own
   * fixed-position, screen-docked overlay — for dropping into a host panel
   * (EditorRightSidebar's "History" tab) that already provides the backdrop,
   * header, and close button.
   */
  embedded?: boolean;
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
  { icon: typeof Save; label: string; chip: string }
> = {
  AUTO: {
    icon: Save,
    label: "Auto save",
    chip: "bg-slate-100 text-slate-600",
  },
  MANUAL: {
    icon: Bookmark,
    label: "Named",
    chip: "bg-[#14142b]/8 text-[#14142b]",
  },
  WORKFLOW: {
    icon: GitCommitVertical,
    label: "Milestone",
    chip: "bg-emerald-50 text-emerald-700",
  },
};

function statusMeta(label: string) {
  const l = label.toLowerCase();
  if (l.startsWith("approved")) {
    return {
      icon: CheckCircle,
      iconClass: "text-emerald-600",
      ring: "border-emerald-200",
      accent: "border-l-emerald-400",
    };
  }
  if (l.startsWith("rejected")) {
    return {
      icon: XCircle,
      iconClass: "text-rose-600",
      ring: "border-rose-200",
      accent: "border-l-rose-400",
    };
  }
  if (l.startsWith("submitted")) {
    return {
      icon: Send,
      iconClass: "text-sky-600",
      ring: "border-sky-200",
      accent: "border-l-sky-400",
    };
  }
  return {
    icon: AlertCircle,
    iconClass: "text-slate-500",
    ring: "border-slate-200",
    accent: "border-l-slate-300",
  };
}

// ── Component ───────────────────────────────────────────────────────────────────

export function VersionHistoryPanel({
  open,
  onClose,
  versions,
  loading,
  error,
  selected,
  previewLoading,
  onSelectVersion,
  onRetryLoad,
  onRestore,
  renderEditor,
  isSuView,
  statusHistory,
  statusHistoryLoading,
  embedded,
}: VersionHistoryPanelProps) {
  const [restoring, setRestoring] = useState(false);
  const [tab, setTab] = useState<"log" | "comment">("log");

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
    } finally {
      setRestoring(false);
    }
  }, [selected, previewDoc, onRestore]);

  if (!open) return null;

  const panelInner = (
    <>
      {/* Tabs — SU review */}
        {isSuView && (
          <div className="shrink-0 px-5 pt-3 pb-3">
            <div className="flex gap-1 rounded-full border border-slate-200/80 bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setTab("log")}
                className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-semibold transition-all ${
                  tab === "log"
                    ? "bg-[#14142b] text-white shadow-sm"
                    : "text-slate-500 hover:text-[#14142b]"
                }`}
              >
                <FileClock size={13} />
                Log
              </button>
              <button
                type="button"
                onClick={() => setTab("comment")}
                className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-semibold transition-all ${
                  tab === "comment"
                    ? "bg-[#14142b] text-white shadow-sm"
                    : "text-slate-500 hover:text-[#14142b]"
                }`}
              >
                <MessageSquareText size={13} />
                Comment
              </button>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {isSuView && tab === "comment" ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-2 pb-6">
              {statusHistoryLoading ? (
                <div className="flex flex-1 items-center justify-center text-slate-400">
                  <Loader2 size={22} className="animate-spin" />
                </div>
              ) : !statusHistory || statusHistory.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
                  <span className="grid size-14 place-items-center rounded-2xl bg-slate-50">
                    <MessageSquareText size={24} className="text-slate-300" />
                  </span>
                  <p className="text-[13px] font-semibold text-[#14142b]">No workflow comments</p>
                  <p className="max-w-[220px] text-[11px] leading-relaxed text-slate-400">
                    Approvals, rejections, and submission notes will appear here.
                  </p>
                </div>
              ) : (
                <div className="relative ml-3 space-y-0 border-l border-slate-200 pl-0">
                  {statusHistory.map((event, idx) => {
                    const meta = statusMeta(event.label);
                    const Icon = meta.icon;
                    const title = event.label.split(":")[0];
                    const note = event.label.includes(":")
                      ? event.label.substring(event.label.indexOf(":") + 1).trim()
                      : null;
                    return (
                      <div key={idx} className="relative pb-6 pl-6 last:pb-0">
                        <span
                          className={`absolute -left-[13px] top-0 grid size-6 place-items-center rounded-full border bg-white ${meta.ring}`}
                        >
                          <Icon size={12} className={meta.iconClass} />
                        </span>
                        <div
                          className={`rounded-2xl border border-slate-100 border-l-[3px] bg-white p-3.5 shadow-[0_2px_8px_rgba(20,20,43,0.03)] ${meta.accent}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-[13px] font-bold text-[#14142b]">{title}</p>
                            <span className="shrink-0 text-[10px] font-medium text-slate-400">
                              {formatRelative(event.createdAt)}
                            </span>
                          </div>
                          {note && (
                            <p className="mt-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2 text-[12px] italic leading-relaxed text-slate-600">
                              “{note}”
                            </p>
                          )}
                          <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-400">
                            <span className="font-semibold text-slate-500">{event.actorName}</span>
                            <span>·</span>
                            <span>{formatAbsolute(event.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              {loading ? (
                <div className="flex flex-1 items-center justify-center text-slate-400">
                  <Loader2 size={22} className="animate-spin" />
                </div>
              ) : error ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center">
                  <p className="text-sm text-rose-600">{error}</p>
                  <button
                    type="button"
                    onClick={onRetryLoad}
                    className="text-[12px] font-semibold text-[#14142b] hover:underline"
                  >
                    Try again
                  </button>
                </div>
              ) : versions.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
                  <span className="grid size-14 place-items-center rounded-2xl bg-slate-50">
                    <Clock size={26} className="text-slate-300" />
                  </span>
                  <p className="text-[13px] font-semibold text-[#14142b]">No versions yet</p>
                  <p className="max-w-[220px] text-[11px] leading-relaxed text-slate-400">
                    Snapshots save automatically as content is edited.
                  </p>
                </div>
              ) : (
                <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-3 py-2">
                  {versions.map((v) => {
                    const meta = KIND_META[v.kind];
                    const Icon = meta.icon;
                    const isActive = selected?.id === v.id;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => onSelectVersion(v)}
                        className={`flex w-full items-start gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all ${
                          isActive
                            ? "border-[#14142b]/20 bg-[#14142b]/[0.04] shadow-[0_4px_12px_rgba(20,20,43,0.06)]"
                            : "border-transparent hover:border-slate-100 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl ${
                            isActive ? "bg-[#14142b] text-white" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          <Icon size={14} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <span
                              className={`truncate text-[13px] ${
                                isActive
                                  ? "font-bold text-[#14142b]"
                                  : "font-semibold text-slate-800"
                              }`}
                            >
                              {v.label ?? formatAbsolute(v.createdAt)}
                            </span>
                            <span className="shrink-0 text-[10px] font-medium text-slate-400">
                              {formatRelative(v.createdAt)}
                            </span>
                          </div>
                          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.chip}`}
                            >
                              {meta.label}
                            </span>
                            {v.createdByName && (
                              <span className="truncate text-[11px] font-medium text-slate-400">
                                {v.createdByName}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        {/* Preview + restore floating side-panel */}
        {selected && (!isSuView || tab === "log") && (
          <div className="absolute right-[calc(100%+16px)] top-0 bottom-16 z-50 flex w-[440px] flex-col overflow-hidden rounded-3xl border border-white/40 bg-white/95 shadow-2xl backdrop-blur-xl">
            <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/50 px-5 py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Preview
                </p>
                <p className="text-[13px] font-semibold text-[#14142b]">
                  {formatAbsolute(selected.createdAt)}
                </p>
              </div>
              {!isSuView && (
                <button
                  type="button"
                  onClick={handleRestore}
                  disabled={restoring || !previewDoc}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#14142b] px-4 py-2 text-[12px] font-semibold text-white shadow-sm transition-all hover:bg-[#232735] hover:shadow-md disabled:opacity-50"
                >
                  {restoring ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <RotateCcw size={14} />
                  )}
                  {restoring ? "Restoring…" : "Restore"}
                </button>
              )}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto bg-white px-6 py-6">
              {previewLoading ? (
                <div className="flex h-full items-center justify-center text-slate-400">
                  <Loader2 size={24} className="animate-spin" />
                </div>
              ) : previewDoc ? (
                renderEditor(previewDoc, selected.id)
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-center text-[13px] text-slate-400">
                    This version has no previewable content.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
    </>
  );

  if (embedded) {
    return <div className="relative flex h-full min-h-0 flex-1 flex-col">{panelInner}</div>;
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-[#14142b]/40 backdrop-blur-sm" onClick={onClose} />

      <aside className="relative flex h-full w-full max-w-[420px] flex-col border-l border-slate-200/80 bg-white shadow-[0_0_56px_rgba(20,20,43,0.2)]">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-[#14142b] text-white shadow-[0_8px_16px_rgba(20,20,43,0.18)]">
              <History size={17} />
            </span>
            <div>
              <h2 className="text-[15px] font-bold tracking-tight text-[#14142b]">
                {isSuView ? "History" : "Version history"}
              </h2>
              <p className="text-[11px] font-medium text-slate-400">
                {isSuView ? "Versions & workflow activity" : "Restore any saved snapshot"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
          >
            <X size={18} />
          </button>
        </div>

        {panelInner}
      </aside>
    </div>
  );
}
