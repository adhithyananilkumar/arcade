'use client';

import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/design-system/ui/sheet';
import { TiptapContentView, type LearnerNote } from '@/domains/learning';

interface NotePreviewSheetProps {
  /** Null closes the sheet. */
  note: LearnerNote | null;
  /** Where the lesson/session this note came from lives, when it still exists. */
  itemHref: string | null;
  onClose: () => void;
}

/**
 * Reads one note in full, without leaving the overview.
 *
 * <p>Rendered through `TiptapContentView` rather than by mounting the editor read-only: the viewer
 * consumes the same structured JSON the player already renders lessons from, so previewing a note
 * costs no Tiptap bundle at all. That is what makes it cheap enough to offer from a rail the
 * learner may never click.
 */
export function NotePreviewSheet({ note, itemHref, onClose }: NotePreviewSheetProps) {
  return (
    <Sheet open={note !== null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full gap-0 sm:max-w-lg">
        {note && (
          <>
            <SheetHeader className="border-b border-slate-200 dark:border-slate-800">
              <SheetTitle className="text-base">
                {note.anchorLabel ?? 'Notes on this content'}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-1.5 text-xs">
                <Clock size={12} />
                Last edited {formatWhen(note.updatedAt)} · {note.wordCount}{' '}
                {note.wordCount === 1 ? 'word' : 'words'}
              </SheetDescription>
            </SheetHeader>

            <div className="arcade-rich-text flex-1 overflow-y-auto px-5 py-4 text-[14px] leading-relaxed">
              <TiptapContentView body={note.body} emptyMessage="This note is empty." />
            </div>

            {itemHref && (
              <div className="border-t border-slate-200 p-4 dark:border-slate-800">
                <Link
                  href={itemHref}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  Open {note.anchorLabel ?? 'the lesson'}
                  <ArrowRight size={15} />
                </Link>
              </div>
            )}
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
