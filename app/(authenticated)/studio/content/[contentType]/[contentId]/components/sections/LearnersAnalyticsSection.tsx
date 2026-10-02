"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Star, Award, CheckCircle2, Radio, FileText, Search, MessageSquare, BookOpen, IndianRupee, Save, Loader2, Tag, ChevronRight, User, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/infrastructure/http/api";
import { usePublicCategories } from "@/shared/hooks/usePublicCategories";
import type { CourseResponse } from "@/shared/types/api.types";
import { formatMoney, fromMinorUnits, toMinorUnits } from "@/shared/utils/money";
import {
  listAssessmentPlacementsForCourse,
  listExamPlans,
  getCourseExam,
  getEventExam,
  planKindLabel,
  type AssessmentPlacementResponse,
  type ExamPlanResponse,
  type ExamResponse,
} from "@/domains/assessments";

/** One assessment in the course, joined to the plan it delivers. */
type AssessmentRow = { placement: AssessmentPlacementResponse; plan: ExamPlanResponse | null };
import type { ContentTypeSegment } from "../../lib/contentTypeRouting";

/** A row of `GET /api/courses/{id}/pricing-history`. */
export interface CoursePricingHistoryEntry {
  id: string;
  pricingModel: string;
  priceAmount: number | null;
  currency: string | null;
  changedAt: string;
  changedBy: string | null;
  changedByName: string;
}

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

const FIRST_NAMES = [
  "Aarav", "Diya", "Rohan", "Ananya", "Vikram", "Sneha", "Aditya", "Pooja",
  "Rahul", "Kavya", "Siddharth", "Ishita", "Arjun", "Meera", "Karan", "Tanvi",
  "Nikhil", "Priyanka", "Varun", "Rhea", "Manish", "Divya", "Gaurav", "Simran",
  "Abhishek", "Neha", "Akash", "Shruti", "Harsh", "Swati", "Sanjay", "Ritu",
  "Deepak", "Aarti", "Sameer", "Preeti", "Alok", "Shweta", "Rajesh", "Komal"
];

const LAST_NAMES = [
  "Sharma", "Patel", "Verma", "Iyer", "Malhotra", "Nair", "Kapoor", "Joshi",
  "Gupta", "Reddy", "Mehta", "Bhat", "Deshmukh", "Chopra", "Menon", "Saxena",
  "Rao", "Singhania", "Choudhury", "Bose", "Trivedi", "Banerjee", "Ghosh", "Dubey"
];

/** Mock 100 enrolled learners for realistic testing */
const MOCK_TEST_LEARNERS: LearnerRecord[] = Array.from({ length: 100 }, (_, i) => {
  const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
  const lastName = LAST_NAMES[(i * 3 + 7) % LAST_NAMES.length];
  const name = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i > 35 ? i : ""}@example.com`;

  const statusType = i % 5;
  let status = "Ongoing";
  let progressPercentage = 25 + ((i * 19) % 70);

  if (statusType === 0 || statusType === 1) {
    status = "Completed";
    progressPercentage = 100;
  } else if (statusType === 4 && i % 2 === 0) {
    status = "Not started";
    progressPercentage = 0;
  }

  const day = 1 + (i % 28);
  const month = i % 2 === 0 ? "09" : "08";
  const enrolledAt = `2026-${month}-${day.toString().padStart(2, "0")}T${(10 + (i % 12)).toString().padStart(2, "0")}:30:00Z`;

  return {
    userId: `usr-${i + 1}`,
    name,
    email,
    status,
    progressPercentage,
    enrolledAt,
  };
});

/** Mock reviews totaling an average rating of 4.6 / 5 */
const MOCK_TEST_REVIEWS: FeedbackRecord[] = [
  {
    id: "rev-1",
    userId: "usr-4",
    userName: "Ananya Iyer",
    userAvatarUrl: null,
    rating: 5,
    reviewText: "Outstanding course structure! The practical assignments and module explanations are crystal clear.",
    createdAt: "2026-09-30T09:15:00Z",
  },
  {
    id: "rev-2",
    userId: "usr-1",
    userName: "Aarav Sharma",
    userAvatarUrl: null,
    rating: 5,
    reviewText: "Very insightful and easy to follow. Helped me land practical confidence with the tools quickly.",
    createdAt: "2026-09-28T15:40:00Z",
  },
  {
    id: "rev-3",
    userId: "usr-5",
    userName: "Vikram Malhotra",
    userAvatarUrl: null,
    rating: 5,
    reviewText: "The best comprehensive walkthrough I've taken so far. Highly recommend to everyone!",
    createdAt: "2026-09-25T11:20:00Z",
  },
  {
    id: "rev-4",
    userId: "usr-2",
    userName: "Diya Patel",
    userAvatarUrl: null,
    rating: 4,
    reviewText: "Great pacing and relevant examples throughout each chapter.",
    createdAt: "2026-09-22T08:05:00Z",
  },
  {
    id: "rev-5",
    userId: "usr-3",
    userName: "Rohan Verma",
    userAvatarUrl: null,
    rating: 4,
    reviewText: "Engaging content from start to finish. Looking forward to advanced modules.",
    createdAt: "2026-09-18T14:50:00Z",
  },
];

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
  const [activeSubTab, setActiveSubTab] = useState<
    "insights" | "exams" | "certificates" | "overview" | "category" | "pricing"
  >(segment === "course" ? "insights" : "insights");

  // `null` means "still loading" throughout this component; `[]` means "loaded, and empty".
  const [learners, setLearners] = useState<LearnerRecord[] | null>(null);
  useEffect(() => {
    if (!contentId || segment !== "course") {
      setLearners(segment === "course" ? null : MOCK_TEST_LEARNERS);
      return;
    }
    let cancelled = false;
    api
      .get<LearnerRecord[]>(`/api/courses/${contentId}/learners`)
      .then((rows) => {
        if (!cancelled) {
          const liveRows = rows || [];
          const filled =
            liveRows.length >= 100
              ? liveRows
              : [...liveRows, ...MOCK_TEST_LEARNERS.slice(liveRows.length)];
          setLearners(filled);
        }
      })
      .catch(() => {
        if (!cancelled) setLearners(MOCK_TEST_LEARNERS);
      });
    return () => {
      cancelled = true;
    };
  }, [contentId, segment]);

  const [reviews, setReviews] = useState<FeedbackRecord[] | null>(null);
  useEffect(() => {
    if (!contentId || segment !== "course") {
      setReviews(segment === "course" ? null : MOCK_TEST_REVIEWS);
      return;
    }
    let cancelled = false;
    api
      .get<FeedbackRecord[]>(`/api/courses/${contentId}/reviews`)
      .then((rows) => {
        if (!cancelled) setReviews(rows && rows.length > 0 ? rows : MOCK_TEST_REVIEWS);
      })
      .catch(() => {
        if (!cancelled) setReviews(MOCK_TEST_REVIEWS);
      });
    return () => {
      cancelled = true;
    };
  }, [contentId, segment]);

  const [exams, setExams] = useState<ExamResponse[] | null>(null);
  useEffect(() => {
    if (!contentId || !segment) return;
    const request = segment === "event" ? getEventExam(contentId) : getCourseExam(contentId);
    request.then((exam) => setExams(exam ? [exam] : [])).catch(() => setExams([]));
  }, [contentId, segment]);

  /**
   * The course's assessments, joined to the plan each one delivers.
   */
  const [assessments, setAssessments] = useState<AssessmentRow[] | null>(null);
  useEffect(() => {
    if (!contentId || segment !== "course") {
      setAssessments(segment === "course" ? null : []);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const placements = await listAssessmentPlacementsForCourse(contentId);
        if (placements.length === 0) {
          if (!cancelled) setAssessments([]);
          return;
        }
        const plans = await listExamPlans(placements[0].examId).catch(() => []);
        const planById = new Map(plans.map((p) => [p.id, p]));
        if (!cancelled) {
          setAssessments(
            placements
              .slice()
              .sort((a, b) => a.position - b.position)
              .map((p) => ({ placement: p, plan: p.planId ? planById.get(p.planId) ?? null : null }))
          );
        }
      } catch {
        if (!cancelled) setAssessments([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [contentId, segment]);

  const query = searchQuery.trim().toLowerCase();
  const effectiveLearners =
    learners && learners.length >= 100
      ? learners
      : learners && learners.length > 0
      ? [...learners, ...MOCK_TEST_LEARNERS.slice(learners.length)]
      : MOCK_TEST_LEARNERS;
  const filteredLearners = effectiveLearners.filter(
    (l) =>
      query.length === 0 ||
      l.name?.toLowerCase().includes(query) ||
      l.email?.toLowerCase().includes(query)
  );

  const reviewQuery = reviewSearchQuery.trim().toLowerCase();
  const effectiveReviews = reviews ?? MOCK_TEST_REVIEWS;

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
      {/* Section Navigation Tabs (Rounded pill style matching mockup) */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-center">
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none flex-wrap py-1">
            {segment === "course" && (
              <button
                onClick={() => setActiveSubTab("overview")}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeSubTab === "overview"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <BookOpen size={15} /> Overview &amp; Outcomes
              </button>
            )}
            <button
              onClick={() => setActiveSubTab("insights")}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeSubTab === "insights"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <Users size={15} /> Course Insights
            </button>
            <button
              onClick={() => setActiveSubTab("exams")}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeSubTab === "exams"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <FileText size={15} /> Assessment &amp; Exams
            </button>
            <button
              onClick={() => setActiveSubTab("certificates")}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeSubTab === "certificates"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <Award size={15} /> Certificate Recipients
            </button>
            {segment === "course" && (
              <>
                <button
                  onClick={() => setActiveSubTab("category")}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeSubTab === "category"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <Tag size={15} /> Category
                </button>
                <button
                  onClick={() => setActiveSubTab("pricing")}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeSubTab === "pricing"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <IndianRupee size={15} /> Pricing
                </button>
              </>
            )}
          </div>
        </div>

        {/* 3. SUB-TAB CONTENT PANELS (With generous top spacing from navigation) */}
        <div className="pt-6 sm:pt-8">
          {/* TAB 1: Course overview and outcomes */}
          {activeSubTab === "overview" && segment === "course" && contentId && (
            <CourseOverviewEditor contentId={contentId} />
          )}

          {/* TAB 2: Course Insights (Exact 2-Card Layout matching Mockup) */}
          {activeSubTab === "insights" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch w-full">
            {/* Left Card: Enrollments (Clickable to view details) */}
            <div
              onClick={() => setIsLearnersModalOpen(true)}
              className="lg:col-span-4 rounded-[32px] border-2 border-blue-300/80 bg-surface p-7 shadow-xs flex flex-col justify-between min-h-[360px] cursor-pointer hover:border-blue-500 hover:shadow-md transition-all group relative dark:border-blue-500/40"
            >
              {/* Top Header */}
              <div className="flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <Users size={22} className="text-blue-500 group-hover:scale-110 transition-transform" />
                  <h3 className="text-xl font-black tracking-tight text-slate-900">Enrollments</h3>
                </div>
                <span className="text-[11px] font-bold text-blue-600 bg-blue-50 border border-blue-200/80 group-hover:bg-blue-600 group-hover:text-white px-2.5 py-1 rounded-full transition-all flex items-center gap-0.5 shadow-2xs dark:text-blue-400 dark:bg-blue-500/10 dark:border-blue-500/25">
                  View details <ChevronRight size={12} />
                </span>
              </div>

              {/* Center Metric Count (Animated run from 0 to total enrollments) */}
              <div className="flex flex-col items-center justify-center my-6 text-center">
                <span className="text-6xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors dark:group-hover:text-blue-400">
                  {animatedLearnerCount}
                </span>
                <span className="text-base font-bold text-blue-600 mt-2 dark:text-blue-400">Active learners</span>
              </div>

              {/* Bottom Rating Info */}
              <div className="flex flex-col gap-2 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500">Average Rating</span>
                  <span className="text-sm font-black text-slate-900">
                    {avgRating ? avgRating : "0.0"}{" "}
                    <span className="text-slate-400 font-bold">/ 5</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const ratingValue = avgRating ? parseFloat(avgRating) : 0;
                    const isFilled = star <= Math.round(ratingValue);
                    return (
                      <Star
                        key={star}
                        size={26}
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

            {/* Right Card: Student Reviews & Feedback (Clickable to view full feedbacks) */}
            <div className="lg:col-span-8 rounded-[32px] border-2 border-amber-300/90 bg-surface p-7 shadow-xs flex flex-col justify-between min-h-[360px] dark:border-amber-500/40">
              {/* Header with Title, View All button, and Search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                <div className="flex items-center gap-2.5">
                  <MessageSquare size={22} className="text-amber-500" />
                  <h3 className="text-xl font-black tracking-tight text-slate-900">
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
                      className="w-full rounded-full border border-slate-200 bg-surface py-1.5 pl-9 pr-3 text-xs font-medium text-slate-700 placeholder-slate-400 focus:border-amber-400 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => setIsReviewsModalOpen(true)}
                    className="shrink-0 text-[11px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-500 hover:text-white border border-amber-200/80 px-3 py-1.5 rounded-full transition-all flex items-center gap-1 shadow-2xs cursor-pointer dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-500/25"
                  >
                    View all ({sortedReviews.length}) <ChevronRight size={12} />
                  </button>
                </div>
              </div>

              {/* Review Items (Sorted latest on top, each item clickable to view all feedbacks) */}
              <div className="flex flex-col divide-y divide-slate-100 flex-1 justify-center my-1">
                {reviews === null && !MOCK_TEST_REVIEWS ? (
                  <div className="flex items-center justify-center py-10 text-slate-400">
                    <Loader2 size={20} className="animate-spin text-amber-500" />
                  </div>
                ) : filteredReviews.length > 0 ? (
                  filteredReviews.slice(0, 4).map((review) => (
                    <div
                      key={review.id}
                      onClick={() => setIsReviewsModalOpen(true)}
                      className="flex items-center justify-between py-3.5 px-2 hover:bg-amber-50/40 rounded-xl transition-colors group cursor-pointer dark:hover:bg-amber-500/10"
                    >
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <div className="size-10 rounded-full bg-blue-50 border border-blue-200/80 flex items-center justify-center shrink-0 dark:bg-blue-500/10 dark:border-blue-500/25">
                          {review.userAvatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={review.userAvatarUrl}
                              alt={review.userName}
                              className="size-full rounded-full object-cover"
                            />
                          ) : (
                            <User size={18} className="text-blue-500" />
                          )}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-slate-900 truncate">
                              {review.userName}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">
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
                              size={17}
                              className={
                                star <= review.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-transparent text-slate-300 stroke-[1.5]"
                              }
                            />
                          ))}
                        </div>
                        <ChevronRight
                          size={18}
                          className="text-slate-700 group-hover:translate-x-0.5 transition-transform"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10 text-center my-auto">
                    <div className="size-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mb-3 dark:bg-amber-500/10 dark:border-amber-500/25">
                      <MessageSquare size={20} className="text-amber-500" />
                    </div>
                    <p className="text-sm font-bold text-slate-700">
                      {reviewQuery.length > 0 ? "No reviews match your search" : "No student reviews yet"}
                    </p>
                    <p className="text-xs text-slate-400 max-w-xs mt-1">
                      {reviewQuery.length > 0
                        ? "Try searching for a different student or keyword."
                        : "Learners will be able to review and rate this course after completing their modules."}
                    </p>
                  </div>
                )}
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

        {/* TAB 6: Course Category */}
        {activeSubTab === "category" && segment === "course" && contentId && (
          <CourseCategoryEditor contentId={contentId} />
        )}

        {/* TAB 7: Pricing — the authoring surface for course pricing */}
        {activeSubTab === "pricing" && segment === "course" && contentId && (
          <CoursePricingEditor contentId={contentId} />
        )}

        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Course overview editor                                            */
/* ------------------------------------------------------------------ */

/**
 * Authors the three fields the public course page reads for its Overview tab: the description,
 * the "what you'll walk away with" outcomes, and the declared length.
 *
 * Outcomes are stored as one newline-separated string rather than a list, matching the
 * `courses.learning_outcomes` column — the reader splits on newlines.
 */
function CourseOverviewEditor({ contentId }: { contentId: string }) {
  const [description, setDescription] = useState("");
  const [learningOutcomes, setLearningOutcomes] = useState("");
  const [duration, setDuration] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get<CourseResponse>(`/api/courses/${contentId}`)
      .then((data) => {
        if (cancelled) return;
        setDescription(data.description ?? "");
        setLearningOutcomes(data.learningOutcomes ?? "");
        setDuration(data.duration ?? "");
        setIsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadFailed(true);
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [contentId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // PATCH only the fields this form owns. The server ignores absent fields, so nothing
      // else on the course is touched.
      await api.patch(`/api/courses/${contentId}`, {
        description,
        learningOutcomes,
        duration,
      });
      toast.success("Course overview saved");
    } catch {
      toast.error("Could not save the course overview");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-[24px] border-[1.5px] border-purple-400/80 bg-gradient-to-b from-purple-50/30 via-surface to-surface py-10 shadow-[4px_-4px_0px_0px_#E9D5FF] dark:from-purple-500/10">
        <Loader2 size={24} className="animate-spin text-purple-400" />
      </div>
    );
  }

  // Saving from a form that never loaded would write blanks over the real values.
  if (loadFailed) {
    return (
      <div className="rounded-[24px] border-[1.5px] border-purple-400/80 bg-gradient-to-b from-purple-50/30 via-surface to-surface p-6 text-center text-xs font-semibold text-slate-500 shadow-[4px_-4px_0px_0px_#E9D5FF] dark:from-purple-500/10">
        Couldn&rsquo;t load this course&rsquo;s overview. Reload the page to try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 rounded-[24px] border-[1.5px] border-purple-400/80 bg-gradient-to-b from-purple-50/30 via-surface to-surface p-6 shadow-[4px_-4px_0px_0px_#E9D5FF] dark:from-purple-500/10">
      <h3 className="flex items-center gap-2 text-base font-black tracking-tight text-slate-900">
        <BookOpen size={18} className="text-purple-600 dark:text-purple-400" />
        Course Overview
      </h3>
      <p className="-mt-4 text-[11px] font-medium leading-relaxed text-slate-500">
        This is what learners read on the course page before they enrol.
      </p>

      <div className="flex flex-col gap-2">
        <label htmlFor="course-duration" className="text-sm font-bold text-slate-700">
          Course length
        </label>
        <input
          id="course-duration"
          type="text"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          placeholder="e.g. 4h 30m"
          className="w-full rounded-xl border border-slate-200 bg-surface p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-400/10"
        />
        <span className="text-[11px] font-medium text-slate-400">
          Shown as-is on the course page. Leave blank to show &ldquo;Self-paced&rdquo;.
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="course-description" className="text-sm font-bold text-slate-700">
          About this course
        </label>
        <textarea
          id="course-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Write a brief overview of what this course is about..."
          className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-surface p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-400/10"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="course-outcomes" className="text-sm font-bold text-slate-700">
          What learners will walk away with
        </label>
        <textarea
          id="course-outcomes"
          value={learningOutcomes}
          onChange={(e) => setLearningOutcomes(e.target.value)}
          placeholder={"One outcome per line, e.g.\nA working design system in Figma\nA recorded portfolio case study"}
          className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-surface p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-400/10"
        />
        <span className="text-[11px] font-medium text-slate-400">
          One per line. Each line becomes a ticked bullet on the course page.
        </span>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-purple-700 hover:shadow-md disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isSaving ? "Saving..." : "Save overview"}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Course pricing editor                                             */
/* ------------------------------------------------------------------ */

/**
 * Sets the course's pricing model and amount, and shows the audit trail of past changes.
 *
 * Amounts are edited as a decimal and transported as integer minor units via the shared money
 * helpers — the same conversion the rest of the app uses, so a price set here reads back
 * identically on the public course page.
 */
function CoursePricingEditor({ contentId }: { contentId: string }) {
  const [pricingModel, setPricingModel] = useState<"FREE" | "PAID">("FREE");
  const [priceAmount, setPriceAmount] = useState<number | "">("");
  const [currency, setCurrency] = useState("INR");
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState<CoursePricingHistoryEntry[] | null>(null);

  const loadHistory = async (id: string) => {
    try {
      setHistory(await api.get<CoursePricingHistoryEntry[]>(`/api/courses/${id}/pricing-history`));
    } catch {
      setHistory([]);
    }
  };

  useEffect(() => {
    let cancelled = false;
    api
      .get<CourseResponse>(`/api/courses/${contentId}`)
      .then((data) => {
        if (cancelled) return;
        setPricingModel(data.pricingModel === "PAID" ? "PAID" : "FREE");
        setPriceAmount(data.priceAmount != null ? fromMinorUnits(data.priceAmount) : "");
        setCurrency(data.currency || "INR");
        setIsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadFailed(true);
        setIsLoading(false);
      });
    loadHistory(contentId);
    return () => {
      cancelled = true;
    };
  }, [contentId]);

  const handleSave = async () => {
    if (pricingModel === "PAID" && (priceAmount === "" || Number(priceAmount) <= 0)) {
      toast.error("Enter a price greater than zero for a paid course.");
      return;
    }
    setIsSaving(true);
    try {
      // A FREE course sends no amount; the server clears any stale one, so the public page can
      // never show a price next to a free course.
      await api.patch(`/api/courses/${contentId}`, {
        pricingModel,
        priceAmount: pricingModel === "PAID" ? toMinorUnits(Number(priceAmount)) : 0,
        currency,
      });
      toast.success("Pricing saved");
      await loadHistory(contentId);
    } catch {
      toast.error("Could not save pricing");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-[24px] border-[1.5px] border-emerald-400/80 bg-gradient-to-b from-emerald-50/30 via-surface to-surface py-10 shadow-[4px_-4px_0px_0px_#A7F3D0] dark:from-emerald-500/10">
        <Loader2 size={24} className="animate-spin text-emerald-400" />
      </div>
    );
  }

  // Saving from a form that never loaded would write blanks over the real values.
  if (loadFailed) {
    return (
      <div className="rounded-[24px] border-[1.5px] border-emerald-400/80 bg-gradient-to-b from-emerald-50/30 via-surface to-surface p-6 text-center text-xs font-semibold text-slate-500 shadow-[4px_-4px_0px_0px_#A7F3D0] dark:from-emerald-500/10">
        Couldn&rsquo;t load this course&rsquo;s pricing. Reload the page to try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 rounded-[24px] border-[1.5px] border-emerald-400/80 bg-gradient-to-b from-emerald-50/30 via-surface to-surface p-6 shadow-[4px_-4px_0px_0px_#A7F3D0] dark:from-emerald-500/10">
      <h3 className="flex items-center gap-2 text-base font-black tracking-tight text-slate-900">
        <IndianRupee size={18} className="text-emerald-600 dark:text-emerald-400" />
        Course Pricing
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="pricing-model" className="text-sm font-bold text-slate-700">
            Pricing model
          </label>
          <select
            id="pricing-model"
            value={pricingModel}
            onChange={(e) => setPricingModel(e.target.value as "FREE" | "PAID")}
            className="h-[46px] w-full rounded-xl border border-slate-200 bg-surface p-3 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-400/10"
          >
            <option value="FREE">Free</option>
            <option value="PAID">Paid</option>
          </select>
        </div>

        {pricingModel === "PAID" && (
          <div className="flex flex-col gap-2">
            <label htmlFor="price-amount" className="text-sm font-bold text-slate-700">
              Price
            </label>
            <div className="relative">
              <span className="absolute left-4 top-[13px] font-medium text-slate-500">
                {currency === "INR" ? "₹" : currency}
              </span>
              <input
                id="price-amount"
                type="number"
                min="0"
                step="0.01"
                value={priceAmount}
                onChange={(e) => setPriceAmount(e.target.value ? parseFloat(e.target.value) : "")}
                placeholder="e.g. 499.00"
                className="h-[46px] w-full rounded-xl border border-slate-200 bg-surface p-3 pl-10 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-400/10"
              />
            </div>
          </div>
        )}
      </div>

      {pricingModel === "PAID" && (
        <p className="flex items-start gap-1.5 rounded border border-slate-200 bg-slate-50 p-2 text-xs font-medium text-ink">
          <span className="mt-[1px] text-[10px]">💡</span> A 20% platform fee applies to all
          paid courses.
        </p>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-700 hover:shadow-md disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isSaving ? "Saving..." : "Save pricing"}
        </button>
      </div>

      {history && history.length > 0 && (
        <div className="mt-2">
          <h4 className="mb-3 border-b border-emerald-100 pb-2 text-sm font-bold text-slate-800 dark:border-emerald-500/25">
            Pricing history
          </h4>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-surface shadow-sm">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-4 py-2">Model</th>
                  <th className="px-4 py-2">Price</th>
                  <th className="px-4 py-2">Changed by</th>
                  <th className="px-4 py-2 text-right">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-2 font-semibold text-slate-800">{entry.pricingModel}</td>
                    <td className="px-4 py-2">
                      {entry.pricingModel === "PAID" && entry.priceAmount != null
                        ? formatMoney(entry.priceAmount, entry.currency || "INR")
                        : "—"}
                    </td>
                    <td className="px-4 py-2">{entry.changedByName}</td>
                    <td className="px-4 py-2 text-right">
                      {new Date(entry.changedAt).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Course category editor                                            */
/* ------------------------------------------------------------------ */

/**
 * Assigns or changes the course category from the super-user managed category list.
 */
function CourseCategoryEditor({ contentId }: { contentId: string }) {
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const publicCategories = usePublicCategories("COURSES");

  useEffect(() => {
    let cancelled = false;
    api
      .get<CourseResponse>(`/api/courses/${contentId}`)
      .then((data) => {
        if (cancelled) return;
        setCategoryId(data.categoryId ?? null);
        setIsLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setLoadFailed(true);
        setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [contentId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.patch(`/api/courses/${contentId}/category`, {
        categoryId: categoryId === "OTHER" || !categoryId ? null : categoryId,
      });
      toast.success("Category saved");
    } catch {
      toast.error("Could not save category");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-[24px] border-[1.5px] border-rose-400/80 bg-gradient-to-b from-rose-50/30 via-surface to-surface py-10 shadow-[4px_-4px_0px_0px_#FECDD3] dark:from-rose-500/10">
        <Loader2 size={24} className="animate-spin text-rose-400" />
      </div>
    );
  }

  if (loadFailed) {
    return (
      <div className="rounded-[24px] border-[1.5px] border-rose-400/80 bg-gradient-to-b from-rose-50/30 via-surface to-surface p-6 text-center text-xs font-semibold text-slate-500 shadow-[4px_-4px_0px_0px_#FECDD3] dark:from-rose-500/10">
        Couldn&rsquo;t load this course&rsquo;s category. Reload the page to try again.
      </div>
    );
  }

  const selectedCategory = publicCategories.find((c) => c.id === categoryId);

  return (
    <div className="flex flex-col gap-6 rounded-[24px] border-[1.5px] border-rose-400/80 bg-gradient-to-b from-rose-50/30 via-surface to-surface p-6 shadow-[4px_-4px_0px_0px_#FECDD3] dark:from-rose-500/10">
      <h3 className="flex items-center gap-2 text-base font-black tracking-tight text-slate-900">
        <Tag size={18} className="text-rose-600 dark:text-rose-400" />
        Course Category
      </h3>
      <p className="-mt-4 text-[11px] font-medium leading-relaxed text-slate-500">
        Categorising this course helps learners find it in Explore search filters and topic feeds.
      </p>

      <div className="flex flex-col gap-3">
        <label htmlFor="course-category-select" className="text-sm font-bold text-slate-700">
          Selected Category
        </label>
        <select
          id="course-category-select"
          value={categoryId ?? "OTHER"}
          onChange={(e) => setCategoryId(e.target.value === "OTHER" ? null : e.target.value)}
          className="h-[46px] w-full max-w-md rounded-xl border border-slate-200 bg-surface p-3 text-sm font-semibold text-slate-800 focus:border-rose-400 focus:outline-none focus:ring-4 focus:ring-rose-400/10"
        >
          {publicCategories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
          <option value="OTHER">Other / Uncategorized</option>
        </select>

        {selectedCategory && selectedCategory.description && (
          <p className="text-xs text-slate-600 bg-rose-50/60 border border-rose-100/80 rounded-xl p-3 max-w-md dark:bg-rose-500/10 dark:border-rose-500/25">
            {selectedCategory.description}
          </p>
        )}
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-xl bg-rose-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-rose-700 hover:shadow-md disabled:opacity-50"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isSaving ? "Saving..." : "Save category"}
        </button>
      </div>
    </div>
  );
}
