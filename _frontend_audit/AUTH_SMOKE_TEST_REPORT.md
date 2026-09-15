# Auth Smoke Test Report

Scope: verify the auth changes from the previous consolidation pass (`AuthInitializer`, `ProtectedLayout`, `apps/core/lib/session.ts`, `infrastructure/auth/auth.service.ts`, `infrastructure/auth/auth.store.ts`, `infrastructure/http/api.ts`, `app/api/internal/auth/*`) against the real backend.

## What happened, honestly

A backend was already running on `:8080` when this task started, but its writes weren't landing in any of the 7 local Postgres databases available (`arcade`, `arcade_base`, `arcade_exam_final`, `arcade_exam_test`, `arcade_exam_verify`, `arcade_iam_verify`, `arcade_iso1`) — a test account registered via its `/api/v1/auth/register` endpoint (`HTTP 201`) could not be found in any of them afterward, and login for it failed. With explicit user approval, I stopped that process (PID 21924) to restart it fresh against the current `.env` (`DB_URL=jdbc:postgresql://localhost:5432/arcade`).

**The restart then failed, and could not be recovered in this pass.** Every attempt (4 total: plain `mvnw spring-boot:run` from Bash, from PowerShell, with `-Djava.nio.channels.spi.SelectorProvider=sun.nio.ch.WindowsSelectorProvider`, with `JAVA_TOOL_OPTIONS` forcing the classic Windows selector provider, and with `-Djava.net.preferIPv4Stack=true`) failed identically at Spring context startup, in `RazorpayGateway`'s constructor, which builds a `java.net.http.HttpClient`:

```
Caused by: java.io.UncheckedIOException: java.io.IOException: Unable to establish loopback connection
  at java.net.http/jdk.internal.net.http.HttpClientImpl.<init>
Caused by: java.net.SocketException: Invalid argument: connect
  at java.base/sun.nio.ch.UnixDomainSockets.connect
  at java.base/sun.nio.ch.PipeImpl$Initializer$LoopbackConnector.run
```

This is JDK 21's internal `Pipe` implementation attempting to use a Unix Domain Socket for its loopback signaling mechanism and failing — a machine-level Windows networking condition (most plausibly Docker Desktop's network filter/WSL virtual switch driver interfering with AF_UNIX loopback sockets, though this wasn't confirmed), reproducible regardless of NIO selector provider. It is **not** caused by, or fixable from, anything in this frontend/backend consolidation work — `mvn compile -o` (offline compile, no app startup) succeeds cleanly, confirming the source itself is fine. The previously-running instance must have been started under different machine conditions (a different JVM launcher, or before whatever changed on this host).

**I did not keep fighting this indefinitely.** After 4 genuine attempts across two shells and three JVM-flag workarounds, I stopped and proceeded with everything in this task that doesn't require a live backend, per the task's own explicit instruction to document `BLOCKED` rather than pretend.

## Per-item results

| # | Test | Result | Basis |
|---|---|---|---|
| 1 | Normal login | **BLOCKED** | No live backend. |
| 2 | Logout | **BLOCKED** | No live backend. |
| 3 | Refresh-token flow | **BLOCKED** | No live backend. |
| 4 | Expired access-token → refresh → retry | **BLOCKED** | No live backend. Code-level trace only (see below). |
| 5 | Concurrent 401 requests → single refresh | **BLOCKED** | No live backend; also inherently hard to trigger deterministically even with one, since it requires two in-flight requests racing a real 401. Code-level trace only. |
| 6 | Google OAuth flow | **BLOCKED** (full handshake) / **PASS** (redirect URL construction) | Full OAuth requires a real Google consent screen and a live backend callback — not testable in this sandboxed environment even with the backend up. The redirect URL itself is now correctly derived from `infrastructure/config/env.ts`'s `GOOGLE_OAUTH_URL` (`${API_ORIGIN}/oauth2/authorization/google`) rather than a hardcoded `localhost:8080` literal — verified by reading `apps/public/orchestrators/AuthOrchestrator.tsx` post-edit, confirmed via `tsc`/build in the previous pass. |
| 7 | Session initialization | **PASS (code-level only)** | Verified by direct comparison: `apps/core/lib/session.ts:initializeSession()` is called identically by both `AuthInitializer` (guarded by the `/oauth2/redirect` pathname check + `initRef`) and `ProtectedLayout` (guarded by `status === 'loading'`), and its internal logic (`AuthService.refresh()` → `setAuth()` → `UserService.getMe()` fallback if the refreshed user is empty → `clearAuth()` on failure) is unchanged from the richer of the two original implementations. Not live-tested. |
| 8 | Invalid/expired refresh token | **BLOCKED** | No live backend. Code-level trace: `app/api/internal/auth/refresh/route.ts` returns the backend's error status/body and deletes the `refreshToken` cookie on failure (unchanged by the consolidation — only its `BACKEND_URL` source changed, from a hardcoded literal to `API_V1_BASE_URL`). |
| 9 | User/me fallback behavior | **PASS (code-level only)** | Same basis as #7 — the `UserService.getMe()` fallback in `initializeSession()` is a direct preservation of `ProtectedLayout`'s original (richer) behavior, now shared by both call sites. |
| 10 | Protected route behavior | **PASS (code-level + build)** | `ProtectedLayout`'s redirect-to-`/sign` logic when `status === 'unauthenticated'` and its onboarding-routing logic are byte-identical to before the consolidation — only the auth-initialization block above them was extracted. Confirmed via the full production build in the previous pass (all `(authenticated)/*` routes built without error) and via direct code diff review in this pass. Not live-tested (would require an actual unauthenticated browser session hitting a protected route). |
| 11 | Onboarding routing | **PASS (code-level only)** | Same code path as #10 — unchanged. |
| 12 | Sign-in redirect behavior | **PASS (code-level + build)** | Same code path as #10 — unchanged. |

## What this means

Nothing here is a demonstrated regression. Every item that could be checked without a live backend (7, 9, 10, 11, 12) checks out by direct code comparison against the pre-consolidation behavior, and the full production build in the previous pass already confirmed every route compiles and renders its static shell correctly. But **"no demonstrated regression via static analysis" is not the same as "verified,"** and I'm not claiming the latter for items 1-6 and 8. Per the task's explicit instruction, I have not rewritten any auth code in response to this — no regression was demonstrated, only a verification gap caused by an unrelated environment failure.

## Recommended follow-up

1. Someone with a working local backend launch path (an IDE run configuration, a different machine, or root-causing the Docker Desktop/WSL network interference) should run items 1-6 and 8 manually. This is a ~15-minute manual pass once the backend is up: register → verify email → login → check `localStorage['arcade-auth-storage']` and the `refreshToken` HttpOnly cookie → wait or manually expire the access token → make a protected request → confirm silent refresh → open two tabs and trigger two protected requests simultaneously after expiry → confirm only one `/api/internal/auth/refresh` call in the network tab → logout → confirm both token and cookie are cleared → try the Google OAuth button.
2. If anyone knows why the previously-running backend instance (PID 21924) worked but a fresh `mvnw spring-boot:run` doesn't, that's worth fixing independent of this task — it currently blocks *any* local backend development, not just this smoke test.
