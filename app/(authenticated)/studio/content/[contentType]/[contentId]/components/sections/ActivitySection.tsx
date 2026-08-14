import { Clock, AlertTriangle } from "lucide-react";
import { EmptyState } from "./EmptyState";

export interface TimelineEntry {
  id: string;
  title: string;
  actorName: string;
  createdAt: string;
}

export function ActivitySection({
  entries,
  unavailable,
  emptyTitle = "No activity yet",
  emptyDescription = "Changes and publishing events will appear here.",
}: {
  entries?: TimelineEntry[];
  unavailable?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}) {
  if (unavailable) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-medium text-amber-700">
        <AlertTriangle size={14} /> Temporarily unavailable — try again shortly.
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <ol className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_4px_16px_rgba(20,20,43,0.04)]">
      {entries.map((entry) => (
        <li key={entry.id} className="flex items-start gap-3 border-b border-slate-50 pb-3 last:border-0 last:pb-0">
          <Clock size={14} className="mt-0.5 shrink-0 text-slate-400" />
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-semibold text-[#14142b]">{entry.title}</p>
            <p className="text-xs text-slate-500">
              {entry.actorName} · {new Date(entry.createdAt).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
