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
import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { api } from "@/infrastructure/http/api"
import type { CourseResponse } from "@/shared/types/api.types"
import { EnrollButton } from "@/shared/design-system/ui/EnrollButton"
import InteractiveBookSpread from "@/components/course/InteractiveBookSpread"
import { UserService } from "@/domains/identity"
import { toast } from "sonner"
import CourseReviewsSection from "@/components/course/CourseReviewsSection"
import CourseVideoPreviewCard from "@/components/course/CourseVideoPreviewCard"
import { AnimatedList, AnimatedItem } from "@/components/ui/AnimatedList"

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

const TABS = ["Overview", "Syllabus", "Instructor", "Certificate", "Exam"] as const
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

const MODULE_LIGHT_GRADIENTS = [
  "linear-gradient(135deg, rgba(59, 130, 246, 0.14) 0%, rgba(99, 102, 241, 0.04) 100%)",
  "linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(251, 146, 60, 0.04) 100%)",
  "linear-gradient(135deg, rgba(139, 92, 246, 0.14) 0%, rgba(99, 102, 241, 0.04) 100%)",
  "linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(20, 184, 166, 0.04) 100%)",
]

const MODULE_BORDER_COLORS = [
  "rgba(59, 130, 246, 0.28)",
  "rgba(245, 158, 11, 0.28)",
  "rgba(139, 92, 246, 0.28)",
  "rgba(16, 185, 129, 0.28)",
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
  imageUrl,
  accent = "var(--color-blue)",
  size = 36,
  onDark = false,
}: {
  name: string
  imageUrl?: string | null
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

  const commonStyle = {
    width: size,
    height: size,
    boxShadow: onDark ? "0 0 0 3px rgba(255,255,255,0.08)" : "0 0 0 3px rgba(20,22,28,0.04)",
  }

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        className="shrink-0 rounded-full object-cover"
        style={commonStyle}
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-full font-semibold text-paper"
      style={{
        ...commonStyle,
        fontSize: size * 0.38,
        background: accent,
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
/*  Nav                                                                */
/* ------------------------------------------------------------------ */

function HeroNav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4">
      <nav
        aria-label="Primary"
        className="flex w-full max-w-6xl items-center justify-between gap-4 rounded-2xl border border-line/80 bg-paper/85 px-5 py-3 shadow-[0_8px_30px_rgba(20,22,28,0.06)] backdrop-blur-md"
      >
        <Link href="/" className="font-serif text-xl font-semibold tracking-tight text-blue">
          arcade<span className="text-ink">.</span>
        </Link>

        <ul className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link}>
              <Link href="#" className="text-sm font-medium text-subtle transition-colors hover:text-ink">
                {link}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link
            href="#"
            className="hidden rounded-full px-4 py-2 text-sm font-medium text-subtle transition-colors hover:text-ink sm:inline-block"
          >
            Log in
          </Link>
          <Link
            href="#"
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper transition-transform hover:-translate-y-0.5"
          >
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  )
}

/* ------------------------------------------------------------------ */
/*  Breadcrumb (modern replacement for the back button)               */
/* ------------------------------------------------------------------ */

function Breadcrumb({ title }: { title: string }) {
  const crumbs = [
    { label: "Courses", href: "/" }
  ]
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-2 text-[13.5px]">
        {crumbs.map((c) => (
          <li key={c.label} className="flex items-center gap-2">
            <Link
              href={c.href}
              className="font-bold text-slate-700 hover:text-ink transition-colors"
            >
              {c.label}
            </Link>
            <ChevronRight size={13} className="text-subtle/50" />
          </li>
        ))}
        <li className="font-bold text-ink">{title}</li>
      </ol>
    </nav>
  )
}

/* ------------------------------------------------------------------ */
/*  Hero                                                               */
/* ------------------------------------------------------------------ */

function CourseHero({ 
  title, 
  authorName, 
  authorUsername, 
  authorAvatarUrl,
  lessonCount = 0,
  onEnroll,
  isEnrolling = false,
  isEnrolled = false,
  pricingModel,
  priceAmount,
  courseId
}: {
  title: string
  authorName?: string
  authorUsername?: string
  authorAvatarUrl?: string | null
  lessonCount?: number
  onEnroll?: () => void
  isEnrolling?: boolean
  isEnrolled?: boolean
  pricingModel?: string
  priceAmount?: number
  courseId?: string
}) {
  const [saved, setSaved] = useState(false)

  const words = title.split(' ')
  const lastWord = words.pop() || ''
  const firstPart = words.join(' ')
  
  const displayAuthor = authorName || INSTRUCTOR.name;
  const displayUsername = authorUsername || displayAuthor.toLowerCase().replace(/\s+/g, '');
  const authorInitials = displayAuthor.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const metaData = [
    { icon: Clock, label: "4h 30m", dot: "var(--color-blue)" },
    { icon: BookOpen, label: `${lessonCount} lesson${lessonCount !== 1 ? 's' : ''}`, dot: "var(--color-amber)" },
    { icon: Users, label: "12,480 enrolled", dot: "var(--color-teal)" },
  ]

  return (
    <section className="arcade-fade">
      <Breadcrumb title={title} />

      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        {/* Left — editorial copy */}
        <div>
          {/* Course name as the headline */}
          <h1
            className="mt-6 text-[2.75rem] font-bold leading-[1.05] tracking-tight text-ink text-balance sm:text-[4rem]"
            style={{ fontFamily: '"Clash Display", var(--font-sora), sans-serif' }}
          >
            {firstPart}{" "}
            <span className="bg-gradient-to-r from-[#00c885] via-[#0284c7] to-[#4f46e5] bg-clip-text text-transparent">
              {lastWord}
            </span>
          </h1>

          {/* Instructor: name + channel */}
          <div className="mt-5 flex items-center gap-2.5">
            <Avatar name={displayAuthor} imageUrl={authorAvatarUrl} accent={INSTRUCTOR.accent} size={34} />
            <div>
              <p className="text-sm font-semibold text-ink">{displayAuthor}</p>
              <p className="flex items-center gap-1 text-[11.5px] font-medium text-subtle">
                <Radio size={12} className="text-blue" /> @{displayUsername}
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap gap-2.5">
            {metaData.map(({ icon: Icon, label, dot }) => (
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
              {pricingModel === "PAID" ? (
                <>
                  <span className="font-serif text-3xl font-medium text-ink">${priceAmount}</span>
                  {/* <span className="text-sm text-subtle line-through">${(priceAmount || 0) * 2}</span> */}
                </>
              ) : (
                <span className="font-serif text-3xl font-medium text-ink">Free</span>
              )}
            </div>
            {isEnrolled ? (
              <Link
                href={`/learn/${courseId}/learn`}
                className="flex h-11 items-center gap-2 rounded-full bg-green-500 px-6 font-semibold text-white transition-all hover:bg-green-600"
              >
                <Check size={18} /> Go to course
              </Link>
            ) : (
              <EnrollButton onClick={onEnroll}>
                {isEnrolling ? "Enrolling..." : "Enroll now"}
              </EnrollButton>
            )}
          </div>
        </div>

        {/* Right — Futuristic glassmorphic video preview card */}
        <CourseVideoPreviewCard
          authorAvatarUrl={authorAvatarUrl}
          displayAuthor={displayAuthor}
          displayUsername={displayUsername}
          authorInitials={authorInitials}
          videoSrc="/boradingui.mp4"
          posterUrl="/ink-dome-bg.jpg"
        />
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Tabs                                                               */
/* ------------------------------------------------------------------ */

function CourseTabs() {
  const [tab, setTab] = useState<Tab>("Overview")
  const [openMod, setOpenMod] = useState(0)
  const params = useParams()

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
          <div className="grid gap-12 md:grid-cols-2 md:gap-16">
            <AnimatedItem index={0} style={{ cursor: "default" }}>
              <h3 className="font-serif text-2xl font-light text-ink">About this course</h3>
              <p className="mt-4 text-[15px] leading-relaxed text-subtle">
                This course treats design as a craft you build in public — every module ends with a real
                assignment, reviewed by a working product designer. You&apos;ll leave with a portfolio piece, not
                just a certificate.
              </p>
            </AnimatedItem>
            <div className="md:pl-8 lg:pl-12">
              <h3 className="font-serif text-2xl font-light text-ink">What you&apos;ll walk away with</h3>
              <div className="mt-4">
                <AnimatedList
                  items={HIGHLIGHTS}
                  showGradients={false}
                  displayScrollbar={false}
                  renderItem={(h) => (
                    <div className="flex items-center gap-3 text-[15px] text-ink py-0.5">
                      <span className="grid size-5 shrink-0 place-items-center rounded-full bg-teal/12">
                        <Check size={13} className="text-teal" />
                      </span>
                      <span>{h}</span>
                    </div>
                  )}
                />
              </div>
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
                const bgGradient = MODULE_LIGHT_GRADIENTS[idx % MODULE_LIGHT_GRADIENTS.length]
                const borderColor = MODULE_BORDER_COLORS[idx % MODULE_BORDER_COLORS.length]
                return (
                  <div
                    key={m.title}
                    className="overflow-hidden rounded-2xl border transition-all duration-200 hover:shadow-sm"
                    style={{
                      background: bgGradient,
                      borderColor: borderColor,
                    }}
                  >
                    <button
                      onClick={() => setOpenMod(open ? -1 : idx)}
                      aria-expanded={open}
                      className="flex w-full items-center gap-4 px-5 py-4 text-left"
                    >
                      <span
                        className="grid size-10 shrink-0 place-items-center rounded-xl font-serif text-lg font-bold border"
                        style={{ color: m.accent, borderColor: borderColor }}
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
                      <ul
                        className="flex flex-col gap-1 border-t px-3 pb-3 pt-2"
                        style={{ borderColor: borderColor }}
                      >
                        {m.lessons.map((lesson, li) => (
                          <li
                            key={lesson.title}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/60 dark:hover:bg-black/20"
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
            <CourseBadge label="UI / UX" accent="var(--color-blue)" />
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber/15 px-2.5 py-1 text-[12px] font-semibold text-ink">
                <Sparkles size={13} className="text-amber" /> Course badge
              </span>
              <h3 className="mt-3 font-serif text-2xl font-light text-ink">Earn a badge that&apos;s one of a kind</h3>
              <p className="mt-3 max-w-md text-[15px] leading-relaxed text-subtle">
                This badge is unique to <span className="font-medium text-ink">{COURSE_TITLE}</span> — no other
                course carries it. Finish all four modules and your final case study to unlock it on your profile.
                You&apos;ll also receive a verified certificate of completion to share.
              </p>
            </div>
          </div>
        )}

        {tab === "Exam" && (
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-2xl border border-slate-200/80 bg-white/95 p-8 text-center shadow-[0_8px_24px_rgba(20,20,43,0.05)] sm:p-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[#14142b]">
              <BadgeCheck size={14} /> Final assessment
            </span>
            <div>
              <h3 className="text-[1.5rem] font-bold tracking-tight text-[#14142b]">
                Take the final exam
              </h3>
              <p className="mx-auto mt-2 max-w-md text-[13px] font-medium leading-relaxed text-slate-500">
                25 questions · 60 minutes · secure fullscreen session. Pass to earn your certificate.
              </p>
            </div>
            <Link
              href={`/learn/${params.courseId}/exam`}
              className="inline-flex items-center gap-2 rounded-full bg-[#14142b] px-7 py-3 text-[13px] font-semibold text-white shadow-[0_8px_16px_rgba(20,20,43,0.16)] transition-colors hover:bg-[#232735]"
            >
              Proceed to exam <ChevronRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Reviews (now its own block, out of the tab panel)                  */
/* ------------------------------------------------------------------ */

function ReviewsBlock() {
  return (
    <section aria-labelledby="reviews-heading">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wide text-subtle">
          <Star size={13} className="text-amber" fill="var(--color-amber)" strokeWidth={0} /> Reviews
        </span>
        <h2 id="reviews-heading" className="font-serif text-3xl font-light text-ink text-balance sm:text-4xl">
          Loved by <span className="italic text-blue">12,480</span> builders
        </h2>
        <div className="flex items-center gap-3">
          <span className="font-serif text-3xl font-light text-ink">4.9</span>
          <div className="text-left">
            <div className="flex gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} size={14} className="text-amber" fill="var(--color-amber)" strokeWidth={0} />
              ))}
            </div>
            <p className="mt-0.5 text-xs text-subtle">812 ratings</p>
          </div>
        </div>
      </div>

      <div className="[column-gap:1rem] sm:columns-2 lg:columns-3">
        {REVIEWS.map((r) => (
          <div
            key={r.name}
            className={`mb-4 break-inside-avoid rounded-2xl p-6 ${r.dark ? "bg-ink" : "border border-line bg-paper"
              }`}
          >
            <p className={`text-[15px] leading-relaxed ${r.dark ? "font-medium text-paper" : "text-ink"}`}>
              &ldquo;{r.quote}&rdquo;
            </p>
            <div
              className={`mt-5 flex items-center justify-between border-t pt-4 ${r.dark ? "border-white/10" : "border-line"
                }`}
            >
              <div>
                <p className={`text-[13px] font-semibold ${r.dark ? "text-paper" : "text-ink"}`}>{r.name}</p>
                <p className={`text-[11px] ${r.dark ? "text-white/50" : "text-subtle"}`}>{r.role}</p>
              </div>
              <Avatar name={r.name} accent={r.accent} size={32} onDark={r.dark} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}


/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

import { useAuthStore } from "@/infrastructure/auth/auth.store"

function getTitleFromSlug(slug?: string): string {
  if (!slug) return ''
  const knownTitles: Record<string, string> = {
    'intro-to-programming': 'Intro to Programming',
    'data-structures-and-algorithms': 'Data Structures & Algorithms',
    'data-structures-algorithms': 'Data Structures & Algorithms',
    'database-management-systems': 'Database Management Systems',
    'software-engineering': 'Software Engineering',
    'programming-logic': 'Programming Logic',
    'relational-databases': 'Relational Databases',
    'ui-ux-product-design': 'UI / UX & Product Design',
    'design-interfaces-people-actually-love': 'Design interfaces people actually love',
  }

  const normalized = slug.toLowerCase().trim()
  if (knownTitles[normalized]) {
    return knownTitles[normalized]
  }

  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => {
      const lower = word.toLowerCase()
      if (lower === 'and') return '&'
      if (lower === 'ui') return 'UI'
      if (lower === 'ux') return 'UX'
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}

export default function CoursePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, updateUser } = useAuthStore()
  const [tab, setTab] = useState<Tab>("Overview")
  const [course, setCourse] = useState<CourseResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [isEnrolled, setIsEnrolled] = useState(false)

  const titleFromQuery = searchParams.get('title')
  const courseIdParam = (params?.courseId as string) || ''

  useEffect(() => {
    if ((user as any)?.enrolledCourses && params?.courseId) {
      const alreadyEnrolled = (user as any).enrolledCourses.some((e: any) => e.courseId === params.courseId)
      setIsEnrolled(alreadyEnrolled)
    }
  }, [user, params?.courseId])

  const handleEnroll = async () => {
    if (!params?.courseId) return;
    try {
      setIsEnrolling(true);
      const updatedUser = await UserService.enrollInCourse(params.courseId as string);
      updateUser(updatedUser);
      toast.success("Successfully enrolled!");
      setIsEnrolled(true);
    } catch (error) {
      toast.error("Failed to enroll. Please try again.");
    } finally {
      setIsEnrolling(false);
    }
  }

  useEffect(() => {
    if (params?.courseId) {
      api.get<CourseResponse>(`/api/v1/public/courses/${params.courseId}`)
        .then(setCourse)
        .catch(console.error)
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [params?.courseId])

  if (loading) {
    return (
      <main className="min-h-screen bg-transparent text-ink flex items-center justify-center">
        <div className="size-8 rounded-full border-2 border-ink border-t-transparent animate-spin" />
      </main>
    )
  }

  const displayTitle = titleFromQuery || course?.title || getTitleFromSlug(courseIdParam) || COURSE_TITLE;
  const authorName = course?.authorName;
  const authorUsername = course?.authorUsername;
  const authorAvatarUrl = course?.authorAvatarUrl;
  const lessonCount = course?.modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0) || 0;

  return (
    <main className="min-h-screen arcade-wash text-ink">
      {/* Hero section */}
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-28 sm:px-8 sm:pt-32">
        <CourseHero 
          title={displayTitle} 
          authorName={authorName}
          authorUsername={authorUsername}
          authorAvatarUrl={authorAvatarUrl}
          lessonCount={lessonCount}
          onEnroll={handleEnroll}
          isEnrolling={isEnrolling}
          isEnrolled={isEnrolled}
          pricingModel={course?.pricingModel}
          priceAmount={course?.priceAmount}
          courseId={params?.courseId as string}
        />
      </div>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <CourseTabs />
        <div className="mt-20">
          <ReviewsBlock />
        </div>
      </div>
    </main>
  )
}
