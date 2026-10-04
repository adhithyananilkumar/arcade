import { API_V1_BASE_URL, API_ORIGIN } from "@/infrastructure/config/env";

/**
 * Resolves a user-supplied avatar or media value (absolute URL, blob/data URL, bare
 * filename, or a backend-relative "/api/v1/..." path) into a URL the browser
 * can load directly. Consolidated from independent copies of this logic across the app.
 */
export function getAvatarUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }
  if (url.startsWith("/api/v1/")) {
    return `${API_ORIGIN}${url}`;
  }
  if (url.startsWith("api/v1/")) {
    return `${API_ORIGIN}/${url}`;
  }
  if (url.startsWith("/")) {
    return `${API_ORIGIN}${url}`;
  }
  if (!url.includes("/")) {
    return `${API_V1_BASE_URL}/users/avatars/${url}`;
  }
  return `${API_ORIGIN}/${url}`;
}

