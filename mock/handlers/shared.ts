import type { MockErrorResponse } from '../types';

export interface MockRequest {
  method: string;
  searchParams: URLSearchParams;
  body: unknown;
}

export interface MockResult {
  status: number;
  body: unknown;
}

const MOCK_ERROR: MockErrorResponse = {
  message: 'Mock error fixture — simulated backend failure.',
  status: 500,
};

/**
 * Applies the shared ?mockState=empty|error|long convention to a list
 * endpoint. Returns a bare array, matching the real backend's response shape
 * for every list endpoint mocked so far (each *.service.ts types its list
 * calls as `Promise<T[]>`, not a paginated envelope) — keep it that way
 * unless a resource's real contract is actually paginated.
 */
export function listResponse<T>(all: T[], req: MockRequest, longItem: (i: number) => T): MockResult {
  const state = req.searchParams.get('mockState');

  if (state === 'error') {
    return { status: MOCK_ERROR.status, body: MOCK_ERROR };
  }

  if (state === 'empty') {
    return { status: 200, body: [] };
  }

  if (state === 'long') {
    return { status: 200, body: Array.from({ length: 42 }, (_, i) => longItem(i)) };
  }

  return { status: 200, body: all };
}

export function itemOr404<T>(item: T | undefined): MockResult {
  if (!item) {
    return { status: 404, body: { message: 'Not found', status: 404 } satisfies MockErrorResponse };
  }
  return { status: 200, body: item };
}

export function maybeError(req: MockRequest): MockResult | null {
  if (req.searchParams.get('mockState') === 'error') {
    return { status: MOCK_ERROR.status, body: MOCK_ERROR };
  }
  return null;
}
