"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, FileText, MessageSquare, Award, BookOpen, Loader2, Tag, IndianRupee, Save } from "lucide-react";
import { toast } from "sonner";
import {
  listAssessmentPlacementsForCourse,
  listExamPlans,
  listExamsForCourse,
  listExamsForEvent,
  type AssessmentPlacementResponse,
  type ExamPlanResponse,
  type ExamResponse,
} from "@/domains/assessments";
import { api } from "@/infrastructure/http/api";

/** One assessment in the course, joined to the plan it delivers. */
type AssessmentRow = { placement: AssessmentPlacementResponse; plan: ExamPlanResponse | null };
import type { ContentTypeSegment } from "../../lib/contentTypeRouting";

interface LearnerAnalytics {
  userId: string;
  name: string;
  email: string;
  status: string;
  progressPercentage: number;
}

interface ReviewAnalytics {
  id: string;
  userName: string;
  reviewText: string;
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
  const [activeSubTab, setActiveSubTab] = useState<"pricing" | "learners" | "exams" | "feedback" | "certificates" | "overview">("learners");

  const [exams, setExams] = useState<ExamResponse[] | null>(null);
  useEffect(() => {
    if (!contentId || !segment) return;
    const request = segment === "event" ? listExamsForEvent(contentId) : listExamsForCourse(contentId);
    request.then(setExams).catch(() => setExams([]));
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

  const [learners, setLearners] = useState<LearnerAnalytics[] | null>(null);
  useEffect(() => {
    if (!contentId || segment !== "course") return;
    api.get<LearnerAnalytics[]>(`/api/courses/${contentId}/learners`)
      .then(setLearners)
      .catch(() => setLearners([]));
  }, [contentId, segment]);

  const [reviews, setReviews] = useState<ReviewAnalytics[] | null>(null);
  useEffect(() => {
    if (!contentId || segment !== "course") return;
    api.get<ReviewAnalytics[]>(`/api/courses/${contentId}/reviews`)
      .then(setReviews)
      .catch(() => setReviews([]));
  }, [contentId, segment]);

  return (
    <div className="flex flex-col gap-6">
      {/* Section Navigation Tabs (Middle Portion Centered) */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-center">
          <div className="flex items-center justify-center gap-2 overflow-x-auto scrollbar-none flex-wrap">
            <button
              onClick={() => setActiveSubTab("pricing")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                activeSubTab === "pricing"
                  ? "bg-slate-800 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Tag size={14} /> Pricing
            </button>
            <button
              onClick={() => setActiveSubTab("learners")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                activeSubTab === "learners"
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <Users size={14} /> Enrolled Students
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
            <button
              onClick={() => setActiveSubTab("overview")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black transition-all cursor-pointer ${
                activeSubTab === "overview"
                  ? "bg-purple-600 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              <BookOpen size={14} /> Overview
            </button>
          </div>
        </div>

        {/* 3. SUB-TAB CONTENT PANELS */}

        {/* TAB 1: Enrolled Learners Count */}
        {activeSubTab === "learners" && (
          <div className="rounded-[24px] border-[1.5px] border-blue-400/80 bg-gradient-to-b from-blue-50/30 via-white to-white p-6 shadow-[4px_-4px_0px_0px_#BFDBFE] flex flex-col gap-4">
            <h3 className="text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
              <Users size={18} className="text-blue-600" />
              Enrolled Students
            </h3>
            {learners === null ? (
              <div className="flex items-center justify-center py-10 text-slate-400">
                <Loader2 size={24} className="animate-spin text-blue-400" />
              </div>
            ) : learners.length === 0 ? (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <span className="text-5xl font-black text-slate-900">0</span>
                <span className="text-sm font-bold text-slate-500 mt-2">Total Students Enrolled</span>
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-3">
                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-blue-100">
                  <div className="col-span-5">Student</div>
                  <div className="col-span-3">Status</div>
                  <div className="col-span-4">Progress</div>
                </div>
                {learners.map((learner) => (
                  <div key={learner.userId} className="grid grid-cols-12 gap-4 items-center rounded-2xl border border-blue-100/70 bg-white px-4 py-3 transition-colors hover:bg-blue-50/50">
                    <div className="col-span-5 flex flex-col min-w-0">
                      <span className="truncate text-sm font-bold text-slate-900">{learner.name}</span>
                      <span className="truncate text-xs font-medium text-slate-500">{learner.email}</span>
                    </div>
                    <div className="col-span-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border ${
                        learner.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        learner.status === 'Ongoing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {learner.status}
                      </span>
                    </div>
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            learner.progressPercentage === 100 ? 'bg-emerald-500' : 
                            learner.progressPercentage > 0 ? 'bg-blue-500' : 'bg-slate-300'
                          }`}
                          style={{ width: `${learner.progressPercentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600 w-8 text-right">{learner.progressPercentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Real attached exams */}
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
                {assessments!.map(({ placement, plan }) => (
                  <Link
                    key={placement.id}
                    href={`/studio/content/exam/${placement.examId}`}
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
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {exams!.map((exam) => (
                  <Link
                    key={exam.id}
                    href={`/studio/content/exam/${exam.id}`}
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
                ))}
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
                <Loader2 size={24} className="animate-spin text-amber-400" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="flex items-center justify-center py-10 text-slate-400 text-sm font-semibold">
                No reviews yet.
              </div>
            ) : (
              <div className="mt-4 flex flex-col gap-4">
                {reviews.map((review) => (
                  <div key={review.id} className="flex flex-col gap-2 rounded-2xl border border-amber-100/70 bg-white p-4 transition-colors hover:bg-amber-50/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">{review.userName}</span>
                      <span className="text-xs font-medium text-slate-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{review.reviewText}</p>
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
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <span className="text-5xl font-black text-slate-900">0</span>
              <span className="text-sm font-bold text-slate-500 mt-2">Certificates Issued</span>
            </div>
          </div>
        )}

        {/* TAB 5: Course Overview */}
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

function CourseOverviewEditor({ contentId }: { contentId: string }) {
  const [course, setCourse] = useState<any>(null);
  const [description, setDescription] = useState("");
  const [learningOutcomes, setLearningOutcomes] = useState("");
  const [duration, setDuration] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.get<any>(`/api/courses/${contentId}`)
      .then((data) => {
        if (!cancelled) {
          setCourse(data);
          setDescription(data.description || "");
          setLearningOutcomes(data.learningOutcomes || "");
          setDuration(data.duration || "");
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [contentId]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.patch(`/api/courses/${contentId}`, {
        title: course?.title || "Untitled Course",
        description,
        learningOutcomes,
        duration,
      });
      // Handle success locally or just notify
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-[24px] border-[1.5px] border-purple-400/80 bg-gradient-to-b from-purple-50/30 via-white to-white p-6 shadow-[4px_-4px_0px_0px_#E9D5FF] flex items-center justify-center py-10">
        <Loader2 size={24} className="animate-spin text-purple-400" />
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border-[1.5px] border-purple-400/80 bg-gradient-to-b from-purple-50/30 via-white to-white p-6 shadow-[4px_-4px_0px_0px_#E9D5FF] flex flex-col gap-6">
      <h3 className="text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
        <BookOpen size={18} className="text-purple-600" />
        Course Overview
      </h3>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">Course duration</label>
          <input
            type="text"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 4h 30m"
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-400/10"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">About this course</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write a brief overview of what this course is about..."
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-400/10 min-h-[120px]"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-slate-700">What you'll walk away with</label>
          <textarea
            value={learningOutcomes}
            onChange={(e) => setLearningOutcomes(e.target.value)}
            placeholder="List the key learning outcomes, one per line..."
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-purple-400 focus:outline-none focus:ring-4 focus:ring-purple-400/10 min-h-[120px]"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving && <Loader2 size={16} className="animate-spin" />}
            Save Overview
          </button>
        </div>
      </div>
    </div>
  );
}

function CoursePricingEditor({ contentId }: { contentId: string }) {
  const [course, setCourse] = useState<any>(null);
  const [pricingModel, setPricingModel] = useState<'FREE' | 'PAID'>('FREE');
  const [priceAmount, setPriceAmount] = useState<number | "">("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  const fetchPricingHistory = async (id: string) => {
    try {
      const data = await api.get<any[]>(`/api/courses/${id}/pricing-history`);
      setHistory(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    let cancelled = false;
    api.get<any>(`/api/courses/${contentId}`)
      .then((data) => {
        if (!cancelled) {
          setCourse(data);
          setPricingModel(data.pricingModel || "FREE");
          setPriceAmount(data.priceAmount ? data.priceAmount / 100 : "");
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsLoading(false);
      });
      
    fetchPricingHistory(contentId);
    
    return () => { cancelled = true; };
  }, [contentId]);

  const handleSave = async () => {
    if (pricingModel === 'PAID' && (priceAmount === "" || priceAmount <= 0)) {
      toast.error("Please enter a valid price for a paid course.");
      return;
    }
    setIsSaving(true);
    try {
      await api.patch(`/api/courses/${contentId}`, {
        title: course?.title || "Untitled Course",
        pricingModel,
        priceAmount: pricingModel === 'PAID' ? Math.round(Number(priceAmount) * 100) : 0,
      });
      toast.success("Pricing saved!");
      await fetchPricingHistory(contentId);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save pricing");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-[24px] border-[1.5px] border-emerald-400/80 bg-gradient-to-b from-emerald-50/30 via-white to-white p-6 shadow-[4px_-4px_0px_0px_#A7F3D0] flex items-center justify-center py-10">
        <Loader2 size={24} className="animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="rounded-[24px] border-[1.5px] border-emerald-400/80 bg-gradient-to-b from-emerald-50/30 via-white to-white p-6 shadow-[4px_-4px_0px_0px_#A7F3D0] flex flex-col gap-6">
      <h3 className="text-base font-black tracking-tight text-slate-900 flex items-center gap-2">
        <IndianRupee size={18} className="text-emerald-600" />
        Course Pricing
      </h3>

      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold text-slate-700">Pricing Model</label>
            <select
              value={pricingModel}
              onChange={(e) => setPricingModel(e.target.value as 'FREE' | 'PAID')}
              className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-400/10 h-[46px]"
            >
              <option value="FREE">Free</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
          {pricingModel === 'PAID' && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold text-slate-700">Price Amount (₹)</label>
              <div className="relative">
                <span className="absolute left-4 top-[13px] text-slate-500 font-medium">₹</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={priceAmount}
                  onChange={(e) => setPriceAmount(e.target.value ? parseFloat(e.target.value) : "")}
                  placeholder="e.g. 49.99"
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 pl-8 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-400/10 h-[46px]"
                />
              </div>
            </div>
          )}
        </div>
        {pricingModel === 'PAID' && (
           <p className="text-xs text-[#14142b] bg-slate-50 border border-slate-200 p-2 rounded flex items-start gap-1.5 font-medium">
             <span className="text-[10px] mt-[1px]">💡</span> Note: A 20% platform fee will be applied to all paid courses.
           </p>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-emerald-700 hover:shadow-md disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? "Saving..." : "Save Pricing"}
          </button>
        </div>
      </div>

      {/* Pricing History Table */}
      {history && history.length > 0 && (
        <div className="mt-8">
          <h4 className="text-sm font-bold text-slate-800 mb-3 border-b border-emerald-100 pb-2">Pricing History</h4>
          <div className="overflow-hidden rounded-xl border border-slate-200 shadow-sm bg-white">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(h.changedAt).toLocaleDateString()} {new Date(h.changedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-700">{h.changedByName}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        h.pricingModel === 'FREE' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {h.pricingModel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900">
                      {h.pricingModel === 'PAID' ? `₹${h.priceAmount ? h.priceAmount / 100 : 0}` : '—'}
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
