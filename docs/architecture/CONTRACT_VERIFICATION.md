# Frontend/Backend Contract Verification — Learner Domain Closure Gate

Direct field-by-field comparison of frontend TS types/service calls against the current backend
DTOs. Only genuine mismatches were fixed; no new backend behavior was invented.

## ProfileResponse vs frontend `User` (infrastructure/auth/auth.store.ts)

All scalar fields matched (`id, firstName, lastName, fullName, email, avatarUrl, emailVerified,
provider, createdAt, username, bio, linkedinUrl, githubUrl, mobileNumber, gender, address,
socialLinks, preferences, onboardingCompleted, workingAt, platformRoles, channelMemberships,
permissions`).

**Fixed**: the frontend `User` type was missing `courses`, `roadmaps`, `workshops`,
`certificates` (all present on the backend `ProfileResponse`) and `enrolledCourses[].percentComplete`
(present on `EnrolledCourseDto` but absent from the frontend shape). These fields were being
accessed at call sites only through `profileData: any`, so there was no runtime bug — but any
code that types against `User` directly (e.g. `useAuthStore`) had no visibility into them. Added
as optional fields; no behavior change.

Note (not a bug): frontend's `enrolledCourses` type also declares `coverImageUrl`, `authorName`,
`instructor` which the backend DTO does not send — these are populated client-side by
`LearnerHomePage.tsx` joining against the separately-fetched course catalog, not backend fields.
Correct as documented, left as-is.

## PublicProfileResponse vs frontend usage

No dedicated frontend interface exists — the public profile page reads `profileData: any`.
Field-for-field, the backend only ever sends `firstName, lastName, fullName, avatarUrl, createdAt,
username, bio, linkedinUrl, githubUrl, courses, roadmaps, workshops, enrolledCourses,
certificates, socialLinks, workingAt` — confirmed no `email/mobileNumber/gender/address` leak
(re-verified this pass, unchanged from the prior pass's audit).

## ProfileRequest vs `UserService.updateProfile()`

**Fixed** (see "Legacy implementation search" below): `ProfileRequest` accepts `avatarUrl` and
`onboardingCompleted`, which `updateProfile()` didn't previously expose — the onboarding page
was calling `api.put('/api/v1/users/me', ...)` directly with an ad-hoc payload to reach those two
fields, bypassing the canonical service. `updateProfile()` now accepts both as optional trailing
params; the onboarding page goes through it like every other caller.

`ProfileRequest.socialLinks`/`preferences` are accepted by the backend but no frontend caller
sends them via this endpoint (`socialLinks` is derived server-side from `linkedinUrl`/`githubUrl`
elsewhere; `preferences` is the legacy free-text field intentionally not written by the new
interest-based onboarding flow — both already documented in `ONBOARDING_PROFILE_DATA_MODEL.md`).
Not a mismatch — a request field the frontend simply never needs to populate.

## Interests: InterestResponse / UpdateInterestsRequest

Backend `InterestResponse(UUID id, String name, String slug, UUID parentId)` (record, Jackson
default naming) matches frontend `Interest {id, name, slug, parentId}` exactly, including
`parentId` serializing as explicit `null` (not omitted) for top-level interests. `PUT
/me/interests` body `{interestIds: UUID[]}` matches `InterestService.updateMine()`. No mismatch.

## Activity: ActivitySummaryResponse / DailyActivityResponse

`ActivitySummaryResponse(currentStreak, longestStreak, activeToday, lastActiveDate)` matches
frontend `ActivitySummary` exactly. `lastActiveDate` (`LocalDate`) serializes as an ISO
`"YYYY-MM-DD"` string (Spring Boot's Jackson auto-config disables timestamp serialization for
JSR-310 types by default) — frontend types it as `string | null`, correct.

`DailyActivityResponse(date, activityCount, intensity)` matches frontend `DailyActivity` exactly.
`GET /me/activity?from=&to=` binds via `@DateTimeFormat(iso = ISO.DATE)`, i.e. expects
`YYYY-MM-DD` — matches exactly what `ActivityService.getDailyActivity()` sends. No mismatch.

## Username availability: UsernameCheckResponse

`{available: boolean, suggestions: List<String>}` matches frontend `{available: boolean;
suggestions: string[]}` exactly (`UserService.checkUsername`). No mismatch.

## Onboarding state

`onboardingCompleted` is a plain `boolean` on both sides (`User.onboardingCompleted` entity field
→ `ProfileResponse.onboardingCompleted` / `ProfileRequest.onboardingCompleted` → frontend
`User.onboardingCompleted?: boolean`). No separate "onboarding state" DTO exists on the backend —
onboarding progress is entirely frontend-local (`step` state) until the final submit, which is
consistent with `ONBOARDING_PROFILE_DATA_MODEL.md`'s documented design. No mismatch to fix.

## Minor, non-blocking inconsistency (documented, not fixed)

`gender` is stored as a free string on both sides (no enum). `settings/info/page.tsx` writes
`'MALE'`/`'FEMALE'` (uppercase); `onboarding/page.tsx` writes `'male'`/`'female'`/
`'prefer-not-to-say'` (lowercase, with a value the other page doesn't offer). The backend accepts
any string up to 20 chars, so this isn't a contract violation, but display code that
case-sensitively branches on `gender` (if any exists) could behave inconsistently depending on
which flow last wrote the value. Not fixed here — normalizing this would mean picking a canonical
enum, which is a product decision beyond "verify and fix genuine contract mismatches."
