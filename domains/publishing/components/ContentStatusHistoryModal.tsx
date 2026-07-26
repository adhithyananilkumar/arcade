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
import { X, CheckCircle, XCircle, Send, AlertCircle, RefreshCw } from "lucide-react";
import { api } from "@/infrastructure/http/api";

interface ContentStatusHistoryResponse {
  label: string;
  actorName: string;
  createdAt: string; // ISO timestamp
}

interface ContentStatusHistoryModalProps {
  contentId: string;
  contentType: "course" | "roadmap";
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
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white shadow-2xl transition-transform sm:border-l sm:border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Content Status History</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <RefreshCw className="mb-4 h-8 w-8 animate-spin text-gray-300" />
              <p>Loading history...</p>
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
              <AlertCircle className="mb-3 h-10 w-10 text-gray-300" />
              <p>No status history recorded yet.</p>
            </div>
          ) : (
            <div className="relative border-l-2 border-gray-100 ml-3 space-y-8">
              {history.map((event, idx) => (
                <div key={idx} className="relative pl-6">
                  <div className="absolute -left-[11px] top-1 bg-white rounded-full">
                    {getIcon(event.label)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-900">
                      {event.label.split(":")[0]}
                    </span>
                    {event.label.includes(":") && (
                      <span className="mt-1 text-sm text-gray-600 italic">
                        "{event.label.substring(event.label.indexOf(":") + 1).trim()}"
                      </span>
                    )}
                    <div className="mt-2 flex items-center text-xs text-gray-400">
                      <span className="font-medium text-gray-500">{event.actorName}</span>
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
