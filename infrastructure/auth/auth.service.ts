import { API_V1_BASE_URL } from "@/infrastructure/config/env";

// The AuthService calls the Next.js API Routes (BFF) for login/logout/refresh
// (so the refresh-token cookie stays HttpOnly), and the Spring Boot backend
// directly for the remaining auth operations that don't need a cookie set.
//
// Transport is native fetch, matching infrastructure/http/api.ts's conventions
// (same NEXT_PUBLIC_API_URL resolution via infrastructure/config/env, same
// "throw on non-OK response" contract). This class is kept separate from the
// canonical `api` client (rather than routed through it) because `api.ts`
// itself calls AuthService.refresh() to implement its own 401-refresh flow —
// routing AuthService's calls back through `api.ts` would be a circular
// dependency, and refresh() would recursively trigger api.ts's own 401 retry
// logic. AuthService intentionally stays a thin, self-contained fetch wrapper.
let refreshPromise: Promise<any> | null = null;

class AuthServiceError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "AuthServiceError";
    this.status = status;
  }
}

async function readError(res: Response, fallback: string): Promise<AuthServiceError> {
  try {
    const data = await res.json();
    return new AuthServiceError(res.status, data?.message ?? fallback);
  } catch {
    return new AuthServiceError(res.status, fallback);
  }
}

// Mirrors infrastructure/http/api.ts's empty-body handling: some of these
// endpoints (e.g. logout, verify-email) may respond 200/204 with no body,
// which would otherwise throw on res.json().
async function readBody(res: Response): Promise<any> {
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export class AuthService {
  static async login(credentials: any) {
    const res = await fetch("/api/internal/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" },
      credentials: "include",
      body: JSON.stringify(credentials),
    });

    if (res.status === 404) {
      const fallbackRes = await fetch(`${API_V1_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });
      if (!fallbackRes.ok) throw await readError(fallbackRes, "Login failed");
      return readBody(fallbackRes);
    }

    if (!res.ok) throw await readError(res, "Login failed");
    return readBody(res);
  }

  static async logout() {
    const res = await fetch("/api/internal/auth/logout", {
      method: "POST",
      headers: { "X-Requested-With": "XMLHttpRequest" },
      credentials: "include",
    });
    if (!res.ok) throw await readError(res, "Logout failed");
  }

  static async refresh() {
    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const res = await fetch("/api/internal/auth/refresh", {
            method: "POST",
            headers: { "X-Requested-With": "XMLHttpRequest" },
            credentials: "include",
          });
          if (!res.ok) throw await readError(res, "Refresh failed");
          return await readBody(res);
        } finally {
          refreshPromise = null;
        }
      })();
    }
    return refreshPromise;
  }

  static async register(userData: any) {
    // Register can bypass BFF if it doesn't set HttpOnly cookies,
    // but to avoid exposing NEXT_PUBLIC_API_URL we could proxy it too.
    // Assuming backend returns 201 without cookies:
    const res = await fetch(`${API_V1_BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
    if (!res.ok) throw await readError(res, "Registration failed");
    return readBody(res);
  }

  static async forgotPassword(email: string) {
    const res = await fetch(`${API_V1_BASE_URL}/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw await readError(res, "Request failed");
    return readBody(res);
  }

  static async resetPassword(token: string, newPassword: string) {
    const res = await fetch(`${API_V1_BASE_URL}/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newPassword }),
    });
    if (!res.ok) throw await readError(res, "Reset failed");
    return readBody(res);
  }

  static async verifyEmail(token: string, email?: string) {
    const url = email
      ? `${API_V1_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`
      : `${API_V1_BASE_URL}/auth/verify-email?token=${encodeURIComponent(token)}`;
    const res = await fetch(url, { method: "POST" });
    if (!res.ok) throw await readError(res, "Verification failed");
    return readBody(res);
  }

  static async resendVerificationCode(email: string) {
    const res = await fetch(
      `${API_V1_BASE_URL}/auth/resend-verification?email=${encodeURIComponent(email)}`,
      { method: "POST" }
    );
    if (!res.ok) throw await readError(res, "Resend failed");
    return readBody(res);
  }
}
