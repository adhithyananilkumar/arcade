# Mock-first dev mode

Dev-only layer that lets the UI team build/demo pages without running the real
backend or logging in. **Additive only** — it never changes real-mode behavior
and is structurally inert in a production build (see "Why this is safe to merge"
below). See `docs/architecture/platform-architecture.md` for how this fits the
rest of the frontend architecture.

## Why this exists

This repo already has a real, working backend integration —
`infrastructure/auth/*` and `infrastructure/http/api.ts` talk to a live Spring
Boot backend over JWT. This layer is **not** a replacement for that and does
not mean the backend is missing. It exists to remove day-to-day friction that
has nothing to do with whether the backend works:

- **The backend isn't always running on a UI dev's machine.** Standing up the
  Spring Boot service (and its DB) just to move a button or restyle a card is
  wasted setup time, and it means UI work stalls whenever the backend is down,
  mid-migration, or on a different branch than the frontend needs.
- **New/in-progress endpoints don't exist yet.** When a page is built ahead of
  its backend endpoint, mocking lets the UI ship against an agreed contract
  (`mock/types.ts`) instead of guessing, and the mismatch surfaces later as a
  type error, not a late surprise.
- **Logging in for every role is slow and repetitive.** Reviewing a
  platform-admin console, a learner view, and a creator flow in the same
  session normally means three real accounts and three real logins. The auth
  bypass seeds one of those instantly from a fixture.
- **Edge-case UI (empty, error, huge lists) is hard to trigger for real.** You
  can't easily coerce a live backend into returning an empty list or a 500 on
  demand. The `?mockState=` convention below makes those states one query
  param away, so loading/empty/error UI actually gets built and reviewed
  instead of skipped.
- **Stakeholders should be able to click through the whole app without
  credentials.** `/dev-preview` exists so a non-technical reviewer can see
  every page in one place without knowing the route structure or needing an
  account provisioned for them.

None of this is meant to encourage guessing at backend behavior — the
existing "ask instead of assuming" rule in `docs/architecture/CONTRIBUTING.md`
still applies. If a real endpoint's shape is unclear, that's exactly what
`mock/types.ts` is for: write down the assumed contract explicitly, mock
against it, and confirm it with backend before the real integration lands —
rather than leaving it undocumented in someone's head.

## Enabling it locally

`.env.development` is committed on this branch with both flags on, so mock mode
is **on by default** the moment you check out `mockui` and run `npm run dev` —
no setup needed. You'll land straight into an authenticated shell (no sign-in),
every `*.service.ts` call that goes through `infrastructure/http/api.ts` is
served from `mock/` fixtures, and `/dev-preview` lists every page in the app.

If you want real backend/auth while on this branch, flip the flags to `false`
in your local `.env.development` (or delete the file — `.env.development.example`
documents the same two vars if you need to restore it). Set
`NEXT_PUBLIC_USE_MOCKS=false` — that's the only change needed to hit the real
backend; no domain, app, or page code changes.

## The one rule

**Domains/apps/pages only ever call the real API layer**
(`infrastructure/http/api.ts`, via each domain's own `*.service.ts`) **— they
never import anything from `mock/` directly.** Write every API-calling function
exactly as if it were prod-ready and talking to the real backend; mocking happens
transparently underneath `api.ts`, not inside components. This is enforced by
`eslint.config.mjs` (`no-restricted-imports` for `@/mock/*`), scoped to allow only:
`infrastructure/http/api.ts`, `apps/core/components/AuthInitializer.tsx`, and
`app/api/mock/**`.

## How it works

- `infrastructure/http/api.ts` points its `BASE_URL` at `/api/mock` when
  `NEXT_PUBLIC_USE_MOCKS=true`. Every existing service call is unaffected
  otherwise — it's one conditional on the base URL.
- `app/api/mock/[...path]/route.ts` is a catch-all Next.js Route Handler that
  looks up the incoming path in `mock/registry.ts` and delegates to a handler.
- `apps/core/components/AuthInitializer.tsx` — the single place auth already
  bootstraps from — seeds `useAuthStore` with `mock/data/session.json` when
  `NEXT_PUBLIC_AUTH_BYPASS=true`, before any real refresh call fires.

## Adding a new mocked resource

1. **Contract**: add/extend a type in `mock/types.ts` — always re-export the
   *real* type from the owning domain's public `index.ts` (e.g.
   `export type { Channel } from '@/domains/channels'`) rather than inventing a
   new shape. If the resource doesn't have a real type yet, define it here and
   treat it as the draft contract to agree with backend.
2. **Fixtures**: add `mock/data/<resource>.json`. Match the real response
   shape exactly (check the real `*.service.ts`'s return type — most list
   endpoints in this repo return a bare `T[]`, not a paginated envelope; don't
   invent a wrapper the backend doesn't have). Normal, empty, and error states
   are provided for free by `mock/handlers/shared.ts`
   (`listResponse`/`itemOr404`/`maybeError`) via the
   `?mockState=empty|error|long` query param convention — you don't need a
   separate empty/error JSON file for list endpoints.
3. **Handler**: add `mock/handlers/<resource>.ts`, following
   `mock/handlers/channels.ts` as the reference.
4. **Register**: add the route(s) to `mock/registry.ts`, matching the *exact*
   path the real `*.service.ts` passes to `api.get/post/...` — that's what
   makes the swap invisible to calling code.

## `?mockState=` convention

Append to any request the domain layer makes:
- `?mockState=empty` — empty list.
- `?mockState=error` — simulated 500 error response.
- `?mockState=long` — a long list (~40 items), for testing pagination/virtualized
  list UI even though the underlying endpoint isn't itself paginated.

## Why this is safe to merge to `main`

- `mock/` cannot activate outside dev: `app/api/mock/**` 404s and
  `app/dev-preview` 404s unless `NEXT_PUBLIC_USE_MOCKS=true`, and the auth bypass
  is a no-op unless `NEXT_PUBLIC_AUTH_BYPASS=true`.
- `next.config.ts` throws at build time if either flag is `true` under
  `NODE_ENV=production` — a hard guard, not just a convention.
- CI (`.github/workflows/mock-safety.yml`) fails the build if any committed
  `.env.production*` sets either flag.
- eslint blocks any domain/app/page from importing `mock/` directly, so the
  real API layer stays the single integration point — when the real backend
  adds/changes an endpoint, mismatches show up as type errors against
  `mock/types.ts`'s re-exported contracts, not runtime bugs.
