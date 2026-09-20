# 06 — Frontend Mock Data Inventory

Scope: `E:\arcade\ui`. Audit only — no mock data removed or wired to real endpoints.

## Methodology

Grepped the full tree (excluding `node_modules`/`.next`/`.git`/`.claude`/worktrees) for mock/dummy/fake/hardcoded markers and for `const XxxData/List/Items = [` literal-array patterns. Cross-checked against `domains/*/api/*.ts` and `apps/*/orchestrators` for real `api.get/post/put/patch/delete` calls to establish ground truth. Read full source of ~25 files to classify entanglement and swap-difficulty.

Note: a duplicate copy of the entire repo exists at `.claude\worktrees\agent-a40856fc28d56ab27\` — same findings would apply there; this audit covers only the canonical tree at `E:\arcade\ui\`. The presence of a stale worktree copy is itself worth a housekeeping check (see [10_FRONTEND_DEAD_CODE_AUDIT.md](./10_FRONTEND_DEAD_CODE_AUDIT.md)).

## Ground truth: which domains have a real API layer

Confirmed via `domains/*/api/*.ts` and top-level `domains/*/api.ts`:

- **REAL, wired to backend**: `channels`, `community` (forum), `enrollment`, `identity` (incl. `identity/api/iam`), `learning/delivery`, `learning/progress`, `notifications`, `organizations`, `payment`, `publishing` (creator + platformReview), `assessments` (quiz taking/authoring, question banks), `badges` (CRUD), `roadmaps` (roadmap/progress/collaboration/template services).
- **NO API layer at all** (zero backend calls anywhere in the domain): `domains/iam` (policy-editor, bundle-engine, dependency-engine, store) — the entire policy-editor sub-feature operates purely on client-side simulated state.

**Key structural conclusion**: the domain/service layer itself is mostly real and well-formed. The fakeness is concentrated at the *page/component* level — either in features bypassing an existing real API, or in features where no backend endpoint exists yet at all.

## Site count by feature area

| Area | Distinct mock sites | Verdict |
|---|---|---|
| Channel manage deep-dive tabs (`app/(authenticated)/channels/[id]/manage/components/*`) | 9 files + StaffDetailsModal + SmallCourseOverview | Fully fake, entangled |
| Notifications full page (`/notifications`) | 1 (7-item seed array) | Fully fake, entangled — despite a real `NotificationService` existing and being used elsewhere |
| Leaderboard (`/leaderboard`) | 1 (procedurally generated fake roster) | Fully fake, entangled — no backend endpoint exists |
| Achievements (`/achievements`) | 1 (badges/certificates/quests arrays) | Fully fake, entangled — no backend endpoint exists |
| Learn course page curriculum/reviews (`/learn/[courseId]`) | 2 (MODULES, REVIEWS) | Partially fake — course header is real, curriculum+reviews are fake, same file |
| Studio course analytics (`LearnersAnalyticsSection.tsx`) | 4 (learners, assessments, feedbacks, certificates) | Fully fake, entangled |
| Settings → Security sessions | 1 (hardcoded device-session list + fake phone number) | Partially fake — audit log list is real, sessions/2FA/phone are fake, same file |
| IAM policy editor internals (`domains/iam/policy-editor/*`) | 2 (risk-level indicator, "origin" badge logic) | Small mock-logic bits, but the whole domain has zero backend wiring |
| Public/landing marketing pages | ~4 | Low priority — decorative UI mockups on marketing pages, not data-driving app screens |
| `public/mock-questions.json` | 1 static fixture file | Likely a leftover/dev fixture — needs confirmation of use before removal |

Distinct genuine mock-data sites driving a real authenticated screen: **~22-25**.

## Top significant sites

1. **`app/(authenticated)/notifications/page.tsx:48-126`** (1044-line file) — `useState<NotificationItem[]>([...7 hardcoded items...])`, no `useEffect`, no `api.*` call anywhere in the file. **Swap verdict: NO** without restructuring, but the real service already exists (`domains/notifications/api/notification.service.ts`, confirmed used correctly by `domains/community/components/NotificationPanel.tsx`) — this is the clearest case of "backend service exists, this specific consumer just never calls it."

2. **`apps/learner/components/leaderboard/LeaderboardPage.tsx`** (558 lines) — hardcoded avatars (Unsplash URLs), names, a procedural `buildTop20()` generator, fake "You" fallback row, monthly archive data. Zero `api.*` calls. **Swap verdict: NO** — no leaderboard/XP-ranking endpoint exists anywhere in `domains/*/api`; needs new backend work, not just a fetch swap.

3. **`apps/learner/components/achievements/AchievementsPage.tsx`** (1027 lines) — hardcoded badges/certificates/quests arrays plus hardcoded `totalXp`/`level`/`nextLevelXp` constants. Only real call is `UserService.getMe()` for profile display. **Swap verdict: NO** — no learner-earned-badge/certificate/XP endpoint exists (the real `badges` API is course-authoring only, not learner-earned badges); needs new backend endpoints.

4. **`app/(authenticated)/learn/[courseId]/page.tsx:102,176`** (1098 lines) — hardcoded `MODULES` (curriculum) and `REVIEWS` arrays, in the *same file* that makes real calls (`api.get` for course detail, `UserService.getMe()`, `api.post` for reports). **Swap verdict: NO** for these two sections specifically — inline consts baked directly into a 1098-line God component; would need both a backend curriculum/review payload and JSX changes to consume it.

5. **`app/(authenticated)/settings/security/page.tsx:37,41-59`** — hardcoded active-sessions list and a hardcoded placeholder phone number, in the same file where the audit-log table is genuinely wired (`AuditService.getUserAuditLogs`). **Swap verdict: NO** for sessions — no session-list endpoint is called here (note: the backend *does* have `GET /api/v1/sessions`, per [12_FRONTEND_BACKEND_CONTRACT_AUDIT.md](./12_FRONTEND_BACKEND_CONTRACT_AUDIT.md) — this is a real backend endpoint the frontend simply isn't calling, an easier fix than it first appears).

6. **`app/(authenticated)/studio/content/[contentType]/[contentId]/components/sections/LearnersAnalyticsSection.tsx`** (452 lines) — four inline `MOCK_*` consts (learners, assessments, feedbacks, certificates), no `api.*` calls in the file at all, no corresponding `api/` module for this feature. **Swap verdict: NO** without restructuring, and no backend endpoint confirmed to exist for this shape yet.

7-15. **Channel manage deep-dive tabs** — `app/(authenticated)/channels/[id]/manage/components/`: `StaffManagementSection.tsx`, `WebinarManagementSection.tsx`, `EventsManagementSection.tsx`, `BootcampManagementSection.tsx`, `ArticlesManagementSection.tsx`, `ReviewsFeedbackSection.tsx`, `OrganizationAnalyticsSection.tsx`, `AIInsightsPanel.tsx`, `RecentActivityTimeline.tsx`, `StaffDetailsModal.tsx`, `SmallCourseOverview.tsx` — every one of these seeds `useState(mockX)` directly in the component body, mixed with tab-local filtering/sorting logic and JSX.
   - Notably, `StaffManagementSection.tsx` uses fake staff data despite `domains/channels/api/channel-staff.service.ts` being a real, working service already used by the *sibling* `ChannelStaffManager.tsx` one level up in the same feature — a textbook case of a real service existing but this specific consumer not calling it.
   - The **parent shell**, `app/(authenticated)/channels/[id]/manage/page.tsx`, is fully real (`channelService.getChannel/getMyChannelPermissions/getMyDeletionRequests/getChannelContent`). This produces an unusually clean split: **real orchestration at the top, 100% fake leaves underneath** — meaning each tab can plausibly be swapped independently without touching the shell, but each tab's internals need restructuring first (data currently lives in local `useState` literals, not props/hooks).
   - **Partial exception**: `CourseManagementSection.tsx` (916 lines) already has a real-fetch-with-fallback pattern — it calls `api.get('/api/v1/channels/{channelId}/content')` when a `channelId` is present, falling back to its exported `mockContent` array only when it isn't. This is the one genuinely clean boundary in the group — swap = delete the fallback branch. Its problem is elsewhere: two sibling files (`SmallCourseOverview.tsx`, `StaffDetailsModal.tsx`) import the raw `mockContent` array directly from this file instead of receiving data via props, so those two need a prop-threading fix even after the source goes fully real.

16-17. **IAM policy editor internals** — `domains/iam/policy-editor/PermissionTree.tsx:80` (comment: "Risk Indicator (Mocked for Leaf nodes)") and `domains/iam/policy-editor/EffectivePermissionsModal.tsx:50` (comment: "Origin Indicator (Mock logic)") — both operate on purely client-derived state (`domains/iam/store/policy-editor.store.ts`) with zero backend calls anywhere in the domain. **Swap verdict: NO** — this isn't a fetch-swap problem, it needs backend design work first (a "where did this permission come from" / "risk level" concept doesn't exist server-side yet).

18. **`app/(authenticated)/roadmaps/page.tsx:129`** `MAIN_CATEGORIES` — likely a legitimate UI filter-taxonomy constant (id/label/icon/color), not fixture data. Lower priority; worth a quick manual confirmation but not flagged as high-severity fake data.

19. **`public/mock-questions.json`** — standalone 50-question fixture JSON. No import reference found in the areas reviewed; possibly dead/dev-only. Should be checked against the exam-taking flow (`domains/assessments`) before any decision to remove it.

20. **`domains/courses/blocks/exam/ExamNodeView.tsx:10`** — comment "Generate a temporary mock ID if one doesn't exist," editor-only placeholder-ID logic. Low severity, contained to the course-editor block system.

21-23. **Low-priority / false-positive-leaning "mock" hits**: `apps/public/components/landing/creators/CreatorDashboard.tsx` (CSS classes literally named `mock-syllabus-list`/`mock-syllabus-item` — a decorative dashboard illustration on the marketing landing page, not a real screen), `CreatorPublishing.tsx` ("3D Flipping Mockup UI Card" — decorative), `CourseShowcase.tsx` ("Top/Bottom Bar Mock Overlays" — decorative), `apps/public/components/explore/CategoryDetailedView.tsx:851-893` (`editorMock` — a fake code-editor animation for marketing, not user data).

## Areas confirmed REAL (worth stating explicitly — contradicts a blanket "everything's mocked" assumption)

`console/reviews`, `console/reviews/[id]`, `console/payments`, `console/inbox`, `console/exam-schedules`, `console/content-manage` (+ `[courseId]`), `console/iam/UsersList.tsx`, `console/iam/PolicyManager.tsx`, `exam/page.tsx`, `apps/core/components/ExploreHub.tsx`, `components/explore/CategoryDetailedView.tsx` (stats section), `shared/hooks/usePublicCategories.ts`, and the channel-manage *shell* page (as distinct from its tabs) are all genuinely wired to real backend calls. One note: `console/reviews/page.tsx` and `[id]/page.tsx` inline `AuthorizationService.canReviewContent` permission logic directly in the page component — not a mock-data issue, but a permission-logic-placement issue; see [07_FRONTEND_IAM_SECURITY_AUDIT.md](./07_FRONTEND_IAM_SECURITY_AUDIT.md).

`shared/hooks/usePublicCategories.ts` is worth calling out as the **model pattern**: a clean-boundary hook with a real `api.get('/api/v1/public/categories')` call and a silent catch; the hook's own comment notes a caller may keep a static fallback category list for when the fetch fails/empties — that's an acceptable, isolated fallback, not entangled mock data.

## "Can mock be swapped for real API without rewriting UI?" — per area

| Area | Verdict | Why |
|---|---|---|
| Notifications full page | **NO** | Inline `useState` seed inside a 1044-line God component; real service exists and is unused here |
| Leaderboard | **NO** | No backend endpoint exists at all |
| Achievements | **NO** | No learner badge/cert/XP endpoint exists |
| Learn course page (modules/reviews) | **NO** | Inline consts in a 1098-line God component; course-level fetch already exists but doesn't cover curriculum/reviews |
| Settings security (sessions) | **NO** (but backend endpoint already exists — `GET /api/v1/sessions`) | Frontend simply never calls it; lower-effort fix than most on this list |
| Studio learners analytics | **NO** | Fully inline `MOCK_*` consts, no `api/` module for this feature at all |
| Channel manage tabs (9 files) | **NO** per tab | Each seeds `useState(mockX)` directly, mixed with tab-local logic; shell above them is clean, so per-tab swap is plausible once each tab is restructured |
| `CourseManagementSection.tsx` | **YES / PARTIAL** | Already has the real-fetch-with-fallback pattern; two dependents need prop-threading fixes |
| IAM policy editor internals | **NO** | No backend concept for "risk level" / "permission origin" exists yet — needs backend design work, not just a fetch swap |
| `usePublicCategories` hook | **YES** | Already a clean-boundary hook with a real endpoint wired |

## Data-shape red flags (UI-only fields baked directly into "data")

- **Achievements `BADGES`**: `type: 'sword-crown' | 'potion' | ...` — a string key selecting hand-drawn inline SVG artwork, not a shape a REST badge endpoint would plausibly return as-is.
- **Leaderboard `AVATARS`**: raw hardcoded Unsplash photo URLs standing in for user avatars, not derived from `user.avatarUrl`.
- **`StaffManagementSection.mockStaff`**: includes `performanceScore`, `articlesPublished`, `webinarsConducted`, `bootcampsManaged` — a specific aggregate shape that would require several backend joins to produce for real; the UI currently assumes it arrives as flat fields.
- Several files (leaderboard's `PLACE_TONE` and similar) bake presentation concerns (hex/tailwind tone-per-rank maps) directly alongside "data" records in the same const — a sign that when real data does arrive, the presentation logic will need to be pulled back out.

## Findings requiring the standard format

### ID: MOCK-01
Severity: P1
Category: Architecture
Location: 9 files under `app/(authenticated)/channels/[id]/manage/components/`
Problem: Every deep-dive management tab under a real, correctly-wired channel-manage shell independently seeds `useState` from an inline mock array, mixing fake data with tab-local business logic and JSX in the same file.
Evidence: See "Top significant sites" #7-15 above.
Why it matters: This is the single largest concentration of "can't swap without rewrite" mock data in the app, and it sits directly behind a page that already proves the real orchestration pattern works one level up.
Failure scenario: Backend team ships the real per-tab endpoints; frontend engineer discovers each of the 9 tabs needs its own rewrite rather than a one-line data-source swap, disproportionately to the actual UI complexity.
Recommended direction: Before wiring real data, refactor each tab to accept data via props/hook rather than local `useState(mockX)`, mirroring the shell's already-correct pattern. Prioritize `StaffManagementSection.tsx` first since its real backing service (`channel-staff.service.ts`) already exists.
Implementation complexity: Medium (9 files, each independently entangled, but the pattern to apply is repetitive/mechanical).
Regression risk: Medium — user-facing analytics tabs, easy to introduce a visible blank/loading state regression if not careful.
Dependencies: None blocking; independent of other domains.
Status: CONFIRMED ARCHITECTURAL VIOLATION

### ID: MOCK-02
Severity: P2
Category: Missed integration
Location: `app/(authenticated)/notifications/page.tsx:48-126`, `app/(authenticated)/settings/security/page.tsx:41-59`
Problem: Both screens use inline mock data despite a real, working backend endpoint already existing for the same data (`NotificationService` / `GET /api/v1/sessions`).
Evidence: See sites #1 and #5 above.
Why it matters: These are the lowest-effort wins in the entire mock-data backlog — no new backend work needed, just wiring an existing service and restructuring the local `useState` seed into a fetch.
Recommended direction: Prioritize these two ahead of anything requiring new backend endpoints (leaderboard, achievements, studio analytics).
Implementation complexity: Small-medium (notifications page is a 1044-line God component, so wiring real data is a good forcing function to also split it up).
Regression risk: Low-medium.
Dependencies: None.
Status: CONFIRMED ARCHITECTURAL VIOLATION

### ID: MOCK-03
Severity: P3
Category: Housekeeping
Location: `public/mock-questions.json`
Problem: Standalone fixture file with no confirmed import reference found.
Recommended direction: Confirm via a full grep of `domains/assessments` whether anything fetches this file directly (e.g. via a raw path); if unused, remove.
Implementation complexity: Trivial once confirmed.
Regression risk: None if genuinely unused.
Status: UNVERIFIED / NEEDS TESTING
