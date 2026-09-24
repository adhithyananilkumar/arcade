import type { CapabilityGroup } from "../lib/capabilities";

// Navigation for the Content Workspace is the page-local floating dock
// (ContentWorkspaceDock.tsx) and tab bar. This file hosts the shared tab-id
// type both components key off of.
export type OverviewTab =
  | "OVERVIEW"
  | CapabilityGroup
  | "pricing"
  | "settings"
  | "participants"
  | "collaborators";
