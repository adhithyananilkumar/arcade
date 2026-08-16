# Frontend Duplication Audit — Arcade UI

Audit date: 2026-08-16
Scope: `app/`, `apps/`, `components/`, `domains/`, `features/`, `shared/`, `infrastructure/`, `lib/` (634 source files). Read-only; no source files touched. Cross-referenced against `E:\arcade\ui\_frontend_audit\FRONTEND_INVENTORY.md`, which independently confirms several of the counts used below (HTTP client split, `components/ui` vs `shared/design-system/ui` split, 14 files with authorization logic outside the central service).

Method: whole-tree grep/glob for component-name patterns (`*Modal*`, `*Dialog*`, `*Table*`, `*Form*`, `*Card*`, `*Empty*`, `*Loading*`, `*Skeleton*`, `*Toast*`, `*Badge*`, `*Dropdown*`, `*Pagination*`, search/filter UI), for HTTP setup (`axios.create`, `fetch(`, `new Headers`), for permission/role logic (`hasPermission`, `canEdit`, `isAdmin`, `role ===`), for zod/validation, formatting utilities, toast usage, and type/constant collisions, followed by manual inspection of matched files to classify each instance.

Legend for classification used throughout: **(a)** intentional reuse — fine as-is · **(b)** accidental duplication of the same concern · **(c)** similar-but-legitimately-different · **(d)** copy-paste technical debt.

---

## Executive summary

This is not primarily a "634 files, therefore chaos" problem. Most of the raw file count is domain breadth (courses, community, roadmaps, badges, IAM, etc.), not duplicated concerns. The genuine duplication clusters around a small number of high-leverage seams:

1. **Two competing UI-primitive folders** (`components/ui/` vs `shared/design-system/ui/`), with `components.json` (the shadcn generator config) pointed at the wrong one.
2. **Authorization/permission logic implemented three different ways** — a service, a hook that reimplements the same check by hand, and copy-pasted `role === 'ADMIN'` string blocks duplicated 4x across 2 files.
3. **Two HTTP mechanisms inside `infrastructure/` itself** (fetch-based `api.ts` vs raw `axios` calls in `auth.service.ts`), plus a `shared/hooks` file that calls the API layer directly, which is a below-the-boundary violation per the project's own CLAUDE.md rule ("HTTP outside Infrastructure").
4. **No shared date-formatting utility** despite 5+ near-identical local `formatDate` implementations, while a genuinely good, reusable `shared/utils/money.ts` exists and is inconsistently bypassed.
5. **EmptyState and Skeleton components reinvented per-domain** with no shared primitive, despite a real design-system folder existing that could hold them.

Areas that looked suspicious on paper but turned out clean: **toast/notification usage** (single `sonner` instance, disciplined), **mock data** (none found in production component files), **drag-and-drop and state management** (single library each, no overlap).

---

## Findings

### DUP-001
**Severity:** P1
**Category:** Authentication / Permission logic
**Location:**
- `infrastructure/auth/authorization.service.ts:4-7` (canonical `AuthorizationService.hasPermission`)
- `domains/identity/hooks/usePermissions.ts:8-9` (independent re-implementation)
- `app/(public)/[username]/page.tsx:695-712` and `:738-755` (hardcoded role-string block, duplicated twice in the same file)
- `app/(authenticated)/profile/page.tsx:1023-1040` and `:1066+` (the same hardcoded role-string block, duplicated twice in the same file)
- `app/(authenticated)/channels/[id]/page.tsx:176-178`, `app/(authenticated)/channels/[id]/manage/page.tsx:154-155,192`, `app/(authenticated)/channels/[id]/manage/ChannelSettingsManager.tsx:43`, `app/(authenticated)/channels/[id]/manage/ChannelStaffManager.tsx:51` (raw inline `permissions.includes(...)` checks)

**Problem:** "Can this user do X" is implemented four distinct ways in the same codebase: (1) the canonical service `AuthorizationService.hasPermission`, which checks `user.permissions?.includes('ALL') || user.permissions?.includes(permission)`; (2) `usePermissions()`, a hook in `domains/identity` that reaches into `useAuthStore` directly and re-derives the identical `.includes('ALL')` logic by hand instead of calling `AuthorizationService`; (3) hardcoded `role === 'ADMIN' || role === 'ROLE_ADMIN' || role === 'PLATFORM_ADMIN' || isAdmin === true || role === 'CREATOR' || ...` blocks, copy-pasted verbatim 4 times across `[username]/page.tsx` and `profile/page.tsx`, which check a completely different signal (raw role string) than the permission-array approach used everywhere else; (4) scattered inline `permissions.includes('channel.xxx')` calls in the channel-management pages that bypass both (1) and (2).

**Evidence:**
```ts
// infrastructure/auth/authorization.service.ts:4-7
hasPermission: (user: User | null | undefined, permission: string) => {
  if (!user) return false;
  return user.permissions?.includes('ALL') || user.permissions?.includes(permission) || false;
},

// domains/identity/hooks/usePermissions.ts:8-9  (re-derives the same thing independently)
const hasPermission = (permission: string) =>
  user?.permissions?.includes('ALL') || (user?.permissions?.includes(permission) ?? false);
```
The `isAdmin` role-string block (profile/page.tsx, [username]/page.tsx, each duplicated twice) checks role name against a hardcoded whitelist that includes `'CREATOR'`/`'INSTRUCTOR'` as "admin" — a materially different and looser rule than `AuthorizationService`'s permission-array check.

**Why it matters:** CLAUDE.md's own review checklist explicitly names "Permission logic, hardcoded roles, or business rules in Frontend" as something to flag. Having three non-equivalent notions of "is this user privileged" means a permission change (e.g. revoking a role) can be reflected correctly in one UI surface and stale/wrong in another, because they don't all read the same source of truth or apply the same rule.
**Failure scenario:** An admin is demoted server-side (permissions array updated). Pages using `AuthorizationService`/`usePermissions` correctly hide admin UI. `profile/page.tsx` and `[username]/page.tsx`, which check `role === 'ADMIN'` string equality instead of the permissions array, may still show admin-only affordances if `role` wasn't also synced, or may incorrectly grant admin-like UI to any `CREATOR`/`INSTRUCTOR` role holder since that block treats those roles as admin-equivalent.
**Affected users/features:** Public profile pages, own-profile page, channel management (settings/staff) — meaningful blast radius, not an edge case.
**Recommended direction:** Make `infrastructure/auth/authorization.service.ts` the single canonical entry point. `usePermissions()` should call `AuthorizationService.hasPermission` instead of re-deriving the check. The `role === 'ADMIN' || ...` blocks in `profile/page.tsx` and `[username]/page.tsx` should be replaced with an explicit `AuthorizationService` call (adding a `canModerate`/`isPrivilegedRole`-style method there if the "is this a staff-ish role for badge/UI purposes" concept is genuinely different from platform permissions — but that decision should be made once, in the service, not four times inline).
**Implementation complexity:** Low for the hook (one-line delegation). Medium for the page-level blocks (need to confirm with product whether "show founder/staff badge" is supposed to follow permissions or role names before consolidating — don't silently narrow behavior).
**Regression risk:** Medium — these blocks gate visible UI (badges, admin affordances) on two of the most-trafficked pages; a bad consolidation could hide/show badges incorrectly. Needs manual QA against a real admin, creator, and regular-user account before merging any fix.
**Dependencies:** None blocking; purely a frontend refactor once the "role vs permission" semantics question above is answered.
**Status:** CONFIRMED DUPLICATION

---

### DUP-002
**Severity:** P1
**Category:** API client / HTTP layer
**Location:**
- `infrastructure/http/api.ts:1-164` (canonical fetch-based client, `api.get/post/patch/put/delete`, token refresh, `ApiError`)
- `infrastructure/auth/auth.service.ts:1` (`import axios from 'axios'`, bare `axios.post()` calls, no shared instance, no interceptors)
- `app/api/internal/auth/login/route.ts:14`, `app/api/internal/auth/logout/route.ts:22`, `app/api/internal/auth/refresh/route.ts:28` (three independent raw `fetch()` calls to the backend, no shared helper between them)
- `shared/hooks/usePublicCourses.ts` (18 lines total — imports `@/infrastructure/http/api` and calls `.get()` directly inside `useEffect`)

**Problem:** Two HTTP mechanisms coexist inside the `infrastructure/` layer that CLAUDE.md designates as the single adapter boundary: the documented fetch-based `api.ts`, and raw `axios` calls in `auth.service.ts` that don't use `axios.create()` — confirmed via grep, there are zero `axios.create(` call sites anywhere in the repo, so every `axios` call site repeats its own headers/`withCredentials` config by hand. Separately, the three Next.js BFF route handlers under `app/api/internal/auth/*` each hand-roll their own `fetch()` against the backend instead of sharing one server-side helper. And `shared/hooks/usePublicCourses.ts` calls `infrastructure/http/api` directly from `shared/`, which — per CLAUDE.md's own stated dependency direction (`app -> apps -> domains -> infrastructure -> shared`, with orchestration/side effects required to live in `apps/`) — is a layer that should not be making API calls at all.
**Evidence:** `axios.create(` — 0 matches repo-wide (confirmed by both this audit and the independent `FRONTEND_INVENTORY.md`, §3 table: "axios imported in exactly 1 file... fetch( used directly in 11 files"). `shared/hooks/usePublicCourses.ts` is a 4th, distinct pattern: a "shared" hook doing its own side effect rather than delegating to an `apps/` orchestrator.
**Why it matters:** A boundary that's "single source of truth" in the README but has two live, divergent implementations means auth-flow bugs (401 handling, refresh-token races, header consistency) have to be fixed in two places, and a `shared/` hook doing fetches directly means "shared" code is no longer side-effect-free, undermining the premise that `shared/` can be imported anywhere safely.
**Failure scenario:** A future change to token-refresh behavior (e.g. adding a new required header, changing cookie handling) is made in `infrastructure/http/api.ts` but not mirrored in `infrastructure/auth/auth.service.ts`'s raw axios calls, silently breaking login/logout/refresh while every other API call keeps working — the kind of split-brain bug that's easy to miss in code review because the two code paths don't look related at a glance.
**Affected users/features:** All users, via the auth flow (login/logout/refresh) and the public-courses landing surface.
**Recommended direction:** Consolidate `auth.service.ts` onto the same request layer as `api.ts` (or, if auth genuinely needs different transport semantics, wrap it in one `axios.create()` instance rather than repeating headers at each call site). Move the three BFF route handlers onto one shared server-side request helper. Move `usePublicCourses`'s data-fetching into an `apps/` orchestrator (or, if it's meant to be a general "public data" hook usable by multiple apps, promote it to `infrastructure/` and have it not be classified as "shared" business logic) — this is explicitly the kind of thing CLAUDE.md says to flag and ask before changing, not something to silently move.
**Implementation complexity:** Medium — auth flow consolidation touches security-sensitive code and needs careful testing of refresh/401 paths.
**Regression risk:** High for the auth-service consolidation specifically (login/logout/session refresh is the worst place for a silent regression); low-medium for relocating `usePublicCourses`.
**Dependencies:** None external; recommend doing the auth consolidation as its own reviewed change, separate from the `usePublicCourses` relocation.
**Status:** CONFIRMED DUPLICATION / ARCHITECTURAL RISK

---

### DUP-003
**Severity:** P2
**Category:** Design-system primitives / tooling config
**Location:**
- `components.json:14` — `"ui": "@/components/ui"` (generator config)
- `components/ui/*` — 17 files, all decorative/marketing widgets (`AnimatedList.tsx`, `MagicBento.tsx`, `BadgeGraphic.tsx`, `WavyScallopedBorder.tsx`, etc.) — zero shadcn primitives
- `shared/design-system/ui/*` — the actual shadcn-derived primitive set (`button.tsx`, `input.tsx`, `dialog.tsx`, `card.tsx`, `table.tsx`, `badge.tsx`, `skeleton.tsx`, etc.), imported by 20+ files
- `shared/design-system/ui/magic-bento.tsx` vs `components/ui/MagicBento.tsx` — same component, two copies, two casings

**Problem:** The shadcn CLI config (`components.json`) still points its `ui` alias at `components/ui`, but the real, actively-imported primitive layer lives at `shared/design-system/ui`. `components/ui` instead accreted purely decorative one-off components. Grep confirms 0 files import `@/components/ui/button` (because it doesn't exist there), while 20 files import dialog/sheet/input-group from `shared/design-system/ui`. `MagicBento` exists as an actual duplicate in both locations.
**Evidence:** `components.json` aliases block unchanged from shadcn defaults; `shared/design-system/ui/magic-bento.tsx` and `components/ui/MagicBento.tsx` both exist with different casing, indicating one was copied rather than moved.
**Why it matters:** Anyone running `npx shadcn add <component>` today will generate files into the wrong (dead) directory, silently forking the primitive layer further. This is exactly the kind of "migration left half-finished" pattern implied by the multiple competing organizational schemes in the prompt.
**Failure scenario:** A new contributor (or an AI coding agent) runs the shadcn generator, gets a `components/ui/dialog.tsx` that nothing imports, notices existing dialogs are actually `shared/design-system/ui/dialog.tsx`, and either creates a second competing dialog or wastes time reconciling — pure friction, not a runtime bug today.
**Affected users/features:** Developer experience / future maintainability, not end users directly.
**Recommended direction:** Fix `components.json`'s `aliases.ui` to point at `@/shared/design-system/ui` (or move the primitive layer to match the config — cheaper to fix the config). Delete or relocate the `components/ui` decorative widgets into a clearly-named folder (e.g. `shared/design-system/decorative/` or colocate with the marketing pages that use them) so `components/ui` isn't mistaken for a primitive layer. Delete the duplicate `MagicBento`.
**Implementation complexity:** Low (config change + a rename/move pass).
**Regression risk:** Low if done as a pure path/config change with import updates; verify build after.
**Dependencies:** None.
**Status:** CONFIRMED DUPLICATION / TECHNICAL DEBT

---

### DUP-004
**Severity:** P2
**Category:** Formatting utilities (dates)
**Location:**
- `shared/utils/money.ts` (canonical currency formatter — `formatMoney`, `toMinorUnits`, `fromMinorUnits`, `Intl.NumberFormat("en-IN", ...)`) — exists but has no date equivalent
- `app/(authenticated)/studio/content/[contentType]/[contentId]/components/sections/EventPricingSection.tsx:31-35` (local `formatCurrency` + local `formatDate`)
- `app/(authenticated)/studio/content/[contentType]/[contentId]/components/sections/RegisteredMembersSection.tsx:59` (local `formatDate`)
- `.../sections/PublishingWorkflow.tsx:18` (local `formatDate`)
- `.../sections/KeyInfoCard.tsx:1` (local `formatDate`)
- `.../ContentOverviewHeader.tsx:40` (local `formatDate`)

**Problem:** `shared/utils/` has a real, reusable currency formatter but no date formatter, so the same "content overview" feature area alone reimplements `formatDate` five separate times with slightly different signatures, and `EventPricingSection.tsx` additionally reimplements its own `formatCurrency` instead of using `shared/utils/money.ts`.
**Evidence:** Five distinct `function formatDate(...)` definitions within one feature directory (`studio/content/[contentType]/[contentId]/components/sections/`), none importing from `shared/utils`.
**Why it matters:** Date formatting is a classic place for silent locale/timezone inconsistency to creep in — five independent implementations means five independent places a bug (e.g. wrong locale, off-by-one timezone handling) can be introduced and fixed inconsistently.
**Failure scenario:** A date-format bug (e.g. wrong timezone offset) is fixed in `KeyInfoCard.tsx`'s local `formatDate` during a bug-fix PR, but the other four copies in sibling files keep the bug, producing inconsistent dates across the same content-overview page.
**Affected users/features:** Studio content-overview pages (creators/admins managing course/event content) — a busy internal surface.
**Recommended direction:** Add `shared/utils/date.ts` with a small set of formatters (`formatDate`, `formatDateTime`, `formatRelativeDate`) mirroring the quality bar already set by `money.ts`, and replace the five local copies. Given `date-fns`/`dayjs` are not in `package.json` and everything currently uses raw `Intl.DateTimeFormat`, keep the new utility dependency-free (matching `money.ts`'s style) rather than introducing a new date library for this.
**Implementation complexity:** Low — mechanical extraction, five call sites to update.
**Regression risk:** Low, but verify each local `formatDate`'s exact output format before consolidating (they may have subtly different intended formats — check before assuming they're truly identical).
**Dependencies:** None.
**Status:** CONFIRMED DUPLICATION

---

### DUP-005
**Severity:** P3
**Category:** Empty / loading state components
**Location:**
- `app/(authenticated)/studio/content/[contentType]/[contentId]/components/sections/EmptyState.tsx`
- `app/(authenticated)/studio/events/components/dashboard/EmptyState.tsx`
- `domains/community/components/EmptyState.tsx`
- `domains/community/components/LoadingSkeleton.tsx`, `apps/creator/editor/components/EditorSkeleton.tsx`, `apps/creator/editor/components/ToolbarSkeleton.tsx`

**Problem:** Three independent `EmptyState` components exist with no shared primitive, and three independent bespoke skeleton components exist beyond the raw `shared/design-system/ui/skeleton.tsx` primitive. This is a case where a shared primitive is genuinely straightforward to build (an empty state is icon + heading + optional CTA in virtually every implementation of this pattern) but none exists.
**Evidence:** File list above; no `EmptyState` or generic `Skeleton`-composing component exists in `shared/design-system` or `components/`.
**Why it matters:** Lower-severity than DUP-001/002 — these don't carry security or correctness risk — but they're a visible, easy-to-fix inconsistency (three slightly different "nothing here" visuals across the product) and a template for future duplication if new domains keep copying the pattern instead of importing one.
**Failure scenario:** Not a functional bug; a design/UX inconsistency (three different empty-state visuals/copy patterns) and ongoing maintenance overhead as more domains add their own copy instead of reusing one.
**Affected users/features:** Studio content pages, studio events dashboard, community domain — cosmetic/UX consistency only.
**Recommended direction:** Add one `EmptyState` component to `shared/design-system` (props: icon, title, description, optional action) and migrate the three call sites. Not urgent enough to block other work; good candidate for a small, low-risk cleanup PR.
**Implementation complexity:** Low.
**Regression risk:** Low.
**Dependencies:** None.
**Status:** CONFIRMED DUPLICATION / TECHNICAL DEBT

---

### DUP-006
**Severity:** P3
**Category:** Types / constants
**Location:**
- `shared/types/api.types.ts:173` — `CourseRenderResponse`
- `app/(authenticated)/console/content-manage/[courseId]/page.tsx:12,35` — local `interface CourseAnalysis` and a **second, local** `interface CourseRenderResponse` (same name as the shared type, different definition)

**Problem:** An app-layer page redefines a type that already exists in `shared/types/api.types.ts` under the identical name, rather than importing it. Whether the shapes actually match wasn't verified line-by-line in this pass — flagging as needing a diff.
**Evidence:** Same identifier (`CourseRenderResponse`) defined in two places; TypeScript allows this silently since they're module-scoped, so no compiler error surfaces the duplication.
**Why it matters:** If the two definitions drift (one gets a field added, the other doesn't), code using the local copy silently loses type-checking against the real API shape — a latent correctness risk for that page specifically.
**Failure scenario:** Backend adds/changes a field on the course-render response; `shared/types/api.types.ts` is updated by whoever touches the shared type, but `console/content-manage/[courseId]/page.tsx`'s local copy isn't, and TypeScript won't complain because it's a separate, unconnected interface — the page silently works with a stale shape.
**Affected users/features:** Console content-management page for a single course.
**Recommended direction:** Diff the two `CourseRenderResponse` definitions; if equivalent, delete the local one and import from `shared/types`. If they've legitimately diverged (page needs a subset/superset), rename the local one to something distinct (e.g. `CourseAnalysisRenderResponse`) to stop the name collision from masking the divergence.
**Implementation complexity:** Low.
**Regression risk:** Low.
**Dependencies:** None.
**Status:** CONFIRMED DUPLICATION / UNVERIFIED (shape diff not yet done)

---

### DUP-007
**Severity:** P3
**Category:** Modal/Dialog naming & placement
**Location:** ~20 files across `app/`, `apps/`, `domains/` — e.g. `app/(authenticated)/channels/[id]/manage/components/EditOrganizationModal.tsx`, `apps/creator/components/CourseSubmitDialog.tsx`, `domains/roadmaps/components/PublishConfirmationModal.tsx`, `domains/roadmaps/components/SaveAsTemplateModal.tsx`, plus `shared/design-system/ui/ReportModal.tsx` and `image-crop-modal.tsx` sitting inside the primitives folder itself.

**Problem:** This is **not** a case of the same modal logic being reimplemented — nearly all of these thinly wrap the real `shared/design-system/ui/dialog.tsx` primitive, which is the correct pattern. The issues are cosmetic/organizational: (1) inconsistent naming, "Modal" vs "Dialog" used interchangeably with no rule; (2) two of them (`ReportModal.tsx`, `image-crop-modal.tsx`) live inside the primitives folder even though they're domain-specific compositions, not primitives.
**Evidence:** File list above.
**Why it matters:** Low risk, but worth naming so it doesn't get miscategorized as the same class of problem as DUP-001/002. It's the "similar-but-legitimately-different" case the audit format asks to call out — composing a shared dialog primitive per feature is expected and fine.
**Failure scenario:** None functional — pure naming-convention drift.
**Affected users/features:** Developer experience only.
**Recommended direction:** No functional change needed. Optionally: pick one suffix convention (`*Dialog.tsx`) for new components, and move `ReportModal.tsx`/`image-crop-modal.tsx` out of `shared/design-system/ui` into a domain-appropriate location since they're not primitives.
**Implementation complexity:** Trivial.
**Regression risk:** Negligible.
**Dependencies:** None.
**Status:** TECHNICAL DEBT (low priority) — largely **intentional reuse (a)**, not a duplication problem.

---

## Explicitly NOT flagged (checked, found clean)

- **Toast/notification logic** — single `sonner` `<Toaster>` instance in `apps/core/Providers.tsx`, 87 call sites across the tree all calling `toast(...)` from `sonner` directly. No competing custom toast component or `useToast` hook found. This is disciplined reuse **(a)** — leave as-is.
- **Mock data** — no `MOCK_`/`mockData`/hardcoded fixture arrays found in production component files in this pass (the separate `FRONTEND_INVENTORY.md` found 12 files with inline mock data, concentrated in `app/(authenticated)/channels/[id]/manage/components/*` — worth a follow-up if not already covered by a dead-code doc, but it's a "not-yet-wired-to-backend" marker rather than duplicated logic).
- **Drag-and-drop, zustand, react-query** — single library each, no parallel implementations found.
- **Zod validation** — only 1 file (`domains/badges/lib/badgeDocumentSchema.ts`) actually uses `z.object(`; `zodResolver`/`react-hook-form` are absent from the codebase entirely despite zod being a listed dependency. This means there's no "duplicate validation schema" problem today because there's effectively no validation layer in use — worth flagging as a gap (forms do manual `useState` validation instead, see DUP-008-adjacent note below) but it is a gap, not a duplication.

## Adjacent gap worth noting (not a duplication, but relevant context)
No `Pagination`, `SearchBar`/`SearchInput`, `FilterBar`, or `DataTable` component exists anywhere in the tree (confirmed via glob — zero matches for all four). Any list page with pagination/search/filtering builds it inline, ad hoc, per page. This isn't duplication in the classic sense (nothing to point at as "the same thing built twice" since nothing reusable was ever built) but it's the reason a `04` duplication audit doesn't have a "pagination duplication" section — there's no reusable version to duplicate away from, which is itself worth the design-system audit's attention (see `11_FRONTEND_DESIGN_SYSTEM_AUDIT.md`).
