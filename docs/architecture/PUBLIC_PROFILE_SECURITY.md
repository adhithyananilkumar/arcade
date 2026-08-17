# Public Profile Security

## Routing (unchanged by this pass, confirmed still correct)

- `/[username]` — public profile, backed by `GET /api/v1/public/profiles/{username}` → `PublicProfileResponse`.
- `/profile` — the logged-in user's own profile-management page, backed by `GET /api/v1/users/me` → `ProfileResponse`.

These are already the canonical, non-duplicated routes the task asked to verify — `/profile` does not redirect to `/[username]`, and both coexist intentionally: `/profile` is where you *manage* your own account, `/[username]` is how *anyone* (including yourself) views the public presentation.

## Public vs. private DTO separation (already existed, verified correct)

`PublicProfileResponse` (constructed via `new PublicProfileResponse(User user)`, never a raw `User` serialization) exposes: `firstName, lastName, fullName, avatarUrl, createdAt, username, bio, linkedinUrl, githubUrl, courses, roadmaps, workshops, enrolledCourses, certificates, socialLinks, workingAt`.

**Never exposed**: `email`, `mobileNumber`, `gender`, `address`, `passwordHash`, `platformRoles`, `channelMemberships`, `permissions`, `preferences`, `onboardingCompleted`, `failedLoginAttempts`, `lockoutEnd`, `deletedAt`, `provider`/`providerId`, or any internal database ID beyond the resource IDs the public DTOs' nested course/roadmap/workshop entries legitimately need.

No accidental serialization risk: `PublicProfileResponse` is a hand-built class with an explicit constructor reading specific `User` getters, not a Jackson `@JsonIgnore`-based filter over the full entity — there's no field that could silently start leaking just because a new column gets added to `User` later. (Confirmed: adding `users.timezone` in this pass did **not** require touching `PublicProfileResponse` at all, and the new column does not appear in it.)

## New endpoints added this pass — privacy review

- `GET /api/v1/public/interests` — public taxonomy (names/slugs only, no learner data). Same visibility tier as the pre-existing `GET /api/v1/public/categories`.
- `GET /api/v1/me/interests`, `PUT /api/v1/me/interests` — self-service only, never exposes one learner's interests to another.
- `GET /api/v1/me/activity/summary`, `GET /api/v1/me/activity` — self-service only. **Deliberately no public equivalent** — the backend-owned streak (`LearnerActivitySummary`) is private by default. No public profile currently renders any activity/streak data at all (see "Removed this pass" below).

## Removed this pass: public per-username TimeLog exposure

`GET /api/v1/public/profiles/{username}/activity` (`PublicProfileController.getUserActivity`) was found to be a **live, unauthenticated data exposure**: given any username, it returned that user's exact per-day time-on-site seconds for the last 6 months, with no auth check and no rate limiting. It was consumed by three frontend call sites: the public profile heatmap (`app/(public)/[username]/page.tsx`), the own-profile heatmap (already migrated to the backend-owned `LearnerDailyActivity` domain earlier this pass), and `my-learning`'s "time spent" chart (legitimately the current user's own data, just fetched through the wrong, publicly-shaped endpoint).

Fix: the endpoint was deleted from `PublicProfileController`. A new self-service endpoint, `GET /api/v1/users/me/time-activity` (`UserController.getMyTimeActivity`, identified via `@AuthenticationPrincipal`), replaces it for the one legitimate remaining consumer (`my-learning`'s time-spent chart — TimeLog session-duration data is exactly what that chart is for). The public profile page no longer fetches or displays any per-user activity data, TimeLog or otherwise — see below.

## Public profile: no badges, no heatmap, no streak

The public profile page (`app/(public)/[username]/page.tsx`) previously rendered: a static array of 15 fabricated badges (fake XP thresholds, future achievement dates like "Dec 15, 2027", fake `/courses/...` links) spliced with a client-computed "Streak N Days" badge name, plus a full TimeLog-backed contribution heatmap fetched via the now-removed public endpoint above. All of it was removed — none of it was backed by a real, intentionally-public data source. Real, backend-sourced sections (courses/roadmaps/workshops/enrolled/pinned certificates, all read from `PublicProfileResponse`) are unchanged.

If a future task wants a real public streak or activity view, that requires a new, explicitly-public, backend-owned endpoint over `LearnerActivitySummary`/`LearnerDailyActivity` (with a decision on whether learners can opt out) — not a default this pass took.

## Authorization pattern (confirmed consistent across old and new endpoints)

Every self-service endpoint — old (`/users/me`, `/users/me/avatar`) and new (`/me/interests`, `/me/activity/*`) — identifies the learner via `@AuthenticationPrincipal CustomUserDetails`, never a path `{id}`/`{username}` parameter for *self*-service operations. `/public/{username}` routes intentionally take a username (that's the point — looking up someone else's public data), but never return private fields, per the DTO separation above. No new IDOR/BOLA surface was introduced: a request to `PUT /api/v1/me/interests` always mutates the authenticated caller's own interests, structurally — there is no learner-id parameter in the request body or URL for an attacker to substitute.

## KYC/Aadhaar exposure — removed, not the domain itself

Found entirely contained in `app/(authenticated)/settings/info/page.tsx` (the default `/settings` landing tab) — fabricated Aadhaar numbers, a simulated "proctored KYC camera" with fake facial-recognition UI, and fake student/institutional data, none of it wired to any backend. Removed from this page in this pass (see `LEARNER_IDENTITY_DOMAIN.md`). No KYC backend domain, table, or API was found to exist anywhere else in the codebase, so there was nothing else to leave alone or touch — the out-of-scope instruction ("leave the unrelated KYC domain alone unless it's contaminating the profile UI") had no real KYC backend to preserve; this was UI-only fabrication.
