# 05 — Frontend API Integration Audit

Scope: `E:\arcade\ui`. Cross-referenced against the backend contract extraction in [12_FRONTEND_BACKEND_CONTRACT_AUDIT.md](./12_FRONTEND_BACKEND_CONTRACT_AUDIT.md). Audit only — no wiring changes made.

## Summary

The frontend has one designated central HTTP client (`infrastructure/http/api.ts`), and the 20 domain `api/*.ts` modules genuinely route through it — that part of the architecture is sound. But it is undermined by three separate, uncoordinated parallel mechanisms: a second full HTTP stack (axios-based `AuthService`), a third dead/orphaned token-storage scheme, and a fourth WebSocket-URL-resolution duplication. On top of that, endpoint prefixing is inconsistent — but investigation against the actual backend (see 12) shows roughly half of that inconsistency is inherited from the backend itself (which is not uniformly `/api/v1`), not invented by the frontend. React Query is used in exactly one domain (`community/forum`); everywhere else is manual `useEffect`+`useState`+fetch with no shared caching/loading/error convention.

## Findings

### ID: API-01
Severity: P1
Category: Architecture / Duplication
Location: `infrastructure/http/api.ts` (canonical client) vs `infrastructure/auth/auth.service.ts:1-82`
Problem: Two independent HTTP stacks exist for the same backend. `api.ts` is fetch-based with Bearer-token injection, single-flight 401→refresh→retry-once logic, and a custom `ApiError` shape. `AuthService` is axios-based, used for every auth operation (login/logout/refresh/register/password reset/email verify), and has its own independent refresh-dedup (`refreshPromise`). `api.ts` itself imports `AuthService` to perform its own refresh (`api.ts:23,46`), and `AuthInitializer.tsx:6` calls `AuthService.refresh()` directly on every route mount.
Evidence: `infrastructure/auth/auth.service.ts` uses `axios` directly for all 8 auth operations; different header conventions (`X-Requested-With`/`withCredentials` in axios calls vs Bearer-only in `api.ts`); different error shapes (axios `.response.status` vs `ApiError.status`).
Why it matters: Two parallel retry/error-normalization implementations mean a fix (e.g. a new global error toast, a new auth header) has to be applied twice and will silently drift.
Failure scenario: A future change to refresh-token handling is made in `api.ts` but not `auth.service.ts` (or vice versa); auth silently breaks for one of the two call paths while tests against the other path keep passing.
Affected users/features: All authenticated traffic (both stacks are on the hot path for every session).
Recommended direction: Consolidate on one HTTP client. Given `api.ts` already owns the retry/refresh contract used by every domain module, migrate `AuthService`'s operations onto `api.ts` and delete the axios dependency for this purpose.
Implementation complexity: Medium — touches the most security-sensitive code path, needs careful testing of the refresh flow.
Regression risk: Medium-high (auth flow).
Dependencies: None blocking; should happen before deeper API-layer work in later phases.
Status: CONFIRMED ARCHITECTURAL VIOLATION

### ID: API-02
Severity: P2
Category: Correctness
Location: `infrastructure/state/queryClient.ts:14`
Problem: `(error as any)?.response?.status === 401 || ... === 403` is used to decide whether to skip retries. This is an axios-error shape check. The app's primary client (`api.ts`) throws `ApiError` with a top-level `.status`, not `.response.status`. For any query/mutation whose error originates from `api.ts` (the vast majority), this check can never match, so 401/403 responses get retried up to 3 times instead of failing fast.
Evidence: `api.ts`'s `ApiError` class exposes `.status` directly (`api.ts:30-37`); no `.response` property exists on it.
Why it matters: Wasted requests on every genuine auth failure, and a misleading appearance that "401 handling is not being retried" when it actually is.
Failure scenario: A user's session expires mid-page; instead of an immediate redirect-to-login, the app hammers the expired-token endpoint 3 times before finally giving up.
Affected users/features: Any React Query-based fetch (currently: `community/forum` only, but this bug will resurface for every future feature area migrated onto react-query).
Recommended direction: Change the check to match `ApiError.status` (or normalize both client shapes into one error type first, see API-01).
Implementation complexity: Trivial once API-01 or a shared error type exists.
Regression risk: Low.
Dependencies: Cleaner once client consolidation (API-01) happens.
Status: CONFIRMED BUG

### ID: API-03
Severity: P1
Category: Consistency
Location: 20 domain `api/*.ts` files under `domains/*`
Problem: Endpoint prefix is inconsistent across domains: roughly half use `/api/v1/...` (channels, enrollment, identity, notifications, organizations, payment, publishing/creator), the other half use bare `/api/...` with no version segment (learning/delivery, publishing/platformReview, badges, assessments, roadmaps), and `community/forum` uses bare `/forum/...` with neither `/api` nor `/v1`. `domains/roadmaps/services/roadmap.ts` mixes both conventions in the same file (line 5 `/api/roadmaps` vs line 6 `/api/v1/public/roadmaps`).
Evidence: See file-by-file table gathered during investigation (available on request); cross-checked against backend controllers in section 12 — the backend itself is genuinely split this way (studio/learning/enrollment/event controllers use bare `/api/...`; identity/platform/payment/notification use `/api/v1/...`).
Why it matters: Because the split partially mirrors a real backend split, blanket "always prefix with /api/v1" fixes would break the bare-`/api` domains. Any refactor of the HTTP client's base-URL handling needs per-domain awareness, not a single global rewrite.
Failure scenario: A future engineer "fixes" the inconsistency by hardcoding `/api/v1` into the client's base URL, silently breaking every studio/learning/enrollment/event/roadmap call.
Affected users/features: Course authoring, learning delivery, enrollment, roadmaps, platform review — a large surface.
Recommended direction: Do not "fix" this in the frontend alone. Document the split explicitly (this audit does), and treat any prefix unification as a joint frontend+backend decision, not a frontend-only cleanup.
Implementation complexity: N/A for the frontend alone — cross-team.
Regression risk: High if attempted unilaterally.
Dependencies: Backend team alignment.
Status: CONFIRMED ARCHITECTURAL VIOLATION (partially inherited from backend — see 12)

### ID: API-04
Severity: P2
Category: Duplication
Location: 6 files: `app/(authenticated)/console/exam-schedules/page.tsx:12-22`, `app/(authenticated)/console/iam/UsersList.tsx:23-33`, `app/(authenticated)/profile/page.tsx:926`, `app/(onboarding)/onboarding/page.tsx:60`, `app/(public)/[username]/page.tsx:635`, `apps/learner/layout/LearnerNavbar.tsx:152`
Problem: `getAvatarUrl` is independently re-implemented 6 times, each redeclaring the same `http://localhost:8080/api/v1` fallback and the same `/api/v1/` string-stripping logic.
Evidence: Identical function bodies across the 6 locations (grep-confirmed).
Why it matters: A change to avatar URL resolution (e.g. moving to a CDN, changing the storage path scheme) has to be made 6 times, and inevitably will be missed in at least one.
Recommended direction: Extract to a single shared helper in `infrastructure/` or `shared/`.
Implementation complexity: Trivial.
Regression risk: Low.
Dependencies: None.
Status: CONFIRMED DUPLICATION

### ID: API-05
Severity: P1
Category: Configuration hygiene
Location: `infrastructure/http/api.ts:26` (`"http://localhost:8080"`), `app/api/internal/auth/{login,logout,refresh}/route.ts:4` (`'http://127.0.0.1:8080/api/v1'`), `infrastructure/auth/auth.service.ts:16,51,57,63,69,78` (`'http://localhost:8080/api/v1'`)
Problem: Three different hardcoded fallback base-URL literals for what should be a single backend origin — different host (`localhost` vs `127.0.0.1`) and different path suffix (with/without `/api/v1`) across the three.
Evidence: Direct string literals at the cited locations.
Why it matters: In an environment where `NEXT_PUBLIC_API_URL` (or equivalent) is unset, these three fall back to three different targets, which will silently misbehave in dev/preview environments and mask misconfiguration.
Failure scenario: A missing env var in a preview deployment causes auth calls to go to one host while domain-data calls go to another, producing confusing partial-failure symptoms (e.g. login works but every subsequent call 401s or CORS-fails).
Recommended direction: Centralize the backend base URL (and its fallback) in one config module; all HTTP layers import from it.
Implementation complexity: Small.
Regression risk: Low.
Dependencies: Pairs naturally with API-01 consolidation.
Status: CONFIRMED DUPLICATION

### ID: API-06
Severity: P2
Category: Configuration hygiene / duplication
Location: `domains/community/hooks/useWebSocket.ts:51`, `infrastructure/websocket/useWebSocket.ts:58` (both fall back to `'http://localhost:8080'` for `NEXT_PUBLIC_WS_URL`), `domains/learning/components/TimeTracker.tsx:17` (hardcodes `'ws://localhost:8080/ws'` with **no env override at all**)
Problem: A fourth HTTP/WS-client concern — WebSocket broker URL resolution — is duplicated across two files, and a third file bypasses env configuration entirely.
Evidence: As cited.
Why it matters: `TimeTracker.tsx` will silently point at localhost in every non-local environment (staging, production) since it has no env-var path at all — this is a functional bug waiting to surface the moment the app is deployed anywhere but a developer's machine.
Failure scenario: Deployed build's time-tracking feature (or whatever `TimeTracker` drives) tries to open a WebSocket to `ws://localhost:8080/ws` from a production browser and fails silently or errors in console, with no user-visible explanation.
Recommended direction: Centralize WS URL resolution alongside the HTTP base-URL config (API-05); fix `TimeTracker.tsx` to use it.
Implementation complexity: Small.
Regression risk: Low, but `TimeTracker.tsx` fix should be verified against a real deployed environment since local dev will mask the bug.
Dependencies: None.
Status: CONFIRMED BUG (TimeTracker.tsx specifically); CONFIRMED DUPLICATION (the two useWebSocket files)

### ID: API-07
Severity: P0
Category: Security
Location: `apps/public/orchestrators/AuthOrchestrator.tsx:171`
Problem: OAuth redirect target is a hardcoded literal: `window.location.href = 'http://localhost:8080/oauth2/authorization/google'` — not env-driven.
Evidence: As cited.
Why it matters: Google OAuth login is completely broken in every non-local environment; also a hardcoded plaintext (non-HTTPS) URL is a red flag if it ever executes against a real deployment.
Failure scenario: In production, clicking "Sign in with Google" sends the browser to `localhost:8080`, which will simply fail to connect for any real user.
Recommended direction: Route through the same centralized backend-origin config as API-05, using `https://` in non-local environments.
Implementation complexity: Trivial.
Regression risk: Low.
Dependencies: None — should be fixed independent of the larger consolidation, since it is a functional blocker for OAuth login outside local dev.
Status: CONFIRMED BUG

### ID: API-08
Severity: P2
Category: Correctness / dead code interaction
Location: `infrastructure/organizations` — `domains/organizations/api/organization.service.ts:98-102` (`uploadLogo`)
Problem: Explicitly sets `headers: {'Content-Type': 'multipart/form-data'}` for a `FormData` body, but `api.ts:91-93` unconditionally strips `Content-Type` whenever the body `instanceof FormData` (correct behavior — the browser must set the boundary itself). The explicit header is currently harmless (gets stripped) but is misleading and would break multipart uploads if the strip logic is ever refactored without noticing this call site depends on it.
Evidence: As cited.
Recommended direction: Remove the redundant explicit header at the call site.
Implementation complexity: Trivial.
Regression risk: Low.
Dependencies: None.
Status: TECHNICAL DEBT

### ID: API-09
Severity: P0
Category: Security
Location: `app/api/internal/media/upload/route.ts`
Problem: This Next.js BFF route proxies a client-supplied `uploadUrl` for a server-side PUT, with no allowlist/validation of the target host — it accepts any URL from the form body.
Evidence: Route handler forwards the caller-supplied `uploadUrl` directly to `fetch(uploadUrl, {method:'PUT', ...})` server-side.
Why it matters: This is an SSRF-shaped surface — a server-side request driven entirely by client-controlled input. Currently presumably fed only by trusted presign responses from `api.post('/api/media/presign', …)`, but the route itself does not enforce that origin.
Failure scenario: If any code path (or a compromised/malicious client) can supply an arbitrary `uploadUrl`, the Next.js server will make a same-origin-privileged outbound request to it (e.g. to an internal service, or to exfiltrate server-side bytes to an attacker-controlled host).
Recommended direction: Validate `uploadUrl` against an allowlist of the storage provider's domain(s) before proxying.
Implementation complexity: Small.
Regression risk: Low.
Dependencies: None.
Status: ARCHITECTURAL RISK (not confirmed exploitable without knowing whether any untrusted input can reach this route — flagged P0 because SSRF-shaped surfaces are cheap to fix and expensive to leave)

### ID: API-10
Severity: P3
Category: Dead code
Location: `infrastructure/auth/auth.ts` (`getAccessToken`/`getRefreshToken`/`setTokens`/`clearTokens`/`isAuthenticated`, raw localStorage keys `"arcade-access-token"`/`"arcade-refresh-token"`), consumed only by `apps/core/components/AuthGuard.tsx`
Problem: A third, orphaned token-storage scheme exists, distinct from the real one (Zustand `persist` under key `"arcade-auth-storage"`, read by `api.ts:59-74`). `setTokens`/`clearTokens` are never called anywhere in the repo. `AuthGuard.tsx` (its only consumer) is itself never imported anywhere — fully dead.
Evidence: Grep-confirmed no other references to `setTokens`/`clearTokens`/`AuthGuard`.
Why it matters: Currently inert, but if `AuthGuard` were ever reintroduced (e.g. copy-pasted into a new route as a "guard component" without checking it's stale), it would always report "not authenticated" since nothing ever populates its storage keys — a silent, hard-to-diagnose auth bug.
Recommended direction: Delete both `auth.ts` (the orphaned scheme) and `AuthGuard.tsx` — confirmed unreferenced.
Implementation complexity: Trivial.
Regression risk: None (dead code).
Dependencies: None.
Status: CONFIRMED DUPLICATION / SAFE TO DELETE (cross-reference [10_FRONTEND_DEAD_CODE_AUDIT.md](./10_FRONTEND_DEAD_CODE_AUDIT.md))

## Data-fetching pattern coverage

- **React Query (`@tanstack/react-query`)**: used in exactly one domain — `domains/community/api/forum.queries.ts` (12 query hooks, 12 mutation hooks, a `forumKeys` cache-key registry, invalidation on mutation success). This is the only place in the app with a coherent caching/invalidation story.
- **Manual `useEffect`+`useState`+fetch**: confirmed in 26+ files across `apps/core`, `apps/creator`, `apps/learner`, `apps/public`, and several `domains/*` components — no shared caching, no consistent loading/error convention, no invalidation-after-mutation pattern. See [08_FRONTEND_PERFORMANCE_SCALABILITY_AUDIT.md](./08_FRONTEND_PERFORMANCE_SCALABILITY_AUDIT.md) for the state-ownership recommendation.
- `infrastructure/state/queryClient.ts` defines a `QUERY_KEYS` registry that is barely used — only `profile`/`organizations`/`sessions` keys are defined, none of which match any actual `useQuery` call found in the codebase. This is aspirational/unfinished scaffolding, not an active pattern.

## `app/api/internal/*` BFF routes (Next.js route handlers)

- `auth/login`, `auth/logout`, `auth/refresh` — correctly proxy to the backend and set `refreshToken` as an HttpOnly cookie (rotated on refresh). CSRF check via `X-Requested-With` header is present on `logout` and `refresh` but **not on `login`** — likely intentional (login is the one legitimately unauthenticated route) but it diverges from its siblings and is worth an explicit comment if kept.
- `media/upload` — see API-09 above.
- All three auth routes duplicate the `BACKEND_URL` fallback constant identically rather than sharing one config module (part of API-05).

## Raw `fetch()` usage outside `api.ts` — reviewed, mostly legitimate

11 sites total. Confirmed legitimate: two calls to the internal media-upload BFF route, one direct-to-storage presigned-URL PUT (`infrastructure/media/upload.ts:39`, correct by design), one external Google Fonts stylesheet fetch (`components/landing/CircularGallery.tsx:54`), one DOCX-export image fetch from a caller-supplied URL (`apps/creator/editor/lib/exportDocx.ts:70`). One false positive: `features/roadmap/renderer/components/RoadmapViewer.tsx:947` — a `fetch(...)` call that only ever appears inside a hardcoded example-code string literal shown to learners, never executed.

## Swap-without-UI-rewrite verdict

See [06_FRONTEND_MOCK_DATA_INVENTORY.md](./06_FRONTEND_MOCK_DATA_INVENTORY.md) for the per-feature-area verdict on whether mock data can be swapped for a real API call without rewriting the UI. Short version: the 20 domain `api/*.ts` files themselves are a clean boundary (data-layer files are real, well-formed, and go through the central client) — the problem is almost entirely at the *page/component* level, where a large minority of screens bypass the existing clean data layer entirely and seed `useState` from an inline literal array instead.
