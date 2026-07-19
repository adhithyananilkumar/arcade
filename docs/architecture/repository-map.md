# Repository Map

The Arcade repository follows a strict, highly-organized layout based on business capabilities. 
This map is an onboarding reference for developers and AI agents to quickly understand where code belongs.

## Top-Level Layout

```text
Root
│
├── app                 → Next.js routing and pages
├── apps                → Application orchestration
├── domains             → Business capabilities (logic & pure UI)
├── infrastructure      → Technical implementations (HTTP, Auth, DB)
├── shared              → Reusable framework-agnostic code
├── public              → Static assets (images, fonts, videos)
├── docs                → Documentation (ADRs, guidelines)
├── config              → Project configuration files
└── scripts             → Development utilities and migrations
```

---

## Detailed Directory Breakdown

### `app/`
- **Purpose**: Next.js App Router boundaries.
- **Contains**: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, route handlers.
- **Must NOT contain**: Reusable services, complex business logic, or pure UI components.
- **Who owns it**: Feature teams own their respective route segments.
- **Example**: `app/(auth)/sign/page.tsx`

### `apps/`
- **Purpose**: Application orchestration and composition.
- **Contains**: High-level orchestrators, providers, workflows, and complex layouts.
- **Must NOT own**: Core business rules, validation, or domain models.
- **Who owns it**: Product teams building specific experiences (e.g., Creator Studio).
- **Example**: `apps/creator/orchestrators/CourseEditorOrchestrator.tsx`

### `domains/`
- **Purpose**: The core business capabilities of Arcade.
- **Contains**: Pure UI components, business logic, validation schemas, domain hooks, and services.
- **Must NOT contain**: Application routing, page orchestrators, or global CSS. Never depends on `apps/`.
- **Who owns it**: Dedicated capability teams (e.g., Identity team owns `domains/identity`).
- **Example**: `domains/courses/blocks/quiz/QuizBlockRender.tsx`

### `shared/`
- **Purpose**: Universal, framework-agnostic reusable code.
- **Contains**: Design system (`components/ui`), generic hooks, utilities, and global UI contexts.
- **Must NOT contain**: HTTP logic, authentication, routing, or business concepts (e.g., "Course" or "User").
- **Who owns it**: The platform/frontend core team.
- **Example**: `shared/design-system/ui/button.tsx`

### `infrastructure/`
- **Purpose**: Adapters for technical implementations and external services.
- **Contains**: HTTP clients, authentication flows, caching wrappers, WebSocket logic, monitoring.
- **Must NOT contain**: Business rules, UI components, or domain logic.
- **Who owns it**: The platform/frontend core team.
- **Example**: `infrastructure/http/api.ts`

### `public/`
- **Purpose**: Static assets deployed alongside the frontend.
- **Contains**: Images, icons, videos, fonts, `robots.txt`, `favicon.ico`.
- **Must NOT contain**: TypeScript or executable code.
- **Who owns it**: Shared.
- **Example**: `public/arcade.svg`

### `config/`
- **Purpose**: Dedicated directory for global configuration parameters.
- **Contains**: Global constants and non-sensitive structural config.
- **Must NOT contain**: Runtime business logic.

### `docs/`
- **Purpose**: Project documentation and historical architecture records.
- **Contains**: ADRs, contribution guides, guidelines.
- **Must NOT contain**: Executable source code.

### `scripts/`
- **Purpose**: Internal development tooling.
- **Contains**: Migration scripts, dependency analyzers, standalone Node.js utilities.
- **Must NOT contain**: Production application code.

---

## Important Root Files

- **`README.md`**: Project overview, setup instructions, and quick start guide.
- **`AGENTS.md`**: Strict rules for AI coding agents regarding architecture protection and coding standards.
- **`CLAUDE.md`**: High-level project guidance tailored for Claude Code and similar assistants.
- **`package.json`**: Project metadata, NPM scripts, and dependency definitions.
- **`tsconfig.json`**: TypeScript compiler configuration and path aliases.
- **`next.config.ts`**: Next.js framework configuration (headers, redirects, rewrites).
- **`eslint.config.mjs`**: ESLint rules, including boundary enforcement logic.
- **`components.json`**: `shadcn/ui` integration configuration.
