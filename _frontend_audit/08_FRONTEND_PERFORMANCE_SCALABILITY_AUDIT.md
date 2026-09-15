# 08 — Frontend Performance, State Management, Type Safety & Scalability Audit

Scope: `E:\arcade\ui` (Next.js 16 / App Router, React 19, zustand, @tanstack/react-query, axios/fetch, zod, tiptap/excalidraw/konva/mermaid/gsap/framer-motion). Audit-only, no source files modified. All findings below are grounded in direct grep/read evidence from the working tree (the `.claude/worktrees/**` mirror directory was excluded from all searches to avoid double-counting).

---

## 0. Method note

- Counts were produced with `grep -r` across `app/, apps/, components/, domains/, features/, shared/, infrastructure/, lib/` excluding `node_modules` and `.claude/worktrees`.
- One real build was executed: `npm run build` (Next.js 16.2.10, Turbopack). Result and output are quoted verbatim in §4.4 — this is the only place a "number" is cited, and it is a real compiler/build result, not an estimate.
- Everything else is qualitative/structural analysis of real code, not synthetic benchmarking.

---

## 1. State Management Audit

### 1.1 Inventory of state mechanisms found

| Mechanism | Where | Real usage found |
|---|---|---|
| `useState`/`useReducer` | ~1,390 `useState` call sites across `.tsx` files | Overwhelmingly used for server data (`courses`, `categories`, `loading`, `error`), not just local UI state |
| `useEffect` | ~486 call sites | Majority pattern is "fetch on mount via `api.get`, setState the result" — i.e. hand-rolled data fetching |
| React Context (`createContext`) | 8 files: `IntroProvider`, `ForumLayoutContext`, `BadgePanels`, `InteractionContext`, `RoadmapStore` (domains/roadmaps), `RoadmapViewer` (features/roadmap), `BlockStateContext`, `dock.tsx` | Mostly narrow, feature-scoped UI context (editor block state, roadmap viewer state, intro/onboarding flags) — not overused globally |
| zustand stores | 6 stores: `infrastructure/auth/auth.store.ts`, `infrastructure/state/theme.store.ts`, `features/roadmap/renderer/store/useRoadmapViewerStore.ts`, `domains/iam/store/policy-editor.store.ts`, `domains/community/store/forum.store.ts`, `apps/creator/editor/lib/uploadQueueStore.ts` | See 1.2 — `auth.store.ts` mixes client session state with cached server data |
| react-query (`useQuery`/`useMutation`/`useInfiniteQuery`) | **Only 1 file**: `domains/community/api/forum.queries.ts` | Provider (`QueryClientProvider`) is wired up in `apps/core/Providers.tsx` and `infrastructure/state/queryClient.ts` defines only 3 query keys (`profile`, `organizations`, `sessions`) — but essentially nothing in the app actually calls `useQuery` |
| Raw server-state fetching outside react-query | `infrastructure/http/api.ts` (`api.get/post/put/patch/delete`, a thin fetch wrapper) is called directly from **77 files** across `app/`, `apps/`, `domains/` | This is the dominant server-data-fetching pattern in the whole codebase |
| URL state (`useSearchParams`/route params) | Present but only used incidentally (e.g. filter panels), not treated as a systematic state layer | Many list/filter UIs use local `useState` instead of URL state, which loses shareable/bookmarkable filter state and resets on navigation |
| `localStorage`/`sessionStorage` | 9 files use `localStorage.*`, 4 use `sessionStorage.*` | Notably `auth.store.ts` persists the full user object + **access token** to `localStorage` via zustand `persist` middleware |
| Server Components / Server Actions | App Router is in use (`app/` has 221 files under route groups like `(authenticated)`, `(public)`, `(onboarding)`) | No evidence of Next.js Server Actions (`"use server"`) being used for mutations; nearly everything is `'use client'` + `useEffect` + `api.*` |

### 1.2 CENTRAL FINDING — react-query is installed and wired up, but is not the app's server-state layer

```
ID: STATE-001
Severity: P1
Category: State management / architecture
Location: infrastructure/state/queryClient.ts, apps/core/Providers.tsx, infrastructure/http/api.ts (used directly from 77 files), domains/community/api/forum.queries.ts (the only real react-query consumer)
Problem: @tanstack/react-query is a first-class dependency with a configured QueryClient (custom retry logic that skips 401/403, and a queryClient.clear() call wired into the 401 refresh-failure path in api.ts) — but almost no feature actually uses useQuery/useMutation. Only domains/community/api/forum.queries.ts calls the react-query hooks. Every other server-data screen (console content management, exam schedules, inbox, learner course pages, studio content editor, events dashboard, IAM users list, etc.) fetches data via a raw useEffect + api.get(...) + useState(...) triad instead.
Evidence: `grep -rl "useQuery\|useMutation\|useInfiniteQuery"` returns 1 file. `grep -rl "api\.\(get\|post\|put\|patch\|delete\)"` returns 77 files. Example: app/(authenticated)/console/content-manage/page.tsx defines useState for courses, categories, loading, error, categoriesLoading, editingCategoryId, categoryForm and fetches with useEffect — this is exactly the boilerplate react-query exists to remove.
Why it matters: Server state managed by hand loses everything react-query gives for free: request de-duplication, background revalidation, stale-time-based caching, automatic retry/backoff, cross-component cache sharing, and structured invalidation after mutations. Because the query client exists but is unused, the team is paying for two competing data layers (one configured, one actually used) with none of the benefits of either.
Failure scenario: Two components on the same page independently fetch the same course list via api.get with separate useEffect/useState pairs — two network requests, two loading spinners, and the two copies can drift out of sync after a mutation on one of them (see STATE-003). As more screens are built this pattern is copy-pasted (grep shows it already is, ~77 times), compounding the problem rather than converging on the query client that already exists.
Affected users/features: Nearly every authenticated screen — console (content-manage, exam-schedules, inbox, IAM), studio (content editor, event dashboards), learner (course/exam pages), channel management.
Recommended direction: Adopt react-query as the sole server-state layer, using the api.ts client as the fetcher inside queryFn/mutationFn (it already exists and handles auth/refresh — no need to introduce axios or a new client). Migrate high-traffic/high-mutation screens first (console content-manage, studio content editor, exam scheduling) since those are the ones most exposed to stale-cache bugs. Keep zustand for genuinely client-only state (theme, editor UI state, upload queue) and Context for narrow component-tree state; do not use either for anything that originates from the API.
Implementation complexity: Large (cross-cutting, but incremental — can be done screen by screen since api.ts already centralizes the transport).
Regression risk: Medium — mutation call sites need care to preserve existing invalidation/refetch behavior during migration.
Dependencies: None blocking; queryClient and api.ts already exist and are compatible.
Status: ARCHITECTURAL RISK
```

```
ID: STATE-002
Severity: P1
Category: State management / server state in client store
Location: infrastructure/auth/auth.store.ts
Problem: The zustand auth store persists the full `User` object — including server-derived, mutable data such as `enrolledCourses`, `platformRoles`, `channelMemberships`, `onboardingCompleted` — plus the raw access token, to localStorage via zustand's `persist` middleware (key `arcade-auth-storage`). This is server state (it comes from the backend and can change independently, e.g. a new enrollment or role grant) being treated as durable client state with no cache-invalidation story.
Evidence: auth.store.ts lines 6-33 (User interface) and lines 59-63 (`persist({ name: 'arcade-auth-storage', partialize: (state) => ({ user: state.user, accessToken: state.accessToken }) })`). infrastructure/http/api.ts reads the token straight out of `localStorage.getItem("arcade-auth-storage")` as a fallback (lines 59-74).
Why it matters: `enrolledCourses`/`platformRoles`/`channelMemberships` embedded in the persisted user object will silently go stale — e.g. a user enrolled in a new course in another tab, or granted a role by an admin, will not see it reflected until `setAuth`/`updateUser` is explicitly called again, which nothing in the 77 api.* call sites appears to do systematically. There is also a security dimension: an access token in `localStorage` (rather than an httpOnly cookie) is readable by any script that gets XSS'd into the page — worth flagging even though it is adjacent to, not strictly inside, state-management scope.
Failure scenario: User is granted a new platform role by an admin (console/iam). The granting admin's screen updates; the affected user's own session, cached in localStorage from login, keeps the old `platformRoles` array until next full re-login or an explicit refresh call, so role-gated UI can be wrong for the lifetime of the session.
Affected users/features: Authorization-dependent UI in Platform Console, channel management, course enrollment displays, onboarding-completed gating.
Recommended direction: Store only true session/identity primitives (accessToken, userId, auth status) in the persisted zustand store. Fetch profile/roles/enrollments/memberships via react-query keyed off userId, with invalidation triggered wherever a mutation changes them (role grant, enrollment, channel join).
Implementation complexity: Medium.
Regression risk: Medium — many components likely read `user.platformRoles` etc. directly off the store today; migration needs a compatibility pass.
Dependencies: STATE-001 (needs react-query adoption first).
Status: ARCHITECTURAL RISK
```

```
ID: STATE-003
Severity: P2
Category: State management / cache invalidation
Location: 77 call sites of infrastructure/http/api.ts (representative: app/(authenticated)/console/content-manage/page.tsx, app/(authenticated)/console/content-manage/[courseId]/page.tsx)
Problem: Because there is no shared query-cache layer, "invalidation after mutation" is implemented ad hoc per screen — typically by manually re-calling the same fetch function after a POST/PATCH/DELETE, or by locally splicing the mutated item into the useState array. Nothing guarantees a second screen holding the same data (fetched independently, per STATE-001) gets updated.
Evidence: Pattern repeats in content-manage/page.tsx (own useState<ConsoleCourse[]> plus own useState<ConsoleCategory[]>) and content-manage/[courseId]/page.tsx, which very likely fetch overlapping course data through separate `api.get` calls with no shared cache key.
Why it matters: This is the textbook "cache fragmentation" problem the audit brief calls out — same server entity, multiple independent client copies, each with its own staleness.
Failure scenario: Admin edits a course category name on the categories tab; the courses tab (already fetched) keeps showing the old category label until a full page reload.
Affected users/features: Console content management, studio content editor, any master/detail pair of screens.
Recommended direction: Same as STATE-001 — centralize under react-query query keys per entity (`['course', id]`, `['courses', filters]`) so a single `invalidateQueries` after a mutation fixes every consumer at once.
Implementation complexity: Large (same effort as STATE-001, not additive).
Regression risk: Medium.
Dependencies: STATE-001.
Status: ARCHITECTURAL RISK
```

```
ID: STATE-004
Severity: P3
Category: State management / duplicated realtime hooks
Location: domains/community/hooks/useWebSocket.ts, infrastructure/websocket/useWebSocket.ts
Problem: Two separate `useWebSocket` implementations exist, both resolving a broker URL from `process.env.NEXT_PUBLIC_WS_URL` with the same fallback (`'http://localhost:8080'`) and the same `toBrokerUrl` helper pattern.
Evidence: Both files contain `const brokerURL = toBrokerUrl(process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:8080');` (domains/community/hooks/useWebSocket.ts:51, infrastructure/websocket/useWebSocket.ts:58).
Why it matters: Two independent STOMP/websocket connection lifecycles for what is conceptually one concern increases the chance of divergent reconnect/cleanup behavior and doubles the maintenance surface (per CLAUDE.md, infrastructure/websocket is supposed to be the single infrastructure-layer owner of this).
Failure scenario: A reconnect/backoff fix applied to one hook is not applied to the other; one feature silently keeps stale realtime state after a network blip.
Affected users/features: Community/forum realtime features, and whatever uses the infrastructure-layer hook (collaboration/notifications).
Recommended direction: Consolidate on the infrastructure-layer hook per the project's own layering rule (domains -> infrastructure, not domains reimplementing infrastructure concerns); have domains/community consume it.
Implementation complexity: Small–Medium.
Regression risk: Low.
Dependencies: None.
Status: TECHNICAL DEBT
```

```
ID: STATE-005
Severity: P2
Category: State management / config fragmentation
Location: apps/creator/editor/hooks/useArcadeEditor.ts:84, domains/community/hooks/useWebSocket.ts:51, infrastructure/websocket/useWebSocket.ts:58
Problem: Three different NEXT_PUBLIC websocket URL env vars are used for what appear to be two conceptually distinct realtime backends (collaboration vs. general websocket/STOMP), and one of them (`NEXT_PUBLIC_COLLABORATION_URL` / `NEXT_PUBLIC_COLLAB_WS_URL`) has two names doing the same job with an `||` fallback chain, suggesting a rename that was never finished.
Evidence: `const wsUrl = process.env.NEXT_PUBLIC_COLLABORATION_URL || process.env.NEXT_PUBLIC_COLLAB_WS_URL || "ws://localhost:1234";`
Why it matters: This is exactly the "environment-conditional logic scattered through code instead of centralized" pattern the audit is looking for — no single source of truth for realtime endpoint configuration.
Recommended direction: Centralize all `NEXT_PUBLIC_*` reads behind a single `infrastructure/config` module with one canonical name per concern, and delete the dead alias.
Implementation complexity: Small.
Regression risk: Low.
Dependencies: None.
Status: TECHNICAL DEBT
```

### 1.3 Recommended state-ownership model (grounded in what already exists)

| State category | Own it with | Why |
|---|---|---|
| Anything that originates from an API call (courses, categories, exams, users, roles, enrollments, forum threads, events) | **react-query**, using `infrastructure/http/api.ts` as the fetcher | The plumbing already exists (`queryClient.ts`, `QueryClientProvider`, one working example in `forum.queries.ts`) — it just needs to be used everywhere instead of raw `useEffect`+`useState` |
| Auth/session identity (token, auth status) | **zustand** (`auth.store.ts`), trimmed to identity only | Needs to be available synchronously outside React (api.ts already reads it via `getState()`), which react-query cannot provide as cleanly |
| Cross-cutting client-only UI (theme, upload queue progress, roadmap-viewer camera/zoom, IAM policy-editor draft) | **zustand**, as already done in theme.store.ts / uploadQueueStore.ts / useRoadmapViewerStore.ts / policy-editor.store.ts | These are legitimately client-only, ephemeral, and don't need persistence beyond what's already there |
| Narrow component-subtree state (editor block focus, intro/onboarding step, forum layout toggles) | **React Context**, as already done | Correctly scoped today — no evidence of an over-broad "god context" |
| Filter/sort/pagination/tab selection on list screens | **URL state** (`useSearchParams`) | Currently done with local `useState` in most list screens (e.g. content-manage's `activeTab`, `searchQuery`); should move to the URL so state survives refresh/back-button and is shareable — this is a concrete, low-risk near-term win |
| Purely ephemeral form/UI state (modal open/closed, hover, local input before submit) | **local `useState`** | Already the dominant and correct pattern for this category |

---

## 2. TypeScript Quality

```
ID: TS-001
Severity: P1
Category: Type safety
Location: Codebase-wide — 276 occurrences of `: any` and 108 occurrences of `as any` (excluding node_modules and the worktree mirror)
Problem: Both explicit `any` typing and `as any` casts are widespread. Representative example: infrastructure/auth/auth.store.ts:28 `roles?: any[];` inside the core `User` type used app-wide for authorization decisions.
Evidence: `grep -ro ": any\b"` → 276 matches; `grep -ro "as any\b"` → 108 matches, across app/apps/domains/features/shared/infrastructure.
Why it matters: `any` on authorization-relevant fields (roles, permissions) defeats the type checker precisely where a mistake is most costly. `as any` casts are frequently used to silence a type error rather than fix a real mismatch, which routinely hides genuine bugs (wrong property name, wrong shape) until runtime.
Failure scenario: A field rename on the backend (e.g. `roles[].code` -> `roles[].roleCode`) compiles cleanly wherever `any` is used, and only fails at runtime in production for the affected screen.
Affected users/features: Broad — authorization, forms, API response handling.
Recommended direction: Track and reduce with `eslint` rule `@typescript-eslint/no-explicit-any` set to `warn` first (then `error` for new code), prioritizing infrastructure/auth and domains/iam (authorization-adjacent) first.
Implementation complexity: Large as a full cleanup; small to start enforcing on new code via lint.
Regression risk: Low (lint-only change to start).
Dependencies: None.
Status: TECHNICAL DEBT
```

```
ID: TS-002
Severity: P1
Category: Runtime validation
Location: zod is a dependency (`zod ^4.4.3`) but `grep -rl "from ['\"]zod['\"]"` finds it imported in only 1 source file
Problem: Despite zod being available and presumably intended as the runtime-validation layer, essentially no API response is validated at the boundary. `infrastructure/http/api.ts`'s `request<T>()` does `JSON.parse(text) as T` with no schema check — the generic `T` is a compile-time-only assertion, trusted blindly at runtime.
Evidence: infrastructure/http/api.ts line 145: `return (text ? JSON.parse(text) : null) as T;` — this is the single chokepoint for all 77 call sites, and it performs zero runtime validation.
Why it matters: A backend contract change, a null where a string was expected, or a malformed error payload will not be caught until it crashes a component deep in the render tree, with no schema-based error message to say what shape was expected vs received.
Failure scenario: Backend adds a nullable field or renames a key; frontend silently receives `undefined` for a field it assumes is present, and a downstream `.map()`/`.toLowerCase()` throws in production with a generic React error rather than a clear validation failure.
Affected users/features: Every API-backed screen — all 77 `api.*` call sites.
Recommended direction: Add zod schemas at the api.ts boundary (or per-domain query layer once STATE-001 is addressed) for at least the high-traffic/high-risk payloads: auth/session, course publishing, exam submission, enrollment, payments if present.
Implementation complexity: Large to cover everything; incremental per-endpoint is feasible.
Regression risk: Low–Medium (schema mismatches will surface previously-silent bugs, which is the point, but may require fixing real backend/frontend contract drift).
Dependencies: None.
Status: ARCHITECTURAL RISK
```

```
ID: TS-003
Severity: P3
Category: Type safety / consistency
Location: app/(authenticated)/console/**, domains/iam/**, and 10 files matching role/status literal comparisons
Problem: Role and status checks are done against inline string literals (`'ADMIN'`, `role === ...`) in ~10 files rather than a shared enum/const object, alongside the `roles?: any[]` typing noted in TS-001.
Evidence: `grep -rl "'ADMIN'\|role ==="` → 10 matches in app/apps/domains.
Why it matters: Typos in literal role/status strings are not caught by the compiler, and there's no single place to see the full set of valid roles/statuses.
Recommended direction: Define shared const objects/enums for roles and content/enrollment statuses in a shared types module, used everywhere instead of literals.
Implementation complexity: Small–Medium.
Regression risk: Low.
Dependencies: None.
Status: TECHNICAL DEBT
```

---

## 3. Forms & Validation

- No dedicated form library (react-hook-form, formik) is a dependency — forms are built with plain controlled `useState` inputs (consistent with the `useState`-heavy pattern found throughout).
- zod, while installed, is not used for form validation in the sampled forms (category creation form in content-manage/page.tsx, exam blueprint editor, event pricing section) — validation appears to be manual (`if (!name) setError(...)`) rather than schema-driven.

```
ID: FORM-001
Severity: P2
Category: Forms/validation
Location: app/(authenticated)/console/content-manage/page.tsx (categoryForm state), app/(authenticated)/studio/course/[courseId]/exam/[examId]/config/ExamBlueprintEditor.tsx, app/(authenticated)/studio/content/[contentType]/[contentId]/components/sections/EventPricingSection.tsx
Problem: Each major form hand-rolls its own field-level validation logic in component state rather than sharing a zod schema, despite zod being an installed dependency and the natural fit for this.
Evidence: TS-002's finding that zod appears in only 1 source file confirms it is not being used for any of these forms either.
Why it matters: Validation rules (required fields, numeric ranges for pricing, exam blueprint constraints) are duplicated by hand wherever a similar form exists, and there's no single source of truth a backend contract could be diffed against.
Recommended direction: Introduce per-domain zod schemas (e.g. `domains/courses/schemas/category.schema.ts`) reused by both the form (via `safeParse`) and the API boundary validation from TS-002 — one schema, two use sites.
Implementation complexity: Medium.
Regression risk: Low.
Dependencies: TS-002.
Status: TECHNICAL DEBT
```

No evidence was found of the frontend reimplementing substantial backend business rules (e.g. pricing calculation, exam scoring) beyond basic shape/required-field checks in the sampled forms — this risk is real but **UNVERIFIED / NEEDS TESTING** at the scale of a full form-by-form audit; flagging as a watch item rather than a confirmed finding.

---

## 4. Performance / Data-Fetching

```
ID: PERF-001
Severity: P1
Category: Data fetching
Location: Same 77 `api.*` call sites as STATE-001, e.g. app/(authenticated)/console/content-manage/page.tsx
Problem: Because data fetching is hand-rolled per component with useEffect, there is no request de-duplication. Two components rendering on the same page (or navigated to in quick succession) that need the same data (e.g. course list, category list) will each fire their own network request.
Evidence: Same evidence as STATE-001/STATE-003.
Why it matters: This is direct, avoidable API request volume growth — exactly the kind of thing that degrades first as concurrent users grow, since it multiplies per-user request count rather than being fixed overhead.
Failure scenario: A dashboard composed of several widgets, each independently fetching overlapping course/category data, issues N redundant requests per page load; at 10,000 concurrent users this is N× avoidable backend load.
Affected users/features: Console, studio, learner dashboards — anywhere multiple components need overlapping server data.
Recommended direction: Same fix as STATE-001 (react-query dedupes automatically by query key).
Implementation complexity: Large (shared with STATE-001).
Regression risk: Medium.
Dependencies: STATE-001.
Status: ARCHITECTURAL RISK
```

```
ID: PERF-002
Severity: P2
Category: Pagination / list rendering
Location: app/(authenticated)/console/content-manage/page.tsx (`courses` state populated from a single `api.get`), app/(authenticated)/console/iam/UsersList.tsx
Problem: Sampled list screens (console content list, IAM users list) fetch into a flat `useState` array with no visible pagination parameters passed to the API call or virtualization on render. No list-virtualization library (react-window, react-virtual, tanstack-virtual) is a dependency.
Evidence: package.json dependencies contain no virtualization library. content-manage/page.tsx's `courses`/`categories` state has no page/limit/cursor parameters in the sampled fetch call.
Why it matters: Course catalogs, user tables, and review queues are exactly the lists the audit brief flags as scalability-sensitive — rendering an unbounded DOM list degrades both fetch time and render/scroll performance as row count grows.
Failure scenario: Platform Console's content-manage list, currently fine at ~dozens of courses, becomes slow to load and slow to scroll once the catalog reaches thousands of entries, because the full set is fetched and fully rendered every time.
Affected users/features: Console content management, IAM user list, and by extension any other catalog-style screen not individually sampled here.
Recommended direction: Add server-side pagination (page/limit or cursor) to these list endpoints' frontend calls, paired with react-query's `useInfiniteQuery` or a paginated `useQuery`, and consider a virtualization library only if a single page can still be arbitrarily large (e.g. an "all courses" export view).
Implementation complexity: Medium (mostly dependent on backend already supporting pagination parameters — needs confirmation).
Regression risk: Medium.
Dependencies: STATE-001; backend pagination support (UNVERIFIED — not confirmed from frontend code alone).
Status: ARCHITECTURAL RISK
```

```
ID: PERF-003
Severity: P2
Category: Bundling / heavy dependencies
Location: package.json dependencies (`@excalidraw/excalidraw`, `konva`/`react-konva`, `mermaid`, `@tiptap/*` ~20 packages, `gsap`, `framer-motion`, `jspdf`, `docx`, `katex`); only 5 files in the whole codebase use `next/dynamic`/`React.lazy`
Problem: Several very heavy, feature-specific libraries (excalidraw, konva, mermaid, the full tiptap extension set, gsap alongside framer-motion for animation) are imported directly (static `import`) in their consuming components rather than being lazy-loaded, and dynamic-import usage is rare (5 files total) across the codebase.
Evidence: `grep -rl "@excalidraw/excalidraw|react-konva|from ['\"]mermaid['\"]|@tiptap/react"` returns ~20+ files, all static imports; `grep -rl "next/dynamic|React.lazy|lazy("` returns only 5 files.
Why it matters: Next.js App Router does per-route code splitting automatically, which limits (but does not eliminate) the damage — a route that imports tiptap will not ship excalidraw's JS to a route that doesn't import it. But within a route that needs multiple heavy editors (e.g. the content/course editor in apps/creator/editor, which touches tiptap, konva-based badge canvas, and roadmap/excalidraw-adjacent extensions), everything loads eagerly on first paint rather than being deferred until the specific tool (e.g. the excalidraw canvas block) is actually opened.
Failure scenario: The course/content editor route's initial JS payload includes tiptap + konva + any co-located heavy extension code even for an author who only ever types text and never opens a canvas/diagram block, inflating time-to-interactive on that route.
Affected users/features: Studio/creator editor routes, badge canvas, roadmap renderer.
Recommended direction: Wrap per-block-type editor components (excalidraw canvas, konva badge canvas, mermaid renderer) in `next/dynamic(..., { ssr: false })` so they load only when that block type is actually rendered/opened, not as part of the base editor bundle. This is additive and low-risk since it doesn't change behavior, only load timing.
Implementation complexity: Medium.
Regression risk: Low.
Dependencies: None.
Status: ARCHITECTURAL RISK (bundle-size magnitude itself is UNMEASURED — see §4.4)
```

```
ID: PERF-004
Severity: P3
Category: Cleanup / memory
Location: Not individually enumerated at file level within this pass — 486 `useEffect` call sites is too large a set to hand-audit exhaustively in this pass
Problem: Given the volume of useEffect-based data fetching (STATE-001/PERF-001) and websocket hooks (STATE-004), the audit could not exhaustively verify that every subscription/interval/websocket connection has a matching cleanup function within the available time. Two websocket hooks were spot-checked (domains/community/hooks/useWebSocket.ts, infrastructure/websocket/useWebSocket.ts) and both appear to have some connect/disconnect lifecycle, but a full sweep for missing cleanup (event listeners, intervals, `AbortController`s on fetch) across all 486 useEffect sites was not performed.
Why it matters: Missing cleanup in components that mount/unmount frequently (modals, tabs, list items) is a classic source of memory growth and duplicate-listener bugs, but claiming it as CONFIRMED without file-by-file verification would be guessing.
Recommended direction: A follow-up pass specifically greps for `addEventListener`/`setInterval`/`subscribe(` without a paired cleanup in the same `useEffect`, and for `fetch`/`api.*` calls in effects without `AbortController` cancellation on unmount (relevant once react-query, which handles this automatically, is not yet adopted per STATE-001).
Implementation complexity: N/A (audit follow-up, not a fix).
Regression risk: N/A.
Dependencies: None.
Status: UNVERIFIED / NEEDS TESTING
```

### 4.4 Actual build output

`npm run build` was executed for real. Result:

```
▲ Next.js 16.2.10 (Turbopack)
  Creating an optimized production build ...
✓ Compiled successfully in 19.7s
  Running TypeScript ...
Failed to type check.

./app/(authenticated)/channels/[id]/manage/components/OrganizationAnalyticsSection.tsx:4:22
Type error: Could not find a declaration file for module 'canvas-confetti'. ... implicitly has an 'any' type.
Next.js build worker exited with code: 1 and signal: null
```

```
ID: PERF-005
Severity: P1
Category: Build / CI correctness
Location: app/(authenticated)/channels/[id]/manage/components/OrganizationAnalyticsSection.tsx:4, package.json (missing devDependency `@types/canvas-confetti`)
Problem: The production build (`npm run build`) currently fails type-checking outright — `canvas-confetti` is a runtime dependency with no bundled types and `@types/canvas-confetti` is not installed, so Next.js's build-time `tsc` pass fails.
Evidence: Verbatim build output above, captured from a real `npm run build` run in this audit.
Why it matters: This is a CONFIRMED, currently-broken production build. Whatever CI/deploy pipeline runs `npm run build` is either already failing, or type-checking is disabled/ignored somewhere it shouldn't be — either way it's worth immediate attention independent of the rest of this audit.
Failure scenario: A deploy is attempted and fails outright, or (worse) a config with `typescript: { ignoreBuildErrors: true }` in next.config.ts is silently masking this and other type errors in production builds — worth checking directly.
Affected users/features: The entire deploy pipeline.
Recommended direction: `npm i -D @types/canvas-confetti` (types package exists on npm as of general availability). Quick, low-risk fix.
Implementation complexity: Trivial.
Regression risk: None.
Dependencies: None.
Status: CONFIRMED BUG
```

Because the build did not complete, no real production JS bundle size numbers could be captured in this pass. **Bundle size itself is therefore an UNMEASURED RISK, not a confirmed one** — PERF-003's concern about heavy libraries is architectural/structural (based on static-import evidence), not a cited byte count.

---

## 5. Scalability Audit (100 → 10,000+ users)

| Risk | Classification | Reasoning |
|---|---|---|
| API request volume grows faster than user count due to lack of request de-dup/caching (STATE-001, PERF-001) | **CONFIRMED PROBLEM** (the pattern causing it is confirmed in code; the resulting production load is not separately measured, but the mechanism — no shared cache, 77 independent fetch sites — is directly observed) | Each additional concurrent user multiplies redundant per-component fetches; this scales linearly-or-worse with both users and features added, since every new screen repeats the same `useEffect`+`api.get` pattern |
| Unbounded list fetch/render on catalog-style screens (PERF-002) | **ARCHITECTURAL RISK** | No pagination parameters or virtualization observed in sampled list screens; will degrade as row counts grow, but current row counts (and thus current impact) were not measured |
| Stale cached auth/role/enrollment data (STATE-002) | **ARCHITECTURAL RISK** | Correctness risk that gets worse with more concurrent admin actions (role grants, enrollments) happening while other users have long-lived sessions |
| Client bundle weight from heavy, eagerly-imported editor libraries (PERF-003) | **UNMEASURED RISK** | Structural pattern (static imports, few dynamic imports) is confirmed; actual shipped byte size was not measured because the build currently fails (PERF-005) before producing output |
| Browser storage growth (localStorage-persisted auth/user object) | **ARCHITECTURAL RISK, low magnitude** | A single persisted user object (STATE-002) is not itself large, but it's a growing-in-scope object (roles, memberships, enrollments all embedded) with no size bound as a user accumulates more courses/memberships over years of usage |
| Realtime/collaboration (yjs/hocuspocus, websocket hooks) fan-out at scale | **UNMEASURED RISK** | Two separate websocket hook implementations exist (STATE-004) but connection-count/backend fan-out behavior under concurrent collaborative editing was not load-tested or traced in this pass — flagging as a watch item, not a confirmed problem |
| Zero automated test coverage on business-critical flows | **CONFIRMED PROBLEM** (see 09_FRONTEND_TESTING_AUDIT.md) | As user count and feature surface grow, regressions in auth/authorization/publishing/enrollment become more likely and more costly with no automated safety net |

**Single biggest confirmed scalability risk:** the absence of a shared server-state cache (STATE-001/PERF-001). It is not hypothetical — the pattern (77 independent `useEffect`+`api.get` call sites, react-query configured but unused) is directly observed in the code today, and it is the one finding that simultaneously drives up backend request volume, causes stale/inconsistent UI (STATE-003), and blocks the correctness fix needed for STATE-002. Every other scalability risk in this table either depends on this one or is smaller in scope.

---

## 6. Dependency & Environment/Config Audit

### 6.1 Dependencies

```
ID: DEP-001
Severity: P1
Category: Build correctness
Location: package.json (dependencies), missing devDependency
Problem: `canvas-confetti` is used (app/(authenticated)/channels/[id]/manage/components/OrganizationAnalyticsSection.tsx) without its type declarations installed, breaking `npm run build`. See PERF-005 for full detail — duplicated here for dependency-audit completeness.
Status: CONFIRMED BUG (same as PERF-005)
```

```
ID: DEP-002
Severity: P2
Category: Duplicate/overlapping libraries
Location: package.json
Problem: Two icon libraries are installed and presumably both in use (`lucide-react` and `react-icons`); two animation libraries are installed (`framer-motion` and `gsap`); two rich content/canvas libraries beyond the primary editor exist (`konva`/`react-konva` for badges, and tiptap's own image/media extensions) — none individually confirmed as dead weight, but worth a deliberate "pick one" decision per category to avoid two ways of doing the same thing proliferating across the 634-file codebase.
Evidence: package.json dependency list (see §0 excerpt): `lucide-react` + `react-icons`; `framer-motion` + `gsap`.
Why it matters: Two libraries solving the same problem (icons, animation) means inconsistent visual/interaction patterns across the app and avoidable bundle weight if both ship to overlapping routes.
Recommended direction: Grep actual import counts per library (not done exhaustively in this pass) and standardize on one per category going forward; do not do a disruptive one-time migration of existing working code.
Implementation complexity: Small (policy decision) to Large (full migration, not recommended).
Regression risk: Low if only enforced for new code.
Dependencies: None.
Status: TECHNICAL DEBT
```

```
ID: DEP-003
Severity: P2
Category: Client-exposed configuration
Location: NEXT_PUBLIC_GIPHY_API_KEY (referenced somewhere under the `NEXT_PUBLIC_*` grep results — API key pattern, not printed here)
Problem: A third-party API key is exposed via a `NEXT_PUBLIC_*` env var, meaning it ships in client-side JS and is visible to any user.
Evidence: `grep -rho "NEXT_PUBLIC_[A-Z0-9_]*"` includes `NEXT_PUBLIC_GIPHY_API_KEY` (value not inspected/printed, per audit instructions).
Why it matters: Client-exposed third-party API keys are subject to abuse (quota exhaustion, billing risk) by anyone who reads the bundle, unless the key is scoped/rate-limited on the provider's side for exactly this use case (which Giphy's public client-key model is generally designed for — this is a lower-severity flag than a secret key, but still worth an explicit decision).
Recommended direction: Confirm with the team that this specific key is intended to be public (Giphy does offer public client keys for this exact use case); if not, proxy Giphy requests through a backend endpoint instead.
Implementation complexity: Small if proxying is chosen.
Regression risk: Low.
Dependencies: None.
Status: UNVERIFIED / NEEDS TESTING
```

```
ID: DEP-004
Severity: P3
Category: Config fragmentation
Location: Three websocket-related NEXT_PUBLIC vars (see STATE-005)
Problem: Duplicate/overlapping env var names for realtime endpoints. Cross-referenced from STATE-005 for dependency/config-audit completeness.
Status: TECHNICAL DEBT (same as STATE-005)
```

### 6.2 No `.env*` files found in the working tree (good hygiene — nothing to flag for accidental secret commits at this pass), and no scripts/CI config were found referencing environment-specific frontend logic beyond the `NEXT_PUBLIC_*` reads already covered above.

---

## Summary counts (from this pass)

- `: any` occurrences: 276
- `as any` occurrences: 108
- Files using zod: 1
- Files calling `infrastructure/http/api.ts` directly (bypassing react-query): 77
- Files using `useQuery`/`useMutation`/`useInfiniteQuery`: 1
- zustand stores: 6
- React Context providers: 8
- `next/dynamic`/`React.lazy` usages: 5
- Test files found: 0 (see 09_FRONTEND_TESTING_AUDIT.md)
- `npm run build`: fails type-check (see PERF-005 for exact output)
