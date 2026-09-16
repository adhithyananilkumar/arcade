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

export { AccessPoliciesPanel } from './user-access/AccessPoliciesPanel';
export type { AccessPoliciesPanelProps } from './user-access/AccessPoliciesPanel';
export { AssignPolicyDialog } from './user-access/AssignPolicyDialog';
export { ConfirmDialog } from './user-access/ConfirmDialog';
