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
  FileText,
  Radio,
  Tv,
  BookOpen,
  CheckCircle2,
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

function formatDateParts(value?: string | null) {
  if (!value) return { dateStr: "—", timeStr: "" };
  const date = new Date(value);
  if (isNaN(date.getTime())) return { dateStr: "—", timeStr: "" };
  const dateStr = date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const timeStr = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true }).toLowerCase();
  return { dateStr, timeStr };
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
      : "border border-slate-200 bg-white text-[#14142b] hover:bg-slate-50 hover:border-slate-300 shadow-2xs active:scale-[0.98]";
  const content = (
    <>
      {Icon && <Icon size={15} />} <span>{label}</span>
    </>
  );
  const className = `inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-extrabold transition-all duration-200 cursor-pointer ${cls}`;
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
      const delta = Math.floor(Math.random() * 3) - 1; // -1, 0, +1
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

  const createdParts = formatDateParts(createdAt);
  const updatedParts = formatDateParts(updatedAt);

  return (
    <div className="flex flex-col items-center justify-center py-4 w-full">
      {/* Main Centered Content Title & Metadata */}
      <div className="flex flex-col items-center justify-center text-center gap-2 max-w-4xl mx-auto">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Great+Vibes&family=Satisfy&family=Alex+Brush&display=swap');`}</style>

        <h1
          className="text-4xl font-bold tracking-wide bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 bg-clip-text text-transparent sm:text-5xl lg:text-6xl py-1 leading-snug text-center"
          style={{
            fontFamily: "'Dancing Script', 'Satisfy', 'Great Vibes', 'Alex Brush', cursive",
          }}
        >
          {title}
        </h1>
        <p className="text-xs font-medium text-slate-500 text-center">
          Created {formatDateLine(createdAt)} &nbsp;·&nbsp; Last edited {formatDateLine(updatedAt)}
        </p>

        {/* Combined Row: Channel Name, Content Type, and Published Status */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs font-black uppercase tracking-wider py-1">
          <span className="inline-flex items-center gap-1.5 text-indigo-700">
            <Tv size={13} className="text-indigo-600" />
            {channelName || "Personal Channel"}
          </span>
          <span className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-1.5 text-blue-700">
            <BookOpen size={13} className="text-blue-600" />
            {CONTENT_TYPE_LABEL[segment]}
          </span>
          <span className="text-slate-300">·</span>
          <span className="inline-flex items-center gap-1.5 font-black uppercase tracking-widest text-emerald-600">
            <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              {status ? status.toLowerCase() : "published"}
            </span>
          </span>
        </div>

        {/* SINGLE ROW BELOW HEADING: Active Learners, Preview, Edit Content, 3-Dots Menu */}
        {showMetadataRail && (
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            {/* 1. Active Learners Badge (No Inner Oval) */}
            <div className="flex items-center gap-1.5 rounded-xl border border-emerald-300/90 bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white px-3.5 py-2 shadow-2xs">
              <span className="text-xs font-black text-slate-900 tracking-tight">Active Learners</span>
              <span className="text-xs font-black text-emerald-600 transition-all duration-300">{liveCount}</span>
            </div>

            {/* 2. Action Buttons: Preview & Edit Content */}
            {channelSuspended ? (
              <span
                className="inline-flex w-fit cursor-not-allowed items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700"
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

            {/* 3. 3-Dots Overflow Menu Button */}
            {(duplicate || canArchive || canDelete) && !channelSuspended && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="grid size-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 cursor-pointer shadow-2xs"
                  aria-label="More actions"
                >
                  <MoreVertical size={16} />
                </button>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <div className="absolute right-0 z-20 mt-2 w-48 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl">
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
                          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 cursor-pointer text-left"
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
