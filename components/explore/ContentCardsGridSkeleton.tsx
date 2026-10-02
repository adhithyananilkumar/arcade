"use client";

import React from "react";

export function ContentCardsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="relative flex flex-col justify-between overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-white/95 p-4 shadow-[0_8px_30px_rgba(20,20,43,0.05)] dark:border-slate-800 dark:bg-slate-900/95"
        >
          {/* Artwork placeholder */}
          <div className="relative h-36 sm:h-38 w-full rounded-tl-[1.5rem] rounded-br-[1.5rem] rounded-tr-md rounded-bl-md bg-slate-200/70 dark:bg-slate-800/80" />

          {/* Card Body */}
          <div className="mt-3 flex flex-1 flex-col gap-2.5">
            {/* Title line 1 & 2 */}
            <div className="space-y-1.5">
              <div className="h-4.5 w-3/4 rounded-md bg-slate-200/80 dark:bg-slate-800" />
              <div className="h-4.5 w-1/2 rounded-md bg-slate-200/60 dark:bg-slate-800/60" />
            </div>

            {/* Description lines */}
            <div className="space-y-1 pt-1">
              <div className="h-3 w-full rounded-md bg-slate-200/50 dark:bg-slate-800/50" />
              <div className="h-3 w-4/5 rounded-md bg-slate-200/50 dark:bg-slate-800/50" />
            </div>

            {/* Channel & Meta row */}
            <div className="flex items-center gap-2 pt-2">
              <div className="h-4 w-4 rounded-full bg-slate-200/70 dark:bg-slate-800" />
              <div className="h-3 w-24 rounded-md bg-slate-200/70 dark:bg-slate-800" />
              <div className="h-3 w-16 rounded-md bg-slate-200/50 dark:bg-slate-800/50 ml-auto" />
            </div>
          </div>

          {/* Bottom CTA Button placeholder */}
          <div className="mt-4 pt-2">
            <div className="h-9 w-full rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-slate-200/80 dark:bg-slate-800" />
          </div>
        </div>
      ))}
    </div>
  );
}
