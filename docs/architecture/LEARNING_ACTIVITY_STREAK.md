# Learning Activity & Streak — Architecture

## Source of truth

`learning_activity` (append-only). Rows are never updated or deleted by application code — every derived value (`learner_daily_activity`, `learner_activity_summary`) is a projection that can be reproduced from this table alone. This is enforced by design, not just convention: `LearnerActivityAggregationService.rebuildForLearner(learnerId)` proves it, by recomputing both derived tables from `learning_activity` and nothing else.

`LearnerDailyActivity` and `LearnerActivitySummary` are caches/projections. Never write to either table from anywhere except `LearnerActivityAggregationService` — that's the one write boundary for the whole domain.

## Qualifying activity

> **Updated in D3.** The rule now has two limbs, because duration is real. A local calendar day is `qualifying_activity` if **either** the learner completed something that day (any countable action — the original rule, unchanged) **or** they accumulated at least `LearningDurationPolicy.MIN_QUALIFYING_MINUTES` (2) of verified engaged time. The duration floor exists so that opening a lesson for twenty seconds cannot manufacture a streak day. The rule lives in exactly one place — `LearningDurationPolicy.isQualifyingDay(countableActions, learningMinutes)` — and both the incremental path and the rebuild path call it.

A closed, deliberately narrow set (`ActivityType` enum): `LESSON_COMPLETED`, `QUIZ_COMPLETED`, `COURSE_COMPLETED`, and (D3) `LESSON_ENGAGEMENT`. Each is sourced from a real backend trigger:

- `LESSON_COMPLETED` — `CourseProgressService.markLessonComplete()`, right after the existing `LessonProgress` upsert.
- `QUIZ_COMPLETED` — `QuizTakingService.submitAttempt()`, right after a score-improving attempt is saved.
- `COURSE_COMPLETED` — `CourseProgressService.recordCompletionIfAbsent()`, alongside the existing `COURSE_COMPLETED` durable outbox event that already drives the `EnrolledCourse` projection.

- `LESSON_ENGAGEMENT` (D3) — `POST /api/v1/me/activity/learning-segments`, emitted by the lesson player. The only duration-bearing type. It contributes to `learning_minutes` and deliberately does **not** increment `activity_count`: an hour of reading must not read as sixty "learning actions" on the heatmap. Actions and time are two different signals and stay two different fields.

**Deliberately still absent: `LESSON_STARTED`.** D3 reconsidered this and still declined. A start event carries nothing the first `LESSON_ENGAGEMENT` segment for that lesson does not already carry, and it would add a row per lesson open — including accidental opens — with no corresponding learner action. "The learner opened this lesson and stayed engaged" is now expressible, and it is strictly better evidence than "the learner opened this lesson".

**Not qualifying**: page views, navigation, being logged in, or `TimeLog`'s WebSocket-presence signal (see below) — none of these represent a learner having actually done something.

## Learning duration (D3)

### The event

`LESSON_ENGAGEMENT` — one bounded interval of *verified engaged* time with a lesson. The player accumulates time only while the document is visible **and** the window is focused **and** the learner has interacted within the last 60s. A tab left open on a lesson overnight accumulates nothing.

`learning_activity` gained `duration_seconds`, `started_at`, `ended_at` (V257). The interval is stored, not just a duration, because the aggregator needs it twice: to split a segment across local midnight, and to take the *union* of overlapping segments instead of their sum.

### The client states duration, never time

The client submits `{ segmentId, lessonId, courseId, durationSeconds, endedSecondsAgo }` — **no timestamps**. The server computes `endedAt = serverNow − endedSecondsAgo`, clamps the duration, and derives `startedAt`. Consequences: a wrong client clock cannot mis-attribute a calendar day; a segment cannot extend into the future; and the frontend is *structurally* incapable of deciding when learning happened. `durationSeconds` is measured with `performance.now()` (monotonic), so NTP jumps and wall-clock edits do not inflate it either.

### Anti-inflation rules (all server-side, all in `LearningDurationPolicy`)

| Rule | Value | Also enforced at |
|---|---|---|
| Max per event | `MAX_SEGMENT_SECONDS` = 900s | `chk_learning_activity_duration` |
| Min per event (noise floor) | `MIN_SEGMENT_SECONDS` = 5s | service |
| Max backdating | 24h | service |
| Max per day | `MAX_DAILY_MINUTES` = 1440 | `chk_learner_daily_activity_learning_minutes` |
| Overlap | union of intervals, never sum | `engagedSecondsInWindow` |
| Entitlement | course entitlement per distinct course in the batch | `LearningSegmentIngestService` |

### Aggregation: recompute, never increment

`learning_minutes` for a day is **set to an absolute recomputed value**, not incremented. On a new segment the service reads every engagement row that can overlap that local day (lower bound widened by the per-segment clamp, so the query stays a pure index range scan on the partial index), unions the intervals clipped to the day's UTC window, floors to minutes, clamps, and writes.

This single choice delivers most of the required properties at once: reprocessing an event is a no-op, replaying an hour of segments under fresh ids adds zero, overlapping heartbeats cannot double-count, and rebuild is trivially identical to the incremental path because it calls the same functions.

Duplicate *submissions* are caught earlier still, by `learning_activity.idempotency_key` = `LESSON_ENGAGEMENT:<learnerId>:<segmentId>` (learner-namespaced so one learner cannot burn another's segment ids on a globally unique column).

### Midnight and timezones

A segment's local days come from `LearningDurationPolicy.localDatesTouched`, and each day's UTC window from `utcWindowOfLocalDay(day, zone)` — built with `atStartOfDay(zone)` on both ends, so a DST day is correctly 23h or 25h rather than a drifting 24h. A segment straddling local midnight is clipped to each day's window: the seconds split across the two days and total exactly the original. A segment ending *exactly* at local midnight belongs wholly to the day that ended and creates no empty next-day row. Zones come from `LearnerTimezoneResolver` as before; no new timezone logic was introduced.

### Rebuild / backfill

`rebuildForLearner(learnerId)` now rebuilds both signals: `activity_count` from countable completion events, `learning_minutes` via `LearningDurationPolicy.minutesByLocalDay`. It is deterministic and idempotent, and it repairs drift (verified against real Postgres).

Two latent bugs in the original rebuild were fixed when it was first executed against a real database rather than mocks:

1. It queried "all history" as `LocalDateTime.MIN..now` / `LocalDate.MIN..MAX`. Those are year −999999999 and Postgres rejects them outright (`timestamp out of range`), so the rebuild could never actually have run. Replaced with `findByLearnerIdOrderByOccurredAtAsc` / `findByLearnerIdOrderByActivityDateAsc` — bounded by `learner_id`, which is what the index serves anyway.
2. It deleted the old daily rows and inserted new ones in one transaction. Hibernate's action queue flushes inserts *before* deletes, so the insert collided with `uq_learner_daily_activity_learner_date` on every day that already had a row — i.e. on every real rebuild. Fixed with an explicit `flush()` between the two phases.

**All-learners procedure** (not automated, deliberately): iterate learner ids in batches and call `rebuildForLearner` per learner, each in its own transaction. Never a single unbounded query. No admin endpoint exposes this yet.

## TimeLog — retired as a learning-time source (D3)

`infrastructure.timelog.TimeLog` (table `time_logs`) already existed: one row per `(user, log_date)`, `seconds_spent` incremented on every WebSocket disconnect (`TimeTrackerEventListener`), driven by `TimeTracker.tsx`, which is mounted app-wide in `LearnerShell` — i.e. it fires for *any* authenticated page being open, not specifically for learning. It backs the existing `GET /api/v1/public/profiles/{username}/activity` endpoint (unchanged, still real, still used by the public-profile and home-page heatmaps).

**Inspected before this pass** (per the task's explicit instruction): 5 rows total in the current database, 3 distinct users, 2 days of data — lightly used. **Decision: left entirely as-is, not touched, not repurposed, not deleted.** Two reasons: (1) it's a different, legitimate concern (time-spent-in-app) that other screens already depend on; (2) it does not represent "meaningful learning activity" as this task defines it, so folding it into the new streak system would have silently laundered a low-confidence signal (any open tab) into something that looks authoritative (a learning streak). If a future pass wants a unified "time spent learning" metric, it needs a real per-lesson time-on-task signal, not this one.

**Consequence (superseded by D3)**: `learning_minutes` stayed null until a real duration signal existed. D3 built that signal (`LESSON_ENGAGEMENT`, above) and the column is now populated from it.

**D3 status**: `GET /api/v1/users/me/time-activity` and `UserService.getMyTimeActivity()` are **removed**, after confirming zero consumers in both repos. `TimeLogActivityResponse` and `TimeLogService.getUserActivityResponses` are gone with them. The `TimeLog` entity, its repository and its WebSocket writer (`TimeTrackerEventListener`, driven by `TimeTracker.tsx` in `LearnerShell`) are **untouched** — session-presence telemetry is a legitimate but entirely separate concern, and only its use as a learning-time proxy was retired. It now has no reader; see the D3 report for the recommendation on that.

Note: the claim above that TimeLog "backs `GET /api/v1/public/profiles/{username}/activity`" is stale — that endpoint was removed by SEC-1 in the audit phase, before D2.

## Timezone semantics

- `occurred_at` on `LearningActivity` is always UTC (`LocalDateTime.now(ZoneOffset.UTC)` at the call site — every producer, e.g. `LearningActivityApiImpl`, must pass this, never the server's default-zone `now()`).
- The learner's **local calendar day** is derived once, in `LearnerActivityAggregationService`/`LearnerActivityQueryService`, from `users.timezone` (IANA zone id), falling back to UTC when unset (no UI sets it yet — see `ONBOARDING_PROFILE_DATA_MODEL.md`).
- `LearnerTimezoneResolver` is the single place this policy lives — every other piece of code asks it for a `ZoneId`, never re-implements the fallback logic.
- This correctly handles DST transitions (`ZoneId.of("Asia/Kolkata")`-style zones carry their own DST rules; a fixed offset would not) and leap years/month/year boundaries for free, since it's all standard `java.time` arithmetic on `LocalDate`, not manual date math.

## Duplicate handling / idempotency

Two independent layers:

1. **`learning_activity.idempotency_key`** (unique constraint) — business-derived per activity type, not tied to any delivery mechanism: `"LESSON_COMPLETED:<userId>:<lessonId>"`, `"QUIZ_COMPLETED:<attemptId>"`, `"COURSE_COMPLETED:<userId>:<courseId>"`. Same fact can never be recorded twice, however many times the call site fires (e.g. a learner re-marking an already-completed lesson, or a retried request after a network blip).
2. **`LearningActivityRepository.insertIfAbsent`** — a native `INSERT ... ON CONFLICT DO NOTHING RETURNING id` query (same pattern as the pre-existing `CourseCompletionRepository.insertIfAbsent`). Returns `null` on a duplicate; the caller (`recordActivity`) short-circuits immediately — no daily-aggregate or summary work happens for a duplicate, verified by `LearnerActivityAggregationServiceTest.duplicateActivity_isIgnored_noDailyAggregateOrSummaryWork`.

The daily-aggregate increment (`LearnerDailyActivityRepository.incrementForActivity`) does **not** need its own separate duplicate check — it's only ever called after `insertIfAbsent` confirms a genuinely new fact, so "called at most once per real event" is already guaranteed upstream.

## Daily aggregation

`LearnerDailyActivity` — one row per `(learner_id, activity_date)`, unique-constrained. Upserted via `INSERT ... ON CONFLICT (learner_id, activity_date) DO UPDATE SET activity_count = activity_count + 1, ...` — an atomic, race-safe increment (safe under concurrent activity recording for the same learner+day, including from multiple backend instances — see Scalability below).

## Streak calculation

**Algorithm** (`LearnerActivityAggregationService.recomputeSummary`): on every new qualifying activity, walk backward day-by-day from the learner's local "today" through `LearnerDailyActivity` rows (bounded to a 5-year lookback window — an index range read, never a scan of raw `learning_activity`) until the first non-qualifying day. That count is `currentStreak`. `longestStreak = max(longestStreak, currentStreak)`.

- **Multiple activities same day**: the daily aggregate has exactly one row per day regardless of how many raw events fed it — the streak walk counts qualifying *days*, not activity rows. Verified: `multipleActivitiesSameDay_stillCountsAsOneActiveDayForStreak`.
- **Missed day**: breaks the walk; `currentStreak` resets, `longestStreak` is preserved (`Math.max`). Verified: `missedDay_breaksStreak_currentStreakIsOneForTodayOnly`.
- **Current day not yet active**: the walk starts from *yesterday* if today has no activity yet — a streak isn't considered broken until a full day passes with none (`countCurrentStreak`'s `today`-vs-`today.minusDays(1)` branch).
- **Month/year boundaries, leap years**: handled by `java.time.LocalDate` arithmetic natively — no manual date-component math anywhere in this code. Verified across a Dec 31 → Jan 1 boundary: `yearBoundary_streakSpanningNewYearIsCountedCorrectly`.
- **"Today"** is resolved via an injected `java.time.Clock` (`ClockConfig`'s existing `Clock.systemUTC()` bean, widened to the learner's zone via `clock.withZone(zone)`), not `LocalDate.now()` called directly — this makes the streak walk deterministic and unit-testable against a fixed instant, which is how the year-boundary test above is possible at all.
- **Late-arriving events — known, documented limitation**: the incremental recompute is correct and self-healing for the common case (activity arrives in near-real-time, or backfills into *today's* recent run). It does **not** retroactively raise `longestStreak` if a late-arriving event fills a gap deep in *past* history (a streak that ended weeks ago, now retroactively longer). This is an accepted eventual-consistency tradeoff — see "Eventual consistency" below — with `rebuildForLearner` as the correctness backstop whenever exact historical `longestStreak` matters (e.g. a periodic reconciliation job, not built in this pass but the seam for one exists).

## Scalability strategy

- **No unlimited raw-history scans on profile requests.** `LearnerActivityQueryService` (the read boundary) queries only `LearnerDailyActivity`/`LearnerActivitySummary` — never `LearningActivity`. The heatmap endpoint (`GET /me/activity?from=&to=`) enforces a max 400-day range server-side, in addition to whatever bounded window the frontend requests.
- **Streak recompute is bounded, not unlimited.** The incremental path reads at most 5 years of daily-aggregate rows (an index range scan on the `(learner_id, activity_date)`-leading unique constraint), stopping early at the first gap in practice — not a scan of raw events, and not unbounded even in the worst case.
- **Indexes**: `idx_learning_activity_learner_occurred_at` on `(learner_id, occurred_at)` — the only query pattern `learning_activity` itself serves (bounded per-learner range reads, used by aggregation and rebuild, never by a live request). `learner_daily_activity`'s and `learner_interests`' unique constraints double as their access-pattern index (both lead with the FK column). No index was added without a named query it serves — the task explicitly warned against blind indexing.
- **Concurrent activity creation, multiple backend instances**: every write is a native `INSERT ... ON CONFLICT` (idempotent insert or atomic increment) — no read-modify-write race window, no distributed lock needed, safe under concurrent requests from multiple app instances. This mirrors the exact pattern the pre-existing `learning_outbox_events` relay already uses (`FOR UPDATE SKIP LOCKED`) for the same reason.
- **Idempotent writes**: covered above (idempotency_key + `insertIfAbsent`).

## Eventual consistency

`LearnerActivityAggregationService` is called **synchronously**, inline, in the same request/transaction as the triggering domain event (lesson completion, quiz submission, course completion) — for simplicity, per the task's explicit permission to do so initially ("if synchronous aggregation is used initially for simplicity, it must be cheap, idempotent, transactional, and replaceable"). It qualifies: the work per call is O(1) inserts/updates plus a bounded index range read, not expensive.

**The seam for moving to async later**: everything routes through `LearningActivityApi` (a cross-context facade interface, `learning.activity.api` package) — `CourseProgressService` and `QuizTakingService` depend only on this interface, never on `LearnerActivityAggregationService` directly. Swapping the implementation from "call `LearnerActivityAggregationService` inline" to "publish a durable event, let a background consumer call it" requires touching exactly one class (`LearningActivityApiImpl`) and zero call sites, zero API contracts, zero frontend code. The codebase already has a proven pattern for exactly this (`learning_outbox_events` + `LearningOutboxRelayScheduler`, used today for course-completion projection) that a future async implementation could reuse directly rather than inventing new infrastructure.

The domain model does not assume every derived metric is calculated synchronously during the original learning request — it currently *is*, by choice, because the cost is cheap enough not to need deferring yet, not because deferring it would be architecturally hard.

## Future partitioning / archival strategy

Not implemented in this pass (correctly — the task explicitly warned against premature partitioning). `learning_activity` is designed so partitioning can be introduced later without changing the application-level contract:

- **By time**: `occurred_at`-range partitioning (e.g. monthly/yearly Postgres native partitions) is straightforward since every query against this table is already `learner_id + occurred_at` range-bounded — the query shape doesn't change, only the physical storage layout would.
- **By learner/hash**: also viable since `learner_id` leads every access pattern; a hash-partitioned table would still serve `WHERE learner_id = ? AND occurred_at BETWEEN ? AND ?` efficiently.
- **Archival**: because `LearnerDailyActivity`/`LearnerActivitySummary` are fully derived, old `learning_activity` rows could eventually be moved to cold storage (or a separate historical table/partition) without losing any current-facing functionality — the daily aggregate already captured what mattered from them. A future archival job doesn't need to touch the read path at all.

Nothing about the current schema or service boundary would need to change to introduce either later — this is what "clean boundaries so a future event-processing system can be introduced without rewriting the domain" means in practice here.

## Recovery / rebuild strategy

`LearnerActivityAggregationService.rebuildForLearner(learnerId)` — recomputes `LearnerDailyActivity` and `LearnerActivitySummary` from `LearningActivity` alone, for one learner (bounded, even for a decade of history — never run across all learners synchronously; a full-platform rebuild is an explicit administrative operation that should batch learner-by-learner, not one unbounded query). This is the recovery path if a projection ever drifts (a bug, a manual data fix, the late-arriving-event limitation above) — proof that `learning_activity` genuinely is the source of truth, not just documentation asserting it.

No admin endpoint currently exposes this (out of scope for this pass — the method exists and is tested at the service level; wiring an admin-triggered rebuild endpoint is a natural next step, not done here to avoid scope creep into admin tooling).
