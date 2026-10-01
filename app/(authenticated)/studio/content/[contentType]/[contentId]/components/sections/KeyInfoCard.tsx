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
    <div className="overflow-hidden rounded-[22px] border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-md">
      <h2 className="mb-5 flex items-center gap-2.5 text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
        <span className="grid size-7 place-items-center rounded-xl bg-blue-50 text-[#205ca8] border border-blue-100 dark:bg-slate-800 dark:text-blue-400 dark:border-slate-700">
          <Info size={15} />
        </span>
        <span>Key Information</span>
      </h2>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-3.5">
            <dt className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#205ca8] dark:text-blue-400">
              {row.label}
            </dt>
            <dd className="text-xs font-bold text-slate-900 dark:text-white truncate">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
