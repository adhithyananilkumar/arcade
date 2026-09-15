"use client";

import { Check, Loader2 } from "lucide-react";
import type { SaveState } from "./useSectionQuestions";

/**
 * The autosave state of the question-authoring engine, as a line of text.
 *
 * <p>Its own file because it is the one piece of the old stacked section editor worth keeping:
 * pure, stateless, and needed wherever questions are edited. Nothing else about that editor
 * survived the move to the Studio.
 */
export function SaveIndicator({ state }: { state: SaveState }) {
  if (state === "saving")
    return (
      <span className="flex items-center gap-1.5 text-xs text-gray-400">
        <Loader2 size={12} className="animate-spin" />
        Saving…
      </span>
    );
  if (state === "saved")
    return (
      <span className="flex items-center gap-1.5 text-xs text-emerald-600">
        <Check size={12} />
        Saved
      </span>
    );
  if (state === "error")
    return <span className="text-xs text-red-500">Save failed — retrying on next edit</span>;
  return null;
}
