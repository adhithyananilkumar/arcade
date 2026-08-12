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
    <div className="group rounded-2xl border border-white/40 bg-white/40 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-white/60 hover:bg-white/60 hover:shadow-xl">
      <h2 className="mb-4 text-sm font-bold text-[#14142b]">Key information</h2>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row) => (
          <div key={row.label} className="flex flex-col gap-1 rounded-xl bg-white/50 p-3 transition-colors group-hover:bg-white/70">
            <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {row.label}
            </dt>
            <dd className="text-sm font-bold text-[#14142b]">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
