/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Infrastructure
 * Module: HTTP
 *
 * Purpose:
 * The single source of truth for all outgoing HTTP requests.
 *
 * Rules:
 * - Must remain agnostic to Arcade business domains.
 * - Exposes generic methods (get, post, put, delete).
 * - Do not import anything from domains/ or apps/.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

// lib/api.ts
// Thin API client wrapping fetch with base URL from env.
// Attaches the JWT access token and silently refreshes it on 401 using Zustand and AuthService.

import { useAuthStore } from "@/infrastructure/auth/auth.store";
import { AuthService } from "@/infrastructure/auth/auth.service";
import { queryClient } from "../state/queryClient";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

// Thrown instead of a plain Error so callers that need to branch on HTTP
// status (e.g. distinguishing 404 from 403) don't have to string-match messages.
export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// A single in-flight refresh shared across concurrent 401s
let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const { accessToken, user } = await AuthService.refresh();
        useAuthStore.getState().setAuth(user || useAuthStore.getState().user!, accessToken);
        return true;
      } catch (err) {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

function getAccessToken(): string | null {
  const storeToken = useAuthStore.getState().accessToken;
  if (storeToken) return storeToken;
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("arcade-auth-storage");
      if (raw) {
        const parsed = JSON.parse(raw);
        return parsed.state?.accessToken || null;
      }
    } catch {
      // ignore
    }
  }
  return null;
}

async function request<T>(
  path: string,
  options?: RequestInit,
  isRetry = false
): Promise<T> {
  const token = getAccessToken();
  const isFormData = options?.body instanceof FormData;
  
  const headers: Record<string, string> = {
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...((options?.headers as Record<string, string>) ?? {}),
  };
  
  // If headers explicitly passed Content-Type but it's FormData, let browser set it
  if (isFormData && headers["Content-Type"]) {
    delete headers["Content-Type"];
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Access token expired/invalid — try to refresh once, then replay the request.
  if (res.status === 401 && !isRetry) {
    const refreshed = await refreshTokens();
    if (refreshed) {
      return request<T>(path, options, true);
    }

    // Only treat this as an expired session if we actually had a token to begin
    // with. An anonymous request 401ing (e.g. a logged-out visitor hitting a
    // protected endpoint from a public page) never had a session to expire, so
    // it shouldn't clear auth state or force-navigate the user off the page.
    if (token) {
      useAuthStore.getState().clearAuth();
      queryClient.clear();

      if (typeof window !== "undefined" && window.location.pathname !== "/") {
        window.location.href = "/";
      }
      throw new Error("Your session has expired. Please sign in again.");
    }

    throw new ApiError(401, "Unauthorized");
  }

  // Read the body once as text so empty responses (204, or a 201/200 with no
  // body) don't make JSON.parse throw on an empty string.
  const text = await res.text();

  if (!res.ok) {
    let message = `API error ${res.status}`;
    if (text) {
      console.error(`[API ERROR ${res.status}] Path: ${path}`, text);
      try {
        const err = JSON.parse(text);
        message = err.message ?? message;
      } catch {
        // If it's not JSON (like plain text "Too many requests"), use it directly if it's a short string
        if (text.length < 100 && !text.includes('<html')) {
          message = text;
        }
      }
    }
    throw new ApiError(res.status, message);
  }

  return (text ? JSON.parse(text) : null) as T;
}

// ── Exports ────────────────────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string, options?: RequestInit) => request<T>(path, { method: "GET", cache: "no-store", ...options }),
  post: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body), ...options }),
  patch: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, { method: "PATCH", body: body instanceof FormData ? body : JSON.stringify(body), ...options }),
  put: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, { method: "PUT", body: body instanceof FormData ? body : JSON.stringify(body), ...options }),
  delete: <T>(path: string, body?: unknown, options?: RequestInit) =>
    request<T>(path, {
      method: "DELETE",
      ...(body !== undefined ? { body: body instanceof FormData ? body : JSON.stringify(body) } : {}),
      ...options,
    }),
};