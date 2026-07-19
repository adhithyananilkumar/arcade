/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Organizations
 *
 * Purpose:
 * Exposes the public API for the Organizations domain.
 *
 * Rules:
 * - Export only stable public APIs.
 * - Never export internal helpers.
 * - Never import from apps/.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

export { OrganizationService } from './api/organization.service';
export type { OrganizationMembership, Organization } from './api/organization.service';