# Profile / Interest / Activity API Contract

All self-service — every endpoint below identifies the learner from the authenticated principal (`@AuthenticationPrincipal CustomUserDetails`), never from a path `{id}` parameter, per the task's explicit IDOR-prevention requirement. Existing endpoints (`/api/v1/users/me`, `/api/v1/users/me/avatar`, `/api/v1/users/check-username`, `/api/v1/public/profiles/{username}`) were already built this way and are unchanged.

## New endpoints, this pass

| Method | Path | Auth | Request | Response |
|---|---|---|---|---|
| GET | `/api/v1/public/interests` | Public | — | `InterestResponse[]` |
| GET | `/api/v1/me/interests` | Self | — | `InterestResponse[]` |
| PUT | `/api/v1/me/interests` | Self | `UpdateInterestsRequest { interestIds: UUID[] }` (max 25) | `InterestResponse[]` |
| GET | `/api/v1/me/activity/summary` | Self | — | `ActivitySummaryResponse` |
| GET | `/api/v1/me/activity?from=&to=` | Self | date-range query params (max 400 days) | `DailyActivityResponse[]` |

## DTOs

```
InterestResponse { id, name, slug, parentId }

ActivitySummaryResponse { currentStreak, longestStreak, activeToday, lastActiveDate }

DailyActivityResponse { date, activityCount, intensity }  // intensity: 0-3 bucket, backend-computed
```

None of these are the enormous "one giant ProfileResponse containing every domain" shape the task explicitly warned against — profile, interests, and activity are three separate response models behind three separate endpoint groups, each independently cacheable on the frontend (see the React Query hooks in `domains/identity/api/interest.queries.ts` and `domains/learning/activity/api/activity.queries.ts`).

## Validation

- `UpdateInterestsRequest.interestIds`: max 25 (`@Size`), and every ID must reference a real, active `Interest` row (`InterestService.updateLearnerInterests` checks `countByIdInAndActiveTrue` before touching the learner's existing selection — an invalid ID rejects the whole request without wiping what was there before).
- `/me/activity` date range: rejects `from > to` and ranges over 400 days (`BadRequestException`, mapped to the existing global error handler — see `07_FRONTEND_IAM_SECURITY_AUDIT.md` era conventions, unchanged).
- Avatar upload (`POST /api/v1/users/me/avatar`, existing endpoint): now validated by `ImageUploadValidator` before reaching storage — MIME allowlist (JPEG/PNG/WEBP/GIF), 3MB size cap, and the file is actually decoded via `ImageIO` (not just extension/declared-type trusted) to reject non-image or malformed files, plus a dimension sanity cap. This closes the gap the task explicitly named ("never trust extension alone").

## Error handling

Unchanged from the existing global convention (`{ timestamp, status, code, message, path }`, see the prior frontend audit's `DATA_LAYER_STANDARD.md` for the 5xx-message-genericization policy already in place). New endpoints don't introduce any new error-handling pattern — `BadRequestException` for validation failures, mapped the same way every other domain's validation errors already are.
