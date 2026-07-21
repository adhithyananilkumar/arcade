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
  Settings,
  Share2,
  Sparkles,
  Star,
  Users,
  Volume2,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/auth.store"
import { CATEGORY_DATA } from "@/app/(public)/explore/page"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .trim();
}

/* ------------------------------------------------------------------ */
/*  Data                                                               */
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

const COURSE_TITLE = "Design interfaces people actually love"
const CATEGORY = "UI / UX & Product Design"

const TABS = ["Overview", "Syllabus", "Instructor", "Certificate"] as const
type Tab = (typeof TABS)[number]

const NAV_LINKS = ["Explore", "Forums", "For Colleges", "Docs"]

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

const META = [
  { icon: Clock, label: "4h 30m", dot: "var(--color-blue)" },
  { icon: BookOpen, label: "19 lessons", dot: "var(--color-amber)" },
  { icon: Users, label: "12,480 enrolled", dot: "var(--color-teal)" },
]

const MODULES: Module[] = [
  {
    title: "Foundations of interface design",
    duration: "1h 10m",
    accent: "var(--color-blue)",
    lessons: [
      { title: "Visual hierarchy and grid systems", length: "14m" },
      { title: "Color theory for products", length: "12m" },
      { title: "Typography that scales", length: "16m" },
      { title: "Building your first component set", length: "18m" },
      { title: "Critique: heuristic review", length: "10m" },
    ],
  },
  {
    title: "Interaction and motion design",
    duration: "58m",
    accent: "var(--color-amber)",
    lessons: [
      { title: "Micro-interactions that feel right", length: "13m" },
      { title: "Prototyping with real timing curves", length: "15m" },
      { title: "State changes and feedback", length: "12m" },
      { title: "Assignment: an animated onboarding flow", length: "18m" },
    ],
  },
  {
    title: "Design systems that scale",
    duration: "1h 40m",
    accent: "var(--color-purple)",
    lessons: [
      { title: "Tokens over hard-coded values", length: "15m" },
      { title: "Component variants and props", length: "17m" },
      { title: "Documentation your team will read", length: "16m" },
      { title: "Versioning a design system", length: "18m" },
      { title: "Handoff without the back-and-forth", length: "20m" },
      { title: "Case study teardown", length: "14m" },
    ],
  },
  {
    title: "Portfolio and case studies",
    duration: "1h 02m",
    accent: "var(--color-teal)",
    lessons: [
      { title: "Choosing your strongest project", length: "13m" },
      { title: "Writing a case study people finish", length: "16m" },
      { title: "Presenting process, not just polish", length: "15m" },
      { title: "Final review with a mentor", length: "18m" },
    ],
  },
]

const TOTAL_LESSONS = MODULES.reduce((sum, m) => sum + m.lessons.length, 0)

const REVIEWS: Review[] = [
  {
    name: "Adam Wathan",
    role: "Founder, Tailwind",
    quote:
      "I've been using this course as a refresher for nearly a semester and keep coming back to the systems module.",
    dark: true,
    accent: "var(--color-blue)",
  },
  {
    name: "Ian Callahan",
    role: "Harvard Art Museums",
    quote: "Genuinely the clearest explanation of design systems I've seen taught anywhere.",
    dark: false,
    accent: "var(--color-amber)",
  },
  {
    name: "Aaron Francis",
    role: "Co-founder, Try Hard Studios",
    quote: "Takes the pain out of learning motion design — the pacing is exactly right.",
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
    quote: "This course has been integral to how we onboard new hires into design.",
    dark: true,
    accent: "var(--color-coral)",
  },
  {
    name: "Priya Menon",
    role: "Design Lead, Freshworks",
    quote: "The final case study review alone was worth the price. My portfolio has never been stronger.",
    dark: false,
    accent: "var(--color-blue)",
  },
]

const HIGHLIGHTS = [
  "A working design system in Figma",
  "A recorded portfolio case study",
  "Feedback from a working designer",
  "A shareable, verified certificate",
]

/* ------------------------------------------------------------------ */
/*  Decorative marks                                                   */
/* ------------------------------------------------------------------ */

function FlowerMark({
  size = 24,
  className,
  color = "currentColor",
}: {
  size?: number
  className?: string
  color?: string
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" className={className}>
      <path
        fill={color}
        d="M16 3.2c1.7 0 3.1 1.2 3.4 2.8a3.5 3.5 0 0 1 4.8 1.4 3.5 3.5 0 0 1 1.4 4.8 3.5 3.5 0 0 1 0 5.6 3.5 3.5 0 0 1-1.4 4.8 3.5 3.5 0 0 1-4.8 1.4 3.5 3.5 0 0 1-6.8 0 3.5 3.5 0 0 1-4.8-1.4 3.5 3.5 0 0 1-1.4-4.8 3.5 3.5 0 0 1 0-5.6 3.5 3.5 0 0 1 1.4-4.8 3.5 3.5 0 0 1 4.8-1.4A3.5 3.5 0 0 1 16 3.2Z"
      />
      <circle cx="16" cy="16" r="4.2" fill="#ffffff" />
    </svg>
  )
}

function BurstMark({ size = 22, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="9" cy="9" r="5" fill="var(--color-blue)" />
      <circle cx="15" cy="9" r="5" fill="var(--color-teal)" fillOpacity="0.85" />
      <circle cx="9" cy="15" r="5" fill="var(--color-amber)" fillOpacity="0.9" />
      <circle cx="15" cy="15" r="5" fill="var(--color-purple)" fillOpacity="0.85" />
    </svg>
  )
}

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
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-full font-semibold text-paper"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.38,
        background: accent,
        boxShadow: onDark ? "0 0 0 3px rgba(255,255,255,0.08)" : "0 0 0 3px rgba(20,22,28,0.04)",
      }}
    >
      {initials}
    </span>
  )
}

/* A medallion badge, unique per course via label + accent */
function CourseBadge({ label = "UI / UX", accent = "var(--color-blue)" }: { label?: string; accent?: string }) {
  const scallops = Array.from({ length: 12 })
  return (
    <div className="relative shrink-0">
      <svg width="164" height="188" viewBox="0 0 164 188" aria-hidden="true">
        <defs>
          <linearGradient id="badgeGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={accent} />
            <stop offset="1" stopColor="var(--color-purple)" />
          </linearGradient>
        </defs>
        {/* ribbon tails */}
        <path d="M60 118 L44 180 L70 162 L80 128 Z" fill="var(--color-coral)" />
        <path d="M104 118 L120 180 L94 162 L84 128 Z" fill="var(--color-teal)" />
        {/* scalloped ring */}
        {scallops.map((_, i) => {
          const a = (i / 12) * Math.PI * 2
          const cx = 82 + Math.cos(a) * 52
          const cy = 74 + Math.sin(a) * 52
          return <circle key={i} cx={cx} cy={cy} r="12" fill="url(#badgeGrad)" />
        })}
        <circle cx="82" cy="74" r="56" fill="url(#badgeGrad)" />
        <circle cx="82" cy="74" r="45" fill="var(--color-ink)" />
        <circle
          cx="82"
          cy="74"
          r="45"
          fill="none"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth="1.5"
          strokeDasharray="3 5"
        />
      </svg>
      <div className="absolute inset-x-0 top-[44px] flex flex-col items-center text-paper">
        <Award size={30} className="text-amber" />
        <span className="mt-1 text-[11px] font-semibold uppercase tracking-widest text-white/80">{label}</span>
        <span className="text-[10px] text-white/45">Certified</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Breadcrumb (modern replacement for the back button)               */
/* ------------------------------------------------------------------ */

function Breadcrumb({ category, title }: { category: string; title: string }) {
  const crumbs = [
    { label: "Explore", href: "/explore" },
    { label: category, href: "/explore" }
  ]
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-1.5 text-[13px]">
        {crumbs.map((c) => (
          <li key={c.label} className="flex items-center gap-1.5">
            <Link
              href={c.href}
              className="rounded-full px-2.5 py-1 font-medium text-subtle transition-colors hover:bg-mist hover:text-ink"
            >
              {c.label}
            </Link>
            <ChevronRight size={13} className="text-subtle/40" />
          </li>
        ))}
        <li className="rounded-full bg-ink/[0.04] px-2.5 py-1 font-semibold text-ink">{title}</li>
      </ol>
    </nav>
  )
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

function CourseHero({ course }: { course: any }) {
  const [saved, setSaved] = useState(false)
  const titleWords = course.title.split(" ")
  const lastWord = titleWords.pop() || ""
  const remainingTitle = titleWords.join(" ")

  const dynamicMeta = [
    { icon: Clock, label: course.duration, dot: "var(--color-blue)" },
    { icon: BookOpen, label: "19 lessons", dot: "var(--color-amber)" },
    { icon: Users, label: "12,480 enrolled", dot: "var(--color-teal)" },
  ]

  return (
    <section className="arcade-fade">
      <Breadcrumb category={course.categoryName} title={course.title} />

      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left — editorial copy */}
        <div>
          {/* Course name as the headline, keeping the word-marking */}
          <h1
            className="mt-6 text-[2.75rem] font-normal leading-[1.05] tracking-tight text-ink text-balance sm:text-[4rem]"
            style={{ fontFamily: '"Clash Display", var(--font-sora), sans-serif', fontWeight: 700 }}
          >
            {remainingTitle}{" "}
            <span className="relative whitespace-nowrap italic text-blue">
              {lastWord}
              <FlowerMark
                size={26}
                color="var(--color-ink)"
                className="arcade-spin absolute -right-8 -top-2 hidden sm:block"
              />
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 12"
                fill="none"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M2 9C40 3 160 3 198 8" stroke="var(--color-amber)" strokeWidth="4" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          {/* Instructor: name + channel (with org already shown on top) */}
          <div className="mt-7 flex items-center gap-3">
            <Avatar name={INSTRUCTOR.name} accent={INSTRUCTOR.accent} size={46} />
            <div>
              <p className="text-[15px] font-semibold text-ink">{INSTRUCTOR.name}</p>
              <p className="flex items-center gap-1.5 text-[13px] text-subtle">
                <Radio size={13} className="text-blue" /> {INSTRUCTOR.channel}
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-2.5">
            {dynamicMeta.map(({ icon: Icon, label, dot }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-2 text-[13px] font-medium text-ink"
              >
                <span className="size-1.5 rounded-full" style={{ background: dot }} />
                <Icon size={14} className="text-subtle" /> {label}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-baseline gap-2 pr-1">
              <span className="font-serif text-3xl font-medium text-ink">$20</span>
              <span className="text-sm text-subtle line-through">$49</span>
            </div>
            <button className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5 active:scale-[0.98]">
              Enroll now
            </button>
            <button
              onClick={() => setSaved((s) => !s)}
              aria-pressed={saved}
              aria-label={saved ? "Remove from wishlist" : "Save to wishlist"}
              className="grid size-11 place-items-center rounded-full border border-line bg-paper text-subtle transition-colors hover:text-coral"
            >
              <Heart
                size={18}
                fill={saved ? "var(--color-coral)" : "none"}
                color={saved ? "var(--color-coral)" : "currentColor"}
              />
            </button>
          </div>
        </div>

        {/* Right — dark video preview card */}
        <div className="relative">
          <div
            className="absolute -right-4 -top-5 hidden size-24 rounded-full opacity-70 blur-2xl lg:block"
            style={{ background: "var(--color-teal)" }}
            aria-hidden="true"
          />
          <div className="relative rounded-3xl bg-ink p-3.5 shadow-[0_28px_60px_rgba(20,22,28,0.28)]">
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-2.5">
                <span className="grid size-8 place-items-center rounded-full bg-blue text-xs font-bold text-paper">
                  A
                </span>
                <div>
                  <p className="text-[13px] font-semibold text-paper">Course preview</p>
                  <p className="text-[11px] text-white/50">{INSTRUCTOR.channel}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-white/45">
                <Volume2 size={15} />
                <Settings size={15} />
              </div>
            </div>

            <div className="relative grid h-56 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#1d2130] to-[#262a38]">
              <div
                className="absolute -left-6 -top-6 size-24 rounded-full opacity-40 blur-2xl"
                style={{ background: "var(--color-purple)" }}
                aria-hidden="true"
              />
              <button
                aria-label="Play course preview"
                className="grid size-16 place-items-center rounded-full bg-white/12 ring-1 ring-white/20 backdrop-blur-sm transition-transform hover:scale-105"
              >
                <Play size={22} className="translate-x-0.5 text-paper" fill="currentColor" />
              </button>
            </div>

            <div className="mt-3.5 h-1 rounded-full bg-white/12">
              <div className="h-full w-[35%] rounded-full bg-coral" />
            </div>
            <div className="mt-2.5 flex items-center justify-between px-0.5 text-[11px] text-white/50">
              <span>0:42 / 2:00</span>
              <span className="flex items-center gap-3">
                <Share2 size={13} />
                <Clock size={13} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Tabs                                                               */
/* ------------------------------------------------------------------ */

function CourseTabs({ course }: { course: any }) {
  const [tab, setTab] = useState<Tab>("Overview")
  const [openMod, setOpenMod] = useState(0)

  return (
    <div>
      {/* Segmented tab control */}
      <div className="flex justify-center">
        <div className="inline-flex flex-wrap justify-center gap-1 rounded-full border border-line bg-paper p-1.5">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              className={`rounded-full px-4 py-2 text-[13px] font-semibold transition-colors sm:px-5 ${tab === t ? "bg-ink text-paper" : "text-subtle hover:text-ink"
                }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div key={tab} className="arcade-fade mt-10">
        {tab === "Overview" && (
          <div className="grid gap-8 md:grid-cols-2">
            <div className="rounded-3xl border border-line bg-paper p-7">
              <h3 className="font-serif text-2xl font-light text-ink">About this course</h3>
              <p className="mt-4 text-[15px] leading-relaxed text-subtle">
                {course.desc}
              </p>
            </div>
            <div className="rounded-3xl border border-line bg-paper p-7">
              <h3 className="font-serif text-2xl font-light text-ink">What you&apos;ll walk away with</h3>
              <ul className="mt-4 flex flex-col gap-3">
                {HIGHLIGHTS.map((h) => (
                  <li key={h} className="flex items-center gap-3 text-[15px] text-ink">
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-teal/12">
                      <Check size={13} className="text-teal" />
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab === "Syllabus" && (
          <div className="mx-auto max-w-3xl">
            {/* Structured summary of the course layout */}
            <div className="mb-6 flex flex-wrap items-center justify-center gap-2.5">
              {[
                { icon: BookOpen, label: `${MODULES.length} modules`, c: "var(--color-blue)" },
                { icon: PlayCircle, label: `${TOTAL_LESSONS} lessons`, c: "var(--color-amber)" },
                { icon: Clock, label: "4h 30m total", c: "var(--color-teal)" },
              ].map(({ icon: Icon, label, c }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-1.5 text-[13px] font-medium text-ink"
                >
                  <Icon size={14} style={{ color: c }} /> {label}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              {MODULES.map((m, idx) => {
                const open = openMod === idx
                return (
                  <div
                    key={m.title}
                    className="overflow-hidden rounded-2xl border border-line bg-paper transition-colors hover:border-ink/15"
                  >
                    <button
                      onClick={() => setOpenMod(open ? -1 : idx)}
                      aria-expanded={open}
                      className="flex w-full items-center gap-4 px-5 py-4 text-left"
                    >
                      <span
                        className="grid size-10 shrink-0 place-items-center rounded-xl font-serif text-base font-medium text-paper"
                        style={{ background: m.accent }}
                      >
                        {idx + 1}
                      </span>
                      <span className="flex-1">
                        <span className="block text-[11px] font-semibold uppercase tracking-wide text-subtle">
                          Module {idx + 1}
                        </span>
                        <span className="block text-[15px] font-semibold text-ink">{m.title}</span>
                      </span>
                      <span className="hidden text-xs text-subtle sm:block">
                        {m.lessons.length} lessons · {m.duration}
                      </span>
                      <ChevronDown
                        size={17}
                        className="text-subtle transition-transform"
                        style={{ transform: open ? "rotate(180deg)" : "none" }}
                      />
                    </button>
                    {open && (
                      <ul className="flex flex-col gap-1 border-t border-line px-3 pb-3 pt-2">
                        {m.lessons.map((lesson, li) => (
                          <li
                            key={lesson.title}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-mist"
                          >
                            <span className="w-5 text-center text-[12px] font-medium text-subtle/70">{li + 1}</span>
                            <PlayCircle size={16} style={{ color: m.accent }} className="shrink-0" />
                            <span className="flex-1 text-[14px] text-ink">{lesson.title}</span>
                            <span className="text-[12px] text-subtle">{lesson.length}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {tab === "Instructor" && (
          <div className="mx-auto max-w-3xl rounded-3xl border border-line bg-paper p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <Avatar name={INSTRUCTOR.name} accent={INSTRUCTOR.accent} size={72} />
              <div className="flex-1">
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-purple/10 px-2.5 py-1 text-[12px] font-medium text-purple">
                  <BadgeCheck size={13} /> {INSTRUCTOR.org}
                </div>
                <h3 className="font-serif text-2xl font-light text-ink">{INSTRUCTOR.name}</h3>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-subtle">
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase size={13} /> {INSTRUCTOR.role}
                  </span>
                  <span className="text-subtle/40">·</span>
                  <span className="inline-flex items-center gap-1.5">
                    <Radio size={13} className="text-blue" /> {INSTRUCTOR.channel}
                  </span>
                </p>
              </div>
              <button className="rounded-full bg-ink px-5 py-2.5 text-[13px] font-semibold text-paper transition-transform hover:-translate-y-0.5">
                Follow channel
              </button>
            </div>

            <p className="mt-6 text-[15px] leading-relaxed text-subtle">{INSTRUCTOR.bio}</p>

            <div className="mt-6 flex flex-wrap gap-2">
              {INSTRUCTOR.expertise.map((e) => (
                <span
                  key={e}
                  className="rounded-full border border-line bg-mist px-3 py-1.5 text-[12px] font-medium text-ink"
                >
                  {e}
                </span>
              ))}
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 border-t border-line pt-6 sm:grid-cols-4">
              {INSTRUCTOR.stats.map(({ k, label, c, icon: Icon }) => (
                <div key={label}>
                  <Icon size={16} style={{ color: c }} />
                  <p className="mt-2 font-serif text-xl font-medium text-ink">{k}</p>
                  <p className="text-[12px] text-subtle">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "Certificate" && (
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-10 rounded-3xl border border-line bg-paper p-8 sm:flex-row sm:items-center">
            <CourseBadge label={course.title.split(" ").slice(0, 2).join(" ")} accent="var(--color-blue)" />
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber/15 px-2.5 py-1 text-[12px] font-semibold text-ink">
                <Sparkles size={13} className="text-amber" /> Course badge
              </span>
              <h3 className="mt-3 font-serif text-2xl font-light text-ink">Earn a badge that&apos;s one of a kind</h3>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-subtle">
                This badge is unique to <span className="font-medium text-ink">{course.title}</span> — no other
                course carries it. Finish all four modules and your final case study to unlock it on your profile.
                You&apos;ll also receive a verified certificate of completion to share.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Reviews                                                           */
/* ------------------------------------------------------------------ */

interface ReviewResponse {
  id: string;
  courseId: string;
  userId: string;
  userName: string;
  userRole: string;
  userAvatarUrl?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

function ReviewsBlock({
  courseSlug,
  reviews,
  onReviewSubmitted
}: {
  courseSlug: string;
  reviews: ReviewResponse[];
  onReviewSubmitted: () => void;
}) {
  const { user, status } = useAuthStore();
  const isAuthenticated = status === "authenticated";

  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    : 0.0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setErrorMsg("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    setErrorMsg("");

    try {
      await api.post(`/api/v1/reviews/courses/${courseSlug}`, {
        rating,
        comment
      });
      setRating(0);
      setComment("");
      onReviewSubmitted();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section aria-labelledby="reviews-heading" className="flex flex-col gap-10">
      <div className="flex flex-col items-center gap-3 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wide text-subtle">
          <Star size={13} className="text-amber" fill="var(--color-amber)" strokeWidth={0} /> Reviews
        </span>
        <h2 id="reviews-heading" className="font-serif text-3xl font-light text-ink text-balance sm:text-4xl">
          Loved by <span className="italic text-blue">{totalReviews}</span> {totalReviews === 1 ? "builder" : "builders"}
        </h2>
        {totalReviews > 0 && (
          <div className="flex items-center gap-3">
            <span className="font-serif text-3xl font-light text-ink">{avgRating.toFixed(1)}</span>
            <div className="text-left">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((starVal) => (
                  <Star
                    key={starVal}
                    size={14}
                    className="text-amber"
                    fill={starVal <= Math.round(avgRating) ? "var(--color-amber)" : "none"}
                    stroke="var(--color-amber)"
                    strokeWidth={starVal <= Math.round(avgRating) ? 0 : 1.5}
                  />
                ))}
              </div>
              <p className="mt-0.5 text-xs text-subtle">{totalReviews} {totalReviews === 1 ? "rating" : "ratings"}</p>
            </div>
          </div>
        )}
      </div>

      {/* Review Submission Form */}
      <div className="mx-auto max-w-xl w-full border border-line bg-paper rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <h3 className="font-serif text-xl font-light text-ink mb-4">Share your feedback</h3>
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-subtle">Your Rating</span>
              <div className="flex gap-1.5 items-center">
                {[1, 2, 3, 4, 5].map((starVal) => (
                  <button
                    key={starVal}
                    type="button"
                    onClick={() => setRating(starVal)}
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                    aria-label={`Rate ${starVal} stars`}
                  >
                    <Star
                      size={26}
                      className="text-amber"
                      fill={(hoverRating || rating) >= starVal ? "var(--color-amber)" : "none"}
                      stroke="var(--color-amber)"
                      strokeWidth={(hoverRating || rating) >= starVal ? 0 : 1.5}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="text-sm font-semibold text-ink ml-2">
                    {rating} {rating === 1 ? "Star" : "Stars"}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="review-comment" className="text-xs font-semibold uppercase tracking-wider text-subtle">
                Review Comment
              </label>
              <textarea
                id="review-comment"
                placeholder="What did you think of the course? What did you learn?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="w-full rounded-2xl border border-line bg-mist p-4 text-[14px] leading-relaxed text-ink focus:border-ink/20 focus:outline-none"
              />
            </div>

            {errorMsg && (
              <p className="text-xs font-semibold text-coral">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        ) : (
          <div className="text-center py-4">
            <p className="text-[14px] text-subtle mb-4">Please log in to share your experience and rate this course.</p>
            <Link
              href="/login"
              className="inline-block rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-paper hover:bg-ink/90 transition-transform hover:-translate-y-0.5"
            >
              Log In
            </Link>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-12 border border-line border-dashed rounded-3xl bg-paper">
          <p className="text-sm text-subtle">No reviews yet for this course. Be the first to leave a review!</p>
        </div>
      ) : (
        <div className="[column-gap:1rem] sm:columns-2 lg:columns-3">
          {reviews.map((r, i) => {
            const cardAccentColors = [
              "var(--color-blue)",
              "var(--color-amber)",
              "var(--color-purple)",
              "var(--color-teal)",
              "var(--color-coral)"
            ];
            const accentColor = cardAccentColors[i % cardAccentColors.length];
            const isDarkCard = i % 5 === 0;

            return (
              <div
                key={r.id}
                className={`mb-4 break-inside-avoid rounded-2xl p-6 ${
                  isDarkCard ? "bg-ink text-paper" : "border border-line bg-paper text-ink"
                }`}
              >
                <div className="flex gap-0.5 mb-3">
                  {[1, 2, 3, 4, 5].map((starVal) => (
                    <Star
                      key={starVal}
                      size={12}
                      className="text-amber"
                      fill={starVal <= r.rating ? "var(--color-amber)" : "none"}
                      stroke="var(--color-amber)"
                      strokeWidth={starVal <= r.rating ? 0 : 1.5}
                    />
                  ))}
                </div>
                <p className={`text-[15px] leading-relaxed ${isDarkCard ? "font-medium" : ""}`}>
                  &ldquo;{r.comment || "Rated this course."}&rdquo;
                </p>
                <div
                  className={`mt-5 flex items-center justify-between border-t pt-4 ${
                    isDarkCard ? "border-white/10" : "border-line"
                  }`}
                >
                  <div>
                    <p className={`text-[13px] font-semibold ${isDarkCard ? "text-paper" : "text-ink"}`}>{r.userName}</p>
                    <p className={`text-[11px] ${isDarkCard ? "text-white/50" : "text-subtle"}`}>{r.userRole}</p>
                  </div>
                  <Avatar name={r.userName} accent={accentColor} size={32} onDark={isDarkCard} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Enroll CTA                                                         */
/* ------------------------------------------------------------------ */

function EnrollCta({ course }: { course: any }) {
  return (
    <section className="arcade-cta-wash relative overflow-hidden rounded-[2rem] px-8 py-14 text-center sm:px-16 sm:py-16">
      <FlowerMark
        size={120}
        color="rgba(255,255,255,0.06)"
        className="arcade-spin pointer-events-none absolute -right-8 -top-8"
      />
      <h2 className="mx-auto max-w-2xl font-serif text-3xl font-light leading-tight text-paper text-balance sm:text-4xl">
        Light the path to your next <span className="italic text-amber">{course.title.split(" ").slice(-2).join(" ")} role.</span>
      </h2>
      <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/60">
        Join 12,480 builders learning to {course.title.toLowerCase()} — with feedback from working
        designers.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button className="rounded-full bg-paper px-6 py-3 text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5">
          Enroll for $20
        </button>
        <button className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold text-paper transition-colors hover:bg-white/10">
          See how it works →
        </button>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function CoursePreviewPage() {
  const params = useParams();
  const id = params.id as string;

  const allCourses = Object.entries(CATEGORY_DATA).flatMap(([catName, catData]) =>
    catData.courses.map((c) => ({
      ...c,
      categoryName: catName,
      slug: slugify(c.title),
    }))
  );

  const defaultCourse = {
    title: "Design interfaces people actually love",
    duration: "4h 30m",
    level: "Intermediate",
    desc: "This course treats design as a craft you build in public — every module ends with a real assignment, reviewed by a working product designer. You'll leave with a portfolio piece, not just a certificate.",
    categoryName: "UI / UX & Product Design",
    slug: "design-interfaces-people-actually-love",
  };

  const currentCourse = allCourses.find((c) => c.slug === id) || defaultCourse;

  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const fetchReviews = () => {
    api.get<ReviewResponse[]>(`/api/v1/reviews/courses/${currentCourse.slug}`)
      .then((data) => {
        setReviews(data || []);
      })
      .catch((err) => console.error("Failed to load reviews:", err))
      .finally(() => setLoadingReviews(false));
  };

  useEffect(() => {
    fetchReviews();
  }, [currentCourse.slug]);

  return (
    <main className="min-h-screen bg-paper text-ink">
      {/* Hero wash */}
      <div className="arcade-wash">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-28 sm:px-8 sm:pt-32">
          <CourseHero course={currentCourse} />
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <CourseTabs course={currentCourse} />
        <div className="mt-20">
          <ReviewsBlock
            courseSlug={currentCourse.slug}
            reviews={reviews}
            onReviewSubmitted={fetchReviews}
          />
        </div>
        <div className="mt-16">
          <EnrollCta course={currentCourse} />
        </div>
      </div>
    </main>
  )
}
