"use client"

import {
  BadgeCheck,
  BookOpen,
  Briefcase,
  Check,
  ChevronDown,
  Clock,
  GraduationCap,
  PlayCircle,
  Radio,
  Sparkles,
  Star,
  Users,
} from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { api } from "@/infrastructure/http/api"
import type { CourseResponse } from "@/shared/types/api.types"
import { UserService } from "@/domains/identity"
import { useAuthStore } from "@/infrastructure/auth/auth.store"
import { EnrollmentButton } from "@/domains/enrollment/components/EnrollmentButton"
import { UIEnrollmentState } from "@/domains/enrollment/types/enrollment.types"
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

// --- Import Shared Learning UI ---
import {
  LearningLayout,
  LearningHero,
  LearningTabs,
  LearningReviews,
  LearningCta,
  LearningBadge,
  Avatar
} from "@/shared/design-system/ui/learning"

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

type Module = {
  title: string
  duration: string
  accent: string
  lessons: { title: string; length: string }[]
}

const COURSE_TITLE = "Design interfaces people actually love"
const CATEGORY = "UI / UX & Product Design"

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

const REVIEWS = [
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

export default function CoursePreviewPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const searchParams = useSearchParams()
  const titleFromQuery = searchParams?.get('title')
  const [course, setCourse] = useState<CourseResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const { user, updateUser } = useAuthStore()

  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportNote, setReportNote] = useState("")
  const [isReporting, setIsReporting] = useState(false)
  const [openMod, setOpenMod] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)

  const handleReportSubmit = async (combinedNote: string) => {
    await api.post("/api/v1/reports", {
      contentId: params?.id,
      contentType: "COURSE",
      note: combinedNote
    })
    toast.success("Course reported. Our moderation team will review it shortly.")
  }

  useEffect(() => {
    if (params?.id) {
      api.get<CourseResponse>(`/api/v1/public/courses/${params.id}`)
        .then(setCourse)
        .catch(console.error)
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [params?.id])

  if (loading) {
    return (
      <main className="min-h-screen bg-paper text-ink flex items-center justify-center">
        <div className="size-8 rounded-full border-2 border-ink border-t-transparent animate-spin" />
      </main>
    )
  }

  const displayTitle = titleFromQuery || course?.title || getTitleFromSlug(params?.id) || COURSE_TITLE
  const authorName = course?.authorName || INSTRUCTOR.name
  const authorUsername = course?.authorUsername || INSTRUCTOR.channel
  const authorAvatarUrl = course?.authorAvatarUrl
  const lessonCount = course?.modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0) || 0
  const isEnrolled = Boolean(
    course?.id && (user as any)?.enrolledCourses?.some((e: any) => e.courseId === course.id)
  )

  const heroContent = (
    <LearningHero
      breadcrumbs={[
        { label: "Explore", href: "/explore" },
        { label: CATEGORY, href: "/explore" }
      ]}
      category={CATEGORY}
      title={displayTitle}
      authorName={authorName}
      authorUsername={authorUsername}
      authorAvatarUrl={authorAvatarUrl}
      authorAccent={INSTRUCTOR.accent}
      metaChips={[
        { icon: Clock, label: "4h 30m", dotColor: "var(--color-blue)" },
        { icon: BookOpen, label: `${lessonCount || 19} lessons`, dotColor: "var(--color-amber)" },
        { icon: Users, label: "12,480 enrolled", dotColor: "var(--color-teal)" },
      ]}
      pricingModel="PAID"
      priceAmount={course?.priceAmount || 20}
      isWishlisted={isWishlisted}
      onWishlistToggle={() => setIsWishlisted(!isWishlisted)}
      onReportClick={() => setReportModalOpen(true)}
      accentColor="#1db876"
      actionButton={
        isEnrolled && course?.id ? (
          <Link href={`/learn/${course.id}/learn`} className="animated-button">
            <span className="text">Go to course →</span>
          </Link>
        ) : (
          course?.id ? (
            <div className="min-w-[200px] sm:min-w-[240px]">
              <EnrollmentButton
                resourceType="COURSE"
                resourceId={course.id}
                initialState="NOT_ENROLLED"
                targetUrl={`/learn/${course.id}/learn${titleFromQuery ? `?title=${encodeURIComponent(titleFromQuery)}` : ''}`}
                onGoToResource={() => {
                  const queryStr = titleFromQuery ? `?title=${encodeURIComponent(titleFromQuery)}` : ''
                  router.push(`/learn/${course.id}/learn${queryStr}`)
                }}
                onStateChange={(state) => {
                  if (state === "ENROLLED") {
                    const queryStr = titleFromQuery ? `?title=${encodeURIComponent(titleFromQuery)}` : ''
                    router.push(`/learn/${course.id}/learn${queryStr}`)
                  }
                }}
              />
            </div>
          ) : null
        )
      }
    />
  )

  const tabsContent = (
    <LearningTabs
      tabs={[
        {
          id: "Overview",
          label: "Overview",
          content: (
            <div className="grid gap-8 md:grid-cols-2">
              <div className="rounded-3xl border border-line bg-paper p-7">
                <h3 className="font-serif text-2xl font-light text-ink">About this course</h3>
                <p className="mt-4 text-[15px] leading-relaxed text-subtle">
                  This course treats design as a craft you build in public — every module ends with a real
                  assignment, reviewed by a working product designer. You&apos;ll leave with a portfolio piece, not
                  just a certificate.
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
          )
        },
        {
          id: "Syllabus",
          label: "Syllabus",
          content: (
            <div className="mx-auto max-w-3xl">
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
          )
        },
        {
          id: "Instructor",
          label: "Instructor",
          content: (
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
          )
        },
        {
          id: "Certificate",
          label: "Certificate",
          content: (
            <div className="mx-auto flex max-w-3xl flex-col items-center gap-10 rounded-3xl border border-line bg-paper p-8 sm:flex-row sm:items-center">
              <LearningBadge label="UI / UX" accent="var(--color-blue)" />
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
          )
        }
      ]}
    />
  )

  const reviewsContent = <LearningReviews reviews={REVIEWS} />

  const ctaContent = (
    <LearningCta
      title={<>Light the path to your next <span className="italic text-amber">design role.</span></>}
      description="Join 12,480 builders learning to design interfaces people actually love — with feedback from working designers."
      primaryAction={
        isEnrolled && course?.id ? (
          <Link
            href={`/learn/${course.id}/learn`}
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-ink transition-colors hover:bg-white/90"
          >
            Go to course →
          </Link>
        ) : (
          course?.id ? (
            <div className="min-w-[200px] sm:min-w-[240px]">
              <EnrollmentButton
                resourceType="COURSE"
                resourceId={course.id}
                initialState="NOT_ENROLLED"
                className="!bg-white !text-ink hover:!bg-white/90"
                targetUrl={`/learn/${course.id}/learn${titleFromQuery ? `?title=${encodeURIComponent(titleFromQuery)}` : ''}`}
                onGoToResource={() => {
                  const queryStr = titleFromQuery ? `?title=${encodeURIComponent(titleFromQuery)}` : ''
                  router.push(`/learn/${course.id}/learn${queryStr}`)
                }}
                onStateChange={(state) => {
                  if (state === "ENROLLED") {
                    const queryStr = titleFromQuery ? `?title=${encodeURIComponent(titleFromQuery)}` : ''
                    router.push(`/learn/${course.id}/learn${queryStr}`)
                  }
                }}
              />
            </div>
          ) : null
        )
      }
    />
  )

  const modals = (
    <ReportModal
      isOpen={reportModalOpen}
      onClose={() => setReportModalOpen(false)}
      onSubmit={handleReportSubmit}
      title="Report Course"
      description="Help us understand what is wrong with this course."
      contentType="COURSE"
    />
  )

  return (
    <LearningLayout
      hero={heroContent}
      tabs={tabsContent}
      reviews={reviewsContent}
      cta={ctaContent}
      modals={modals}
    />
  )
}
