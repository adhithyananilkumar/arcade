# React Query Migration Report

Two domains migrated in this pass, chosen against the task's stated criteria: backend endpoint already exists, frontend service already exists, UI currently functional, low business risk. See `DATA_LAYER_STANDARD.md` for the pattern itself; this document tracks the migration execution per the Phase 5 checklist.

## Domain 1: `public-categories`

| Step | Done |
|---|---|
| 1. Query keys | `publicCategoriesKeys.list()` in `shared/hooks/usePublicCategories.ts` |
| 2. Domain query hook | `usePublicCategories()` itself, now backed by `useQuery` |
| 3. Canonical `api.ts` transport | Unchanged — already used `api.get` before migration |
| 4. Standardized loading state | N/A exposed — the hook's return type was always just `PublicCategory[]`, no loading flag in its contract; preserved as-is (not a regression, matches pre-migration behavior exactly) |
| 5. Standardized error handling | Preserved the original fail-open contract: consumers render their own hardcoded fallback categories on empty/error, matching the original hook's silent-catch behavior |
| 6. Mutations | None — read-only domain |
| 7. Cache invalidation | N/A — no mutations; `staleTime: 5 * 60 * 1000` added since this is rarely-changing reference data, avoiding a re-fetch on every one of its 4 consuming screens |
| 8. Preserve current UI | Yes — hook signature and return type unchanged, 4 consumers needed zero changes |
| 9. Remove old path only after verified | Old `useEffect`/`useState` implementation replaced in place after `tsc`/`eslint`/build all passed clean |

**Consumers** (unchanged, zero edits needed): `app/(public)/explore/page.tsx`, `apps/core/components/ExploreHub.tsx`, `apps/creator/shared/content-editor/SharedContentEditorOrchestrator.tsx`, `components/explore/CategoryDetailedView.tsx`.

## Domain 2: `notifications`

| Step | Done |
|---|---|
| 1. Query keys | `notificationKeys.list()` / `notificationKeys.unreadCount()` in new `domains/notifications/api/notification.queries.ts` |
| 2. Domain query hooks | `useNotificationsQuery(enabled)`, `useUnreadCountQuery(enabled)` |
| 3. Canonical `api.ts` transport | Unchanged — `NotificationService` already used `api.get`/`api.post`, untouched by this migration |
| 4. Standardized loading state | `useNotifications()`'s `loading` is now derived from `listQuery.isLoading || unreadCountQuery.isLoading`, gated by `enabled`, replacing a manually-managed `useState<boolean>` |
| 5. Standardized error handling | Mutations (`markAllRead`, `markRead`) preserve the original hook's silent-catch-and-no-op behavior on failure — a deliberate choice to not change user-visible behavior in this pass, not an endorsement of silent failures as the standard (see Phase 7 discussion in `DATA_LAYER_STANDARD.md`) |
| 6. Mutations | `useMarkAllReadMutation()`, `useMarkReadMutation()` — new, in `notification.queries.ts` |
| 7. Cache invalidation | Both mutations use `queryClient.setQueryData` to merge the known state change directly into the cache (mark items read, decrement/zero the count) rather than a full refetch — precise, not a blanket invalidation |
| 8. Preserve current UI | Yes — `useNotifications()`'s external contract (`{ notifications, unreadCount, loading, refresh, markAllRead, markRead }`) is byte-identical; its one consumer (`LearnerNavbar.tsx`) needed zero changes |
| 9. Remove old path only after verified | Old implementation replaced in place after `tsc`/`eslint`/build all passed clean |

**Consumer** (unchanged, zero edits needed): `apps/learner/layout/LearnerNavbar.tsx`.

**A real bug caught during migration, not hypothetical**: the original hook's manual `useEffect` explicitly checked `if (status !== 'authenticated') return;` before fetching. My first draft of the React Query version omitted the equivalent `enabled` gate on the two `useQuery` calls, which would have made them fire on every mount regardless of auth status — a behavior regression that would have caused spurious unauthenticated requests. Caught by re-reading my own draft against the original before considering the migration done, not by a test (none exist) — fixed by adding an `enabled: boolean` parameter to both query hooks, threaded from `status === 'authenticated'`.

## A fix that was necessary to make this migration trustworthy: `queryClient.ts`'s retry-skip bug (`API-02`)

The original `08_FRONTEND_PERFORMANCE_SCALABILITY_AUDIT.md` documented (`API-02`) that `infrastructure/state/queryClient.ts`'s retry-skip logic checked `error.response?.status` (an axios error shape) but the canonical `api.ts` throws `ApiError` with a top-level `.status` — meaning 401/403 responses from any React-Query-backed call would retry 3× before failing, instead of failing fast. This was still present and would have immediately affected the two domains just migrated (every unauthenticated 401 from `NotificationService`/`api.get('/api/v1/public/categories')` would retry pointlessly). Fixed by changing the check to read `.status` directly off the error object, structurally (not by importing the `ApiError` class, which would create a circular import: `api.ts` → `queryClient.ts` → `api.ts`, since `api.ts` already imports `queryClient` for cache-clearing on session expiry).

## Validation

`tsc --noEmit`, `eslint` (zero new errors on all touched/created files), and a full `npm run build` (all 72 routes) were run after this migration and passed clean. Live behavior (does the notification bell actually update in a browser against a real backend) was **not verified** — see `AUTH_SMOKE_TEST_REPORT.md` for why no live backend was available in this pass. The migration's correctness rests on: byte-for-byte preservation of each hook's external contract, direct comparison against the pre-migration implementation for each piece of logic (including the `enabled`-gating bug caught above), and a clean full build — not a live/browser test.

## DATA LAYER status

- **Canonical pattern established**: yes — see `DATA_LAYER_STANDARD.md`.
- **Domains migrated**: `community/forum` (pre-existing, before this pass), `public-categories`, `notifications`.
- **Domains remaining**: ~18 of 21, per the original inventory (`08_FRONTEND_PERFORMANCE_SCALABILITY_AUDIT.md`'s count of 77 manual-fetch call sites minus the ones touched here) — explicitly deferred to the next task ("wire the entire UI to the real backend"), per this task's own instruction not to batch-migrate everything now.
