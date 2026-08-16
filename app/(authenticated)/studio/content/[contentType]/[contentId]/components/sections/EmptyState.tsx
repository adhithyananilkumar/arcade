// Shared 3-part empty state with Image 3 offset layer card frame design.
export function EmptyState({
  title,
  description,
  action,
  color = "#06b6d4",
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="relative group my-4 mx-2 select-none">
      {/* Bottom-Left Outline Frame Offset (Matching Image 3) */}
      <div
        className="pointer-events-none absolute -bottom-2.5 -left-2.5 inset-0 rounded-2xl border-2 transition-all duration-300 group-hover:-bottom-3.5 group-hover:-left-3.5 z-0"
        style={{ borderColor: color }}
      />

      {/* Top-Right Solid Color Panel Offset (Matching Image 3) */}
      <div
        className="pointer-events-none absolute -top-2.5 -right-2.5 inset-0 rounded-2xl transition-all duration-300 group-hover:-top-3.5 group-hover:-right-3.5 z-0"
        style={{ backgroundColor: color }}
      />

      {/* Main Crisp White Card Container */}
      <div className="relative z-10 rounded-2xl border border-slate-200/90 bg-white px-8 py-10 text-center shadow-md transition-all duration-300">
        <p className="text-base font-bold text-[#14142b]">{title}</p>
        <p className="mx-auto mt-1.5 max-w-md text-xs text-slate-500">{description}</p>
        {action && <div className="mt-4 flex justify-center">{action}</div>}
      </div>
    </div>
  );
}
