"use client";

import { useState, useEffect } from "react";
import { Users, Star, Award, CheckCircle2, Radio, Search, MessageSquare, Loader2, ChevronRight, User, X } from "lucide-react";
import { api } from "@/infrastructure/http/api";
import type { ContentTypeSegment } from "../../lib/contentTypeRouting";

/** A row of `GET /api/courses/{id}/learners`. */
export interface LearnerRecord {
  userId: string;
  name: string;
  email: string | null;
  status: string;
  progressPercentage: number;
  enrolledAt: string;
}

/** A row of `GET /api/courses/{id}/reviews`. */
export interface FeedbackRecord {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string | null;
  reviewText?: string | null;
  rating: number;
  createdAt: string;
}


function useAnimatedCounter(target: number, durationMs = 1200) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target <= 0) {
      setCount(0);
      return;
    }

    const startTime = performance.now();

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease-out cubic: 1 - pow(1 - progress, 3)
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(easeOut * target);

      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setCount(target);
      }
    };

    const animFrame = requestAnimationFrame(updateCounter);
    return () => cancelAnimationFrame(animFrame);
  }, [target, durationMs]);

  return count;
}

export function LearnersAnalyticsSection({
  contentId,
  segment,
}: {
  contentId?: string;
  segment?: ContentTypeSegment | null;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [reviewSearchQuery, setReviewSearchQuery] = useState("");
  const [isLearnersModalOpen, setIsLearnersModalOpen] = useState(false);
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [modalStarFilter, setModalStarFilter] = useState<number | null>(null);
  // `null` means "still loading" throughout this component; `[]` means "loaded, and empty".
  const [learners, setLearners] = useState<LearnerRecord[] | null>(null);
  useEffect(() => {
    if (!contentId || segment !== "course") {
      setLearners([]);
      return;
    }
    let cancelled = false;
    api
      .get<LearnerRecord[]>(`/api/courses/${contentId}/learners`)
      .then((rows) => {
        if (!cancelled) setLearners(rows || []);
      })
      .catch(() => {
        if (!cancelled) setLearners([]);
      });
    return () => {
      cancelled = true;
    };
  }, [contentId, segment]);

  const [reviews, setReviews] = useState<FeedbackRecord[] | null>(null);
  useEffect(() => {
    if (!contentId || segment !== "course") {
      setReviews([]);
      return;
    }
    let cancelled = false;
    api
      .get<FeedbackRecord[]>(`/api/courses/${contentId}/reviews`)
      .then((rows) => {
        if (!cancelled) setReviews(rows || []);
      })
      .catch(() => {
        if (!cancelled) setReviews([]);
      });
    return () => {
      cancelled = true;
    };
  }, [contentId, segment]);

  const query = searchQuery.trim().toLowerCase();
  const effectiveLearners = learners ?? [];
  const filteredLearners = effectiveLearners.filter(
    (l) =>
      query.length === 0 ||
      l.name?.toLowerCase().includes(query) ||
      l.email?.toLowerCase().includes(query)
  );

  const reviewQuery = reviewSearchQuery.trim().toLowerCase();
  const effectiveReviews = reviews ?? [];

  // Sort reviews so latest feedbacks are always on top
  const sortedReviews = [...effectiveReviews].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const filteredReviews = sortedReviews.filter(
    (r) =>
      reviewQuery.length === 0 ||
      r.userName?.toLowerCase().includes(reviewQuery) ||
      r.reviewText?.toLowerCase().includes(reviewQuery)
  );

  const modalFilteredReviews = sortedReviews.filter((r) => {
    const matchesSearch =
      reviewQuery.length === 0 ||
      r.userName?.toLowerCase().includes(reviewQuery) ||
      r.reviewText?.toLowerCase().includes(reviewQuery);
    const matchesStar = modalStarFilter === null || r.rating === modalStarFilter;
    return matchesSearch && matchesStar;
  });

  const avgRating =
    effectiveReviews && effectiveReviews.length > 0
      ? (effectiveReviews.reduce((acc, r) => acc + r.rating, 0) / effectiveReviews.length).toFixed(1)
      : null;

  const targetEnrollments = effectiveLearners.length;
  const animatedLearnerCount = useAnimatedCounter(targetEnrollments, 1200);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6">
        <div>
          {/* TAB 2: Course Insights (Exact 2-Card Layout matching Mockup) */}
          {(
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
            {/* Left Card: Enrollments (Clickable to view details) */}
            <div
              onClick={() => setIsLearnersModalOpen(true)}
              className="lg:col-span-4 rounded-[22px] border border-slate-200/80 bg-surface/95 p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-md flex flex-col justify-between min-h-[350px] cursor-pointer hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] transition-all group relative"
            >
              {/* Top Header */}
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <Users size={20} className="text-[#205ca8] dark:text-blue-400 group-hover:scale-110 transition-transform" />
                  <h3 className="text-lg font-extrabold tracking-tight text-slate-900">Enrollments</h3>
                </div>
                <span className="text-[11px] font-mono font-bold text-[#205ca8] bg-blue-50/80 border border-blue-200/60 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50 group-hover:bg-[#205ca8] group-hover:text-white px-3 py-1 rounded-full transition-all flex items-center gap-0.5">
                  View details <ChevronRight size={12} />
                </span>
              </div>

              {/* Center Metric Count */}
              <div className="flex flex-col items-center justify-center my-6 text-center">
                <span className="text-5xl sm:text-6xl font-extrabold text-ink tracking-tight group-hover:text-[#205ca8] transition-colors dark:group-hover:text-[#7cbaff]">
                  {animatedLearnerCount}
                </span>
                <span className="text-sm font-bold text-[#205ca8] dark:text-blue-400 mt-1">Active learners</span>
              </div>

              {/* Bottom Rating Info */}
              <div className="flex flex-col gap-2 pt-4 border-t border-slate-200/70">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">Average Rating</span>
                  <span className="text-sm font-extrabold text-slate-900">
                    {avgRating ? avgRating : "0.0"}{" "}
                    <span className="text-slate-400 font-normal">/ 5</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const ratingValue = avgRating ? parseFloat(avgRating) : 0;
                    const isFilled = star <= Math.round(ratingValue);
                    return (
                      <Star
                        key={star}
                        size={22}
                        className={
                          isFilled
                            ? "fill-amber-400 text-amber-400"
                            : "fill-transparent text-slate-300 stroke-[1.5]"
                        }
                      />
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Card: Student Reviews & Feedback */}
            <div className="lg:col-span-8 rounded-[22px] border border-slate-200/80 bg-surface/95 p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-md flex flex-col justify-between min-h-[350px]">
              {/* Header with Title, View All button, and Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/70">
                <div className="flex items-center gap-2.5">
                  <MessageSquare size={20} className="text-[#205ca8] dark:text-blue-400" />
                  <h3 className="text-lg font-extrabold tracking-tight text-slate-900">
                    Student Reviews &amp; Feedback
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative w-full sm:w-48">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search reviews..."
                      value={reviewSearchQuery}
                      onChange={(e) => setReviewSearchQuery(e.target.value)}
                      className="w-full rounded-full border border-slate-200/80 bg-slate-50 py-1.5 pl-9 pr-3 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-[#205ca8] focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                    />
                  </div>
                  <button
                    onClick={() => setIsReviewsModalOpen(true)}
                    className="shrink-0 text-[11px] font-mono font-bold text-slate-700 bg-slate-100 hover:bg-ink hover:text-on-ink border border-slate-200/80 px-3 py-1.5 rounded-full transition-all flex items-center gap-1 cursor-pointer"
                  >
                    View all ({sortedReviews.length}) <ChevronRight size={12} />
                  </button>
                </div>
              </div>

              {/* Review Items */}
              <div className="flex flex-col divide-y divide-slate-100 flex-1 justify-center my-1">
                {reviews === null ? (
                  <div className="flex items-center justify-center py-10 text-slate-400">
                    <Loader2 size={20} className="animate-spin text-[#205ca8] dark:text-[#7cbaff]" />
                  </div>
                ) : filteredReviews.length > 0 ? (
                  filteredReviews.slice(0, 4).map((review) => (
                    <div
                      key={review.id}
                      onClick={() => setIsReviewsModalOpen(true)}
                      className="flex items-center justify-between py-3.5 px-2 hover:bg-slate-50/80 rounded-xl transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="size-10 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center shrink-0">
                          {review.userAvatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={review.userAvatarUrl}
                              alt={review.userName}
                              className="size-full rounded-full object-cover"
                            />
                          ) : (
                            <User size={18} className="text-[#205ca8] dark:text-blue-400" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {review.userName}
                            </span>
                            <span className="text-[10px] font-mono font-medium text-slate-400">
                              {new Date(review.createdAt).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </div>
                          <span className="text-[11px] font-medium text-slate-500 truncate max-w-xs sm:max-w-md">
                            {review.reviewText || "No written feedback provided"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0 ml-3">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={16}
                              className={
                                star <= review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-transparent text-slate-300 stroke-[1.5]"
                              }
                            />
                          ))}
                        </div>
                        <ChevronRight
                          size={16}
                          className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center my-auto">
                    <div className="size-12 rounded-full bg-slate-100 border border-slate-200/80 flex items-center justify-center mb-3">
                      <MessageSquare size={20} className="text-[#205ca8] dark:text-blue-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">
                      {reviewQuery.length > 0 ? "No reviews match your search" : "No student reviews yet"}
                    </p>
                    <p className="text-xs text-slate-500 max-w-xs mt-1">
                      {reviewQuery.length > 0
                        ? "Try searching for a different student or keyword."
                        : "Learners will be able to review and rate this course after completing their modules."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Certificate Recipients & Issued Credentials (merged into Course Insights) */}
            <div className="lg:col-span-12 rounded-[22px] border border-slate-200/80 bg-surface/95 p-6 sm:p-7 shadow-[0_4px_20px_rgba(0,0,0,0.03)] backdrop-blur-md flex flex-col gap-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
                <div className="flex items-center gap-2.5">
                  <Award size={20} className="text-[#205ca8] dark:text-blue-400" />
                  <h3 className="text-lg font-extrabold tracking-tight text-slate-900">
                    Certificate Recipients &amp; Issued Credentials
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full">
                  {effectiveLearners.filter((l) => l.progressPercentage === 100).length} Claims Issued
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Issued</span>
                  <span className="text-2xl font-black text-slate-900">
                    {effectiveLearners.filter((l) => l.progressPercentage === 100).length}
                  </span>
                  <span className="text-[11px] text-slate-500">Verified course certificates</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Claim Rate</span>
                  <span className="text-2xl font-black text-slate-900">
                    {effectiveLearners.length > 0
                      ? `${Math.round(
                          (effectiveLearners.filter((l) => l.progressPercentage === 100).length /
                            effectiveLearners.length) *
                            100
                        )}%`
                      : "0%"}
                  </span>
                  <span className="text-[11px] text-slate-500">Of course completers</span>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Credential Type</span>
                  <span className="text-base font-bold text-blue-600 dark:text-blue-400 mt-1">
                    Digital Certificate &amp; Badge
                  </span>
                  <span className="text-[11px] text-slate-500">Publicly verifiable URL</span>
                </div>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-surface">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-[10px] font-mono uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Recipient Name</th>
                      <th className="px-4 py-3">Completion Status</th>
                      <th className="px-4 py-3">Issued Date</th>
                      <th className="px-4 py-3 text-right">Certificate ID</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {effectiveLearners.filter((l) => l.progressPercentage === 100).length > 0 ? (
                      effectiveLearners
                        .filter((l) => l.progressPercentage === 100)
                        .slice(0, 5)
                        .map((l, idx) => (
                          <tr key={l.userId || idx} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-bold text-slate-900">{l.name}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/25">
                                <CheckCircle2 size={11} /> Completed
                              </span>
                            </td>
                            <td className="px-4 py-3 text-slate-500">
                              {l.enrolledAt
                                ? new Date(l.enrolledAt).toLocaleDateString("en-GB", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "Recent"}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-[11px] text-slate-400">
                              CERT-{l.userId?.slice(-6).toUpperCase() || (idx + 101)}
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-400 text-xs">
                          No certificates issued yet. Learners who complete the course will appear here.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Modal 1: Enrolled Members & Progress Details */}
        {isLearnersModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
            onClick={() => setIsLearnersModalOpen(false)}
          >
            <div
              className="flex flex-col w-full max-w-3xl max-h-[85vh] bg-surface rounded-[28px] border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-2xl bg-blue-600 text-white shadow-sm">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-slate-900">
                      Enrolled Learners
                    </h3>
                    <p className="text-xs font-semibold text-slate-500">
                      {effectiveLearners.length} total enrolled students &amp; course progression
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsLearnersModalOpen(false)}
                  className="grid size-9 place-items-center rounded-full text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Status Breakdown & Search */}
              <div className="p-6 pb-3 flex flex-col gap-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-blue-200 bg-blue-50/40 p-3 flex flex-col dark:border-blue-500/25 dark:bg-blue-500/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Total Enrolled</span>
                    <span className="text-xl font-black text-slate-900 mt-0.5">{effectiveLearners.length}</span>
                  </div>
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-3 flex flex-col dark:border-emerald-500/25 dark:bg-emerald-500/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">In Progress</span>
                    <span className="text-xl font-black text-slate-900 mt-0.5">
                      {effectiveLearners.filter((l) => l.status === "Ongoing").length}
                    </span>
                  </div>
                  <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-3 flex flex-col dark:border-indigo-500/25 dark:bg-indigo-500/10">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Completed</span>
                    <span className="text-xl font-black text-slate-900 mt-0.5">
                      {effectiveLearners.filter((l) => l.status === "Completed").length}
                    </span>
                  </div>
                </div>

                <div className="relative">
                  <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search student by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-surface py-2 pl-9 pr-3 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden shadow-2xs"
                  />
                </div>
              </div>

              {/* Learners Roster List */}
              <div className="overflow-y-auto px-6 py-2 flex-1 divide-y divide-slate-100">
                {filteredLearners.length > 0 ? (
                  filteredLearners.map((learner) => (
                    <div
                      key={learner.userId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-slate-900 text-on-ink font-black text-xs shadow-2xs">
                          {learner.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-extrabold text-xs text-slate-900 truncate">
                            {learner.name}
                          </span>
                          <span className="text-[11px] font-medium text-slate-400 truncate">
                            {learner.email || "No email"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 sm:ml-auto">
                        <div>
                          {learner.status === "Completed" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-0.5 text-[10px] font-black uppercase dark:bg-blue-500/15 dark:text-blue-200 dark:border-blue-500/25">
                              <CheckCircle2 size={10} className="text-blue-600 dark:text-blue-400" /> Completed
                            </span>
                          ) : learner.status === "Ongoing" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-black uppercase dark:bg-emerald-500/15 dark:text-emerald-200 dark:border-emerald-500/40">
                              <Radio size={10} className="text-emerald-600 dark:text-emerald-400" /> In Progress
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-[10px] font-black uppercase">
                              Not started
                            </span>
                          )}
                        </div>

                        <div className="w-28 flex items-center gap-2">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                              style={{ width: `${learner.progressPercentage}%` }}
                            />
                          </div>
                          <span className="font-black text-slate-700 text-[10px] w-7 text-right">
                            {learner.progressPercentage}%
                          </span>
                        </div>

                        <span className="text-[11px] font-bold text-slate-400 w-24 text-right">
                          {learner.enrolledAt
                            ? new Date(learner.enrolledAt).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="size-12 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mb-2 text-blue-500 dark:bg-blue-500/10 dark:border-blue-500/25">
                      <Users size={20} />
                    </div>
                    <p className="text-sm font-bold text-slate-700">
                      {query.length > 0 ? "No learners match that search." : "No learners enrolled yet."}
                    </p>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      {query.length > 0
                        ? "Check for typos in the name or email."
                        : "Learners will appear here once they enroll in this course."}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                <span className="text-xs font-bold text-slate-500">
                  Showing {filteredLearners.length} of {effectiveLearners.length} learners
                </span>
                <button
                  onClick={() => setIsLearnersModalOpen(false)}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-on-ink hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal 2: All Feedbacks & Reviews Dedicated View */}
        {isReviewsModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in duration-200"
            onClick={() => setIsReviewsModalOpen(false)}
          >
            <div
              className="flex flex-col w-full max-w-4xl max-h-[88vh] bg-surface rounded-[32px] border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-7 py-5 border-b border-slate-100 bg-amber-50/30 dark:bg-amber-500/10">
                <div className="flex items-center gap-3">
                  <div className="grid size-11 place-items-center rounded-2xl bg-amber-500 text-white shadow-sm">
                    <MessageSquare size={22} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-slate-900">
                      All Student Reviews &amp; Feedback
                    </h3>
                    <p className="text-xs font-semibold text-slate-500">
                      Sorted latest first &bull; {sortedReviews.length} verified ratings
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsReviewsModalOpen(false)}
                  className="grid size-9 place-items-center rounded-full text-slate-400 hover:bg-slate-200/70 hover:text-slate-700 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Rating Summary Bar + Star Filters */}
              <div className="p-6 pb-3 flex flex-col gap-4 border-b border-slate-100 bg-slate-50/40">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center bg-surface border border-amber-200/80 rounded-2xl px-5 py-2.5 shadow-2xs dark:border-amber-500/25">
                      <span className="text-3xl font-black text-slate-900">{avgRating ?? "0.0"}</span>
                      <div className="flex items-center gap-0.5 mt-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={13}
                            className={
                              s <= Math.round(avgRating ? parseFloat(avgRating) : 0)
                                ? "fill-amber-400 text-amber-400"
                                : "fill-transparent text-slate-300"
                            }
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 mt-1">out of 5</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => setModalStarFilter(null)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                          modalStarFilter === null
                            ? "bg-amber-500 text-white shadow-xs"
                            : "bg-surface border border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        All ({sortedReviews.length})
                      </button>
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count = sortedReviews.filter((r) => r.rating === stars).length;
                        return (
                          <button
                            key={stars}
                            onClick={() => setModalStarFilter(stars === modalStarFilter ? null : stars)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                              modalStarFilter === stars
                                ? "bg-amber-500 text-white shadow-xs"
                                : "bg-surface border border-slate-200 text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            <span>{stars} ★</span>
                            <span className="text-[10px] opacity-80">({count})</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="relative w-full sm:w-64">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search feedback text or student..."
                      value={reviewSearchQuery}
                      onChange={(e) => setReviewSearchQuery(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-surface py-2 pl-9 pr-3 text-xs font-medium text-slate-700 placeholder-slate-400 focus:border-amber-400 focus:outline-none shadow-2xs"
                    />
                  </div>
                </div>
              </div>

              {/* Feedbacks List (Latest on top) */}
              <div className="overflow-y-auto px-7 py-4 flex-1 flex flex-col gap-3.5 divide-y divide-slate-100">
                {modalFilteredReviews.length > 0 ? (
                  modalFilteredReviews.map((review) => (
                    <div
                      key={review.id}
                      className="pt-3.5 first:pt-0 flex flex-col gap-2 p-4 rounded-2xl border border-amber-100/90 bg-surface hover:border-amber-300/80 transition-all shadow-2xs dark:border-amber-500/25 dark:hover:border-amber-500/40"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="size-10 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {review.userAvatarUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={review.userAvatarUrl}
                                alt={review.userName}
                                className="size-full rounded-full object-cover"
                              />
                            ) : (
                              (review.userName || "?").charAt(0).toUpperCase()
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-900">{review.userName}</span>
                            <span className="text-[10px] font-bold text-slate-400">
                              {new Date(review.createdAt).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}{" "}
                              &bull; Verified Learner
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 bg-amber-50/80 border border-amber-200/80 px-2.5 py-1 rounded-full dark:bg-amber-500/10 dark:border-amber-500/25">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={14}
                              className={
                                star <= review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-transparent text-slate-300 stroke-[1.5]"
                              }
                            />
                          ))}
                          <span className="text-xs font-black text-amber-900 ml-1 dark:text-amber-200">{review.rating}.0</span>
                        </div>
                      </div>

                      {review.reviewText && (
                        <p className="text-xs font-medium text-slate-700 leading-relaxed pl-13 pt-1">
                          &ldquo;{review.reviewText}&rdquo;
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="size-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-2 text-amber-500 dark:bg-amber-500/10 dark:border-amber-500/25">
                      <MessageSquare size={20} />
                    </div>
                    <p className="text-sm font-bold text-slate-700">No reviews match your filter.</p>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      Try clearing the star rating filter or search term.
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between px-7 py-4 border-t border-slate-100 bg-slate-50/50">
                <span className="text-xs font-bold text-slate-500">
                  Showing {modalFilteredReviews.length} of {sortedReviews.length} reviews
                </span>
                <button
                  onClick={() => setIsReviewsModalOpen(false)}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-on-ink hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}

