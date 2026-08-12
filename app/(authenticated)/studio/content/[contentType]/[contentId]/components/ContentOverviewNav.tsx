import type { CapabilityGroup } from "../lib/capabilities";

// Navigation for the Content Workspace is the page-local floating dock
// (ContentWorkspaceDock.tsx), not a tab strip — this file now only hosts
// the shared tab-id type both components key off of.
export type OverviewTab = "OVERVIEW" | CapabilityGroup;
