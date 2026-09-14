"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import debounce from "lodash.debounce";
import { getBadge, saveBadgeDocument } from "../api";
import {
  migrateBadgeDocument,
  getBadgeShapeDefinition,
  DEFAULT_BADGE_BORDER,
  type BadgeDocument,
  type BadgeObject,
  type BadgeBackground,
  type BadgeBorderConfig,
  type BadgeTextObject,
  type BadgeShapeObject,
  type BadgeShapeKind,
  type BadgeImageObject,
  type BadgeIconObject,
} from "..";

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

let objectCounter = 0;
function nextObjectId(): string {
  objectCounter += 1;
  return `obj-${Date.now().toString(36)}-${objectCounter}`;
}

const OBJECT_BASE_DEFAULTS = {
  rotation: 0,
  opacity: 1,
  visible: true,
  locked: false,
};

export function useBadgeEditor(badgeId: string | null, readOnly?: boolean) {
  const [doc, setDoc] = useState<BadgeDocument | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<BadgeSaveState>("idle");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activePanel, setActivePanel] = useState<BadgeEditorPanel>("design");
  const [openDesignSections, setOpenDesignSections] = useState<Record<string, boolean>>({
    background: false,
    frame: false,
  });
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

  const addObject = useCallback(
    (object: BadgeObject) => {
      if (!doc || readOnly) return;
      handleChange({ ...doc, objects: [...doc.objects, object] });
      handleSelect(object.id);
    },
    [doc, readOnly, handleChange, handleSelect]
  );

  const addTextObject = useCallback(() => {
    if (!doc) return;
    const next: BadgeTextObject = {
      ...OBJECT_BASE_DEFAULTS,
      id: nextObjectId(),
      type: "text",
      x: doc.canvas.width / 2 - 150,
      y: doc.canvas.height / 2 - 20,
      width: 300,
      height: 40,
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
    addObject(next);
  }, [doc, addObject]);

  const addShapeObject = useCallback(
    (kind: BadgeShapeKind) => {
      if (!doc) return;
      const size = 160;
      const next: BadgeShapeObject = {
        ...OBJECT_BASE_DEFAULTS,
        id: nextObjectId(),
        type: "shape",
        shape: kind,
        x: doc.canvas.width / 2 - size / 2,
        y: doc.canvas.height / 2 - size / 2,
        width: size,
        height: kind === "line" ? 4 : size,
        zIndex: doc.objects.length,
        fill: kind === "line" ? undefined : "#FFFFFF",
        stroke: kind === "line" ? "#FFFFFF" : undefined,
        strokeWidth: kind === "line" ? 4 : 0,
      };
      addObject(next);
    },
    [doc, addObject]
  );

  const addIconObject = useCallback(
    (iconId: string) => {
      if (!doc) return;
      const size = 96;
      const next: BadgeIconObject = {
        ...OBJECT_BASE_DEFAULTS,
        id: nextObjectId(),
        type: "icon",
        iconId,
        x: doc.canvas.width / 2 - size / 2,
        y: doc.canvas.height / 2 - size / 2,
        width: size,
        height: size,
        zIndex: doc.objects.length,
        color: "#FFFFFF",
        strokeWidth: 2,
      };
      addObject(next);
    },
    [doc, addObject]
  );

  const addImageObject = useCallback(
    (src: string) => {
      if (!doc) return;
      const size = 240;
      const next: BadgeImageObject = {
        ...OBJECT_BASE_DEFAULTS,
        id: nextObjectId(),
        type: "image",
        src,
        fit: "cover",
        x: doc.canvas.width / 2 - size / 2,
        y: doc.canvas.height / 2 - size / 2,
        width: size,
        height: size,
        zIndex: doc.objects.length,
      };
      addObject(next);
    },
    [doc, addObject]
  );

  const updateObject = useCallback(
    (id: string, patch: Record<string, unknown>) => {
      if (!doc) return;
      handleChange({
        ...doc,
        objects: doc.objects.map((o) => (o.id === id ? ({ ...o, ...patch } as BadgeObject) : o)),
      });
    },
    [doc, handleChange]
  );

  const updateSelected = useCallback(
    (patch: Record<string, unknown>) => {
      if (!selectedId) return;
      updateObject(selectedId, patch);
    },
    [selectedId, updateObject]
  );

  const updateBackground = useCallback(
    (background: BadgeBackground) => {
      if (!doc) return;
      handleChange({ ...doc, background });
    },
    [doc, handleChange]
  );

  const updateBorder = useCallback(
    (patch: Partial<BadgeBorderConfig>) => {
      if (!doc) return;
      handleChange({ ...doc, border: { ...(doc.border ?? DEFAULT_BADGE_BORDER), ...patch } });
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

  const reorderObjects = useCallback(
    (oldIndex: number, newIndex: number) => {
      if (!doc || readOnly) return;
      // Visual order is highest zIndex first (top-to-bottom list)
      const visualObjects = [...doc.objects].sort((a, b) => b.zIndex - a.zIndex);
      
      const item = visualObjects.splice(oldIndex, 1)[0];
      visualObjects.splice(newIndex, 0, item);
      
      // Re-assign z-indexes based on the new visual order
      // visualObjects[0] is at the top of the list, so it gets the highest zIndex
      const reordered = visualObjects.map((obj, i) => ({
        ...obj,
        zIndex: visualObjects.length - 1 - i,
      }));
      
      handleChange({ ...doc, objects: reordered });
    },
    [doc, readOnly, handleChange]
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
    openDesignSections,
    setOpenDesignSections,
    previewMode,
    setPreviewMode,
    readOnly,
    handleChange,
    handleSelect,
    addTextObject,
    addShapeObject,
    addIconObject,
    addImageObject,
    updateSelected,
    updateObject,
    updateBackground,
    updateBorder,
    toggleVisibility,
    deleteObject,
    reorderObjects,
  };
}

export type BadgeEditorState = ReturnType<typeof useBadgeEditor>;
