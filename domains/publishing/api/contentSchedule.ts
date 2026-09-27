// Central content scheduling: when enrollment/registration is open and when the content itself can
// be accessed. One creator-controlled schedule per course, event or exam. The server composes it
// with any platform constraints and enforces the result at enrollment and at access; the editor
// edits the creator's part and shows what actually applies.

import { api } from "@/infrastructure/http/api";

export type ScheduledContentType = "COURSE" | "EVENT" | "EXAM";

export interface ScheduleWindow {
  opensAt: string | null;
  closesAt: string | null;
}

/** NOT_YET_OPEN, OPEN, CLOSED, or NEVER (a window that closes before it opens). */
export type ScheduleState = "NOT_YET_OPEN" | "OPEN" | "CLOSED" | "NEVER";

export interface ContentScheduleResponse {
  contentType: ScheduledContentType;
  contentId: string;
  creatorEnrollment: ScheduleWindow;
  creatorAccess: ScheduleWindow;
  timezone: string | null;
  effectiveEnrollment: ScheduleWindow;
  effectiveAccess: ScheduleWindow;
  enrollmentState: ScheduleState;
  accessState: ScheduleState;
  /** Which constraint sources shaped the effective windows, e.g. ["CREATOR"]. */
  origins: string[];
  updatedAt: string | null;
}

/** A full replacement. Any null bound means unbounded. */
export interface ContentScheduleRequest {
  enrollmentOpensAt: string | null;
  enrollmentClosesAt: string | null;
  accessStartsAt: string | null;
  accessEndsAt: string | null;
  timezone: string | null;
}

export const contentScheduleApi = {
  get: (type: ScheduledContentType, contentId: string) =>
    api.get<ContentScheduleResponse>(`/api/schedules/${type}/${contentId}`),
  put: (type: ScheduledContentType, contentId: string, body: ContentScheduleRequest) =>
    api.put<ContentScheduleResponse>(`/api/schedules/${type}/${contentId}`, body),
  clear: (type: ScheduledContentType, contentId: string) =>
    api.delete<void>(`/api/schedules/${type}/${contentId}`),
};
