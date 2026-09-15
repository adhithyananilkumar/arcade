/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Infrastructure
 * Module: Config
 *
 * Purpose:
 * Single canonical source for backend/websocket origin resolution.
 * Every other infrastructure module (HTTP client, auth service, BFF
 * routes, websocket hooks) should import from here instead of reading
 * `process.env.NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_WS_URL` directly with
 * its own locally-hardcoded fallback.
 *
 * `API_ORIGIN` preserves the exact fallback every existing call site
 * already used when the env var is unset ("http://localhost:8080"),
 * so local/dev behavior is unchanged. `API_V1_BASE_URL` derives the
 * "/api/v1"-suffixed form some call sites need from the SAME origin,
 * instead of each of those call sites independently guessing whether
 * NEXT_PUBLIC_API_URL already includes the suffix.
 * ------------------------------------------------------------------
 */

const RAW_API_ORIGIN = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/$/, "");

/** Bare backend origin, no path suffix. Used by the canonical HTTP client and as the WS-origin fallback. */
export const API_ORIGIN = RAW_API_ORIGIN;

/** Backend origin with the `/api/v1` suffix, for call sites that talk to the versioned auth/user REST surface directly. */
export const API_V1_BASE_URL = `${RAW_API_ORIGIN}/api/v1`;

/** WebSocket/STOMP broker origin. Falls back to the API origin, matching every existing websocket hook's fallback. */
export const WS_ORIGIN = process.env.NEXT_PUBLIC_WS_URL || RAW_API_ORIGIN;

/** Google OAuth2 authorization endpoint on the backend. */
export const GOOGLE_OAUTH_URL = `${RAW_API_ORIGIN}/oauth2/authorization/google`;

/** Hocuspocus/yjs collaboration server WS origin — a separate service from the main backend, not derived from API_ORIGIN. */
export const COLLAB_WS_URL =
  process.env.NEXT_PUBLIC_COLLABORATION_URL || process.env.NEXT_PUBLIC_COLLAB_WS_URL || "ws://localhost:1234";
