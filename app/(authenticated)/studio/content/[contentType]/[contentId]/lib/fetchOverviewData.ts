import { api } from "@/infrastructure/http/api";
import { roadmapService } from "@/domains/roadmaps";
import { getEventStatusHistory } from "@/app/(authenticated)/studio/events/api/publish";
import { getCollaborators as getEventCollaborators } from "@/app/(authenticated)/studio/events/api/collaboration";
import type { ContentTypeSegment } from "./contentTypeRouting";

// Every fetch here hits an existing, already-working backend endpoint — see
// the Content Overview plan for the audited endpoint list. Nothing here
// duplicates business logic or introduces a new aggregation API; it only
// fans requests out in parallel instead of the app doing them one at a time.

export interface ContentSummaryLite {
  id: string;
  type: string;
  title: string;
  description?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  channelId: string;
  channelName: string;
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

export interface OverviewData {
  content: ContentSummaryLite | null;
  statusHistory?: StatusHistoryEntry[];
  collaborators?: CollaboratorLite[];
  roadmapAnalytics?: RoadmapAnalytics;
  roadmapActivity?: ActivityEntry[];
  eventParticipants?: EventParticipant[];
  eventAnalytics?: Record<string, unknown>;
}

async function findContentSummary(contentId: string): Promise<ContentSummaryLite | null> {
  const items = await api.get<ContentSummaryLite[]>("/api/content");
  return items.find((item) => item.id === contentId) ?? null;
}

async function settleOrUndefined<T>(promise: Promise<T>): Promise<T | undefined> {
  try {
    return await promise;
  } catch {
    return undefined;
  }
}

export async function fetchOverviewData(
  segment: ContentTypeSegment,
  contentId: string
): Promise<OverviewData> {
  const content = await findContentSummary(contentId);
  if (!content) {
    return { content: null };
  }

  if (segment === "course") {
    const [statusHistory, collaborators] = await Promise.all([
      settleOrUndefined(api.get<StatusHistoryEntry[]>(`/api/courses/${contentId}/status-history`)),
      settleOrUndefined(
        api.get<CollaboratorLite[]>(`/api/v1/courses/${contentId}/collaborators`)
      ),
    ]);
    return { content, statusHistory, collaborators };
  }

  if (segment === "roadmap") {
    const [statusHistory, collaborators, roadmapAnalytics, roadmapActivity] = await Promise.all([
      settleOrUndefined(roadmapService.getRoadmapStatusHistory(contentId)),
      settleOrUndefined(
        api.get<CollaboratorLite[]>(`/api/roadmaps/${contentId}/collaborators`)
      ),
      settleOrUndefined(api.get<RoadmapAnalytics>(`/api/roadmaps/${contentId}/analytics`)),
      settleOrUndefined(api.get<ActivityEntry[]>(`/api/roadmaps/${contentId}/activity`)),
    ]);
    return { content, statusHistory, collaborators, roadmapAnalytics, roadmapActivity };
  }

  // event
  const [statusHistory, collaborators, eventParticipants, eventAnalytics] = await Promise.all([
    settleOrUndefined(getEventStatusHistory(contentId)),
    settleOrUndefined(getEventCollaborators(contentId)),
    settleOrUndefined(api.get<EventParticipant[]>(`/api/v1/events/${contentId}/participants`)),
    settleOrUndefined(
      api.get<Record<string, unknown>>(`/api/v1/events/${contentId}/participants/analytics`)
    ),
  ]);
  return { content, statusHistory, collaborators, eventParticipants, eventAnalytics };
}
