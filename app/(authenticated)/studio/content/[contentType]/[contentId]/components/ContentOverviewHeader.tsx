"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Eye, MoreVertical, Copy, Archive, Trash2, Send } from "lucide-react";
import type { ContentTypeSegment } from "../lib/contentTypeRouting";
import { CONTENT_TYPE_LABEL, editorHref, previewHref } from "../lib/contentTypeRouting";
import type { ReviewResponse } from "@/domains/publishing/api/platformReview";
import {
  submitForReview,
  DUPLICATE_ACTION,
  archiveContent,
  deleteContent,
  SUPPORTS_TITLE_CONFIRM_DELETE,
} from "../lib/contentActions";
import { ConfirmActionModal } from "./ConfirmActionModal";

const STATUS_STYLE: Record<string, string> = {
  DRAFT: "bg-amber-50 text-amber-700 border-amber-200",
  SUBMITTED: "bg-orange-50 text-orange-700 border-orange-200",
  PUBLISHED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ARCHIVED: "bg-slate-100 text-slate-500 border-slate-200",
};

function StatusPill({ status }: { status: string }) {
  const key = status?.toUpperCase() ?? "";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
        STATUS_STYLE[key] ?? "bg-slate-100 text-slate-500 border-slate-200"
      }`}
    >
      {key || "UNKNOWN"}
    </span>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

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
      ? "bg-[#14142b] text-white hover:bg-[#232735]"
      : "border border-slate-200 bg-white text-[#14142b] hover:bg-slate-50";
  const content = (
    <>
      {Icon && <Icon size={14} />} {label}
    </>
  );
  const className = `inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${cls}`;
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
  coverImageUrl,
  channelName,
  authorName,
  createdAt,
  updatedAt,
  review,
  channelSuspended,
  onJumpToPublishing,
}: {
  segment: ContentTypeSegment;
  contentId: string;
  title: string;
  status: string;
  coverImageUrl?: string | null;
  channelName?: string | null;
  authorName?: string | null;
  createdAt: string;
  updatedAt: string;
  review: ReviewResponse | null;
  channelSuspended?: boolean;
  onJumpToPublishing: () => void;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"delete" | "archive" | null>(null);
  const [busy, setBusy] = useState(false);

  const statusKey = status?.toUpperCase();
  const reviewStatus = review?.status ?? null;
  const preview = previewHref(segment, contentId);
  const duplicate = DUPLICATE_ACTION[segment];
  const canArchive = segment === "event" && statusKey !== "ARCHIVED";
  const canDelete = true; // course/roadmap/event all have a real delete or soft-delete endpoint

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
      await deleteContent(segment, contentId, title);
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

  // Contextual primary actions — driven by review state first, then content status.
  const primaryActions: { key: string; label: string; icon: typeof Pencil; onClick?: () => void; href?: string; variant: ActionBtnVariant }[] = [];
  if (preview) primaryActions.push({ key: "preview", label: "Preview", icon: Eye, href: preview, variant: "secondary" });

  if (reviewStatus === "OPEN") {
    primaryActions.push({ key: "view-review", label: "View Review", icon: Send, onClick: onJumpToPublishing, variant: "primary" });
  } else if (reviewStatus === "CHANGES_REQUESTED") {
    primaryActions.push({ key: "resolve", label: "Resolve Changes", icon: Send, onClick: onJumpToPublishing, variant: "primary" });
  } else if (statusKey === "ARCHIVED") {
    // Preview only, nothing else — no restore endpoint exists for archived content.
  } else if (statusKey === "PUBLISHED") {
    primaryActions.push({ key: "edit", label: "Edit Content", icon: Pencil, href: editorHref(segment, contentId), variant: "primary" });
  } else {
    primaryActions.push({ key: "edit", label: "Edit Content", icon: Pencil, href: editorHref(segment, contentId), variant: "primary" });
    primaryActions.push({ key: "submit", label: "Submit for Review", icon: Send, onClick: handleSubmit, variant: "secondary" });
  }

  // channelName frequently equals authorName for a personal channel — dedupe so the
  // subtitle doesn't visibly repeat the same person twice.
  const subtitleParts = [CONTENT_TYPE_LABEL[segment], channelName, channelName !== authorName ? authorName : null].filter(
    Boolean
  );

  return (
    <div className="flex flex-col gap-4">


      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-4">
          {coverImageUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- arbitrary uploaded/CDN URLs, no fixed remotePatterns to lean on next/image for
            <img
              src={coverImageUrl}
              alt=""
              className="hidden h-16 w-16 shrink-0 rounded-xl border border-slate-200/80 bg-slate-50 object-cover sm:block"
            />
          )}
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-[#14142b] sm:text-2xl">{title}</h1>
              <StatusPill status={status} />
            </div>
            <p className="text-xs font-medium text-slate-500">{subtitleParts.join(" · ")}</p>
            <p className="text-[11px] text-slate-400">
              Created {formatDate(createdAt)} · Last edited {formatDate(updatedAt)}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {channelSuspended ? (
            <span
              className="inline-flex w-fit cursor-not-allowed items-center gap-2 rounded-lg bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-400"
              title="This channel is suspended — editing is disabled until it's reactivated"
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

          {(duplicate || canArchive || canDelete) && !channelSuspended && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50"
                aria-label="More actions"
              >
                <MoreVertical size={16} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 z-20 mt-1 w-44 rounded-lg border border-slate-100 bg-white py-1 shadow-lg">
                    {duplicate && (
                      <button
                        onClick={handleDuplicate}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
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
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
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
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50"
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
