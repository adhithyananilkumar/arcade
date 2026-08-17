# Learner Identity Domain

Overview of the account/username/onboarding/interests/profile/activity implementation added in this pass. See the companion documents for detail on each sub-domain:

- [ACCOUNT_LIFECYCLE.md](./ACCOUNT_LIFECYCLE.md) — registration, email verification, login
- [ONBOARDING_PROFILE_DATA_MODEL.md](./ONBOARDING_PROFILE_DATA_MODEL.md) — entities, schema, migrations
- [PROFILE_API_CONTRACT.md](./PROFILE_API_CONTRACT.md) — endpoints and DTOs
- [LEARNING_ACTIVITY_STREAK.md](./LEARNING_ACTIVITY_STREAK.md) — activity/streak architecture and scalability
- [PUBLIC_PROFILE_SECURITY.md](./PUBLIC_PROFILE_SECURITY.md) — public/private data boundary

## Domain separation

```
User (authentication identity + username)
  │
  ├── LearnerProfile fields (name, avatar, bio, social links — still columns on User;
  │     no separate table was introduced, see ONBOARDING_PROFILE_DATA_MODEL.md for why)
  │
  ├── Interest / LearnerInterest (new domain — identity/user/interest package)
  │
  └── LearningActivity → LearnerDailyActivity → LearnerActivitySummary
        (new domain — learning/activity package, append-only source of truth
         → scalable daily aggregate → rebuildable derived summary)
```

`User` remains a single table (unchanged) rather than being split into a separate `LearnerProfile` table in this pass — see `ONBOARDING_PROFILE_DATA_MODEL.md`'s "what was NOT changed" section for the reasoning: the existing `ProfileResponse`/`PublicProfileResponse` DTO separation already achieves the practical goal (private vs. public data boundary), and splitting the table itself would be a larger, riskier migration than this task's scope warranted for zero behavioral gain.

## What already existed and was preserved, not rebuilt

Account lifecycle (`PendingRegistration` → OTP verification → `User` creation), username uniqueness/validation, and onboarding-completion persistence (`users.onboarding_completed`) were all found to be already correctly implemented — see `ACCOUNT_LIFECYCLE.md` for the verification detail. This pass hardened them narrowly (an explicit `isEmailVerified` check in login, image-upload validation) rather than rebuilding working code.

## What was newly built

- **Interest taxonomy** (`interests`, `learner_interests` tables) — replaces the frontend's hardcoded onboarding preference list with real, backend-provided, canonical interest IDs.
- **Learning activity/streak domain** (`learning_activity`, `learner_daily_activity`, `learner_activity_summary` tables) — the backend previously had no streak concept at all; the frontend computed one client-side, redundantly, in two different components, from a signal (`TimeLog`, app-wide session presence) that was never a reliable proxy for "meaningful learning activity."
- **KYC/Aadhaar removal** from `settings/info` — that entire page was 100% mock content with fabricated Aadhaar numbers and a simulated proctoring camera, not wired to any backend. Rebuilt around only real `User` fields.

## Explicit out-of-scope confirmation

KYC, Aadhaar, identity verification, and proctored-exam verification were not touched as domains — only their accidental exposure on the general profile/settings surface was removed. No recommendation engine, search, leaderboard, achievements, certificates, or dashboard work was done. These are unchanged from before this pass.
