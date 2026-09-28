"use client";

// Learner dock > Exams. The main exams a learner registers for — certifications (tied ones too,
// which require completing their course or event first) and standalone exams. Assessments that live
// inside a course or event are sat from that content, not listed here.
//
// Everything a card shows — status, prerequisite state, fee, windows — is computed server-side by
// ExamHubService; this page only fetches and lays it out.

import { useDeferredValue, useState, useRef, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  Award,
  ChevronRight,
  ClipboardCheck,
  Loader2,
  Search,
  X,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import {
  ExamHubCardView,
  getAvailableHubExams,
  getMyGradeCards,
  getMyHubExams,
  planKindLabel,
  type ExamHubCard,
  type GradeCardResponse,
} from "@/domains/assessments";
import { examRoutes } from "@/shared/routes/content.routes";

type Tab = "mine" | "available" | "cards";

const EXAMS_MESSAGES = [
  "Earn verified certifications and standalone credentials",
  "Track your upcoming and in-progress assessments",
  "Review grades, scores, and performance transcripts",
  "Prepare and sit your registered exams anytime",
];

export default function ExamsHubPage() {
  return (
    <Suspense fallback={null}>
      <ExamsHub />
    </Suspense>
  );
}

function ExamsHub() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();
  // Deep link from a grade card or a finished sitting: /exams?tab=cards.
  const requestedTab = useSearchParams().get("tab");
  const [tab, setTab] = useState<Tab>(
    requestedTab === "cards" || requestedTab === "available" ? requestedTab : "mine"
  );
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % EXAMS_MESSAGES.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  const mine = useQuery({ queryKey: ["exams", "hub", "mine"], queryFn: getMyHubExams });
  const available = useQuery({
    queryKey: ["exams", "hub", "available", deferredQuery.trim()],
    queryFn: () => getAvailableHubExams(deferredQuery),
    enabled: tab === "available",
  });

  const gradeCards = useQuery({
    queryKey: ["exams", "grade-cards", "mine"],
    queryFn: getMyGradeCards,
    enabled: tab === "cards",
  });

  const active = tab === "mine" ? mine : available;
  const rawCards = active.data ?? [];

  // Filter cards client-side for "mine" tab if user searches
  const filteredCards = useMemo(() => {
    if (tab !== "mine" || !deferredQuery.trim()) return rawCards;
    const q = deferredQuery.toLowerCase().trim();
    return rawCards.filter((c) => (c.title ?? "").toLowerCase().includes(q) || (c.channelName ?? "").toLowerCase().includes(q));
  }, [rawCards, tab, deferredQuery]);

  return (
    <div className="relative min-h-screen w-full text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 dark:selection:bg-indigo-900/40">
      {/* Background — vibrant ambient gradient matching Home, Explore, and My Learning */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 dark:hidden -z-10"
        style={{
          background: `
            radial-gradient(ellipse 55% 40% at 8% 12%, rgba(41, 98, 214, 0.16) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 92% 20%, rgba(39, 197, 216, 0.14) 0%, transparent 60%),
            radial-gradient(ellipse 45% 35% at 5% 50%, rgba(99, 102, 241, 0.09) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 95% 52%, rgba(16, 185, 129, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 6% 78%, rgba(14, 165, 233, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 94% 80%, rgba(20, 184, 166, 0.11) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 50% 95%, rgba(44, 131, 245, 0.08) 0%, transparent 60%),
            linear-gradient(to bottom, #E9EEFB 0%, #F5F9FD 25%, #FFFFFF 50%, #FFFFFF 75%, #E8F7F8 100%)
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 hidden dark:block -z-10 bg-slate-950"
        style={{
          background: `
            radial-gradient(ellipse 65% 45% at 8% 12%, rgba(41, 98, 214, 0.22) 0%, transparent 60%),
            radial-gradient(ellipse 55% 40% at 92% 24%, rgba(39, 197, 216, 0.16) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 5% 52%, rgba(99, 102, 241, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 55% 40% at 6% 76%, rgba(14, 165, 233, 0.12) 0%, transparent 60%),
            radial-gradient(ellipse 55% 40% at 94% 76%, rgba(16, 185, 129, 0.12) 0%, transparent 60%),
            linear-gradient(to bottom, #020617 0%, #081126 35%, #0B1528 70%, #020617 100%)
          `,
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-28 space-y-6 sm:space-y-8">
        {/* PAGE HEADER / TITLE */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="pb-1 text-center flex flex-col items-center justify-center"
        >
          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Satisfy&display=swap');
          `}</style>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none mb-3 flex items-baseline justify-center flex-wrap gap-2.5">
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="inline-block text-slate-900 dark:text-white font-extrabold text-4xl sm:text-5xl lg:text-6xl"
            >
              My
            </motion.span>

            <div className="relative inline-block pb-2">
              <motion.span
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="inline-block bg-gradient-to-r from-[#2962D6] via-[#2C83F5] to-[#27C5D8] bg-clip-text text-transparent px-1 text-5xl sm:text-6xl lg:text-7xl font-bold italic"
                style={{ fontFamily: "'Dancing Script', 'Satisfy', 'Amira-Grace', cursive" }}
              >
                Exams
              </motion.span>

              {/* Blue-to-Cyan Gradient Curved Underline Stroke */}
              <motion.svg
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.7, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                viewBox="0 0 300 20"
                fill="none"
                className="absolute -bottom-1 left-0 w-full h-4 pointer-events-none"
              >
                <path
                  d="M 8 13 C 90 4, 210 3, 292 11"
                  stroke="url(#examsBrushGradient)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="examsBrushGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#2962D6" />
                    <stop offset="55%" stopColor="#2C83F5" />
                    <stop offset="100%" stopColor="#27C5D8" />
                  </linearGradient>
                </defs>
              </motion.svg>
            </div>
          </h1>

          <div className="mt-1 relative h-[30px] flex items-center justify-center w-full max-w-lg mx-auto overflow-hidden">
            <AnimatePresence>
              <motion.p
                key={msgIndex}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -12 }}
                transition={{ duration: shouldReduceMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="absolute text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-semibold leading-relaxed text-center w-full px-4"
              >
                {EXAMS_MESSAGES[msgIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── TOOLBAR: LEFT TABS | RIGHT SEARCH ── */}
        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-2">
          {/* LEFT: Arcade Signature Geometric Asymmetric Tabs */}
          <div
            id="exams-items-section"
            className="scroll-mt-24 flex flex-wrap items-center justify-start gap-2.5 sm:gap-3 w-full md:w-auto shrink-0"
            role="tablist"
            aria-label="Exams sections"
          >
            <TabButton
              active={tab === "mine"}
              onClick={() => {
                setTab("mine");
                setQuery("");
              }}
              label="My Exams"
              count={mine.data?.length}
            />
            <TabButton
              active={tab === "available"}
              onClick={() => {
                setTab("available");
                setQuery("");
              }}
              label="Available"
            />
            <TabButton
              active={tab === "cards"}
              onClick={() => {
                setTab("cards");
                setQuery("");
              }}
              label="Grade Cards"
              count={gradeCards.data?.length}
            />
          </div>

          {/* RIGHT: Search Toggle / Input */}
          <div className="w-full md:w-auto flex items-center justify-start md:justify-end shrink-0">
            <div className="w-full sm:w-64 flex items-center justify-start sm:justify-end shrink-0">
              <AnimatePresence initial={false}>
                {isSearchOpen || query ? (
                  <motion.div
                    key="search-input-field"
                    initial={{ opacity: 0, width: "40px" }}
                    animate={{ opacity: 1, width: "100%" }}
                    exit={{ opacity: 0, width: "40px" }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="relative w-full flex items-center"
                  >
                    <Search
                      size={16}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
                    />
                    <input
                      ref={(el) => {
                        searchInputRef.current = el;
                        if (el) el.focus();
                      }}
                      autoFocus
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Escape") {
                          setQuery("");
                          setIsSearchOpen(false);
                        }
                      }}
                      placeholder={
                        tab === "mine"
                          ? "Search your exams..."
                          : tab === "available"
                          ? "Search all exams & certs..."
                          : "Search grade cards..."
                      }
                      className="w-full pl-9 pr-8 py-2.5 rounded-tl-[1.25rem] rounded-br-[1.25rem] rounded-tr-md rounded-bl-md text-xs sm:text-sm bg-transparent border border-slate-200/80 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-300 dark:focus:ring-slate-700 transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setIsSearchOpen(false);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      aria-label="Close search"
                      title="Close search"
                    >
                      <X size={15} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.button
                    key="search-icon-toggle"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.15 }}
                    type="button"
                    onClick={() => setIsSearchOpen(true)}
                    className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors flex items-center justify-center cursor-pointer"
                    aria-label="Open search"
                    title="Search exams"
                  >
                    <Search size={21} className="stroke-[2.2]" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── SECTION: EXAMS & ASSESSMENTS CONTENT ── */}
        <section aria-label="Exams Hub Content" className="relative space-y-4 sm:space-y-5 pt-0">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {tab === "mine" ? "Your Exams & Certifications" : tab === "available" ? "Explore Available Exams" : "Issued Grade Cards & Transcripts"}
            </h2>
          </div>

          <div className="relative z-10 space-y-6">
            {tab === "cards" ? (
              <GradeCardList
                loading={gradeCards.isLoading}
                cards={gradeCards.data ?? []}
                searchQuery={query}
                onOpen={(id) => router.push(examRoutes.gradeCard(id))}
              />
            ) : active.isLoading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="animate-spin text-slate-400" size={28} />
              </div>
            ) : active.isError ? (
              <div className="flex flex-col items-center gap-3 py-24 text-center rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 p-8 backdrop-blur-sm">
                <p className="text-[14px] font-bold text-rose-600 dark:text-rose-400">
                  {(active.error as Error)?.message ?? "Could not load exams."}
                </p>
                <button
                  type="button"
                  onClick={() => active.refetch()}
                  className="cursor-pointer rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-[#12141C] dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 text-[13px] font-bold shadow-sm hover:shadow-md transition-all"
                >
                  Retry
                </button>
              </div>
            ) : filteredCards.length === 0 ? (
              <EmptyState tab={tab} searching={Boolean(query.trim())} onBrowse={() => setTab("available")} />
            ) : (
              <HubGrid cards={filteredCards} onOpen={(id) => router.push(examRoutes.landing(id))} />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count?: number;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`relative px-5 sm:px-6 py-2 rounded-tl-[1.25rem] rounded-br-[1.25rem] rounded-tr-md rounded-bl-md text-xs sm:text-sm font-black tracking-tight transition-all duration-200 select-none cursor-pointer min-w-[96px] text-center inline-flex items-center justify-center gap-2 ${
        active
          ? "bg-white dark:bg-slate-900 text-[#2962D6] dark:text-[#3B82F6] border-2 border-[#2962D6] dark:border-[#3B82F6]"
          : "bg-slate-100/80 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/60 hover:bg-slate-200/70 dark:hover:bg-slate-700/60 hover:text-slate-900 dark:hover:text-white"
      }`}
    >
      <span className="relative z-10">{label}</span>
      {count !== undefined && count > 0 && (
        <span
          className={`relative z-10 text-[11px] px-1.5 py-0.2 rounded-full font-bold tabular-nums ${
            active ? "bg-[#2962D6]/10 dark:bg-[#3B82F6]/20 text-[#2962D6] dark:text-[#3B82F6]" : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function HubGrid({ cards, onOpen }: { cards: ExamHubCard[]; onOpen: (examId: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7"
    >
      {cards.map((card, idx) => (
        <ExamHubCardView key={card.examId} card={card} index={idx} onOpen={() => onOpen(card.examId)} />
      ))}
    </motion.div>
  );
}

function ExamDoodle() {
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
        {/* Soft background glow ellipse */}
        <ellipse cx="55" cy="50" rx="38" ry="32" className="fill-[#2962D6]/10 dark:fill-[#3B82F6]/15" />

        {/* Minimalist Exam Sheet */}
        <rect
          x="30"
          y="18"
          width="50"
          height="64"
          rx="10"
          className="fill-white dark:fill-slate-900 stroke-slate-800 dark:stroke-slate-200"
          strokeWidth="2"
        />

        {/* Header bar / title line */}
        <path
          d="M40 30H70"
          className="stroke-[#2962D6] dark:stroke-[#3B82F6]"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Question 1: Checkmark & line */}
        <path
          d="M39 42L42 45L48 39"
          className="stroke-emerald-500 dark:stroke-emerald-400"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M53 42H70"
          className="stroke-slate-400 dark:stroke-slate-500"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Question 2: Checkmark & line */}
        <path
          d="M39 54L42 57L48 51"
          className="stroke-emerald-500 dark:stroke-emerald-400"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M53 54H68"
          className="stroke-slate-400 dark:stroke-slate-500"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Question 3: Dot & line */}
        <circle cx="43" cy="66" r="2" className="fill-slate-400 dark:fill-slate-500" />
        <path
          d="M53 66H65"
          className="stroke-slate-300 dark:stroke-slate-600"
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* Simple minimal doodle pencil floating at bottom right */}
        <g transform="translate(68, 56) rotate(35)">
          <rect x="0" y="0" width="6" height="24" rx="2" className="fill-amber-400 dark:fill-amber-300 stroke-slate-800 dark:stroke-slate-200" strokeWidth="1.5" />
          <path d="M0 24L3 29L6 24Z" className="fill-amber-200 dark:fill-amber-100 stroke-slate-800 dark:stroke-slate-200" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="3" cy="27.5" r="0.8" className="fill-slate-900 dark:fill-slate-900" />
        </g>

        {/* Tiny playful sparkle stars */}
        <path
          d="M20 32L21 28L25 27L21 26L20 22L19 26L15 27L19 28Z"
          className="fill-amber-400 dark:fill-amber-300"
        />
        <path
          d="M88 24L89 21L92 20L89 19L88 16L87 19L84 20L87 21Z"
          className="fill-[#27C5D8]"
        />
      </svg>
    </motion.div>
  );
}

function AvailableExamsDoodle() {
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
        {/* Soft cyan/blue background glow ellipse */}
        <ellipse cx="55" cy="50" rx="38" ry="32" className="fill-[#27C5D8]/10 dark:fill-[#27C5D8]/15" />

        {/* Minimalist Catalog / Certificate Sheet */}
        <rect
          x="30"
          y="18"
          width="50"
          height="64"
          rx="10"
          className="fill-white dark:fill-slate-900 stroke-slate-800 dark:stroke-slate-200"
          strokeWidth="2"
        />

        {/* Certificate / Exam Badge Ribbon at top */}
        <path
          d="M48 18V30L55 26L62 30V18"
          className="fill-[#2962D6]/20 stroke-[#2962D6] dark:stroke-[#3B82F6]"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />

        {/* Clean Content Lines */}
        <path d="M38 40H72" className="stroke-[#2962D6] dark:stroke-[#3B82F6]" strokeWidth="2" strokeLinecap="round" />
        <path d="M38 50H66" className="stroke-slate-400 dark:stroke-slate-500" strokeWidth="2" strokeLinecap="round" />
        <path d="M38 60H58" className="stroke-slate-300 dark:stroke-slate-600" strokeWidth="2" strokeLinecap="round" />

        {/* Minimal Magnifying Glass Doodle */}
        <g transform="translate(68, 52)">
          <circle cx="12" cy="12" r="10" className="fill-white dark:fill-slate-900 stroke-slate-800 dark:stroke-slate-200" strokeWidth="2" />
          <path d="M19 19L27 27" className="stroke-slate-800 dark:stroke-slate-200" strokeWidth="2.5" strokeLinecap="round" />
          {/* Cyan shine in glass */}
          <path d="M8 9A5 5 0 0 1 15 8" className="stroke-[#27C5D8]" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Sparkles */}
        <path d="M20 32L21 28L25 27L21 26L20 22L19 26L15 27L19 28Z" className="fill-amber-400 dark:fill-amber-300" />
        <path d="M88 24L89 21L92 20L89 19L88 16L87 19L84 20L87 21Z" className="fill-[#27C5D8]" />
      </svg>
    </motion.div>
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

function EmptyState({
  tab,
  searching,
  onBrowse,
}: {
  tab: Tab;
  searching: boolean;
  onBrowse: () => void;
}) {
  return (
    <div className="py-10 px-4 text-center flex flex-col items-center justify-center">
      {tab === "mine" ? (
        <ExamDoodle />
      ) : (
        <AvailableExamsDoodle />
      )}
      <p className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
        {tab === "mine"
          ? searching
            ? "No registered exams matched your search"
            : "You haven't registered for any exams"
          : searching
          ? "No exams match your search"
          : "No exams are open right now"}
      </p>
      {tab === "mine" && !searching && (
        <>
          <p className="mt-1 max-w-sm text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
            Browse certifications and standalone exams, then register to sit them and earn your certificates.
          </p>
          <button
            type="button"
            onClick={onBrowse}
            className="mt-5 cursor-pointer rounded-full bg-[#12141C] dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 text-xs sm:text-sm font-bold shadow-sm hover:opacity-90 transition-all"
          >
            Browse exams
          </button>
        </>
      )}
    </div>
  );
}

function GradeCardList({
  loading,
  cards,
  searchQuery,
  onOpen,
}: {
  loading: boolean;
  cards: GradeCardResponse[];
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

