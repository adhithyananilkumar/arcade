"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Star, Award, CheckCircle2, Radio, FileText, Search, MessageSquare, BookOpen, IndianRupee, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/infrastructure/http/api";
import type { CourseResponse } from "@/shared/types/api.types";
import { formatMoney, fromMinorUnits, toMinorUnits } from "@/shared/utils/money";
import {
  listAssessmentPlacementsForCourse,
  listExamPlans,
  listExamsForCourse,
  listExamsForEvent,
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

export function LearnersAnalyticsSection({
  contentId,
  segment,
}: {
  contentId?: string;
  segment?: ContentTypeSegment | null;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSubTab, setActiveSubTab] = useState<
    "learners" | "exams" | "feedback" | "certificates" | "overview" | "pricing"
  >("learners");

  // `null` means "still loading" throughout this component; `[]` means "loaded, and empty".
  const [learners, setLearners] = useState<LearnerRecord[] | null>(null);
  useEffect(() => {
    if (!contentId || segment !== "course") {
      setLearners(segment === "course" ? null : []);
      return;
    }
    let cancelled = false;
    api
      .get<LearnerRecord[]>(`/api/courses/${contentId}/learners`)
      .then((rows) => {
        if (!cancelled) setLearners(rows);
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
      setReviews(segment === "course" ? null : []);
      return;
    }
    let cancelled = false;
    api
      .get<FeedbackRecord[]>(`/api/courses/${contentId}/reviews`)
      .then((rows) => {
        if (!cancelled) setReviews(rows);
      })
      .catch(() => {
        if (!cancelled) setReviews([]);
      });
    return () => {
      cancelled = true;
    };
  }, [contentId, segment]);

  const [exams, setExams] = useState<ExamResponse[] | null>(null);
  useEffect(() => {
    if (!contentId || !segment) return;
    const request = segment === "event" ? listExamsForEvent(contentId) : listExamsForCourse(contentId);
    request.then(setExams).catch(() => setExams([]));
  }, [contentId, segment]);

  /**
   * The course's assessments, joined to the plan each one delivers.
   *
   * A course has one exam content item; each assessment is a plan on it. Listing exams here would
   * therefore show a single row saying nothing useful, and the exam's own legacy `questionCount`
   * field is a pre-plans leftover that reads 25 for everything. The real per-assessment facts —
   * paper size, duration, attempts, pass mark, outcome — all live on the plan.
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
        // Every placement shares the course's one exam, so a single plan fetch covers them all.
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
  const filteredLearners = (learners ?? []).filter(
    (l) =>
      query.length === 0 ||
      l.name?.toLowerCase().includes(query) ||
      l.email?.toLowerCase().includes(query)
  );

  return (
    <div className="flex flex-col gap-6">
      {/* Section Navigation Tabs (Middle Portion Centered) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-none flex-wrap">
            <button
              onClick={() => setActiveSubTab("learners")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                activeSubTab === "learners"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Users size={14} /> Enrolled Students {learners?.length ?? 0}
            </button>
            <button
              onClick={() => setActiveSubTab("exams")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                activeSubTab === "exams"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <FileText size={14} /> Assessment & Exams
            </button>
            <button
              onClick={() => setActiveSubTab("feedback")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                activeSubTab === "feedback"
                  ? "bg-amber-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <MessageSquare size={14} /> Reviews & Feedbacks
            </button>
            <button
              onClick={() => setActiveSubTab("certificates")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                activeSubTab === "certificates"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Award size={14} /> Certificate Recipients
            </button>
            {segment === "course" && (
              <>
                <button
                  onClick={() => setActiveSubTab("overview")}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                    activeSubTab === "overview"
                      ? "bg-purple-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <BookOpen size={14} /> Overview & Outcomes
                </button>
                <button
                  onClick={() => setActiveSubTab("pricing")}
                  className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                    activeSubTab === "pricing"
                      ? "bg-emerald-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <IndianRupee size={14} /> Pricing
                </button>
              </>
            )}
          </div>
        </div>

        {/* 3. SUB-TAB CONTENT PANELS */}

        {/* TAB 1: Enrolled Learners & Live Active List */}
        {activeSubTab === "learners" && (
          <div className="rounded-[24px] border-[1.5px] border-blue-400/80 bg-gradient-to-b from-blue-50/30 via-white to-white p-6 shadow-[4px_-4px_0px_0px_#BFDBFE] flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h3 className="text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
                <Users size={18} className="text-blue-600" />
                Enrolled Students Roster
              </h3>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 rounded-xl border border-slate-200 bg-white py-1.5 pl-9 pr-3 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-blue-100 text-[10px] font-black uppercase tracking-wider text-blue-600">
                    <th className="py-3 px-3">Student</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Course Progress</th>
                    <th className="py-3 px-3 text-right">Enrolled Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLearners.map((learner) => (
                    <tr key={learner.userId} className="hover:bg-blue-50/50 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="relative grid size-9 shrink-0 place-items-center rounded-full bg-slate-900 text-white font-black text-xs">
                            {learner.name.charAt(0)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-extrabold text-slate-900 truncate">{learner.name}</span>
                            <span className="text-[11px] font-medium text-slate-400 truncate">{learner.email}</span>
                          </div>
                        </div>
                      </td>
                      {/* There is no presence signal on the platform, so there is no honest
                          "live now" state to show — status is the learner's real progress. */}
                      <td className="py-3.5 px-3">
                        {learner.status === "Completed" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 px-2.5 py-0.5 text-[10px] font-black uppercase">
                            <CheckCircle2 size={10} className="text-blue-600" /> Completed
                          </span>
                        ) : learner.status === "Ongoing" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-black uppercase">
                            <Radio size={10} className="text-emerald-600" /> In Progress
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-[10px] font-black uppercase">
                            Not started
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 min-w-[160px]">
                        <div className="flex items-center gap-3">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-300"
                              style={{ width: `${learner.progressPercentage}%` }}
                            />
                          </div>
                          <span className="font-black text-slate-700 text-[11px] w-8 text-right">
                            {learner.progressPercentage}%
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-right font-extrabold text-slate-500">
                        {learner.enrolledAt
                          ? new Date(learner.enrolledAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {learners === null && (
                <div className="flex items-center justify-center py-10 text-slate-400">
                  <Loader2 size={18} className="animate-spin" />
                </div>
              )}
              {learners !== null && filteredLearners.length === 0 && (
                <p className="rounded-2xl border border-dashed border-blue-200 bg-white px-4 py-8 text-center text-xs font-semibold text-slate-500">
                  {query.length > 0
                    ? "No learners match that search."
                    : "No one has enrolled in this course yet."}
                </p>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Real attached exams — no fabricated pass-rate/avg-score numbers. Attempt-level
             stats live in each exam's own "Attempts & Results" tab, not summarized here. */}
        {activeSubTab === "exams" && (
          <div className="rounded-[24px] border-[1.5px] border-indigo-400/80 bg-gradient-to-b from-indigo-50/30 via-white to-white p-6 shadow-[4px_-4px_0px_0px_#C7D2FE] flex flex-col gap-4">
            <h3 className="text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
              <FileText size={18} className="text-indigo-600" />
              Assessments & Exams
            </h3>
            {segment === "course" && (
              <p className="-mt-1 text-[11px] font-medium leading-relaxed text-slate-500">
                Every assessment in this course runs on one exam and one question bank. What makes
                them differ is the plan each delivers — its question selection, timing, attempts,
                pass mark and outcome.
              </p>
            )}

            {assessments === null && exams === null ? (
              <div className="flex items-center justify-center py-10 text-slate-400">
                <Loader2 size={18} className="animate-spin" />
              </div>
            ) : (assessments?.length ?? 0) === 0 && (exams?.length ?? 0) === 0 ? (
              <p className="rounded-2xl border border-dashed border-indigo-200 bg-white px-4 py-8 text-center text-xs font-semibold text-slate-500">
                No assessments yet. Add one from the content editor — &ldquo;Add assessment&rdquo;
                inside any module.
              </p>
            ) : (assessments?.length ?? 0) > 0 ? (
              <div className="flex flex-col gap-2">
                {assessments!.map(({ placement, plan }) => {
                  const parentQuery = contentId
                    ? segment === "course"
                      ? `?courseId=${contentId}`
                      : segment === "event"
                        ? `?eventId=${contentId}`
                        : ""
                    : "";
                  return (
                    <Link
                      key={placement.id}
                      href={`/studio/content/exam/${placement.examId}${parentQuery}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-indigo-200/70 bg-white px-4 py-3 transition-colors hover:bg-indigo-50/50"
                    >
                      <div className="min-w-0">
                        <span className="block truncate text-xs font-black text-slate-900">
                          {placement.titleOverride ?? plan?.name ?? "Assessment"}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400">
                          {placement.hostType === "COURSE_MODULE" ? "In a module" : "Course level"}
                          {plan
                            ? ` · ${plan.totalQuestions} question${plan.totalQuestions === 1 ? "" : "s"} · ${plan.durationMinutes} min · pass ${plan.passPercentage}%`
                            : " · uses the default plan"}
                        </span>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-1.5">
                        {placement.requiredForCompletion && (
                          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-amber-700">
                            Required
                          </span>
                        )}
                        {plan && plan.outcome !== "NONE" && (
                          <span className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-violet-700">
                            {plan.outcome === "CERTIFICATE"
                              ? "Certification"
                              : plan.outcome === "GRADE_CARD"
                                ? "Grade card"
                                : "Completion"}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              // Events still list exams directly — assessments inside event days aren't supported
              // yet, so there is no placement list to show there.
              <div className="flex flex-col gap-2">
                {exams!.map((exam) => {
                  const parentQuery = contentId
                    ? segment === "course"
                      ? `?courseId=${contentId}`
                      : segment === "event"
                        ? `?eventId=${contentId}`
                        : ""
                    : "";
                  return (
                    <Link
                      key={exam.id}
                      href={`/studio/content/exam/${exam.id}${parentQuery}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-indigo-200/70 bg-white px-4 py-3 transition-colors hover:bg-indigo-50/50"
                    >
                      <div className="min-w-0">
                        <span className="block truncate text-xs font-black text-slate-900">{exam.title}</span>
                        <span className="text-[11px] font-medium text-slate-400">
                          {exam.purpose ?? "Assessment"}
                        </span>
                      </div>
                      <span className="flex-shrink-0 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-indigo-700">
                        {exam.wasPublished ? "Published" : "Draft"}
                      </span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Ratings & Student Feedbacks */}
        {activeSubTab === "feedback" && (
          <div className="rounded-[24px] border-[1.5px] border-amber-400/80 bg-gradient-to-b from-amber-50/30 via-white to-white p-6 shadow-[4px_-4px_0px_0px_#FDE68A] flex flex-col gap-4">
            <h3 className="text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
              <MessageSquare size={18} className="text-amber-600" />
              Student Reviews & Course Feedback
            </h3>
            {reviews === null ? (
              <div className="flex items-center justify-center py-10 text-slate-400">
                <Loader2 size={18} className="animate-spin" />
              </div>
            ) : reviews.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-amber-200 bg-white px-4 py-8 text-center text-xs font-semibold text-slate-500">
                No reviews yet. Learners are asked to rate the course when they complete it.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {reviews.map((review) => (
                  <div key={review.id} className="flex flex-col gap-2 p-4 rounded-2xl border border-amber-200/80 bg-white shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="grid size-8 place-items-center overflow-hidden rounded-full bg-amber-500 text-white font-black text-xs">
                          {review.userAvatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={review.userAvatarUrl} alt={review.userName} className="size-full object-cover" />
                          ) : (
                            (review.userName || "?").charAt(0).toUpperCase()
                          )}
                        </div>
                        <span className="text-xs font-black text-slate-900">{review.userName}</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500" aria-label={`${review.rating} out of 5`}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={13}
                            className={star <= review.rating ? "fill-amber-400 text-amber-400" : "fill-transparent text-slate-300"}
                          />
                        ))}
                        <span className="ml-1 text-xs font-black text-slate-700">{review.rating}.0</span>
                      </div>
                    </div>
                    {review.reviewText && (
                      <p className="pl-11 text-xs font-medium italic text-slate-600">&ldquo;{review.reviewText}&rdquo;</p>
                    )}
                    <span className="self-end text-[10px] font-bold text-slate-400">
                      {new Date(review.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: Certificate Recipients */}
        {activeSubTab === "certificates" && (
          <div className="rounded-[24px] border-[1.5px] border-emerald-400/80 bg-gradient-to-b from-emerald-50/30 via-white to-white p-6 shadow-[4px_-4px_0px_0px_#A7F3D0] flex flex-col gap-4">
            <h3 className="text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
              <Award size={18} className="text-emerald-600" />
              Verified Certificate Graduates
            </h3>
            {/* Certificate issuance has no backend yet — there is no endpoint to read graduates
                from. An empty table or a "0 issued" figure would both read as a measurement;
                this says plainly that the feature is not wired up. */}
            <p className="rounded-2xl border border-dashed border-emerald-200 bg-white px-4 py-8 text-center text-xs font-semibold text-slate-500">
              Certificate issuance isn&rsquo;t available yet. Once it ships, graduates of this
              course will be listed here.
            </p>
          </div>
        )}

        {/* TAB 5: Course overview and pricing — the authoring surfaces for what the public
            course page shows. Courses only; events price through their own workspace. */}
        {activeSubTab === "overview" && segment === "course" && contentId && (
          <CourseOverviewEditor contentId={contentId} />
        )}

        {activeSubTab === "pricing" && segment === "course" && contentId && (
          <CoursePricingEditor contentId={contentId} />
        )}

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
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api
      .get<CourseResponse>(`/api/courses/${contentId}`)
      .then((data) => {
        if (cancelled) return;
        setDescription(data.description ?? "");
        setLearningOutcomes(data.learningOutcomes ?? "");
        setDuration(data.duration ?? "");
        setCoverImageUrl(data.coverImageUrl ?? "");
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

  /**
   * Three-step upload, matching the rest of the app: presign, PUT through the internal proxy
   * (the storage origin does not allow browser CORS), then register the object's metadata.
   * The URL is only held in form state — it is persisted by "Save overview" like every other
   * field here.
   */
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { key, uploadUrl, publicUrl } = await api.post<{
        key: string;
        uploadUrl: string;
        publicUrl: string;
      }>("/api/media/presign", { fileName: file.name, contentType: file.type });

      const formData = new FormData();
      formData.append("file", file);
      formData.append("uploadUrl", uploadUrl);
      const uploadRes = await fetch("/api/internal/media/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("Upload failed");

      await api.post("/api/media/metadata", {
        key,
        fileName: file.name,
        contentType: file.type,
        sizeBytes: file.size,
      });

      setCoverImageUrl(publicUrl);
      toast.success("Image uploaded. Save the overview to apply it.");
    } catch {
      toast.error("Could not upload that image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // PATCH only the fields this form owns. The server ignores absent fields, so nothing
      // else on the course is touched.
      await api.patch(`/api/courses/${contentId}`, {
        description,
        learningOutcomes,
        duration,
        coverImageUrl,
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
      <div className="flex items-center justify-center rounded-[24px] border-[1.5px] border-purple-400/80 bg-gradient-to-b from-purple-50/30 via-white to-white py-10 shadow-[4px_-4px_0px_0px_#E9D5FF]">
        <Loader2 size={24} className="animate-spin text-purple-400" />
      </div>
    );
  }

  // Saving from a form that never loaded would write blanks over the real values.
  if (loadFailed) {
    return (
      <div className="rounded-[24px] border-[1.5px] border-purple-400/80 bg-gradient-to-b from-purple-50/30 via-white to-white p-6 text-center text-xs font-semibold text-slate-500 shadow-[4px_-4px_0px_0px_#E9D5FF]">
        Couldn&rsquo;t load this course&rsquo;s overview. Reload the page to try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 rounded-[24px] border-[1.5px] border-purple-400/80 bg-gradient-to-b from-purple-50/30 via-white to-white p-6 shadow-[4px_-4px_0px_0px_#E9D5FF]">
      <h3 className="flex items-center gap-2 text-base font-black tracking-tight text-slate-900">
        <BookOpen size={18} className="text-purple-600" />
        Course Overview
      </h3>
      <p className="-mt-4 text-[11px] font-medium leading-relaxed text-slate-500">
        This is what learners read on the course page before they enrol.
      </p>

      <div className="flex flex-col gap-2">
        <label htmlFor="course-cover" className="text-sm font-bold text-slate-700">
          Cover image
        </label>
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <input
              id="course-cover"
              type="file"
              accept="image/*"
              onChange={handleCoverUpload}
              disabled={isUploading}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-sm text-slate-800 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-bold file:text-slate-700 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-400/10 disabled:opacity-60"
            />
            <span className="mt-1 block text-[11px] font-medium text-slate-400">
              {isUploading ? "Uploading\u2026" : "Shown on the course card and the course page."}
            </span>
          </div>
          {coverImageUrl && (
            <div className="h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverImageUrl} alt="Course cover preview" className="size-full object-cover" />
            </div>
          )}
        </div>
      </div>

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
          className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-400/10"
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
          className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-400/10"
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
          className="min-h-[120px] w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-400/10"
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
      <div className="flex items-center justify-center rounded-[24px] border-[1.5px] border-emerald-400/80 bg-gradient-to-b from-emerald-50/30 via-white to-white py-10 shadow-[4px_-4px_0px_0px_#A7F3D0]">
        <Loader2 size={24} className="animate-spin text-emerald-400" />
      </div>
    );
  }

  // Saving from a form that never loaded would write blanks over the real values.
  if (loadFailed) {
    return (
      <div className="rounded-[24px] border-[1.5px] border-emerald-400/80 bg-gradient-to-b from-emerald-50/30 via-white to-white p-6 text-center text-xs font-semibold text-slate-500 shadow-[4px_-4px_0px_0px_#A7F3D0]">
        Couldn&rsquo;t load this course&rsquo;s pricing. Reload the page to try again.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 rounded-[24px] border-[1.5px] border-emerald-400/80 bg-gradient-to-b from-emerald-50/30 via-white to-white p-6 shadow-[4px_-4px_0px_0px_#A7F3D0]">
      <h3 className="flex items-center gap-2 text-base font-black tracking-tight text-slate-900">
        <IndianRupee size={18} className="text-emerald-600" />
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
            className="h-[46px] w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-400/10"
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
                className="h-[46px] w-full rounded-xl border border-slate-200 bg-white p-3 pl-10 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-400/10"
              />
            </div>
          </div>
        )}
      </div>

      {pricingModel === "PAID" && (
        <p className="flex items-start gap-1.5 rounded border border-slate-200 bg-slate-50 p-2 text-xs font-medium text-[#14142b]">
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
          <h4 className="mb-3 border-b border-emerald-100 pb-2 text-sm font-bold text-slate-800">
            Pricing history
          </h4>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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
