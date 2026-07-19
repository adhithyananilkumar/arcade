/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Courses
 *
 * Purpose:
 * Exposes the public API for the Courses domain.
 *
 * Rules:
 * - Export only stable public APIs.
 * - Never export internal helpers.
 * - Never import from apps/.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

// features/content/course/index.ts
// Public surface of the course-authoring submodule.
export { getBlockDefinitions, getBlockRenderer, getBlockExtensions } from './blocks/registry';