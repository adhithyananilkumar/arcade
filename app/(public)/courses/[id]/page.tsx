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
import type { CourseResponse, CourseReviewStats } from "@/shared/types/api.types"
import { courseReviewService, type CourseReview } from "@/domains/learning"
import { UserService } from "@/domains/identity"
import { useAuthStore } from "@/infrastructure/auth/auth.store"
import { usePublicCategories } from "@/shared/hooks/usePublicCategories"
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

const COURSE_TITLE = "Design interfaces people actually love"
/** Shown when a course has no category set, or its category no longer resolves. */
const FALLBACK_CATEGORY = "Course"

/** The hero/instructor accent from the original design — the only part of the old hardcoded
 * "Maya Okafor" persona that was ever design rather than fake data. */
const INSTRUCTOR_ACCENT = "var(--color-purple)"

/** Per-module colours, cycled. Modules have no colour of their own in the domain. */
const MODULE_ACCENTS = [
  "var(--color-blue)",
  "var(--color-purple)",
  "var(--color-amber)",
  "var(--color-teal)",
]

/** `AUTHOR`/`CO_AUTHOR` → "Author"/"Co author" for display. */
function formatCollaboratorRole(role?: string): string {
  if (!role) return "Instructor"
  const cleaned = role.replace(/_/g, " ").toLowerCase()
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
}

/** Card accents for the reviews grid, cycled. Design, not data. */
const REVIEW_ACCENTS = [
  "var(--color-blue)",
  "var(--color-amber)",
  "var(--color-purple)",
  "var(--color-teal)",
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
  const publicCategories = usePublicCategories("COURSES")

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

  // Real learner reviews, plus the aggregate the heading shows. Both are public, because
  // someone deciding whether to enrol reads them before they have an account.
  const [courseReviews, setCourseReviews] = useState<CourseReview[]>([])
  const [reviewStats, setReviewStats] = useState<CourseReviewStats | null>(null)
  useEffect(() => {
    const id = params?.id
    if (!id) return
    let cancelled = false
    courseReviewService
      .listPublicForCourse(id)
      .then((rows) => {
        if (!cancelled) setCourseReviews(rows)
      })
      .catch(() => {
        // The page reads fine without reviews.
      })
    courseReviewService
      .statsFor([id])
      .then((stats) => {
        if (!cancelled) setReviewStats(stats[id] ?? null)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [params?.id])

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
  const authorName = course?.authorName || "Unknown author"
  const authorUsername = course?.authorUsername || undefined
  const authorAvatarUrl = course?.authorAvatarUrl
  const modules = course?.modules ?? []
  const moduleCount = modules.length
  const lessonCount = modules.reduce((sum, module) => sum + (module.lessons?.length || 0), 0)
  const learningOutcomes = (course?.learningOutcomes ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  // ACCESSIBLE is the only state that grants entry — a PENDING (unpaid / waitlisted) or REVOKED
  // enrollment is deliberately not "enrolled" for the purposes of this page's CTA.
  const isEnrolled = myEnrollment?.enrollment?.accessState === "ACCESSIBLE"

  // The CTA has to survive a reload: a learner who has paid but whose grant is still settling
  // must not be shown "Enroll Now" again. The server's own enrollment record is the authority.
  const enrollmentStatus = myEnrollment?.enrollment?.enrollmentStatus
  // The course's real category, resolved against the super-user-managed taxonomy. A course
  // with no category set (or a stale id) falls back to a neutral label rather than borrowing
  // whatever category the page was originally designed around.
  const categoryName =
    publicCategories.find((c) => c.id === course?.categoryId)?.name ?? FALLBACK_CATEGORY

  // Only an organization channel gets the org badge — a personal channel is the person.
  const orgName = course?.channel && !course.channel.isPersonal ? course.channel.name : null

  const enrollButtonState: "ENROLLED" | "NOT_ENROLLED" | "PENDING" | "WAITLISTED" = isEnrolled
    ? "ENROLLED"
    : enrollmentStatus === "PENDING" || enrollmentStatus === "REQUESTED"
      ? "PENDING"
      : "NOT_ENROLLED"
  // Distinguishes "your payment is settling" from "someone must approve you" on the CTA.
  const pendingReason = myEnrollment?.enrollment?.requiresPayment ? "PAYMENT" : "REQUIREMENTS"

  const heroContent = (
    <LearningHero
      breadcrumbs={[
        { label: "Explore", href: "/explore" },
        { label: categoryName, href: "/explore" }
      ]}
      category={categoryName}
      title={displayTitle}
      authorName={authorName}
      authorUsername={authorUsername}
      authorAvatarUrl={authorAvatarUrl}
      authorAccent={INSTRUCTOR_ACCENT}
      metaChips={[
        { icon: Clock, label: course?.duration || "Self-paced", dotColor: "var(--color-blue)" },
        {
          icon: BookOpen,
          label: `${lessonCount} ${lessonCount === 1 ? "lesson" : "lessons"}`,
          dotColor: "var(--color-amber)",
        },
        {
          icon: Users,
          label: `${(course?.enrollmentCount ?? 0).toLocaleString()} enrolled`,
          dotColor: "var(--color-teal)",
        },
      ]}
      pricingModel={course?.pricingModel ?? "FREE"}
      priceAmount={course?.priceAmount ?? 0}
      authorId={course?.authorId}
      channel={course?.channel}
      collaborators={course?.collaborators}
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
                initialState={enrollButtonState}
                pendingReason={pendingReason}
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
                  <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-subtle">
                    {course.description}
                  </p>
                ) : (
                  <p className="mt-4 text-[15px] italic leading-relaxed text-subtle/75">
                    The author hasn&apos;t written an overview for this course yet.
                  </p>
                )}
              </div>
              <div className="rounded-3xl border border-line bg-paper p-7">
                <h3 className="font-serif text-2xl font-light text-ink">What you&apos;ll walk away with</h3>
                {learningOutcomes.length > 0 ? (
                  <ul className="mt-4 flex flex-col gap-3">
                    {learningOutcomes.map((h) => (
                      <li key={h} className="flex items-center gap-3 text-[15px] text-ink">
                        <span className="grid size-5 shrink-0 place-items-center rounded-full bg-teal/12">
                          <Check size={13} className="text-teal" />
                        </span>
                        {h}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-[15px] italic text-subtle/75">
                    The author hasn&apos;t listed learning outcomes for this course yet.
                  </p>
                )}
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
                  { icon: BookOpen, label: `${moduleCount} ${moduleCount === 1 ? "module" : "modules"}`, c: "var(--color-blue)" },
                  { icon: PlayCircle, label: `${lessonCount} ${lessonCount === 1 ? "lesson" : "lessons"}`, c: "var(--color-amber)" },
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
                  // Modules carry no colour of their own; cycle the palette so the list keeps
                  // the visual rhythm the design had without inventing per-module data.
                  const accent = MODULE_ACCENTS[idx % MODULE_ACCENTS.length]
                  const moduleLessons = m.lessons ?? []
                  return (
                    <div
                      key={m.id}
                      className="overflow-hidden rounded-2xl border border-line bg-paper transition-colors hover:border-ink/15"
                    >
                      <button
                        onClick={() => setOpenMod(open ? -1 : idx)}
                        aria-expanded={open}
                        className="flex w-full items-center gap-4 px-5 py-4 text-left"
                      >
                        <span
                          className="grid size-10 shrink-0 place-items-center rounded-xl font-serif text-base font-medium text-paper"
                          style={{ background: accent }}
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
                        <ul className="flex flex-col gap-1 border-t border-line px-3 pb-3 pt-2">
                          {moduleLessons.map((lesson, li) => (
                            <li
                              key={lesson.id}
                              className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-mist"
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
          )
        },
        {
          id: "Instructor",
          label: "Instructor",
          content: (
            <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
              {(course?.collaborators ?? []).map((person) => (
                <div key={person.id} className="rounded-3xl border border-line bg-paper p-8">
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
                            <Link
                              href={`/${person.username}`}
                              className="inline-flex items-center gap-1.5 hover:underline"
                            >
                              <Radio size={13} className="text-blue" /> @{person.username}
                            </Link>
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {person.bio ? (
                    <p className="mt-6 whitespace-pre-wrap text-[15px] leading-relaxed text-subtle">{person.bio}</p>
                  ) : (
                    <p className="mt-6 text-[15px] italic leading-relaxed text-subtle/75">
                      {`${person.name || "This instructor"} hasn't added a bio yet.`}
                    </p>
                  )}

                  {(person.specialities?.length ?? 0) > 0 && (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {person.specialities!.map((e) => (
                        <span
                          key={e}
                          className="rounded-full border border-line bg-mist px-3 py-1.5 text-[12px] font-medium text-ink"
                        >
                          {e}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-7 grid grid-cols-2 gap-3 border-t border-line pt-6">
                    <div>
                      <BookOpen size={16} style={{ color: "var(--color-blue)" }} />
                      <p className="mt-2 font-serif text-xl font-medium text-ink">{person.courseCount ?? 0}</p>
                      <p className="text-[12px] text-subtle">
                        {person.courseCount === 1 ? "course" : "courses"}
                      </p>
                    </div>
                    <div>
                      <GraduationCap size={16} style={{ color: "var(--color-purple)" }} />
                      <p className="mt-2 font-serif text-xl font-medium text-ink">
                        {person.experienceYears != null ? `${person.experienceYears} yrs` : "—"}
                      </p>
                      <p className="text-[12px] text-subtle">experience</p>
                    </div>
                  </div>
                </div>
              ))}

              {(course?.collaborators?.length ?? 0) === 0 && (
                <div className="rounded-3xl border border-line bg-paper p-8 text-center text-[15px] italic text-subtle/75">
                  No instructor information available for this course.
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
                  This badge is unique to <span className="font-medium text-ink">{displayTitle}</span> — no other
                  course carries it. Finish the course to unlock it on your profile, along with a verified
                  certificate of completion to share.
                </p>
              </div>
            </div>
          )
        }
      ]}
    />
  )

  // The palette is design; the names, words and numbers are the learners' own.
  const reviewsContent =
    courseReviews.length > 0 ? (
      <LearningReviews
        headingText={
          <>
            What learners say about{" "}
            <span className="italic text-blue">{displayTitle}</span>
          </>
        }
        averageRating={reviewStats?.averageRating ?? 0}
        totalRatings={reviewStats?.reviewsCount ?? courseReviews.length}
        reviews={courseReviews.map((r, i) => ({
          name: r.userName,
          role: `${r.rating} out of 5`,
          quote: r.reviewText ?? "",
          dark: i === 0,
          accent: REVIEW_ACCENTS[i % REVIEW_ACCENTS.length],
          avatarUrl: r.userAvatarUrl,
        }))}
      />
    ) : (
      <div className="rounded-3xl border border-line bg-paper p-8 text-center text-[15px] italic text-subtle/75">
        No reviews yet — be the first to rate this course when you finish it.
      </div>
    )

  const ctaContent = (
    <LearningCta
      title={<>Light the path to your next <span className="italic text-amber">step.</span></>}
      description="Learn at your own pace, with feedback from the people who built the course."
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
                initialState={enrollButtonState}
                pendingReason={pendingReason}
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
