import { api, ApiError } from "@/infrastructure/http/api";
import { roadmapService } from "@/domains/roadmaps";
import { getEventStatusHistory, validateEvent } from "@/app/(authenticated)/studio/events/api/publish";
import { getCollaborators as getEventCollaborators } from "@/app/(authenticated)/studio/events/api/collaboration";
import { platformReviewApi, type ContentType as ReviewContentType, type ReviewResponse } from "@/domains/publishing/api/platformReview";
import type { ContentTypeSegment } from "./contentTypeRouting";
import type { PublishValidationResponse, EventPricing } from "@/app/(authenticated)/studio/events/types";

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

export interface RoadmapAnalytics {
  totalLearners: number;
  activeLearners: number;
  completedLearners: number;
  completionRate: number;
  averageCompletionTimeSeconds: number;
}

export interface ActivityEntry {
  id: string;
  userName: string;
  actionType: string;
  description: string;
  createdAt: string;
}

export interface EventParticipant {
  id: string;
  name: string;
  email: string;
  status: string;
  registrationDate?: string;
}

const REVIEW_CONTENT_TYPE: Record<ContentTypeSegment, ReviewContentType> = {
  course: "COURSE",
  roadmap: "ROADMAP",
  event: "EVENT",
  article: "ARTICLE",
};

export interface CourseSettingsLite {
  hasExam: boolean;
}

export interface OverviewData {
  content: ContentSummaryLite | null;
  statusHistory: FetchResult<StatusHistoryEntry[]>;
  collaborators: FetchResult<CollaboratorLite[]>;
  review: FetchResult<ReviewResponse>;
  courseSettings?: FetchResult<CourseSettingsLite>;
  roadmapAnalytics?: FetchResult<RoadmapAnalytics>;
  roadmapActivity?: FetchResult<ActivityEntry[]>;
  eventParticipants?: FetchResult<EventParticipant[]>;
  eventAnalytics?: FetchResult<Record<string, unknown>>;
  eventReadiness?: FetchResult<PublishValidationResponse>;
  eventPricing?: FetchResult<EventPricing>;
}

async function findContentSummary(contentId: string, segment: ContentTypeSegment): Promise<ContentSummaryLite | null> {
  try {
    const items = await api.get<ContentSummaryLite[]>("/api/content");
    const found = items.find((item) => item.id?.toLowerCase() === contentId?.toLowerCase());
    if (found) return found;
  } catch (e) {
    console.warn("Failed to list /api/content", e);
  }

  // Fallback direct endpoint lookup if the course/content exists in backend
  try {
    if (segment === "course") {
      const res = await api.get<any>(`/api/courses/${contentId}`);
      if (res && res.id) {
        return {
          id: res.id,
          type: "COURSE",
          title: res.title || "Untitled Course",
          description: res.description,
          coverImageUrl: res.coverImageUrl,
          status: res.status || "DRAFT",
          createdAt: res.createdAt,
          updatedAt: res.updatedAt,
          channelId: res.channelId,
          channelName: res.channelName || "Studio",
          authorId: res.authorId,
          authorName: res.authorName,
        };
      }
    } else if (segment === "roadmap") {
      const res = await api.get<any>(`/api/roadmaps/${contentId}`);
      if (res && res.id) {
        return {
          id: res.id,
          type: "ROADMAP",
          title: res.title || "Untitled Roadmap",
          description: res.description,
          coverImageUrl: res.coverImageUrl,
          status: res.status || "DRAFT",
          createdAt: res.createdAt,
          updatedAt: res.updatedAt,
          channelId: res.channelId,
          channelName: res.channelName || "Studio",
          authorId: res.authorId,
          authorName: res.authorName,
        };
      }
    } else if (segment === "event") {
      const res = await api.get<any>(`/api/v1/events/${contentId}`);
      if (res && res.id) {
        return {
          id: res.id,
          type: "EVENT",
          title: res.title || "Untitled Event",
          description: res.description,
          coverImageUrl: res.coverImageUrl,
          status: res.status || "DRAFT",
          createdAt: res.createdAt,
          updatedAt: res.updatedAt,
          channelId: res.channelId,
          channelName: res.channelName || "Studio",
          authorId: res.organizerId || res.authorId,
          authorName: res.organizerName || res.authorName,
        };
      }
    } else if (segment === "article") {
      const res = await api.get<any>(`/api/articles/${contentId}`);
      if (res && res.id) {
        return {
          id: res.id,
          type: "ARTICLE",
          title: res.title || "Untitled Article",
          description: res.description,
          coverImageUrl: res.coverImageUrl,
          status: res.status || "DRAFT",
          createdAt: res.createdAt,
          updatedAt: res.updatedAt,
          channelId: res.channelId,
          channelName: res.channelName || "Studio",
          authorId: res.authorId || res.createdBy?.id,
          authorName: res.authorName || res.createdBy?.fullName,
        };
      }
    }
  } catch (e) {
    console.warn("Direct content lookup fallback failed", e);
  }

  return null;
}

export async function fetchOverviewData(
  segment: ContentTypeSegment,
  contentId: string
): Promise<OverviewData> {
  const content = await findContentSummary(contentId, segment);
  if (!content) {
    return {
      content: null,
      statusHistory: { status: "empty" },
      collaborators: { status: "empty" },
      review: { status: "empty" },
    };
  }

  const reviewPromise = settle(platformReviewApi.byContent(REVIEW_CONTENT_TYPE[segment], contentId), {
    emptyStatuses: [404],
  });

  if (segment === "article") {
    const [statusHistory, collaborators, review] = await Promise.all([
      settle(api.get<StatusHistoryEntry[]>(`/api/articles/${contentId}/status-history`), { isEmpty: isEmptyArray, emptyStatuses: [404] }),
      settle(api.get<CollaboratorLite[]>(`/api/v1/articles/${contentId}/collaborators`), { isEmpty: isEmptyArray, emptyStatuses: [404] }),
      reviewPromise,
    ]);
    return { content, statusHistory, collaborators, review };
  }

  if (segment === "course") {
    const [statusHistory, collaborators, courseSettings, review] = await Promise.all([
      settle(api.get<StatusHistoryEntry[]>(`/api/courses/${contentId}/status-history`), { isEmpty: isEmptyArray }),
      settle(api.get<CollaboratorLite[]>(`/api/v1/courses/${contentId}/collaborators`), { isEmpty: isEmptyArray }),
      settle(api.get<CourseSettingsLite>(`/api/courses/${contentId}`)),
      reviewPromise,
    ]);
    return { content, statusHistory, collaborators, courseSettings, review };
  }

  if (segment === "roadmap") {
    const [statusHistory, collaborators, roadmapAnalytics, roadmapActivity, review] = await Promise.all([
      settle(roadmapService.getRoadmapStatusHistory(contentId), { isEmpty: isEmptyArray }),
      settle(api.get<CollaboratorLite[]>(`/api/roadmaps/${contentId}/collaborators`), { isEmpty: isEmptyArray }),
      settle(api.get<RoadmapAnalytics>(`/api/roadmaps/${contentId}/analytics`)),
      settle(api.get<ActivityEntry[]>(`/api/roadmaps/${contentId}/activity`), { isEmpty: isEmptyArray }),
      reviewPromise,
    ]);
    return { content, statusHistory, collaborators, roadmapAnalytics, roadmapActivity, review };
  }

  // event
  const [statusHistory, collaborators, eventParticipants, eventAnalytics, eventReadiness, eventPricing, review] =
    await Promise.all([
      settle(getEventStatusHistory(contentId), { isEmpty: isEmptyArray }),
      settle(getEventCollaborators(contentId), { isEmpty: isEmptyArray }),
      settle(api.get<EventParticipant[]>(`/api/v1/events/${contentId}/participants`), { isEmpty: isEmptyArray }),
      settle(api.get<Record<string, unknown>>(`/api/v1/events/${contentId}/participants/analytics`), {
        isEmpty: (data) => !data || Object.keys(data).length === 0,
      }),
      settle(validateEvent(contentId)),
      settle(api.get<EventPricing>(`/api/v1/events/${contentId}/pricing`), { emptyStatuses: [404] }),
      reviewPromise,
    ]);
  return { content, statusHistory, collaborators, eventParticipants, eventAnalytics, eventReadiness, eventPricing, review };
}
