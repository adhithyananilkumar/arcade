'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/infrastructure/http/api';

export const publicCourseCountsQueryKey = ['public-course-counts'] as const;

/** Mirrors the backend's `PublicCourseCountsResponse`. */
export interface PublicCourseCounts {
  /** Every visible published course, including any with no category. */
  total: number;
  /** Count per category id. A category with nothing published is absent, not zero. */
  byCategory: Record<string, number>;
}

/**
 * Published course counts for the catalogue's category pills.
 *
 * <p>Exists so the catalogue can show every category's count while loading only one category's
 * cards. Previously the counts were derived in the browser from a full download of the catalogue,
 * which is the only reason that download happened at all.
 *
 * <p>`total` is carried separately rather than summed from `byCategory`, which would omit published
 * courses that have no category.
 *
 * <p>Fails open to zeroes, matching `usePublicCategories`: a missing count renders as 0 rather than
 * blocking the pill strip.
 */
export function usePublicCourseCounts(): PublicCourseCounts {
  const { data } = useQuery({
    queryKey: publicCourseCountsQueryKey,
    queryFn: () => api.get<PublicCourseCounts>('/api/v1/public/courses/counts-by-category'),
    // Counts shift only when something is published or unpublished, and a pill being a minute
    // stale is invisible — this is reference data, like the category list itself.
    staleTime: 5 * 60 * 1000,
  });

  return data ?? { total: 0, byCategory: {} };
}
