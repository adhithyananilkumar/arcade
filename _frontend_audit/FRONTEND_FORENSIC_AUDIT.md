# Frontend Forensic Audit — Master Index

Scope: `E:\arcade\ui` (Next.js/React, 624 TypeScript/TSX source files across `app/`, `apps/`, `domains/`, `components/`, `features/`, `infrastructure/`, `shared/`), cross-referenced against `E:\arcade\backend`. Conducted 2026-08-16. Audit only — no source files were modified, no mock data was removed or wired, no architecture was changed, in producing this document set.

Read this document first, then follow the links below in numbered order for full detail. Start with [01_FRONTEND_EXECUTIVE_AUDIT.md](./01_FRONTEND_EXECUTIVE_AUDIT.md) for the scorecard and top-20 issue list, and [13_FRONTEND_REMEDIATION_ROADMAP.md](./13_FRONTEND_REMEDIATION_ROADMAP.md) for the phased plan.

## Document set

| # | Document | Covers |
|---|---|---|
| — | [FRONTEND_INVENTORY.md](./FRONTEND_INVENTORY.md) | Repo footprint, file/dependency counts, largest files, risk-pattern sweep |
| 01 | [01_FRONTEND_EXECUTIVE_AUDIT.md](./01_FRONTEND_EXECUTIVE_AUDIT.md) | Scorecard, top 20 issues, top-10 lists, what to change / not change |
| 02 | [02_FRONTEND_ARCHITECTURE.md](./02_FRONTEND_ARCHITECTURE.md) | Real dependency graph, layering violations, target architecture |
| 03 | [03_FRONTEND_STRUCTURE_AUDIT.md](./03_FRONTEND_STRUCTURE_AUDIT.md) | Folder/module structure, God components, large-file triage |
| 04 | [04_FRONTEND_DUPLICATION_AUDIT.md](./04_FRONTEND_DUPLICATION_AUDIT.md) | Duplicated components/logic/utilities, canonical-implementation calls |
| 05 | [05_FRONTEND_API_INTEGRATION_AUDIT.md](./05_FRONTEND_API_INTEGRATION_AUDIT.md) | HTTP client architecture, endpoint mapping, React Query coverage |
| 06 | [06_FRONTEND_MOCK_DATA_INVENTORY.md](./06_FRONTEND_MOCK_DATA_INVENTORY.md) | Full mock-data census, per-screen swap-without-rewrite verdict |
| 07 | [07_FRONTEND_IAM_SECURITY_AUDIT.md](./07_FRONTEND_IAM_SECURITY_AUDIT.md) | Auth lifecycle, authorization matrix, routing, general security (XSS etc.) |
| 08 | [08_FRONTEND_PERFORMANCE_SCALABILITY_AUDIT.md](./08_FRONTEND_PERFORMANCE_SCALABILITY_AUDIT.md) | State management, TypeScript quality, forms, performance, scalability, deps |
| 09 | [09_FRONTEND_TESTING_AUDIT.md](./09_FRONTEND_TESTING_AUDIT.md) | Test inventory (zero), critical-flow coverage gaps, accessibility |
| 10 | [10_FRONTEND_DEAD_CODE_AUDIT.md](./10_FRONTEND_DEAD_CODE_AUDIT.md) | Unused/orphaned code, safe-to-delete vs needs-verification |
| 11 | [11_FRONTEND_DESIGN_SYSTEM_AUDIT.md](./11_FRONTEND_DESIGN_SYSTEM_AUDIT.md) | Design-system maturity, primitive/domain/page component tiers |
| 12 | [12_FRONTEND_BACKEND_CONTRACT_AUDIT.md](./12_FRONTEND_BACKEND_CONTRACT_AUDIT.md) | Backend contract ground truth, frontend/backend mismatches |
| 13 | [13_FRONTEND_REMEDIATION_ROADMAP.md](./13_FRONTEND_REMEDIATION_ROADMAP.md) | Phased remediation plan (Phase 0-8), files/complexity/risk per item |

## How to read this audit

- Every numbered finding across every document uses the same format: `ID / Severity / Category / Location / Problem / Evidence / Why it matters / Failure scenario / Affected users/features / Recommended direction / Implementation complexity / Regression risk / Dependencies / Status`.
- Severity: **P0** = security/data-loss/critical correctness blocker, **P1** = high-risk production/scalability/architecture issue, **P2** = meaningful technical debt, **P3** = low-risk cleanup.
- Status is one of: `CONFIRMED BUG`, `CONFIRMED SECURITY ISSUE`, `CONFIRMED ARCHITECTURAL VIOLATION`, `CONFIRMED DUPLICATION`, `CONFIRMED PERFORMANCE PROBLEM`, `ARCHITECTURAL RISK`, `UNVERIFIED / NEEDS TESTING`, or `TECHNICAL DEBT`. Nothing in this document set was marked a bug merely because it could theoretically become one — anything not directly confirmed in code is explicitly marked `UNVERIFIED` or `ARCHITECTURAL RISK` and says exactly what would need to be checked to confirm it.
- No benchmark numbers were fabricated. Where a real measurement was attempted (e.g. `npm run build`), the actual output is cited. Where a measurement couldn't be taken (the build currently fails before producing a bundle), the corresponding risk is explicitly classified `UNMEASURED RISK` rather than assigned an invented number.

## The one-paragraph version

The documented five-layer architecture (`app -> apps -> domains -> infrastructure -> shared`) is real and largely followed — this is not a codebase that needs a rewrite. What it needs is: two P0 security fixes (an unguarded admin inbox, a stored-XSS hole on the public forum) fixed immediately; a currently-broken production build fixed; several genuine but narrow instances of "two implementations coexisting instead of one being deleted after a migration" (UI primitives, HTTP clients, roadmap feature location, permission-check logic) resolved by picking a canonical version of each; the already-working React Query pattern (currently used in exactly 1 of 21 domains) extended to replace 77 sites of uncached manual fetching; and — the piece most relevant to the stated end goal — roughly 22-25 screens currently seeded from mock data, a meaningful fraction of which are one wiring change away from the real backend service that already exists and works, with the harder remainder needing either component restructuring (mock data entangled directly in a page component) or new backend endpoints (leaderboard, achievements) before a swap is even possible. None of this requires a new state library, micro-frontends, or abandoning the current stack.

## Scorecard (see 01 for full basis)

| Dimension | Score /10 |
|---|---|
| Overall Architecture | 7 |
| Production Readiness | 3 |
| Scalability | 5 |
| Security | 4 |
| Maintainability | 5 |
| Testing Maturity | 0 |
| API Integration Readiness | 6 |

## What this audit could not fully verify (be aware before acting)

- **CONTRACT-03**: a field-by-field diff of every frontend TypeScript status/enum type against the (sometimes internally inconsistent) backend enums was scoped but not exhaustively completed — flagged as the first item for any follow-up pass.
- Several security checks in Part 4 of the IAM/security audit (open redirects, iframe/postMessage usage, third-party script loading, file-upload validation) were not exhaustively swept — no issues were incidentally encountered during the auth/console/studio review that produced the confirmed findings, but "not incidentally encountered" is not the same as "confirmed absent."
- Color-contrast accessibility analysis requires rendering and measuring actual computed colors, out of scope for a static code audit — not performed, not fabricated.
- Bundle-size numbers are unmeasured because the production build currently fails type-checking before producing output (see `PERF-005`); fix that first, then measure.
- One sub-finding (`IAM-006`, channel-scope re-verification across sub-components after a client-side channel switch without full remount) is explicitly flagged as needing live/manual testing rather than static analysis.

## Process note

This audit was conducted by five parallel research passes (inventory/architecture/structure/dead-code; duplication/design-system; API/mock-data/backend-contract; auth/IAM/security/routing; state/performance/testing) plus this synthesis pass. All twelve numbered documents plus this index and the inventory were produced from direct source inspection (`Read`, `Grep`, `Glob`, and — for the one build-status claim in this set — an actual `npm run build` run), not from assumptions about what a typical Next.js app "usually" looks like. Two of the twelve documents (05, 06) plus this synthesis and 12/13 were completed in a follow-up pass after the original parallel agents hit a session usage limit mid-run; the underlying research for all of them had already completed and was preserved before the limit hit, so no research was re-done or guessed at — only the final write-up step was completed afterward.
