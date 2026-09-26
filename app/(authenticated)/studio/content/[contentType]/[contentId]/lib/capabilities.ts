import type { ContentTypeSegment } from "./contentTypeRouting";

// Data-driven capability model: sections/nav groups on the Content Overview
// page are never hardcoded per content type in JSX ("if course, hide
// analytics"). Instead each type declares which capabilities it has, and
// the shell just iterates whatever the registry says.
export type Capability =
  | "ANALYTICS"
  | "REGISTRATIONS"
  | "ATTENDANCE"
  | "COLLABORATORS"
  | "LEARNERS"
  | "DISCUSSION"
  | "LEARNER_REVIEWS"
  | "PUBLISHING"
  | "PRICING"
  | "SETTINGS";

export type CapabilityGroup = "pricing" | "settings" | "people" | "analytics" | "publishing" | "more";

export interface CapabilityDef {
  id: Capability;
  label: string;
  group: CapabilityGroup;
  availability: "available" | "planned";
}

export const GROUP_LABEL: Record<CapabilityGroup, string> = {
  pricing: "Pricing",
  settings: "Settings",
  people: "People",
  analytics: "Analytics",
  publishing: "Publishing",
  more: "More",
};

export const GROUP_ORDER: CapabilityGroup[] = ["pricing", "settings", "people", "analytics", "publishing", "more"];

export const CONTENT_CAPABILITIES: Record<ContentTypeSegment, CapabilityDef[]> = {
  course: [
    { id: "COLLABORATORS", label: "Collaborators", group: "people", availability: "available" },
    { id: "PUBLISHING", label: "Publishing", group: "publishing", availability: "available" },
    // Planned — no course analytics/learners/discussion/reviews endpoint exists yet.
    { id: "ANALYTICS", label: "Analytics", group: "analytics", availability: "planned" },
    { id: "LEARNERS", label: "Learners", group: "people", availability: "planned" },
    { id: "DISCUSSION", label: "Discussion", group: "more", availability: "planned" },
    { id: "LEARNER_REVIEWS", label: "Learner reviews", group: "more", availability: "planned" },
  ],
  event: [
    { id: "PRICING", label: "Pricing", group: "pricing", availability: "available" },
    { id: "SETTINGS", label: "Settings", group: "settings", availability: "available" },
    { id: "REGISTRATIONS", label: "Registrations", group: "people", availability: "available" },
    { id: "COLLABORATORS", label: "Collaborators", group: "people", availability: "available" },
    { id: "ANALYTICS", label: "Analytics", group: "analytics", availability: "available" },
    { id: "PUBLISHING", label: "Publishing", group: "publishing", availability: "available" },
    // Planned — event_attendance/event_certificates tables are orphaned, no API.
    { id: "ATTENDANCE", label: "Attendance", group: "people", availability: "planned" },
    { id: "DISCUSSION", label: "Discussion", group: "more", availability: "planned" },
    { id: "LEARNER_REVIEWS", label: "Learner reviews", group: "more", availability: "planned" },
  ],
  exam: [
    // Publishing is real: ExamPublishService cuts an immutable ExamVersion, and past versions
    // are listable. Exams self-publish (no platform review round), so no review capability.
    { id: "PUBLISHING", label: "Publishing", group: "publishing", availability: "available" },
    // Planned — an exam has no collaborator table of its own; authority comes from the channel
    // (channel.exams.manage[.own]), so there is nothing per-exam to list yet.
    { id: "COLLABORATORS", label: "Collaborators", group: "people", availability: "planned" },
    { id: "ANALYTICS", label: "Analytics", group: "analytics", availability: "planned" },
  ],
};

export function availableCapabilities(segment: ContentTypeSegment): CapabilityDef[] {
  return CONTENT_CAPABILITIES[segment].filter((c) => c.availability === "available");
}

export function hasCapability(segment: ContentTypeSegment, capability: Capability): boolean {
  return availableCapabilities(segment).some((c) => c.id === capability);
}

/** Groups that have at least one available capability, in display order. */
export function availableGroups(segment: ContentTypeSegment): CapabilityGroup[] {
  const present = new Set(availableCapabilities(segment).map((c) => c.group));
  return GROUP_ORDER.filter((g) => present.has(g));
}

export function capabilitiesInGroup(segment: ContentTypeSegment, group: CapabilityGroup): CapabilityDef[] {
  return availableCapabilities(segment).filter((c) => c.group === group);
}
