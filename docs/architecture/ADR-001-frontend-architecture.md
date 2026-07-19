# ADR-001: Frontend Architecture and Boundary Enforcement

**Status:** Accepted
**Date:** 2026-07-19
**Context:** The application previously suffered from deep architectural coupling, bidirectional layer imports, and leaked side effects that compromised stability, reusability, and testing.

## 1. Chosen Architecture

We have officially adopted a strict **Apps + Domains** architectural pattern. 
The system is divided into four distinct layers, possessing a strict, unidirectional dependency flow:

```text
app/ & apps/
    ↓
domains/
    ↓
infrastructure/
    ↓
shared/
```

### Layer Responsibilities

1. **Apps (`apps/` & Next.js `app/`):** 
   - Exclusively responsible for declarative routing, application-level layouts, top-level context providers, guards, and orchestrating complex business processes.
   - **Constraint:** Must not contain reusable business logic.

2. **Domains (`domains/`):**
   - The core business capabilities (e.g., Courses, Publishing, Identity). Contains business models, logic, and pure UI components.
   - **Constraint:** A domain may never import from `apps/` or `app/`.

3. **Infrastructure (`infrastructure/`):**
   - Handles all technical side effects and external system integration (HTTP clients like `api.ts`, WebSockets, Persistence, Analytics).
   - **Constraint:** Must remain agnostic to business capabilities. Infrastructure may never depend on Domains or Apps.

4. **Shared (`shared/`):**
   - Universal, framework-agnostic utilities (e.g., Design System, global types).
   - **Constraint:** Must never depend on routing or business concepts.

## 2. Public API Policy

Domains must act as black boxes to consumers. 
Each domain contains a single `index.ts` file at its root. 
- The `index.ts` serves as the sole **Public API contract**.
- **Constraint:** Consumers (Apps or other Domains) must import strictly from `@/domains/[name]`. Deep imports (e.g., `@/domains/courses/components/XYZ`) are strictly forbidden.
- **Constraint:** No wildcard exports (`export *`) are permitted in `index.ts` to prevent accidental leakage of internal implementation details.

## 3. The Orchestrator Pattern & Side Effects

To preserve the purity of Domain UI components, side-effects are decoupled using the **Orchestrator Pattern**.
- **Domain UI Components** must remain pure and predictable, accepting data via props and emitting events via callbacks.
- **Orchestrators** (living in `apps/`) wrap Domain UI components to provide them with data (via HTTP calls, hooks, or context) and handle their emitted events (e.g., executing mutations or router navigation).
- **Side Effect Policy:** `localStorage`, API polling, auth redirects, and routing should be confined to Orchestrators or the Infrastructure layer.

## 4. Architecture Enforcement Mechanisms

To prevent regression and guarantee long-term maintainability, these architectural decisions are enforced automatically.
The agreed-upon sequence for implementing enforcement (Phase 3) is:

1. **ESLint Boundary Rules:** Leverage `eslint-plugin-boundaries` to enforce the strict App → Domain → Infrastructure → Shared dependency direction.
2. **TypeScript Path Aliases:** Strict definition of `@/domains/*` over relative paths.
3. **Dependency-Cruiser:** Run automated graph checks (`dependency-cruiser`) to ensure no forbidden cross-domain or layer-violating imports occur.
4. **Circular Dependency Checks:** Ensure unidirectional flow.
5. **CI/CD Integration:** Integrate the above tooling into the continuous integration pipeline to fail builds that violate ADR-001.
6. **PR Validation:** Provide instantaneous feedback to contributors for architectural missteps.
