/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useMemo } from "react";
import { notFound } from "next/navigation";
import { useAuthStore } from "@/infrastructure/auth/auth.store";
import { AuthorizationService } from "@/infrastructure/auth/authorization.service";
import { api } from "@/infrastructure/http/api";
import type { CourseResponse } from "@/shared/types/api.types";
import { getAvatarUrl } from "@/shared/utils/avatar";
import { 
  Calendar, 
  Save, 
  Plus, 
  Trash2, 
  X, 
  Search, 
  BookOpen, 
  Clock, 
  Edit3, 
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/design-system/ui/dialog';
import { toast } from "sonner";

interface SlotItem {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

function parseSlots(raw?: string | null): SlotItem[] {
  if (!raw || raw === "[]") return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function ExamSchedulesPage() {
  const { user } = useAuthStore();
  if (!AuthorizationService.canManageExams(user)) {
    notFound();
  }

  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"ALL" | "SCHEDULED" | "UNSCHEDULED">("ALL");
  const [saving, setSaving] = useState(false);

  // Modal editor state
  const [selectedCourse, setSelectedCourse] = useState<CourseResponse | null>(null);
  const [scheduleSlots, setScheduleSlots] = useState<SlotItem[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchCourses = () => {
    setLoading(true);
    api
      .get<CourseResponse[]>("/api/courses/review")
      .then((all) => setCourses(all.filter((c) => c.status === "PUBLISHED")))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const counts = useMemo(() => {
    let scheduled = 0;
    let unscheduled = 0;
    courses.forEach((c) => {
      const slots = parseSlots(c.examSchedule);
      if (slots.length > 0) scheduled++;
      else unscheduled++;
    });
    return { all: courses.length, scheduled, unscheduled };
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const slots = parseSlots(c.examSchedule);
      if (filterMode === "SCHEDULED" && slots.length === 0) return false;
      if (filterMode === "UNSCHEDULED" && slots.length > 0) return false;

      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          (c.title || "").toLowerCase().includes(q) ||
          (c.authorName || "").toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [courses, filterMode, searchQuery]);

  const totalPages = Math.ceil(filteredCourses.length / pageSize);
  const paginatedCourses = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCourses.slice(start, start + pageSize);
  }, [filteredCourses, page]);

  const handleOpenEditModal = (course: CourseResponse) => {
    setSelectedCourse(course);
    setScheduleSlots(parseSlots(course.examSchedule));
  };

  const addSlot = () => {
    setScheduleSlots([
      ...scheduleSlots,
      { dayOfWeek: "Monday", startTime: "09:00", endTime: "17:00" },
    ]);
  };

  const removeSlot = (index: number) => {
    setScheduleSlots(scheduleSlots.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: keyof SlotItem, value: string) => {
    const next = [...scheduleSlots];
    next[index] = { ...next[index], [field]: value };
    setScheduleSlots(next);
  };

  const handleSave = async () => {
    if (!selectedCourse) return;
    try {
      setSaving(true);
      const scheduleString = scheduleSlots.length > 0 ? JSON.stringify(scheduleSlots) : "";
      await api.patch(`/api/courses/${selectedCourse.id}/exam-schedule`, {
        examSchedule: scheduleString,
      });
      setSelectedCourse(null);
      fetchCourses();
      toast.success("Exam schedule saved successfully");
    } catch {
      toast.error("Failed to update exam schedule");
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: "ALL", label: "All Courses", count: counts.all },
    { id: "SCHEDULED", label: "Scheduled", count: counts.scheduled },
    { id: "UNSCHEDULED", label: "No Schedule", count: counts.unscheduled },
  ];

  return (
    <div className="flex w-full flex-col h-full space-y-4 pb-6">
      {/* Top Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Status Segmented Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200/90 bg-white p-1 shadow-2xs">
          {TABS.map((tab) => {
            const isActive = filterMode === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setFilterMode(tab.id as "ALL" | "SCHEDULED" | "UNSCHEDULED");
                  setPage(1);
                }}
                className={`inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#14142b] text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10.5px] font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Refresh Actions */}
        <div className="flex items-center gap-2">
          <div className="relative min-w-[240px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
            <input
              type="text"
              placeholder="Search courses or authors..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-slate-200/90 bg-white py-1.5 pl-8 pr-7 text-xs font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={fetchCourses}
            title="Refresh courses"
            className="flex size-8 items-center justify-center rounded-xl border border-slate-200/90 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 shadow-2xs transition-colors"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-slate-800" : ""} />
          </button>
        </div>
      </div>

      {/* Main Table View */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white py-20 text-center shadow-2xs">
          <div className="flex flex-col items-center justify-center gap-2.5">
            <div className="size-6 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
            <span className="text-xs font-medium text-slate-500">Loading published courses...</span>
          </div>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white py-16 text-center shadow-2xs">
          <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <Calendar size={22} />
            </div>
            <p className="text-sm font-bold text-slate-800">No courses found</p>
            <p className="text-xs text-slate-500">
              {searchQuery
                ? "No published courses match your search query."
                : "No courses found under the current filter view."}
            </p>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="mt-2 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                Clear search
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_24px_-4px_rgba(20,20,43,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/75 backdrop-blur-xs text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-6 font-semibold w-[30%]">Course</th>
                  <th className="py-3.5 px-4 font-semibold w-[20%]">Instructor</th>
                  <th className="py-3.5 px-4 font-semibold w-[28%]">Active Schedule</th>
                  <th className="py-3.5 px-4 font-semibold w-[12%]">Status</th>
                  <th className="py-3.5 px-6 font-semibold text-right w-[10%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedCourses.map((course) => {
                  const slots = parseSlots(course.examSchedule);
                  const avatar = getAvatarUrl(course.authorAvatarUrl);
                  const authorInitial = (course.authorName || 'I').charAt(0).toUpperCase();
                  const isScheduled = slots.length > 0;

                  return (
                    <tr
                      key={course.id}
                      className="group hover:bg-slate-50/80 transition-all duration-150"
                    >
                      {/* Course Column */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-50 via-slate-50 to-indigo-100/70 text-indigo-600 overflow-hidden shrink-0 border border-indigo-200/50 shadow-2xs font-bold text-sm group-hover:scale-105 transition-transform">
                            {course.coverImageUrl ? (
                              <img
                                src={course.coverImageUrl}
                                alt={course.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <BookOpen size={16} className="text-indigo-600" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-[260px]">
                            <p className="truncate text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                              {course.title}
                            </p>
                            <p className="truncate text-[10.5px] text-slate-400 font-mono mt-0.5">
                              ID: {course.id.slice(0, 8)}…
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Instructor Column */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5 min-w-0 max-w-[190px]">
                          {avatar ? (
                            <img
                              src={avatar}
                              alt=""
                              className="size-7 rounded-full border border-slate-200 object-cover shrink-0"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-tr from-slate-100 to-slate-200/90 text-slate-700 font-bold text-[11px] border border-slate-200/80 shrink-0">
                              {authorInitial}
                            </div>
                          )}
                          <div className="min-w-0 truncate">
                            <p className="truncate font-semibold text-xs text-slate-800">
                              {course.authorName || "Unknown Author"}
                            </p>
                            <p className="truncate text-[10.5px] text-slate-400">Instructor</p>
                          </div>
                        </div>
                      </td>

                      {/* Schedule Chips Column */}
                      <td className="py-4 px-4">
                        {slots.length === 0 ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium italic">
                            <Clock size={12} />
                            No schedule set
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1.5 max-w-[280px]">
                            {slots.map((s, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700"
                              >
                                <Calendar size={11} className="text-slate-400" />
                                {s.dayOfWeek.slice(0, 3)} · {s.startTime}–{s.endTime}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Status Column */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border ${
                            isScheduled
                              ? "border-emerald-200/80 bg-emerald-50 text-emerald-700"
                              : "border-amber-200/80 bg-amber-50 text-amber-700"
                          }`}
                        >
                          <span
                            className={`size-1.5 rounded-full ${
                              isScheduled ? "bg-emerald-500" : "bg-amber-500"
                            }`}
                          />
                          {isScheduled ? "Scheduled" : "Unscheduled"}
                        </span>
                      </td>

                      {/* Actions Column */}
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(course)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                          <Edit3 size={12} className="text-indigo-600" />
                          <span>Edit Schedule</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Clean Footer Pagination */}
      {filteredCourses.length > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white px-5 py-3 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-500 shadow-2xs">
          <div>
            Showing <span className="font-semibold text-slate-800">{(page - 1) * pageSize + 1}</span>–
            <span className="font-semibold text-slate-800">
              {Math.min(page * pageSize, filteredCourses.length)}
            </span>{" "}
            of <span className="font-semibold text-slate-800">{filteredCourses.length}</span> courses
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft size={13} />
                <span>Prev</span>
              </button>

              <span className="px-2 font-medium text-slate-700">
                {page} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ChevronRight size={13} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Edit Schedule Dialog Modal */}
      {selectedCourse && (
        <Dialog open={!!selectedCourse} onOpenChange={(open) => !open && setSelectedCourse(null)}>
          <DialogContent className="max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar size={18} className="text-indigo-600" />
                Edit Exam Schedule
              </DialogTitle>
              <p className="text-xs text-slate-500 mt-1">
                Configure exam availability windows for <span className="font-semibold text-slate-800">{selectedCourse.title}</span>.
              </p>
            </DialogHeader>

            {/* Time Slot Rows */}
            <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
              {scheduleSlots.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center">
                  <Clock size={20} className="mx-auto mb-1 text-slate-400" />
                  <p className="text-xs font-semibold text-slate-700">No time slots configured</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Click the button below to add exam schedule windows.</p>
                </div>
              ) : (
                scheduleSlots.map((slot, i) => (
                  <div
                    key={i}
                    className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/40 p-3"
                  >
                    <select
                      value={slot.dayOfWeek}
                      onChange={(e) => updateSlot(i, "dayOfWeek", e.target.value)}
                      className="min-w-[120px] flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-800 outline-none focus:border-slate-400"
                    >
                      {[
                        "Monday",
                        "Tuesday",
                        "Wednesday",
                        "Thursday",
                        "Friday",
                        "Saturday",
                        "Sunday",
                      ].map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => updateSlot(i, "startTime", e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-slate-400"
                      />
                      <span className="text-[11px] font-medium text-slate-400">to</span>
                      <input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => updateSlot(i, "endTime", e.target.value)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-medium text-slate-800 outline-none focus:border-slate-400"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => removeSlot(i)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors shrink-0"
                      title="Remove slot"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-3">
              <button
                type="button"
                onClick={addSlot}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                <Plus size={14} /> Add new time slot
              </button>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#14142b] hover:bg-[#232735] px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 transition-all"
              >
                <Save size={13} />
                <span>{saving ? "Saving…" : "Save Schedule"}</span>
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
