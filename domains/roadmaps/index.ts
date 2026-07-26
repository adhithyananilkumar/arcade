/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Roadmaps
 *
 * Purpose:
 * Exposes the public API for the Roadmaps domain.
 *
 * Rules:
 * - Export only stable public APIs.
 * - Never export internal helpers.
 * - Never import from apps/.
 * ------------------------------------------------------------------
 */

export { RoadmapNode, RoadmapExtension } from "./extensions/RoadmapExtension";
export { RoadmapNodeView } from "./extensions/RoadmapNodeView";
export { RoadmapCanvas } from "./components/RoadmapCanvas";
export { RoadmapView } from "./components/RoadmapView";
export { TopicNode } from "./components/TopicNode";
export { ConnectionEdge } from "./components/ConnectionEdge";
export { HoverCard } from "./components/HoverCard";
export { ProgressOverlay } from "./components/ProgressOverlay";
export { MiniMap } from "./components/MiniMap";
export { SaveTemplateModal, templateService } from "./components/Templates";
export { Serializer } from "./utils/Serializer";
export { LayoutEngine } from "./utils/LayoutEngine";

export { roadmapService } from "./services/roadmap";
export { roadmapProgressService } from "./services/progress";
export { roadmapTemplateService } from "./services/template";
export type { RoadmapData, RoadmapTemplateData } from "./types";
export { CATEGORIES, DIFFICULTIES } from "./components/SaveAsTemplateModal";