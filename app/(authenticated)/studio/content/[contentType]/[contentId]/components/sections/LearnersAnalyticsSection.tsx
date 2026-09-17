"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Users,
  Star,
  Award,
  FileText,
  Search,
  ExternalLink,
  MessageSquare,
  BookOpen,
  Download,
  FolderArchive,
  Quote,
  Reply,
  CornerDownRight,
  Send,
  Trash2,
  LayoutGrid,
  List,
  Calendar,
  Copy,
  Check,
} from "lucide-react";

export interface LearnerRecord {
  id: string;
  name: string;
  email: string;
  enrolledAt: string;
  progress: number;
  isLive: boolean;
  status: "Active" | "Completed" | "In Progress";
}

export interface AssessmentRecord {
  name: string;
  takers: number;
  passRate: number;
  avgScore: number;
}

export interface FeedbackReply {
  id: string;
  authorName: string;
  authorRole: string;
  comment: string;
  createdAt: string;
}

export interface FeedbackRecord {
  id: string;
  studentName: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  reply?: FeedbackReply;
}

export interface CertificateRecord {
  id: string;
  studentName: string;
  certificateCode: string;
  earnedAt: string;
  score: number;
}

const MOCK_LEARNERS: LearnerRecord[] = [
  { id: "1", name: "Alex Morgan", email: "alex.morgan@example.com", enrolledAt: "2026-08-12", progress: 85, isLive: true, status: "Active" },
  { id: "2", name: "Sarah Jenkins", email: "sarah.j@example.com", enrolledAt: "2026-08-10", progress: 100, isLive: false, status: "Completed" },
  { id: "3", name: "David Kumar", email: "david.k@example.com", enrolledAt: "2026-08-08", progress: 100, isLive: false, status: "Completed" },
  { id: "4", name: "Elena Rostova", email: "elena.r@example.com", enrolledAt: "2026-08-14", progress: 42, isLive: true, status: "In Progress" },
  { id: "5", name: "Marcus Vance", email: "marcus.vance@example.com", enrolledAt: "2026-08-05", progress: 92, isLive: true, status: "Active" },
  { id: "6", name: "Amina Al-Mansoor", email: "amina.m@example.com", enrolledAt: "2026-08-03", progress: 100, isLive: false, status: "Completed" },
];

const MOCK_ASSESSMENTS: AssessmentRecord[] = [
  { name: "Module 1: Foundations Quiz", takers: 1240, passRate: 96, avgScore: 92 },
  { name: "Module 2: Midterm Evaluation", takers: 980, passRate: 91, avgScore: 86 },
  { name: "Final Capstone Certification Exam", takers: 892, passRate: 88, avgScore: 84 },
];

const INITIAL_FEEDBACKS: FeedbackRecord[] = [
  {
    id: "f1",
    studentName: "Elena Rostova",
    avatar: "E",
    rating: 5,
    comment: "Exceptional course material! The practical examples and clear modular progression made complex topics effortless to grasp.",
    date: "14 Aug 2026",
  },
  {
    id: "f2",
    studentName: "Marcus Vance",
    avatar: "M",
    rating: 5,
    comment: "Super helpful assessment quizzes and prompt evaluation feedback. Highly recommended for anyone mastering this field!",
    date: "12 Aug 2026",
  },
  {
    id: "f3",
    studentName: "Sarah Jenkins",
    avatar: "S",
    rating: 5,
    comment: "Clear structure and instant certificate issuance upon passing the capstone exam. Truly professional experience.",
    date: "10 Aug 2026",
  },
];

const MOCK_CERTIFICATES: CertificateRecord[] = [
  { id: "c1", studentName: "Sarah Jenkins", certificateCode: "CERT-2026-8941", earnedAt: "10 Aug 2026", score: 96 },
  { id: "c2", studentName: "David Kumar", certificateCode: "CERT-2026-8930", earnedAt: "08 Aug 2026", score: 94 },
  { id: "c3", studentName: "Amina Al-Mansoor", certificateCode: "CERT-2026-8912", earnedAt: "05 Aug 2026", score: 98 },
];

import { CourseManagementOverview } from "./CourseManagementOverview";
import type { ContentTypeSegment } from "../../lib/contentTypeRouting";

export interface LearnersAnalyticsSectionProps {
  segment?: ContentTypeSegment;
  contentId?: string;
  courseTitle?: string;
  activeSubTab?: "overview" | "learners" | "exams" | "feedback" | "certificates" | "curriculum";
  onSubTabChange?: (tab: "overview" | "learners" | "exams" | "feedback" | "certificates" | "curriculum") => void;
}

export function LearnersAnalyticsSection({
  segment,
  contentId,
  courseTitle,
  activeSubTab = "overview",
  onSubTabChange,
}: LearnersAnalyticsSectionProps = {}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [feedbacks, setFeedbacks] = useState<FeedbackRecord[]>(INITIAL_FEEDBACKS);
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const handleStartReply = (feedbackId: string) => {
    setReplyingToId(feedbackId);
    setReplyText("");
  };

  const handleCancelReply = () => {
    setReplyingToId(null);
    setReplyText("");
  };

  const handleSubmitReply = (feedbackId: string) => {
    if (!replyText.trim()) return;
    const newReply: FeedbackReply = {
      id: "r-" + Date.now(),
      authorName: "Course Instructor",
      authorRole: "Author",
      comment: replyText.trim(),
      createdAt: "Just now",
    };

    setFeedbacks((prev) =>
      prev.map((f) => (f.id === feedbackId ? { ...f, reply: newReply } : f))
    );
    toast.success("Reply posted successfully");
    setReplyingToId(null);
    setReplyText("");
  };

  const handleDeleteReply = (feedbackId: string) => {
    setFeedbacks((prev) =>
      prev.map((f) => (f.id === feedbackId ? { ...f, reply: undefined } : f))
    );
    toast.success("Reply removed");
  };

  const [selectedStatusFilter, setSelectedStatusFilter] = useState<"ALL" | "COMPLETED" | "LIVE">("ALL");
  const [learnerViewMode, setLearnerViewMode] = useState<"grid" | "list">("grid");

  const [certSearchQuery, setCertSearchQuery] = useState("");
  const [certViewMode, setCertViewMode] = useState<"grid" | "list">("list");
  const [copiedCertId, setCopiedCertId] = useState<string | null>(null);

  const [resourceSearchQuery, setResourceSearchQuery] = useState("");
  const [resourceViewMode, setResourceViewMode] = useState<"grid" | "list">("list");

  const COURSE_RESOURCES = [
    {
      name: "Capstone-Project-Starter.zip",
      size: "14.2 MB",
      type: "Code Archive",
      downloads: "1,240",
      icon: FolderArchive,
    },
    {
      name: "System-Architecture-Cheatsheet.pdf",
      size: "3.8 MB",
      type: "PDF Guide",
      downloads: "890",
      icon: FileText,
    },
    {
      name: "API-Security-Best-Practices.pdf",
      size: "2.4 MB",
      type: "Reference Doc",
      downloads: "640",
      icon: FileText,
    },
  ];

  const filteredResources = COURSE_RESOURCES.filter((r) =>
    r.name.toLowerCase().includes(resourceSearchQuery.toLowerCase()) ||
    r.type.toLowerCase().includes(resourceSearchQuery.toLowerCase())
  );

  const handleCopyCert = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCertId(code);
    toast.success(`Copied ${code} to clipboard`);
    setTimeout(() => setCopiedCertId(null), 2000);
  };

  const filteredCertificates = MOCK_CERTIFICATES.filter((c) => {
    return (
      c.studentName.toLowerCase().includes(certSearchQuery.toLowerCase()) ||
      c.certificateCode.toLowerCase().includes(certSearchQuery.toLowerCase())
    );
  });

  const filteredLearners = MOCK_LEARNERS.filter((l) => {
    const matchesSearch =
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatusFilter === "ALL"
        ? true
        : selectedStatusFilter === "COMPLETED"
        ? l.status === "Completed" || l.progress === 100
        : l.isLive;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* TAB 0: Course Management Overview */}
      {activeSubTab === "overview" && (
        <CourseManagementOverview
          segment={segment || "course"}
          contentId={contentId || "1"}
          courseTitle={courseTitle}
          onNavigateToTab={onSubTabChange}
        />
      )}
      {/* TAB 1: Enrolled Learners Directory */}
      {activeSubTab === "learners" && (
        <div className="flex flex-col gap-4 w-full">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-64 group">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search learners..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs text-slate-900 dark:text-neutral-100 placeholder-slate-400 outline-none focus:border-slate-400 dark:focus:border-neutral-600 transition-colors shadow-2xs"
                />
              </div>

              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5">
                {[
                  { key: "ALL", label: "All", showCount: true, count: MOCK_LEARNERS.length },
                  { key: "LIVE", label: "Active", showCount: false },
                  { key: "COMPLETED", label: "Completed", showCount: false },
                ].map((tab) => {
                  const active = selectedStatusFilter === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => setSelectedStatusFilter(tab.key as typeof selectedStatusFilter)}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer select-none ${
                        active
                          ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs"
                          : "bg-white dark:bg-neutral-900 border border-slate-200/90 dark:border-neutral-800 text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-white"
                      }`}
                    >
                      <span>{tab.label}</span>
                      {tab.showCount && (
                        <span className={`text-[11px] tabular-nums ${active ? "text-slate-300 dark:text-slate-600" : "text-slate-400"}`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
              <span className="text-xs text-slate-500 dark:text-neutral-400 font-medium">
                <strong className="text-slate-900 dark:text-neutral-100">{filteredLearners.length}</strong> learners
              </span>

              {/* Grid / List View Mode Switcher */}
              <div className="flex items-center p-1 rounded-full bg-white dark:bg-neutral-900 border border-slate-200/90 dark:border-neutral-800 shadow-2xs text-xs">
                <button
                  type="button"
                  onClick={() => setLearnerViewMode("grid")}
                  className={`p-1.5 rounded-full transition-all cursor-pointer ${
                    learnerViewMode === "grid"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900 dark:text-neutral-400"
                  }`}
                  title="Grid Cards View"
                >
                  <LayoutGrid size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setLearnerViewMode("list")}
                  className={`p-1.5 rounded-full transition-all cursor-pointer ${
                    learnerViewMode === "list"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900 dark:text-neutral-400"
                  }`}
                  title="List Rows View"
                >
                  <List size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* ── GRID MODE: SHAPE-CUT PASTEL LEARNER CARDS ── */}
          {learnerViewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {filteredLearners.map((learner, idx) => {
                const cardThemes = [
                  {
                    shape: "rounded-tl-[28px] rounded-br-[28px] rounded-tr-[14px] rounded-bl-[14px]",
                    border: "border-blue-200/90 dark:border-blue-900/50 hover:border-blue-400",
                    bg: "bg-gradient-to-br from-blue-50/30 via-white to-white dark:from-blue-950/20 dark:via-neutral-900 dark:to-neutral-900",
                    avatar: "bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300",
                    progressColor: "bg-blue-600",
                  },
                  {
                    shape: "rounded-2xl",
                    border: "border-purple-200/90 dark:border-purple-900/50 hover:border-purple-400",
                    bg: "bg-gradient-to-br from-purple-50/30 via-white to-white dark:from-purple-950/20 dark:via-neutral-900 dark:to-neutral-900",
                    avatar: "bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300",
                    progressColor: "bg-purple-600",
                  },
                  {
                    shape: "rounded-tr-[28px] rounded-bl-[28px] rounded-tl-[14px] rounded-br-[14px]",
                    border: "border-amber-200/90 dark:border-amber-900/50 hover:border-amber-400",
                    bg: "bg-gradient-to-br from-amber-50/30 via-white to-white dark:from-amber-950/20 dark:via-neutral-900 dark:to-neutral-900",
                    avatar: "bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300",
                    progressColor: "bg-amber-500",
                  },
                  {
                    shape: "rounded-t-[28px] rounded-b-[14px]",
                    border: "border-emerald-200/90 dark:border-emerald-900/50 hover:border-emerald-400",
                    bg: "bg-gradient-to-br from-emerald-50/30 via-white to-white dark:from-emerald-950/20 dark:via-neutral-900 dark:to-neutral-900",
                    avatar: "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300",
                    progressColor: "bg-emerald-500",
                  },
                  {
                    shape: "rounded-tl-[28px] rounded-br-[28px] rounded-tr-[14px] rounded-bl-[14px]",
                    border: "border-rose-200/90 dark:border-rose-900/50 hover:border-rose-400",
                    bg: "bg-gradient-to-br from-rose-50/30 via-white to-white dark:from-rose-950/20 dark:via-neutral-900 dark:to-neutral-900",
                    avatar: "bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300",
                    progressColor: "bg-rose-500",
                  },
                  {
                    shape: "rounded-tr-[28px] rounded-bl-[28px] rounded-tl-[14px] rounded-br-[14px]",
                    border: "border-teal-200/90 dark:border-teal-900/50 hover:border-teal-400",
                    bg: "bg-gradient-to-br from-teal-50/30 via-white to-white dark:from-teal-950/20 dark:via-neutral-900 dark:to-neutral-900",
                    avatar: "bg-teal-100 dark:bg-teal-900/60 text-teal-700 dark:text-teal-300",
                    progressColor: "bg-teal-500",
                  },
                ];

                const theme = cardThemes[idx % cardThemes.length];

                return (
                  <div
                    key={learner.id}
                    className={`relative overflow-hidden p-5 ${theme.shape} border ${theme.border} ${theme.bg} shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-3.5 group cursor-pointer`}
                  >
                    {/* Top: Avatar & Status Badge */}
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-3">
                        <div
                          className={`size-10 rounded-2xl ${theme.avatar} font-bold text-xs flex items-center justify-center shadow-2xs transition-transform group-hover:scale-105`}
                        >
                          {learner.name.charAt(0)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {learner.name}
                          </h4>
                          <span className="text-[11px] text-slate-500 dark:text-neutral-400 truncate">
                            {learner.email}
                          </span>
                        </div>
                      </div>

                      {/* Status Tag */}
                      {learner.isLive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/40 shrink-0">
                          Active
                        </span>
                      ) : learner.status === "Completed" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 border border-slate-200/80 dark:border-neutral-700/60 shrink-0">
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 dark:bg-neutral-850 text-slate-500 dark:text-neutral-400 border border-slate-200/60 dark:border-neutral-800 shrink-0">
                          In Progress
                        </span>
                      )}
                    </div>

                    {/* Bottom: Progress & Enrolled Date (Clean text without colored lines) */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-500 dark:text-neutral-400 font-medium flex items-center gap-1.5 text-[11px]">
                        <Calendar size={12} className="text-slate-400" />
                        {new Date(learner.enrolledAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                      <span className="text-xs font-bold text-slate-700 dark:text-neutral-300 tabular-nums">
                        {learner.progress}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── LIST MODE: INDIVIDUAL FLOATING ROW TILES ── */
            <div className="flex flex-col gap-2.5 w-full">
              {filteredLearners.map((learner, idx) => {
                const rowThemes = [
                  "border-blue-200/80 hover:border-blue-400 bg-gradient-to-r from-blue-50/25 via-white to-white dark:from-blue-950/15 dark:via-neutral-900 dark:to-neutral-900",
                  "border-purple-200/80 hover:border-purple-400 bg-gradient-to-r from-purple-50/25 via-white to-white dark:from-purple-950/15 dark:via-neutral-900 dark:to-neutral-900",
                  "border-amber-200/80 hover:border-amber-400 bg-gradient-to-r from-amber-50/25 via-white to-white dark:from-amber-950/15 dark:via-neutral-900 dark:to-neutral-900",
                  "border-emerald-200/80 hover:border-emerald-400 bg-gradient-to-r from-emerald-50/25 via-white to-white dark:from-emerald-950/15 dark:via-neutral-900 dark:to-neutral-900",
                  "border-rose-200/80 hover:border-rose-400 bg-gradient-to-r from-rose-50/25 via-white to-white dark:from-rose-950/15 dark:via-neutral-900 dark:to-neutral-900",
                  "border-teal-200/80 hover:border-teal-400 bg-gradient-to-r from-teal-50/25 via-white to-white dark:from-teal-950/15 dark:via-neutral-900 dark:to-neutral-900",
                ];

                const avatarBgs = [
                  "bg-blue-100 text-blue-700",
                  "bg-purple-100 text-purple-700",
                  "bg-amber-100 text-amber-700",
                  "bg-emerald-100 text-emerald-700",
                  "bg-rose-100 text-rose-700",
                  "bg-teal-100 text-teal-700",
                ];

                const theme = rowThemes[idx % rowThemes.length];
                const avatar = avatarBgs[idx % avatarBgs.length];

                return (
                  <div
                    key={learner.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border ${theme} shadow-2xs hover:shadow-xs transition-all cursor-pointer group`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`size-10 rounded-2xl ${avatar} font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}>
                        {learner.name.charAt(0)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                          {learner.name}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-neutral-400 truncate">
                          {learner.email}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 self-end sm:self-auto">
                      {/* Status */}
                      {learner.isLive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/40">
                          Active
                        </span>
                      ) : learner.status === "Completed" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 border border-slate-200/80 dark:border-neutral-700/60">
                          Completed
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-slate-50 dark:bg-neutral-850 text-slate-500 dark:text-neutral-400 border border-slate-200/60 dark:border-neutral-800">
                          In Progress
                        </span>
                      )}

                      {/* Progress Percentage */}
                      <span className="text-xs font-bold text-slate-700 dark:text-neutral-300 tabular-nums">
                        {learner.progress}%
                      </span>

                      {/* Enrolled Date */}
                      <span className="text-[11px] text-slate-400 dark:text-neutral-500 hidden md:block">
                        {new Date(learner.enrolledAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Assessments & Exam Performance */}
      {activeSubTab === "exams" && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 w-full">
          {MOCK_ASSESSMENTS.map((exam, idx) => {
            const accents = [
              {
                semicircle: "bg-blue-500/10 dark:bg-blue-500/20 border border-blue-500/20",
                textColor: "text-blue-600 dark:text-blue-400",
              },
              {
                semicircle: "bg-purple-500/10 dark:bg-purple-500/20 border border-purple-500/20",
                textColor: "text-purple-600 dark:text-purple-400",
              },
              {
                semicircle: "bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/20",
                textColor: "text-amber-600 dark:text-amber-400",
              },
            ];

            const accent = accents[idx % accents.length];

            return (
              <div
                key={exam.name}
                className="group relative overflow-hidden flex flex-col justify-between p-5 rounded-2xl border border-slate-200/80 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xs hover:border-slate-300 dark:hover:border-neutral-700 transition-colors"
              >
                {/* Semicircle accent on the right side */}
                <div
                  className={`absolute -right-6 top-1/2 -translate-y-1/2 w-14 h-24 rounded-l-full ${accent.semicircle} pointer-events-none transition-transform duration-300 group-hover:scale-110`}
                />

                <div className="relative z-10 pr-6">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-neutral-100">
                    {exam.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                    {exam.takers.toLocaleString()} students evaluated
                  </p>
                </div>

                <div className="relative z-10 mt-6 pt-4 border-t border-slate-100 dark:border-neutral-800/80 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-neutral-500 block">
                      Pass Rate
                    </span>
                    <span className="text-xl font-bold text-slate-900 dark:text-neutral-100 mt-1 block tabular-nums">
                      {exam.passRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-neutral-500 block">
                      Avg Score
                    </span>
                    <span className={`text-xl font-bold ${accent.textColor} mt-1 block tabular-nums`}>
                      {exam.avgScore}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 3: Ratings & Student Feedbacks */}
      {activeSubTab === "feedback" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {feedbacks.map((review, idx) => {
            const cardThemes = [
              {
                avatar: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300/70 dark:border-emerald-800",
                hoverTopLine: "hover:border-t-emerald-500",
                quoteColor: "text-emerald-500/15 dark:text-emerald-400/15",
                tagColor: "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/70 dark:border-emerald-800/50",
              },
              {
                avatar: "bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border border-amber-300/70 dark:border-amber-800",
                hoverTopLine: "hover:border-t-amber-500",
                quoteColor: "text-amber-500/15 dark:text-amber-400/15",
                tagColor: "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200/70 dark:border-amber-800/50",
              },
              {
                avatar: "bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border border-purple-300/70 dark:border-purple-800",
                hoverTopLine: "hover:border-t-purple-500",
                quoteColor: "text-purple-500/15 dark:text-purple-400/15",
                tagColor: "text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border-purple-200/70 dark:border-purple-800/50",
              },
            ];

            const theme = cardThemes[idx % cardThemes.length];
            const isReplying = replyingToId === review.id;

            return (
              <div
                key={review.id}
                className={`group relative flex flex-col justify-between p-5 sm:p-6 rounded-2xl border border-slate-200/90 dark:border-neutral-800 border-t-2 border-t-slate-200/90 dark:border-t-neutral-800 ${theme.hoverTopLine} bg-white dark:bg-neutral-900 shadow-2xs hover:shadow-md hover:border-slate-300 dark:hover:border-neutral-700 transition-all duration-300 overflow-hidden`}
              >
                {/* Large, clearly visible decorative quote watermark */}
                <Quote
                  size={84}
                  className={`absolute -top-4 -right-2 ${theme.quoteColor} pointer-events-none transition-transform duration-300 group-hover:scale-110`}
                />

                <div className="relative z-10 flex flex-col gap-3.5">
                  {/* Top Bar: Stars + Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} size={13} className="fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">{review.rating}.0</span>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-neutral-500 font-medium tabular-nums">
                      {review.date}
                    </span>
                  </div>

                  {/* Testimonial Quote */}
                  <p className="text-xs text-slate-700 dark:text-neutral-300 leading-relaxed font-normal pt-1">
                    “{review.comment}”
                  </p>
                </div>

                {/* Bottom Student Author Row */}
                <div className="relative z-10 mt-5 pt-3.5 border-t border-slate-100 dark:border-neutral-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className={`size-8 shrink-0 font-bold text-xs flex items-center justify-center transition-transform duration-200 group-hover:scale-110 rounded-full ${theme.avatar}`}>
                      {review.avatar}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-slate-900 dark:text-neutral-100 text-xs truncate">
                        {review.studentName}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-neutral-500 truncate">
                        Verified Student
                      </span>
                    </div>
                  </div>

                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${theme.tagColor}`}>
                    Graduate
                  </span>
                </div>

                {/* Existing Reply Thread */}
                {review.reply && (
                  <div className="relative z-10 mt-3 pt-3 border-t border-slate-100 dark:border-neutral-800/80">
                    <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50/90 dark:bg-neutral-850 border border-slate-200/70 dark:border-neutral-800 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <CornerDownRight size={13} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                          <span className="font-semibold text-slate-900 dark:text-white text-[11px]">
                            {review.reply.authorName}
                          </span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/40">
                            {review.reply.authorRole}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 dark:text-neutral-500">
                            {review.reply.createdAt}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteReply(review.id)}
                            className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors p-0.5 rounded cursor-pointer"
                            title="Delete reply"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-neutral-300 text-xs leading-relaxed pl-4">
                        {review.reply.comment}
                      </p>
                    </div>
                  </div>
                )}

                {/* Reply Form */}
                {isReplying && (
                  <div className="relative z-10 mt-3 pt-3 border-t border-slate-100 dark:border-neutral-800/80 flex flex-col gap-2">
                    <textarea
                      autoFocus
                      rows={2}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to ${review.studentName}...`}
                      className="w-full rounded-xl border border-slate-200 dark:border-neutral-700 bg-slate-50/80 dark:bg-neutral-800/60 p-2.5 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-neutral-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all resize-none shadow-2xs"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleCancelReply}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-neutral-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        disabled={!replyText.trim()}
                        onClick={() => handleSubmitReply(review.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-neutral-900 hover:bg-slate-800 dark:hover:bg-neutral-100 transition-all disabled:opacity-50 cursor-pointer shadow-xs active:scale-[0.98]"
                      >
                        <Send size={11} />
                        <span>Post</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Reply Trigger Button (When no reply & not currently replying) */}
                {!review.reply && !isReplying && (
                  <div className="relative z-10 mt-3 pt-2 border-t border-slate-100/80 dark:border-neutral-800/60 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleStartReply(review.id)}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-2.5 py-1 rounded-lg hover:bg-slate-50 dark:hover:bg-neutral-800/60 cursor-pointer"
                    >
                      <Reply size={12} />
                      <span>Reply</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: Certificate Recipients */}
      {activeSubTab === "certificates" && (
        <div className="flex flex-col gap-4 w-full">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-64 group">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={certSearchQuery}
                  onChange={(e) => setCertSearchQuery(e.target.value)}
                  placeholder="Search graduates or ID..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs text-slate-900 dark:text-neutral-100 placeholder-slate-400 outline-none focus:border-slate-400 dark:focus:border-neutral-600 transition-colors shadow-2xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
              <span className="text-xs text-slate-500 dark:text-neutral-400 font-medium">
                <strong className="text-slate-900 dark:text-neutral-100">{filteredCertificates.length}</strong> credentials issued
              </span>

              {/* Grid / List View Mode Switcher */}
              <div className="flex items-center p-1 rounded-full bg-white dark:bg-neutral-900 border border-slate-200/90 dark:border-neutral-800 shadow-2xs text-xs">
                <button
                  type="button"
                  onClick={() => setCertViewMode("grid")}
                  className={`p-1.5 rounded-full transition-all cursor-pointer ${
                    certViewMode === "grid"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900 dark:text-neutral-400"
                  }`}
                  title="Grid Cards View"
                >
                  <LayoutGrid size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setCertViewMode("list")}
                  className={`p-1.5 rounded-full transition-all cursor-pointer ${
                    certViewMode === "list"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900 dark:text-neutral-400"
                  }`}
                  title="List Rows View"
                >
                  <List size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* ── GRID MODE: CERTIFICATE CARDS ── */}
          {certViewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {filteredCertificates.map((cert, idx) => {
                const certCardThemes = [
                  {
                    border: "border-purple-200/90 dark:border-purple-900/50 hover:border-purple-400",
                    bg: "bg-gradient-to-br from-purple-50/25 via-white to-white dark:from-purple-950/15 dark:via-neutral-900 dark:to-neutral-900",
                    avatar: "bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300",
                    iconColor: "text-purple-600 dark:text-purple-400",
                  },
                  {
                    border: "border-amber-200/90 dark:border-amber-900/50 hover:border-amber-400",
                    bg: "bg-gradient-to-br from-amber-50/25 via-white to-white dark:from-amber-950/15 dark:via-neutral-900 dark:to-neutral-900",
                    avatar: "bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300",
                    iconColor: "text-amber-600 dark:text-amber-400",
                  },
                  {
                    border: "border-emerald-200/90 dark:border-emerald-900/50 hover:border-emerald-400",
                    bg: "bg-gradient-to-br from-emerald-50/25 via-white to-white dark:from-emerald-950/15 dark:via-neutral-900 dark:to-neutral-900",
                    avatar: "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300",
                    iconColor: "text-emerald-600 dark:text-emerald-400",
                  },
                ];

                const theme = certCardThemes[idx % certCardThemes.length];

                return (
                  <div
                    key={cert.id}
                    className={`relative overflow-hidden p-5 rounded-2xl border ${theme.border} ${theme.bg} shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-4 group cursor-pointer`}
                  >
                    {/* Top: Avatar, Name & Score */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`size-10 rounded-2xl ${theme.avatar} font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}>
                          {cert.studentName.charAt(0)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {cert.studentName}
                          </h4>
                          <span className="text-[11px] text-slate-500 dark:text-neutral-400 truncate">
                            Certified Graduate
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-slate-800 dark:text-neutral-200 bg-white/80 dark:bg-neutral-800/80 px-2.5 py-1 rounded-lg border border-slate-200/80 dark:border-neutral-700/80 shadow-2xs tabular-nums shrink-0">
                        {cert.score}%
                      </span>
                    </div>

                    {/* Middle: Monospace Certificate Code */}
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/90 dark:bg-neutral-900/90 border border-slate-200/80 dark:border-neutral-800 shadow-2xs">
                      <div className="flex items-center gap-2 font-mono text-[11px] font-semibold text-slate-800 dark:text-neutral-200 truncate">
                        <Award size={14} className={`${theme.iconColor} shrink-0`} />
                        <span className="truncate">{cert.certificateCode}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyCert(cert.certificateCode);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-neutral-200 hover:bg-slate-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                        title="Copy Certificate ID"
                      >
                        {copiedCertId === cert.certificateCode ? (
                          <Check size={12} className="text-emerald-600" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </button>
                    </div>

                    {/* Bottom: Date Issued & Action */}
                    <div className="flex items-center justify-between text-xs pt-0.5">
                      <span className="text-slate-500 dark:text-neutral-400 font-medium flex items-center gap-1.5 text-[11px]">
                        <Calendar size={12} className="text-slate-400" />
                        {cert.earnedAt}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-neutral-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        <span>Verify</span>
                        <ExternalLink size={11} />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── LIST MODE: FLOATING ROW TILES ── */
            <div className="flex flex-col gap-2.5 w-full">
              {filteredCertificates.map((cert, idx) => {
                const certRowThemes = [
                  "border-purple-200/80 hover:border-purple-400 bg-gradient-to-r from-purple-50/25 via-white to-white dark:from-purple-950/15 dark:via-neutral-900 dark:to-neutral-900",
                  "border-amber-200/80 hover:border-amber-400 bg-gradient-to-r from-amber-50/25 via-white to-white dark:from-amber-950/15 dark:via-neutral-900 dark:to-neutral-900",
                  "border-emerald-200/80 hover:border-emerald-400 bg-gradient-to-r from-emerald-50/25 via-white to-white dark:from-emerald-950/15 dark:via-neutral-900 dark:to-neutral-900",
                ];

                const certAvatarBgs = [
                  "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300",
                  "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300",
                  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
                ];

                const theme = certRowThemes[idx % certRowThemes.length];
                const avatar = certAvatarBgs[idx % certAvatarBgs.length];

                return (
                  <div
                    key={cert.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border ${theme} shadow-2xs hover:shadow-xs transition-all cursor-pointer group`}
                  >
                    {/* Left: Graduate Info */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`size-10 rounded-2xl ${avatar} font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}>
                        {cert.studentName.charAt(0)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {cert.studentName}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-neutral-400 truncate">
                          Certified Graduate
                        </span>
                      </div>
                    </div>

                    {/* Center/Right: Certificate ID Badge, Score, Date & Action */}
                    <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-auto flex-wrap">
                      {/* Certificate Code Badge */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyCert(cert.certificateCode);
                        }}
                        className="inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold px-3 py-1 rounded-lg bg-white/90 dark:bg-neutral-850/90 border border-slate-200/80 dark:border-neutral-700/80 text-slate-800 dark:text-neutral-200 hover:border-slate-400 transition-all shadow-2xs cursor-pointer"
                        title="Click to copy certificate ID"
                      >
                        <Award size={13} className="text-purple-600 dark:text-purple-400 shrink-0" />
                        <span>{cert.certificateCode}</span>
                        {copiedCertId === cert.certificateCode ? (
                          <Check size={11} className="text-emerald-600 shrink-0 ml-0.5" />
                        ) : (
                          <Copy size={11} className="text-slate-400 group-hover:text-slate-700 shrink-0 ml-0.5" />
                        )}
                      </div>

                      {/* Score Badge */}
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-[11px] text-slate-400 dark:text-neutral-500 hidden md:inline">Score:</span>
                        <span className="text-xs font-bold text-slate-800 dark:text-neutral-200 tabular-nums bg-white/80 dark:bg-neutral-800 px-2 py-0.5 rounded-md border border-slate-200/70 dark:border-neutral-700/70">
                          {cert.score}%
                        </span>
                      </div>

                      {/* Date Issued */}
                      <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium flex items-center gap-1.5 tabular-nums">
                        <Calendar size={12} className="text-slate-400" />
                        {cert.earnedAt}
                      </span>

                      {/* Verify Link */}
                      <button
                        type="button"
                        className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-purple-600 dark:text-neutral-400 dark:hover:text-purple-400 transition-colors cursor-pointer"
                      >
                        <span>Verify</span>
                        <ExternalLink size={11} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: Course Syllabus & Resources */}
      {activeSubTab === "curriculum" && (
        <div className="flex flex-col gap-4 w-full">
          {/* Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-64 group">
                <Search
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={resourceSearchQuery}
                  onChange={(e) => setResourceSearchQuery(e.target.value)}
                  placeholder="Search resources, guides..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-xl text-xs text-slate-900 dark:text-neutral-100 placeholder-slate-400 outline-none focus:border-slate-400 dark:focus:border-neutral-600 transition-colors shadow-2xs"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 self-end md:self-auto">
              <span className="text-xs text-slate-500 dark:text-neutral-400 font-medium">
                <strong className="text-slate-900 dark:text-neutral-100">{filteredResources.length}</strong> resources available
              </span>

              {/* Grid / List View Mode Switcher */}
              <div className="flex items-center p-1 rounded-full bg-white dark:bg-neutral-900 border border-slate-200/90 dark:border-neutral-800 shadow-2xs text-xs">
                <button
                  type="button"
                  onClick={() => setResourceViewMode("grid")}
                  className={`p-1.5 rounded-full transition-all cursor-pointer ${
                    resourceViewMode === "grid"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900 dark:text-neutral-400"
                  }`}
                  title="Grid Cards View"
                >
                  <LayoutGrid size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setResourceViewMode("list")}
                  className={`p-1.5 rounded-full transition-all cursor-pointer ${
                    resourceViewMode === "list"
                      ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-2xs"
                      : "text-slate-500 hover:text-slate-900 dark:text-neutral-400"
                  }`}
                  title="List Rows View"
                >
                  <List size={13} />
                </button>
              </div>
            </div>
          </div>

          {/* ── GRID MODE: RESOURCE CARDS ── */}
          {resourceViewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
              {filteredResources.map((file, idx) => {
                const IconComponent = file.icon;
                const resourceThemes = [
                  {
                    border: "border-blue-200/90 dark:border-blue-900/50 hover:border-blue-400",
                    bg: "bg-gradient-to-br from-blue-50/25 via-white to-white dark:from-blue-950/15 dark:via-neutral-900 dark:to-neutral-900",
                    iconBox: "bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300",
                  },
                  {
                    border: "border-amber-200/90 dark:border-amber-900/50 hover:border-amber-400",
                    bg: "bg-gradient-to-br from-amber-50/25 via-white to-white dark:from-amber-950/15 dark:via-neutral-900 dark:to-neutral-900",
                    iconBox: "bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300",
                  },
                  {
                    border: "border-emerald-200/90 dark:border-emerald-900/50 hover:border-emerald-400",
                    bg: "bg-gradient-to-br from-emerald-50/25 via-white to-white dark:from-emerald-950/15 dark:via-neutral-900 dark:to-neutral-900",
                    iconBox: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300",
                  },
                ];

                const theme = resourceThemes[idx % resourceThemes.length];

                return (
                  <div
                    key={file.name}
                    className={`relative overflow-hidden p-5 rounded-2xl border ${theme.border} ${theme.bg} shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-4 group`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div className={`size-10 rounded-2xl ${theme.iconBox} font-semibold text-xs flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}>
                        <IconComponent size={18} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {file.name}
                        </h4>
                        <span className="text-[11px] text-slate-500 dark:text-neutral-400 truncate">
                          {file.type}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-neutral-800/80">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-neutral-400 font-medium">
                        <span className="font-mono">{file.size}</span>
                        <span>•</span>
                        <span>{file.downloads} dl</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => toast.success(`Downloading ${file.name}...`)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-neutral-100 border border-slate-900 dark:border-white transition-all shadow-2xs cursor-pointer"
                      >
                        <Download size={12} />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* ── LIST MODE: FLOATING ROW TILES ── */
            <div className="flex flex-col gap-2.5 w-full">
              {filteredResources.map((file, idx) => {
                const IconComponent = file.icon;
                const rowThemes = [
                  "border-blue-200/80 hover:border-blue-400 bg-gradient-to-r from-blue-50/25 via-white to-white dark:from-blue-950/15 dark:via-neutral-900 dark:to-neutral-900",
                  "border-amber-200/80 hover:border-amber-400 bg-gradient-to-r from-amber-50/25 via-white to-white dark:from-amber-950/15 dark:via-neutral-900 dark:to-neutral-900",
                  "border-emerald-200/80 hover:border-emerald-400 bg-gradient-to-r from-emerald-50/25 via-white to-white dark:from-emerald-950/15 dark:via-neutral-900 dark:to-neutral-900",
                ];

                const iconBgs = [
                  "bg-blue-100 text-blue-700 dark:bg-blue-950/70 dark:text-blue-300",
                  "bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300",
                  "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300",
                ];

                const theme = rowThemes[idx % rowThemes.length];
                const iconBg = iconBgs[idx % iconBgs.length];

                return (
                  <div
                    key={file.name}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border ${theme} shadow-2xs hover:shadow-xs transition-all cursor-pointer group`}
                  >
                    {/* Left: Resource icon & Name */}
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`size-10 rounded-2xl ${iconBg} font-semibold text-xs flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform`}>
                        <IconComponent size={18} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                          {file.name}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-neutral-400 truncate">
                          {file.type}
                        </span>
                      </div>
                    </div>

                    {/* Center/Right: Size, Downloads & Download button */}
                    <div className="flex items-center gap-4 sm:gap-6 self-end sm:self-auto flex-wrap">
                      <span className="text-xs font-mono font-medium text-slate-600 dark:text-neutral-300 tabular-nums">
                        {file.size}
                      </span>

                      <span className="text-[11px] text-slate-500 dark:text-neutral-400 font-medium tabular-nums hidden sm:inline">
                        {file.downloads} downloads
                      </span>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toast.success(`Downloading ${file.name}...`);
                        }}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-neutral-100 border border-slate-900 dark:border-white transition-all shadow-2xs cursor-pointer"
                      >
                        <Download size={13} />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
