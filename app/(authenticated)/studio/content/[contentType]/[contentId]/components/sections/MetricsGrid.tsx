export interface Metric {
  label: string;
  sublabel?: string;
  value: string | number;
}

export function MetricsGrid({ metrics }: { metrics: Metric[] }) {
  if (metrics.length === 0) return null;
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 py-2">
      {metrics.map((metric, idx) => {
        const numStr = String(idx + 1).padStart(2, "0");
        return (
          <div
            key={metric.label}
            className="flex flex-col justify-between p-6 min-h-[160px] rounded-[22px] border border-slate-200/80 bg-surface/95 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] backdrop-blur-md"
          >
            <div className="flex flex-col gap-1 min-w-0">
              <span className="font-mono text-[11px] font-bold tracking-wider uppercase text-[#205ca8] dark:text-blue-400">
                {numStr} // {metric.label}
              </span>
              {metric.sublabel && (
                <span className="text-xs font-medium text-slate-500">
                  {metric.sublabel}
                </span>
              )}
            </div>
            <div className="text-4xl sm:text-5xl font-extrabold tracking-tight text-ink pt-3">
              {metric.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
