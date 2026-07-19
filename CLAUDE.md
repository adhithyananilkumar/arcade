# Arcade Frontend

## Project Overview
Arcade is a modern, modular frontend built with Next.js, React, and TypeScript. It uses a strict boundary-enforced architecture (Apps + Domains) to scale maintainably. 
**The frontend architecture has reached Version 1.0 and is STABLE.**

## Important Repository Rules
- **No deep imports**: Always import from a domain's public `index.ts`.
- **Strict Dependency Direction**: `app -> apps -> domains -> infrastructure -> shared`.
- **Pure UI**: Domain UI components should be pure and receive data/callbacks via props.
- **Orchestration**: All side effects (API calls, routing) must be handled by orchestrators in `apps/`.

## Ask Instead of Assuming
- If a feature could reasonably belong to more than one domain, ask before creating a new one.
- If a change appears to require an architectural modification, ask before proceeding.
- If backend behavior is unclear, do not invent frontend behavior—ask or leave a TODO for backend clarification.
- Never "fix" architecture based on personal preference.

## Architecture Protection
Before making ANY structural change, pause and ask:
- Does this move code between layers?
- Does this bypass a domain or duplicate a capability?
- Does this introduce frontend business rules that belong on the backend?
If YES to any, **STOP**. Do NOT perform the change automatically. Treat architectural changes as requiring explicit approval. Explain the violation and ask for approval.

## Code Review Behavior
When reviewing code, look for:
- Business logic in Apps or Shared
- HTTP outside Infrastructure
- Permission logic, hardcoded roles, or business rules in Frontend
- Cross-layer violations or deep imports
If found, explain exactly why it violates the architecture and recommend a compliant alternative. Do not automatically rewrite large portions of the project.

## Documentation References
Before making changes, consult:
- `docs/architecture/ADR-001-frontend-architecture.md`
- `docs/architecture/CONTRIBUTING.md`
- `docs/architecture/architecture-principles.md`