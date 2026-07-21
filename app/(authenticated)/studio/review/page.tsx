// app/(authenticated)/studio/review/page.tsx
// "Review Courses" page: lists courses the author has submitted for review.
// A course lands here the moment its author presses "Submit for Review" in the
// editor (which flips the course status to SUBMITTED via /api/courses/{id}/submit).
// The actual review/approval pipeline is owned by a teammate — for now this page
// is just the delivery destination that proves a course was handed off for review.
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/infrastructure/http/api";
import type { CourseResponse } from "@/shared/types/api.types";
import { ArrowLeft, ClipboardCheck, Clock, Inbox } from "lucide-react";

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
  const [courses, setCourses] = useState<CourseResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<CourseResponse[]>("/api/courses")
      .then((all) =>
        setCourses(all.filter((c) => REVIEW_STATUSES.includes(c.status)))
      )
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-8 py-5">
        <div className="max-w-6xl mx-auto">
          <Link
            href="/studio"
            className="mb-2 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={14} />
            Content Studio
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Review Courses</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Courses submitted for review land here, waiting to be approved.
          </p>
        </div>
      </header>

      <main className="flex-1 px-8 py-8 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2 mb-5">
          <ClipboardCheck size={17} className="text-indigo-500" />
          <h2 className="text-base font-semibold text-gray-800">Awaiting Review</h2>
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
        ) : courses.length === 0 ? (
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
                  href={`/studio/published/${course.id}`}
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
