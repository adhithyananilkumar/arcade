"use client";

import { useEffect, useState, useMemo } from "react";
import { notFound } from "next/navigation";
import { useAuthStore } from "@/infrastructure/auth/auth.store";
import { AuthorizationService } from "@/infrastructure/auth/authorization.service";
import { api } from "@/infrastructure/http/api";
import type { CourseResponse } from "@/shared/types/api.types";
import { Calendar, Save, Plus, Trash2, X, Search, BookOpen, User } from "lucide-react";
import { toast } from "sonner";

function getAvatarUrl(url?: string | null) {
  if (!url) return undefined;
  if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) return url;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
  if (url.startsWith("/api/v1/")) {
    return baseUrl.replace("/api/v1", "") + url;
  }
  if (!url.includes("/")) {
    return `${baseUrl}/users/avatars/${url}`;
  }
  return baseUrl + (url.startsWith("/") ? "" : "/") + url;
}

function parseSlots(raw?: string | null) {
  if (!raw || raw === "[]") return [] as { dayOfWeek: string; startTime: string; endTime: string }[];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function ExamSchedulesPage() {
  const { user } = useAuthStore();
  if (!AuthorizationService.canReviewPlatformContent(user)) {
    notFound();
  }

  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);

  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [scheduleSlots, setScheduleSlots] = useState<
    { dayOfWeek: string; startTime: string; endTime: string }[]
  >([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = () => {
    setLoading(true);
    api
      .get<CourseResponse[]>("/api/courses/review")
      .then((all) => setCourses(all.filter((c) => c.status === "PUBLISHED")))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  };

  const filteredCourses = useMemo(() => {
    if (!searchQuery) return courses;
    const q = searchQuery.toLowerCase();
    return courses.filter(
      (c) =>
        (c.title || "").toLowerCase().includes(q) ||
        (c.authorName || "").toLowerCase().includes(q),
    );
  }, [courses, searchQuery]);

  const handleEditClick = (course: CourseResponse) => {
    setEditingCourseId(course.id);
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

  const updateSlot = (
    index: number,
    field: keyof (typeof scheduleSlots)[0],
    value: string,
  ) => {
    const next = [...scheduleSlots];
    next[index] = { ...next[index], [field]: value };
    setScheduleSlots(next);
  };

  const handleSave = async (courseId: string) => {
    try {
      setSaving(true);
      const scheduleString = scheduleSlots.length > 0 ? JSON.stringify(scheduleSlots) : "";
      await api.patch(`/api/courses/${courseId}/exam-schedule`, {
        examSchedule: scheduleString,
      });
      setEditingCourseId(null);
      fetchCourses();
      toast.success("Exam schedule saved");
    } catch {
      toast.error("Failed to update exam schedule");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex w-full flex-col h-full space-y-5 pb-6">
      <div className="flex-none relative max-w-md">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search courses or authors…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-[13px] font-medium text-[#14142b] outline-none placeholder:text-slate-400 focus:border-[#14142b]/30 focus:ring-4 focus:ring-slate-200/60"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="size-8 animate-spin rounded-full border-2 border-[#14142b] border-t-transparent" />
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-200 bg-white/70 py-20 text-center">
          <Calendar size={28} className="text-slate-300" />
          <p className="text-sm font-semibold text-[#14142b]">No published courses found</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto pr-2 pb-12">
          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {filteredCourses.map((course) => {
            const slots = parseSlots(course.examSchedule);
            const avatar = getAvatarUrl(course.authorAvatarUrl);
            const editing = editingCourseId === course.id;

            return (
              <article
                key={course.id}
                className="overflow-hidden rounded-xl border border-slate-200/80 bg-white/95 shadow-[0_4px_16px_rgba(20,20,43,0.04)]"
              >
                <div className="flex gap-3 p-4 sm:gap-4">
                  {/* Cover / logo preview */}
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-24 sm:w-24">
                    {course.coverImageUrl ? (
                      <img
                        src={course.coverImageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center"
                        style={{
                          background: "linear-gradient(160deg, #EEF1F8 0%, #E4E8F2 100%)",
                        }}
                      >
                        <BookOpen size={22} className="text-slate-400" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-[15px] font-bold tracking-tight text-[#14142b]">
                          {course.title}
                        </h3>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                            {avatar ? (
                              <img
                                src={avatar}
                                alt=""
                                className="h-full w-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <User size={12} className="text-slate-400" />
                            )}
                          </div>
                          <p className="truncate text-[12px] font-semibold text-slate-500">
                            {course.authorName || "Unknown author"}
                          </p>
                        </div>
                      </div>
                      {!editing && (
                        <button
                          type="button"
                          onClick={() => handleEditClick(course)}
                          className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-semibold text-[#14142b] transition-colors hover:border-slate-300"
                        >
                          Edit
                        </button>
                      )}
                    </div>

                    {!editing && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {slots.length === 0 ? (
                          <span className="inline-flex items-center gap-1 text-[12px] font-medium text-slate-400">
                            <Calendar size={12} /> No schedule set
                          </span>
                        ) : (
                          slots.map((s, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-[#14142b]"
                            >
                              <Calendar size={11} className="text-slate-400" />
                              {s.dayOfWeek} · {s.startTime}–{s.endTime}
                            </span>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {editing && (
                  <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-4">
                    <div className="mb-3 flex items-center justify-between">
                      <h4 className="text-[13px] font-bold text-[#14142b]">Edit schedule</h4>
                      <button
                        type="button"
                        onClick={() => setEditingCourseId(null)}
                        className="rounded-full p-1 text-slate-400 hover:bg-white hover:text-[#14142b]"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {scheduleSlots.map((slot, i) => (
                        <div
                          key={i}
                          className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2.5"
                        >
                          <select
                            value={slot.dayOfWeek}
                            onChange={(e) => updateSlot(i, "dayOfWeek", e.target.value)}
                            className="min-w-[120px] flex-1 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[12px] font-medium text-[#14142b] outline-none focus:border-[#14142b]/30"
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
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => updateSlot(i, "startTime", e.target.value)}
                            className="rounded-lg border border-slate-200 px-2.5 py-2 text-[12px] font-medium outline-none focus:border-[#14142b]/30"
                          />
                          <span className="text-[11px] font-medium text-slate-400">to</span>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => updateSlot(i, "endTime", e.target.value)}
                            className="rounded-lg border border-slate-200 px-2.5 py-2 text-[12px] font-medium outline-none focus:border-[#14142b]/30"
                          />
                          <button
                            type="button"
                            onClick={() => removeSlot(i)}
                            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={addSlot}
                      className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#14142b] hover:underline"
                    >
                      <Plus size={14} /> Add time slot
                    </button>

                    <div className="mt-4 flex justify-end gap-2 border-t border-slate-200 pt-3">
                      <button
                        type="button"
                        onClick={() => setEditingCourseId(null)}
                        className="rounded-full border border-slate-200 bg-white px-3.5 py-2 text-[12px] font-semibold text-slate-600 hover:border-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSave(course.id)}
                        disabled={saving}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#14142b] px-4 py-2 text-[12px] font-semibold text-white hover:bg-[#232735] disabled:opacity-60"
                      >
                        <Save size={13} />
                        {saving ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
          </div>
        </div>
      )}
    </div>
  );
}
