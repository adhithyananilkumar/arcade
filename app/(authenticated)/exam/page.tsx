"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/infrastructure/http/api";
import { Calendar, Play, ClipboardList, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface ExamDto {
  id: string;
  title: string;
  coverImageUrl?: string;
  examSchedule?: string;
}

const pageBg = {
  background: "linear-gradient(180deg, #E9EEFB 0%, #F7F9FC 32%, #FFFFFF 70%)",
};

function ExamSketchToColorArtwork() {
  return (
    <div className="relative flex flex-col items-center justify-center p-2">
      {/* Slowly Moving Authentic Hand-Drawn Pencil Sketch Artwork */}
      <motion.svg
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="w-full max-w-[360px] sm:max-w-[420px] h-auto drop-shadow-sm select-none"
        viewBox="0 0 500 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Authentic Hand-Drawn Pencil Texture Displacement Filter */}
          <filter id="roughPencil" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.8" xChannelSelector="R" yChannelSelector="G" />
          </filter>

          <linearGradient id="sketchBlobGrad" x1="100" y1="100" x2="400" y2="380">
            <stop offset="0%" stopColor="#EEF2FF" />
            <stop offset="50%" stopColor="#F0FDF4" />
            <stop offset="100%" stopColor="#FAF5FF" />
          </linearGradient>
          <linearGradient id="calendarGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F8FAFC" />
          </linearGradient>
          <linearGradient id="headerGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#6366F1" />
          </linearGradient>
        </defs>

        {/* Soft Background Backdrop Blob */}
        <motion.ellipse
          cx="250"
          cy="230"
          rx="195"
          ry="135"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          fill="url(#sketchBlobGrad)"
        />

        {/* Filtered Group applying real rough pencil sketch texture */}
        <g filter="url(#roughPencil)">
          {/* Main Calendar Card (Center Stage) */}
          <motion.rect
            x="130"
            y="80"
            width="240"
            height="210"
            rx="22"
            fill="url(#calendarGrad)"
            stroke="#334155"
            strokeWidth="3.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, fillOpacity: 0 }}
            animate={{ pathLength: 1, fillOpacity: 1 }}
            transition={{
              pathLength: { duration: 1.5, ease: "easeInOut" },
              fillOpacity: { duration: 0.6, delay: 1.2 },
            }}
          />

          {/* Double Pencil Offset Line for Hand-Drawn Sketch Effect */}
          <motion.rect
            x="133"
            y="83"
            width="234"
            height="204"
            rx="20"
            fill="none"
            stroke="#64748B"
            strokeWidth="1.5"
            strokeDasharray="8,4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.6, delay: 0.2 }}
          />

          {/* Calendar Header Bar */}
          <motion.path
            d="M 130 126 L 370 126"
            stroke="#334155"
            strokeWidth="3.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
          <motion.path
            d="M 130 104 C 130 90, 370 90, 370 104 L 370 126 L 130 126 Z"
            fill="url(#headerGrad)"
            stroke="#334155"
            strokeWidth="2.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          />

          {/* Hand-Drawn Calendar Binder Rings */}
          <motion.circle cx="180" cy="80" r="7" fill="#94A3B8" stroke="#1E293B" strokeWidth="2.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.4, delay: 0.8 }} />
          <motion.circle cx="250" cy="80" r="7" fill="#94A3B8" stroke="#1E293B" strokeWidth="2.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.4, delay: 0.9 }} />
          <motion.circle cx="320" cy="80" r="7" fill="#94A3B8" stroke="#1E293B" strokeWidth="2.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.4, delay: 1.0 }} />

          {/* Red Notebook Paper Margin Line */}
          <motion.line
            x1="168"
            y1="135"
            x2="168"
            y2="280"
            stroke="#F87171"
            strokeWidth="2"
            strokeDasharray="6,3"
            opacity="0.8"
            animate={{ opacity: [0.3, 0.8, 0.8, 0.3] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Slow Continuous Animated Handwritten Note Lines */}
          {[
            { y: 160, width: 335, delay: 0.2 },
            { y: 188, width: 315, delay: 0.6 },
            { y: 216, width: 340, delay: 1.0 },
            { y: 244, width: 290, delay: 1.4 },
            { y: 272, width: 310, delay: 1.8 },
          ].map((item, idx) => (
            <g key={idx}>
              {/* Bullet Checkmark */}
              <motion.path
                d={`M 148 ${item.y - 2} L 153 ${item.y + 3} L 161 ${item.y - 5}`}
                stroke="#10B981"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={{ pathLength: [0, 1, 1, 1, 0, 0] }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.3, 0.75, 0.85, 0.95, 1],
                  delay: item.delay,
                }}
              />
              {/* Note Line */}
              <motion.path
                d={`M 180 ${item.y} L ${item.width} ${item.y}`}
                stroke="#475569"
                strokeWidth="3"
                strokeLinecap="round"
                animate={{ pathLength: [0, 1, 1, 1, 0, 0] }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  times: [0, 0.35, 0.75, 0.85, 0.95, 1],
                  delay: item.delay + 0.1,
                }}
              />
            </g>
          ))}

          {/* Hand-Drawn Doodle Stars */}
          <motion.polygon points="75,220 79,232 91,236 79,240 75,252 71,240 59,236 71,232" fill="#3B82F6" stroke="#1E40AF" strokeWidth="1.5" animate={{ scale: [1, 1.25, 1], rotate: [0, 90, 180] }} transition={{ duration: 5, repeat: Infinity }} />
          <motion.polygon points="425,170 428,179 437,182 428,185 425,194 422,185 413,182 422,179" fill="#EC4899" stroke="#9D174D" strokeWidth="1.5" animate={{ scale: [1, 1.2, 1], rotate: [0, -90, -180] }} transition={{ duration: 4.5, repeat: Infinity, delay: 0.5 }} />
        </g>
      </motion.svg>
    </div>
  );
}

export default function ExamDashboard() {
  const router = useRouter();
  const [exams, setExams] = useState<ExamDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const data = await api.get<ExamDto[]>("/api/v1/learning/exams/today");
        setExams(data);
      } catch (err: any) {
        setError(err.message || "Failed to load exams.");
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={pageBg}>
        <div className="size-8 animate-spin rounded-full border-2 border-[#14142b] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4" style={pageBg}>
        <p className="text-[15px] font-semibold text-rose-600">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-full bg-[#14142b] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#232735]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen pb-28" style={pageBg}>
      <div className="mx-auto w-full max-w-6xl px-4 pt-28 sm:px-6 md:px-8 md:pt-32">
        {exams.length > 0 ? (
          <>
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  <ClipboardList size={12} />
                  Exams
                </div>
                <h1 className="text-[1.75rem] font-bold tracking-tight text-[#14142b] sm:text-[2rem]">
                  Today&apos;s exams
                </h1>
                <p className="mt-1.5 text-[13px] font-medium text-slate-500">
                  Scheduled assessments from your enrolled courses.
                </p>
              </div>
              <span className="hidden rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[12px] font-bold tabular-nums text-[#14142b] sm:inline-flex">
                {exams.length} available
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {exams.map((exam) => (
                <article
                  key={exam.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_6px_20px_rgba(20,20,43,0.05)] transition-shadow hover:shadow-[0_10px_28px_rgba(20,20,43,0.08)]"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    {exam.coverImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={exam.coverImageUrl}
                        alt={exam.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    ) : (
                      <div
                        className="flex h-full w-full items-center justify-center"
                        style={{
                          background: "linear-gradient(160deg, #EEF1F8 0%, #DDE3F0 100%)",
                        }}
                      >
                        <span className="text-4xl font-bold text-[#14142b]/25">
                          {exam.title.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h2 className="line-clamp-2 text-[15px] font-bold tracking-tight text-[#14142b]">
                      {exam.title}
                    </h2>
                    <p className="mt-1.5 text-[12px] font-semibold text-slate-400">
                      Available today · single sitting
                    </p>
                    <p className="mt-3 flex-1 text-[12px] leading-relaxed text-slate-500">
                      Once started, you must complete this exam without leaving the secure environment.
                    </p>
                    <button
                      type="button"
                      onClick={() => router.push(`/learn/exam/${exam.id}`)}
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#14142b] px-4 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_16px_rgba(20,20,43,0.16)] transition-colors hover:bg-[#232735]"
                    >
                      <Play size={14} />
                      Start exam
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : (
          /* Clean 2-Column Hero Layout directly on Page Background (No Separate Header Section) */
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="flex min-h-[60vh] items-center justify-center py-6 sm:py-12"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center w-full">
              {/* LEFT COLUMN: Slowly Moving Animated SVG Sketch Artwork (5 cols) */}
              <div className="lg:col-span-5 flex justify-center">
                <ExamSketchToColorArtwork />
              </div>

              {/* RIGHT COLUMN: Clean Title, Subtitle & Action Button (7 cols) */}
              <div className="lg:col-span-7 space-y-4 text-left">
                <h2 className="text-5xl sm:text-6xl font-normal leading-tight text-[#14142b] font-['Great_Vibes',_cursive]">
                  No exams today
                </h2>
                <p className="text-base font-medium text-slate-500 leading-relaxed max-w-md">
                  You don&apos;t have any exams scheduled for today in your enrolled courses.
                </p>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => router.push("/catalog")}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#14142b] px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-900 transition-colors cursor-pointer"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
