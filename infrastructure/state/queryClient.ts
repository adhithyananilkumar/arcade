import { QueryClient } from '@tanstack/react-query';

export const QUERY_KEYS = {
  profile: ['profile'] as const,
  organizations: (orgId?: string) => orgId ? ['organizations', orgId] as const : ['organizations'] as const,
  sessions: (userId: string) => ['sessions', userId] as const,
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
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
