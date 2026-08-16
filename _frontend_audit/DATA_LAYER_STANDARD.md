# Data Layer Standard

The canonical pattern for server data in this app, established/reconfirmed in this pass against two migrated domains (`notifications`, `public-categories`) plus the pre-existing correct example (`community/forum`). This document is the reference for migrating the remaining ~75 manual-fetch call sites identified in the original audit — **that migration is intentionally not done in this pass**, per the explicit instruction not to batch-migrate all of them at once.

## The pattern

```
Backend
  ↓
domain/api/*.service.ts        — endpoint calls, using the canonical `api` client. Returns typed DTOs.
  ↓
domain/api/*.queries.ts        — React Query hooks: useQuery / useMutation, keyed by a domain query-key registry
  ↓
domain/hooks/use*.ts            — UI-facing hook, only if the raw query hooks need composition
  ↓
components                      — presentation + user interaction, consumes the hook(s) directly
```

### Layer responsibilities (do not blur these)

- **`infrastructure/http/api.ts`** — HTTP transport only. Never imported directly by a component; only by domain `api/*.service.ts` files (and by `AuthService`, which has its own documented reason for staying separate — see `14_CONSOLIDATION_REPORT.md` §6).
- **Domain `api/*.service.ts`** — one function per backend endpoint, typed request/response, no React, no caching logic. This layer already existed correctly for 20 of 21 domains before this pass; nothing about React Query changes it.
- **Domain `api/*.queries.ts`** (new convention, this pass) — owns the query-key registry and every `useQuery`/`useMutation` for that domain. This is where server-state caching, loading, error, and invalidation policy live. Nothing above this layer should call `NotificationService`/`api` directly — only the query hooks should.
- **Domain `hooks/use*.ts`** — only needed when a screen needs *composition* on top of raw queries (e.g. `useNotifications()` merges two queries, two mutations, and a WebSocket subscription into one UI-facing hook with a stable external contract). A domain that doesn't need this composition should let components call the `*.queries.ts` hooks directly — don't add an empty pass-through layer for its own sake.
- **Components** — presentation and interaction only. No `useEffect` + `api.get`. No manual `useState` for server data.

### Query keys

One registry per domain, colocated with that domain's query hooks, following the pattern already established by `forumKeys` in `domains/community/api/forum.queries.ts` and now `notificationKeys`/`publicCategoriesKeys`:

```ts
export const notificationKeys = {
  list: () => ['notifications', 'list'] as const,
  unreadCount: () => ['notifications', 'unread-count'] as const,
};
```

Keys are arrays, namespaced by domain first, so `queryClient.invalidateQueries({ queryKey: notificationKeys.list() })` never accidentally collides with a differently-shaped key elsewhere. **Do not use bare strings or ad hoc inline arrays at call sites** — always go through the domain's key registry function, so a key's shape only needs to change in one place.

### Loading state

`useQuery`'s own `isLoading`/`isPending` is the loading signal. Don't shadow it with a separate `useState<boolean>` — that was the pre-React-Query anti-pattern this migration removes. Where a UI-facing hook composes multiple queries (see `useNotifications`), derive a single `loading` boolean from the underlying queries' own loading flags rather than tracking it independently.

### Error handling

`useQuery`/`useMutation`'s own `error`/`isError` is the signal; don't catch-and-swallow into a local error string unless the UI genuinely needs a custom message.

**Backend error contract** (`GlobalExceptionHandler`, unchanged by this pass): `{ timestamp, status, code, message, path }`. The canonical `api.ts` client parses this and throws `ApiError` with `.status` and `.message` populated from it.

**A real, live risk found and fixed in this pass**: the widespread app-wide pattern `toast.error(error.message || ...)` means the backend's `message` field is shown to users directly, dozens of call sites over. The backend contract audit (`12_FRONTEND_BACKEND_CONTRACT_AUDIT.md`, `CONTRACT-04`) documented that `GlobalExceptionHandler`'s catch-all 500 handler leaks the full Java stack trace into `message` in a dev-mode backend config. Rather than touching every `toast.error` call site individually, `infrastructure/http/api.ts`'s central `request()` function now substitutes a generic message (`"Something went wrong on our end. Please try again in a moment."`) for any `5xx` response, while still surfacing the backend's real message for `4xx` responses (400/401/403/404/409/422 etc.) — those are intentionally user-relevant text ("Invalid email or password", "Content not found", validation errors) and safe to show as-is. The real error is still logged to the browser console via `console.error` either way, so debugging isn't harmed.

This does **not** touch 401 handling — the refresh-and-retry flow (`res.status === 401 && !isRetry`) is handled earlier in `request()` and throws its own distinct errors before reaching the generic-message branch, so the auth refresh mechanism is unaffected by this change (verified by re-reading the function's control flow, and by a clean full build).

**Status-code handling reference**, per the actual backend contract:
- **401** — handled centrally in `api.ts` (attempt silent refresh once, then either retry or clear the session and redirect). Individual call sites never need their own 401 handling.
- **403** — surfaces as an `ApiError` with the backend's message (e.g. "Forbidden"); UI should show it as an access-denied state, not a generic toast, where the screen has a natural place to do so (most currently just toast it, which is acceptable but not ideal — not changed in this pass).
- **404** — surfaces normally; callers already commonly branch on `error.status === 404` (the whole reason `ApiError` carries `.status` instead of just a message).
- **409** (optimistic-locking conflicts, uniqueness violations) — surfaces the backend's message as-is; it's designed to be user-relevant ("This record was updated by someone else").
- **422**-style validation — the backend actually returns `400` with `code: VALIDATION_FAILED` for these (confirmed in the contract audit), not a separate 422 status; the message is user-relevant and shown as-is.
- **500** — generic message substituted as of this pass; real error still logged to console.

### Mutations and invalidation

Every mutation declares what it invalidates in its own `onSuccess` (or, where the response already contains the updated resource, uses `queryClient.setQueryData` to update the cache directly instead of a full refetch — see `useMarkAllReadMutation`/`useMarkReadMutation` for the pattern: they merge the known state change into the existing cached array/count rather than invalidating and refetching, which avoids an unnecessary round-trip for a state change we already know the result of).

**Never invalidate the whole cache** (`queryClient.invalidateQueries()` with no key) from a domain mutation. Target the specific keys that mutation actually affects — see Phase 8 discussion below for the cross-domain invalidation map.

### What stays in Zustand vs. React Query

Unchanged from before this pass, restated for clarity since it's easy to blur:

- **Zustand** (`auth.store.ts`, `theme.store.ts`, per-domain UI-only stores like `forum.store.ts`'s `wsConnected` flag) — client-only state: auth session, UI preferences, ephemeral in-memory flags that aren't a cache of server data.
- **React Query** — anything that is a cache of server data: lists, counts, profile data, anything fetched from `api.ts`.
- **Do not** put server data in a Zustand store "for convenience" — this was flagged in the original audit (`STATE-002`) as a stale-cache risk, and the fix is to move it to React Query, not to formalize it as a Zustand pattern.

## The two domains migrated in this pass, as worked examples

1. **`public-categories`** (`shared/hooks/usePublicCategories.ts`) — the simplest possible case: one query, no mutations, 4 consumers. Demonstrates: query key registry, `staleTime` tuning for rarely-changing reference data, and preserving a hook's exact external return shape (`PublicCategory[]`) so its 4 existing call sites needed zero changes.
2. **`notifications`** (`domains/notifications/api/notification.queries.ts` + `domains/notifications/hooks/useNotifications.ts`) — the fuller case: two queries (list, unread count), two mutations (mark-read, mark-all-read) with cache-merge invalidation instead of refetch, an `enabled` gate tied to auth status (so the queries don't fire before a session is confirmed — this was a real behavior-preservation bug caught and fixed during this migration, not just a hypothetical), and a WebSocket push subscription merged directly into the query cache via `queryClient.setQueryData`. Its single consumer (`LearnerNavbar.tsx`) needed zero changes, since the hook's external contract (`{ notifications, unreadCount, loading, refresh, markAllRead, markRead }`) is unchanged.

Both were validated with `tsc`, `eslint`, and a full production build before being considered done — the old manual-`useEffect` implementation was replaced in place only after that validation passed, not left running in parallel.

## What was deliberately *not* touched in this pass

- `domains/community/hooks/useNotifications.ts` — a separate, forum-specific notification implementation (distinct from the one migrated here), discovered while tracing consumers. Out of scope for this pass; flagged as a duplication worth a future look, not fixed now, since introducing scope creep into a "establish the pattern narrowly" task defeats the purpose.
- The other ~75 manual-fetch call sites identified in the original audit. This pass proves the pattern works end-to-end against a real, previously-broken-in-a-subtle-way case (the `enabled` gating bug) and a trivial case — the next task ("wire the entire UI to the real backend") should follow this same shape for each remaining domain, migrating a handful at a time with the same validation discipline, not all at once.
