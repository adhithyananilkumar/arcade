// features/learning/delivery/lib/InteractionContext.tsx
// Phase 2 of the interactive-block architecture: per-learner state for interactive blocks
// (Toggle open/closed today, future drag-drop/knowledge-check progress later), scoped to one
// lesson. Fetched once per lesson and cached locally; writes are optimistic and fire-and-forget
// to the backend (see api/interactions.ts). Blocks that don't care about persisted state (Button,
// Callout) simply never call useBlockInteraction and are unaffected by this context existing.

"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { interactionService } from "../api/interactions";

import { BlockStateContext } from "@/shared/contexts/BlockStateContext";

/**
 * Wrap a single lesson's rendered content so its interactive blocks can persist state.
 * Omit `lessonId` (or don't wrap at all) to fall back to local-only, unpersisted state —
 * safe for content-type contexts where there is no lesson to key state against.
 */
export function InteractionProvider({
  lessonId,
  children,
}: {
  lessonId?: string | null;
  children: ReactNode;
}) {
  const [states, setStates] = useState<Record<string, Record<string, unknown>>>({});
  const loadedLessonId = useRef<string | null>(null);

  useEffect(() => {
    if (!lessonId || loadedLessonId.current === lessonId) return;
    loadedLessonId.current = lessonId;
    interactionService
      .getStates(lessonId)
      .then((byNode) => {
        setStates(Object.fromEntries(Object.entries(byNode).map(([nodeId, r]) => [nodeId, r.state])));
      })
      .catch(() => {
        // Best-effort — interactive blocks just fall back to their own defaults.
      });
  }, [lessonId]);

  const getState = useCallback((nodeId: string) => states[nodeId], [states]);

  const setState = useCallback(
    (nodeId: string, state: Record<string, unknown>) => {
      setStates((prev) => ({ ...prev, [nodeId]: state }));
      if (!lessonId) return;
      interactionService.putState(lessonId, nodeId, state).catch(() => {
        // Optimistic — a failed write just means it doesn't survive a reload.
      });
    },
    [lessonId]
  );

  return (
    <BlockStateContext.Provider value={{ getState, setState }}>
      {children}
    </BlockStateContext.Provider>
  );
}

