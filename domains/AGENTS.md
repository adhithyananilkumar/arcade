# Business Layer (domains/)

## Purpose
The Business Layer houses the core capabilities of Arcade. Each domain encapsulates its own business logic, state, validation, and specialized UI components.

## Allowed Responsibilities
- Business Logic and Validation
- Domain Models (Types, Zod schemas)
- Specialized UI Components (Pure components that receive data via props)
- Domain Services (API wrappers using `api.ts`)

## Forbidden Responsibilities
- Application-level orchestration (routing, URL parameters)
- Global state side-effects (e.g., redirecting on unauthorized)
- Importing from the Application layer (`apps/` or `app/`)

## Import Rules
- **Can import from:** `infrastructure/`, `shared/`, other `domains/` (via their public `index.ts`)
- **Cannot import from:** `apps/`, `app/`
- **Must expose:** Only stable elements through `index.ts`. No wildcard exports.

## Examples
- `domains/courses/blocks/quiz/QuizBlockRender.tsx`
- `domains/identity/components/AuthForm.tsx`


## Architecture Protection & Agent Behavior
- **Architecture is complete.** Do NOT reorganize folders or move code unless explicitly requested.
- **When uncertain, ask instead of assuming.** If a change appears to require an architectural modification or bypassing a boundary, ask for explicit approval before proceeding.
- **Do not invent abstractions.** Prefer extending existing patterns.
- Treat any structural change as requiring explicit approval.
