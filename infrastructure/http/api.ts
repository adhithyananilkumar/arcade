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
import { API_ORIGIN } from "@/infrastructure/config/env";
import { reportNetworkFailure, reportReachable } from "@/infrastructure/state/connectivity.store";

const BASE_URL = API_ORIGIN;

/** Backend error codes on 5xx responses whose message is written for the user and safe to show. */
const USER_FACING_SERVER_ERROR_CODES = new Set(["EMAIL_NOT_SENT"]);

// Thrown instead of a plain Error so callers that need to branch on HTTP
// status (e.g. distinguishing 404 from 403) don't have to string-match messages.
/**
 * `ApiError.status` when the request never reached the server at all. Not a real HTTP status —
 * there was no response to take one from — so it is a sentinel outside the 1xx-5xx range that
 * callers can branch on without colliding with anything the backend can return.
 */
export const NETWORK_ERROR_STATUS = 0;

/**
 * The message for a request that got no HTTP answer. Users are told what they can act on; the API
 * address (which only means something to a developer) is added in development builds.
 */
function networkErrorMessage(): string {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return "You're not connected to the internet.";
  }
  const message = "We couldn't reach Arcade. Check your connection and try again.";
  return process.env.NODE_ENV === "development"
    ? `${message} (No answer from ${BASE_URL} — is the API running?)`
    : message;
}

/** Rejects with the network {@link ApiError}, after letting the connectivity store look into why. */
function networkError(cause: unknown): ApiError {
  // A caller cancelling its own request says nothing about the network.
  if (!(cause instanceof DOMException && cause.name === "AbortError")) reportNetworkFailure();
  return new ApiError(NETWORK_ERROR_STATUS, networkErrorMessage(), { cause });
}

export class ApiError extends Error {
  status: number;
  /** The backend's machine-readable error code (`ErrorResponse.code`), when it sent one. */
  code?: string;
  constructor(status: number, message: string, options?: ErrorOptions & { code?: string }) {
    super(message, options);
    this.name = "ApiError";
    this.status = status;
    this.code = options?.code;
  }

  /** True when the API could not be reached, as opposed to reached and refused. */
  get isNetworkError(): boolean {
    return this.status === NETWORK_ERROR_STATUS;
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
        // No answer at all (fetch rejects with a TypeError): the session may be perfectly valid,
        // so a dropped connection must not sign the user out. Fail this request as a network error.
        if (err instanceof TypeError) throw networkError(err);
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

/**
 * Request options, plus Arcade's own additions to `RequestInit`.
 */
export interface ApiRequestOptions extends RequestInit {
  /**
   * HTTP statuses this caller treats as a normal answer rather than a fault, so they are not
   * logged to the console as errors.
   *
   * <p>Some endpoints answer a *question*, and "no" is a valid reply. Probing an entitlement-gated
   * endpoint to find out whether a learner holds the content is the motivating case: its 403 is
   * the information being asked for, and logging it shouts about a failure that did not happen.
   * The call still rejects with an {@link ApiError} — this only governs console noise.
   */
  expectedStatuses?: number[];
}

async function request<T>(
  path: string,
  options?: ApiRequestOptions,
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

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch (cause) {
    // fetch only rejects when the request never got an HTTP answer at all — the API process is
    // down, DNS/CORS refused it, or the network dropped. Previously this escaped as a bare
    // `TypeError: Failed to fetch`, which is not an ApiError, so every call site's `catch` fell
    // through to its generic "please try again" branch and told the user to retry something that
    // cannot succeed until the server is back up. Normalising it here means callers can tell
    // "the server said no" apart from "there was no server", and say so.
    throw networkError(cause);
  }
  reportReachable();

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
    let code: string | undefined;
    if (text) {
      if (!options?.expectedStatuses?.includes(res.status)) {
        console.error(`[API ERROR ${res.status}] Path: ${path}`, text);
      }
      try {
        const err = JSON.parse(text);
        message = err.message ?? message;
        code = typeof err.code === 'string' ? err.code : undefined;
      } catch {
        // If it's not JSON (like plain text "Too many requests"), use it directly if it's a short string
        if (text.length < 100 && !text.includes('<html')) {
          message = text;
        }
      }
    }

    // 5xx bodies may contain the backend's raw exception message (and, in a
    // dev-mode backend config, a full stack trace — see
    // GlobalExceptionHandler's catch-all handler). The parsed message above
    // is still logged to the console for debugging, but callers across the
    // app widely do `toast.error(error.message)` directly, so anything not
    // safe to show a user must be replaced here rather than at each of
    // those call sites individually.
    // Except the 5xx errors the backend raises on purpose with a message written for the user
    // (GlobalExceptionHandler), e.g. "We couldn't send the email to …" — hiding that behind the
    // generic text would leave the user believing the email went out.
    if (res.status >= 500 && !(code && USER_FACING_SERVER_ERROR_CODES.has(code))) {
      // The backend's catch-all handler ends its message with "Reference: <correlation id>" — an
      // id minted specifically to be quoted back, and the only way to find the matching server log
      // line. Keeping it is the difference between a user reporting "it broke" and reporting
      // something the server log can be grepped for, so it survives the redaction of everything
      // else in the body.
      const reference = /Reference:\s*([0-9a-fA-F-]{8,})/.exec(message)?.[1];
      message = reference
        ? `Something went wrong on our end (reference ${reference}). Please try again in a moment.`
        : 'Something went wrong on our end. Please try again in a moment.';
    }

    throw new ApiError(res.status, message, { code });
  }

  return (text ? JSON.parse(text) : null) as T;
}

/**
 * Fetches a binary response (a PDF, an image, an export) with the same session handling as
 * {@link request}: bearer token attached, one silent refresh on 401. Errors surface as
 * {@link ApiError} with the server's message, exactly like JSON calls.
 */
async function requestBlob(path: string, isRetry = false): Promise<{ blob: Blob; fileName: string | null }> {
  const token = getAccessToken();
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method: "GET",
      cache: "no-store",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  } catch (cause) {
    throw networkError(cause);
  }
  reportReachable();
  if (res.status === 401 && !isRetry && token && (await refreshTokens())) {
    return requestBlob(path, true);
  }
  if (!res.ok) {
    let message = res.status === 429 ? "Too many downloads. Please wait a minute and try again." : `Download failed (${res.status})`;
    if (res.status < 500 && res.status !== 429) {
      try {
        const err = JSON.parse(await res.text());
        message = err.message ?? message;
      } catch {
        // not JSON — keep the generic message
      }
    } else if (res.status >= 500) {
      message = "Something went wrong on our end. Please try again in a moment.";
    }
    throw new ApiError(res.status, message);
  }
  return { blob: await res.blob(), fileName: fileNameFrom(res.headers.get("Content-Disposition")) };
}

/** The filename a Content-Disposition header offers, preferring the RFC 5987 UTF-8 form. */
function fileNameFrom(header: string | null): string | null {
  if (!header) return null;
  const extended = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(header)?.[1];
  if (extended) {
    try {
      return decodeURIComponent(extended.trim());
    } catch {
      // fall through to the plain form
    }
  }
  return /filename\s*=\s*"?([^";]+)"?/i.exec(header)?.[1]?.trim() ?? null;
}

/** Hands a blob to the browser as a file download. */
function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  // Revoke on the next tick: some browsers start the download asynchronously.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}

// ── Exports ────────────────────────────────────────────────────────────────────

/**
 * POST a raw body (a Blob) to the API with progress — the JSON/FormData `api.post` cannot report
 * upload progress. Attaches the access token and retries once after a token refresh.
 */
export function apiUploadWithProgress<T>(
  path: string,
  body: Blob,
  contentType: string,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<T> {
  const send = (retried: boolean): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const onAbort = () => xhr.abort();
      signal?.addEventListener("abort", onAbort);
      const cleanup = () => signal?.removeEventListener("abort", onAbort);
      xhr.open("POST", `${BASE_URL}${path}`);
      xhr.withCredentials = true;
      const token = getAccessToken();
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.setRequestHeader("Content-Type", contentType);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        cleanup();
        reportReachable();
        if (xhr.status === 401 && !retried) {
          refreshTokens()
            .then((ok) => (ok ? send(true).then(resolve, reject) : reject(new ApiError(401, "Unauthorized"))))
            .catch(reject);
          return;
        }
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve((xhr.responseText ? JSON.parse(xhr.responseText) : undefined) as T);
          } catch {
            resolve(undefined as T);
          }
          return;
        }
        let message = `API error ${xhr.status}`;
        try {
          message = JSON.parse(xhr.responseText)?.message ?? message;
        } catch {
          // keep the generic message
        }
        reject(new ApiError(xhr.status, xhr.status >= 500 ? "Something went wrong on our side. Please try again." : message));
      };
      xhr.onerror = () => {
        cleanup();
        reject(networkError(undefined));
      };
      xhr.onabort = () => {
        cleanup();
        reject(new DOMException("Upload cancelled", "AbortError"));
      };
      xhr.send(body);
    });
  return send(false);
}

export const api = {
  get: <T>(path: string, options?: ApiRequestOptions) => request<T>(path, { method: "GET", cache: "no-store", ...options }),
  post: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(path, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body), ...options }),
  patch: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(path, { method: "PATCH", body: body instanceof FormData ? body : JSON.stringify(body), ...options }),
  put: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(path, { method: "PUT", body: body instanceof FormData ? body : JSON.stringify(body), ...options }),
  delete: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    request<T>(path, {
      method: "DELETE",
      ...(body !== undefined ? { body: body instanceof FormData ? body : JSON.stringify(body) } : {}),
      ...options,
    }),
  /**
   * Downloads a file the API serves (e.g. a PDF) and saves it in the browser, named as the server
   * says, else `fallbackFileName`. Rejects with an {@link ApiError} like any other call.
   */
  download: async (path: string, fallbackFileName: string): Promise<void> => {
    const { blob, fileName } = await requestBlob(path);
    saveBlob(blob, fileName ?? fallbackFileName);
  },
};