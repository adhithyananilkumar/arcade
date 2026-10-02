'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Profiles
 *
 * Purpose:
 * Loading placeholders for a profile.
 *
 * Rules:
 * - Mirrors the real layout's geometry so the page does not jump when content
 *   lands — a spinner in the middle of a page-sized container reflows
 *   everything once the profile arrives.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

function Block({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-slate-100 ${className}`}
    />
  );
}

export function ProfileSkeleton() {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-8">
      <span className="sr-only">Loading profile…</span>

      <div className="overflow-hidden rounded-3xl border border-slate-200/70 bg-surface">
        <Block className="h-24 w-full !rounded-none sm:h-28" />
        <div className="space-y-3 px-6 pb-6 sm:px-8">
          <Block className="-mt-12 h-24 w-24 !rounded-2xl border-4 border-surface sm:-mt-14 sm:h-28 sm:w-28" />
          <Block className="h-8 w-64" />
          <Block className="h-4 w-80 max-w-full" />
          <Block className="h-4 w-full max-w-xl" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-4">
          <Block className="h-32 w-full !rounded-2xl" />
          <Block className="h-32 w-full !rounded-2xl" />
        </div>
        <Block className="h-72 w-full !rounded-2xl lg:col-span-8" />
      </div>

      <Block className="h-80 w-full !rounded-3xl" />
    </div>
  );
}
