/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Identity
 *
 * Purpose:
 * Exposes the public API for the Identity domain.
 *
 * Rules:
 * - Export only stable public APIs.
 * - Never export internal helpers.
 * - Never import from apps/.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

export { UserService } from './api/user.service';
export { default as AuthForm } from './components/AuthForm';
export { roleService } from './api/iam/role.service';
export type { Role, RoleRequest } from './api/iam/role.service';
export { permissionService } from './api/iam/permission.service';
export type { Permission } from './api/iam/permission.service';
export { usePermissions } from './hooks/usePermissions';