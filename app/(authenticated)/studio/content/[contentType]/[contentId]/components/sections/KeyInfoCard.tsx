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

const SUB_CARD_THEMES = [
  {
    // 01: Amber / Yellow (Status)
    num: "01",
    lineColor: "#f59e0b",
    labelColor: "text-amber-700",
    numColor: "text-amber-600 font-extrabold",
    bgHover: "hover:border-amber-300",
  },
  {
    // 02: Pink / Magenta (Channel)
    num: "02",
    lineColor: "#ec4899",
    labelColor: "text-pink-700",
    numColor: "text-pink-600 font-extrabold",
    bgHover: "hover:border-pink-300",
  },
  {
    // 03: Indigo / Purple (Owner)
    num: "03",
    lineColor: "#6366f1",
    labelColor: "text-indigo-700",
    numColor: "text-indigo-600 font-extrabold",
    bgHover: "hover:border-indigo-300",
  },
  {
    // 04: Sky / Cyan (Created)
    num: "04",
    lineColor: "#0ea5e9",
    labelColor: "text-sky-700",
    numColor: "text-sky-600 font-extrabold",
    bgHover: "hover:border-sky-300",
  },
  {
    // 05: Emerald / Green (Last updated)
    num: "05",
    lineColor: "#10b981",
    labelColor: "text-emerald-700",
    numColor: "text-emerald-600 font-extrabold",
    bgHover: "hover:border-emerald-300",
  },
];

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
    <div className="group relative rounded-tl-[36px] rounded-br-[36px] rounded-tr-2xl rounded-bl-2xl border border-white/60 bg-white/60 p-6 shadow-lg backdrop-blur-xl transition-all duration-300 hover:border-white/80 hover:bg-white/80 hover:shadow-xl">
      <h2 className="mb-4 text-sm font-bold text-[#14142b]">Key information</h2>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.map((row, i) => {
          const theme = SUB_CARD_THEMES[i % SUB_CARD_THEMES.length];
          return (
            <div
              key={row.label}
              className={`group/subcard relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4.5 shadow-sm transition-all duration-300 ${theme.bgHover} hover:-translate-y-0.5 hover:shadow-md min-h-[90px]`}
            >
              <div>
                <dt className={`text-[11px] font-extrabold uppercase tracking-wider ${theme.labelColor}`}>
                  {row.label}
                </dt>
                <dd className="mt-1.5 text-sm sm:text-base font-extrabold text-[#14142b] leading-snug">
                  {row.value}
                </dd>
              </div>

              {/* Bottom Colored Accent Line (Matching Infographic Image 2) */}
              <span
                className="absolute bottom-0 left-0 right-0 h-[3.5px] rounded-b-2xl transition-all duration-300 group-hover/subcard:h-[4.5px]"
                style={{ backgroundColor: theme.lineColor }}
              />
            </div>
          );
        })}
      </dl>
    </div>
  );
}
