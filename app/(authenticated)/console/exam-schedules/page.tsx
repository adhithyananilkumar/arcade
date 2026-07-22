"use client";

import { useEffect, useState, useMemo } from "react";
import { notFound } from 'next/navigation';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';
import { api } from "@/infrastructure/http/api";
import type { CourseResponse } from "@/shared/types/api.types";
import { Calendar, Save, Plus, Trash2, X, Search } from "lucide-react";

export default function ExamSchedulesPage() {
  const { user } = useAuthStore();
  if (!AuthorizationService.canReviewCourses(user)) {
    notFound();
  }

  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [scheduleSlots, setScheduleSlots] = useState<{ dayOfWeek: string; startTime: string; endTime: string }[]>([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = () => {
    setLoading(true);
    api
      .get<CourseResponse[]>("/api/courses/review")
      .then((all) => setCourses(all.filter(c => c.status === "PUBLISHED")))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  };

  const filteredCourses = useMemo(() => {
    if (!searchQuery) return courses;
    const q = searchQuery.toLowerCase();
    return courses.filter((c) => 
      (c.title || "").toLowerCase().includes(q) || 
      (c.authorName || "").toLowerCase().includes(q)
    );
  }, [courses, searchQuery]);

  const handleEditClick = (course: CourseResponse) => {
    setEditingCourseId(course.id);
    if (course.examSchedule) {
      try {
        setScheduleSlots(JSON.parse(course.examSchedule));
      } catch {
        setScheduleSlots([]);
      }
    } else {
      setScheduleSlots([]);
    }
  };

  const addSlot = () => {
    setScheduleSlots([...scheduleSlots, { dayOfWeek: "Monday", startTime: "09:00", endTime: "17:00" }]);
  };

  const removeSlot = (index: number) => {
    setScheduleSlots(scheduleSlots.filter((_, i) => i !== index));
  };

  const updateSlot = (index: number, field: keyof typeof scheduleSlots[0], value: string) => {
    const next = [...scheduleSlots];
    next[index] = { ...next[index], [field]: value };
    setScheduleSlots(next);
  };

  const handleSave = async (courseId: string) => {
    try {
      const scheduleString = scheduleSlots.length > 0 ? JSON.stringify(scheduleSlots) : "";
      await api.patch(`/api/courses/${courseId}/exam-schedule`, { examSchedule: scheduleString });
      setEditingCourseId(null);
      fetchCourses();
    } catch (e) {
      alert("Failed to update exam schedule");
    }
  };

  return (
    <div className="flex flex-col w-full space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Exam Schedules</h1>
        <p className="text-gray-500">
          Manage exam schedules for all published courses.
        </p>
      </header>

      <main className="w-full">
        <div className="flex items-center gap-3 w-full sm:w-auto mb-6">
          <div className="relative flex-1 sm:flex-none">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search published courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full sm:w-80 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-gray-500">Loading courses...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Calendar size={24} className="text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">No published courses found</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col gap-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">{course.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">Author: {course.authorName}</p>
                  </div>
                  {editingCourseId !== course.id && (
                    <button
                      onClick={() => handleEditClick(course)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Edit Schedule
                    </button>
                  )}
                </div>

                {editingCourseId === course.id ? (
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mt-2">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-semibold text-gray-800">Edit Schedule</h4>
                      <button onClick={() => setEditingCourseId(null)} className="text-gray-400 hover:text-gray-600">
                        <X size={16} />
                      </button>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      {scheduleSlots.map((slot, i) => (
                        <div key={i} className="flex flex-wrap items-center gap-2">
                          <select
                            value={slot.dayOfWeek}
                            onChange={(e) => updateSlot(i, "dayOfWeek", e.target.value)}
                            className="flex-1 min-w-[120px] rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                          <input
                            type="time"
                            value={slot.startTime}
                            onChange={(e) => updateSlot(i, "startTime", e.target.value)}
                            className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <span className="text-gray-500 text-sm">to</span>
                          <input
                            type="time"
                            value={slot.endTime}
                            onChange={(e) => updateSlot(i, "endTime", e.target.value)}
                            className="w-32 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <button
                            type="button"
                            onClick={() => removeSlot(i)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={addSlot}
                      className="mt-3 flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                    >
                      <Plus size={16} /> Add Time Slot
                    </button>

                    <div className="mt-6 flex justify-end gap-3 border-t border-gray-200 pt-4">
                      <button
                        onClick={() => setEditingCourseId(null)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSave(course.id)}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                      >
                        <Save size={14} /> Save Schedule
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    {course.examSchedule && course.examSchedule !== "[]" ? (
                      <div className="flex flex-wrap gap-2">
                        {(() => {
                          try {
                            const slots = JSON.parse(course.examSchedule);
                            if (!slots || slots.length === 0) return <span className="text-sm text-gray-500">No schedule</span>;
                            return slots.map((s: any, idx: number) => (
                              <div key={idx} className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5">
                                <Calendar size={12} />
                                {s.dayOfWeek} • {s.startTime} - {s.endTime}
                              </div>
                            ));
                          } catch {
                            return <span className="text-sm text-gray-500">Invalid schedule format</span>;
                          }
                        })()}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400 flex items-center gap-1.5">
                        <Calendar size={14} /> No exam schedule set
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
