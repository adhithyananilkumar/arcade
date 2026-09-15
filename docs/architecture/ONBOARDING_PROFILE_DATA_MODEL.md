# Onboarding & Profile Data Model

## Entities (new, this pass)

### `Interest` (table `interests`)
`id, name, slug (unique), parent_id (nullable, self-FK), display_order, active, created_at, updated_at`. Flat for now (no seeded parent/child hierarchy) — the schema supports subcategories whenever a real need appears; seeding a hierarchy speculatively would have been inventing structure nobody asked for. Seeded with 18 starter topics (`V255__seed_interests.sql`).

### `LearnerInterest` (table `learner_interests`)
`id, learner_id (FK users), interest_id (FK interests), created_at, updated_at`. Surrogate UUID PK + unique constraint on `(learner_id, interest_id)` — matches the codebase's established convention for this relationship shape (`time_logs`, `course_completions` use the same pattern) rather than a composite natural PK.

### Activity domain — see `LEARNING_ACTIVITY_STREAK.md` for full detail
`LearningActivity` (append-only source of truth), `LearnerDailyActivity` (scalable daily aggregate), `LearnerActivitySummary` (rebuildable streak cache).

### `users.timezone` (new column, nullable)
IANA zone id string (e.g. `"Asia/Kolkata"`). No UI sets it yet — used only to resolve which local calendar day a piece of learning activity belongs to. Falls back to UTC when null. This is the "safe default + documented future migration path" the task asked for when no existing timezone field was found (confirmed absent before this pass).

## Onboarding — what changed, what didn't

**Already correct, unchanged**: the onboarding flow persists to the backend at every meaningful step already — `user.onboardingCompleted` (boolean, `users.onboarding_completed` column) is read from the backend on login/refresh (via `useAuthStore`, populated from `ProfileResponse`), not held as a frontend-only flag. Username, profile basics (name/mobile/gender/address), avatar, and social links all already submitted through the real `PUT /api/v1/users/me` endpoint before this pass.

**Changed**: the interests step. Previously: `PREFERENCE_OPTIONS`, a hardcoded array of 8 generic category strings, plus a free-text "add your own" input — submitted as arbitrary display strings into `User.preferences` (a free-text `List<String>` element-collection, `user_preferences` table). Now: the frontend fetches the real interest taxonomy (`GET /api/v1/public/interests`) with search/filter, lets the learner select up to 10 (a sensible onboarding-specific limit; the backend independently caps at 25 via `UpdateInterestsRequest`'s validation), and submits canonical interest **IDs** (`PUT /api/v1/me/interests`) — not display strings.

**Left alone**: `User.preferences` (the legacy free-text field) itself was not deleted or migrated — it's out of scope to touch a field other code may still read, and the task's own instruction was to stop the onboarding flow from writing arbitrary strings, not to retroactively migrate historical data. The onboarding flow simply no longer submits to it.

## Recommendation readiness (§8 of the task spec)

The interest relationship is structured (`learner_interests` joins real `Interest` rows by ID, not free text), which is exactly what a future recommendation service needs — it can join on `learner_interests.interest_id` without another schema migration. The activity domain (see `LEARNING_ACTIVITY_STREAK.md`) similarly gives a future recommendation system real signals to consume (completion events, recency via `occurred_at`, frequency via daily-aggregate counts) without having invented scoring logic or additional tables speculatively. No recommendation engine, scoring, or ranking was implemented — only the data shape that would let one exist later without a rewrite.

## What was deliberately NOT done

- **No `LearnerProfile` table split.** The task's conceptual model separates `User` (auth) from `LearnerProfile` (name/avatar/bio/social) from `LearningActivity`. In practice, `ProfileResponse` vs. `PublicProfileResponse` already give a clean private/public data boundary (see `PUBLIC_PROFILE_SECURITY.md`), and the profile fields already live as plain columns on `User` with no other domain depending on `User`'s internal shape in a way that a table split would meaningfully improve. Splitting `User` into two tables now would be a larger, higher-risk migration (touching every `UserRepository` query, `CustomUserDetails`, `ProfileResponse.of()`, etc.) for a structural change with no immediate behavioral benefit — the interests and activity domains, which genuinely needed new tables, got them; the parts of "profile" that were already fine were left alone.
- **No migration of existing `User.preferences` data into `learner_interests`.** No mapping between arbitrary historical free-text strings and canonical interest slugs was invented — that would require product judgment calls (does "Web Dev" map to "Web Development"? does "AI/ML" map to one interest or two?) this task's scope didn't cover.
