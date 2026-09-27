import { api, ApiError } from "@/infrastructure/http/api";
import { getEventStatusHistory, validateEvent } from "@/domains/events/api/publish";
import { getEventSummary, type EventSummary } from "@/domains/events/api/dashboardApi";
import type { Event as EventDto } from "@/domains/events/types/event.types";
import type { ReviewPathPreview } from "@/domains/publishing";
import {
  platformReviewApi,
  type ContentType as ReviewContentType,
  type ReviewResponse,
} from "@/domains/publishing";
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
  courseId?: string | null;
  eventId?: string | null;
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

// A standalone exam goes through Platform Review like a course or event. A tied exam never has a
// review of its own — it is reviewed and published with its course or event.
const REVIEW_CONTENT_TYPE: Partial<Record<ContentTypeSegment, ReviewContentType>> = {
  course: "COURSE",
  event: "EVENT",
  exam: "EXAM",
};

export interface OverviewData {
  content: ContentSummaryLite | null;
  statusHistory: FetchResult<StatusHistoryEntry[]>;
  collaborators: FetchResult<CollaboratorLite[]>;
  review: FetchResult<ReviewResponse>;
  /**
   * The server-computed path this content would take if submitted now. Fetched here rather than
   * derived in a component: it is author-specific and comes from the same resolver submission uses.
   */
  reviewPath: FetchResult<ReviewPathPreview>;
  eventParticipants?: FetchResult<EventParticipant[]>;
  eventAnalytics?: FetchResult<Record<string, unknown>>;
  eventReadiness?: FetchResult<PublishValidationResponse>;
  eventSummary?: FetchResult<EventSummary>;
  eventDetails?: FetchResult<EventDto>;
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
    tieType?: "COURSE" | "EVENT" | null;
    tiedContentId?: string | null;
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
    courseId: exam.tieType === "COURSE" ? exam.tiedContentId ?? null : null,
    eventId: exam.tieType === "EVENT" ? exam.tiedContentId ?? null : null,
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
      reviewPath: { status: "empty" },
    };
  }

  if (segment === "exam") {
    // Plans, attempts and marking are loaded by the tabs that show them. A tied exam has no review
    // of its own (it rides with its course or event), so only a standalone one fetches review state.
    const tied = !!(content.courseId || content.eventId);
    const [collaborators, review, reviewPath] = await Promise.all([
      settle(api.get<CollaboratorLite[]>(collaboratorsPath(segment, contentId)), { isEmpty: isEmptyArray }),
      tied
        ? Promise.resolve<FetchResult<ReviewResponse>>({ status: "empty" })
        : settle(platformReviewApi.byContent("EXAM", contentId), { emptyStatuses: [403, 404] }),
      tied
        ? Promise.resolve<FetchResult<ReviewPathPreview>>({ status: "empty" })
        : settle(platformReviewApi.reviewPath("EXAM", contentId), { emptyStatuses: [403, 404, 422] }),
    ]);
    return { content, statusHistory: { status: "empty" }, collaborators, review, reviewPath };
  }

  const reviewContentType = REVIEW_CONTENT_TYPE[segment];
  const reviewPromise: Promise<FetchResult<ReviewResponse>> = reviewContentType
    ? settle(platformReviewApi.byContent(reviewContentType, contentId), { emptyStatuses: [403, 404] })
    : Promise.resolve({ status: "empty" });

  // 403 is expected for a collaborator who can see the content but is not its owner; an absent
  // preview simply hides the panel rather than surfacing an error they cannot act on.
  const reviewPathPromise: Promise<FetchResult<ReviewPathPreview>> = reviewContentType
    ? settle(platformReviewApi.reviewPath(reviewContentType, contentId), {
        emptyStatuses: [403, 404, 422],
      })
    : Promise.resolve({ status: "empty" });

  if (segment === "course") {
    const [statusHistory, collaborators, review, reviewPath] = await Promise.all([
      settle(api.get<StatusHistoryEntry[]>(`/api/courses/${contentId}/status-history`), { isEmpty: isEmptyArray }),
      settle(api.get<CollaboratorLite[]>(collaboratorsPath(segment, contentId)), { isEmpty: isEmptyArray }),
      reviewPromise,
      reviewPathPromise,
    ]);
    return { content, statusHistory, collaborators, review, reviewPath };
  }

  // event
  const [
    statusHistory,
    collaborators,
    eventParticipants,
    eventAnalytics,
    eventReadiness,
    eventSummary,
    eventDetails,
    review,
    reviewPath,
  ] =
    await Promise.all([
      settle(getEventStatusHistory(contentId), { isEmpty: isEmptyArray }),
      settle(api.get<CollaboratorLite[]>(collaboratorsPath(segment, contentId)), { isEmpty: isEmptyArray }),
      settle(api.get<EventParticipant[]>(`/api/v1/events/${contentId}/participants`), { isEmpty: isEmptyArray }),
      settle(api.get<Record<string, unknown>>(`/api/v1/events/${contentId}/participants/analytics`), {
        isEmpty: (data) => !data || Object.keys(data).length === 0,
      }),
      settle(validateEvent(contentId)),
      settle(getEventSummary(contentId)),
      settle(api.get<EventDto>(`/api/v1/events/${contentId}`)),
      reviewPromise,
      reviewPathPromise,
    ]);
  return {
    content,
    statusHistory,
    collaborators,
    eventParticipants,
    eventAnalytics,
    eventReadiness,
    eventSummary,
    eventDetails,
    review,
    reviewPath,
  };
}
