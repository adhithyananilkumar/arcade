"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import debounce from "lodash.debounce";
import { getBadge, saveBadgeDocument } from "../api";
import { migrateBadgeDocument, type BadgeDocument } from "..";

// Konva touches the canvas/DOM at import time — must never run during SSR.
const BadgeCanvas = dynamic(() => import("./BadgeCanvas").then((m) => m.BadgeCanvas), {
  ssr: false,
  loading: () => (
    <div className="flex h-[592px] w-[592px] items-center justify-center rounded-2xl bg-[#0b0b18]/50 text-xs text-white/50">
      Loading editor…
    </div>
  ),
});

const AUTOSAVE_DEBOUNCE_MS = 2000;

interface StandaloneBadgeEditorProps {
  badgeId: string;
  readOnly?: boolean;
  className?: string;
}

export function StandaloneBadgeEditor({ badgeId, readOnly, className = "" }: StandaloneBadgeEditorProps) {
  const [document, setDocument] = useState<BadgeDocument | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const lastSavedRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setDocument(null);
    setLoadError(null);
    getBadge(badgeId)
      .then((res) => {
        if (cancelled) return;
        const parsed = migrateBadgeDocument(JSON.parse(res.document));
        lastSavedRef.current = JSON.stringify(parsed);
        setDocument(parsed);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error("Failed to load badge", err);
        setLoadError("This badge design couldn't be loaded. It may be corrupted or you may not have access.");
      });
    return () => {
      cancelled = true;
    };
  }, [badgeId]);

  const debouncedSave = useRef(
    debounce(async (id: string, doc: BadgeDocument) => {
      const serialized = JSON.stringify(doc);
      if (serialized === lastSavedRef.current) return;
      setSaveState("saving");
      try {
        await saveBadgeDocument(id, doc);
        lastSavedRef.current = serialized;
        setSaveState("saved");
      } catch (err) {
        console.error("Failed to save badge document", err);
        setSaveState("error");
      }
    }, AUTOSAVE_DEBOUNCE_MS)
  ).current;

  useEffect(() => () => debouncedSave.cancel(), [debouncedSave]);

  const handleChange = useCallback(
    (doc: BadgeDocument) => {
      setDocument(doc);
      if (!readOnly) debouncedSave(badgeId, doc);
    },
    [badgeId, readOnly, debouncedSave]
  );

  if (loadError) {
    return (
      <div className={`flex flex-col items-center gap-2 py-16 text-center ${className}`}>
        <p className="text-sm text-gray-500">{loadError}</p>
      </div>
    );
  }

  if (!document) {
    return (
      <div className={`flex h-[592px] w-full items-center justify-center ${className}`}>
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#14142b]" />
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <BadgeCanvas initialDocument={document} onChange={handleChange} readOnly={readOnly} />
      <div className="h-4 text-[11px] text-gray-400">
        {saveState === "saving" && "Saving…"}
        {saveState === "saved" && "Saved"}
        {saveState === "error" && <span className="text-red-500">Failed to save — retrying on next edit</span>}
      </div>
    </div>
  );
}
