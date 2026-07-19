# Reusable Layer (shared/)

## Purpose
The Shared Layer contains universal, framework-agnostic utilities and the global design system. Everything here must be completely unaware of Arcade's business domains.

## Allowed Responsibilities
- Design System UI Components (Buttons, Modals, Typography)
- Generic Utility Functions (Date formatting, debouncing)
- Generic React Hooks (`useWindowSize`, `useDebounce`)
- Global API types (if not domain-specific)

## Forbidden Responsibilities
- Domain-specific logic or models (e.g., "Course", "User", "Quiz")
- Orchestration or application logic

## Import Rules
- **Can import from:** External node modules
- **Cannot import from:** `domains/`, `apps/`, `infrastructure/` (except perhaps generic utilities)

## Examples
- `shared/design-system/ui/button.tsx`
- `shared/utils/utils.ts`


## Architecture Protection & Agent Behavior
- **Architecture is complete.** Do NOT reorganize folders or move code unless explicitly requested.
- **When uncertain, ask instead of assuming.** If a change appears to require an architectural modification or bypassing a boundary, ask for explicit approval before proceeding.
- **Do not invent abstractions.** Prefer extending existing patterns.
- Treat any structural change as requiring explicit approval.
