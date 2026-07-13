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
        // Do not retry authorization/authentication failures
        if ((error as any)?.response?.status === 401 || (error as any)?.response?.status === 403) return false;
        return failureCount < 3;
      },
    },
  },
});
