'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Public
 *
 * Purpose:
 * What `domain/<handle>` shows when nothing lives at that address.
 *
 * Rules:
 * - Deliberately does not distinguish "never existed" from "renamed away" or
 *   "reserved by Arcade". All three are 404 to the visitor: telling them which
 *   would turn this page into a probe for whether a given account exists.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import Link from 'next/link';
import { Search } from 'lucide-react';

export function ProfileNotFound({ handle }: { handle: string }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 pb-24 pt-24 text-center sm:px-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-slate-100 bg-white shadow-sm dark:border-neutral-900 dark:bg-black">
        <Search size={24} className="text-slate-300 dark:text-neutral-700" />
      </div>

      <h1 className="mt-7 text-[30px] font-extrabold tracking-tight text-slate-900 dark:text-white">
        Nothing at @{handle}
      </h1>
      <p className="mt-3 max-w-md text-[14px] font-medium leading-relaxed text-slate-500 dark:text-neutral-400">
        This handle isn&apos;t in use on Arcade. It may have been changed, or the
        link may have a typo in it.
      </p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/explore"
          className="rounded-xl bg-slate-900 px-5 py-2.5 text-[13px] font-extrabold tracking-tight text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          Explore Arcade
        </Link>
        <Link
          href="/search"
          className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[13px] font-extrabold tracking-tight text-slate-700 transition-colors hover:border-slate-900 dark:border-neutral-800 dark:bg-black dark:text-neutral-200 dark:hover:border-neutral-400"
        >
          Search
        </Link>
      </div>
    </div>
  );
}
