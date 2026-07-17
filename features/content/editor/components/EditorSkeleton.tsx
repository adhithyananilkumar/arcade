// features/content/editor/components/EditorSkeleton.tsx
// Loading placeholder shown during SSR hydration window while the editor initialises.

export function EditorSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-6">
      {/* Toolbar skeleton */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="h-7 w-7 rounded bg-gray-100"
            style={{ opacity: 1 - i * 0.06 }}
          />
        ))}
        <div className="ml-auto h-5 w-16 rounded bg-gray-100" />
      </div>
      {/* Content skeleton lines */}
      <div className="h-8 w-3/4 rounded bg-gray-100" />
      <div className="h-4 w-full rounded bg-gray-50" />
      <div className="h-4 w-5/6 rounded bg-gray-50" />
      <div className="h-4 w-full rounded bg-gray-50" />
      <div className="h-4 w-4/6 rounded bg-gray-50" />
      <div className="mt-4 h-4 w-full rounded bg-gray-50" />
      <div className="h-4 w-3/4 rounded bg-gray-50" />
    </div>
  );
}
