/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: IAM
 *
 * Purpose:
 * Exposes the public API for the IAM domain (policy editing and
 * per-user access management UI).
 *
 * Rules:
 * - Export only stable public APIs.
 * - Never export internal helpers.
 * - Never import from apps/.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

export { PolicyEditor } from './policy-editor/PolicyEditor';
export type { PolicyEditorProps } from './policy-editor/PolicyEditor';

export { UserPipelinePanel } from './user-access/UserPipelinePanel';
export type { UserPipelinePanelProps } from './user-access/UserPipelinePanel';
export { ComplianceBadge } from './user-access/ComplianceBadge';
