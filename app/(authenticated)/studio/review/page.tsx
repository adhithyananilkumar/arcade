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
import { ArrowLeft, ClipboardCheck, Clock, Inbox, ArrowRight } from "lucide-react";

// Statuses that count as "in the review queue". SUBMITTED is the one the Submit
// button produces; APPROVED is kept visible so a reviewed course doesn't vanish
// before the teammate's pipeline decides what happens next.
const REVIEW_STATUSES: ReadonlyArray<CourseResponse["status"]> = [
  "SUBMITTED",
  "APPROVED",
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string; border: string; label: string }> = {
    SUBMITTED: {
      bg: "bg-blue-50/70",
      text: "text-blue-700",
      border: "border-blue-200/50",
      label: "Submitted",
    },
    APPROVED: {
      bg: "bg-emerald-50/70",
      text: "text-emerald-700",
      border: "border-emerald-200/50",
      label: "Approved",
    },
  };
  const style = map[status] || {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-200/50",
    label: status,
  };
  return (
    <span
      className={`inline-flex items-center text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${style.bg} ${style.text} ${style.border} tracking-wide uppercase`}
    >
      {style.label}
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
    <div className="flex-1 flex flex-col bg-[#F8FAFC] min-h-screen">
      <main className="flex-1 px-8 py-8 max-w-5xl mx-auto w-full select-none">
        {/* Back Link & Title (Rendered directly on the background below global navbar) */}
        <div className="flex flex-col gap-1.5 mb-8">
          <Link
            href="/studio"
            className="group inline-flex items-center gap-1.5 text-[11px] font-extrabold text-slate-400 hover:text-slate-700 uppercase tracking-wider transition-colors outline-hidden w-fit"
          >
            <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-0.5" />
            Content Studio
          </Link>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight mt-1">Review Courses</h1>
          <p className="text-xs text-slate-400 font-semibold">
            Courses submitted for review land here, waiting to be approved.
          </p>
        </div>

        {/* Section title */}
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100/50 flex items-center justify-center shadow-3xs">
            <ClipboardCheck size={16} className="text-indigo-600" />
          </div>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Awaiting Review</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border border-slate-150 p-5 shadow-2xs animate-pulse flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="h-4.5 bg-slate-100 rounded-md w-3/4" />
                  <div className="h-4.5 bg-slate-100 rounded-full w-14" />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="h-3 bg-slate-50 rounded-md w-full" />
                  <div className="h-3 bg-slate-50 rounded-md w-5/6" />
                </div>
                <div className="h-3 bg-slate-50 rounded-md w-1/2 mt-2" />
                <div className="h-9 bg-slate-100 rounded-xl w-full mt-4" />
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white border border-slate-150/80 rounded-3xl p-16 shadow-2xs flex flex-col items-center justify-center text-center gap-2 max-w-lg mx-auto mt-8 transition-all hover:shadow-xs">
            <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center shadow-3xs mb-2">
              <Inbox size={26} className="text-blue-650" />
            </div>
            <h3 className="text-sm font-black text-slate-800 tracking-tight mt-1">No courses awaiting review</h3>
            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed max-w-xs mt-0.5">
              Open a course inside your content studio and press &quot;Submit for Review&quot; to send it here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="group bg-white rounded-3xl border border-slate-150/80 hover:border-[#d2e3fc] hover:shadow-xs transition-all p-5 flex flex-col gap-4 relative"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-black text-slate-800 leading-snug line-clamp-2">
                    {course.title}
                  </h3>
                  <StatusBadge status={course.status} />
                </div>
                {course.description && (
                  <p className="text-[11px] text-slate-400 font-semibold line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                )}
                <div className="flex items-center gap-1.5 text-[10.5px] text-slate-400 font-semibold mt-auto pt-2">
                  <Clock size={12} className="text-slate-400" />
                  <span>
                    Last edited:{" "}
                    {new Date(course.updatedAt).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </span>
                </div>
                <Link
                  href={`/studio/published/${course.id}`}
                  className="w-full text-center text-xs font-black text-[#1a73e8] bg-[#e8f0fe]/70 hover:bg-[#e8f0fe] border border-[#d2e3fc]/80 rounded-xl py-2.5 transition-all outline-hidden flex items-center justify-center gap-1.5 group-hover:shadow-3xs"
                >
                  <span>Review Course</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
