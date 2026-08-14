export interface Metric {
  label: string;
  sublabel?: string;
  value: string | number;
}

const CARD_THEMES = [
  {
    border: "border-[1.5px] border-blue-400/80",
    shadow: "shadow-[4px_-4px_0px_0px_#BFDBFE]",
    hoverShadow: "hover:shadow-[6px_-6px_0px_0px_#93C5FD]",
    bg: "bg-gradient-to-b from-blue-50/40 via-white to-white",
    subTag: "text-blue-600",
    valueText: "text-blue-950",
  },
  {
    border: "border-[1.5px] border-indigo-400/80",
    shadow: "shadow-[4px_-4px_0px_0px_#C7D2FE]",
    hoverShadow: "hover:shadow-[6px_-6px_0px_0px_#A5B4FC]",
    bg: "bg-gradient-to-b from-indigo-50/40 via-white to-white",
    subTag: "text-indigo-600",
    valueText: "text-indigo-950",
  },
  {
    border: "border-[1.5px] border-emerald-400/80",
    shadow: "shadow-[4px_-4px_0px_0px_#A7F3D0]",
    hoverShadow: "hover:shadow-[6px_-6px_0px_0px_#6EE7B7]",
    bg: "bg-gradient-to-b from-emerald-50/40 via-white to-white",
    subTag: "text-emerald-600",
    valueText: "text-teal-950",
  },
  {
    border: "border-[1.5px] border-purple-400/80",
    shadow: "shadow-[4px_-4px_0px_0px_#E9D5FF]",
    hoverShadow: "hover:shadow-[6px_-6px_0px_0px_#C084FC]",
    bg: "bg-gradient-to-b from-purple-50/40 via-white to-white",
    subTag: "text-purple-600",
    valueText: "text-purple-950",
  },
];

export function MetricsGrid({ metrics }: { metrics: Metric[] }) {
  if (metrics.length === 0) return null;
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 py-2">
      {metrics.map((metric, idx) => {
        const theme = CARD_THEMES[idx % CARD_THEMES.length];
        const numStr = String(idx + 1).padStart(2, "0");
        return (
          <div
            key={metric.label}
            className={`flex flex-col justify-between p-6 min-h-[170px] rounded-[24px] ${theme.border} ${theme.bg} ${theme.shadow}`}
          >
            <div className="flex flex-col gap-1 min-w-0">
              <span className={`font-mono text-[11px] font-black tracking-wider uppercase ${theme.subTag}`}>
                {numStr} // {metric.label}
              </span>
              {metric.sublabel && (
                <span className="text-xs font-semibold text-slate-500">
                  {metric.sublabel}
                </span>
              )}
            </div>
            <div className={`text-4xl sm:text-5xl font-black tracking-tighter pt-4 ${theme.valueText}`}>
              {metric.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
