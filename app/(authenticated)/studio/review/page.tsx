// app/(authenticated)/studio/review/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { api } from "@/infrastructure/http/api";
import type { CourseResponse } from "@/shared/types/api.types";
import {
  ArrowLeft,
  ClipboardCheck,
  Clock,
  Inbox,
  Search,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Filter,
  ChevronDown,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const REVIEW_STATUSES: ReadonlyArray<CourseResponse["status"]> = [
  "SUBMITTED",
  "APPROVED",
];

function StatusBadge({ status }: { status: string }) {
  const upper = status.toUpperCase();
  if (upper === "SUBMITTED" || upper === "IN_REVIEW") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#e0f2fe] text-[#0284c7] dark:bg-[#0c4a6e]/60 dark:text-[#38bdf8] border border-[#0284c7]/20">
        <span className="w-1.5 h-1.5 rounded-full bg-[#0284c7] animate-pulse" />
        In Review
      </span>
    );
  }
  if (upper === "APPROVED") {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#d1fae5] text-[#10b981] dark:bg-[#065f46]/60 dark:text-[#34d399] border border-[#10b981]/20">
        <CheckCircle2 size={11} /> Approved
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
      <AlertCircle size={11} /> {status}
    </span>
  );
}

export default function ReviewCoursesPage() {
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const STATUS_OPTIONS = [
    { id: "ALL", label: "All Statuses", dot: "bg-[#0284c7]" },
    { id: "SUBMITTED", label: "In Review", dot: "bg-[#0284c7]" },
    { id: "APPROVED", label: "Approved", dot: "bg-[#10b981]" },
  ];

  useEffect(() => {
    api
      .get<CourseResponse[]>("/api/courses")
      .then((all) =>
        setCourses(all.filter((c) => REVIEW_STATUSES.includes(c.status)))
      )
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      if (selectedStatus !== "ALL" && course.status.toUpperCase() !== selectedStatus.toUpperCase()) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = course.title?.toLowerCase().includes(q);
        const matchDesc = course.description?.toLowerCase().includes(q);
        return matchTitle || matchDesc;
      }
      return true;
    });
  }, [courses, selectedStatus, searchQuery]);

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#121212] min-h-screen">
      {/* ── Sticky Top Navigation Header ────────────────────────────────────────── */}
      <div className="sticky top-16 z-30 bg-white dark:bg-[#121212] border-b border-[#dadce0] dark:border-[#3c4043]">
        <header className="bg-white dark:bg-[#202124]">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-4">
            <div>
              <Link
                href="/studio"
                className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-[#64748b] dark:text-[#9aa0a6] hover:text-[#0284c7] dark:hover:text-[#38bdf8] transition-colors"
              >
                <ArrowLeft size={14} />
                Back to Content Studio
              </Link>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold tracking-tight bg-gradient-to-r from-[#0f172a] via-[#0284c7] to-[#06b6d4] dark:from-[#e2e8f0] dark:via-[#38bdf8] dark:to-[#22d3ee] bg-clip-text text-transparent">
                  Review Queue
                </h1>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e0f2fe] dark:bg-[#0c4a6e]/80 text-[#0284c7] dark:text-[#38bdf8] border border-[#0284c7]/20 text-[11px] font-bold shadow-2xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0284c7] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0284c7]"></span>
                  </span>
                  <span>
                    {courses.length} {courses.length === 1 ? "Item Awaiting Review" : "Items Awaiting Review"}
                  </span>
                </div>
              </div>
              <p className="text-xs text-[#64748b] dark:text-[#9aa0a6] mt-1">
                Courses submitted by instructors land here for formal review & publishing approval.
              </p>
            </div>

            {/* Search Filter Bar */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative flex items-center">
                <Search size={16} className="absolute left-3.5 text-[#64748b] dark:text-[#9aa0a6]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search submitted courses..."
                  className="w-64 pl-10 pr-4 py-2 rounded-full bg-[#f1f3f4] dark:bg-[#2d2d2d] border border-transparent focus:border-[#0284c7] focus:bg-white dark:focus:bg-[#202124] text-xs text-[#0f172a] dark:text-[#e8eaed] outline-none transition-all"
                />
              </div>

              {/* Custom Animated Status Filter Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setStatusDropdownOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full border border-[#cbd5e1] dark:border-[#5f6368] bg-white dark:bg-[#202124] px-4 py-2 text-xs font-semibold text-[#334155] dark:text-[#e8eaed] hover:bg-[#f8f9fa] dark:hover:bg-[#2d2d2d] shadow-2xs transition-all active:scale-[0.98]"
                >
                  <Filter size={14} className="text-[#0284c7]" />
                  <span>
                    {STATUS_OPTIONS.find((s) => s.id === selectedStatus)?.label ?? "All Statuses"}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-200 text-gray-400 ${
                      statusDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {statusDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-30"
                        onClick={() => setStatusDropdownOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#202124] rounded-2xl shadow-xl border border-[#dadce0] dark:border-[#3c4043] p-1.5 z-40 overflow-hidden"
                      >
                        {STATUS_OPTIONS.map((status) => {
                          const isSelected = selectedStatus === status.id;
                          return (
                            <button
                              key={status.id}
                              type="button"
                              onClick={() => {
                                setSelectedStatus(status.id);
                                setStatusDropdownOpen(false);
                              }}
                              className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                                isSelected
                                  ? "bg-[#e0f2fe] dark:bg-[#0c4a6e]/50 text-[#0284c7] dark:text-[#38bdf8]"
                                  : "text-[#3c4043] dark:text-[#e8eaed] hover:bg-[#f1f3f4] dark:hover:bg-[#2d2d2d]"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${status.dot}`} />
                                <span>{status.label}</span>
                              </div>
                              {isSelected && <Check size={14} className="text-[#0284c7] dark:text-[#38bdf8]" />}
                            </button>
                          );
                        })}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* ── Scrollable Content Area ────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-[#202124] rounded-[28px] border border-[#dadce0] dark:border-[#3c4043] p-6 animate-pulse"
                >
                  <div className="h-4 bg-[#f1f3f4] dark:bg-[#303134] rounded-md mb-3 w-3/4" />
                  <div className="h-3 bg-[#f1f3f4] dark:bg-[#303134] rounded-md mb-2 w-full" />
                  <div className="h-3 bg-[#f1f3f4] dark:bg-[#303134] rounded-md mb-6 w-2/3" />
                  <div className="flex justify-between items-center pt-4 border-t border-[#f1f3f4] dark:border-[#303134]">
                    <div className="h-5 w-20 bg-[#f1f3f4] dark:bg-[#303134] rounded-full" />
                    <div className="h-8 w-28 bg-[#f1f3f4] dark:bg-[#303134] rounded-full" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : filteredCourses.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 15, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="flex flex-col items-center justify-center py-20 px-6 text-center max-w-md mx-auto"
            >
              <div className="w-16 h-16 rounded-3xl bg-[#e0f2fe] dark:bg-[#0c4a6e]/50 text-[#0284c7] dark:text-[#38bdf8] flex items-center justify-center mb-5 ring-8 ring-[#e0f2fe]/40 dark:ring-[#0c4a6e]/40 border border-[#0284c7]/20 shadow-md">
                <ClipboardCheck size={30} />
              </div>
              <h3 className="text-base font-semibold text-[#0f172a] dark:text-[#e8eaed]">
                No submitted courses in queue
              </h3>
              <p className="text-xs text-[#64748b] dark:text-[#9aa0a6] mt-1.5 leading-relaxed">
                When instructors press &quot;Submit for Review&quot; inside the course editor, their submissions will appear here for review and publication.
              </p>
              <Link
                href="/studio"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#0284c7] to-[#06b6d4] hover:from-[#0369a1] hover:to-[#0891b2] text-white text-xs font-semibold px-6 py-2.5 shadow-md hover:shadow-cyan-500/25 transition-all active:scale-[0.98]"
              >
                Go to Content Studio
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key="list"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredCourses.map((course) => (
                <motion.div
                  key={course.id}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="group bg-white dark:bg-[#202124] rounded-[28px] border border-[#dadce0] dark:border-[#3c4043] hover:border-[#0284c7]/50 dark:hover:border-[#38bdf8]/50 hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between relative overflow-hidden h-full"
                >
                  {/* Top Gradient Accent Strip */}
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#0284c7] via-[#06b6d4] to-[#10b981]" />

                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#e0f2fe] to-[#bae6fd] dark:from-[#0c4a6e] dark:to-[#0369a1] text-[#0284c7] dark:text-[#38bdf8] flex items-center justify-center border border-[#0284c7]/30 shadow-2xs">
                          <BookOpen size={18} />
                        </div>
                        <h3 className="text-sm font-semibold text-[#0f172a] dark:text-[#e8eaed] leading-snug line-clamp-2 group-hover:text-[#0284c7] dark:group-hover:text-[#38bdf8] transition-colors">
                          {course.title}
                        </h3>
                      </div>
                    </div>

                    {course.description && (
                      <p className="text-xs text-[#64748b] dark:text-[#9aa0a6] line-clamp-2 leading-relaxed mb-4">
                        {course.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 mb-4">
                      <StatusBadge status={course.status} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-[11px] text-[#64748b] dark:text-[#9aa0a6] pt-3.5 border-t border-[#f1f3f4] dark:border-[#303134] mb-4">
                      <span className="flex items-center gap-1.5">
                        <Clock size={12} className="text-gray-400" />
                        {course.updatedAt
                          ? new Date(course.updatedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "Recently"}
                      </span>
                    </div>

                    <Link
                      href={`/studio/published/${course.id}`}
                      className="flex items-center justify-center gap-2 w-full rounded-full bg-gradient-to-r from-[#0284c7] to-[#06b6d4] hover:from-[#0369a1] hover:to-[#0891b2] text-white text-xs font-semibold py-2.5 shadow-md hover:shadow-cyan-500/20 transition-all active:scale-[0.98]"
                    >
                      Review Course <ExternalLink size={14} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
