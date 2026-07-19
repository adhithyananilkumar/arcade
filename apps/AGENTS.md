# Application Layer (apps/)

## Purpose
The Application Layer is responsible for orchestrating the overall user experience, managing routing, and composing multiple domain components together into cohesive pages and workflows.

## Allowed Responsibilities
- Next.js Routing and Layouts
- Global Providers and Contexts
- Route Guards and Authentication Checks
- Orchestrators (components that fetch data and pass it to pure UI components)
- Page-level side effects (e.g. Navigation, API calls)

## Forbidden Responsibilities
- Reusable business logic or UI (belongs in `domains/`)
- Purely technical integrations or HTTP clients (belongs in `infrastructure/`)
- Generic design system components (belongs in `shared/`)

## Import Rules
- **Can import from:** `domains/`, `infrastructure/`, `shared/`
- **Cannot import from:** Other standalone apps (e.g., `creator/` should not import `learner/`)

## Examples
- `apps/creator/orchestrators/CourseEditorOrchestrator.tsx` (Composes Courses, Publishing, and Learning components)
- `apps/public/layout/ForumLayout.tsx` (Sets up the forum UI shell)


## Architecture Protection & Agent Behavior
- **Architecture is complete.** Do NOT reorganize folders or move code unless explicitly requested.
- **When uncertain, ask instead of assuming.** If a change appears to require an architectural modification or bypassing a boundary, ask for explicit approval before proceeding.
- **Do not invent abstractions.** Prefer extending existing patterns.
- Treat any structural change as requiring explicit approval.
