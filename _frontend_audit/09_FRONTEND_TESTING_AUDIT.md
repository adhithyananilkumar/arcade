# 09 — Frontend Testing & Accessibility Audit

Scope: `E:\arcade\ui`. Audit-only, no source files modified. All findings grounded in direct search evidence (searches excluded `node_modules` and the `.claude/worktrees/**` mirror directory).

---

## 1. Test inventory

```
ID: TEST-000
Severity: P0
Category: Test coverage / infrastructure
Location: entire repository
Problem: There is no automated test suite of any kind. No unit tests, no component tests, no integration tests, no E2E tests, no accessibility tests, no visual regression tests, and no test runner configuration exist anywhere in the working tree.
Evidence:
  - `find . -iname "*.test.ts*" -o -iname "*.spec.ts*"` → 0 results
  - `find . -type d -iname "__tests__"` → 0 results
  - `find . -iname "jest.config*" -o -iname "vitest.config*" -o -iname "playwright.config*" -o -iname "cypress.config*"` → 0 results
  - `find . -type d -iname "*e2e*" -o -iname "cypress"` → 0 results
  - package.json has no test-related dependency (no jest, vitest, @testing-library/*, playwright, cypress, msw) and no `"test"` script — `scripts` only contains `dev`, `build`, `start`, `lint`.
Why it matters: A ~634-file application spanning authentication, Platform Console (admin/authorization), content authoring (tiptap/excalidraw/konva), course publishing, exam delivery, enrollment, roadmap, and event management has zero automated verification of any business-critical invariant. Every deploy relies entirely on manual testing and the type checker (which itself currently fails to build, see 08's PERF-005/DEP-001).
Failure scenario: A refactor of the auth-refresh logic in infrastructure/http/api.ts (already has documented subtle races — see the comment in AuthInitializer.tsx about oauth2/redirect racing the cookie refresh) silently breaks session persistence for a subset of users, and nothing catches it before production.
Affected users/features: Everything.
Recommended direction: Do not attempt to reach broad coverage. Establish a minimal test harness (Vitest + React Testing Library for unit/component; Playwright for E2E) and target the specific zero-coverage business-critical flows enumerated in §2 below, in priority order.
Implementation complexity: Medium to stand up tooling; Large to build out meaningful coverage across all flagged flows.
Regression risk: None (additive).
Dependencies: None.
Status: CONFIRMED PROBLEM
```

## 2. Critical flows with zero test coverage, prioritized

All of the following are unverified by any automated test, per TEST-000. Ordered by business risk, with the specific code path inspected.

```
ID: TEST-001
Severity: P0
Category: Authentication
Location: infrastructure/auth/auth.store.ts, infrastructure/auth/auth.service.ts, infrastructure/http/api.ts (401 refresh-and-retry logic), apps/core/components/AuthInitializer.tsx
Problem: The token refresh flow — including the documented race between AuthInitializer's cookie-based refresh and the OAuth2 redirect handshake, and api.ts's single-flight `refreshPromise` dedup for concurrent 401s — has no test coverage.
Evidence: AuthInitializer.tsx contains an explicit code comment describing a race condition that was previously hit in production ("Running the cookie-based refresh here too races it... clobbers the session the redirect handler just established"). A bug significant enough to leave an inline explanatory comment is exactly the kind of regression a test should pin down.
Why it matters: Auth is the single most consequential flow to get wrong — a regression here means users get logged out unexpectedly, or worse, see another session's stale state.
Failure scenario: A future change to AuthInitializer's pathname check reintroduces the exact race already documented and fixed once.
Recommended direction: Unit/integration test for api.ts's concurrent-401 refresh dedup (mock fetch, fire two parallel requests that both 401, assert only one refresh call happens); a Playwright test for the OAuth2 redirect vs. cookie-refresh race described in the comment.
Implementation complexity: Medium.
Regression risk: None (additive).
Dependencies: TEST-000.
Status: CONFIRMED PROBLEM
```

```
ID: TEST-002
Severity: P0
Category: Authorization / Platform Console access
Location: No middleware.ts found anywhere in the repo; route protection appears to be entirely client-side (AuthInitializer sets auth status, presumably individual pages/layouts branch on it)
Problem: `find . -iname "middleware.ts"` returns zero results — there is no Next.js middleware performing server-side route protection. Authorization for admin/Platform Console routes (app/(authenticated)/console/**) and role-gated UI appears to rely entirely on client-side checks against the zustand auth store (which, per 08's STATE-002, may itself hold stale role data).
Evidence: No middleware.ts in the repo; console routes live under app/(authenticated)/console/ as ordinary client components.
Why it matters: This is the most sensitive area for a testing gap: no automated test verifies that a non-admin user cannot reach Platform Console functionality, and there's no server-enforced boundary to fall back on if a client-side check is missed or bypassed on a new route.
Failure scenario: A new console page is added without wiring up the client-side role check (easy to forget since there's no server-side enforcement layer as a backstop), and any authenticated user — not just admins — can navigate to it directly by URL.
Affected users/features: Platform Console (iam, content-manage, exam-schedules, inbox), and any other role-gated route.
Recommended direction: (1) As a testing matter: add Playwright tests that attempt to access every console route as a non-admin authenticated user and assert redirect/denial. (2) As an architectural matter (cross-reference to 08): confirm whether the backend independently enforces authorization on every API call reachable from these routes — if the frontend is the only gate, that is a P0 security concern beyond the scope of "testing" and should be raised separately.
Implementation complexity: Medium for tests; unknown for the architectural question (needs backend confirmation).
Regression risk: None (additive).
Dependencies: TEST-000.
Status: CONFIRMED PROBLEM (test gap) / UNVERIFIED (whether backend independently enforces this — flagging, not asserting a vulnerability)
```

```
ID: TEST-003
Severity: P1
Category: Content creation / course publishing
Location: apps/creator/editor/** (tiptap-based editor, ArcadeEditor.tsx, uploadQueueStore.ts), domains/learning/delivery/components/PublishCourseDialog.tsx, domains/publishing/components/ContentStatusHistoryModal.tsx
Problem: The content authoring pipeline (rich text blocks, custom quiz/exam/toggle/section tiptap node extensions under domains/courses/blocks/**, media upload queue, publish/status-transition flow) has no test coverage — not even for the custom tiptap node schemas, which are exactly the kind of code where a broken schema silently corrupts saved content.
Evidence: No test files anywhere under apps/creator/editor/ or domains/courses/blocks/.
Why it matters: A malformed custom node extension (e.g. domains/courses/blocks/quiz/native/QuizBlock.ts) can corrupt a document on save with no automated check to catch it before an author loses work or publishes broken content.
Failure scenario: A tiptap extension version bump (the codebase pins exact tiptap versions via `overrides` in package.json, suggesting past pain with this) changes node serialization and the custom quiz/exam blocks silently fail to round-trip.
Recommended direction: Unit tests for each custom tiptap extension's `toJSON`/`parseHTML`/schema round-trip; an integration test for the publish-course flow's status transitions.
Implementation complexity: Medium–Large.
Regression risk: None (additive).
Dependencies: TEST-000.
Status: CONFIRMED PROBLEM
```

```
ID: TEST-004
Severity: P1
Category: Review workflow
Location: domains/publishing/components/ContentStatusHistoryModal.tsx, app/(authenticated)/console/content-manage/[courseId]/page.tsx (suspend/publish actions implied by content-manage tabs `PUBLISHED`/`SUSPENDED`)
Problem: Content review/approval/suspension state transitions (visible from the `activeTab: 'PUBLISHED' | 'SUSPENDED' | 'CATEGORIES'` state in content-manage/page.tsx) have no test coverage verifying that only valid transitions are allowed or that the UI correctly reflects a course's actual review status.
Why it matters: Incorrect status handling could let unreviewed/suspended content remain visible to learners, or block legitimate content from being published.
Recommended direction: Component tests around the status-transition actions and an integration test asserting suspended content is not reachable by learners.
Implementation complexity: Medium.
Regression risk: None.
Dependencies: TEST-000.
Status: CONFIRMED PROBLEM
```

```
ID: TEST-005
Severity: P1
Category: Enrollment
Location: infrastructure/auth/auth.store.ts (`enrolledCourses` on User), learner-facing enrollment UI (not individually enumerated here)
Problem: Enrollment state — read from the persisted user object per 08's STATE-002 — has no test coverage verifying it updates correctly after an enrollment action, which is doubly risky given STATE-002's finding that this data can go stale in the persisted store.
Why it matters: A learner could enroll in a course and not see it reflected (or see a stale enrolled-courses list) with no test catching the regression.
Recommended direction: Integration test: enroll -> assert UI reflects new enrollment without requiring a full page reload/re-login.
Implementation complexity: Medium.
Regression risk: None.
Dependencies: TEST-000, 08's STATE-002.
Status: CONFIRMED PROBLEM
```

```
ID: TEST-006
Severity: P1
Category: Exams
Location: app/(authenticated)/exam/page.tsx, app/(authenticated)/learn/exam/[examId]/start/page.tsx, app/(authenticated)/studio/course/[courseId]/exam/[examId]/config/ExamBlueprintEditor.tsx, domains/courses/blocks/exam/**
Problem: Exam-taking and exam-configuration flows — arguably the highest-stakes learner-facing feature for correctness (scoring, time limits, question presentation) — have no test coverage.
Why it matters: A bug in exam start/submission (e.g. a timer edge case, a question-shuffling bug, a submission race) directly affects grading integrity with no automated check.
Recommended direction: Component tests for ExamBlueprintEditor's constraint validation; an integration test for the full start-to-submit exam flow including timer expiry behavior.
Implementation complexity: Medium–Large.
Regression risk: None.
Dependencies: TEST-000.
Status: CONFIRMED PROBLEM
```

```
ID: TEST-007
Severity: P2
Category: Roadmap
Location: features/roadmap/renderer/**, domains/roadmaps/**, domains/roadmaps/components/PublishConfirmationModal.tsx, SaveAsTemplateModal.tsx
Problem: Roadmap creation/viewing/publishing (recently merged into the unified content model per CLAUDE.md's noted 2026-07-21 architecture change) has no test coverage, including the roadmap-specific zustand store (`useRoadmapViewerStore.ts`) and Context (`RoadmapStore.tsx`).
Why it matters: This is a recently-restructured feature area (per the CLAUDE.md exception note), which is exactly when regressions are most likely and test coverage is most valuable.
Recommended direction: Component tests for the roadmap viewer store's state transitions; an integration test for publish-confirmation flow.
Implementation complexity: Medium.
Regression risk: None.
Dependencies: TEST-000.
Status: CONFIRMED PROBLEM
```

```
ID: TEST-008
Severity: P2
Category: Event management
Location: app/(authenticated)/studio/events/api/{collaboration,dashboardApi,discoveryApi,event}.ts, app/(authenticated)/studio/content/[contentType]/[contentId]/components/sections/EventPricingSection.tsx, RegisteredMembersSection.tsx
Problem: Event creation, pricing configuration, and registration management have no test coverage, including pricing calculation logic (per 08's FORM-001, pricing validation appears hand-rolled rather than schema-driven, which makes it more test-worthy, not less).
Why it matters: Pricing/registration bugs have direct monetary and user-facing impact.
Recommended direction: Unit tests for pricing calculation/validation logic; integration test for registration flow.
Implementation complexity: Medium.
Regression risk: None.
Dependencies: TEST-000.
Status: CONFIRMED PROBLEM
```

```
ID: TEST-009
Severity: P3
Category: Payments
Location: Not conclusively located — EventPricingSection.tsx suggests pricing config exists, but no dedicated payment/checkout flow was found in this pass
Problem: No payment/checkout-specific code path was identified with confidence in this pass (event pricing configuration was found, but a learner-facing "pay for enrollment" flow was not conclusively located or ruled out).
Recommended direction: Confirm with the team whether a payment flow exists in this frontend (vs. being entirely backend/external, e.g. a hosted checkout redirect) before scoping test work here.
Status: UNVERIFIED / NEEDS TESTING
```

---

## 3. Accessibility pass (engineering-level defects, not a redesign)

```
ID: A11Y-001
Severity: P1
Category: Accessibility / focus management
Location: domains/channels/components/CreateChannelModal.tsx, app/(public)/founders/FounderModal.tsx (representative — not necessarily exhaustive of all modals)
Problem: These two modals are hand-rolled with plain `<div className="fixed inset-0 z-50 ...">` overlays rather than using the project's own `shared/design-system/ui/dialog.tsx` primitive (which wraps `@base-ui/react/dialog` and gets focus trapping, `aria-modal`, and Escape-to-close for free). Neither has a `role="dialog"`/`aria-modal` attribute, and no `onKeyDown`/Escape handler or focus-trap logic was found in either file.
Evidence: `grep -n "role=\|tabIndex\|onKeyDown\|Escape\|<div"` on both files returns only layout `<div>`s — no `role`, no `tabIndex`, no `onKeyDown`, no `Escape` handling in either file. Compare against shared/design-system/ui/dialog.tsx which delegates all of this to `@base-ui/react/dialog`'s `DialogPrimitive.Root`/`Backdrop`/`Popup`.
Why it matters: Keyboard and screen-reader users cannot reliably close these modals via Escape, focus is not trapped inside them (tab order likely leaks to background content), and screen readers are not told a dialog has opened (`role="dialog"`/`aria-modal="true"` missing) or where focus should land on open.
Failure scenario: A keyboard-only user opens "Create Channel," tabs past the modal's last field, and lands on background page content still visible (but supposedly obscured) behind the modal overlay, with no way to Escape back.
Affected users/features: Channel creation flow, founders profile modal (public-facing), and potentially any other modal not built on the shared dialog.tsx primitive — `grep -rl "role=\"dialog\"\|aria-modal"` across the whole codebase returns only 2 files total (app/(authenticated)/profile/page.tsx, features/roadmap/renderer/components/HoverPreview.tsx), suggesting most of the ~20 modal/dialog components found do not explicitly declare these ARIA attributes even where base-ui might supply them implicitly — worth a full sweep.
Recommended direction: Migrate hand-rolled modals onto the existing shared/design-system/ui/dialog.tsx primitive rather than building bespoke focus/keyboard handling per modal.
Implementation complexity: Medium (per-modal migration, ~20 modal components exist per the inventory in 08).
Regression risk: Low–Medium (visual/behavioral changes possible per modal; needs visual QA).
Dependencies: None.
Status: CONFIRMED BUG
```

```
ID: A11Y-002
Severity: P2
Category: Accessibility / semantics
Location: Codebase-wide — 33 occurrences of `<div ... onClick` found across `.tsx` files
Problem: 33 instances of a `<div>` carrying an `onClick` handler were found, which (unless each one also carries `role="button"`, `tabIndex={0}`, and a keyboard handler — not verified per-instance in this pass) are not keyboard-operable and not announced as interactive to assistive technology.
Evidence: `grep -ro "<div[^>]*onClick" --include="*.tsx"` → 33 matches (the FounderModal.tsx sample above includes one such div, `className="relative group cursor-pointer mt-2"`, used as an avatar-upload trigger with no visible `role`/`tabIndex` in the surrounding lines).
Why it matters: Keyboard-only and screen-reader users cannot activate these controls at all if they lack `role="button"` + `tabIndex` + Enter/Space handling — this is a binary functional exclusion, not a cosmetic issue.
Recommended direction: Sweep the 33 sites; replace with a native `<button>` where feasible (simplest, most robust fix), or add `role="button" tabIndex={0}` plus `onKeyDown` handling for Enter/Space where a `<button>` isn't stylistically viable.
Implementation complexity: Small per-site, Medium in aggregate.
Regression risk: Low.
Dependencies: None.
Status: CONFIRMED BUG (pattern confirmed; per-instance keyboard-accessibility not individually verified — some of the 33 may already have compensating attributes not captured by this grep)
```

```
ID: A11Y-003
Severity: P2
Category: Accessibility / labeling
Location: Codebase-wide — 35 files use `aria-label`, out of hundreds of interactive components (~20 modals, many icon-only buttons implied by `lucide-react` usage throughout)
Problem: `aria-label` usage is present but sparse relative to the size of the codebase (634 source files). Icon-only buttons (a common pattern given `lucide-react` is used extensively) are a frequent source of missing accessible names when not paired with `aria-label` or visually-hidden text.
Evidence: `grep -rl "aria-label" --include="*.tsx"` → 35 files, against 634 total source files.
Why it matters: An icon-only button (e.g. a close "X" icon on a modal, per `XIcon` imported in shared/design-system/ui/dialog.tsx) with no accessible name is announced as "button" with no description to screen reader users.
Recommended direction: Audit icon-only buttons specifically (search for `<Button` containing only an icon child, no text) and ensure each has an `aria-label` or equivalent.
Implementation complexity: Small per-site, Medium in aggregate.
Regression risk: Low.
Dependencies: None.
Status: UNVERIFIED / NEEDS TESTING (usage count is confirmed low relative to codebase size; exhaustive per-button verification not performed)
```

```
ID: A11Y-004
Severity: P3
Category: Accessibility / positive finding
Location: shared/design-system/ui/dialog.tsx
Problem: N/A — noting as a positive control point, not a defect.
Evidence: The shared dialog primitive correctly delegates to `@base-ui/react/dialog`, which provides focus trapping, `aria-modal`, and Escape-to-close out of the box.
Why it matters: This confirms the project has good accessibility primitives available — the gap (A11Y-001) is that not all modals use them, not that the primitives are missing.
Recommended direction: Enforce via lint/code-review that new modals must be built on shared/design-system/ui/dialog.tsx rather than hand-rolled overlays.
Status: TECHNICAL DEBT (process/enforcement gap, not a code defect)
```

No color-contrast analysis was performed in this pass (would require rendering and measuring actual computed colors across the design system's theme tokens, which is out of scope for a static code audit) — flagging as **UNVERIFIED / NEEDS TESTING** rather than fabricating a contrast-ratio finding.

---

## Summary

- Automated tests found: **0** (no unit, component, integration, E2E, a11y, or visual regression tests; no test runner configured).
- 9 critical business flows identified with zero coverage, prioritized P0 (auth, authorization/Platform Console) down to P3 (payments — flow not conclusively located).
- No `middleware.ts` exists — route/role protection for Platform Console appears to be entirely client-side, which is both a testing gap (TEST-002) and a question worth raising with the team about server-side enforcement.
- Accessibility: the project has a solid primitive (`@base-ui/react/dialog`-backed `shared/design-system/ui/dialog.tsx`) but at least 2 sampled modals bypass it entirely with no keyboard/ARIA handling (A11Y-001), 33 `<div onClick>` sites need a keyboard-accessibility sweep (A11Y-002), and `aria-label` usage is sparse relative to codebase size (A11Y-003).
