'use client';

import { useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { api } from '@/infrastructure/http/api';
import type { CourseSummaryResponse, SpringPage } from '@/shared/types/api.types';

/** How many cards a catalogue surface asks for at a time. Matches the backend's default. */
export const PUBLIC_COURSES_PAGE_SIZE = 24;

export interface PublicCoursesOptions {
  /** Restrict to one admin category. Omit for the whole catalogue. */
  categoryId?: string;
  /** Free-text title search, applied by the backend. */
  search?: string;
  size?: number;
  /** Skip the request entirely — for surfaces that mount before they know what to ask for. */
  enabled?: boolean;
}

export const publicCoursesQueryKey = (options: PublicCoursesOptions = {}) =>
  [
    'public-courses',
    options.categoryId ?? null,
    options.search ?? null,
    options.size ?? PUBLIC_COURSES_PAGE_SIZE,
  ] as const;

function fetchPage(options: PublicCoursesOptions, page: number) {
  const params = new URLSearchParams({
    page: String(page),
    size: String(options.size ?? PUBLIC_COURSES_PAGE_SIZE),
  });
  if (options.categoryId) params.set('categoryId', options.categoryId);
  if (options.search && options.search.trim()) params.set('q', options.search.trim());
  return api.get<SpringPage<CourseSummaryResponse>>(`/api/v1/public/courses?${params.toString()}`);
}

/**
 * The public course catalogue, loaded a page at a time and appended as the reader scrolls.
 *
 * <p>Two problems this replaced. It was originally a bare `useEffect` fetching every published
 * course with no parameters and no cache — 1.68 MB and 2.35 s — so every consumer downloaded the
 * whole catalogue and two components mounting it made two requests. Paging the endpoint fixed the
 * payload but left a single page reachable, which is its own bug: the catalogue has far more than
 * one page in it.
 *
 * <p>So this is an infinite query. `courses` is every page fetched so far, flattened, which keeps
 * the consuming components' contract identical to the array they used to receive — they render a
 * list and do not need to know it arrives in pieces.
 *
 * <p>Changing `categoryId` or `search` changes the query key, so filtering starts a fresh sequence
 * from page 0 rather than appending unrelated results.
 */
export function usePublicCourses(options: PublicCoursesOptions = {}) {
  const { enabled = true } = options;
  const key = publicCoursesQueryKey(options);

  const query = useInfiniteQuery({
    queryKey: key,
    enabled,
    initialPageParam: 0,
    queryFn: ({ pageParam }) => fetchPage(options, pageParam as number),
    // `last` comes from the server, so "is there more?" is never inferred from whether the last
    // page happened to be full — which is wrong exactly when the total is a multiple of the size.
    getNextPageParam: (lastPage) => (lastPage.last ? undefined : lastPage.number + 1),
  });

  const courses = useMemo(
    () => (query.data?.pages ?? []).flatMap((p) => p.content),
    [query.data],
  );

  return {
    /** Every page loaded so far, flattened. Always an array. */
    courses,
    /** The catalogue total, not the number loaded — for "showing 24 of 1,335". */
    totalElements: query.data?.pages[0]?.totalElements ?? 0,
    hasMore: Boolean(query.hasNextPage),
    /** True for the first page only; use `isLoadingMore` for subsequent ones. */
    isLoading: query.isLoading,
    isLoadingMore: query.isFetchingNextPage,
    isError: query.isError,
    loadMore: query.fetchNextPage,
  };
}

/**
 * One page of the catalogue, without the infinite machinery.
 *
 * <p>For surfaces that want a bounded sample rather than a browsable list — the home page's four
 * recommendation cards, for instance, which need a pool to choose from and nothing more.
 */
export function usePublicCoursesPage(options: PublicCoursesOptions = {}) {
  const { enabled = true } = options;
  const query = useQuery({
    queryKey: [...publicCoursesQueryKey(options), 'single-page'] as const,
    enabled,
    queryFn: () => fetchPage(options, 0),
  });

  return {
    courses: query.data?.content ?? ([] as CourseSummaryResponse[]),
    totalElements: query.data?.totalElements ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
