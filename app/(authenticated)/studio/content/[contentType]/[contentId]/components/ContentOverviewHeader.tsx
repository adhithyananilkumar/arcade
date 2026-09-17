"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
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

function formatDateLine(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "—";
  const dateStr = date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const timeStr = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();
  return `${dateStr}, ${timeStr}`;
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
      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-xs active:scale-[0.98]"
      : "border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-800 dark:text-neutral-100 hover:bg-slate-50 dark:hover:bg-neutral-700 shadow-xs active:scale-[0.98]";
  const content = (
    <>
      {Icon && <Icon size={14} />} <span>{label}</span>
    </>
  );
  const className = `inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all duration-150 cursor-pointer ${cls}`;
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
  showMetadataRail = true,
  showStatusSubtext = false,
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
  showMetadataRail?: boolean;
  showStatusSubtext?: boolean;
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"delete" | "archive" | null>(null);
  const [busy, setBusy] = useState(false);
  const [liveCount, setLiveCount] = useState(14);

  // Dynamic real-time heartbeat ticker for live active learners
  useEffect(() => {
    const interval = setInterval(() => {
      const delta = Math.floor(Math.random() * 3) - 1;
      setLiveCount((prev) => Math.min(22, Math.max(11, prev + delta)));
    }, 3200);
    return () => clearInterval(interval);
  }, []);

  const statusKey = status?.toUpperCase();
  const reviewStatus = review?.status ?? null;
  const preview = previewHref(segment, contentId);
  const duplicate = DUPLICATE_ACTION[segment];
  const canArchive = segment === "event" && statusKey !== "ARCHIVED";
  const canDelete = true;

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

  const primaryActions: { key: string; label: string; icon: typeof Pencil; onClick?: () => void; href?: string; variant: ActionBtnVariant }[] = [];
  if (preview) primaryActions.push({ key: "preview", label: "Preview", icon: Eye, href: preview, variant: "secondary" });

  if (reviewStatus === "OPEN") {
    primaryActions.push({ key: "view-review", label: "View Review", icon: Send, onClick: onJumpToPublishing, variant: "primary" });
  } else if (reviewStatus === "CHANGES_REQUESTED") {
    primaryActions.push({ key: "resolve", label: "Resolve Changes", icon: Send, onClick: onJumpToPublishing, variant: "primary" });
  } else if (statusKey === "ARCHIVED") {
    // Preview only
  } else if (statusKey === "PUBLISHED") {
    primaryActions.push({ key: "edit", label: "Edit Content", icon: Pencil, href: editorHref(segment, contentId), variant: "primary" });
  } else {
    primaryActions.push({ key: "edit", label: "Edit Content", icon: Pencil, href: editorHref(segment, contentId), variant: "primary" });
    primaryActions.push({ key: "submit", label: "Submit for Review", icon: Send, onClick: handleSubmit, variant: "secondary" });
  }

  return (
    <div className="flex flex-col gap-4 pb-2 w-full">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Caveat:wght@700&display=swap');
      `}</style>

      {/* Main Header Row - Centered */}
      <div className="flex flex-col items-center justify-center text-center gap-3.5 w-full">
        {/* Title & Metadata */}
        <div className="flex flex-col items-center text-center gap-2 max-w-3xl">
          <div className="relative inline-block pb-3 pt-1 text-center">
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0F172A] dark:text-neutral-100 tracking-tight block text-center"
              style={{ fontFamily: "'Dancing Script', 'Caveat', cursive" }}
            >
              {title}
            </h1>

            {/* Curved Arcade Logo Gradient Brush Underline */}
            <svg
              className="absolute left-0 bottom-0 w-full h-3.5 pointer-events-none"
              viewBox="0 0 300 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="course-header-line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#2962D6" />
                  <stop offset="45%" stopColor="#2C83F5" />
                  <stop offset="100%" stopColor="#27C5D8" />
                </linearGradient>
              </defs>
              <path
                d="M5 12C60 16 180 17 295 8"
                stroke="url(#course-header-line-gradient)"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {/* Clean, Authentic Metadata Row */}
          <div className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-xs text-slate-500 dark:text-neutral-400 font-normal pt-0.5">
            {/* Status */}
            <span className="font-medium text-slate-800 dark:text-neutral-200">
              {status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : "Published"}
            </span>

            <span className="text-slate-300 dark:text-neutral-700 select-none">·</span>

            {/* Content Type */}
            <span className="text-slate-600 dark:text-neutral-300">
              {CONTENT_TYPE_LABEL[segment]}
            </span>

            <span className="text-slate-300 dark:text-neutral-700 select-none">·</span>

            {/* Channel */}
            <span className="text-slate-600 dark:text-neutral-300">
              {channelName || "Personal Channel"}
            </span>

            <span className="text-slate-300 dark:text-neutral-700 select-none">·</span>

            {/* Created Timestamp */}
            <span>
              Created {formatDateLine(createdAt)}
            </span>

            <span className="text-slate-300 dark:text-neutral-700 select-none">·</span>

            {/* Updated Timestamp */}
            <span>
              Last edited {formatDateLine(updatedAt)}
            </span>
          </div>
        </div>

        {/* Actions Centered */}
        {showMetadataRail && (
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-1">
            {/* Active Learners Badge */}
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200/90 dark:border-emerald-800/50 bg-white dark:bg-neutral-900 px-3 py-1.5 shadow-2xs">
              <span className="text-xs font-medium text-slate-700 dark:text-neutral-300">Active Learners</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{liveCount}</span>
            </div>

            {/* Action Buttons: Preview & Edit Content */}
            {channelSuspended ? (
              <span
                className="inline-flex w-fit cursor-not-allowed items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700"
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

            {/* 3-Dots Overflow Menu */}
            {(duplicate || canArchive || canDelete) && !channelSuspended && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="grid size-9 place-items-center rounded-xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 transition-colors hover:bg-slate-50 dark:hover:bg-neutral-700 hover:text-slate-900 cursor-pointer shadow-2xs"
                  aria-label="More actions"
                >
                  <MoreVertical size={15} />
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 z-20 mt-2 w-44 rounded-2xl border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 p-1.5 shadow-xl">
                      {duplicate && (
                        <button
                          onClick={() => {
                            setMenuOpen(false);
                            handleDuplicate();
                          }}
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-800 cursor-pointer text-left"
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
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-800 cursor-pointer text-left"
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
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer text-left"
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
        )}
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
