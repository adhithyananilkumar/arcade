# 14 — Frontend Architectural Consolidation Report

Scope: `E:\arcade\ui`. Performed as a follow-up implementation pass after the forensic audit (documents 01-13 in this folder). Every finding below was re-verified against the current working tree (fresh `Grep`/`Read`) before any edit — the audit was treated as a baseline to check, not a list to apply blindly, and two audit-time assumptions were corrected during re-verification (see §6).

**No UI, layout, styling, navigation, or user-facing behavior was changed.** Every change is underneath the existing UI: transport consolidation, duplicate-code removal, config centralization, and one narrow correctness fix to an already-cosmetic role badge. Production build and full type-check pass cleanly after every group of changes (validated 4 times during this pass, not just once at the end).

---

## 1. What was consolidated

| Concern | Before | After |
|---|---|---|
| HTTP transport for auth operations | `infrastructure/auth/auth.service.ts` used `axios` directly (a second HTTP stack alongside the canonical `fetch`-based `infrastructure/http/api.ts`) | Rewritten to native `fetch`, matching `api.ts`'s conventions (same env resolution, same "throw on non-OK" contract, same empty-body-safe JSON parsing). `AuthService`'s public API (`login`/`logout`/`refresh`/`register`/`forgotPassword`/`resetPassword`/`verifyEmail`/`resendVerificationCode`) is unchanged — none of its 8 call sites needed to change. `axios` is no longer imported anywhere in the application bundle (only remains in `scripts/test.ts`, a standalone dev script outside the Next.js app). See §6 for why `AuthService` stays a separate module instead of routing through `api`'s `request()` directly. |
| Session initialization | Two independent implementations of "refresh token → hydrate store → fall back to `UserService.getMe()`": `AuthInitializer.tsx` (simpler, missing the `getMe()` fallback) and `ProtectedLayout.tsx` (had the fallback, used `setStatus('unauthenticated')` on failure instead of the more complete `clearAuth()`) | Extracted into one function, `apps/core/lib/session.ts:initializeSession()`, used by both. Preserves the richer behavior (the `getMe()` fallback, `clearAuth()` on failure) in both call sites — this is a superset of prior behavior, not a regression. Each component keeps its own distinct surrounding logic unchanged: `AuthInitializer`'s `/oauth2/redirect` race-avoidance guard, and `ProtectedLayout`'s redirect-to-`/sign` / onboarding-routing / loading-state rendering. |
| WebSocket/STOMP client | Two near-identical STOMP client implementations: `infrastructure/websocket/useWebSocket.ts` (generic) and `domains/community/hooks/useWebSocket.ts` (identical, plus syncing a forum-store `wsConnected` flag) | `domains/community/hooks/useWebSocket.ts` is now a 20-line wrapper that calls the infrastructure hook and layers only the forum-store sync on top via a `useEffect` watching `connected`. One STOMP client implementation exists; the forum-specific side effect is isolated and explicit. |
| Backend/WebSocket/collaboration origin config | Hardcoded fallback literals scattered across 12+ files, in three different shapes: `http://localhost:8080` (5 files), `http://127.0.0.1:8080/api/v1` (3 BFF route files — different host than everywhere else), `http://localhost:8080/api/v1` (`auth.service.ts` + 6 duplicated `getAvatarUrl` copies + 2 other page-local helpers), `ws://localhost:8080/ws` (hardcoded with **no env override at all** in `TimeTracker.tsx`), `ws://localhost:1234` (collaboration server, `useArcadeEditor.ts`), and a hardcoded OAuth redirect in `AuthOrchestrator.tsx` | One module, `infrastructure/config/env.ts`, exports `API_ORIGIN`, `API_V1_BASE_URL`, `WS_ORIGIN`, `GOOGLE_OAUTH_URL`, `COLLAB_WS_URL` — all derived from `NEXT_PUBLIC_API_URL`/`NEXT_PUBLIC_WS_URL`/`NEXT_PUBLIC_COLLABORATION_URL` with **exactly the same dev-time fallback values every call site already used**, so local/dev behavior is byte-identical. In production, this also *fixes* a latent bug: previously, whether `NEXT_PUBLIC_API_URL` was expected to include `/api/v1` or not was decided independently (and inconsistently) at each of 12+ call sites — now it's decided once. 12 files updated to import from this module instead of reading `process.env` with their own local fallback. |
| Duplicated `getAvatarUrl` helper | Byte-identical function independently defined in 6 files | Extracted to `shared/utils/avatar.ts`; all 6 call sites now import it. (A 7th, similar-but-not-identical helper, `getLogoUrl` in `organizations/[id]/page.tsx`, resolves a different resource — channel/org logos, different default subpath — and was left as its own local function per the "don't force-merge non-identical responsibilities" instruction; only its hardcoded URL fallback was centralized.) |
| `cn()` utility (shadcn `clsx`+`tailwind-merge` wrapper) | Two byte-identical copies: `lib/utils.ts` (shadcn's default scaffold location, 1 live consumer) and `shared/utils/utils.ts` (the project's real convention, 34 consumers per the audit) | `lib/utils.ts` deleted; its one consumer (`components/ui/border-beam.tsx`) now imports from `shared/utils/utils`. `components.json`'s `utils` alias updated so future `shadcn` CLI generations target the real location instead of recreating the legacy one. |
| shadcn generation target for UI primitives | `components.json`'s `ui` alias pointed at `@/components/ui` | Investigated before touching (see §6) — `components/ui/` turned out to be a decorative/marketing-effects library (ornamental borders, confetti, masonry grids), not a competing primitive layer; the real, actively-maintained design-system primitives (button, input, dialog, card, table, tooltip, etc., 30+ files) all already live in `shared/design-system/ui/`. Updated the `ui` alias to `@/shared/design-system/ui` so future shadcn-generated primitives land in the correct canonical location. **No existing files were moved** — see §4 for why. |
| Cosmetic "Admin" role badge | 4 near-identical inline blocks (2 in `app/(public)/[username]/page.tsx`, 2 in `app/(authenticated)/profile/page.tsx`) checked platform role against a 5-item guessed string list — `['ADMIN', 'ROLE_ADMIN', 'PLATFORM_ADMIN', 'SUPER_ADMIN', 'SYSTEM_ADMIN']` — of which only `PLATFORM_ADMIN` exists as a real backend `PlatformRole` code (confirmed against `IamBootstrap.java`'s seed list in the backend contract audit); `PLATFORM_OWNER` holders got no badge at all | The 4 occurrences now check `['PLATFORM_OWNER', 'PLATFORM_ADMIN']` — the two role codes actually confirmed to exist in the backend's seeded model. This is a narrow, in-place correctness fix, not a restructuring: same variable, same surrounding logic, same visual output for every role that previously worked correctly, now also correct for `PLATFORM_OWNER`. The `isCreator` heuristic in the same blocks (no backend concept exists for "creator" at all) was deliberately left untouched — it's presentation-only guesswork with nothing real to ground it against, and the instructions were explicit not to touch presentation-only labels blindly. |
| Missing type declarations blocking the production build | `npm run build` failed type-checking outright (`canvas-confetti` has no bundled types, `@types/canvas-confetti` wasn't installed) — pre-existing, confirmed in the original audit (`PERF-005`) | `npm i -D @types/canvas-confetti`. This was Phase 0 in the remediation roadmap and was blocking clean validation of every other change in this pass, so it was fixed first. |

## 2. What was deleted

| File | Why safe |
|---|---|
| `infrastructure/auth/auth.ts` | Orphaned second token-storage model (raw `localStorage['arcade-access-token']`/`['arcade-refresh-token']`, `setTokens`/`clearTokens`/`isAuthenticated`). Re-verified via fresh grep immediately before deletion: `setTokens` had zero call sites anywhere in the repo. |
| `apps/core/components/AuthGuard.tsx` | The only consumer of `infrastructure/auth/auth.ts`. Re-verified via fresh grep: zero import sites outside its own file, not referenced by any route. |
| `lib/utils.ts` | Exact duplicate of `shared/utils/utils.ts`. Re-verified its one consumer (`components/ui/border-beam.tsx`) was migrated first, then re-grepped for any remaining `@/lib/*` reference (found exactly one, inside a hardcoded example-code string literal in `RoadmapViewer.tsx` that is never executed — a false positive, not a real import) before deleting. The now-empty `lib/` directory was also removed. |

Nothing else was deleted. The two stray `.patch` files (`creator_designs.patch`, `full_design.patch`) and the `.claude/worktrees/` duplicate-repo copy flagged in the dead-code audit were **not** touched — their origin/intent wasn't something I could confirm without asking, and the audit itself flagged them as "confirm first."

## 3. What became canonical

- **HTTP transport**: `infrastructure/http/api.ts` for all domain/business traffic (unchanged, already canonical — 20 of 21 domains already routed through it). `AuthService` (`infrastructure/auth/auth.service.ts`) for the 8 auth-lifecycle operations specifically, now using the same `fetch`-based conventions and the same config module, but kept as its own class rather than merged into `api`'s `request()` pipeline (architectural reason in §6).
- **Auth state**: `infrastructure/auth/auth.store.ts` (Zustand, unchanged — was already the only real one; the orphaned second model is now deleted).
- **Auth initialization**: `apps/core/lib/session.ts:initializeSession()`.
- **WebSocket/STOMP transport**: `infrastructure/websocket/useWebSocket.ts`.
- **Configuration boundary**: `infrastructure/config/env.ts` — `API_ORIGIN`, `API_V1_BASE_URL`, `WS_ORIGIN`, `GOOGLE_OAUTH_URL`, `COLLAB_WS_URL`.
- **Utilities**: `shared/utils/utils.ts` (the `cn()` helper) and `shared/utils/avatar.ts` (the new `getAvatarUrl()`).
- **UI primitives**: `shared/design-system/ui/` (was already the de facto canonical location by content; now also the canonical location by `components.json` configuration).
- **Authorization**: `infrastructure/auth/authorization.service.ts` remains the canonical policy boundary for real permission decisions (unchanged — its known permission-code mismatches are a product decision, not a code-consolidation task; see §7). The cosmetic admin-badge check was corrected in place rather than migrated into this service, since it's presentation logic on already-public profile data, not a security decision.

## 4. What was deliberately left unchanged

- **`components/ui/`'s 16 decorative/marketing components** (ornamental borders, confetti, masonry grids, animated lists, etc.) were **not** moved into `shared/design-system/ui/`. Investigation (file-by-file comparison, not just directory names) showed these are a genuinely different category — bespoke visual/marketing effects, not general-purpose UI primitives — so moving them would have been a miscategorization, not a deduplication, for zero benefit and nonzero import-churn risk across their consumers.
- **`MagicBento` / `magic-bento`** — the one genuine near-duplicate found between the two folders (`components/ui/MagicBento.tsx`, 602 lines, used only by the profile page; `shared/design-system/ui/magic-bento.tsx`, 498 lines, used only by the achievements page) — was **not** merged. A direct diff showed they've diverged meaningfully: different default glow colors (`132, 0, 255` vs `41, 98, 214` — "Arcade Blue Palette" per an inline comment), different prop interfaces, ~100 lines of drift. Merging them without a way to visually verify both consuming screens afterward would risk changing the visible appearance of one or both pages, which the instructions explicitly prohibit. **Flagged as a remaining duplicate for a future pass that includes visual QA**, not silently left undocumented.
- **`authorization.service.ts`'s known-mismatched permission codes** (`platform.users.manage`, `platform.roles.assign`, `platform.permissions.manage`, `platform.categories.manage`, `platform.audit.view`, `payments.view` — none of which exist in the backend's seeded permission set per `IamBootstrap.java`) were **not** changed. Per the explicit instruction ("If frontend and backend permission models disagree: STOP, DOCUMENT THE MISMATCH, DO NOT INVENT A NEW PERMISSION CODE"), fixing these requires a product decision (add the permissions to the backend seed, or re-gate the frontend onto different existing real permissions) that isn't mine to make. This is the same finding as `IAM-001`/`IAM-002` in the security audit — restated here as still open.
- **The `isCreator` cosmetic heuristic** (bio-text matching, guessed role strings) in the same 4 blocks as the admin-badge fix — left untouched. No backend concept exists to ground it against (channel roles are admin-defined per channel with no fixed enum, and there is no platform-level "creator" role), so "fixing" it would mean inventing a definition, which the instructions explicitly prohibit.
- **The roadmap `features/roadmap` vs `domains/roadmaps` split** — investigated, not merged. See §5.
- **The `/dev-editor-perf` route** (flagged `ROUTE-002`/`P3` in the security audit as reachable with no guard) — confirmed still present and unguarded in the production build output, but touching route guarding is a security-audit remediation item, not an architectural-duplication one, and was out of scope for this pass.
- **`AuthService`'s `any`-typed method signatures** (`credentials: any`, `userData: any`, etc.) — preserved exactly as they were in the original axios-based version. Reducing `any` usage app-wide is `Phase 8` in the remediation roadmap and explicitly not part of this consolidation; changing types in a security-sensitive auth file for its own sake would add regression risk for zero architectural benefit.
- **Every screen's visual output, layout, copy, and interaction behavior** — nothing in this pass touches JSX, CSS, or component structure in a way that changes what a user sees, apart from the two role codes now correctly recognized (an invisible-to-most-users bugfix: `PLATFORM_OWNER` accounts now show the same "Admin" badge `PLATFORM_ADMIN` accounts already showed).

## 5. Roadmap decision

`domains/roadmaps` and `features/roadmap/renderer` are **not** a case of one being obsolete. Fresh verification (grepping actual live import sites, not audit-time assumptions) shows:

- **`domains/roadmaps`** is the canonical, actively-used data/service/store/authoring layer — imported live by the Studio content editor and its adapters, the roadmap templates page, the course-submission dialog, and the explore hub. This is the current, actively developed system for creating and managing roadmaps.
- **`features/roadmap/renderer`** is a separate, still-live visual rendering engine (`RoadmapViewer.tsx`, the large canvas/graph renderer) used specifically by the single roadmap detail/viewer page (`app/(authenticated)/roadmap/[id]/page.tsx`). Its two imports from `domains/roadmaps` in that same file are **commented out** — a deliberate, pre-existing stub (already flagged as `DEAD-004` in the prior audit's dead-code document, "known stub, input to planned work"), not neglect or an abandoned migration.

**Classification: both canonical, for different current purposes.** `domains/roadmaps` owns data/CRUD/authoring; `features/roadmap/renderer` owns the read-side visual rendering for the viewer page. The commented-out data wiring in the viewer page is real mock-data-wiring work (re-enabling it, hooking up the real service call) — explicitly out of scope for this architectural-cleanup pass per the instructions ("DO NOT wire mock data... DO NOT change the roadmap UI in this phase"). No files were moved, merged, frozen, or deleted. This should be revisited only when roadmap mock-data wiring is scheduled (Phase 6 of the remediation roadmap), and even then the two directories likely both remain — one as data layer, one as renderer — rather than being unified into one.

## 6. Corrections to the original audit made during re-verification

Two audit-time claims turned out to be more nuanced once re-checked against current source, both of which shaped how this pass was implemented:

1. **`AuthService` is not simply "a second full HTTP stack calling the same backend."** Re-reading its source showed `login`/`logout`/`refresh` call the Next.js BFF routes (`/api/internal/auth/*`, for HttpOnly-cookie handling), while only `register`/`forgotPassword`/`resetPassword`/`verifyEmail`/`resendVerificationCode` call the backend directly. This meant a literal "route `AuthService` through `api.ts`" instruction was structurally impossible without introducing a circular import (`api.ts` already imports `AuthService` to implement its own 401-refresh flow) and a recursive-refresh bug (`AuthService.refresh()` going back through `api.ts`'s own 401-retry logic that it exists to service). The actual fix applied — same transport primitive (`fetch`), same config module, same error/response-handling conventions, kept as a separate class — achieves the intent (one consistent way of talking to the backend) without the structural contradiction. This reasoning is documented as a code comment directly in `auth.service.ts` so a future reader doesn't "fix" it into a circular import.
2. **The roadmap "competing implementations" framing undersold how entangled the split is.** The audit's own instructions anticipated this uncertainty ("first determine which one currently powers the UI") and were followed rather than the default assumption.

## 7. Remaining duplicates (not resolved in this pass, with reasons)

| Duplicate | Why not resolved now |
|---|---|
| `MagicBento.tsx` (components/ui) vs `magic-bento.tsx` (shared/design-system/ui) | Diverged implementations (different default colors, different props) each tied to a specific screen's current appearance; merging without visual QA risks a visible regression on either the profile or achievements page. |
| `AuthorizationService`'s 6 permission codes not seeded in the backend | Requires a product decision (add to backend seed vs. re-gate frontend onto different real permissions), not a code change I can make unilaterally. Documented in `07_FRONTEND_IAM_SECURITY_AUDIT.md` (`IAM-001`/`IAM-002`) and restated here as still open. |
| `isCreator` cosmetic heuristic | No real backend concept exists to correct it against. |
| `getLogoUrl` (organizations page) vs `getAvatarUrl` (shared/utils) | Same URL-resolution shape, different resource type and default subpath (org logo vs. user avatar). Left as a local function per "don't force-merge non-identical responsibilities" — a future generic `resolveMediaUrl(url, defaultSubpath)` could unify both, but that's a new abstraction, not a straightforward dedup, so it was left out of scope here. |
| `/dev-editor-perf` unguarded route | Security-remediation item, not an architectural-duplication one. |

## 8. Remaining architectural risks (unchanged by this pass — see the original audit for full detail)

Everything in `08_FRONTEND_PERFORMANCE_SCALABILITY_AUDIT.md` and `09_FRONTEND_TESTING_AUDIT.md` remains exactly as documented: React Query is still used in only 1 of 21 domains (this pass established/confirmed the canonical transport underneath it but did not migrate consumers — that's `Phase 4` of the remediation roadmap, explicitly sequenced after this consolidation and explicitly not attempted in bulk here), and there is still zero automated test coverage, meaning none of the behavior-preservation claims in this report are backed by anything beyond manual re-verification, `tsc`, `eslint`, and a full production build. The two confirmed P0 security issues from `07_FRONTEND_IAM_SECURITY_AUDIT.md` (`/console/inbox` unguarded, forum stored XSS) are **unaffected by this pass** — they were not in scope for an architectural-duplication cleanup and still need to be fixed as their own, separate change.

## 9. Files changed

```
Modified (25):
  app/(authenticated)/console/exam-schedules/page.tsx
  app/(authenticated)/console/iam/UsersList.tsx
  app/(authenticated)/organizations/[id]/page.tsx
  app/(authenticated)/profile/page.tsx
  app/(onboarding)/onboarding/page.tsx
  app/(public)/[username]/page.tsx
  app/api/internal/auth/login/route.ts
  app/api/internal/auth/logout/route.ts
  app/api/internal/auth/refresh/route.ts
  apps/core/components/AuthInitializer.tsx
  apps/core/layout/ProtectedLayout.tsx
  apps/creator/editor/hooks/useArcadeEditor.ts
  apps/learner/layout/LearnerNavbar.tsx
  apps/public/orchestrators/AuthOrchestrator.tsx
  components.json
  components/ui/border-beam.tsx
  domains/community/hooks/useWebSocket.ts
  domains/learning/components/TimeTracker.tsx
  infrastructure/auth/auth.service.ts
  infrastructure/http/api.ts
  infrastructure/websocket/useWebSocket.ts
  package.json / package-lock.json (added @types/canvas-confetti as a devDependency)

Deleted (3):
  infrastructure/auth/auth.ts
  apps/core/components/AuthGuard.tsx
  lib/utils.ts

Created (4):
  infrastructure/config/env.ts
  shared/utils/avatar.ts
  apps/core/lib/session.ts
  _frontend_audit/14_CONSOLIDATION_REPORT.md (this file)
```

None of these were committed to git — all changes are in the working tree for review.

## 10. Validation results

Run four times across this pass (after the config/HTTP/websocket group, after the session.ts lint fix, after the authorization badge fix, and as a final full pass):

| Check | Result |
|---|---|
| `npx tsc --noEmit -p tsconfig.json` | Clean — zero errors, including on the pre-existing `canvas-confetti` issue once fixed |
| `npm run build` (production build) | `✓ Compiled successfully` / `✓ Generating static pages using 15 workers (72/72)` — all 72 static/dynamic routes built without error, including `/console/inbox`, `/console/payments`, `/dev-editor-perf`, and every authenticated/console/studio route |
| `npx eslint` on every touched/created file | Zero new errors introduced. Pre-existing lint issues in touched files (e.g. `any` usage already present in `AuthService`'s original signatures, a pre-existing deep-import lint rule violation on an unrelated `PebbleLoader` import in `ProtectedLayout.tsx` that I didn't touch) were left as-is — fixing 731 pre-existing repo-wide lint errors was explicitly out of scope for this pass. The one genuinely new issue this pass introduced (`prefer-const`/`no-explicit-any` in the first draft of `session.ts`) was found and fixed before finishing. |
| Duplicate-import / old-implementation sweep | Grepped for remaining references to every deleted/consolidated file after finishing — zero stragglers. The only remaining hardcoded backend URL literal in the whole `.ts`/`.tsx` tree is in `scripts/test.ts`, a standalone manual smoke-test script that isn't part of the Next.js app bundle. |
| Route reachability | Full build's route manifest confirms every route (including all `(authenticated)`, `console/*`, `studio/*` routes) still builds and is listed — no route was accidentally broken by the auth-initialization or HTTP-client changes. |
| Auth/session behavior verification | Could not be end-to-end browser-tested in this environment (no running backend to authenticate against). Verified instead by: (a) line-by-line behavior comparison between the old and new `auth.service.ts`/`session.ts` implementations (documented in this report and in code comments), (b) confirming the BFF routes' cookie-setting logic is byte-identical apart from the config-derived URL, (c) confirming `api.ts`'s import of `AuthService.refresh()` still resolves to the same function signature and behavior. **This is the one area where I'd recommend a manual smoke test (login, logout, a forced token expiry/refresh, and the Google OAuth flow) before treating this pass as fully verified** — static analysis and a clean build are strong but not complete evidence for auth-flow correctness. |

## Recommended next phase for backend wiring

Per the remediation roadmap's sequencing, this pass completed the safe, high-confidence slice of **Phase 1 (boundary fixes)** and **Phase 2 (duplication/shared infrastructure)** — HTTP/websocket/config/utils consolidation, dead-code removal, and the one safe authorization correctness fix. Recommended next steps, in order:

1. **Manual smoke test of the auth flow** (login, logout, token refresh, Google OAuth) — the one area this pass couldn't verify end-to-end without a running backend.
2. **Fix the two P0 security issues** (`07_FRONTEND_IAM_SECURITY_AUDIT.md`: `/console/inbox` authorization, forum stored XSS) — unaffected by and independent of this consolidation, but still the highest-priority work in the whole audit.
3. **Phase 4 of the roadmap**: extend the React Query pattern beyond the single `community/forum` domain, now that the HTTP-client layer underneath it is unambiguous (one canonical `api.ts`, one config module) — this was intentionally *not* attempted in bulk during this pass per the explicit "do not immediately rewrite all 77 manual fetch locations" instruction.
4. **Phase 6, Tier 1 mock-data wiring**: Notifications full page and Settings→Security sessions, both of which already have a real backend service/endpoint sitting unused one file away — the lowest-risk, highest-value mock-data fixes identified in the original audit, now sitting on a cleaner data-layer foundation than before this pass.
5. Only after the above: revisit the `MagicBento` duplicate and the `AuthorizationService` permission-code mismatches, once a product decision is made on the latter and visual QA capacity exists for the former.
