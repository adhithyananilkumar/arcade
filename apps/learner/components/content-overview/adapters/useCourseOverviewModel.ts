'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, BookOpen, Clock, GraduationCap, Layers, RefreshCw } from 'lucide-react';
import { api, ApiError } from '@/infrastructure/http/api';
import { courseProgressService, type CourseProgress } from '@/domains/learning';
import { useMyEnrollmentForResourceQuery } from '@/domains/enrollment';
import type {
  AssessmentNodeResponse,
  CourseResponse,
  ModuleResponse,
} from '@/shared/types/api.types';
import { courseRoutes } from '@/shared/routes/content.routes';
import type {
  ContentOverviewModel,
  OverviewFact,
  OverviewItem,
  OverviewSection,
} from '../contentOverview.types';

/**
 * Builds the overview model for a course.
 *
 * <p>Reads only what already exists: the published course from the public read model, lesson
 * progress from the learning domain, and entitlement from the enrollment read model. Nothing here
 * decides access — {@link useMyEnrollmentForResourceQuery} reports the server's answer, and the
 * backend refuses the content regardless of what this renders.
 */
export function useCourseOverviewModel(courseId: string): ContentOverviewModel {
  const courseQuery = useQuery({
    queryKey: ['courses', 'public', courseId],
    queryFn: () => api.get<CourseResponse>(`/api/v1/public/courses/${courseId}`),
    enabled: Boolean(courseId),
  });

  const progressQuery = useQuery({
    queryKey: ['learning', 'progress', 'course', courseId],
    queryFn: () => courseProgressService.getCourseProgress(courseId),
    enabled: Boolean(courseId),
    // A learner without an entitlement gets a 403 here; that is the enrollment query's answer to
    // report, not an error worth retrying.
    retry: false,
  });

  const enrollmentQuery = useMyEnrollmentForResourceQuery('COURSE', courseId);

  const course = courseQuery.data;
  const progress: CourseProgress | undefined = progressQuery.data;

  const sections = useMemo(
    () => (course ? buildSections(course, progress?.completedLessonIds ?? []) : []),
    [course, progress],
  );

  const flatItems = useMemo(() => sections.flatMap((s) => s.items), [sections]);

  const resume = useMemo(() => {
    // The next unfinished, openable item — not simply the first, and not the last one visited,
    // which is what a learner who skipped ahead would be dropped back into.
    const next = flatItems.find((item) => !item.completed && !item.locked && item.href);
    const fallback = flatItems.find((item) => item.href && !item.locked);

    if (next) {
      return {
        label: flatItems.some((item) => item.completed) ? 'Resume' : 'Start learning',
        itemTitle: next.title,
        href: next.href!,
      };
    }
    if (fallback) {
      return { label: 'Review', itemTitle: fallback.title, href: fallback.href! };
    }
    return null;
  }, [flatItems]);

  const isLoading =
    courseQuery.isLoading || progressQuery.isLoading || enrollmentQuery.isLoading;

  return {
    contentType: 'COURSE',
    contentId: courseId,
    noteContentType: 'courses',

    title: course?.title ?? '',
    subtitle: null,
    description: course?.description ?? null,
    coverImageUrl: course?.coverImageUrl ?? null,
    outcomes: splitOutcomes(course?.learningOutcomes),

    channel: course?.channel
      ? { name: course.channel.name, avatarUrl: course.channel.iconUrl, href: `/channels/${course.channel.id}` }
      : null,

    people: (course?.collaborators ?? []).map((person) => ({
      name: person.name,
      avatarUrl: person.avatarUrl,
      headline: person.role,
      bio: person.bio,
      href: person.username ? `/${person.username}` : null,
    })),

    facts: buildFacts(course, progress),

    progress: {
      percent: progress?.percent ?? null,
      completedItems: progress?.completedLessons ?? 0,
      totalItems: progress?.totalLessons ?? flatItems.length,
      state:
        progress?.enrollmentStatus === 'COMPLETED'
          ? 'COMPLETED'
          : (progress?.completedLessons ?? 0) > 0
            ? 'IN_PROGRESS'
            : 'NOT_STARTED',
    },

    resume,
    sections,

    overviewHref: courseRoutes.overview(courseId),
    notesHref: courseRoutes.notes(courseId),
    landingHref: courseRoutes.landing(courseId),

    isLoading,
    error: describeLoadFailure(courseQuery.error),
    // Absent data is not a denial — while the query is still settling the hub shows its skeleton,
    // so defaulting to entitled here avoids flashing "you're not enrolled" at someone who is.
    isEntitled: enrollmentQuery.data ? enrollmentQuery.data.enrolled : true,
  };
}

/**
 * Lessons and assessments share one `position` space, so a module's real running order is the two
 * merged and sorted — the same rule the player applies. Ties break on kind then id to keep the
 * order total and stable rather than dependent on array arrival order.
 */
function buildSections(course: CourseResponse, completedLessonIds: string[]): OverviewSection[] {
  const completed = new Set(completedLessonIds);
  let order = 0;

  const sections: OverviewSection[] = (course.modules ?? [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((mod: ModuleResponse) => {
      const lessons: OverviewItem[] = (mod.lessons ?? []).map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        kind: 'LESSON' as const,
        completed: completed.has(lesson.id),
        href: courseRoutes.lesson(course.id, lesson.id),
        order: lesson.position,
      }));

      const assessments: OverviewItem[] = (mod.assessments ?? []).map((assessment) => ({
        id: assessment.placementId,
        title: assessment.title,
        kind: 'ASSESSMENT' as const,
        completed: false,
        href: courseRoutes.exam(assessment.examId),
        order: assessment.position,
      }));

      const items = [...lessons, ...assessments]
        .sort((a, b) => a.order - b.order || a.kind.localeCompare(b.kind) || a.id.localeCompare(b.id))
        // Re-stamp order across the whole course, not per module, so a note's anchor order sorts
        // the notes workspace into syllabus order rather than interleaving modules.
        .map((item) => ({ ...item, order: order++ }));

      return { id: mod.id, title: mod.title, items };
    });

  const courseLevel = (course.assessments ?? []) as AssessmentNodeResponse[];
  if (courseLevel.length > 0) {
    sections.push({
      id: `${course.id}-assessments`,
      title: 'Assessments',
      items: courseLevel
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((assessment) => ({
          id: assessment.placementId,
          title: assessment.title,
          kind: 'ASSESSMENT' as const,
          completed: false,
          href: courseRoutes.exam(assessment.examId),
          order: order++,
        })),
    });
  }

  return sections;
}

function buildFacts(
  course: CourseResponse | undefined,
  progress: CourseProgress | undefined,
): OverviewFact[] {
  if (!course) return [];

  const facts: OverviewFact[] = [];
  const moduleCount = course.modules?.length ?? 0;
  const lessonCount =
    progress?.totalLessons ?? (course.modules ?? []).reduce((n, m) => n + (m.lessons?.length ?? 0), 0);

  if (moduleCount > 0) {
    facts.push({ icon: Layers, label: 'Modules', value: String(moduleCount) });
  }
  if (lessonCount > 0) {
    facts.push({ icon: BookOpen, label: 'Lessons', value: String(lessonCount) });
  }
  if (course.duration) {
    facts.push({ icon: Clock, label: 'Length', value: course.duration });
  }
  if (course.hasExam) {
    facts.push({ icon: GraduationCap, label: 'Assessment', value: 'Included' });
  }
  if (typeof course.enrollmentCount === 'number') {
    facts.push({
      icon: BarChart3,
      label: 'Learners',
      value: course.enrollmentCount.toLocaleString(),
    });
  }
  if (course.updatedAt) {
    facts.push({
      icon: RefreshCw,
      label: 'Updated',
      value: new Date(course.updatedAt).toLocaleDateString(undefined, {
        month: 'short',
        year: 'numeric',
      }),
    });
  }
  return facts;
}

/** Newline-separated author bullets, with blank lines and stray list markers stripped. */
function splitOutcomes(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split('\n')
    .map((line) => line.replace(/^\s*[-*•]\s*/, '').trim())
    .filter(Boolean);
}

function describeLoadFailure(error: unknown): string | null {
  if (!error) return null;
  if (error instanceof ApiError) {
    if (error.isNetworkError) return error.message;
    if (error.status === 404) return 'This course no longer exists, or has not been published.';
    return error.message;
  }
  return 'Something went wrong loading this course.';
}
