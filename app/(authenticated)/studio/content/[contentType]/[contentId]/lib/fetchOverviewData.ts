import { api, ApiError } from "@/infrastructure/http/api";
import { getEventStatusHistory, validateEvent } from "@/app/(authenticated)/studio/events/api/publish";
import { platformReviewApi, type ContentType as ReviewContentType, type ReviewResponse } from "@/domains/publishing/api/platformReview";
import type { ContentTypeSegment } from "./contentTypeRouting";
import { collaboratorsPath } from "./contentActions";
import type { PublishValidationResponse } from "@/app/(authenticated)/studio/events/types";

// Every fetch here hits an existing, already-working backend endpoint — see
// the Content Workspace plan for the audited endpoint list. Nothing here
// duplicates business logic or introduces a new aggregation API; it only
// fans requests out in parallel instead of the app doing them one at a time.
//
// Each capability fetch resolves to a tri-state FetchResult rather than
// `T | undefined`, so the UI can tell "fetched fine, genuinely nothing
// here" (empty) apart from "this one thing failed" (error) — the latter
// degrades its own section/nav badge without blanking the rest of the page.
export type FetchResult<T> = { status: "ok"; data: T } | { status: "empty" } | { status: "error" };

async function settle<T>(
  promise: Promise<T>,
  opts?: { isEmpty?: (data: T) => boolean; emptyStatuses?: number[] }
): Promise<FetchResult<T>> {
  try {
    const data = await promise;
    if (opts?.isEmpty?.(data)) return { status: "empty" };
    return { status: "ok", data };
  } catch (err) {
    if (err instanceof ApiError && opts?.emptyStatuses?.includes(err.status)) {
      return { status: "empty" };
    }
    return { status: "error" };
  }
}

const isEmptyArray = <T,>(data: T[]) => Array.isArray(data) && data.length === 0;

export interface ContentSummaryLite {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  coverImageUrl?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  channelId: string;
  channelName: string;
  authorId?: string | null;
  authorName?: string | null;
}

export interface StatusHistoryEntry {
  label: string;
  actorName: string;
  createdAt: string;
}

export interface CollaboratorLite {
  id: string | null;
  userId: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export interface EventParticipant {
  id: string;
  name: string;
  email: string;
  status: string;
  registrationDate?: string;
}

// Exam is absent on purpose: exams never enter a Platform Review round (they self-publish an
// immutable ExamVersion), so there is no review to fetch for one.
const REVIEW_CONTENT_TYPE: Partial<Record<ContentTypeSegment, ReviewContentType>> = {
  course: "COURSE",
  event: "EVENT",
};

export interface OverviewData {
  content: ContentSummaryLite | null;
  statusHistory: FetchResult<StatusHistoryEntry[]>;
  collaborators: FetchResult<CollaboratorLite[]>;
  review: FetchResult<ReviewResponse>;
  eventParticipants?: FetchResult<EventParticipant[]>;
  eventAnalytics?: FetchResult<Record<string, unknown>>;
  eventReadiness?: FetchResult<PublishValidationResponse>;
  courseEnrollmentCount?: FetchResult<number>;
}

async function findContentSummary(contentId: string): Promise<ContentSummaryLite | null> {
  const items = await api.get<ContentSummaryLite[]>("/api/content");
  return items.find((item) => item.id === contentId) ?? null;
}

/**
 * An exam is resolved from the Exam API rather than the content listing: an exam attached to a
 * course/event is deliberately not listed in "my content" (it's reached through its parent), so
 * findContentSummary would return null for exactly the exams that do have a parent.
 */
async function findExamSummary(contentId: string): Promise<ContentSummaryLite | null> {
  const exam = await api.get<{
    id: string;
    title: string;
    description: string | null;
    coverImageUrl: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
  }>(`/api/exams/${contentId}`);
  if (!exam) return null;
  // channelName/authorName aren't on ExamResponse; the header renders its own fallbacks.
  return {
    id: exam.id,
    type: "EXAM",
    title: exam.title,
    description: exam.description,
    coverImageUrl: exam.coverImageUrl,
    status: exam.status,
    createdAt: exam.createdAt,
    updatedAt: exam.updatedAt,
    channelId: "",
    channelName: "",
  };
}

export async function fetchOverviewData(
  segment: ContentTypeSegment,
  contentId: string
): Promise<OverviewData> {
  const content =
    segment === "exam" ? await findExamSummary(contentId) : await findContentSummary(contentId);
  if (!content) {
    return {
      content: null,
      statusHistory: { status: "empty" },
      collaborators: { status: "empty" },
      review: { status: "empty" },
    };
  }

  if (segment === "exam") {
    // Everything else an exam needs (plans, attempts) is loaded by the tab that shows it — there
    // is no cross-capability fan-out to do here. statusHistory stays empty: exams self-publish
    // rather than passing through platform review, so there is genuinely none to show. Team is
    // real, though — Exam shares the one ContentCollaborationController every owner type uses.
    const collaborators = await settle(
      api.get<CollaboratorLite[]>(collaboratorsPath(segment, contentId)),
      { isEmpty: isEmptyArray }
    );
    return {
      content,
      statusHistory: { status: "empty" },
      collaborators,
      review: { status: "empty" },
    };
  }

  const reviewContentType = REVIEW_CONTENT_TYPE[segment];
  const reviewPromise: Promise<FetchResult<ReviewResponse>> = reviewContentType
    ? settle(platformReviewApi.byContent(reviewContentType, contentId), { emptyStatuses: [404, 403] })
    : Promise.resolve({ status: "empty" });

  if (segment === "course") {
    const [statusHistory, collaborators, review, courseEnrollmentCount] = await Promise.all([
      settle(api.get<StatusHistoryEntry[]>(`/api/courses/${contentId}/status-history`), { isEmpty: isEmptyArray }),
      settle(api.get<CollaboratorLite[]>(collaboratorsPath(segment, contentId)), { isEmpty: isEmptyArray }),
      reviewPromise,
      settle(api.get<number>(`/api/v1/enrollments/resource/COURSE/${contentId}/count`)),
    ]);
    return { content, statusHistory, collaborators, review, courseEnrollmentCount };
  }

  // event
  const [statusHistory, collaborators, eventParticipants, eventAnalytics, eventReadiness, review] =
    await Promise.all([
      settle(getEventStatusHistory(contentId), { isEmpty: isEmptyArray }),
      settle(api.get<CollaboratorLite[]>(collaboratorsPath(segment, contentId)), { isEmpty: isEmptyArray }),
      settle(api.get<EventParticipant[]>(`/api/v1/events/${contentId}/participants`), { isEmpty: isEmptyArray }),
      settle(api.get<Record<string, unknown>>(`/api/v1/events/${contentId}/participants/analytics`), {
        isEmpty: (data) => !data || Object.keys(data).length === 0,
      }),
      settle(validateEvent(contentId)),
      reviewPromise,
    ]);
  return { content, statusHistory, collaborators, eventParticipants, eventAnalytics, eventReadiness, review };
}
