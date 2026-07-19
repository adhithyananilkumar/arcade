# Contributing to Arcade Frontend

Welcome! This is the canonical architecture and contributor guide for the Arcade frontend.
The frontend architecture has reached Version 1.0 and is considered stable.

> **When uncertain, ask instead of assuming.**
> - If a feature could reasonably belong to more than one domain, ask before creating a new one.
> - If a change appears to require an architectural modification, ask before proceeding.
> - If backend behavior is unclear, do not invent frontend behavior—ask or leave a TODO for backend clarification.
> - Never "fix" architecture based on personal preference.

## 1. Overall Philosophy

**The Frontend is NOT the source of truth.**
The frontend only renders data and orchestrates user interaction. Never duplicate backend logic.

The backend exclusively owns:
- permissions
- policies
- authorization
- business rules
- validation
- pricing
- workflows
- state transitions
- ownership

### No Hardcoding
Never hardcode permissions, roles, policies, course states, workflow transitions, feature flags, pricing, limits, institution configuration, tenant configuration, channel configuration, or organization configuration. These must always come from the backend. Navigation based on permissions or authorization checks must also be driven by the backend.

### API Rules
- Frontend must never invent data.
- Frontend must never fabricate permissions.
- Frontend must never simulate backend behavior.
- Always use Infrastructure APIs.
- Business decisions belong to the server.

## 2. Layer Responsibilities & Dependency Flow

Dependencies flow exclusively downwards:
```text
app
↓
apps
↓
domains
↓
infrastructure
↓
shared
```

### `app/` & Routing Rules
- Only `app/` contains routes.
- Never place routes anywhere else.

### `apps/`
- Apps orchestrate.
- Apps do not own business logic.
- Apps compose Domains.
- Apps coordinate workflows.
- Apps may call multiple domains.
- Apps may call Infrastructure.

### `domains/`
- Domains own business logic, business UI, business models, validation, and domain services.
- Domains never depend on Apps.
- **Every new feature MUST belong to an existing domain.**
- If it doesn't fit, ONLY THEN create a new domain.
- Never create folders based on pages or screens. Organize around business capability.

### `infrastructure/`
- Infrastructure owns HTTP, Authentication, Caching, Persistence, Storage, Monitoring, and Configuration.
- Infrastructure must never contain business rules.

### `shared/`
- `shared/` must NEVER contain business logic, business state, feature-specific code, HTTP, authentication, routing, or permissions.
- Anything business-specific belongs to Domains.

## 3. Public API Policy

Every domain exposes its stable contract via `index.ts`. 
- **Never** use wildcard exports (`export *`).
- **Never** deep import from another domain (e.g., `import { X } from '@/domains/foo/components/X'`). Always import from `@/domains/foo`.

## 4. Public Pages

The Landing experience is one application.
Everything related to the public website belongs inside `apps/public`.
Examples:
- Landing, Marketing, Hero, Explore, About
- Content Creator pages
- Public profile pages
- Forum layouts
- Public orchestration
Do NOT scatter landing page components across unrelated folders. Future marketing pages should follow the same structure.

## 5. Future Features Placement

Documenting exactly where future work belongs:
- New course editor block → `domains/courses`
- New assessment type → `domains/assessments`
- Community feature → `domains/community`
- Creator workflow → `apps/creator`
- Learner workflow → `apps/learner`
- Authentication → `domains/identity` + `infrastructure/auth`
- Dashboard composition → `apps/`
- Platform Console → `apps/console`
- Shared button → `shared/design-system`
- API Client → `infrastructure/http`
- Theme → `infrastructure/state`
- Permissions → backend only


## 6. Repository Structure

### `app/`
- **Purpose**: Next.js routes only.
- **Contains**: pages, layouts, loading, error, route handlers.
- **Must NOT contain**: business logic, reusable services.

### `apps/`
- **Purpose**: Application composition.
- **Owns**: orchestrators, providers, layouts, workflows.
- **Must NOT own**: business rules.

### `domains/`
- **Purpose**: Business capabilities.
- **Contains**: business models, services, UI, validation.
- **Rules**: Never depends on apps.

### `shared/`
- **Purpose**: Reusable framework-agnostic code.
- **Contains**: UI, hooks, utilities, contexts.
- **Never contains**: permissions, HTTP, routing, business rules.

### `infrastructure/`
- **Purpose**: Technical implementations.
- **Contains**: HTTP, Authentication, Cache, State, Monitoring.
- **Never contains**: business logic.

### `public/`
- **Purpose**: Static assets.
- **Only**: images, fonts, videos, icons.
- **Rules**: No TypeScript.

### `config/`
- **Purpose**: Configuration only.
- **Rules**: No runtime business logic.

### `docs/`
- **Purpose**: Documentation only.
- **Rules**: Never place executable code.

## 7. Important Root Files

### `README.md`
Project overview.

### `AGENTS.md`
Instructions for AI coding agents.

### `CLAUDE.md`
Claude Code project guidance.

### `package.json`
Project metadata, scripts, and dependencies.

### `tsconfig.json`
TypeScript configuration.

### `next.config.ts`
Next.js configuration.

### `eslint.config.mjs`
Lint rules.

### `components.json`
shadcn/ui configuration.
