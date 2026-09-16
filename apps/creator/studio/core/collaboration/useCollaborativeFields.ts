"use client";

// Binds a flat object of plain fields (strings, numbers, booleans — Course/Event metadata,
// an exam question's type/points/options/…) to a Y.Map named "fields" on a shared Y.Doc, the
// structured-field counterpart to Tiptap's Y.XmlFragment binding for rich text. Both live in the
// same generic collaboration layer (see useCollaborativeDocument) — this is what makes a content
// type with no rich text at all still get real-time collaborative editing, not just history.
//
// Server-side, backend/collaboration/src/server.ts reads this exact "fields" map to build the
// JSON body it PUTs to the backend on every debounced save (see RICH_TEXT_OWNER_TYPES there).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type * as Y from "yjs";

export function useCollaborativeFields<T extends Record<string, unknown>>(
  ydoc: Y.Doc | null,
  initial: T
) {
  const map = useMemo(() => ydoc?.getMap<unknown>("fields") ?? null, [ydoc]);
  const [values, setValues] = useState<T>(initial);
  const seededRef = useRef(false);

  useEffect(() => {
    if (!map) return;

    // First mount for this room: an empty map means nobody has ever saved this document's
    // fields before, so seed it from the caller's initial (server-fetched) values — the same
    // one-time "legacy seeding" useArcadeEditor does for a lesson predating version history. A
    // non-empty map means real state already exists there; read it instead of overwriting it.
    if (!seededRef.current) {
      seededRef.current = true;
      if (map.size === 0) {
        map.doc?.transact(() => {
          Object.entries(initial).forEach(([key, value]) => {
            if (value !== undefined) map.set(key, value);
          });
        });
      } else {
        setValues((prev) => ({ ...prev, ...(map.toJSON() as Partial<T>) }));
      }
    }

    const observer = () => setValues((prev) => ({ ...prev, ...(map.toJSON() as Partial<T>) }));
    map.observe(observer);
    return () => map.unobserve(observer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map]);

  const setField = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      map?.doc?.transact(() => {
        map.set(key as string, value);
      });
    },
    [map]
  );

  return { values, setField, ready: !!map };
}
