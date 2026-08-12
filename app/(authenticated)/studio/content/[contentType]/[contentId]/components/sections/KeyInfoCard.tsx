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
    { label: "Status", value: status?.toUpperCase() || "—" },
    { label: "Channel", value: channelName || "—" },
    { label: "Owner", value: authorName || "—" },
    { label: "Created", value: formatDate(createdAt) },
    { label: "Last updated", value: formatDate(updatedAt) },
  ];

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white/95 p-5 shadow-[0_4px_16px_rgba(20,20,43,0.04)]">
      <h2 className="mb-3 text-sm font-bold text-[#14142b]">Key information</h2>
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-0.5">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              {row.label}
            </dt>
            <dd className="text-sm font-medium text-[#14142b]">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
