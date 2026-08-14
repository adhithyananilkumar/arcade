// Shared 3-part empty state: what's empty, why, what you can do next.
// Compact by design — never a huge blank rectangle.
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 px-6 py-6 text-center">
      <p className="text-sm font-semibold text-[#14142b]">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">{description}</p>
      {action && <div className="mt-3 flex justify-center">{action}</div>}
    </div>
  );
}
