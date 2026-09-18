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
import {
  EnrollmentButton,
  useMyEnrollmentForResourceQuery,
  type UIEnrollmentState,
} from "@/domains/enrollment"
import { listAvailableExamsForCourse, type ExamResponse } from "@/domains/assessments"
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

  // Server-owned enrollment state (D2). This replaces the previous
  // `user.enrolledCourses.some(e => e.courseId === course.id)` check, which filtered a private
  // learning list that was smuggled onto the identity payload — the same coupling that let an
  // anonymous caller enumerate any named user's enrolled courses (SEC-1). The question "is this
  // learner enrolled" is now answered by the server, for the authenticated caller only.
  // Disabled for anonymous visitors: they are never enrolled, and the endpoint requires auth.
  const { data: myEnrollment } = useMyEnrollmentForResourceQuery(
    "COURSE",
    course?.id,
    Boolean(user)
  )

  // Published exams attached to this course that this learner is eligible to see — shown on the
  // Assessments tab below. Not fetched for anonymous visitors (the endpoint requires enrollment).
  const [availableExams, setAvailableExams] = useState<ExamResponse[]>([])
  useEffect(() => {
    if (!course?.id || !user) return
    listAvailableExamsForCourse(course.id)
      .then(setAvailableExams)
      .catch(() => {
        // Best-effort supplementary content — the page works fine without it.
      })
  }, [course?.id, user])

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
  const moduleCount = course?.modules?.length || 0
  // ACCESSIBLE is the only state that grants entry — a PENDING (unpaid / waitlisted) or REVOKED
  // enrollment is deliberately not "enrolled" for the purposes of this page's CTA.
  const isEnrolled = myEnrollment?.enrollment?.accessState === "ACCESSIBLE"
  let initialState: "ENROLLED" | "NOT_ENROLLED" | "PENDING" | "WAITLISTED" = "NOT_ENROLLED"
  if (myEnrollment?.enrollment) {
    if (isEnrolled) {
      initialState = "ENROLLED"
    } else if (myEnrollment.enrollment.enrollmentStatus === "PENDING" || myEnrollment.enrollment.enrollmentStatus === "REQUESTED") {
      initialState = "PENDING"
    }
  }

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
        { icon: Clock, label: course?.duration || "Unknown", dotColor: "var(--color-blue)" },
        { icon: BookOpen, label: `${moduleCount || 1} ${moduleCount === 1 ? 'module' : 'modules'}`, dotColor: "var(--color-amber)" },
        { icon: Users, label: `${(course?.enrollmentCount || 0).toLocaleString()} enrolled`, dotColor: "var(--color-teal)" },
      ]}
      pricingModel="PAID"
      priceAmount={course?.priceAmount || 20}
      isWishlisted={isWishlisted}
      channel={course?.channel}
      collaborators={course?.collaborators}
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
                initialState={initialState}
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
                {course?.description ? (
                  <div className="mt-4 text-[15px] leading-relaxed text-subtle whitespace-pre-wrap">
                    {course.description}
                  </div>
                ) : (
                  <p className="mt-4 text-[15px] leading-relaxed text-subtle italic opacity-75">
                    No overview information provided.
                  </p>
                )}
              </div>
              <div className="rounded-3xl border border-line bg-paper p-7">
                <h3 className="font-serif text-2xl font-light text-ink">What you&apos;ll walk away with</h3>
                <div className="mt-4">
                  {(() => {
                    const items = course?.learningOutcomes ? course.learningOutcomes.split("\n").filter((i: string) => i.trim() !== "") : [];
                    if (items.length === 0) {
                      return <p className="text-[15px] italic text-subtle opacity-75">No learning outcomes listed.</p>;
                    }
                    return (
                      <ul className="flex flex-col gap-3">
                        {items.map((h: string) => (
                          <li key={h} className="flex items-center gap-3 text-[15px] text-ink">
                            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-teal/12">
                              <Check size={13} className="text-teal" />
                            </span>
                            {h}
                          </li>
                        ))}
                      </ul>
                    );
                  })()}
                </div>
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
                {course?.modules?.map((m: any, idx: number) => {
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
                          style={{ background: m.accent || 'var(--color-ink)' }}
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
                        <ul className="flex flex-col gap-1 border-t border-line px-3 pb-3 pt-2">
                          {m.lessons?.map((lesson: any, li: number) => (
                            <li
                              key={lesson.title}
                              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-mist"
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
          )
        },
        {
          id: "Instructor",
          label: "Instructor",
          content: (
            <div className="flex flex-col gap-6 w-full">
              {(course?.collaborators || []).map((collaborator: any, index: number) => {
                const isOrg = !course?.channel?.isPersonal;
                const orgName = isOrg ? course?.channel?.name : null;
                
                return (
                  <div key={collaborator.id || index} className="mx-auto w-full max-w-3xl rounded-3xl border border-line bg-paper p-8">
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

                    <p className="mt-6 text-[15px] leading-relaxed text-subtle">
                      Instructor at {orgName || "Arcade"}.
                    </p>

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

                    <div className="mt-7 grid grid-cols-2 gap-3 border-t border-line pt-6">
                      <div className="flex flex-col">
                        <Star size={16} className="text-amber" />
                        <p className="mt-2 font-serif text-xl font-medium text-ink">{collaborator.experienceYears || 0}</p>
                        <p className="text-[12px] text-subtle">Years of Experience</p>
                      </div>
                      <div className="flex flex-col">
                        <PlayCircle size={16} className="text-blue" />
                        <p className="mt-2 font-serif text-xl font-medium text-ink">{collaborator.courseCount || 0}</p>
                        <p className="text-[12px] text-subtle">Courses Created</p>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {(!course?.collaborators || course.collaborators.length === 0) && (
                <div className="mx-auto max-w-3xl rounded-3xl border border-line bg-paper p-8 text-center text-[15px] text-subtle italic">
                  No instructor information available.
                </div>
              )}
            </div>
          )
        },
        ...(availableExams.length > 0
          ? [
              {
                id: "Assessments",
                label: "Assessments",
                content: (
                  <div className="mx-auto flex max-w-3xl flex-col gap-3">
                    {availableExams.map((exam) => (
                      <div
                        key={exam.id}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-paper p-5"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-[15px] font-semibold text-ink">{exam.title}</p>
                          <p className="mt-1 text-[13px] text-subtle">
                            {exam.purpose ?? "Assessment"} · {exam.questionCount} question
                            {exam.questionCount === 1 ? "" : "s"}
                            {exam.requiredForCompletion ? " · Required for completion" : ""}
                          </p>
                        </div>
                        <Link
                          href={`/learn/exam/${exam.id}`}
                          className="flex-shrink-0 rounded-full bg-ink px-4 py-2 text-[13px] font-semibold text-paper transition-transform hover:-translate-y-0.5"
                        >
                          View
                        </Link>
                      </div>
                    ))}
                  </div>
                ),
              },
            ]
          : []),
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
                initialState={initialState}
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
