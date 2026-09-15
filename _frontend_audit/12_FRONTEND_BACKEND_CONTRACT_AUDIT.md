# 12 — Frontend ↔ Backend Contract Audit

Scope: compares frontend assumptions in `E:\arcade\ui` against the actual current backend source at `E:\arcade\backend` (used as the authoritative contract — not any stale docs). Audit only.

## Backend contract reference (ground truth)

### Global infrastructure

- **No uniform base path.** `application.yml` sets no `server.servlet.context-path`. Identity/platform/payment/notification controllers use `/api/v1/...`; nearly all of studio (courses, exams, media, content, badges, quizzes), learning, enrollment, and event controllers use bare `/api/...` (no version segment). `platform/reviews` uses `/api/platform/reviews` (no `v1`). This is a real backend fact, confirmed by direct controller inspection — see `SecurityConfig.java` and the controller list below.
- **Security**: CSRF disabled, stateless sessions, JWT filter (`Authorization: Bearer <token>`), access token 15 min / refresh token 7 days (`application.yml:62-63`). Unauthenticated requests get plain `401` (no redirect), via a custom entry point — correct for an SPA.
- **`.anyRequest().authenticated()`** covers everything not explicitly `permitAll`-listed, including the bare-`/api/...` controllers. Public matchers: `/`, `/error`, `/api/v1/public/**`, `/api/v1/auth/**`, `/api/v1/internal/**`, `/api/v1/users/avatars/**`, `/api/v1/channels/media/**`, `/api/v1/payments/webhooks/**`, swagger paths, OAuth2 paths, `/ws`, `/ws/**`.
- **Method-level `@PreAuthorize` is the exception, not the rule.** The large majority of endpoints across every feature area rely solely on the filter-chain rule plus (inconsistent) service-layer manual checks — not controller annotations. Only review/approve/reject-style workflow transitions and a handful of platform-role/channel-role management endpoints carry explicit permission checks. Cross-reference [07_FRONTEND_IAM_SECURITY_AUDIT.md](./07_FRONTEND_IAM_SECURITY_AUDIT.md) for what this means for the frontend's authorization assumptions.
- **Error response shape** (`GlobalExceptionHandler` / `ErrorResponse.java`): `{ timestamp, status, code, message, path }`. Observed codes: `RESOURCE_NOT_FOUND` (404), `BAD_REQUEST`/`ILLEGAL_ARGUMENT`/`VALIDATION_FAILED` (400), `UNAUTHORIZED` (401), `FORBIDDEN`/`ACCOUNT_LOCKED`/`TOKEN_REUSE_DETECTED` (403), `CONFLICT` (409), `INTERNAL_ERROR` (500 — **leaks full stack trace into `message` in dev mode**, `GlobalExceptionHandler.java:117-128`).
- **Pagination**: no custom envelope. Controllers return raw Spring Data `Page<T>` → `{content, pageable, last, totalPages, totalElements, size, number, sort, first, numberOfElements, empty}`. Query params: standard `page`/`size`/`sort`.

### Auth flow — critical divergence in refresh-token transport

- **`POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`** (password flow): refresh token is returned **in the JSON response body** (`AuthResponse.refreshToken`), not a cookie. `RefreshRequest` expects the token in the request body.
- **Google OAuth2 flow** (`OAuth2LoginSuccessHandler.java`): refresh token is set as an `HttpOnly`, conditionally `Secure`, `SameSite=Lax` cookie named `refreshToken`, `maxAge=30 days` — **does not match** the backend's own 7-day refresh-token expiry in `application.yml:63`. Access token is passed via a redirect URL query param `?token=`, not a cookie.
- `AuthResponse`: `{ accessToken, refreshToken, user: ProfileResponse }`.

### Key DTOs and enums

- `ProfileResponse` (~26 fields incl. `platformRoles`, `channelMemberships`, `permissions`) vs `PublicProfileResponse` (deliberately omits `email`, `mobileNumber`, `gender`, `address`, `permissions`, `platformRoles`, `channelMemberships`).
- **Two different `EnrollmentStatus` enums exist** in the backend itself: `learning.enrollment.EnrollmentStatus{ACTIVE,COMPLETED,DROPPED}` (used in `CourseProgressResponse.enrollmentStatus`) vs `enrollment.shared.enums.EnrollmentStatus{REQUESTED,PENDING,GRANTED,DENIED,REVOKED}` (internal, not directly returned by controllers). The value actually returned by `POST /api/v1/enrollments` is a *third* enum, `EnrollmentResultStatus{GRANTED,PENDING_ACTION,DENIED}`.
- **No `ReviewStatus`/`PublishState`/`ContentStatus`/`ExamStatus` enum exists for courses/exams/roadmaps.** `ContentItem.status` (and `Exam extends ContentItem`) is a plain `String` column. Observed literal values: `"DRAFT"`, `"SUBMITTED"`, `"APPROVED"`, `"PUBLISHED"`, `"SUSPENDED"`. For roadmaps specifically, **casing is inconsistent within the backend itself**: lowercase `"draft"`/`"archived"` vs uppercase `"SUBMITTED"`/`"DRAFT"` mixed within `RoadmapService.java`.
- Real enums that DO exist: `ReviewStatus{OPEN,CHANGES_REQUESTED,COMPLETED,CANCELLED}` and `ReviewDecisionType{APPROVE,REQUEST_CHANGES,REJECT,REASSIGN,ESCALATE,CLOSE,CANCEL}` back the generic cross-content review workflow (`PlatformReviewController`) — separate from the raw string status on `ContentItem`. `EventStatus{DRAFT,SUBMITTED,REJECTED,APPROVED,PUBLISHED,UNPUBLISHED,ARCHIVED,COMPLETED}` is a real, complete enum. `PaymentOrderStatus{CREATED,PENDING,PAID,FAILED,EXPIRED,CANCELLED}` is real (note: not named `PaymentStatus`).
- **No `NotificationType` enum** — `Notification.type` is deliberately a free-form `String` by design. A different, unrelated bounded context has `ChannelNotificationType` (13 values) — do not confuse the two.
- **IAM permission codes are DB-seeded strings, not a Java enum** (e.g. `channel.settings.manage`, `platform.channels.manage`, `platform.roles.manage`, `ALL`). The only true IAM enum is `PermissionContext{GLOBAL,CHANNEL}`. Seeded platform role codes: `PLATFORM_OWNER`, `PLATFORM_ADMIN`, `SUPPORT`, `REVIEWER`, `FINANCE`.
- Two permission codes referenced in `@PreAuthorize` (`platform.permissions.manage`, `platform.users.manage`) are **never seeded** by `IamBootstrap` — those authorization branches may be practically unreachable.
- `QuestionBankQuestion.QuestionType{SINGLE,MULTIPLE,TRUE_FALSE,SENTENCE}` vs `QuizQuestion.QuestionType{SINGLE,MULTIPLE,TRUE_FALSE}` (no `SENTENCE`) — two similarly-named but non-identical enums in the same feature area.
- No quiz-attempt-state enum exists at all (`QuizAttempt` has no status field). Closest analog anywhere is `ProctorSession.Status{PENDING,ACTIVE,COMPLETED,FLAGGED}` (a different feature — exam proctoring, not quiz attempts).

## Findings

### ID: CONTRACT-01
Severity: P1
Category: Contract mismatch risk
Location: Frontend: 20 domain `api/*.ts` files (see [05_FRONTEND_API_INTEGRATION_AUDIT.md](./05_FRONTEND_API_INTEGRATION_AUDIT.md) API-03). Backend: controller base paths across `studio`, `learning`, `enrollment`, `event` vs `identity`, `platform`, `payment`, `notification`.
Problem: The frontend's `/api/v1` vs bare `/api` prefix split was investigated as a possible frontend bug; it is in fact largely a faithful mirror of a genuine backend split. The frontend is *not* wrong to be inconsistent here — but this means there is no simple "always prefix with /api/v1" fix available on the frontend alone.
Why it matters: Any future consolidation of the frontend's HTTP client base-URL handling must stay aware of this per-domain split, or it will break the bare-`/api` domains (studio, learning, enrollment, events, roadmaps, badges, assessments, platform reviews).
Recommended direction: Treat prefix unification as a backend-first decision (backend picks one convention and migrates), not a frontend cleanup. Until then, the frontend's domain-by-domain prefixing should be left as-is and just documented (this audit does).
Status: CONFIRMED ARCHITECTURAL VIOLATION (backend-originated, frontend correctly mirrors it)

### ID: CONTRACT-02
Severity: P1
Category: Contract mismatch risk
Location: Frontend: `infrastructure/auth/auth.service.ts`, `app/api/internal/auth/*`. Backend: `AuthController.java` (password flow, body-transported refresh token) vs `OAuth2LoginSuccessHandler.java` (Google flow, HttpOnly-cookie-transported refresh token, 30-day cookie maxAge vs 7-day actual token expiry).
Problem: The frontend must handle two structurally different refresh-token transport mechanisms depending on login method, and the backend's own cookie maxAge (30 days) doesn't match its token expiry (7 days) for the OAuth path.
Why it matters: If the frontend's refresh logic assumes one transport mechanism universally (e.g. always reads from a cookie, or always expects the token in the response body), it will silently work for one login method and fail for the other. The `app/api/internal/auth/*` BFF routes already set an HttpOnly `refreshToken` cookie for the password-login path too (per the code, "Name must match what Next.js BFF expects" comment on the OAuth side) — this needs explicit verification that the BFF layer normalizes both flows to a single cookie-based contract for the client, rather than the client having to branch.
Failure scenario: A user who logs in via Google has their session silently extended 23 days past what the backend actually honors (cookie says valid, token is expired) — refresh calls fail with a confusing error 23 days into what the cookie implies should still be a valid session.
Recommended direction: Verify (read `app/api/internal/auth/login/route.ts`, `refresh/route.ts` in full) that the BFF layer fully normalizes both login paths to one client-facing contract. If it does, this is purely a backend-side cookie-maxAge bug to flag to the backend team, not a frontend defect. If it doesn't, the frontend auth code needs to handle both paths explicitly.
Implementation complexity: Small once verified.
Regression risk: Medium — auth path.
Status: UNVERIFIED / NEEDS TESTING (backend divergence confirmed; frontend BFF normalization not yet fully traced end-to-end in this audit pass)

### ID: CONTRACT-03
Severity: P2
Category: Contract mismatch risk
Location: Frontend: any component consuming `enrollmentStatus`, course/exam/roadmap `status`, or quiz question `type`. Backend: as documented above (three different enrollment-status-shaped enums; no enum at all for course/exam/roadmap status; two non-identical `QuestionType` enums).
Problem: The backend itself has multiple similarly-named-but-different status/type concepts. A frontend TypeScript type or constant list that was written against one of these (e.g. assuming `EnrollmentStatus` always has values `ACTIVE/COMPLETED/DROPPED`) will silently mismatch wherever the *other* enrollment-status-shaped value (`GRANTED/PENDING_ACTION/DENIED` from `EnrollmentResultStatus`, or `REQUESTED/PENDING/GRANTED/DENIED/REVOKED` from the internal domain enum) is actually what's returned.
Why it matters: String-literal status comparisons (`status === 'ACTIVE'`) will silently fail (never match, or always fall through to a default/unknown branch) rather than throwing a visible error — the worst kind of contract drift because it degrades UI silently instead of crashing loudly.
Failure scenario: A course/exam/roadmap status badge renders as "Unknown" or falls into a default visual state for a real, valid status value the frontend's local type/constant list doesn't happen to include (especially plausible for roadmaps given the backend's own lowercase/uppercase casing inconsistency).
Recommended direction: Frontend TypeScript status/enum types for enrollment, course/exam/roadmap status, and quiz question type should be spot-checked field-by-field against the exact backend enums/literals documented above, not assumed correct. This needs a dedicated pass reading the actual frontend type files (`domains/*/types/*.ts` or equivalent) side-by-side with this document — not completed in this audit pass due to time/session constraints.
Implementation complexity: Small (verification) once done; fixes vary per mismatch found.
Regression risk: Low to verify, variable to fix.
Status: ARCHITECTURAL RISK — high plausibility given backend's own internal inconsistency, but specific frontend type files were not individually diffed against these enums in this pass. **Recommended as the first item in a follow-up focused contract-diff pass.**

### ID: CONTRACT-04
Severity: P2
Category: Security-relevant contract fact
Location: Backend `GlobalExceptionHandler.java:117-128`
Problem: In dev-mode configuration, the catch-all exception handler puts the full Java stack trace into the `message` field of the error JSON response.
Why it matters: If the frontend ever surfaces `error.message` directly to end users (a common pattern for generic error toasts), a dev-mode-configured environment would leak backend implementation details (class names, file paths, potentially query fragments) to the browser.
Recommended direction: Frontend error-handling code should never directly render `error.message` from a 500-class response without a generic fallback; confirm this is already the case in the current toast/error-boundary implementation (see [08_FRONTEND_PERFORMANCE_SCALABILITY_AUDIT.md](./08_FRONTEND_PERFORMANCE_SCALABILITY_AUDIT.md) and [07_FRONTEND_IAM_SECURITY_AUDIT.md](./07_FRONTEND_IAM_SECURITY_AUDIT.md) for related error-handling findings). This is primarily a backend hardening item (disable in production config) but the frontend should not assume `message` is always safe to display.
Implementation complexity: Small.
Regression risk: Low.
Status: CONFIRMED SECURITY ISSUE (backend-side; frontend implication flagged for awareness)

### ID: CONTRACT-05
Severity: P3
Category: Contract gap
Location: Backend: `GET /api/v1/sessions` (`SessionController.java`, real, returns `List<SessionResponse>` grouped by refresh-token family). Frontend: `app/(authenticated)/settings/security/page.tsx` (mock session list).
Problem: The backend already exposes exactly the data the frontend is currently faking. See [06_FRONTEND_MOCK_DATA_INVENTORY.md](./06_FRONTEND_MOCK_DATA_INVENTORY.md) MOCK-02.
Recommended direction: Wire this specific screen to the real endpoint — it's one of the lowest-effort mock-to-real conversions identified in this audit since no new backend work is required.
Status: CONFIRMED ARCHITECTURAL VIOLATION (cross-ref MOCK-02)

## What this audit could not verify

Time/session constraints (the audit hit the account's session usage limit mid-run) meant the deep field-by-field diff of frontend TypeScript DTOs against backend DTOs — item CONTRACT-03 above — was scoped but not completed exhaustively. The backend-side contract in this document is solid ground truth (extracted directly from controller/DTO/enum source). The frontend-side type files were not individually read and diffed against every backend DTO listed here. **Recommended first step of any follow-up**: grep `domains/*/types/*.ts` (or wherever frontend response types live) for `EnrollmentStatus`, course/exam/roadmap status literals, and `QuestionType`, and diff each against the exact backend values in this document.
