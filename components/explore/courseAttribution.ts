/**
 * Who a content card credits: the channel it was published on, and nothing else.
 *
 * Every course, event and exam is published by a channel. An organization channel shows its own
 * name and logo; a personal channel shows its name and its owner's profile picture — the backend
 * already sends the owner's picture as a personal channel's `iconUrl`, so no person-vs-channel
 * branching happens here. Cards never show an author, instructor or role tag.
 */

import type { CourseChannelSummary } from "@/shared/types/api.types";

export interface CardChannel {
  name: string;
  iconUrl: string | null;
}

/** Fields a course row may carry; all optional so partial rows are safe. */
export interface AttributableCourse {
  channel?: CourseChannelSummary | null;
}

export function getCourseChannel(course: AttributableCourse): CardChannel | null {
  const channel = course.channel;
  if (!channel?.name) return null;
  return { name: channel.name, iconUrl: channel.iconUrl ?? null };
}
