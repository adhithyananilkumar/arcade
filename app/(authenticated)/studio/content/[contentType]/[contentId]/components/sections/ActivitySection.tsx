import { Clock } from "lucide-react";

export interface TimelineEntry {
  id: string;
  title: string;
  actorName: string;
  createdAt: string;
}

export function ActivitySection({
  entries,
  emptyLabel = "No activity yet.",
}: {
  entries?: TimelineEntry[];
  emptyLabel?: string;
}) {
  if (!entries || entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 p-8 text-center text-sm text-slate-500">
        {emptyLabel}
      </div>
    );
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
