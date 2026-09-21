/**
 * Who a course card credits, derived from what the backend actually sends.
 *
 * A course published under an organization channel is the organization's work, so the card
 * shows the org's name and logo; a course on a personal channel is the person's, so it shows
 * them. Anything with no attribution at all falls back to a generated monogram rather than to a
 * stock photo of someone who does not exist — a placeholder should look like a placeholder.
 */

import type { CourseChannelSummary, CourseCollaboratorSummary } from "@/shared/types/api.types";

export interface CourseAttribution {
  name: string;
  role: string;
  avatarUrl: string;
}

/** Fields a course card needs to attribute itself; all optional so partial rows are safe. */
export interface AttributableCourse {
  channel?: CourseChannelSummary | null;
  authorName?: string | null;
  authorAvatarUrl?: string | null;
  collaborators?: CourseCollaboratorSummary[] | null;
}

/** A deterministic monogram for someone with no uploaded avatar. Never a photo of a real person. */
export function monogramAvatar(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=EEF2FF&color=4338CA&bold=true`;
}

export function getCourseAttribution(course: AttributableCourse): CourseAttribution {
  const channel = course.channel;
  if (channel && !channel.isPersonal && channel.name) {
    return {
      name: channel.name,
      role: "Organization",
      avatarUrl: channel.iconUrl || monogramAvatar(channel.name),
    };
  }

  if (course.authorName) {
    return {
      name: course.authorName,
      role: "Course Author",
      avatarUrl: course.authorAvatarUrl || monogramAvatar(course.authorName),
    };
  }

  // No author on the row (the author FK is ON DELETE SET NULL) — fall back to whoever is
  // credited, preferring the one the backend marked as the author.
  const credited = course.collaborators ?? [];
  const primary = credited.find((c) => c.role === "Author") ?? credited[0];
  if (primary?.name) {
    return {
      name: primary.name,
      role: primary.role === "Author" ? "Course Author" : "Instructor",
      avatarUrl: primary.avatarUrl || monogramAvatar(primary.name),
    };
  }

  return { name: "Arcade", role: "Course Author", avatarUrl: monogramAvatar("Arcade") };
}
