"use client";

import { useUnsavedChangesGuard } from "./useUnsavedChangesGuard";
import type { StudioSaveState } from "./useStudioSaveManager";

export interface StudioUnsavedChangesSource {
  isDirty?: boolean;
  saveState?: StudioSaveState;
}

/**
 * Connects save state or dirty status to browser navigation protection.
 *
 * Keeps useStudioSaveManager generic and decoupled from browser navigation side-effects,
 * allowing workspaces or StudioShell composition to activate beforeunload protection.
 */
export function useStudioUnsavedChanges(
  source: boolean | StudioUnsavedChangesSource
) {
  const hasUnsaved =
    typeof source === "boolean"
      ? source
      : Boolean(source.isDirty || source.saveState === "saving");

  useUnsavedChangesGuard(hasUnsaved);
}
