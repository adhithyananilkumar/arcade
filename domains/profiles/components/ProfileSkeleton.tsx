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
      className={`animate-pulse rounded-xl bg-slate-100 dark:bg-neutral-900 ${className}`}
    />
  );
}

export function ProfileSkeleton({ variant = 'user' }: { variant?: 'user' | 'channel' }) {
  return (
    <div aria-busy="true" aria-live="polite" className="space-y-10">
      <span className="sr-only">Loading profile…</span>

      {variant === 'channel' && <Block className="h-36 w-full !rounded-[22px] sm:h-48" />}

      <div
        className={`flex flex-col gap-7 md:flex-row md:gap-9 ${
          variant === 'channel' ? '-mt-12 items-end' : 'items-start pt-4'
        }`}
      >
        <Block
          className={
            variant === 'channel'
              ? 'h-24 w-24 !rounded-[22px] sm:h-28 sm:w-28'
              : 'h-[112px] w-[112px] !rounded-full'
          }
        />
        <div className="flex-1 space-y-3">
          <Block className="h-8 w-56" />
          <Block className="h-4 w-32" />
          <Block className="h-4 w-full max-w-xl" />
          <Block className="h-4 w-full max-w-md" />
          <div className="flex gap-6 pt-3">
            <Block className="h-4 w-24" />
            <Block className="h-4 w-24" />
            <Block className="h-4 w-24" />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Block className="h-9 w-24" />
        <Block className="h-9 w-24" />
        <Block className="h-9 w-24" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Block key={i} className="h-60 w-full !rounded-[20px]" />
        ))}
      </div>
    </div>
  );
}
