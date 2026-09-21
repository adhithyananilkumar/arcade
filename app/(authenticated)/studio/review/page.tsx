/* eslint-disable react-hooks/set-state-in-effect */
// app/(authenticated)/studio/review/page.tsx
// Review Queue: lists creations submitted for review and awaiting approval.
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useInfiniteScrollSentinel } from "@/shared/hooks/useInfiniteScrollSentinel";
import { api } from "@/infrastructure/http/api";
import type { AuthoredCourseSummary, SpringPage } from "@/shared/types/api.types";
import SpotlightCard from "@/components/ui/SpotlightCard";
import ShinyText from "@/components/ui/ShinyText";
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Clock,
  Inbox,
} from "lucide-react";

/** The statuses this page shows — now sent to the backend rather than filtered in the browser. */
const REVIEW_STATUSES = ["SUBMITTED", "APPROVED"] as const;

export default function ReviewCoursesPage() {
  // Filtered by status in the database and projected to card fields. This read `/api/courses` —
  // every course the author can reach, as full aggregates — and kept the in-review ones in the
  // browser.
  const reviewQuery = useInfiniteQuery({
    queryKey: ["authored-courses", "in-review"],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => {
      const params = new URLSearchParams({ page: String(pageParam), size: "24" });
      REVIEW_STATUSES.forEach((st) => params.append("status", st));
      return api.get<SpringPage<AuthoredCourseSummary>>(
        `/api/courses/mine?${params.toString()}`,
      );
    },
    getNextPageParam: (last) => (last.last ? undefined : last.number + 1),
  });

  const courses = useMemo(
    () => (reviewQuery.data?.pages ?? []).flatMap((pg) => pg.content),
    [reviewQuery.data],
  );
  const loading = reviewQuery.isLoading;

  const { sentinelRef } = useInfiniteScrollSentinel({
    hasMore: Boolean(reviewQuery.hasNextPage),
    isLoading: reviewQuery.isFetchingNextPage,
    onLoadMore: reviewQuery.fetchNextPage,
  });

  return (
    <div
      className="relative flex min-h-screen flex-1 flex-col"
      style={{
        background: "linear-gradient(160deg, #FDFAF0 0%, #FAF3D8 35%, #FDFDF5 70%, #F3EDD0 100%)",
      }}
    >
      <div className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-28 pt-28 sm:px-8 sm:pt-32">
        {/* ── Header Section ── */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#14142b] leading-tight select-none"
              style={{ fontFamily: "'Dancing Script', 'Caveat', cursive" }}
            >
              <ShinyText text="Review Queue" speed={4.5} />
            </h1>
            <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600">
              Creations submitted for review, waiting to be approved and published.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-900/10 bg-white/90 px-4 py-2 text-xs font-bold text-slate-700 shadow-3xs">
              <ClipboardCheck size={14} className="text-amber-700" />
              <span>{courses.length} {courses.length === 1 ? "creation" : "creations"} in queue</span>
            </span>
          </div>
        </div>

        {/* ── Section Status Header ── */}
        <div className="mb-6 flex items-center gap-6 pb-3">
          <div className="relative flex items-center gap-2 text-[13px] sm:text-sm font-bold text-[#14142b]">
            <Clock size={15} className="text-amber-700" />
            <span>Awaiting Review</span>
            <span className="rounded-full bg-[#14142b] px-2 py-0.5 text-[11px] font-semibold text-white">
              {courses.length}
            </span>
            <div className="absolute -bottom-3 left-0 right-0 h-[2.5px] bg-[#14142b] rounded-full" />
          </div>
        </div>

        {/* ── Main Content Area ── */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-amber-900/10 bg-white/90 p-5 shadow-[0_2px_12px_rgba(20,20,43,0.02)]"
              >
                <div className="mb-3 h-4 w-2/3 rounded bg-amber-100/50" />
                <div className="mb-2 h-3 w-full rounded bg-slate-100" />
                <div className="mb-4 h-3 w-3/4 rounded bg-slate-100" />
                <div className="flex items-center justify-between">
                  <div className="h-5 w-16 rounded-full bg-slate-100" />
                  <div className="h-8 w-24 rounded-xl bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="relative mx-auto max-w-2xl overflow-hidden rounded-tl-[2.5rem] rounded-br-[2.5rem] rounded-tr-2xl rounded-bl-2xl border border-amber-900/12 bg-[#FFFDF7]/90 p-8 sm:p-14 text-center backdrop-blur-md shadow-[0_10px_36px_rgba(78,41,17,0.04)]">
            {/* Ambient Background Glow */}
            <div
              className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-56 w-72 rounded-full blur-3xl opacity-40"
              style={{ background: "radial-gradient(circle, rgba(245, 158, 11, 0.35) 0%, rgba(253, 250, 240, 0) 70%)" }}
            />

            <div className="relative z-10 flex flex-col items-center">
              {/* Emblem Icon */}
              <div className="relative mb-5 flex items-center justify-center">
                <div className="absolute h-20 w-20 rounded-3xl bg-amber-500/10 blur-md animate-pulse" />
                <div className="relative flex h-18 w-18 items-center justify-center rounded-2xl border border-amber-900/15 bg-gradient-to-b from-[#FFFDF7] to-amber-50/80 text-amber-900 shadow-[0_6px_20px_rgba(217,119,6,0.12)]">
                  <Inbox size={32} strokeWidth={2} className="text-amber-800" />
                  <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#14142b] text-amber-400 border-2 border-[#FFFDF7] shadow-sm">
                    <ClipboardCheck size={12} strokeWidth={2.5} />
                  </div>
                </div>
              </div>

              {/* Status Pill */}
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-amber-900/5 border border-amber-900/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-900/80">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Queue is clear
              </div>

              {/* Title & Description */}
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-[#14142b]">
                No creations awaiting review
              </h3>
              <p className="mt-2 max-w-md text-xs sm:text-sm font-medium leading-relaxed text-slate-600">
                When you submit content for review from the authoring editor in Arcade Studio, it will appear here waiting for publication.
              </p>

              {/* CTA Action */}
              <div className="mt-6">
                <Link
                  href="/studio"
                  className="group inline-flex items-center gap-2 rounded-full bg-[#14142b] px-6 py-2.5 text-xs sm:text-sm font-bold text-white transition-all duration-200 hover:bg-[#232735] hover:shadow-md active:scale-98"
                >
                  <span>Go to Arcade Studio</span>
                  <ArrowRight size={14} className="text-amber-300 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <SpotlightCard
                key={course.id}
                spotlightColor="rgba(217, 119, 6, 0.06)"
                spotlightSize={360}
                className="group relative flex flex-col justify-between overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-xl rounded-bl-xl border border-amber-900/12 bg-[#FFFDF7]/90 hover:bg-[#FFFDF7] p-5 shadow-[0_4px_20px_rgba(78,41,17,0.03)] hover:shadow-[0_8px_30px_rgba(78,41,17,0.06)] hover:border-amber-900/25 transition-all duration-200"
              >
                <div className="relative z-10 flex flex-1 flex-col justify-between gap-4">
                  {/* Content Body: Channel, Title, & Description */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-900/70 truncate max-w-[260px]">
                        {course.authorName || "Course Submission"}
                      </span>
                    </div>

                    <h3 className="line-clamp-1 text-base sm:text-[17px] font-bold tracking-tight text-[#14142b] group-hover:text-amber-950 transition-colors leading-snug">
                      {course.title}
                    </h3>

                    <p className="line-clamp-2 text-xs leading-relaxed text-slate-600 font-medium min-h-[32px]">
                      {course.description || `${course.moduleCount} modules · Self-paced learning`}
                    </p>
                  </div>

                  {/* Standard Clean Footer: Date on Left, Compact Button on Right */}
                  <div className="pt-3 border-t border-amber-900/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                      <Clock size={12} className="text-amber-800/60" />
                      <span>
                        {new Date(course.updatedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    <Link
                      href={`/studio/published/${course.id}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#14142b] px-3.5 py-1.5 text-xs font-bold text-white transition-all shadow-3xs hover:bg-[#232735] hover:shadow-2xs cursor-pointer"
                    >
                      <BookOpen size={12} className="text-amber-400/90" />
                      <span>Review</span>
                      <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5 text-amber-200/80" />
                    </Link>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>
        )}

        {/* Loads the next page as the author scrolls; the grid has no pagination controls. */}
        {reviewQuery.hasNextPage && (
          <div ref={sentinelRef} className="flex justify-center py-8">
            {reviewQuery.isFetchingNextPage && (
              <span className="text-xs font-medium text-slate-400">Loading more…</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
