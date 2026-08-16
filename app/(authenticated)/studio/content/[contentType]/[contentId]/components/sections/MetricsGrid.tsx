import React from "react";

export interface Metric {
  label: string;
  value: string | number;
  description?: string;
}

const VARIETY_THEMES = [
  {
    // Blue - Top-Left & Bottom-Right Swept Variety Shape
    shapeClass: "rounded-tl-[36px] rounded-br-[36px] rounded-tr-lg rounded-bl-lg",
    labelColor: "text-blue-950",
    gradientTint: "from-blue-500/10 via-blue-500/5 to-transparent",
    borderColor: "border-blue-200/60 hover:border-blue-400/80",
    accentPill: "bg-blue-600",
  },
  {
    // Orange - Top-Right & Bottom-Left Swept Variety Shape
    shapeClass: "rounded-tr-[36px] rounded-bl-[36px] rounded-tl-lg rounded-br-lg",
    labelColor: "text-orange-950",
    gradientTint: "from-orange-500/10 via-orange-500/5 to-transparent",
    borderColor: "border-orange-200/60 hover:border-orange-400/80",
    accentPill: "bg-orange-600",
  },
  {
    // Green - Top-Left & Bottom-Right Swept Variety Shape
    shapeClass: "rounded-tl-[36px] rounded-br-[36px] rounded-tr-lg rounded-bl-lg",
    labelColor: "text-emerald-950",
    gradientTint: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    borderColor: "border-emerald-200/60 hover:border-emerald-400/80",
    accentPill: "bg-emerald-600",
  },
  {
    // Red - Top-Right & Bottom-Left Swept Variety Shape
    shapeClass: "rounded-tr-[36px] rounded-bl-[36px] rounded-tl-lg rounded-br-lg",
    labelColor: "text-rose-950",
    gradientTint: "from-rose-500/10 via-rose-500/5 to-transparent",
    borderColor: "border-rose-200/60 hover:border-rose-400/80",
    accentPill: "bg-rose-600",
  },
];

export function MetricsGrid({ metrics }: { metrics: Metric[] }) {
  if (!metrics || metrics.length === 0) return null;

  return (
    <div className="py-2 px-1">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => {
          const theme = VARIETY_THEMES[index % VARIETY_THEMES.length];

          return (
            <div key={metric.label} className="relative group select-none">
              {/* Variety Shape Card Container (No straight frame lines) */}
              <div
                className={`relative z-10 flex flex-col justify-between min-h-[125px] ${theme.shapeClass} border ${theme.borderColor} bg-white p-5 shadow-[0_8px_24px_rgba(20,20,43,0.06)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_18px_38px_rgba(20,20,43,0.12)]`}
              >
                {/* Inner Glow Gradient Corner Tint */}
                <div
                  className={`pointer-events-none absolute inset-0 ${theme.shapeClass} bg-gradient-to-br ${theme.gradientTint} opacity-60 transition-opacity duration-300 group-hover:opacity-100`}
                />

                <div className="relative z-10">
                  <div className={`text-[11px] font-extrabold uppercase tracking-widest ${theme.labelColor}`}>
                    {metric.label}
                  </div>
                </div>

                <div className="relative z-10 mt-2 text-3xl font-black text-[#14142b] tracking-tight">
                  {metric.value}
                </div>

                {metric.description && (
                  <p className="relative z-10 mt-2 text-xs font-medium text-slate-500">
                    {metric.description}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
