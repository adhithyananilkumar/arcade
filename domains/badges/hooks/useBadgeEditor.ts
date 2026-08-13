"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import debounce from "lodash.debounce";
import { getBadge, saveBadgeDocument } from "../api";
import { migrateBadgeDocument, getBadgeShapeDefinition, type BadgeDocument, type BadgeTextObject } from "..";

const AUTOSAVE_DEBOUNCE_MS = 2000;

export type BadgeSaveState = "idle" | "saving" | "saved" | "error";

/**
 * Owns a badge design's full editing state — load, autosave, selection, and object
 * mutations — independent of where any given piece of UI for it renders. The Badge
 * Editor's toolbar/canvas live in the main workspace while its Design/Properties/Layers
 * panels render inside the shared Studio right sidebar (see EditorRightSidebar); both
 * need the same live state, so it's centralized here rather than owned by whichever
 * component happens to mount first — the same reason Lesson editing state lives in
 * SharedContentEditorOrchestrator rather than inside ArcadeEditor.
 *
 * badgeId may be null (no badge currently open) so this can be called unconditionally
 * from the orchestrator regardless of which editor is active.
 */
export type BadgeEditorPanel = "design" | "properties" | "layers";

export function useBadgeEditor(badgeId: string | null, readOnly?: boolean) {
  const [doc, setDoc] = useState<BadgeDocument | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<BadgeSaveState>("idle");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<BadgeEditorPanel>("design");
  const [previewMode, setPreviewMode] = useState(false);
  const lastSavedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!badgeId) {
      setDoc(null);
      setLoadError(null);
      setSelectedId(null);
      return;
    }
    let cancelled = false;
    setDoc(null);
    setLoadError(null);
    setSelectedId(null);
    setPreviewMode(false);
    getBadge(badgeId)
      .then((res) => {
        if (cancelled) return;
        const parsed = migrateBadgeDocument(JSON.parse(res.document));
        lastSavedRef.current = JSON.stringify(parsed);
        setDoc(parsed);
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
    debounce(async (id: string, document: BadgeDocument) => {
      const serialized = JSON.stringify(document);
      if (serialized === lastSavedRef.current) return;
      setSaveState("saving");
      try {
        await saveBadgeDocument(id, document);
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
    (next: BadgeDocument) => {
      setDoc(next);
      if (!readOnly && badgeId) debouncedSave(badgeId, next);
    },
    [badgeId, readOnly, debouncedSave]
  );

  const handleSelect = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id) {
      setActivePanel("properties");
    } else {
      setActivePanel((prev) => (prev === "layers" ? "layers" : "design"));
    }
  }, []);

  const addTextObject = useCallback(() => {
    if (!doc || readOnly) return;
    const id = `obj-${crypto.randomUUID()}`;
    const next: BadgeTextObject = {
      id,
      type: "text",
      x: doc.canvas.width / 2 - 150,
      y: doc.canvas.height / 2 - 20,
      width: 300,
      height: 40,
      rotation: 0,
      opacity: 1,
      visible: true,
      locked: false,
      zIndex: doc.objects.length,
      text: "New Text",
      fontFamily: "Geist",
      fontSize: 32,
      fontWeight: 700,
      color: "#FFFFFF",
      align: "center",
      lineHeight: 1.2,
      letterSpacing: 0,
      wrap: true,
    };
    handleChange({ ...doc, objects: [...doc.objects, next] });
    handleSelect(id);
  }, [doc, readOnly, handleChange, handleSelect]);

  const updateSelected = useCallback(
    (patch: Partial<BadgeTextObject>) => {
      if (!doc || !selectedId) return;
      handleChange({
        ...doc,
        objects: doc.objects.map((o) => (o.id === selectedId ? ({ ...o, ...patch } as BadgeTextObject) : o)),
      });
    },
    [doc, selectedId, handleChange]
  );

  const updateBackground = useCallback(
    (value: string) => {
      if (!doc) return;
      handleChange({ ...doc, background: { type: "solid", value } });
    },
    [doc, handleChange]
  );

  const toggleVisibility = useCallback(
    (id: string) => {
      if (!doc) return;
      handleChange({ ...doc, objects: doc.objects.map((o) => (o.id === id ? { ...o, visible: !o.visible } : o)) });
    },
    [doc, handleChange]
  );

  const deleteObject = useCallback(
    (id: string) => {
      if (!doc) return;
      handleChange({ ...doc, objects: doc.objects.filter((o) => o.id !== id) });
      if (selectedId === id) handleSelect(null);
    },
    [doc, selectedId, handleChange, handleSelect]
  );

  const selectedObject = doc?.objects.find((o) => o.id === selectedId) ?? null;
  const shape = doc ? getBadgeShapeDefinition(doc.shape.type) : null;

  return {
    badgeId,
    doc,
    loadError,
    saveState,
    selectedId,
    selectedObject,
    shape,
    activePanel,
    setActivePanel,
    previewMode,
    setPreviewMode,
    readOnly,
    handleChange,
    handleSelect,
    addTextObject,
    updateSelected,
    updateBackground,
    toggleVisibility,
    deleteObject,
  };
}

export type BadgeEditorState = ReturnType<typeof useBadgeEditor>;
