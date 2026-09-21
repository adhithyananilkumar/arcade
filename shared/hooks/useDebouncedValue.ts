'use client';

import { useEffect, useState } from 'react';

/**
 * A value that only updates after it has stopped changing for `delayMs`.
 *
 * <p>For search boxes whose term is part of a query key. Without it, every keystroke is a new key
 * and therefore a new request — the cost of moving filtering from the browser to the database is
 * that typing becomes network traffic unless it is debounced.
 *
 * <p>The first value is returned immediately rather than after a delay, so a field that mounts with
 * a term already in it does not start empty.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    if (value === debounced) {
      return;
    }
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
    // `debounced` is deliberately excluded: including it would restart the timer each time this
    // effect settles, which is the one thing a debounce must not do.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, delayMs]);

  return debounced;
}
