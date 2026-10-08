"use client";

import { useEffect, useState, useCallback } from "react";
// No date-fns to avoid adding new dependency

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + " days";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + " hours";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + " minutes";
  return Math.floor(seconds) + " seconds";
}
import { X, CheckCircle, XCircle, Send, AlertCircle, RefreshCw, History } from "lucide-react";
import { api } from "@/infrastructure/http/api";

interface ContentStatusHistoryResponse {
  label: string;
  actorName: string;
  createdAt: string; // ISO timestamp
}

interface ContentStatusHistoryModalProps {
  contentId: string;
  contentType: "course" | "workshop";
  open: boolean;
  onClose: () => void;
}

export function ContentStatusHistoryModal({
  contentId,
  contentType,
  open,
  onClose,
}: ContentStatusHistoryModalProps) {
  const [history, setHistory] = useState<ContentStatusHistoryResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint = contentType === "workshop"
        ? `/api/v1/events/${contentId}/status-history`
        : `/api/courses/${contentId}/status-history`;
      const data = await api.get<ContentStatusHistoryResponse[]>(endpoint);
      setHistory(data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load status history");
    } finally {
      setLoading(false);
    }
  }, [contentId, contentType]);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadHistory();
    }
  }, [open, loadHistory]);

  if (!open) return null;

  // Simple icon mapper based on label string
  const getIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.startsWith("approved")) return <CheckCircle className="text-emerald-500" size={20} />;
    if (l.startsWith("rejected")) return <XCircle className="text-red-500" size={20} />;
    if (l.startsWith("submitted")) return <Send className="text-blue-500" size={20} />;
    return <AlertCircle className="text-gray-400" size={20} />;
  };

  return (
    <>
      <div
        className="fixed inset-0 z-40 arcade-modal-backdrop transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200/80 bg-surface shadow-[0_0_48px_rgba(20,20,43,0.18)]">
        <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-4">
          <div>
            <h2 className="text-[15px] font-bold tracking-tight text-ink">Status history</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-tl-lg rounded-br-lg rounded-tr-xs rounded-bl-xs p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-ink cursor-pointer dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <RefreshCw className="mb-4 h-8 w-8 animate-spin text-slate-300" />
              <p className="text-sm">Loading history…</p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-400">
              {error}
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-slate-50">
                <AlertCircle className="h-7 w-7 text-slate-300" />
              </span>
              <p className="text-sm font-semibold text-ink">No status history yet</p>
              <p className="max-w-[220px] text-xs text-slate-400">
                Submits, approvals, and rejections will show up here.
              </p>
            </div>
          ) : (
            <div className="relative ml-3 space-y-8 border-l-2 border-slate-100">
              {history.map((event, idx) => (
                <div key={idx} className="relative pl-6">
                  <div className="absolute -left-[11px] top-1 rounded-full bg-surface">
                    {getIcon(event.label)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-ink">
                      {event.label.split(":")[0]}
                    </span>
                    {event.label.includes(":") && (
                      <span className="mt-1 rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-sm italic text-slate-600">
                        &quot;{event.label.substring(event.label.indexOf(":") + 1).trim()}&quot;
                      </span>
                    )}
                    <div className="mt-2 flex items-center text-xs text-slate-400">
                      <span className="font-medium text-slate-500">{event.actorName}</span>
                      <span className="mx-2">•</span>
                      <span>{timeAgo(event.createdAt)} ago</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
