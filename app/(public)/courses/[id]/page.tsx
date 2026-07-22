"use client"

import {
  Award,
  BadgeCheck,
  BookOpen,
  Briefcase,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  GraduationCap,
  Heart,
  Play,
  PlayCircle,
  Radio,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect, use } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Avatar as AvatarRoot, AvatarFallback } from "@/components/ui/avatar"

/* ------------------------------------------------------------------ */
/*  Types for API response                                             */
/* ------------------------------------------------------------------ */

type CourseApiResponse = {
  category: string
  courseData: { title: string; duration: string; level: string; desc: string }
  categoryData: {
    desc: string
    colors: { primary: string; secondary: string }
    gradient: string
    coursesCount: number
    bootcamps: Array<{ title: string; duration: string; type: string; date: string; desc: string }>
    resources: Array<{ title: string; type: string; readTime: string }>
  }
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Module = {
  title: string
  duration: string
  accent: string
  lessons: { title: string; length: string }[]
}

type Review = {
  name: string
  role: string
  quote: string
  dark: boolean
  accent: string
}

const TABS = ["Overview", "Syllabus", "Instructor", "Certificate"] as const
type Tab = (typeof TABS)[number]


/* ------------------------------------------------------------------ */
/*  Static content (shared across all courses)                        */
/* ------------------------------------------------------------------ */

const INSTRUCTOR = {
  name: "Maya Okafor",
  role: "Senior Product Designer",
  channel: "Maya Okafor",
  org: "Pixelcraft Studio",
  accent: "var(--color-purple)",
  bio: "Maya has spent twelve years designing products used by millions — leading design at two Series B startups and shipping systems at Meta and Notion. She teaches design as a craft you build in public, not a set of screens you decorate.",
  expertise: ["Design systems", "Interaction & motion", "Figma", "Prototyping", "Design critique"],
  stats: [
    { k: "5", label: "courses", c: "var(--color-blue)", icon: BookOpen },
    { k: "40,000", label: "students", c: "var(--color-amber)", icon: Users },
    { k: "4.9", label: "avg rating", c: "var(--color-teal)", icon: Star },
    { k: "12 yrs", label: "experience", c: "var(--color-purple)", icon: GraduationCap },
  ],
}

const MODULES: Module[] = [
  {
    title: "Foundations & Core Concepts",
    duration: "1h 10m",
    accent: "var(--color-blue)",
    lessons: [
      { title: "Introduction and course overview", length: "14m" },
      { title: "Key principles and frameworks", length: "12m" },
      { title: "Building your first project", length: "16m" },
      { title: "Core skills applied in practice", length: "18m" },
      { title: "Review and critique session", length: "10m" },
    ],
  },
  {
    title: "Intermediate Techniques",
    duration: "58m",
    accent: "var(--color-amber)",
    lessons: [
      { title: "Advanced patterns and methods", length: "13m" },
      { title: "Real-world application deep dive", length: "15m" },
      { title: "Iterating and refining your work", length: "12m" },
      { title: "Assignment: end-to-end project", length: "18m" },
    ],
  },
  {
    title: "Advanced Applications",
    duration: "1h 40m",
    accent: "var(--color-purple)",
    lessons: [
      { title: "System thinking and scalability", length: "15m" },
      { title: "Complex scenarios and edge cases", length: "17m" },
      { title: "Performance and optimization", length: "16m" },
      { title: "Collaborative workflows", length: "18m" },
      { title: "Production-ready implementation", length: "20m" },
      { title: "Case study and final teardown", length: "14m" },
    ],
  },
  {
    title: "Portfolio & Capstone",
    duration: "1h 02m",
    accent: "var(--color-teal)",
    lessons: [
      { title: "Selecting your strongest project", length: "13m" },
      { title: "Writing a compelling case study", length: "16m" },
      { title: "Presenting process over polish", length: "15m" },
      { title: "Final mentor review session", length: "18m" },
    ],
  },
]

const TOTAL_LESSONS = MODULES.reduce((sum, m) => sum + m.lessons.length, 0)

const REVIEWS: Review[] = [
  {
    name: "Adam Wathan",
    role: "Founder, Tailwind",
    quote: "I've been using this course as a refresher and keep coming back to the systems module.",
    dark: true,
    accent: "var(--color-blue)",
  },
  {
    name: "Ian Callahan",
    role: "Harvard Art Museums",
    quote: "Genuinely the clearest explanation of these concepts I've seen taught anywhere.",
    dark: false,
    accent: "var(--color-amber)",
  },
  {
    name: "Aaron Francis",
    role: "Co-founder, Try Hard Studios",
    quote: "Takes the pain out of a difficult subject — the pacing is exactly right.",
    dark: false,
    accent: "var(--color-purple)",
  },
  {
    name: "Chandresh Patel",
    role: "CEO, Bacancy",
    quote: "Elegance, pacing, and student experience are completely unmatched.",
    dark: false,
    accent: "var(--color-teal)",
  },
  {
    name: "Fathom Analytics",
    role: "Team account",
    quote: "This course has been integral to how we onboard new hires.",
    dark: true,
    accent: "var(--color-coral)",
  },
  {
    name: "Priya Menon",
    role: "Design Lead, Freshworks",
    quote: "The final capstone review alone was worth it. My portfolio has never been stronger.",
    dark: false,
    accent: "var(--color-blue)",
  },
]

const HIGHLIGHTS = [
  "A working portfolio project",
  "A recorded end-to-end case study",
  "Feedback from an industry expert",
  "A shareable, verified certificate",
]

/* ------------------------------------------------------------------ */
/*  Avatar component                                                   */
/* ------------------------------------------------------------------ */

function Avatar({
  name,
  accent = "var(--color-blue)",
  size = 36,
  onDark = false,
}: {
  name: string
  accent?: string
  size?: number
  onDark?: boolean
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <AvatarRoot aria-hidden="true" style={{ width: size, height: size, flexShrink: 0 }}>
      <AvatarFallback
        className="grid place-items-center rounded-full font-semibold text-paper"
        style={{
          width: size,
          height: size,
          fontSize: size * 0.38,
          background: accent,
          boxShadow: onDark ? "0 0 0 3px rgba(255,255,255,0.08)" : "0 0 0 3px rgba(20,22,28,0.04)",
        }}
      >
        {initials}
      </AvatarFallback>
    </AvatarRoot>
  )
}

function CourseBadge({ label = "Course", accent = "var(--color-blue)" }: { label?: string; accent?: string }) {
  const scallops = Array.from({ length: 12 })
  return (
    <motion.div
      className="relative shrink-0"
      whileHover={{ scale: 1.05, rotateZ: 5 }}
      transition={{ type: "spring", stiffness: 300, damping: 10 }}
    >
      <svg width="164" height="188" viewBox="0 0 164 188" aria-hidden="true">
        <defs>
          <linearGradient id="badgeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={accent} />
            <stop offset="1" stopColor="var(--color-purple)" />
          </linearGradient>
        </defs>
        <path d="M60 118 L44 180 L70 162 L80 128 Z" fill="var(--color-coral)" />
        <path d="M104 118 L120 180 L94 162 L84 128 Z" fill="var(--color-teal)" />
        {scallops.map((_, i) => {
          const a = (i / 12) * Math.PI * 2
          const cx = 82 + Math.cos(a) * 52
          const cy = 74 + Math.sin(a) * 52
          return <circle key={i} cx={cx} cy={cy} r="12" fill="url(#badgeGrad)" />
        })}
        <circle cx="82" cy="74" r="56" fill="url(#badgeGrad)" />
        <circle cx="82" cy="74" r="45" fill="var(--color-ink)" />
        <circle cx="82" cy="74" r="45" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="1.5" strokeDasharray="3 5" />
      </svg>
      <div className="absolute inset-x-0 top-[44px] flex flex-col items-center text-paper">
        <Award size={30} className="text-amber" />
        <span className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-white/80">{label}</span>
        <span className="text-[10px] text-white/45">Certified</span>
      </div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Video Placeholder                                                  */
/* ------------------------------------------------------------------ */

function CourseVideoPlaceholder() {
  const [isPlaying, setIsPlaying] = useState(false)
  return (
    <motion.div
      className="relative hidden lg:block"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-gradient-to-br from-ink/20 to-ink/5 border border-line shadow-lg">
        <div className="absolute inset-0 bg-gradient-to-br from-blue/10 via-purple/5 to-teal/10" />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="grid size-16 place-items-center rounded-full bg-gradient-to-br from-blue to-purple shadow-lg"
          >
            <Play size={32} className="text-paper fill-paper ml-1" />
          </motion.div>
          <div className="text-center">
            <p className="text-sm font-semibold text-ink">Course Introduction</p>
            <p className="text-xs text-subtle mt-1">Video coming soon</p>
          </div>
        </div>
        <motion.button
          onClick={() => setIsPlaying(!isPlaying)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="absolute inset-0 z-10 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
          aria-label="Play course introduction video"
        >
          <div className="grid size-20 place-items-center rounded-full bg-black/40 backdrop-blur-sm">
            <Play size={40} className="text-paper fill-paper ml-1" />
          </div>
        </motion.button>
        <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-medium text-paper">
          2:45
        </div>
      </div>
      <motion.div
        className="mt-4 flex items-center gap-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <div className="grid size-8 place-items-center rounded-full bg-blue/15">
          <PlayCircle size={16} className="text-blue" />
        </div>
        <div className="text-sm">
          <p className="font-medium text-ink">Introduction to the course</p>
          <p className="text-xs text-subtle">Learn what you&apos;ll build</p>
        </div>
      </motion.div>
    </motion.div>
  )
}


/* ------------------------------------------------------------------ */
/*  Breadcrumb                                                         */
/* ------------------------------------------------------------------ */

function Breadcrumb({ category, courseTitle }: { category: string; courseTitle: string }) {
  const crumbs = [
    { label: "Explore", href: "/explore" },
    { label: category, href: `/courses?category=${encodeURIComponent(category)}` },
  ]
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-1.5 text-[13px]">
        {crumbs.map((c, i) => (
          <motion.li
            key={c.label}
            className="flex items-center gap-1.5"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Link href={c.href} className="rounded-full px-2.5 py-1 font-medium text-subtle transition-colors hover:bg-mist hover:text-ink">
              {c.label}
            </Link>
            <ChevronRight size={13} className="text-subtle/40" />
          </motion.li>
        ))}
        <motion.li
          className="rounded-full bg-ink/[0.04] px-2.5 py-1 font-semibold text-ink"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: crumbs.length * 0.1 }}
        >
          {courseTitle}
        </motion.li>
      </ol>
    </nav>
  )
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

function CourseHero({
  courseTitle,
  category,
  duration,
  level,
  accentColor,
}: {
  courseTitle: string
  category: string
  duration: string
  level: string
  accentColor: string
}) {
  const [saved, setSaved] = useState(false)

  const META = [
    { icon: Clock, label: duration, dot: "var(--color-blue)" },
    { icon: BookOpen, label: `${TOTAL_LESSONS} lessons`, dot: "var(--color-amber)" },
    { icon: Users, label: "12,480 enrolled", dot: "var(--color-teal)" },
  ]

  return (
    <motion.section
      className="arcade-fade"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Breadcrumb category={category} courseTitle={courseTitle} />

      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <motion.span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold uppercase tracking-wider"
            style={{ background: `${accentColor}18`, color: accentColor }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            whileHover={{ scale: 1.05 }}
          >
            <Zap size={12} />
            {level}
          </motion.span>

          <motion.h1
            className="mt-6 text-[2.75rem] font-normal leading-[1.05] tracking-tight text-ink text-balance sm:text-[4rem]"
            style={{ fontFamily: '"Clash Display", var(--font-fraunces), sans-serif', fontWeight: 700 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {courseTitle}
          </motion.h1>

          <motion.div
            className="mt-7 flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Avatar name={INSTRUCTOR.name} accent={INSTRUCTOR.accent} size={46} />
            <div>
              <p className="text-[15px] font-semibold text-ink">{INSTRUCTOR.name}</p>
              <p className="flex items-center gap-1.5 text-[13px] text-subtle">
                <Radio size={13} className="text-blue" /> {INSTRUCTOR.channel}
              </p>
            </div>
          </motion.div>

          <motion.div
            className="mt-7 flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {META.map((m) => {
              const Icon = m.icon
              return (
                <motion.div key={m.label} className="flex items-center gap-2" whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
                  <span className="grid size-2 rounded-full" style={{ background: m.dot }} />
                  <Icon size={15} className="text-subtle" />
                  <span className="text-[13px] font-medium text-subtle">{m.label}</span>
                </motion.div>
              )
            })}
          </motion.div>

          <motion.div
            className="mt-8 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition-shadow hover:shadow-lg">
              Enroll for $20
            </motion.button>
            <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="rounded-full border border-ink/20 px-6 py-3 text-sm font-medium text-ink transition-all hover:border-ink/40 hover:bg-ink/5">
              See how it works
            </motion.button>
            <motion.button
              onClick={() => setSaved(!saved)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="rounded-full border border-ink/20 p-3 transition-all hover:border-ink/40 hover:bg-ink/5"
            >
              <Heart size={18} className={`transition-all ${saved ? "fill-red-500 text-red-500" : "text-subtle"}`} />
            </motion.button>
          </motion.div>
        </div>

        <CourseVideoPlaceholder />
      </div>
    </motion.section>
  )
}

/* ------------------------------------------------------------------ */
/*  Tabs                                                               */
/* ------------------------------------------------------------------ */

function CourseTabs({
  courseTitle,
  category,
  courseDesc,
  accentColor,
}: {
  courseTitle: string
  category: string
  courseDesc: string
  accentColor: string
}) {
  const [tab, setTab] = useState<Tab>("Overview")
  const [openMod, setOpenMod] = useState(0)

  return (
    <div>
      <div className="flex justify-center">
        <motion.div
          className="inline-flex flex-wrap justify-center gap-1 rounded-full border border-line bg-paper p-1.5"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {TABS.map((t, i) => (
            <motion.button
              key={t}
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors sm:px-5 ${tab === t ? "bg-ink text-paper" : "text-subtle hover:text-ink"
                }`}
            >
              {t}
            </motion.button>
          ))}
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          className="mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          {tab === "Overview" && (
            <div className="grid gap-8 md:grid-cols-2">
              {[
                {
                  title: "About this course",
                  content: courseDesc + " Every module ends with a real assignment reviewed by a working expert. You will leave with a portfolio piece, not just a certificate.",
                  highlights: null,
                },
                {
                  title: "What you'll walk away with",
                  content: null,
                  highlights: HIGHLIGHTS,
                },
              ].map((item, idx) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(20,22,28,0.1)" }}
                  className="rounded-3xl border border-line bg-paper p-7 transition-shadow"
                >
                  <h3 className="font-serif text-2xl font-light text-ink">{item.title}</h3>
                  {item.content && (
                    <p className="mt-4 text-[15px] leading-relaxed text-subtle">{item.content}</p>
                  )}
                  {item.highlights && (
                    <ul className="mt-4 flex flex-col gap-3">
                      {item.highlights.map((h, i) => (
                        <motion.li
                          key={h}
                          className="flex items-center gap-3 text-[15px] text-ink"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: i * 0.1 }}
                        >
                          <motion.span
                            className="grid size-5 shrink-0 place-items-center rounded-full bg-teal/12"
                            whileHover={{ scale: 1.2, rotate: 360 }}
                            transition={{ type: "spring", stiffness: 200 }}
                          >
                            <Check size={13} className="text-teal" />
                          </motion.span>
                          {h}
                        </motion.li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {tab === "Syllabus" && (
            <div className="mx-auto max-w-3xl">
              <motion.div
                className="mb-6 flex flex-wrap items-center justify-center gap-2.5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {[
                  { icon: BookOpen, label: `${MODULES.length} modules`, c: "var(--color-blue)" },
                  { icon: PlayCircle, label: `${TOTAL_LESSONS} lessons`, c: "var(--color-amber)" },
                  { icon: Clock, label: "4h 30m total", c: "var(--color-teal)" },
                ].map(({ icon: Icon, label, c }) => (
                  <motion.span
                    key={label}
                    className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-1.5 text-[13px] font-medium text-ink"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Icon size={14} style={{ color: c }} /> {label}
                  </motion.span>
                ))}
              </motion.div>
              <div className="flex flex-col gap-3">
                {MODULES.map((m, idx) => {
                  const open = openMod === idx
                  return (
                    <motion.div
                      key={m.title}
                      className="overflow-hidden rounded-2xl border border-line bg-paper transition-colors hover:border-ink/15"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                      whileHover={{ boxShadow: "0 10px 30px rgba(20,22,28,0.08)" }}
                    >
                      <motion.button
                        onClick={() => setOpenMod(open ? -1 : idx)}
                        aria-expanded={open}
                        className="flex w-full items-center gap-4 px-5 py-4 text-left"
                        whileHover={{ backgroundColor: "rgba(20,22,28,0.02)" }}
                      >
                        <motion.span
                          className="grid size-10 shrink-0 place-items-center rounded-xl font-serif text-base font-medium text-paper"
                          style={{ background: m.accent }}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          {idx + 1}
                        </motion.span>
                        <span className="flex-1">
                          <span className="block text-[11px] font-semibold uppercase tracking-wide text-subtle">Module {idx + 1}</span>
                          <span className="block text-[15px] font-semibold text-ink">{m.title}</span>
                        </span>
                        <span className="hidden text-xs text-subtle sm:block">{m.lessons.length} lessons - {m.duration}</span>
                        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
                          <ChevronDown size={17} className="text-subtle" />
                        </motion.div>
                      </motion.button>
                      <AnimatePresence>
                        {open && (
                          <motion.ul
                            className="flex flex-col gap-1 border-t border-line px-3 pb-3 pt-2"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            {m.lessons.map((lesson, li) => (
                              <motion.li
                                key={lesson.title}
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-mist"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.2, delay: li * 0.05 }}
                                whileHover={{ x: 5 }}
                              >
                                <span className="w-5 text-center text-[12px] font-medium text-subtle/70">{li + 1}</span>
                                <PlayCircle size={16} style={{ color: m.accent }} className="shrink-0" />
                                <span className="flex-1 text-[14px] text-ink">{lesson.title}</span>
                                <span className="text-[12px] text-subtle">{lesson.length}</span>
                              </motion.li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {tab === "Instructor" && (
            <motion.div
              className="mx-auto max-w-3xl rounded-3xl border border-line bg-paper p-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ boxShadow: "0 20px 40px rgba(20,22,28,0.1)" }}
            >
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <Avatar name={INSTRUCTOR.name} accent={INSTRUCTOR.accent} size={72} />
                <div className="flex-1">
                  <motion.div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-purple/10 px-2.5 py-1 text-[12px] font-medium text-purple" whileHover={{ scale: 1.05 }}>
                    <BadgeCheck size={13} /> {INSTRUCTOR.org}
                  </motion.div>
                  <h3 className="font-serif text-2xl font-light text-ink">{INSTRUCTOR.name}</h3>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-subtle">
                    <span className="inline-flex items-center gap-1.5"><Briefcase size={13} /> {INSTRUCTOR.role}</span>
                    <span className="text-subtle/40">·</span>
                    <span className="inline-flex items-center gap-1.5"><Radio size={13} className="text-blue" /> {INSTRUCTOR.channel}</span>
                  </p>
                </div>
                <motion.button className="rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-paper transition-shadow hover:shadow-lg" whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}>
                  Follow channel
                </motion.button>
              </div>
              <p className="mt-6 text-[15px] leading-relaxed text-subtle">{INSTRUCTOR.bio}</p>
              <motion.div className="mt-6 flex flex-wrap gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {INSTRUCTOR.expertise.map((e) => (
                  <motion.span key={e} className="rounded-full border border-line bg-mist px-3 py-1.5 text-[12px] font-medium text-ink" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.1, backgroundColor: "rgba(20,22,28,0.08)" }}>
                    {e}
                  </motion.span>
                ))}
              </motion.div>
              <div className="mt-7 grid grid-cols-2 gap-3 border-t border-line pt-6 sm:grid-cols-4">
                {INSTRUCTOR.stats.map(({ k, label, c, icon: Icon }, idx) => (
                  <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: idx * 0.1 }} whileHover={{ y: -5 }}>
                    <Icon size={16} style={{ color: c }} />
                    <p className="mt-2 font-serif text-xl font-medium text-ink">{k}</p>
                    <p className="text-[12px] text-subtle">{label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {tab === "Certificate" && (
            <motion.div
              className="mx-auto flex max-w-3xl flex-col items-center gap-10 rounded-3xl border border-line bg-paper p-8 sm:flex-row sm:items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ boxShadow: "0 20px 40px rgba(20,22,28,0.1)" }}
            >
              <CourseBadge label={category.split(" ")[0]} accent={accentColor} />
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
                <motion.span className="inline-flex items-center gap-1.5 rounded-full bg-amber/15 px-2.5 py-1 text-[12px] font-semibold text-ink" whileHover={{ scale: 1.05 }}>
                  <Sparkles size={13} className="text-amber" /> Course badge
                </motion.span>
                <h3 className="mt-3 font-serif text-2xl font-light text-ink">Earn a badge that&apos;s one of a kind</h3>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-subtle">
                  This badge is unique to <span className="font-medium text-ink">{courseTitle}</span> — no other course carries it. Finish all four modules and your final capstone to unlock it on your profile. You&apos;ll also receive a verified certificate of completion to share.
                </p>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Reviews                                                            */
/* ------------------------------------------------------------------ */

function ReviewsBlock() {
  return (
    <motion.section
      aria-labelledby="reviews-heading"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      <motion.div className="mb-8 flex flex-col items-center gap-3 text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
        <motion.span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wide text-subtle" whileHover={{ scale: 1.05 }}>
          <Star size={13} className="text-amber" fill="var(--color-amber)" strokeWidth={0} /> Reviews
        </motion.span>
        <h2 id="reviews-heading" className="font-serif text-3xl font-light text-ink text-balance sm:text-4xl">
          Loved by <motion.span className="italic text-blue" whileHover={{ scale: 1.1 }}>12,480</motion.span> builders
        </h2>
        <motion.div className="flex items-center gap-3" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.2 }}>
          <span className="font-serif text-3xl font-light text-ink">4.9</span>
          <div className="text-left">
            <div className="flex gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.3, delay: i * 0.1 }} whileHover={{ scale: 1.2, rotate: 15 }}>
                  <Star size={14} className="text-amber" fill="var(--color-amber)" strokeWidth={0} />
                </motion.div>
              ))}
            </div>
            <p className="mt-0.5 text-xs text-subtle">812 ratings</p>
          </div>
        </motion.div>
      </motion.div>
      <div className="[column-gap:1rem] sm:columns-2 lg:columns-3">
        {REVIEWS.map((r, idx) => (
          <motion.div
            key={r.name}
            className="mb-6 break-inside-avoid relative p-[1px] rounded-[1.5rem] overflow-hidden group"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5, delay: (idx % 3) * 0.1 }}
            whileHover={{ y: -6 }}
          >
            {/* Animated gradient border effect using accent color */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
              style={{
                background: `linear-gradient(135deg, transparent 40%, ${r.accent}80, transparent 60%)`,
              }}
            />

            {/* Inner Card Background */}
            <div className="absolute inset-[1px] bg-white rounded-[calc(1.5rem-1px)] z-0" />

            {/* Card Content Container */}
            <div
              className="relative z-10 h-full rounded-[calc(1.5rem-1px)] p-7 sm:p-8 flex flex-col justify-between gap-6 transition-all duration-500"
              style={{
                boxShadow: "0 10px 30px -10px rgba(0,0,0,0.05)",
                backgroundColor: "rgba(255, 255, 255, 0.9)",
              }}
            >
              {/* Quote Icon Background */}
              <div
                className="absolute top-4 left-6 text-[8rem] font-serif leading-none"
                style={{ color: r.accent, opacity: 0.08 }}
              >
                &ldquo;
              </div>

              {/* Quote Text */}
              <p className="text-[15px] sm:text-[16px] leading-relaxed text-slate-700 font-medium relative z-10 mt-2">
                {r.quote}
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-4 mt-2">
                <Avatar name={r.name} accent={r.accent} size={42} onDark={false} />
                <div>
                  <p className="text-[14px] font-bold text-slate-900 tracking-tight">{r.name}</p>
                  <p className="text-[12px] font-semibold tracking-wide uppercase mt-0.5" style={{ color: r.accent }}>
                    {r.role}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}

/* ------------------------------------------------------------------ */
/*  Enroll CTA                                                         */
/* ------------------------------------------------------------------ */

function EnrollCta({ courseTitle }: { courseTitle: string }) {
  return (
    <motion.section
      className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 w-full min-h-[550px] flex items-center justify-center p-8 sm:p-16 border border-white/5 shadow-2xl group"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Dynamic Glowing Aurora Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[70%] bg-blue-600/30 rounded-full blur-[100px] mix-blend-screen"
          animate={{ x: [0, 50, 0], y: [0, 30, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute top-[10%] -right-[10%] w-[50%] h-[60%] bg-purple-600/30 rounded-full blur-[100px] mix-blend-screen"
          animate={{ x: [0, -40, 0], y: [0, 50, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div 
          className="absolute -bottom-[20%] left-[20%] w-[70%] h-[50%] bg-rose-600/20 rounded-full blur-[120px] mix-blend-screen"
          animate={{ x: [0, 30, 0], y: [0, -30, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Subtle grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10 mix-blend-overlay"
          style={{
            backgroundImage: "radial-gradient(#ffffff 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }}
        />
      </div>

      {/* Interactive Hover Light Effect */}
      <div className="absolute inset-0 z-0 bg-gradient-to-t from-slate-950 to-transparent opacity-80" />

      {/* Glassmorphic Inner Container */}
      <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-10 sm:p-16 shadow-[0_0_80px_rgba(0,0,0,0.5)]">
        
        {/* Enrollment Open Badge */}
        <motion.div 
          className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/90">Enrollment Open</span>
        </motion.div>

        {/* Headline */}
        <motion.h2 
          className="font-serif text-4xl sm:text-6xl font-bold leading-tight text-white mb-6 text-balance"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          Master <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-300 to-rose-300">{courseTitle}</span>
        </motion.h2>

        {/* Subtext */}
        <motion.p 
          className="max-w-xl text-lg sm:text-xl text-slate-300 font-light mb-12 text-balance"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Join 12,480 builders learning from expert instructors with real projects, personalized feedback, and a verified certificate.
        </motion.p>

        {/* Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <motion.button 
            className="w-full sm:w-auto relative group/btn overflow-hidden rounded-full bg-white px-10 py-4 text-[16px] font-bold text-slate-900 transition-all hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Enroll for $20
              <Zap size={18} className="text-purple-500 group-hover/btn:animate-pulse" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 via-purple-100 to-rose-100 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
          </motion.button>
          
          <motion.button 
            className="w-full sm:w-auto rounded-full border border-white/20 bg-white/5 backdrop-blur-md px-10 py-4 text-[16px] font-bold text-white transition-all hover:bg-white/10 hover:border-white/40"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            See how it works
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  )
}

/* ------------------------------------------------------------------ */
/*  Not Found State                                                    */
/* ------------------------------------------------------------------ */

function CourseNotFound() {
  return (
    <main className="min-h-screen bg-paper text-ink flex items-center justify-center">
      <motion.div className="text-center px-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <p className="text-6xl mb-6">📚</p>
        <h1 className="font-serif text-3xl font-light text-ink mb-4">Course not found</h1>
        <p className="text-subtle text-[15px] mb-8 max-w-sm mx-auto">We could not find this course. It may have been moved or the link may be incorrect.</p>
        <Link href="/explore" className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper inline-block hover:opacity-80 transition-opacity">
          Back to Explore
        </Link>
      </motion.div>
    </main>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [data, setData] = useState<CourseApiResponse | null | "loading" | "notfound">("loading")

  useEffect(() => {
    fetch(`/api/courses/${id}`)
      .then((res) => {
        if (!res.ok) {
          setData("notfound")
          return
        }
        return res.json()
      })
      .then((json) => {
        if (json) setData(json as CourseApiResponse)
      })
      .catch(() => setData("notfound"))
  }, [id])

  if (data === "loading") {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#ffffff" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "40px", height: "40px", border: "3px solid #e5e7eb", borderTopColor: "#3457e8", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: "#6a6d7c", fontSize: "0.9rem", fontFamily: "system-ui, sans-serif" }}>Loading course...</p>
          <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
        </div>
      </main>
    )
  }

  if (data === "notfound") {
    return <CourseNotFound />
  }

  const { category, courseData, categoryData } = data
  const accentColor = categoryData.colors.primary

  return (
    <main className="min-h-screen bg-paper text-ink">

      <div className="arcade-wash">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-28 sm:px-8 sm:pt-32">
          <CourseHero
            courseTitle={courseData.title}
            category={category}
            duration={courseData.duration}
            level={courseData.level}
            accentColor={accentColor}
          />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <CourseTabs
          courseTitle={courseData.title}
          category={category}
          courseDesc={courseData.desc}
          accentColor={accentColor}
        />
        <motion.div className="mt-20" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <ReviewsBlock />
        </motion.div>
        <motion.div className="mt-16" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <EnrollCta courseTitle={courseData.title} />
        </motion.div>
      </div>
    </main>
  )
}
