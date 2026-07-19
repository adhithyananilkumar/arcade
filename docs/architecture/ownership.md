# Architecture Ownership Guidelines

This document defines the strict ownership rules and boundaries for the Arcade frontend repository. By adhering to these guidelines, we maintain a decoupled, scalable, and highly maintainable codebase.

## Overview

The Arcade repository follows a hybrid **Apps + Domains Architecture**.
Every piece of code must live in one of the following four root layers:
1. `apps/`
2. `domains/`
3. `infrastructure/`
4. `shared/`

The overarching dependency rule is: **Dependencies point inwards toward shared.**
`app → apps → domains → infrastructure → shared`

Cross-domain imports are strictly restricted to public APIs (`index.ts`).

---

## 1. Apps (Experience Composition Layer)
**Path:** `apps/`

Apps are the orchestrators. They compose domain capabilities to build specific user experiences (like the Learner Dashboard or Creator Studio).

### Responsibilities
- Compose domains, infrastructure, and shared layers.
- Orchestrate routing and navigation.
- Own application-level layouts (e.g., `DashboardNavbar`, `DashboardSidebar`).
- Own global providers and guards (e.g., `Providers`, `AuthGuard`).
- Manage cross-domain workflows (e.g., publishing a course).

### What belongs here
- Page orchestrators.
- Application layouts.
- Routing logic.

### What does NOT belong here
- Reusable business logic.
- Domain models and types.
- Persistence logic or HTTP implementations.

### Allowed Dependencies
- `domains/*` (via public APIs only)
- `infrastructure/*`
- `shared/*`

---

## 2. Domains (Business Capabilities)
**Path:** `domains/`

Domains are flat, isolated bounded contexts that map to specific business capabilities. They should be as independent as possible.

### Responsibilities
- Implement business rules and logic.
- Own domain models, types, and schemas.
- Provide reusable domain-specific UI components (e.g., `CourseCard`).
- Expose a strict public API (`index.ts`).

### Public API Guidelines
Every domain must expose its stable contract through a single `index.ts` file.
- **Allowed Exports:** Public React components for reuse, public hooks, public API/service interfaces, public types, and schemas intended for external consumers.
- **Forbidden Exports:** Internal helper components, private utilities, implementation details, test helpers, low-level configuration.
- **No Wildcards:** Avoid `export * from "./components"`. Prefer explicit exports: `export { CourseEditorShell } from "./components/CourseEditorShell";`.
- **Naming Convention:** Prefix internal components with an underscore (e.g., `_EditorToolbar.tsx`) or place them in an `internal/` directory to make it obvious they must not be exported.

### What belongs here
- Domain-specific hooks.
- Domain-specific components.
- Domain-specific data fetching / API calls.
- Domain types and schemas.

### What does NOT belong here
- Application orchestrators.
- Cross-domain workflows.
- Core HTTP interceptors or global state engines.

### Allowed Dependencies
- Other `domains/*` (via public APIs only, minimize coupling)
- `infrastructure/*`
- `shared/*`

---

## 3. Infrastructure (Technical Systems)
**Path:** `infrastructure/`

Infrastructure provides the technical enablers that domains use to interact with the outside world (network, browser, auth state). 

### Responsibilities
- Manage external communications (HTTP clients, WebSockets).
- Handle global authentication states.
- Manage global state configuration (e.g., React Query Client).
- Manage monitoring, logging, and telemetry.

### What belongs here
- `api.ts` / core HTTP fetchers.
- LocalStorage wrappers.
- Auth tokens and session refresh logic.
- Third-party SDK integrations.

### What does NOT belong here
- Business logic or domain models.
- UI components.
- Application layouts.

### Allowed Dependencies
- `shared/*`

---

## 4. Shared (Framework-Agnostic Reusables)
**Path:** `shared/`

Shared contains the absolute primitives of the application. It is highly reusable and completely decoupled from business logic.

### Responsibilities
- Provide the Design System (UI components).
- Provide foundational utilities (date formatting, string manipulation).
- Provide generic layouts (e.g., `Container`, `PageLayout`).
- Provide shared global types (e.g., generic API response wrappers).

### What belongs here
- Shadcn UI components.
- Generic hooks (e.g., `useDebounce`).
- Global utility functions.

### What does NOT belong here
- Domain-specific models.
- Business logic.
- API clients or HTTP requests.

### Allowed Dependencies
- None (Internal only or external NPM packages).
