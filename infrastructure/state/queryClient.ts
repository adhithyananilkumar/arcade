import { QueryClient } from '@tanstack/react-query';

export const QUERY_KEYS = {
  profile: ['profile'] as const,
  organizations: (orgId?: string) => orgId ? ['organizations', orgId] as const : ['organizations'] as const,
  sessions: (userId: string) => ['sessions', userId] as const,
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * Without this, `staleTime` defaults to 0 and every mount refetches — so navigating away
       * from a page and back re-issues every request it makes, and so does refocusing the tab.
       * Measured on `/courses`: a second visit refetched the whole course list and all of its
       * rating requests, having changed nothing.
       *
       * 30s is deliberately short. It is long enough to cover navigation, tab switching and two
       * components mounting the same query, and short enough that a user who edits something and
       * navigates back still sees their change without a manual reload. Anything that must be
       * exact on arrival — a payment state, a review decision — should override this with its own
       * `staleTime: 0` rather than the whole app paying for that one case.
       */
      staleTime: 30_000,

      /**
       * Refocusing the tab is not by itself evidence that server data changed. Combined with
       * `staleTime`, a refocus inside the window now serves cache instead of refetching every
       * active query on the page.
       */
      refetchOnWindowFocus: false,

      retry: (failureCount, error: unknown) => {
        // Do not retry authorization/authentication failures. The canonical HTTP
        // client (infrastructure/http/api.ts) throws ApiError with a top-level
        // `.status`; this checks that shape structurally (rather than importing
        // the ApiError class, which would create a circular import back into
        // api.ts, which itself imports this module for cache-clearing on
        // session expiry).
        const status = (error as { status?: unknown })?.status;
        if (status === 401 || status === 403) return false;
        return failureCount < 3;
      },
    },
  },
});
