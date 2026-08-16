'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/infrastructure/http/api';

export interface PublicCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string | null;
  type: 'COURSES' | 'EVENTS' | 'ARTICLES';
  displayOrder: number;
  active: boolean;
}

export const publicCategoriesKeys = {
  list: () => ['public-categories'] as const,
};

/** Active categories created via Console -> Content Manage -> Categories (super-user only). */
export function usePublicCategories(): PublicCategory[] {
  const { data } = useQuery({
    queryKey: publicCategoriesKeys.list(),
    queryFn: () => api.get<PublicCategory[]>('/api/v1/public/categories'),
    // Public, rarely-changing reference data — a longer staleTime avoids
    // re-fetching it on every mount across the several screens that use it.
    staleTime: 5 * 60 * 1000,
  });

  // Preserves the original hook's fail-open contract: callers render their
  // own hardcoded fallback categories when this returns empty, so a failed
  // fetch (silently swallowed by React Query's own error state, unused here)
  // degrades the same way it always did.
  return data ?? [];
}
