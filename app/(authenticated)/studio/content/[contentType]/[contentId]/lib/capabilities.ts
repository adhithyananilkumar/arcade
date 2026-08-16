import type { ContentTypeSegment } from "./contentTypeRouting";

// Data-driven capability model: sections/nav groups on the Content Overview
// page are never hardcoded per content type in JSX ("if course, hide
// analytics"). Instead each type declares which capabilities it has, and
// the shell just iterates whatever the registry says.
//
// `availability` distinguishes a capability that's conceptually real for
// this content type from one that's actually backed by a working endpoint
// today. "planned" entries exist so a future backend endpoint can be turned
// on with a one-line availability flip — but the UI only ever renders
// "available" entries. A planned capability must never appear as a tab, a
// disabled button, or an empty screen; it's pure registry metadata until a
// real fetcher exists for it in fetchOverviewData.ts.
export type Capability =
  | "ANALYTICS"
  | "REGISTRATIONS"
  | "ATTENDANCE"
  | "COLLABORATORS"
  | "LEARNERS"
  | "DISCUSSION"
  | "LEARNER_REVIEWS"
  | "ACTIVITY"
  | "PUBLISHING"
  | "PRICING";

export type CapabilityGroup = "analytics" | "people" | "members" | "pricing" | "publishing" | "more";

export interface CapabilityDef {
  id: Capability;
  label: string;
  group: CapabilityGroup;
  availability: "available" | "planned";
}

export const GROUP_LABEL: Record<CapabilityGroup, string> = {
  analytics: "Analytics",
  people: "People",
  members: "Members",
  pricing: "Pricing",
  publishing: "Publishing",
  more: "More",
};

export const GROUP_ORDER: CapabilityGroup[] = ["analytics", "people", "members", "pricing", "publishing", "more"];

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
    { id: "ANALYTICS", label: "Analytics", group: "analytics", availability: "available" },
    { id: "COLLABORATORS", label: "Collaborators", group: "people", availability: "available" },
    { id: "PUBLISHING", label: "Publishing", group: "publishing", availability: "available" },
    // Registered attendees — distinct from organizers/collaborators in the people tab
    { id: "REGISTRATIONS", label: "Members", group: "members", availability: "available" },
    // Pricing & registration lifecycle
    { id: "PRICING", label: "Pricing", group: "pricing", availability: "available" },
    // Planned — event_attendance/event_certificates tables are orphaned, no API.
    { id: "ATTENDANCE", label: "Attendance", group: "people", availability: "planned" },
    { id: "DISCUSSION", label: "Discussion", group: "more", availability: "planned" },
    { id: "LEARNER_REVIEWS", label: "Learner reviews", group: "more", availability: "planned" },
  ],
  roadmap: [
    { id: "ANALYTICS", label: "Analytics", group: "analytics", availability: "available" },
    { id: "COLLABORATORS", label: "Collaborators", group: "people", availability: "available" },
    { id: "ACTIVITY", label: "Activity", group: "more", availability: "available" },
    { id: "PUBLISHING", label: "Publishing", group: "publishing", availability: "available" },
    // Planned — /progress returns the caller's own progress, not a learner list.
    { id: "LEARNERS", label: "Learners", group: "people", availability: "planned" },
  ],
  article: [
    { id: "COLLABORATORS", label: "Collaborators", group: "people", availability: "available" },
    { id: "PUBLISHING", label: "Publishing", group: "publishing", availability: "available" },
    // Planned — no article analytics endpoint exists yet.
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


