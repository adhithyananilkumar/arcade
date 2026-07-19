# Arcade Frontend Architecture

## Read First

Before modifying the codebase, read:

1. docs/architecture/ADR-001-frontend-architecture.md
2. docs/architecture/architecture-principles.md
3. docs/architecture/CONTRIBUTING.md

## Architecture is Complete
Do NOT reorganize folders.
Do NOT move code unless requested.
Do NOT introduce new architectural patterns.
Do NOT invent abstractions.
Do NOT optimize prematurely.
Do NOT collapse Domains into Shared.
Do NOT move business logic into Apps.
Do NOT place HTTP inside Domains.
Do NOT place permissions inside Frontend.
Do NOT duplicate backend rules.
Do NOT hardcode server state.
Always preserve scalability, tenant isolation, multi-channel architecture, and backend ownership.

## Architecture Protection Rules
Before making ANY structural change, ask:
1. Does this change alter the architecture?
2. Does this move code between layers?
3. Does this introduce a new architectural pattern?
4. Does this create a new root folder?
5. Does this change dependency direction?
6. Does this bypass an existing domain?
7. Does this duplicate an existing capability?
8. Does this move business logic into Apps, Shared, or Infrastructure?
9. Does this introduce frontend business rules that belong on the backend?

If the answer to ANY question is YES, STOP. Do NOT perform the change automatically.
Instead, explicitly ask for approval before continuing. Explain what will change, why the architecture is violated, what problem it solves, what rule it conflicts with, and suggest a compliant alternative.
**Treat architectural changes as requiring explicit approval.**

## When Uncertain, Ask Instead of Assuming
- If a feature could reasonably belong to more than one domain, ask before creating a new one.
- If a change appears to require an architectural modification, ask before proceeding.
- If backend behavior is unclear, do not invent frontend behavior—ask or leave a TODO for backend clarification.
- Never "fix" architecture based on personal preference.

## Refactoring Policy
Never refactor simply because code "looks cleaner."
Refactoring is only justified if it:
- Fixes a bug
- Improves correctness
- Improves performance
- Removes duplication
- Supports a new business requirement
- Improves maintainability without changing architectural boundaries
Otherwise, leave existing code unchanged.

## Architecture & Dependency Flow

`app/` → Next.js routing only
`apps/` → Application orchestration
`domains/` → Business capabilities
`infrastructure/` → Technical implementations
`shared/` → Framework-agnostic reusable code

app ↓ apps ↓ domains ↓ infrastructure ↓ shared

Reverse dependencies are forbidden. Every domain exposes only `index.ts`. Never deep import another domain.
