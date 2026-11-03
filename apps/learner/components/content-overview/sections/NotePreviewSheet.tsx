'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, Loader2, NotebookPen, PenLine } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/design-system/ui/sheet';
import {
  NotesEditor,
  TiptapContentView,
  useUpsertNoteMutation,
  type LearnerNote,
  type NoteContentType,
} from '@/domains/learning';

interface NotePreviewSheetProps {
  /** Null closes the sheet. */
  note: LearnerNote | null;
  contentType: NoteContentType;
  contentId: string;
  /** Where the lesson/session this note came from lives, when it still exists. */
  itemHref: string | null;
  onClose: () => void;
}

/**
 * Reads one note in full, and edits it in place, without leaving the overview.
 *
 * <p>Reading goes through `TiptapContentView` rather than mounting the editor read-only: the viewer
 * consumes the same structured JSON the player renders lessons from, so previewing costs no Tiptap
 * bundle. The editor is only mounted once the learner presses Edit. Saving is the same
 * upsert-by-anchor the player autosaves with, so an edit here and one in the player can never fork
 * into two notes.
 */
export function NotePreviewSheet({ note, contentType, contentId, itemHref, onClose }: NotePreviewSheetProps) {
  const upsert = useUpsertNoteMutation(contentType, contentId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  // The note shown after a save: the prop is a snapshot taken when the sheet opened.
  const [saved, setSaved] = useState<LearnerNote | null>(null);

  const noteId = note?.id ?? null;
  useEffect(() => {
    setEditing(false);
    setDraft(null);
    setSaved(null);
  }, [noteId]);

  const current = saved ?? note;

  const save = () => {
    if (!note || draft === null) {
      setEditing(false);
      return;
    }
    upsert.mutate(
      {
        anchorId: note.anchorId,
        anchorLabel: note.anchorLabel,
        anchorOrder: note.anchorOrder,
        body: draft,
      },
      {
        onSuccess: (result) => {
          // `null` means the learner cleared the note, which deletes it.
          if (result === null) {
            onClose();
            return;
          }
          setSaved(result);
          setEditing(false);
          setDraft(null);
        },
      },
    );
  };

  return (
    <Sheet open={note !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-xl">
        {current && (
          <>
            <SheetHeader className="border-b border-slate-200 pr-14">
              <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">
                <NotebookPen size={12} />
                {editing ? 'Editing note' : 'Your note'}
              </p>
              <SheetTitle className="text-lg font-bold tracking-tight text-ink">
                {current.anchorLabel ?? 'Notes on this content'}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-1.5 text-xs">
                <Clock size={12} />
                Last edited {formatWhen(current.updatedAt)} · {current.wordCount}{' '}
                {current.wordCount === 1 ? 'word' : 'words'}
              </SheetDescription>
            </SheetHeader>

            {editing ? (
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <NotesEditor
                  content={current.body}
                  onChange={setDraft}
                  placeholder="Write your note…"
                />
              </div>
            ) : (
              <div className="arcade-rich-text flex-1 overflow-y-auto px-5 py-4 text-[14px] leading-relaxed">
                <TiptapContentView body={current.body} emptyMessage="This note is empty." />
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 p-4">
              {editing ? (
                <>
                  {upsert.isError && (
                    <span className="mr-auto text-xs font-medium text-rose-600 dark:text-rose-400">
                      Could not save. Try again.
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setDraft(null);
                    }}
                    disabled={upsert.isPending}
                    className="rounded-full border border-slate-200 bg-surface px-4 py-2 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={save}
                    disabled={upsert.isPending}
                    className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2 text-[13px] font-semibold text-on-ink transition hover:bg-ink-hover disabled:opacity-60"
                  >
                    {upsert.isPending && <Loader2 size={14} className="animate-spin" />}
                    Save changes
                  </button>
                </>
              ) : (
                <>
                  {itemHref && (
                    <Link
                      href={itemHref}
                      className="mr-auto inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-600 transition hover:text-ink"
                    >
                      Open {current.anchorLabel ?? 'the lesson'}
                      <ArrowRight size={14} />
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2 text-[13px] font-semibold text-on-ink transition hover:bg-ink-hover"
                  >
                    <PenLine size={14} />
                    Edit note
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

/**
 * Relative for the first week, absolute after — past that, "23 days ago" is harder to place than
 * the date itself.
 */
function formatWhen(iso: string): string {
  const then = new Date(iso);
  const days = Math.floor((Date.now() - then.getTime()) / 86_400_000);

  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return then.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}
