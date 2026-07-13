// lib/api.ts
// Thin API client wrapping fetch with base URL from env.
// All content operations go through these functions.

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    ...options,
  });

  // Read the body once as text so we can handle empty responses (204, or a
  // 201/200 with no body) without JSON.parse throwing on an empty string.
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
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
