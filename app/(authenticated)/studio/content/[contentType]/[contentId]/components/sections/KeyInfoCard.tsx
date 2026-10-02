import { Info } from "lucide-react";

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function KeyInfoCard({
  status,
  channelName,
  authorName,
  createdAt,
  updatedAt,
}: {
  status: string;
  channelName?: string | null;
  authorName?: string | null;
  createdAt: string;
  updatedAt: string;
}) {
  const rows: { label: string; value: string }[] = [
    { label: "Status", value: status?.toUpperCase() || "DRAFT" },
    { label: "Channel", value: channelName || "General Studio" },
    { label: "Owner", value: authorName || "Lead Instructor" },
    { label: "Created", value: formatDate(createdAt) },
    { label: "Last updated", value: formatDate(updatedAt) },
  ];

  return (
    <div className="overflow-hidden rounded-[24px] border-[1.5px] border-purple-400/80 bg-gradient-to-b from-purple-50/40 via-surface to-surface p-6 sm:p-7 shadow-[4px_-4px_0px_0px_#E9D5FF] dark:from-purple-500/10">
      <h2 className="mb-5 flex items-center gap-2.5 text-base font-black tracking-tight text-slate-900">
        <span className="grid size-7 place-items-center rounded-xl bg-purple-100 text-purple-700 border border-purple-200 shadow-2xs dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/25">
          <Info size={15} />
        </span>
        <span>Key Information</span>
      </h2>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1 rounded-2xl border border-purple-100 bg-surface/80 p-3.5 shadow-2xs dark:border-purple-500/25">
            <dt className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
              {row.label}
            </dt>
            <dd className="text-xs font-black text-slate-900 truncate">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
