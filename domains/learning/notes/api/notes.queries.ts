// domains/learning/notes/api/notes.queries.ts
// React Query bindings for learner notes.

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  notesService,
  type LearnerNote,
  type LearnerNoteCollection,
  type NoteContentType,
  type UpsertNoteInput,
} from './notes.service';

export const noteKeys = {
  /** Shared root — a prefix of every key below, so one invalidation refreshes every notes read. */
  all: ['learning', 'notes'] as const,
  forContent: (contentType: NoteContentType, contentId: string) =>
    ['learning', 'notes', contentType, contentId] as const,
};

export function useContentNotesQuery(
  contentType: NoteContentType,
  contentId: string | undefined,
  enabled: boolean = true,
) {
  return useQuery({
    queryKey: noteKeys.forContent(contentType, contentId ?? ''),
    queryFn: () => notesService.list(contentType, contentId!),
    enabled: enabled && Boolean(contentId),
  });
}

/**
 * Autosave-friendly upsert.
 *
 * <p>The cache is patched from the mutation's own result rather than invalidated, because the
 * player autosaves while the learner is still typing: an invalidation would refetch and overwrite
 * the editor's in-flight content with the last saved version, silently discarding whatever was
 * typed during the round trip. A `null` result means the note was cleared, so it is dropped from
 * the collection instead of merged into it.
 */
export function useUpsertNoteMutation(contentType: NoteContentType, contentId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpsertNoteInput) => notesService.upsert(contentType, contentId!, input),
    onSuccess: (saved, input) => {
      queryClient.setQueryData<LearnerNoteCollection>(
        noteKeys.forContent(contentType, contentId ?? ''),
        (current) => mergeNote(current, saved, input.anchorId ?? null),
      );
    },
  });
}

export function useDeleteNoteMutation(contentType: NoteContentType, contentId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (noteId: string) => notesService.remove(contentType, contentId!, noteId),
    onSuccess: (_void, noteId) => {
      queryClient.setQueryData<LearnerNoteCollection>(
        noteKeys.forContent(contentType, contentId ?? ''),
        (current) =>
          current && recount(current.notes.filter((note) => note.id !== noteId)),
      );
    },
  });
}

function mergeNote(
  current: LearnerNoteCollection | undefined,
  saved: LearnerNote | null,
  anchorId: string | null,
): LearnerNoteCollection | undefined {
  if (!current) return current;

  const withoutAnchor = current.notes.filter((note) => note.anchorId !== anchorId);
  return recount(saved ? [...withoutAnchor, saved] : withoutAnchor);
}

/**
 * Re-derives the rollup the overview hub shows above the preview. Kept here rather than trusting
 * the previous counts so a cache patch can never leave "3 notes" above a list of two.
 */
function recount(notes: LearnerNote[]): LearnerNoteCollection {
  const ordered = [...notes].sort((a, b) => {
    const order = (a.anchorOrder ?? -1) - (b.anchorOrder ?? -1);
    return order !== 0 ? order : b.updatedAt.localeCompare(a.updatedAt);
  });

  return {
    notes: ordered,
    noteCount: ordered.length,
    totalWordCount: ordered.reduce((sum, note) => sum + note.wordCount, 0),
    lastUpdatedAt:
      ordered.reduce<string | null>(
        (latest, note) => (!latest || note.updatedAt > latest ? note.updatedAt : latest),
        null,
      ),
  };
}
