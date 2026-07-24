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
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

export { RoadmapNode } from "./extensions/roadmap";
export { roadmapService } from "./services/roadmap";
export { roadmapProgressService } from "./services/progress";
export { roadmapTemplateService } from "./services/template";
export type { RoadmapData, RoadmapTemplateData } from "./types";
export { CATEGORIES, DIFFICULTIES } from "./components/SaveAsTemplateModal";
export { RoadmapStudio } from "./components/RoadmapStudio";