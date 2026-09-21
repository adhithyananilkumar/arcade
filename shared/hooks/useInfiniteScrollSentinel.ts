'use client';

import { useCallback, useEffect, useRef } from 'react';

export interface InfiniteScrollSentinelOptions {
  /** Whether there is another page to ask for. */
  hasMore: boolean;
  /** True while a page is in flight — prevents asking for the same page twice. */
  isLoading: boolean;
  /** Called when the sentinel comes into view and another page is wanted. */
  onLoadMore: () => void;
  /**
   * How far ahead of the sentinel to start loading. A margin means the next page is usually already
   * there by the time the reader reaches the end, instead of them hitting a spinner.
   */
  rootMargin?: string;
}

/**
 * Attaches "load the next page when the bottom comes into view" to an element.
 *
 * <p>Returns a ref to put on a sentinel element after the last item. An `IntersectionObserver`
 * rather than a scroll listener because the observer fires off the main thread and does not run on
 * every scroll frame — the difference is visible on a long list.
 *
 * <p>The observer is torn down and rebuilt when `hasMore` or `isLoading` change, so a callback is
 * never invoked against a stale snapshot of them. That matters: an observer that kept firing while
 * a page was already loading would request the same page several times.
 */
export function useInfiniteScrollSentinel({
  hasMore,
  isLoading,
  onLoadMore,
  rootMargin = '600px',
}: InfiniteScrollSentinelOptions) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Held in a ref so changing the handler does not rebuild the observer on every render.
  const onLoadMoreRef = useRef(onLoadMore);
  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore || isLoading) {
      return;
    }
    // Not available in some test environments and in older browsers; without it the list simply
    // stops auto-loading rather than breaking.
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          onLoadMoreRef.current();
        }
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoading, rootMargin]);

  /** Manual trigger, for a "Load more" button offered alongside the sentinel. */
  const loadMore = useCallback(() => {
    if (hasMore && !isLoading) {
      onLoadMoreRef.current();
    }
  }, [hasMore, isLoading]);

  return { sentinelRef, loadMore };
}
