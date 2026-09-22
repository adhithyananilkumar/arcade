// domains/learning/notes/api/useNoteAutosave.ts
// Debounced autosave for one anchor's note, plus the save-status flag the editor toolbar shows.

'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useContentNotesQuery, useUpsertNoteMutation } from './notes.queries';
import type { NoteContentType } from './notes.service';

export type NoteSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const AUTOSAVE_DELAY_MS = 900;

export interface NoteAutosaveAnchor {
  /** Lesson/session id, or null for the note on the content as a whole. */
  id: string | null;
  label?: string | null;
  order?: number | null;
}

/**
 * Binds an editor to the note for one anchor.
 *
 * <p>Replaces the old `localStorage` autosave in the player. The rules that matter:
 *
 * <ul>
 *   <li>The editor is uncontrolled after mount — Tiptap owns its own document — so `initialBody`
 *       is only meaningful at mount time. Callers remount on `editorKey` when the anchor changes,
 *       which is what stops one lesson's note bleeding into the next.
 *   <li>A pending save is flushed when the anchor changes or the component unmounts. Without that,
 *       clicking to the next lesson within the debounce window silently drops the last thing typed.
 *   <li>The body being saved lives in a ref, not state, so the debounce never re-renders the
 *       editor mid-keystroke.
 * </ul>
 */
export function useNoteAutosave(
  contentType: NoteContentType,
  contentId: string | undefined,
  anchor: NoteAutosaveAnchor,
) {
  const { data, isLoading } = useContentNotesQuery(contentType, contentId);
  const upsert = useUpsertNoteMutation(contentType, contentId);

  const [status, setStatus] = useState<NoteSaveStatus>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<string | null>(null);

  /**
   * What a flush needs, captured as of the *previous* completed render.
   *
   * <p>This is written in an effect rather than during render — React forbids touching refs while
   * rendering, and doing so here would also be wrong: the flush that runs when the anchor changes
   * has to write the note the learner was just editing, not the one they navigated to. Cleanup
   * functions run before any effect of the new render, so by the time this ref is updated for the
   * new anchor, the old anchor's flush has already happened.
   */
  const flushContextRef = useRef({ anchor, contentId, mutate: upsert.mutate });

  useEffect(() => {
    flushContextRef.current = { anchor, contentId, mutate: upsert.mutate };
  });

  const flush = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const body = pendingRef.current;
    pendingRef.current = null;
    if (body === null) return;

    const { anchor: target, contentId: target_id, mutate } = flushContextRef.current;
    if (!target_id) return;

    mutate(
      {
        anchorId: target.id,
        anchorLabel: target.label ?? null,
        anchorOrder: target.order ?? null,
        body,
      },
      { onSuccess: () => setStatus('saved'), onError: () => setStatus('error') },
    );
  }, []);

  const save = useCallback(
    (body: string) => {
      pendingRef.current = body;
      setStatus('saving');
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(flush, AUTOSAVE_DELAY_MS);
    },
    [flush],
  );

  // Anchor identity, not the mutation, is the thing whose change must flush.
  useEffect(() => () => flush(), [anchor.id, contentId, flush]);

  const note = useMemo(
    () => data?.notes.find((candidate) => candidate.anchorId === anchor.id) ?? null,
    [data, anchor.id],
  );

  return {
    /** Tiptap JSON for this anchor, or '' when nothing is written yet. Read at mount only. */
    initialBody: note?.body ?? '',
    /** Remount key — changes whenever the editor should reload a different note. */
    editorKey: `${contentType}:${contentId ?? 'none'}:${anchor.id ?? 'content'}:${isLoading ? 'loading' : 'ready'}`,
    isLoading,
    saveStatus: status,
    save,
    note,
  };
}
