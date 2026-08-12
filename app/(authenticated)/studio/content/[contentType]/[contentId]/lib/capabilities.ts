import type { ContentTypeSegment } from "./contentTypeRouting";

// Data-driven capability model: sections/tabs on the Content Overview page
// are never hardcoded per content type in JSX ("if course, hide analytics").
// Instead each type declares which capabilities it has, and the shell just
// iterates whatever the registry says. Adding a capability to a type later
// (e.g. once a backend analytics endpoint exists for courses) is a one-line
// change here — no page restructuring.
//
// Every capability listed below is backed by a real, already-working
// endpoint (see fetchOverviewData.ts) — never fabricate a capability that
// has nothing to fetch.
export type Capability =
  | "ANALYTICS"
  | "REGISTRATIONS"
  | "COLLABORATORS"
  | "ACTIVITY"
  | "PUBLISHING";

export const CAPABILITY_LABEL: Record<Capability, string> = {
  ANALYTICS: "Analytics",
  REGISTRATIONS: "Registrations",
  COLLABORATORS: "Collaborators",
  ACTIVITY: "Activity",
  PUBLISHING: "Publishing",
};

export const CONTENT_CAPABILITIES: Record<ContentTypeSegment, Capability[]> = {
  course: ["COLLABORATORS", "PUBLISHING"],
  event: ["ANALYTICS", "REGISTRATIONS", "COLLABORATORS", "PUBLISHING"],
  roadmap: ["ANALYTICS", "COLLABORATORS", "ACTIVITY", "PUBLISHING"],
};

export function hasCapability(segment: ContentTypeSegment, capability: Capability): boolean {
  return CONTENT_CAPABILITIES[segment].includes(capability);
}
