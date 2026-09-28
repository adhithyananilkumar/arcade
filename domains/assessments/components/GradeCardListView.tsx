"use client";

// The grade cards and transcripts issued to a learner — My Learning > Exams. Pure UI: the host
// fetches the cards and decides where opening one goes.

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Award, ChevronRight, Loader2 } from "lucide-react";
import type { GradeCardResponse } from "../types";
import { planKindLabel } from "../lib/planTypeMeta";

export function GradeCardListView({
  loading,
  cards,
  searchQuery,
  onOpen,
}: {
  loading: boolean;
  cards: GradeCardResponse[];
  /** Filters by exam or plan name; the list is small, so this stays in the browser. */
  searchQuery: string;
  onOpen: (id: string) => void;
}) {
  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return cards;
    const q = searchQuery.toLowerCase().trim();
    return cards.filter((c) => (c.examTitle ?? "").toLowerCase().includes(q) || (c.planName ?? "").toLowerCase().includes(q));
  }, [cards, searchQuery]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin text-slate-400" size={28} />
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="py-10 px-4 text-center flex flex-col items-center justify-center">
        <GradeCardsDoodle />
        <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
          {searchQuery ? "No grade cards match your search" : "No grade cards yet"}
        </p>
        <p className="mt-1 max-w-sm text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
          Every exam you finish issues a grade card with your marks, and completing a course with graded assessments issues a verified transcript.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 shadow-[0_8px_30px_rgba(20,20,43,0.05)] divide-y divide-slate-100 dark:divide-slate-800/80">
      {filtered.map((card) => (
        <button
          key={card.id}
          type="button"
          onClick={() => onOpen(card.id)}
          className="group flex w-full cursor-pointer items-center gap-4 px-5 py-4.5 text-left transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200/60 dark:border-violet-800/60 group-hover:scale-105 transition-transform">
            <Award size={20} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm sm:text-base font-bold text-[#14142b] dark:text-white group-hover:text-[#2962D6] dark:group-hover:text-[#3B82F6] transition-colors">
              {card.examTitle}
            </span>
            <span className="block text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              {card.kind === "CONTENT_TRANSCRIPT"
                ? "Assessment transcript"
                : [
                    card.sitting?.planType ? planKindLabel(card.sitting.planType, card.sitting.graded) : null,
                    card.planName,
                    card.sitting ? `Attempt ${card.sitting.attemptNumber}` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || "Grade card"}{" "}
              ·{" "}
              {new Date(card.issuedAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
              {card.revoked && " · revoked"}
            </span>
          </span>
          <span
            className={`shrink-0 text-sm font-bold tabular-nums px-2.5 py-1 rounded-full border ${
              card.sitting && !card.sitting.graded
                ? "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800"
                : card.passed
                ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700"
            }`}
          >
            {card.percentage}%
          </span>
          <ChevronRight size={18} className="shrink-0 text-slate-300 dark:text-slate-600 group-hover:text-slate-500 dark:group-hover:text-slate-300 transition-colors" />
        </button>
      ))}
    </div>
  );
}

function GradeCardsDoodle() {
  return (
    <motion.div
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 0.82 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative mb-3 flex items-center justify-center select-none opacity-85 hover:opacity-100 transition-opacity"
    >
      <svg
        width="110"
        height="100"
        viewBox="0 0 110 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10"
      >
        {/* Soft violet background glow ellipse */}
        <ellipse cx="55" cy="50" rx="38" ry="32" className="fill-violet-500/10 dark:fill-violet-500/15" />

        {/* Tilted background card */}
        <rect
          x="26"
          y="22"
          width="48"
          height="60"
          rx="8"
          transform="rotate(-8 26 22)"
          className="fill-slate-100 dark:fill-slate-800 stroke-slate-300 dark:stroke-slate-700"
          strokeWidth="1.5"
        />

        {/* Main Certificate / Grade Card */}
        <rect
          x="32"
          y="18"
          width="52"
          height="64"
          rx="10"
          className="fill-white dark:fill-slate-900 stroke-slate-800 dark:stroke-slate-200"
          strokeWidth="2"
        />

        {/* Decorative Laurel / Medal Award Circle */}
        <circle cx="58" cy="38" r="11" className="fill-violet-50 dark:fill-violet-950/60 stroke-violet-500 dark:stroke-violet-400" strokeWidth="1.5" />
        <path d="M54 38L57 41L63 35" className="stroke-violet-600 dark:stroke-violet-300" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Grade Ribbon Tails */}
        <path d="M54 48L51 58L56 55L60 58L58 48" className="fill-violet-100 dark:fill-violet-900/60 stroke-violet-500 dark:stroke-violet-400" strokeWidth="1.2" strokeLinejoin="round" />

        {/* Lines representing scores */}
        <path d="M42 66H74" className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="2" strokeLinecap="round" />
        <path d="M48 72H68" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="1.5" strokeLinecap="round" />

        {/* Sparkles */}
        <path d="M18 36L19 32L23 31L19 30L18 26L17 30L13 31L17 32Z" className="fill-amber-400 dark:fill-amber-300" />
        <path d="M90 28L91 25L94 24L91 23L90 20L89 23L86 24L89 25Z" className="fill-violet-400" />
      </svg>
    </motion.div>
  );
}
