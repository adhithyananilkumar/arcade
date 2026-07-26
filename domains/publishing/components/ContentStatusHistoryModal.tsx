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
  contentType: "course" | "roadmap" | "workshop";
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
      const endpoint = contentType === "roadmap"
        ? `/api/roadmaps/${contentId}/status-history`
        : contentType === "workshop"
        ? `/api/workshops/${contentId}/status-history`
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
        className="fixed inset-0 z-40 bg-[#14142b]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200/80 bg-white shadow-[0_0_48px_rgba(20,20,43,0.18)]">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-slate-100">
              <History size={17} className="text-[#14142b]" />
            </span>
            <h2 className="text-[15px] font-bold tracking-tight text-[#14142b]">Status history</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#14142b]"
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
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600">
              {error}
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <span className="grid size-14 place-items-center rounded-2xl bg-slate-50">
                <AlertCircle className="h-7 w-7 text-slate-300" />
              </span>
              <p className="text-sm font-semibold text-[#14142b]">No status history yet</p>
              <p className="max-w-[220px] text-xs text-slate-400">
                Submits, approvals, and rejections will show up here.
              </p>
            </div>
          ) : (
            <div className="relative ml-3 space-y-8 border-l-2 border-slate-100">
              {history.map((event, idx) => (
                <div key={idx} className="relative pl-6">
                  <div className="absolute -left-[11px] top-1 rounded-full bg-white">
                    {getIcon(event.label)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-[#14142b]">
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
