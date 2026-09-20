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
  Flag,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { api } from "@/infrastructure/http/api"
import type { CourseResponse } from "@/shared/types/api.types"
import { formatMoney } from "@/shared/utils/money"
import { useAuthStore } from "@/infrastructure/auth/auth.store"
import {
  EnrollmentButton,
  useMyEnrollmentForResourceQuery,
  type UIEnrollmentState,
} from "@/domains/enrollment"
import { toast } from "sonner"
import { ReportModal } from "@/shared/design-system/ui/ReportModal"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/design-system/ui/dialog"
import CourseReviewsSection from "@/components/course/CourseReviewsSection"
import CourseVideoPreviewCard from "@/components/course/CourseVideoPreviewCard"
import { AnimatedList, AnimatedItem } from "@/components/ui/AnimatedList"
import BadgeGraphic, { getBadgeForCourse } from "@/components/ui/BadgeGraphic"
import FoldText from "@/components/ui/FoldText"
import { motion } from "framer-motion"
import PartyPopper, { PartyPopperRef } from "@/components/ui/PartyPopper"

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

const EXPERTISE_TAG_STYLES = [
  { bg: "rgba(59, 130, 246, 0.14)", border: "rgba(59, 130, 246, 0.3)", text: "#1d4ed8" },
  { bg: "rgba(245, 158, 11, 0.14)", border: "rgba(245, 158, 11, 0.3)", text: "#b45309" },
  { bg: "rgba(139, 92, 246, 0.14)", border: "rgba(139, 92, 246, 0.3)", text: "#6d28d9" },
  { bg: "rgba(16, 185, 129, 0.14)", border: "rgba(16, 185, 129, 0.3)", text: "#047857" },
  { bg: "rgba(236, 72, 153, 0.14)", border: "rgba(236, 72, 153, 0.3)", text: "#be185d" },
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

/* A hex badge matching the platform's gamified badge system with 3-second rotation & party popper burst */
function CourseBadge({ type = "crystal" }: { type?: string }) {
  const popperRef = useRef<PartyPopperRef>(null)

  useEffect(() => {
    const timer = setTimeout(() => {
      if (popperRef.current) {
        popperRef.current.burst(20, 70)
        popperRef.current.burst(140, 70)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [])

  return (
    <PartyPopper ref={popperRef} className="relative flex shrink-0 items-center justify-center p-4">
      <motion.div
        initial={{ rotateY: 1080, rotateZ: -20, scale: 0.3, opacity: 0 }}
        animate={{ rotateY: 0, rotateZ: 0, scale: 1, opacity: 1 }}
        transition={{
          duration: 3,
          ease: [0.25, 1, 0.5, 1],
        }}
        whileHover={{ scale: 1.08, rotate: 6 }}
        onClick={() => {
          popperRef.current?.burst(20, 70)
          popperRef.current?.burst(140, 70)
        }}
        className="relative flex items-center justify-center cursor-pointer"
        style={{ perspective: 1000 }}
      >
        <div className="h-36 w-28 drop-shadow-xl">
          <BadgeGraphic type={type} />
        </div>
      </motion.div>
    </PartyPopper>
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
  duration = "4h 30m",
  enrollmentCount = 12480,
  onEnroll,
  isEnrolled = false,
  initialState = "NOT_ENROLLED",
  pricingModel,
  priceAmount,
  courseId,
  onReportClick,
  channel,
  collaborators
}: {
  title: string
  authorName?: string
  authorUsername?: string
  authorAvatarUrl?: string | null
  lessonCount?: number
  duration?: string
  enrollmentCount?: number
  onEnroll?: () => void
  isEnrolled?: boolean
  initialState?: "ENROLLED" | "NOT_ENROLLED" | "PENDING" | "WAITLISTED"
  pricingModel?: string
  priceAmount?: number
  courseId?: string
  onReportClick?: () => void
  channel?: { id: string, name: string, iconUrl: string | null, isPersonal: boolean }
  collaborators?: { id: string, name: string, username: string, avatarUrl: string | null, role: string }[]
}) {
  const [saved, setSaved] = useState(false)

  const words = title.split(' ')
  const lastWord = words.pop() || ''
  const firstPart = words.join(' ')
  
  // Prepare author defaults
  const displayAuthor = authorName || INSTRUCTOR.name;
  const displayUsername = authorUsername || displayAuthor.toLowerCase().replace(/\s+/g, '');
  const authorInitials = displayAuthor.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const hasCollaborators = collaborators && collaborators.length > 0;
  // Make sure the primary author is first if we render collaborators, 
  // but collaborators list should already have creator first based on backend logic.

  const metaData = [
    { icon: Clock, label: duration || "Unknown", dot: "var(--color-blue)" },
    { icon: BookOpen, label: `${lessonCount || 1} ${lessonCount === 1 ? 'module' : 'modules'}`, dot: "var(--color-amber)" },
    { icon: Users, label: `${(enrollmentCount || 0).toLocaleString()} enrolled`, dot: "var(--color-teal)" },
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

          {/* Instructor / Channel */}
          {channel && !channel.isPersonal ? (
            <div className="mt-5 flex items-center gap-2.5">
              <Link href={`/channels/${channel.id}`} className="hover:opacity-80 transition-opacity">
                <Avatar name={channel.name} imageUrl={channel.iconUrl} size={34} />
              </Link>
              <div>
                <Link href={`/channels/${channel.id}`} className="hover:underline">
                  <p className="text-sm font-semibold text-ink">{channel.name}</p>
                </Link>
                <Link href={`/${displayUsername}`} className="hover:underline">
                  <p className="flex items-center gap-1 text-[11.5px] font-medium text-subtle">
                    <Radio size={12} className="text-blue" /> by @{displayUsername}
                  </p>
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-5 flex items-center gap-2.5">
              <Link href={`/${displayUsername}`} className="hover:opacity-80 transition-opacity">
                <Avatar name={displayAuthor} imageUrl={authorAvatarUrl} size={34} />
              </Link>
              <div>
                <Link href={`/${displayUsername}`} className="hover:underline">
                  <p className="text-sm font-semibold text-ink">{displayAuthor}</p>
                </Link>
                <Link href={`/${displayUsername}`} className="hover:underline">
                  <p className="text-[11.5px] font-medium text-subtle">@{displayUsername}</p>
                </Link>
              </div>
            </div>
          )}

          {/* Collaborators */}
          {collaborators && collaborators.filter(c => c.username !== displayUsername).length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2 items-center">
              <span className="text-xs text-subtle font-medium">Collaborators:</span>
              {collaborators.filter(c => c.username !== displayUsername).map((collab) => (
                <Link key={collab.id} href={`/${collab.username}`} className="flex items-center gap-1.5 hover:opacity-80 transition-opacity bg-paper border border-line rounded-full px-2 py-0.5">
                  <Avatar name={collab.name} imageUrl={collab.avatarUrl} size={16} />
                  <span className="text-xs text-ink">{collab.name}</span>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-7 flex flex-wrap gap-2.5">
            {metaData.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-paper px-3.5 py-2 text-[13px] font-medium text-ink"
              >
                <Icon size={14} className="text-subtle shrink-0" />
                <span>{label}</span>
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-baseline gap-2 pr-1">
              {pricingModel === "PAID" ? (
                <>
                  <span className="font-serif text-3xl font-medium text-ink">{formatMoney(priceAmount ?? 0, "USD")}</span>
                </>
              ) : (
                <span className="font-serif text-3xl font-medium text-ink">Free</span>
              )}
            </div>
            {courseId && (
              <div className="min-w-[200px] sm:min-w-[240px]">
                <EnrollmentButton
                  resourceType="COURSE"
                  resourceId={courseId}
                  initialState={initialState}
                  onStateChange={(state) => {
                    if (state === "ENROLLED" && onEnroll) {
                      onEnroll();
                    }
                  }}
                />
              </div>
            )}
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
            <button
              onClick={onReportClick}
              aria-label="Report course"
              className="grid size-11 place-items-center rounded-full border border-line bg-paper text-subtle transition-colors hover:text-red-500"
            >
              <Flag size={18} />
            </button>
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

function CourseTabs({ courseTitle, course }: { courseTitle?: string; course?: any }) {
  const [tab, setTab] = useState<Tab>("Overview")
  const [openMod, setOpenMod] = useState(0)
  const params = useParams<{ courseId?: string }>()
  const searchParams = useSearchParams()
  const titleFromQuery = searchParams?.get('title')
  const badgeInfo = getBadgeForCourse(courseTitle || titleFromQuery || params?.courseId)

  return (
    <div>
      {/* Segmented tab control */}
      <div className="flex justify-center">
        <div className="inline-flex flex-wrap justify-center gap-1 rounded-full border border-line bg-paper p-1.5 shadow-sm">
          {TABS.map((t) => {
            const isActive = tab === t
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                onMouseEnter={() => setTab(t)}
                onFocus={() => setTab(t)}
                aria-pressed={isActive}
                className={`relative rounded-full px-4 py-2 text-[13px] font-semibold transition-colors duration-200 sm:px-5 ${
                  isActive ? "text-paper" : "text-subtle hover:text-ink"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeLearnTabPill"
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{t}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div key={tab} className="arcade-fade mt-16 sm:mt-20">
        {tab === "Overview" && (
          <div className="grid gap-12 md:grid-cols-2 md:gap-16">
            <AnimatedItem index={0} style={{ cursor: "default" }}>
              <h3 className="font-serif text-2xl font-light text-ink">About this course</h3>
              {course?.description ? (
                <div className="mt-4 text-[15px] leading-relaxed text-subtle whitespace-pre-wrap">
                  {course.description}
                </div>
              ) : (
                <p className="mt-4 text-[15px] leading-relaxed text-subtle italic opacity-75">
                  No overview information provided.
                </p>
              )}
            </AnimatedItem>
            <div className="md:pl-16 lg:pl-28">
              <h3 className="font-serif text-2xl font-light text-ink">What you&apos;ll walk away with</h3>
              <div className="mt-4">
                {(() => {
                  const items = course?.learningOutcomes ? course.learningOutcomes.split("\n").filter((i: string) => i.trim() !== "") : [];
                  if (items.length === 0) {
                    return <p className="text-[15px] italic text-subtle opacity-75">No learning outcomes listed.</p>;
                  }
                  return (
                    <AnimatedList
                      items={items}
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
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {tab === "Syllabus" && (
          <div className="w-full">
            {/* Structured summary of the course layout */}
            <div className="mb-6 flex flex-wrap items-center justify-center gap-2.5">
              {[
                { icon: BookOpen, label: `${course?.modules?.length || 0} modules`, c: "var(--color-blue)" },
                { icon: PlayCircle, label: `${course?.modules?.reduce((sum: number, mod: any) => sum + (mod.lessons?.length || 0), 0) || 0} lessons`, c: "var(--color-amber)" },
                { icon: Clock, label: course?.duration ? `${course.duration} total` : "4h 30m total", c: "var(--color-teal)" },
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
              {course?.modules?.map((m: any, idx: number) => {
                const open = openMod === idx
                const bgGradient = MODULE_LIGHT_GRADIENTS[idx % MODULE_LIGHT_GRADIENTS.length]
                const borderColor = MODULE_BORDER_COLORS[idx % MODULE_BORDER_COLORS.length]
                return (
                  <div
                    key={m.id || idx}
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
                        style={{ color: m.accent || 'var(--color-ink)', borderColor: borderColor }}
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
                        {m.lessons?.length || 0} lessons
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
                        {m.lessons?.map((lesson: any, li: number) => (
                          <li
                            key={lesson.title}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/60 dark:hover:bg-black/20"
                          >
                            <span className="w-5 text-center text-[12px] font-medium text-subtle/70">{li + 1}</span>
                            <PlayCircle size={16} style={{ color: m.accent || 'var(--color-ink)' }} className="shrink-0" />
                            <span className="flex-1 text-[14px] text-ink">{lesson.title}</span>
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
          <div className="flex flex-col gap-8 w-full">
            {(course?.collaborators || []).map((collaborator: any, index: number) => {
              const isOrg = !course?.channel?.isPersonal;
              const orgName = isOrg ? course?.channel?.name : null;
              
              return (
                <div
                  key={collaborator.id || index}
                  className="w-full rounded-3xl border p-8 transition-all"
                  style={{
                    background: "linear-gradient(135deg, rgba(139, 92, 246, 0.14) 0%, rgba(99, 102, 241, 0.04) 100%)",
                    borderColor: "rgba(139, 92, 246, 0.28)",
                  }}
                >
                  <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                    <Avatar name={collaborator.name || "Unknown"} avatarUrl={collaborator.avatarUrl} size={72} />
                    <div className="flex-1">
                      {orgName && (
                        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-purple/10 px-2.5 py-1 text-[12px] font-medium text-purple">
                          <BadgeCheck size={13} /> {orgName}
                        </div>
                      )}
                      <h3 className="font-serif text-2xl font-light text-ink">{collaborator.name || "Unknown"}</h3>
                      <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-subtle">
                        <span className="inline-flex items-center gap-1.5 uppercase">
                          <Briefcase size={13} /> {collaborator.role ? collaborator.role.replace(/_/g, ' ') : "Instructor"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {(collaborator.specialities || []).map((e: string, idx: number) => {
                      const style = EXPERTISE_TAG_STYLES[idx % EXPERTISE_TAG_STYLES.length]
                      return (
                        <span
                          key={e}
                          className="rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition-all hover:scale-105"
                          style={{
                            background: style.bg,
                            borderColor: style.border,
                            color: style.text,
                          }}
                        >
                          {e}
                        </span>
                      )
                    })}
                  </div>

                  <div
                    className="mt-7 grid grid-cols-2 gap-6 border-t pt-6 text-center"
                    style={{ borderColor: "rgba(139, 92, 246, 0.28)" }}
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Star size={18} className="text-amber" />
                      <p className="mt-2 font-serif text-xl font-medium text-ink">{collaborator.experienceYears || 0}</p>
                      <p className="text-[12px] text-subtle">Years of Experience</p>
                    </div>
                    <div className="flex flex-col items-center justify-center">
                      <PlayCircle size={18} className="text-blue" />
                      <p className="mt-2 font-serif text-xl font-medium text-ink">{collaborator.courseCount || 0}</p>
                      <p className="text-[12px] text-subtle">Courses Created</p>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {(!course?.collaborators || course.collaborators.length === 0) && (
              <div className="p-8 text-center text-[15px] text-subtle italic">
                No instructor information available.
              </div>
            )}
          </div>
        )}

        {tab === "Certificate" && (
          <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 sm:flex-row sm:items-center">
            <CourseBadge type={badgeInfo.type} />
            <div>
              <h3 className="font-serif text-2xl font-light text-ink">
                <FoldText
                  text={`Earn the ${badgeInfo.title}`}
                  splitBy="char"
                  hinge="top"
                  trigger="mount"
                  duration={0.65}
                  stagger={0.03}
                  fontSize="inherit"
                  fontWeight="inherit"
                  color="currentColor"
                />
              </h3>
              <p className="mt-3 text-[15px] leading-relaxed text-subtle">
                Master the core principles and practical skills of this curriculum with real feedback from working product designers. Finish all four core modules and your final case study to unlock the exclusive <span className="font-semibold text-ink">{badgeInfo.badgeName}</span> badge on your profile alongside an official verifiable certificate of completion.
              </p>
            </div>
          </div>
        )}

        {tab === "Exam" && (
          <div
            className="flex w-full flex-col items-center gap-6 rounded-3xl border p-8 text-center sm:p-10"
            style={{
              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.14) 0%, rgba(20, 184, 166, 0.04) 100%)",
              borderColor: "rgba(16, 185, 129, 0.28)",
            }}
          >
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-white/70 dark:bg-black/20 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-ink">
              <BadgeCheck size={14} className="text-teal" /> Final assessment
            </span>
            <div>
              <h3 className="text-[1.5rem] font-bold tracking-tight text-ink">
                Take the final exam
              </h3>
              <p className="mx-auto mt-2 max-w-md text-[13px] font-medium leading-relaxed text-subtle">
                25 questions · 60 minutes · secure fullscreen session. Pass to earn your certificate.
              </p>
            </div>
            <Link
              href={`/learn/exam/${params.courseId}`}
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
/*  Enroll CTA                                                         */
/* ------------------------------------------------------------------ */

function EnrollCta({ onEnroll, isEnrolled = false, pricingModel, priceAmount, courseId, initialState = "NOT_ENROLLED" }: { onEnroll?: () => void; isEnrolled?: boolean; pricingModel?: string; priceAmount?: number; courseId?: string, initialState?: "ENROLLED" | "NOT_ENROLLED" | "PENDING" | "WAITLISTED" }) {
  return (
    <section className="arcade-cta-wash relative overflow-hidden rounded-[2rem] px-8 py-14 text-center sm:px-16 sm:py-16">
      <FlowerMark
        size={120}
        color="rgba(255,255,255,0.06)"
        className="arcade-spin pointer-events-none absolute -right-8 -top-8"
      />
      <h2 className="mx-auto max-w-2xl font-serif text-3xl font-light leading-tight text-paper text-balance sm:text-4xl">
        Light the path to your next <span className="italic text-amber">design role.</span>
      </h2>
      <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/60">
        Join 12,480 builders learning to design interfaces people actually love — with feedback from working
        designers.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {courseId && (
          <div className="min-w-[200px] sm:min-w-[240px]">
            <EnrollmentButton
              resourceType="COURSE"
              resourceId={courseId}
              initialState={initialState}
              className="!bg-white !text-ink hover:!bg-white/90"
              onStateChange={(state) => {
                if (state === "ENROLLED" && onEnroll) {
                  onEnroll();
                }
              }}
            />
          </div>
        )}
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
  const { user } = useAuthStore()
  const [tab, setTab] = useState<Tab>("Overview")
  const [course, setCourse] = useState<CourseResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportNote, setReportNote] = useState('');
  const [isReporting, setIsReporting] = useState(false);

  const handleReportSubmit = async (combinedNote: string) => {
    await api.post('/api/v1/reports', {
      contentId: params?.courseId,
      contentType: 'COURSE',
      note: combinedNote
    });
    toast.success('Course reported. Our moderation team will review it shortly.');
  };

  const titleFromQuery = searchParams.get('title')
  const courseIdParam = (params?.courseId as string) || ''

  // Server-owned enrollment state (D2), replacing the previous
  // `user.enrolledCourses.some(e => e.courseId === ...)` check against the identity payload.
  // ACCESSIBLE is the only state that counts as enrolled: a PENDING (unpaid/awaiting-approval) or
  // REVOKED enrollment must not unlock the course, which the old boolean could not express.
  const { data: myEnrollment } = useMyEnrollmentForResourceQuery(
    "COURSE",
    courseIdParam || undefined,
    Boolean(user)
  )
  const isEnrolled = myEnrollment?.enrollment?.accessState === "ACCESSIBLE"
  let initialState: "ENROLLED" | "NOT_ENROLLED" | "PENDING" | "WAITLISTED" = "NOT_ENROLLED"
  if (myEnrollment?.enrollment) {
    if (isEnrolled) {
      initialState = "ENROLLED"
    } else if (myEnrollment.enrollment.enrollmentStatus === "PENDING" || myEnrollment.enrollment.enrollmentStatus === "REQUESTED") {
      initialState = "PENDING"
    }
  }

  // EnrollmentButton already invalidates the enrollment read model on every state transition, so
  // `isEnrolled` refreshes itself. Nothing to refetch here, and no profile payload to reload.
  const handleEnrollSuccess = () => { }

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
  const moduleCount = course?.modules?.length || 0;

  return (
    <main className="min-h-screen bg-white text-ink">
      {/* Hero section with gradient background */}
      <div className="w-full arcade-wash">
        <div className="mx-auto max-w-6xl px-5 pb-16 pt-28 sm:px-8 sm:pt-32">
          <CourseHero 
            title={displayTitle} 
            authorName={authorName}
            authorUsername={authorUsername}
            authorAvatarUrl={authorAvatarUrl}
            lessonCount={moduleCount}
            duration={course?.duration}
            enrollmentCount={course?.enrollmentCount}
            onEnroll={handleEnrollSuccess}
            isEnrolled={isEnrolled}
            initialState={initialState}
            pricingModel={course?.pricingModel}
            priceAmount={course?.priceAmount}
            courseId={params?.courseId as string}
            onReportClick={() => setReportModalOpen(true)}
            channel={course?.channel}
            collaborators={course?.collaborators}
          />
        </div>
      </div>

      {/* Body below hero with pure white background */}
      <div className="w-full bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <CourseTabs courseTitle={displayTitle} course={course} />
          <div className="mt-20">
            <ReviewsBlock />
          </div>
          <div className="mt-16">
            <EnrollCta onEnroll={handleEnrollSuccess} isEnrolled={isEnrolled} pricingModel={course?.pricingModel} priceAmount={course?.priceAmount} courseId={params?.courseId as string} initialState={initialState} />
          </div>
        </div>
      </div>

      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        onSubmit={handleReportSubmit}
        title="Report Course"
        description="Help us understand what is wrong with this course."
        contentType="COURSE"
      />
    </main>
  )
}
