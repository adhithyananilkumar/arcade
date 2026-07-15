<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Identity, Access Management & RBAC System (Detailed Specification)

This project implements a dual-scope Role-Based Access Control (RBAC) and Identity and Access Management (IAM) engine.

## 1. Backend Architecture

### 1.1 Permission Discovery & Security Boundaries
- **Permissions Table**: Loaded eagerly and mapped dynamically. Available permissions are seeded via database migrations (e.g. `channels.approve`, `channels.suspend`, `roles.create`, `roles.assign`, `users.create`, `users.suspend`).
- **Endpoint Security Policies**: Applied at the REST controller level via Spring Security's `@PreAuthorize` expression parser:
  - **`ChannelController.java`**:
    - `GET /requests` (Pending requests) & `GET /` (All channels): `@PreAuthorize("hasRole('SUPER_USER') or hasAuthority('channels.approve')")`
    - `POST /{id}/accept`: `@PreAuthorize("hasRole('SUPER_USER') or hasAuthority('channels.approve')")`
    - `DELETE /{id}`: `@PreAuthorize("hasRole('SUPER_USER') or hasAuthority('channels.suspend')")`
  - **`UserController.java`**:
    - `GET /`: List all users. `@PreAuthorize("hasRole('SUPER_USER') or hasAuthority('roles.assign') or hasAuthority('users.suspend')")`
    - `PUT /{id}/roles`: Modify user roles. `@PreAuthorize("hasRole('SUPER_USER') or hasAuthority('roles.assign')")`
  - **`RoleController.java`** & **`PermissionController.java`**:
    - All routes (GET, POST, PUT, DELETE): `@PreAuthorize("hasRole('SUPER_USER') or hasAuthority('roles.create') or hasAuthority('roles.assign')")`

### 1.2 Data Transmission (DTOs)
- **`ProfileResponse.java`**:
  - Exposes `private List<String> permissions` containing all authority keys the user inherits through their combined roles. This feeds the frontend authentication store.
  - Exposes `RoleDto` with both `id` and `name` properties to map database entities to checkboxes in the user interface.
- **`RoleResponse.java`**:
  - Exposes `private List<PermissionDto> permissions` containing full Permission objects (`id`, `name`, `key`) instead of raw strings, allowing fallback rendering if the human-readable description is absent.

### 1.3 Database Modifications
- **`V16__fix_user_roles_id_default.sql`**: Alters the composite relationship table `user_roles` to provide a default value:
  ```sql
  ALTER TABLE user_roles ALTER COLUMN id SET DEFAULT gen_random_uuid();
  ```
  This prevents database null-constraint errors during many-to-many role updates.

---

## 2. Frontend Architecture & Flow

### 2.1 State Management & Hooks
- **`auth.store.ts`**: The `User` interface holds `permissions: string[]`. Loaded during login or token refresh via `AuthService.refresh()`.
- **`usePermissions.ts`**: Provides:
  - `hasPermission(permission: string)`: Checks if `user.permissions` contains the specified key.
  - `hasRole(role: string)`: Checks user roles.
  - `hasAnyPermission(permissions: string[])`: Returns true if any of the permissions are matched.

### 2.2 Navigation & Dynamic Sidebars
- **`DashboardSidebar.tsx`**: Conditionally displays admin pages:
  - **Admin Channels** (`/dashboard/admin/channels`): Shown if the user is `SUPER_USER` or has `channels.approve` or `channels.suspend`.
  - **Admin Settings** (`/dashboard/admin/settings`): Shown if the user is `SUPER_USER` or has `roles.create`, `roles.assign`, or `users.suspend`.

### 2.3 User Directory (`UsersList.tsx`)
- Displays all platform users and their roles.
- Features an **Assign Policy** action that launches a modal listing all available custom policies.
- Filters out empty role selections and calls `UserService.assignRolesToUser` which hits `PUT /api/v1/users/{userId}/roles` on the backend.

### 2.4 Policy Builder & Editor (`PolicyManager.tsx`)
- Displays all custom roles and their nested permission sets.
- Features **Create Policy** and **Edit Policy** triggers (restricted to users having `roles.create` / `SUPER_USER`).
- Pre-fills current configurations (Title, Description, and checked permissions) and dispatches either:
  - `POST /api/v1/roles` (for creation).
  - `PUT /api/v1/roles/{id}` (for updates).
- System-defined roles (e.g. `SUPER_USER`) are read-only and hide edit controls.

### 2.5 Channel Moderation (`PendingChannels.tsx`)
- Displays pending submissions.
- Conditionally hides the **Accept** button if the logged-in user lacks `channels.approve`, and hides the **Reject** button if they lack `channels.suspend`.
