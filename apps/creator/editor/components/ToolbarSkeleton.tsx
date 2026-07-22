// apps/creator/editor/components/ToolbarSkeleton.tsx
// Placeholder shown while the code-split toolbar chunk loads. Reserves the toolbar's
// height so the writing surface doesn't shift when the real controls arrive.
"use client";

export function ToolbarSkeleton() {
  return (
    <div
      aria-hidden
      className="flex items-center gap-0.5 !px-2 !py-1 !border-b !border-solid !border-border"
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="h-7 w-7 animate-pulse rounded bg-gray-100" />
      ))}
    </div>
  );
}
