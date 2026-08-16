import { API_V1_BASE_URL } from "@/infrastructure/config/env";

/**
 * Resolves a user-supplied avatar value (absolute URL, blob/data URL, bare
 * filename, or a backend-relative "/api/v1/..." path) into a URL the browser
 * can load directly. Consolidated from 6 independent copies of this exact
 * logic that previously lived in individual page components.
 */
export function getAvatarUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) return url;
  if (url.startsWith("/api/v1/")) {
    return API_V1_BASE_URL.replace("/api/v1", "") + url;
  }
  if (!url.includes("/")) {
    return `${API_V1_BASE_URL}/users/avatars/${url}`;
  }
  return API_V1_BASE_URL + (url.startsWith("/") ? "" : "/") + url;
}
