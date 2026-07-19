# Technical Layer (infrastructure/)

## Purpose
The Infrastructure Layer manages external systems, low-level technical integrations, and persistent storage. It acts as an adapter between the pure logic in `domains/` and the outside world.

## Allowed Responsibilities
- HTTP Clients and Fetch wrappers (`api.ts`)
- WebSocket and Real-time connections (Yjs)
- Global Authentication and Session Management mechanics
- Third-party SDK integrations (e.g., Analytics, Payment Gateways)
- Global Caching (e.g., React Query clients)

## Forbidden Responsibilities
- Business logic or Domain models
- UI Rendering (No React components should live here)
- Importing from Domains or Apps.

## Import Rules
- **Can import from:** External node modules, `shared/`
- **Cannot import from:** `domains/`, `apps/`, `app/`

## Examples
- `infrastructure/http/api.ts` (Fetch wrapper)
- `infrastructure/auth/session.service.ts`


## Architecture Protection & Agent Behavior
- **Architecture is complete.** Do NOT reorganize folders or move code unless explicitly requested.
- **When uncertain, ask instead of assuming.** If a change appears to require an architectural modification or bypassing a boundary, ask for explicit approval before proceeding.
- **Do not invent abstractions.** Prefer extending existing patterns.
- Treat any structural change as requiring explicit approval.
