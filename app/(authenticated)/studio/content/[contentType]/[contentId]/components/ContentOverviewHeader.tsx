"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Pencil,
  Eye,
  MoreVertical,
  Copy,
  Archive,
  Trash2,
  Send,
  ExternalLink,
} from "lucide-react";
import type { ContentTypeSegment } from "../lib/contentTypeRouting";
import { CONTENT_TYPE_LABEL, editorHref, previewHref } from "../lib/contentTypeRouting";
import type { ReviewResponse } from "@/domains/publishing";
import {
  submitForReview,
  supportsReviewSubmission,
  DUPLICATE_ACTION,
  archiveContent,
  deleteContent,
  SUPPORTS_TITLE_CONFIRM_DELETE,
} from "../lib/contentActions";
import { ConfirmActionModal } from "./ConfirmActionModal";

type ActionBtnVariant = "primary" | "secondary";

function ActionButton({
  label,
  icon: Icon,
  href,
  onClick,
  variant = "secondary",
}: {
  label: string;
  icon?: typeof Pencil;
  href?: string;
  onClick?: () => void;
  variant?: ActionBtnVariant;
}) {
  const cls =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-xs active:scale-[0.98]"
      : "border border-slate-200 bg-surface text-ink hover:bg-slate-50 hover:border-slate-300 shadow-2xs active:scale-[0.98]";
  const content = (
    <>
      {Icon && <Icon size={15} />} <span>{label}</span>
    </>
  );
  const className = `inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-extrabold transition-all duration-200 cursor-pointer ${cls}`;
  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

export function ContentOverviewHeader({
  segment,
  contentId,
  title,
  status,
  channelName,
  authorName,
  createdAt,
  updatedAt,
  review,
  channelSuspended,
  onJumpToPublishing,
  tiedExam = false,
  tiedTo,
  onPreview,
  parent,
  leading,
}: {
  segment: ContentTypeSegment;
  contentId: string;
  title: string;
  status: string;
  channelName?: string | null;
  authorName?: string | null;
  createdAt: string;
  updatedAt: string;
  review: ReviewResponse | null;
  channelSuspended?: boolean;
  onJumpToPublishing: () => void;
  /** An exam tied to a course or event: reviewed with its parent, so it offers no submit of its own. */
  tiedExam?: boolean;
  /** What a linked exam belongs to, so its type reads "Course Exam" / "Event Exam". */
  tiedTo?: "course" | "event" | null;
  /** For types whose preview is a tab rather than a route (an exam previews per plan). */
  onPreview?: () => void;
  /** A linked exam's course or event, offered in the overflow menu. */
  parent?: { href: string; label: string } | null;
  /** Left end of the action line, e.g. "Back to Course Dashboard". */
  leading?: React.ReactNode;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"delete" | "archive" | null>(null);
  const [busy, setBusy] = useState(false);

  const statusKey = status?.toUpperCase();
  const reviewStatus = review?.status ?? null;
  const preview = previewHref(segment, contentId);
  // A linked exam belongs to its course or event: copying or deleting it on its own is not a
  // thing a creator should do from here, so the menu offers the way back to the parent instead.
  const duplicate = tiedExam ? null : DUPLICATE_ACTION[segment];
  const canArchive = segment === "event" && statusKey !== "ARCHIVED";
  const canDelete = !tiedExam;

  async function handleDuplicate() {
    if (!duplicate) return;
    setMenuOpen(false);
    setBusy(true);
    try {
      const created = await duplicate.run(contentId);
      toast.success("Duplicated");
      router.push(`/studio/content/${segment}/${created.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not duplicate");
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit() {
    setBusy(true);
    try {
      await submitForReview(segment, contentId);
      toast.success("Submitted for review");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not submit for review");
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirmedAction() {
    if (confirmAction === "delete") {
      // A null request means this type has no delete. It used to be awaited anyway and reported as
      // "Deleted", which is how an exam "deleted" here was still on the dashboard afterwards.
      const request = deleteContent(segment, contentId, title);
      if (!request) {
        toast.error("This content can't be deleted here.");
        setConfirmAction(null);
        return;
      }
      try {
        await request;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Could not delete");
        return;
      }
      toast.success("Deleted");
      setConfirmAction(null);
      router.push("/studio");
      return;
    }
    if (confirmAction === "archive") {
      const result = archiveContent(segment, contentId);
      if (result) await result;
      toast.success("Archived");
      setConfirmAction(null);
      router.refresh();
    }
  }

  const primaryActions: { key: string; label: string; icon: typeof Pencil; onClick?: () => void; href?: string; variant: ActionBtnVariant }[] = [];
  if (preview) primaryActions.push({ key: "preview", label: "Preview", icon: Eye, href: preview, variant: "secondary" });
  else if (onPreview) primaryActions.push({ key: "preview", label: "Preview", icon: Eye, onClick: onPreview, variant: "secondary" });
  // An exam's "content" is its question bank; the editor for it is always the way in.
  const edit = {
    key: "edit",
    label: segment === "exam" ? "Edit Questions" : "Edit Content",
    icon: Pencil,
    href: editorHref(segment, contentId),
    variant: "primary" as const,
  };

  // The content's own status decides "in review" too: the review record can fail to load (a
  // collaborator outside the channel gets 403 on it), and Submit would then show for content the
  // server already holds in review — every press a 422.
  if (reviewStatus === "OPEN" || (statusKey === "SUBMITTED" && reviewStatus !== "CHANGES_REQUESTED")) {
    primaryActions.push({ key: "view-review", label: "View Review", icon: Send, onClick: onJumpToPublishing, variant: "primary" });
  } else if (reviewStatus === "CHANGES_REQUESTED") {
    primaryActions.push({ key: "resolve", label: "Resolve Changes", icon: Send, onClick: onJumpToPublishing, variant: "primary" });
  } else if (statusKey === "ARCHIVED") {
    // Preview only
  } else if (statusKey === "PUBLISHED") {
    primaryActions.push(edit);
    if (segment === "exam" && supportsReviewSubmission(segment, tiedExam)) {
      // Learners keep the published version; edits since then reach them only through review.
      primaryActions.push({ key: "submit", label: "Submit changes for Review", icon: Send, onClick: handleSubmit, variant: "secondary" });
    }
  } else {
    primaryActions.push(edit);
    if (supportsReviewSubmission(segment, tiedExam)) {
      primaryActions.push({ key: "submit", label: "Submit for Review", icon: Send, onClick: handleSubmit, variant: "secondary" });
    }
  }

  const showMenu = (duplicate || canArchive || canDelete || parent) && !channelSuspended;

  return (
    <div className="flex w-full flex-col gap-4 pb-1">
      {/* Back link, when this dashboard was opened from a parent course or event. */}
      {leading && <div className="flex">{leading}</div>}

      <div className="mx-auto flex max-w-4xl flex-col items-center justify-center text-center">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Great+Vibes&family=Satisfy&family=Alex+Brush&display=swap');`}</style>
        <span className="rounded-full bg-slate-100 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {tiedTo === "course" ? "Course Exam" : tiedTo === "event" ? "Event Exam" : CONTENT_TYPE_LABEL[segment] ?? segment}
        </span>

        <h1
          className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 bg-clip-text dark:via-indigo-200 dark:to-blue-300 py-0.5 text-center text-4xl font-bold leading-tight tracking-wide text-transparent sm:text-5xl lg:text-6xl"
          style={{ fontFamily: "'Dancing Script', 'Satisfy', 'Great Vibes', 'Alex Brush', cursive" }}
        >
          {title}
        </h1>

        {/* Preview · Edit · Submit · more — under the name, on every tab. */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-3">
          {channelSuspended ? (
            <span
              className="inline-flex w-fit cursor-not-allowed items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300"
              title="This channel is suspended — editing is disabled until it is reactivated"
            >
              Editing Disabled
            </span>
          ) : (
            primaryActions.map((action) => (
              <ActionButton
                key={action.key}
                label={busy && action.key === "submit" ? "Submitting…" : action.label}
                icon={action.icon}
                href={action.href}
                onClick={action.onClick}
                variant={action.variant}
              />
            ))
          )}

          {showMenu && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="grid size-9 place-items-center rounded-full border border-slate-200 bg-surface text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 cursor-pointer shadow-2xs"
                aria-label="More actions"
                aria-expanded={menuOpen}
              >
                <MoreVertical size={16} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-52 rounded-2xl border border-slate-200 bg-surface p-1.5 shadow-xl">
                    {parent && (
                      <Link
                        href={parent.href}
                        onClick={() => setMenuOpen(false)}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs font-semibold text-slate-800 hover:bg-slate-50"
                      >
                        <ExternalLink size={14} /> <span className="truncate">{parent.label}</span>
                      </Link>
                    )}
                    {duplicate && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          handleDuplicate();
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer text-left"
                      >
                        <Copy size={14} /> Duplicate
                      </button>
                    )}
                    {canArchive && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setConfirmAction("archive");
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer text-left"
                      >
                        <Archive size={14} /> Archive
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setConfirmAction("delete");
                        }}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer text-left dark:text-rose-400 dark:hover:bg-rose-500/10"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {confirmAction === "delete" && (
        <ConfirmActionModal
          title="Delete this content?"
          description={
            SUPPORTS_TITLE_CONFIRM_DELETE[segment]
              ? `Type the title to confirm. This moves "${title}" to Trash.`
              : `This permanently deletes "${title}". This action cannot be undone.`
          }
          confirmLabel="Delete"
          danger
          requireTitleMatch={SUPPORTS_TITLE_CONFIRM_DELETE[segment] ? title : undefined}
          onClose={() => setConfirmAction(null)}
          onConfirm={handleConfirmedAction}
        />
      )}
      {confirmAction === "archive" && (
        <ConfirmActionModal
          title="Archive this content?"
          description={`"${title}" will be archived and no longer visible to learners.`}
          confirmLabel="Archive"
          onClose={() => setConfirmAction(null)}
          onConfirm={handleConfirmedAction}
        />
      )}
    </div>
  );
}
