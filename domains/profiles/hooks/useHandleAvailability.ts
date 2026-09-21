'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Domains
 * Domain: Profiles
 *
 * Purpose:
 * Live "is this handle free" feedback for a handle input.
 *
 * Rules:
 * - The server answers. The local shape check only suppresses requests that
 *   cannot possibly succeed; it never reports a name as available.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */

import { useEffect, useRef, useState } from 'react';
import {
  HandleService,
  handleShapeError,
  normalizeHandle,
} from '../api/handle.service';
import type { HandleAvailabilityResult } from '../types/profile.types';

export interface HandleAvailabilityState {
  /** True while a request is in flight, and while the debounce is still pending. */
  checking: boolean;
  result: HandleAvailabilityResult | null;
  /** A local shape violation, available before any request is made. */
  shapeError: string | null;
  /** True when the value equals the handle the subject already holds. */
  unchanged: boolean;
}

const DEBOUNCE_MS = 400;

/**
 * @param value what the person has typed so far
 * @param currentHandle the handle the subject holds today, so re-typing it is not reported as taken
 * @param channelId ask on a channel's behalf rather than the calling user's
 */
export function useHandleAvailability(
  value: string,
  currentHandle?: string | null,
  channelId?: string,
): HandleAvailabilityState {
  const [result, setResult] = useState<HandleAvailabilityResult | null>(null);
  const [checking, setChecking] = useState(false);

  // Guards against a slow earlier response overwriting a newer one — typing "ac", "acm", "acme"
  // fires three requests and they can land in any order.
  const requestId = useRef(0);

  const normalized = normalizeHandle(value);
  const unchanged =
    !!currentHandle && normalized === normalizeHandle(currentHandle);
  const shapeError = value.trim() ? handleShapeError(value) : null;

  useEffect(() => {
    // A debounced remote check. Clearing a stale verdict the moment the input stops qualifying
    // is the correct behaviour: leaving the previous answer on screen would report the old
    // name's availability for the new one.
    if (unchanged || !normalized || shapeError) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResult(null);
      setChecking(false);
      return;
    }

    setChecking(true);
    const id = ++requestId.current;
    const timer = setTimeout(() => {
      HandleService.checkAvailability(normalized, channelId)
        .then((response) => {
          if (id !== requestId.current) return;
          setResult(response);
        })
        .catch(() => {
          if (id !== requestId.current) return;
          // A failed check must not claim the name is free. Clearing leaves the field in its
          // neutral state, and the claim itself will report the real answer.
          setResult(null);
        })
        .finally(() => {
          if (id === requestId.current) setChecking(false);
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [normalized, shapeError, unchanged, channelId]);

  return { checking, result, shapeError, unchanged };
}
