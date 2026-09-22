// domains/learning/notes/api/notes.service.ts
// Learner notes — the door into /api/v1/learning/content/{contentType}/{contentId}/notes.
//
// Content-type agnostic on purpose: the same service serves a course's lesson notes and an
// event's session notes, because the overview hub that reads them is one component with two
// adapters, not two pages.

import { api } from '@/infrastructure/http/api';

/** URL segment the backend maps onto an enrollment ResourceType. */
export type NoteContentType = 'courses' | 'events';

export interface LearnerNote {
  id: string;
  /** The lesson/session this note hangs off, or null for a note on the content as a whole. */
  anchorId: string | null;
  /** What the anchor was called when the note was last saved. Display copy, never authority. */
  anchorLabel: string | null;
  /** Position of the anchor within the content, used to order notes like the syllabus. */
  anchorOrder: number | null;
  /** Tiptap JSON — what the editor reloads. */
  body: string;
  /** Server-derived plain text, already truncated for preview cards. */
  excerpt: string;
  wordCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface LearnerNoteCollection {
  notes: LearnerNote[];
  noteCount: number;
  totalWordCount: number;
  lastUpdatedAt: string | null;
}

export interface UpsertNoteInput {
  anchorId?: string | null;
  anchorLabel?: string | null;
  anchorOrder?: number | null;
  body: string;
}

const base = (contentType: NoteContentType, contentId: string) =>
  `/api/v1/learning/content/${contentType}/${contentId}/notes`;

export const notesService = {
  list: (contentType: NoteContentType, contentId: string) =>
    api.get<LearnerNoteCollection>(base(contentType, contentId)),

  /**
   * Upsert by anchor. Resolves to `null` when the body was cleared — the backend deletes the note
   * rather than storing a blank one, and answers 204.
   */
  upsert: (contentType: NoteContentType, contentId: string, input: UpsertNoteInput) =>
    api.put<LearnerNote | null>(base(contentType, contentId), input),

  remove: (contentType: NoteContentType, contentId: string, noteId: string) =>
    api.delete<void>(`${base(contentType, contentId)}/${noteId}`),
};
