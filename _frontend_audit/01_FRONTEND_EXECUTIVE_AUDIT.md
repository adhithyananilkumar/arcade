# 01 — Frontend Executive Audit

Scope: `E:\arcade\ui` (Next.js/React, 624 TS/TSX source files), cross-referenced against `E:\arcade\backend`. This document synthesizes findings from the 12 supporting audit documents in this folder. Audit only — nothing in the codebase was changed to produce this report.

## Headline verdict

**The architecture is not the problem — the entanglement between UI and data is.** [02_FRONTEND_ARCHITECTURE.md](./02_FRONTEND_ARCHITECTURE.md) confirms the documented five-layer model (`app -> apps -> domains -> infrastructure -> shared`) is real and mostly followed, not aspirational fiction: no domains-import-apps violations, no infrastructure-imports-domains violations were found. The problems that exist are concentrated, nameable, and fixable without a rewrite:

1. **Two or three parallel implementations of the same concern**, coexisting instead of one being deleted after a migration (UI primitives, HTTP clients, auth/token storage, permission checks, roadmap feature location).
2. **A large minority of screens bypass the app's own clean data layer**, seeding `useState` from inline mock arrays instead of calling the real, working domain API that in several cases already exists one file away.
3. **Zero automated test coverage**, on an app whose highest-severity confirmed bugs (an unguarded admin inbox, a stored-XSS hole) are exactly the kind unit/integration tests exist to catch.
4. **The production build currently fails type-checking** — a confirmed, present-tense fact, not a risk.

None of this requires a new state-management library, a rewrite, or micro-frontends. It requires finishing migrations that were already started (the CLAUDE.md's own "Version 1.0 STABLE" framing plus the presence of both old and new versions of several subsystems strongly suggests in-flight migrations that were never completed / cleaned up) and closing two real security holes.

## Two confirmed P0 security issues — fix before anything else

1. **`/console/inbox` is unguarded on both frontend and backend.** The backend's `ContactMessageController` gates every handler with only `@PreAuthorize("isAuthenticated()")` despite Javadoc explicitly calling it an "Admin endpoint" — any logged-in learner can read, modify, and delete the platform's entire contact-message and content-abuse-report queue. The frontend adds no guard of its own. This is a genuine broken-access-control bug reachable today by any account. (`IAM-003`, [07_FRONTEND_IAM_SECURITY_AUDIT.md](./07_FRONTEND_IAM_SECURITY_AUDIT.md))
2. **Stored XSS on the public forum.** Post/comment bodies render via `dangerouslySetInnerHTML`, "sanitized" only by a regex that strips `<script>` tags — trivially bypassed by `<img onerror=...>` or dozens of other vectors, on a page reachable by anyone including admins. Combined with the access token being persisted to plaintext `localStorage`, this is a realistic full-session-hijack path, not a theoretical one. (`XSS-001` + `AUTH-002`, same document)

Both are cheap to fix (a real sanitizer library; a real permission check) relative to their blast radius. Neither requires architectural change.

## Scorecard

| Dimension | Score /10 | Basis |
|---|---|---|
| Overall Architecture | 7 | Layering is real and mostly enforced; deductions for unresolved parallel-scheme duplication (see below), not for the model itself |
| Production Readiness | 3 | Build currently fails type-check; two P0 security holes open; ~22-25 screens are fully or partially fake |
| Scalability | 5 | No confirmed collapse point, but the state-management pattern (77 independent fetch sites, react-query configured but used in 1 domain) will not scale gracefully as request volume grows — fixable without a new library |
| Security | 4 | Two confirmed P0s (broken access control, stored XSS); backend-side method-level authorization is the exception rather than the rule across most feature areas, which the frontend audit correctly treats as a shared risk, not solely a frontend defect |
| Maintainability | 5 | 53 files over 500 lines, 13 over 1000; 403 `any`/`as any` occurrences; but the underlying domain-service layer is clean, which makes maintainability recoverable rather than structurally capped |
| Testing Maturity | 0 | Zero automated tests of any kind, no test runner configured, on a codebase whose confirmed P0 bugs are exactly what tests exist to catch |
| API Integration Readiness | 6 | 20 of 21 domains have a real, working API layer routed through a single canonical HTTP client — the foundation is genuinely close to backend-ready; undermined by a second parallel HTTP stack and inconsistent caching discipline |

## Mock-data dependency assessment

Roughly **22-25 distinct screens/sections** carry genuine mock data driving a real authenticated view — concentrated almost entirely in: the 9 channel-management deep-dive tabs, the full-page Notifications view, Leaderboard, Achievements, parts of the course-learn page, Studio's learner-analytics tab, and Settings→Security's session list. This sounds larger than it is architecturally: **the domain/service layer itself (20 of 21 domains) is real and already calls the backend correctly.** The fakeness lives almost entirely at the page/component level, where a subset of screens skip the existing data layer and seed local state from a literal array instead — in at least two cases (Notifications, Settings→Security sessions) the real backend service or endpoint the screen needs *already exists and is simply not being called*. See [06_FRONTEND_MOCK_DATA_INVENTORY.md](./06_FRONTEND_MOCK_DATA_INVENTORY.md) for the full per-screen swap-difficulty verdict.

## Top 20 issues (all severities, ranked)

1. **P0** — `/console/inbox` unguarded, backend and frontend both (`IAM-003`)
2. **P0** — Stored XSS on public forum via incomplete `<script>`-tag regex "sanitization" (`XSS-001`)
3. **P1** — Production build fails type-check (`npm run build`, missing `@types/canvas-confetti`) (`PERF-005`)
4. **P1** — Six of nine frontend permission checks reference backend permission codes that don't exist, permanently locking `PLATFORM_ADMIN`/`FINANCE`/`REVIEWER` out of Console sections they're designed to access (`IAM-001`, `IAM-002`)
5. **P1** — Two independent HTTP client stacks (`api.ts` fetch-based, `auth.service.ts` axios-based) with divergent error shapes and retry logic (`API-01`)
6. **P1** — No shared server-state cache: 77 independent `useEffect`+fetch sites vs. react-query used in exactly 1 of 21 domains despite being fully configured (`STATE-001`)
7. **P1** — Two competing UI-primitive folders (`components/ui/` vs `shared/design-system/ui/`), with the shadcn generator config pointed at the legacy one (`STRUCT-003`, `04-DUP`)
8. **P1** — 9 channel-management analytics tabs fully mock-seeded despite a working real orchestration shell one level above them, and in one case despite the exact backing service already existing and being used by a sibling component (`MOCK-01`)
9. **P1** — Zero automated tests of any kind on a codebase with confirmed P0 security bugs (`TEST-000`)
10. **P2** — Access token persisted to plaintext localStorage, escalating any XSS to full session hijack (`AUTH-002`)
11. **P2** — Notifications full page and Settings→Security sessions both fake despite the real backend service/endpoint already existing and being callable with minimal effort (`MOCK-02`)
12. **P2** — No `middleware.ts`; all authenticated-route protection is client-side only, shipping full admin-page markup/JS to unauthenticated requests before a client redirect fires (`ROUTE-001`)
13. **P2** — Authorization logic implemented three different ways (central service, a hook reimplementing the same check, and 4x copy-pasted `role === 'ADMIN'`-style string blocks across 2 files) (`IAM-005`, `04-DUP`)
14. **P2** — 403 total `any`/`as any` occurrences eroding TypeScript's guarantees across the codebase (`TS-001/002`)
15. **P2** — Roadmap feature exists in two parallel locations (`features/roadmap` vs `domains/roadmaps`) (`STRUCT-004`)
16. **P2** — `lib/utils.ts` (shadcn default) vs `shared/utils/utils.ts` (real project convention) — new shadcn-generated components silently target the wrong location (`STRUCT-002`)
17. **P2** — Six independent copies of the same `getAvatarUrl` helper, each with its own hardcoded fallback URL (`API-04`)
18. **P2** — Three different hardcoded backend base-URL literals across the HTTP/auth/BFF layers (`API-05`)
19. **P2** — Backend itself: refresh-token transport differs by login method (body vs. HttpOnly cookie) with a cookie maxAge that doesn't match the token's real expiry (`CONTRACT-02`)
20. **P3** — Hardcoded OAuth redirect to `localhost:8080`, breaking Google login in every non-local environment (`API-07`)

## Top 10 architectural decisions required (product/eng leadership, not auto-applied)

1. Which UI-primitive folder is canonical (`components/ui/` or `shared/design-system/ui/`) — and fix `components.json` to match.
2. Which roadmap implementation is canonical (`features/roadmap` or `domains/roadmaps`) — delete the other.
3. Whether the missing IAM permission codes (`platform.users.manage`, `platform.roles.assign`, `platform.permissions.manage`, `platform.categories.manage`, `platform.audit.view`, a real payments-view permission) should be added to the backend seed, or whether the frontend should be re-gated onto existing real permissions.
4. Whether `AuthService`'s axios stack should be merged into the canonical `api.ts` fetch client, or vice versa.
5. Whether React Query should become the default data-fetching pattern app-wide (recommended, given it's already configured and working in one domain) or whether the manual-fetch pattern is intentionally preferred elsewhere.
6. Whether the backend's own `/api/v1` vs bare `/api` prefix split should be unified — this is a backend decision the frontend cannot resolve unilaterally.
7. Whether the access token should move out of persisted localStorage into memory-only storage (recommended, pairs with the XSS fix).
8. Whether `middleware.ts`-based route gating should be added as defense-in-depth on top of the existing (correct-in-principle) client-side guards.
9. Product decision on which permission should gate `/console/inbox` once the backend authorization gap is closed.
10. Whether the two stray `.patch` files and the `.claude/worktrees/` duplicate-repo copy at the `ui/` root are intentional or should be cleaned up.

## Top 10 duplication problems

See [04_FRONTEND_DUPLICATION_AUDIT.md](./04_FRONTEND_DUPLICATION_AUDIT.md) for full detail. Headline five: two UI-primitive folders; authorization logic implemented three ways; two HTTP mechanisms inside `infrastructure/` itself (a below-the-boundary violation per the project's own CLAUDE.md); no shared date-formatting utility despite 5+ near-identical local implementations; EmptyState/Skeleton components reinvented per-domain despite a real design-system folder existing to hold them. Areas that looked suspicious but turned out clean: toast/notification usage (single disciplined `sonner` instance), drag-and-drop, and state-management library choice.

## Top 10 security problems

See [07_FRONTEND_IAM_SECURITY_AUDIT.md](./07_FRONTEND_IAM_SECURITY_AUDIT.md) for full detail, and [12_FRONTEND_BACKEND_CONTRACT_AUDIT.md](./12_FRONTEND_BACKEND_CONTRACT_AUDIT.md) for backend-side facts that bear on frontend risk. Headline: unguarded console inbox (P0); stored XSS on public forum (P0); plaintext-localStorage access token (P2, escalated by the XSS); six frontend permission checks referencing nonexistent backend permission codes (P1); no `middleware.ts` defense-in-depth; a stray dev-only route (`/dev-editor-perf`) with no guard or environment check; an SSRF-shaped surface in the internal media-upload BFF route that proxies a client-supplied URL with no allowlist; backend's global error handler leaking full stack traces into error JSON in dev-mode config; hardcoded/guessed admin-role-name string lists that don't match real backend role codes (cosmetic, but demonstrates the exact anti-pattern the audit was asked to check for); most backend endpoints outside review/approve workflows carry no method-level `@PreAuthorize` at all, relying solely on the blanket "authenticated" filter — a fact the frontend cannot compensate for and should not be asked to.

## Top 10 scalability risks

See [08_FRONTEND_PERFORMANCE_SCALABILITY_AUDIT.md](./08_FRONTEND_PERFORMANCE_SCALABILITY_AUDIT.md). The single biggest **confirmed** risk is the absence of a shared server-state cache — 77 independent `useEffect`+`api.get` call sites with no dedup, while react-query is fully configured and used in exactly one domain. This single fix (extending the working forum pattern to other domains) would simultaneously reduce backend request volume, fix stale-data-after-mutation bugs, and unblock several correctness issues that currently ride on ad hoc local state. Other risks — unpaginated/unvirtualized catalog lists, heavy eagerly-imported editor libraries (tiptap/excalidraw/mermaid/konva), realtime/collaboration fan-out under concurrent editing — are real but classified as ARCHITECTURAL RISK or UNMEASURED RISK rather than confirmed, because the production build currently fails before it can produce real bundle-size numbers to measure against.

## Top 10 testing gaps

See [09_FRONTEND_TESTING_AUDIT.md](./09_FRONTEND_TESTING_AUDIT.md). There are zero automated tests of any kind — no unit, component, integration, E2E, accessibility, or visual regression tests, and no test runner configured in `package.json`. Nine business-critical flows were identified with zero coverage, prioritized: authentication/token-refresh race conditions, authorization/Platform Console access, content publishing, review workflow, enrollment, exams, roadmap collaboration, notifications, and payments (lowest priority — flow location not conclusively confirmed in this pass). Accessibility specifically: at least 2 sampled custom modals bypass the project's own accessible dialog primitive entirely (no ARIA, no focus trap, no Escape handling); 33 `<div onClick>` sites need a keyboard-accessibility sweep; `aria-label` usage is sparse relative to codebase size.

## Recommended target folder/module architecture

No wholesale re-architecture is warranted — this is the audit's most important structural conclusion. The documented `app -> apps -> domains -> infrastructure -> shared` model is sound and largely already followed. The fix list is narrow:

1. Give `enrollment` and `iam` domains public `index.ts` barrel files (unblocks deep-import cleanup elsewhere).
2. Resolve `components/` vs `apps/public/components/` and `features/roadmap` vs `domains/roadmaps` — pick one per pair, delete the other, update `docs/architecture/repository-map.md` to match reality.
3. Break the payment/enrollment circular dependency via an orchestrator-level coordination point in `apps/`.
4. Treat `app/(authenticated)` as the top refactor priority once backend wiring begins — it is simultaneously the largest, most-churned, and most rule-violating directory (God components mixing API calls, state, business logic, and rendering) — every hour spent extracting its logic into `apps/` orchestrators pays for itself on the next touch.

## Recommended implementation order

See [13_FRONTEND_REMEDIATION_ROADMAP.md](./13_FRONTEND_REMEDIATION_ROADMAP.md) for the full phased plan with files, dependencies, and complexity per phase. In one line: fix the build and the two P0 security holes first (days, not weeks); then close the permission-code mismatch and consolidate the two HTTP stacks; then resolve the named duplications (UI primitives, roadmap location, utils location); then extend the React Query pattern app-wide; then start swapping mock data for real calls, prioritizing the screens where the real backend service already exists (Notifications, Settings→Security sessions, most channel-manage tabs) over the screens needing new backend endpoints (Leaderboard, Achievements).

## Explicit list of things that should NOT be changed

- The five-layer dependency direction (`app -> apps -> domains -> infrastructure -> shared`) — it's real, mostly enforced, and correct as designed.
- The choice of zustand for client state and react-query for server state — the pairing is standard and correct; the problem is react-query's *under-use*, not the wrong tool being chosen.
- The domain/service API layer's use of a single canonical `api.ts` client — 20 of 21 domains already do this correctly; extend the pattern, don't replace it.
- The narrow, per-tool choices for canvas/diagram libraries (`@xyflow/react`+`dagre` for flow graphs, `mermaid` for rendered diagram markup, distinct from `excalidraw`/`konva`) — investigated and found to be legitimately different tools for different jobs, not redundant.
- No micro-frontends, no new state-management library, no framework migration — nothing in this audit surfaced evidence that the current stack (Next.js App Router, React 19, zustand, react-query) cannot scale with the fixes above.

## Explicit list of things that MUST be changed before production

1. Fix the failing production build (`npm run build` currently fails type-check).
2. Fix `/console/inbox` authorization (backend AND frontend).
3. Fix the forum stored-XSS hole (real HTML sanitizer, not a regex).
4. Move the access token out of persisted localStorage into memory-only storage.
5. Resolve the six nonexistent-permission-code frontend gates that lock real backend roles (`PLATFORM_ADMIN`, `FINANCE`, `REVIEWER`) out of Console sections they're supposed to have.
6. Stand up at least minimal automated test coverage on the authentication/refresh flow and the authorization matrix, given both currently host confirmed P0 bugs and have zero regression protection.
7. Confirm (and fix if needed) the SSRF-shaped surface in the internal media-upload BFF route.
8. Gate or remove the unguarded `/dev-editor-perf` route before any production deploy.
