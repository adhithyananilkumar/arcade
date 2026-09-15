# Account Lifecycle

Verified against current backend source in this pass (`E:\arcade\backend\src\main\java\com\arcade\backend\identity\auth\`). Conclusion: **this was already implemented correctly and was not rebuilt** — only one defense-in-depth hardening was added (see below).

## Flow

```
Registration (POST /api/v1/auth/register)
      ↓
PendingRegistration row created (NOT a User row)
  - email, firstName, lastName, passwordHash (already hashed)
  - otpHash (BCrypt hash of a 6-digit OTP — never stored in plaintext)
  - expiresAt = now + 15 minutes
  - failedAttempts = 0
      ↓
Email sent with OTP
      ↓
Verification (POST /api/v1/auth/verify-email, OTP + email, or a link-based token
              for a separate legacy/post-registration re-verify path)
      ↓
  - expired? → delete PendingRegistration, caller must re-register
  - wrong OTP? → increment failedAttempts; at 5, delete PendingRegistration
                 (forces re-registration — no indefinite guessing window)
  - correct? → atomically: create User (emailVerified=true, provider="LOCAL"),
               delete PendingRegistration (single-use)
      ↓
Login (POST /api/v1/auth/login) — email OR username, checked via `identifier.contains("@")`
      ↓
Onboarding (frontend-driven, backend-persisted — see ONBOARDING_PROFILE_DATA_MODEL.md)
```

## The invariant: unverified != active learner

Holds **by construction**: a `User` row only ever comes into existence via a successful OTP check (or Google OAuth2, which verifies the email itself before creating the row — not touched in this pass). There is no code path where an unverified `User` row exists today.

**Hardening added in this pass**: `AuthService.login()` now also explicitly checks `user.isEmailVerified()` and rejects with `UnauthorizedException` if false, even though no current path can trigger it. This is deliberate defense-in-depth — a future code path that creates a `User` row directly (a data migration, an admin tool, a new signup method) cannot silently bypass verification just by skipping `PendingRegistration`. Covered by `AuthServiceTest.login_rejectsUnverifiedUser_evenWithCorrectPassword`.

## Security properties confirmed present (not added by this pass)

- **Password hashing**: `PasswordEncoder` (BCrypt), applied before the row is even a `PendingRegistration`.
- **OTP security**: hashed (never plaintext), 15-minute expiry, single-use (deleted on success), rate-limited by failed-attempt counter (5 attempts then forced re-registration).
- **Resend**: `resendVerificationCode` handles both the pre-`User` (`PendingRegistration`) and post-`User`-but-somehow-unverified cases, resetting the OTP/token and failed-attempt counter.
- **Login lockout**: 5 failed password attempts (configurable via `app.security.auth.max-failed-attempts`) locks the account for 15 minutes (`app.security.auth.lockout-duration-minutes`), auto-unlocking after the window passes.
- **Transaction safety**: `register`, `verifyRegistrationEmail`, and `login` are all `@Transactional` — the `User` creation + `PendingRegistration` deletion in `verifyRegistrationEmail` happen atomically.
- **No duplicate users**: `register` checks `existsByEmail` up front; `PendingRegistration.email` has its own DB unique constraint, so concurrent registration attempts for the same email can't create two pending records either.

## What this pass did NOT change

The registration/verification/login flow itself, `PendingRegistration`'s schema, the OTP generation/hashing mechanism, or the lockout mechanism — all were already correct. Rebuilding working, already-secure code would have added risk for no benefit.
