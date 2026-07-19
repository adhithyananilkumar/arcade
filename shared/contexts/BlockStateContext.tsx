"use client";

import { createContext, useCallback, useContext } from "react";

interface BlockStateContextValue {
  getState: (nodeId: string) => Record<string, unknown> | undefined;
  setState: (nodeId: string, state: Record<string, unknown>) => void;
}

export const BlockStateContext = createContext<BlockStateContextValue>({
  getState: () => undefined,
  setState: () => {},
});

/** Persisted per-learner state for one interactive block instance, keyed by its stable nodeId. */
export function useBlockState<T extends Record<string, unknown>>(
  nodeId: string | undefined,
  defaultState: T
): [T, (next: T) => void] {
  const { getState, setState } = useContext(BlockStateContext);
  const current = (nodeId ? getState(nodeId) : undefined) as T | undefined;
  const update = useCallback(
    (next: T) => {
      if (nodeId) setState(nodeId, next);
    },
    [nodeId, setState]
  );
  return [current ?? defaultState, update];
}
