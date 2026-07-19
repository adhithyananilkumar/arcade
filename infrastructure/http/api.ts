// lib/api.ts
// Thin API client wrapping fetch with base URL from env.
// Attaches the JWT access token and silently refreshes it on 401 using Zustand and AuthService.

import { useAuthStore } from "@/infrastructure/auth/auth.store";
import { AuthService } from "@/infrastructure/auth/auth.service";
import { queryClient } from "../state/queryClient";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

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

async function request<T>(
  path: string,
  options?: RequestInit,
  isRetry = false
): Promise<T> {
  const token = useAuthStore.getState().accessToken;
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
    
    // Refresh failed — session is over. Send the user to sign in.
    useAuthStore.getState().clearAuth();
    queryClient.clear();
    
    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      window.location.href = "/";
    }
    throw new Error("Your session has expired. Please sign in again.");
  }

  // Read the body once as text so empty responses (204, or a 201/200 with no
  // body) don't make JSON.parse throw on an empty string.
  const text = await res.text();

  if (!res.ok) {
    let message = `API error ${res.status}`;
    try {
      const err = JSON.parse(text);
      message = err.message ?? message;
    } catch {
      // body wasn't JSON — keep the generic message
    }
    throw new Error(message);
  }

  return (text ? JSON.parse(text) : null) as T;
}

// ── Exports ────────────────────────────────────────────────────────────────────

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
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
