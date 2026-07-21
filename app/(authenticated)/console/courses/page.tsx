// app/(authenticated)/content/review/page.tsx
// "Review Courses" page: lists courses the author has submitted for review.
// A course lands here the moment its author presses "Submit for Review" in the
// editor (which flips the course status to SUBMITTED via /api/courses/{id}/submit).
// The actual review/approval pipeline is owned by a teammate — for now this page
// is just the delivery destination that proves a course was handed off for review.
"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { notFound } from 'next/navigation';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';
import { api } from "@/infrastructure/http/api";
import type { CourseResponse } from "@/shared/types/api.types";
import { ArrowLeft, ClipboardCheck, Clock, Inbox, User, Search } from "lucide-react";

// Statuses that count as "in the review queue". SUBMITTED is the one the Submit
// button produces; APPROVED is kept visible so a reviewed course doesn't vanish
// before the teammate's pipeline decides what happens next.
const REVIEW_STATUSES: ReadonlyArray<CourseResponse["status"]> = [
  "SUBMITTED",
  "APPROVED",
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: "bg-yellow-50 text-yellow-700 border-yellow-200",
    SUBMITTED: "bg-blue-50 text-blue-700 border-blue-200",
    APPROVED: "bg-green-50 text-green-700 border-green-200",
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

export default function ReviewCoursesPage() {
  const { user } = useAuthStore();
  if (!AuthorizationService.canReviewCourses(user)) {
    notFound();
  }

  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("TO_BE_REVIEWED");

  const counts = useMemo(() => {
    let toBeReviewed = 0;
    let updations = 0;
    let published = 0;
    courses.forEach((c) => {
      if (c.status === "PUBLISHED") {
        published++;
      } else if (c.status === "SUBMITTED" || c.status === "APPROVED") {
        if (c.wasPublished) updations++;
        else toBeReviewed++;
      }
    });
    return { toBeReviewed, updations, published };
  }, [courses]);

  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (statusFilter === "TO_BE_REVIEWED") {
        if (c.status !== "SUBMITTED" && c.status !== "APPROVED") return false;
        if (c.wasPublished) return false;
      }
      if (statusFilter === "UPDATIONS") {
        if (c.status !== "SUBMITTED" && c.status !== "APPROVED") return false;
        if (!c.wasPublished) return false;
      }
      if (statusFilter === "PUBLISHED" && c.status !== "PUBLISHED") return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!(c.title || "").toLowerCase().includes(q) && !(c.authorName || "").toLowerCase().includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [courses, searchQuery, statusFilter]);

  useEffect(() => {
    api
      .get<CourseResponse[]>("/api/courses/review")
      .then((all) => setCourses(all))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col w-full space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Course Management</h1>
        <p className="text-gray-500">
          Courses submitted for review land here, waiting to be approved.
        </p>
      </header>

      <main className="w-full">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">To be reviewed</span>
            <span className="text-2xl font-bold text-gray-900 mt-1">{counts.toBeReviewed}</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Updations</span>
            <span className="text-2xl font-bold text-gray-900 mt-1">{counts.updations}</span>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm flex flex-col">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Published</span>
            <span className="text-2xl font-bold text-gray-900 mt-1">{counts.published}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <ClipboardCheck size={17} className="text-indigo-500" />
            <h2 className="text-base font-semibold text-gray-800">Course Management</h2>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white shadow-sm flex-shrink-0"
            >
              <option value="TO_BE_REVIEWED">To be reviewed</option>
              <option value="UPDATIONS">Updations</option>
              <option value="PUBLISHED">Published</option>
            </select>
          </div>
        </div>

        {loading ? (
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
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
              <Inbox size={24} className="text-gray-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">No courses awaiting review</p>
              <p className="text-xs text-gray-400 mt-1">
                Open a course and press &quot;Submit for Review&quot; to send it here.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((course) => (
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
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <User size={12} className="text-gray-400" />
                  {course.authorUsername ? (
                    <Link
                      href={`/${course.authorUsername}`}
                      target="_blank"
                      className="hover:text-indigo-600 hover:underline"
                    >
                      {course.authorName}
                    </Link>
                  ) : (
                    course.authorName
                  )}
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
                  href={`/content/published/${course.id}`}
                  className="text-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 rounded-lg py-1.5 transition-colors"
                >
                  Review Course →
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
