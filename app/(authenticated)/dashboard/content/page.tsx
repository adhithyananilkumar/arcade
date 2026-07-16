// app/(authenticated)/dashboard/page.tsx
// Post-login dashboard home ΓÇö Create Content + My Courses grid
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { CourseResponse } from "@/types/api";
import {
  BookOpen,
  Wrench,
  Radio,
  FileText,
  Plus,
  ChevronDown,
  Clock,
  GraduationCap,
  Trash2,
  X,
  Map,
} from "lucide-react";

// ΓöÇΓöÇ Content type menu items ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

const CONTENT_TYPES = [
  {
    id: "course",
    icon: BookOpen,
    label: "Course",
    desc: "Structured learning path with modules & lessons",
    href: "/dashboard/content/course/new",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    id: "workshop",
    icon: Wrench,
    label: "Workshop / Bootcamp",
    desc: "Flexible sessions with videos, activities & resources",
    href: "/dashboard/content/workshop/new",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    id: "webinar",
    icon: Radio,
    label: "Webinar",
    desc: "Live session with Zoom link, date & time",
    href: "/dashboard/content/webinar/new",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    id: "article",
    icon: FileText,
    label: "Article",
    desc: "Standalone rich document authored with the editor",
    href: "/dashboard/content/article/new",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
] as const;

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: "bg-yellow-50 text-yellow-700 border-yellow-200",
    SUBMITTED: "bg-blue-50 text-blue-700 border-blue-200",
    PUBLISHED: "bg-green-50 text-green-700 border-green-200",
    ARCHIVED: "bg-gray-100 text-gray-500 border-gray-200",
  };
  return (
    <span
      className={`inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
        map[status] ?? "bg-gray-100 text-gray-500 border-gray-200"
      }`}
    >
      {status}
    </span>
  );
}

// ΓöÇΓöÇ New Course creation modal ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

function CreateCourseModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const course = await api.post<CourseResponse>("/api/courses", {
        title: name.trim(),
        description: description.trim() || undefined,
      });
      router.push(`/dashboard/content/course/${course.id}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create course");
      setCreating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
            <BookOpen size={20} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">New Course</h3>
            <p className="text-xs text-gray-500">Give it a name to get started.</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label htmlFor="course-name" className="mb-1 block text-sm font-medium text-gray-700">
              Course name <span className="text-red-500">*</span>
            </label>
            <input
              id="course-name"
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Intro to Spring Boot"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300"
            />
          </div>
          <div>
            <label htmlFor="course-desc" className="mb-1 block text-sm font-medium text-gray-700">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              id="course-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will learners get out of this course?"
              className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-300"
            />
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || creating}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
            >
              {creating ? "CreatingΓÇª" : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    api
      .get<CourseResponse[]>("/api/courses")
      .then(setCourses)
      .catch(() => setCourses([]))
      .finally(() => setLoadingCourses(false));
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      {createOpen && <CreateCourseModal onClose={() => setCreateOpen(false)} />}

      {/* ΓöÇΓöÇ Header bar ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      <header className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Content Studio</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Create and manage your educational content
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/roadmaps"
              title="Roadmaps"
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800"
            >
              <Map size={16} />
              Roadmaps
            </Link>
            <Link
              href="/dashboard/trash"
              title="Trash"
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-800"
            >
              <Trash2 size={16} />
              Trash
            </Link>

          {/* Create Content button + Canva-style dropdown */}
          <div className="relative">
            <button
              id="create-content-btn"
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-colors"
            >
              <Plus size={16} />
              Create Content
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {dropdownOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setDropdownOpen(false)}
                />
                {/* Dropdown panel */}
                <div
                  className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-40 overflow-hidden"
                  role="menu"
                >
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Select content type
                    </p>
                  </div>
                  {CONTENT_TYPES.map((type) => {
                    const inner = (
                      <>
                        <div
                          className={`flex-shrink-0 w-9 h-9 rounded-lg ${type.bg} flex items-center justify-center mt-0.5`}
                        >
                          <type.icon size={17} className={type.color} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{type.label}</p>
                          <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                            {type.desc}
                          </p>
                        </div>
                      </>
                    );
                    const cls =
                      "flex items-start gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors w-full text-left";
                    // "Course" opens the creation modal; other types navigate (stubs for now).
                    return type.id === "course" ? (
                      <button
                        key={type.id}
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setDropdownOpen(false);
                          setCreateOpen(true);
                        }}
                        className={cls}
                      >
                        {inner}
                      </button>
                    ) : (
                      <Link
                        key={type.id}
                        href={type.href}
                        role="menuitem"
                        onClick={() => setDropdownOpen(false)}
                        className={cls}
                      >
                        {inner}
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>
          </div>
        </div>
      </header>

      {/* ΓöÇΓöÇ My Courses section ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ */}
      <main className="flex-1 px-8 py-8 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2 mb-5">
          <GraduationCap size={17} className="text-indigo-500" />
          <h2 className="text-base font-semibold text-gray-800">My Courses</h2>
        </div>

        {loadingCourses ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
                <div className="h-4 bg-gray-100 rounded mb-3 w-2/3" />
                <div className="h-3 bg-gray-50 rounded mb-2 w-full" />
                <div className="h-3 bg-gray-50 rounded mb-4 w-3/4" />
                <div className="flex justify-between items-center">
                  <div className="h-5 w-14 bg-gray-100 rounded-full" />
                  <div className="h-7 w-24 bg-gray-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <BookOpen size={24} className="text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">No courses yet</p>
              <p className="text-xs text-gray-400 mt-1">
                Click &quot;Create Content&quot; to build your first course.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="group bg-white rounded-2xl border border-gray-200 hover:border-indigo-200 hover:shadow-md transition-all p-5 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2">
                    {course.title}
                  </h3>
                  <StatusBadge status={course.status} />
                </div>
                {course.description && (
                  <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                )}
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-auto">
                  <Clock size={11} />
                  Last edited:{" "}
                  {new Date(course.updatedAt).toLocaleString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </div>
                <Link
                  href={`/dashboard/content/course/${course.id}/edit`}
                  className="text-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg py-1.5 transition-colors"
                >
                  Continue Editing ΓåÆ
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
