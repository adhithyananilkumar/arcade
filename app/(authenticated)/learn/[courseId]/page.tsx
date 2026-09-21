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
import type { CourseChannelSummary, CourseCollaboratorSummary, CourseResponse, CourseReviewStats } from "@/shared/types/api.types"
import { courseReviewService, type CourseReview } from "@/domains/learning"
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


const COURSE_TITLE = "Design interfaces people actually love"

const TABS = ["Overview", "Syllabus", "Instructor", "Certificate", "Exam"] as const
type Tab = (typeof TABS)[number]

const NAV_LINKS = ["Explore", "Forums", "For Colleges", "Docs"]

/** Accent from the original hero design — the only non-fabricated part of the old persona. */
const INSTRUCTOR_ACCENT = "var(--color-purple)"

/** Per-module accents, cycled. Modules carry no colour of their own in the domain. */
const MODULE_ACCENTS = [
  "var(--color-blue)",
  "var(--color-purple)",
  "var(--color-amber)",
  "var(--color-teal)",
]

/** `AUTHOR`/`CO_AUTHOR` -> "Author"/"Co author" for display. */
function formatCollaboratorRole(role?: string): string {
  if (!role) return "Instructor"
  const cleaned = role.replace(/_/g, " ").toLowerCase()
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}


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

/** Card accents for the reviews grid, cycled. Design, not data. */
const REVIEW_ACCENTS = [
  "var(--color-blue)",
  "var(--color-amber)",
  "var(--color-purple)",
  "var(--color-teal)",
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
  duration,
  enrollmentCount,
  onEnroll,
  isEnrolled = false,
  initialState = "NOT_ENROLLED",
  pendingReason,
  pricingModel,
  priceAmount,
  courseId,
  onReportClick,
  channel,
  collaborators,
  authorId
}: {
  title: string
  authorName?: string
  authorUsername?: string
  authorAvatarUrl?: string | null
  lessonCount?: number
  /** Author-declared total length; absent until they set one. */
  duration?: string | null
  enrollmentCount?: number
  onEnroll?: () => void
  isEnrolled?: boolean
  initialState?: "ENROLLED" | "NOT_ENROLLED" | "PENDING" | "WAITLISTED"
  pendingReason?: "PAYMENT" | "REQUIREMENTS"
  pricingModel?: string
  priceAmount?: number
  courseId?: string
  onReportClick?: () => void
  channel?: CourseChannelSummary | null
  collaborators?: CourseCollaboratorSummary[] | null
  authorId?: string | null
}) {
  const [saved, setSaved] = useState(false)

  const words = title.split(' ')
  const lastWord = words.pop() || ''
  const firstPart = words.join(' ')
  
  const displayAuthor = authorName || "Unknown author";
  const displayUsername = authorUsername || displayAuthor.toLowerCase().replace(/\s+/g, '');
  const authorInitials = displayAuthor.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  const isOrgChannel = Boolean(channel && !channel.isPersonal && channel.name);
  // Filter by author id so an author without a profile username is not listed as their own
  // collaborator; the backend's "Author" role is the fallback when no id is passed.
  const coAuthors = (collaborators ?? []).filter(
    (c) => (authorId ? c.id !== authorId : c.role !== "Author")
  );

  const metaData = [
    { icon: Clock, label: duration || "Self-paced", dot: "var(--color-blue)" },
    { icon: BookOpen, label: `${lessonCount} lesson${lessonCount !== 1 ? 's' : ''}`, dot: "var(--color-amber)" },
    { icon: Users, label: `${(enrollmentCount ?? 0).toLocaleString()} enrolled`, dot: "var(--color-teal)" },
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

          {/* Instructor: an organization channel publishes on the author's behalf, so it is
              credited first; a personal channel is just the author. */}
          <div className="mt-5 flex items-center gap-2.5">
            <Avatar
              name={isOrgChannel ? channel!.name : displayAuthor}
              imageUrl={isOrgChannel ? channel!.iconUrl : authorAvatarUrl}
              accent={INSTRUCTOR_ACCENT}
              size={34}
            />
            <div>
              <p className="text-sm font-semibold text-ink">
                {isOrgChannel ? channel!.name : displayAuthor}
              </p>
              <p className="flex items-center gap-1 text-[11.5px] font-medium text-subtle">
                <Radio size={12} className="text-blue" />{" "}
                {isOrgChannel ? `by @${displayUsername}` : `@${displayUsername}`}
              </p>
            </div>
          </div>

          {/* Collaborators, excluding the author — a solo course shows nothing here. */}
          {coAuthors.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-subtle">Collaborators:</span>
              {coAuthors.map((collab) => (
                <span
                  key={collab.id}
                  className="flex items-center gap-1.5 rounded-full border border-line bg-paper px-2 py-0.5"
                >
                  <Avatar name={collab.name} imageUrl={collab.avatarUrl} size={18} />
                  <span className="text-xs text-ink">{collab.name}</span>
                </span>
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
                  pendingReason={pendingReason}
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

function CourseTabs({ courseTitle, course }: { courseTitle?: string; course?: CourseResponse | null }) {
  const [tab, setTab] = useState<Tab>("Overview")
  const [openMod, setOpenMod] = useState(0)
  const modules = course?.modules ?? []
  const lessonTotal = modules.reduce((sum, m) => sum + (m.lessons?.length ?? 0), 0)
  const learningOutcomes = (course?.learningOutcomes ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  const orgName = course?.channel && !course.channel.isPersonal ? course.channel.name : null
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
                <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-subtle">
                  {course.description}
                </p>
              ) : (
                <p className="mt-4 text-[15px] italic leading-relaxed text-subtle/75">
                  The author hasn&apos;t written an overview for this course yet.
                </p>
              )}
            </AnimatedItem>
            <div className="md:pl-16 lg:pl-28">
              <h3 className="font-serif text-2xl font-light text-ink">What you&apos;ll walk away with</h3>
              <div className="mt-4">
                {learningOutcomes.length > 0 ? (
                  <AnimatedList
                    items={learningOutcomes}
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
                ) : (
                  <p className="text-[15px] italic text-subtle/75">
                    The author hasn&apos;t listed learning outcomes for this course yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === "Syllabus" && (
          <div className="w-full">
            {/* Structured summary of the course layout */}
            <div className="mb-6 flex flex-wrap items-center justify-center gap-2.5">
              {[
                { icon: BookOpen, label: `${modules.length} ${modules.length === 1 ? "module" : "modules"}`, c: "var(--color-blue)" },
                { icon: PlayCircle, label: `${lessonTotal} ${lessonTotal === 1 ? "lesson" : "lessons"}`, c: "var(--color-amber)" },
                ...(course?.duration ? [{ icon: Clock, label: `${course.duration} total`, c: "var(--color-teal)" }] : []),
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
              {modules.map((m, idx) => {
                const open = openMod === idx
                const bgGradient = MODULE_LIGHT_GRADIENTS[idx % MODULE_LIGHT_GRADIENTS.length]
                const borderColor = MODULE_BORDER_COLORS[idx % MODULE_BORDER_COLORS.length]
                const accent = MODULE_ACCENTS[idx % MODULE_ACCENTS.length]
                const moduleLessons = m.lessons ?? []
                return (
                  <div
                    key={m.id}
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
                        style={{ color: accent, borderColor: borderColor }}
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
                        {moduleLessons.length} {moduleLessons.length === 1 ? "lesson" : "lessons"}
                      </span>
                      <ChevronDown
                        size={17}
                        className="text-subtle transition-transform"
                        style={{ transform: open ? "rotate(180deg)" : "none" }}
                      />
                    </button>
                    {open && moduleLessons.length > 0 && (
                      <ul
                        className="flex flex-col gap-1 border-t px-3 pb-3 pt-2"
                        style={{ borderColor: borderColor }}
                      >
                        {moduleLessons.map((lesson, li) => (
                          <li
                            key={lesson.id}
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/60 dark:hover:bg-black/20"
                          >
                            <span className="w-5 text-center text-[12px] font-medium text-subtle/70">{li + 1}</span>
                            <PlayCircle size={16} style={{ color: accent }} className="shrink-0" />
                            <span className="flex-1 text-[14px] text-ink">{lesson.title}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })}
              {modules.length === 0 && (
                <p className="rounded-2xl border border-line bg-paper px-5 py-8 text-center text-[15px] italic text-subtle/75">
                  This course hasn&apos;t published a syllabus yet.
                </p>
              )}
            </div>
          </div>
        )}

        {tab === "Instructor" && (
          <div className="flex w-full flex-col gap-8">
            {(course?.collaborators ?? []).map((person) => (
              <div
                key={person.id}
                className="w-full rounded-3xl border p-8 transition-all"
                style={{
                  background: "linear-gradient(135deg, rgba(139, 92, 246, 0.14) 0%, rgba(99, 102, 241, 0.04) 100%)",
                  borderColor: "rgba(139, 92, 246, 0.28)",
                }}
              >
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  <Avatar
                    name={person.name || "Unknown"}
                    imageUrl={person.avatarUrl}
                    accent={INSTRUCTOR_ACCENT}
                    size={72}
                  />
                  <div className="flex-1">
                    {orgName && (
                      <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-purple/10 px-2.5 py-1 text-[12px] font-medium text-purple">
                        <BadgeCheck size={13} /> {orgName}
                      </div>
                    )}
                    <h3 className="font-serif text-2xl font-light text-ink">{person.name || "Unknown"}</h3>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] text-subtle">
                      <span className="inline-flex items-center gap-1.5">
                        <Briefcase size={13} /> {formatCollaboratorRole(person.role)}
                      </span>
                      {person.username && (
                        <>
                          <span className="text-subtle/40">·</span>
                          <span className="inline-flex items-center gap-1.5">
                            <Radio size={13} className="text-blue" /> @{person.username}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {person.bio ? (
                  <p className="mt-6 whitespace-pre-wrap text-[15px] leading-relaxed text-subtle">{person.bio}</p>
                ) : (
                  <p className="mt-6 text-[15px] italic leading-relaxed text-subtle/75">
                    {person.name} hasn&apos;t added a bio yet.
                  </p>
                )}

                {(person.specialities?.length ?? 0) > 0 && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {person.specialities!.map((e, idx) => {
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
                )}

                <div
                  className="mt-7 grid grid-cols-2 gap-6 border-t pt-6 text-center"
                  style={{ borderColor: "rgba(139, 92, 246, 0.28)" }}
                >
                  <div className="flex flex-col items-center justify-center">
                    <BookOpen size={18} style={{ color: "var(--color-blue)" }} />
                    <p className="mt-2 font-serif text-xl font-medium text-ink">{person.courseCount ?? 0}</p>
                    <p className="text-[12px] text-subtle">
                      {person.courseCount === 1 ? "course" : "courses"}
                    </p>
                  </div>
                  <div className="flex flex-col items-center justify-center">
                    <GraduationCap size={18} style={{ color: "var(--color-purple)" }} />
                    <p className="mt-2 font-serif text-xl font-medium text-ink">
                      {person.experienceYears != null ? `${person.experienceYears} yrs` : "—"}
                    </p>
                    <p className="text-[12px] text-subtle">experience</p>
                  </div>
                </div>
              </div>
            ))}

            {(course?.collaborators?.length ?? 0) === 0 && (
              <div className="w-full rounded-3xl border border-line bg-paper p-8 text-center text-[15px] italic text-subtle/75">
                No instructor information available for this course.
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

/**
 * Real learner reviews for this course, with the aggregate the heading shows.
 *
 * Reads the public endpoint rather than the author-facing one: this renders for learners, who
 * have no course-read authority in Studio.
 */
function ReviewsBlock({ courseId }: { courseId?: string }) {
  const [reviews, setReviews] = useState<CourseReview[] | null>(null)
  const [stats, setStats] = useState<CourseReviewStats | null>(null)

  useEffect(() => {
    if (!courseId) return
    let cancelled = false
    courseReviewService
      .listPublicForCourse(courseId)
      .then((rows) => {
        if (!cancelled) setReviews(rows)
      })
      .catch(() => {
        if (!cancelled) setReviews([])
      })
    courseReviewService
      .statsFor([courseId])
      .then((byCourse) => {
        if (!cancelled) setStats(byCourse[courseId] ?? null)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [courseId])

  // Nothing to show while loading, and nothing to show for a course no one has rated — an
  // empty reviews section is better than a heading over nothing.
  if (reviews === null) return null

  if (reviews.length === 0) {
    return (
      <section aria-labelledby="reviews-heading">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wide text-subtle">
            <Star size={13} className="text-amber" fill="var(--color-amber)" strokeWidth={0} /> Reviews
          </span>
          <h2 id="reviews-heading" className="font-serif text-3xl font-light text-ink text-balance sm:text-4xl">
            No reviews yet
          </h2>
          <p className="text-[15px] text-subtle">
            Learners are asked to rate this course when they finish it.
          </p>
        </div>
      </section>
    )
  }

  const average = stats?.averageRating ?? 0
  const totalRatings = stats?.reviewsCount ?? reviews.length

  return (
    <section aria-labelledby="reviews-heading">
      <div className="mb-8 flex flex-col items-center gap-3 text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wide text-subtle">
          <Star size={13} className="text-amber" fill="var(--color-amber)" strokeWidth={0} /> Reviews
        </span>
        <h2 id="reviews-heading" className="font-serif text-3xl font-light text-ink text-balance sm:text-4xl">
          What learners say
        </h2>
        <div className="flex items-center gap-3">
          <span className="font-serif text-3xl font-light text-ink">{average.toFixed(1)}</span>
          <div className="text-left">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  size={14}
                  className={i <= Math.round(average) ? "text-amber" : "text-subtle/30"}
                  fill={i <= Math.round(average) ? "var(--color-amber)" : "none"}
                  strokeWidth={i <= Math.round(average) ? 0 : 1.5}
                />
              ))}
            </div>
            <p className="mt-0.5 text-xs text-subtle">
              {totalRatings.toLocaleString()} {totalRatings === 1 ? "rating" : "ratings"}
            </p>
          </div>
        </div>
      </div>

      <div className="[column-gap:1rem] sm:columns-2 lg:columns-3">
        {reviews.map((r, i) => {
          const dark = i === 0
          const accent = REVIEW_ACCENTS[i % REVIEW_ACCENTS.length]
          return (
            <div
              key={r.id}
              className={`mb-4 break-inside-avoid rounded-2xl p-6 ${dark ? "bg-ink" : "border border-line bg-paper"}`}
            >
              {r.reviewText ? (
                <p className={`text-[15px] leading-relaxed ${dark ? "font-medium text-paper" : "text-ink"}`}>
                  &ldquo;{r.reviewText}&rdquo;
                </p>
              ) : (
                <p className={`text-[15px] italic leading-relaxed ${dark ? "text-paper/70" : "text-subtle/75"}`}>
                  Rated this course {r.rating} out of 5.
                </p>
              )}
              <div
                className={`mt-5 flex items-center justify-between border-t pt-4 ${dark ? "border-white/10" : "border-line"}`}
              >
                <div>
                  <p className={`text-[13px] font-semibold ${dark ? "text-paper" : "text-ink"}`}>{r.userName}</p>
                  <p className={`flex items-center gap-0.5 text-[11px] ${dark ? "text-white/50" : "text-subtle"}`}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={11}
                        className={star <= r.rating ? "text-amber" : dark ? "text-white/25" : "text-subtle/30"}
                        fill={star <= r.rating ? "var(--color-amber)" : "none"}
                        strokeWidth={star <= r.rating ? 0 : 1.5}
                      />
                    ))}
                  </p>
                </div>
                <Avatar name={r.userName} imageUrl={r.userAvatarUrl} accent={accent} size={32} onDark={dark} />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Enroll CTA                                                         */
/* ------------------------------------------------------------------ */

function EnrollCta({ onEnroll, initialState = "NOT_ENROLLED", pendingReason, pricingModel, priceAmount, courseId }: { onEnroll?: () => void; initialState?: "ENROLLED" | "NOT_ENROLLED" | "PENDING" | "WAITLISTED"; pendingReason?: "PAYMENT" | "REQUIREMENTS"; pricingModel?: string; priceAmount?: number; courseId?: string }) {
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
        Learn at your own pace, with feedback from the people who built the course.
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
  const lessonCount = course?.modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0) || 0;

  // Survives a reload: a learner mid-checkout must not be offered "Enroll Now" a second time.
  const enrollmentStatus = myEnrollment?.enrollment?.enrollmentStatus;
  const enrollButtonState: "ENROLLED" | "NOT_ENROLLED" | "PENDING" | "WAITLISTED" = isEnrolled
    ? "ENROLLED"
    : enrollmentStatus === "PENDING" || enrollmentStatus === "REQUESTED"
      ? "PENDING"
      : "NOT_ENROLLED";
  const pendingReason = myEnrollment?.enrollment?.requiresPayment ? "PAYMENT" : "REQUIREMENTS";

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
            lessonCount={lessonCount}
            duration={course?.duration}
            enrollmentCount={course?.enrollmentCount}
            onEnroll={handleEnrollSuccess}
            isEnrolled={isEnrolled}
            initialState={enrollButtonState}
            pendingReason={pendingReason}
            channel={course?.channel}
            collaborators={course?.collaborators}
            authorId={course?.authorId}
            pricingModel={course?.pricingModel}
            priceAmount={course?.priceAmount}
            courseId={params?.courseId as string}
            onReportClick={() => setReportModalOpen(true)}
          />
        </div>
      </div>

      {/* Body below hero with pure white background */}
      <div className="w-full bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
          <CourseTabs courseTitle={displayTitle} course={course} />
          <div className="mt-20">
            <ReviewsBlock courseId={params?.courseId as string} />
          </div>
          <div className="mt-16">
            <EnrollCta onEnroll={handleEnrollSuccess} initialState={enrollButtonState} pendingReason={pendingReason} pricingModel={course?.pricingModel} priceAmount={course?.priceAmount} courseId={params?.courseId as string} />
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
