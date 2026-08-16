/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Articles
 *
 * Purpose:
 * Exposes the public API for the Articles domain.
 *
 * Rules:
 * - Export only stable public APIs.
 * - Never export internal helpers.
 * - Never import from apps/.
 * ------------------------------------------------------------------
 */

export { articleService } from "./services/article";
export type { ArticleData } from "./types";
