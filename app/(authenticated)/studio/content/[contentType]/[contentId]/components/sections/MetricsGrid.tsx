// Only ever renders metrics the caller actually has real numbers for — no
// zero-filled or fabricated cards. Pass an empty array to render nothing.
export interface Metric {
  label: string;
  value: string | number;
}

export function MetricsGrid({ metrics }: { metrics: Metric[] }) {
  if (metrics.length === 0) return null;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_4px_16px_rgba(20,20,43,0.04)]"
        >
          <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {metric.label}
          </div>
          <div className="mt-1 text-xl font-bold text-[#14142b]">{metric.value}</div>
        </div>
      ))}
    </div>
  );
}
