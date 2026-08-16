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
    <div className="relative group my-4 mx-2 select-none">
      {/* Bottom-Left Outline Frame Offset */}
      <div className="pointer-events-none absolute -bottom-2.5 -left-2.5 inset-0 rounded-2xl border-2 border-[#06b6d4] transition-all duration-300 group-hover:-bottom-3.5 group-hover:-left-3.5 z-0" />

      {/* Top-Right Solid Color Panel Offset */}
      <div className="pointer-events-none absolute -top-2.5 -right-2.5 inset-0 rounded-2xl bg-[#06b6d4] transition-all duration-300 group-hover:-top-3.5 group-hover:-right-3.5 z-0" />

      {/* Main White Card Container */}
      <div className="relative z-10 flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-6 shadow-md">
        <ol className="flex flex-col gap-3">
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
      </div>
    </div>
  );
}
