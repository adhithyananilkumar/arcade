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
    <div className="overflow-hidden rounded-3xl border border-dashed border-slate-200/80 bg-white/70 px-6 py-8 text-center shadow-2xs backdrop-blur-sm">
      <p className="text-sm font-extrabold text-[#14142b]">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-xs font-medium text-slate-500">{description}</p>
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

