"use client";

import React, { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Alex_Brush } from "next/font/google";
import { toast } from "sonner";
import {
  useNotifications,
  getNotificationTargetUrl,
  getVisualType,
  parseMetadata,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type NotificationCategory,
  type NotificationDto,
  type VisualType,
} from "@/domains/notifications";
import {
  Bell,
  User,
  Trash2,
  ChevronDown,
  ArrowRight,
  Eye,
  Check,
  CheckCircle2,
  GitBranch,
  CheckSquare,
  MessageSquare,
  Users,
  Inbox,
  Loader2,
  Search,
  X,
  Layers,
} from "lucide-react";

const alexBrush = Alex_Brush({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// ─── Per-bucket visual styling ──────────────────────────────────────────────
// Purely presentational — which of six looks a real notification's `type` gets skinned with.
// See domains/notifications/lib/visualType.ts for how `type` maps to a bucket. Note this is a
// different axis from `category`, which drives the filter chips and comes from the backend.

const TYPE_STYLES: Record<
  VisualType,
  {
    iconBg: string;
    cardHoverEffect: string;
    cardBg: string;
    cardUnreadBg: string;
    leftBar: string;
    btnGradient: string;
    detailsBg: string;
    badgeBg: string;
    badgeText: string;
    borderColor: string;
  }
> = {
  review: {
    iconBg: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30",
    cardHoverEffect: "hover:shadow-lg hover:shadow-purple-100/40 hover:border-purple-300 dark:hover:border-purple-800",
    cardBg: "bg-gradient-to-br from-white to-purple-50/30 dark:from-neutral-900 dark:to-purple-950/10",
    cardUnreadBg: "bg-gradient-to-br from-purple-50/20 to-purple-100/10 dark:from-purple-950/20 dark:to-purple-900/10",
    leftBar: "bg-gradient-to-b from-purple-500 to-fuchsia-600",
    btnGradient: "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white shadow-purple-200/50 dark:shadow-none",
    detailsBg: "bg-purple-50/40 dark:bg-purple-950/30 border border-purple-100/50 dark:border-purple-900/20",
    badgeBg: "bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300",
    badgeText: "REVIEW",
    borderColor: "border-purple-100 dark:border-purple-900/30",
  },
  grade: {
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
    cardHoverEffect: "hover:shadow-lg hover:shadow-emerald-100/40 hover:border-emerald-300 dark:hover:border-emerald-800",
    cardBg: "bg-gradient-to-br from-white to-emerald-50/30 dark:from-neutral-900 dark:to-emerald-950/10",
    cardUnreadBg: "bg-gradient-to-br from-emerald-50/20 to-emerald-100/10 dark:from-emerald-950/20 dark:to-emerald-900/10",
    leftBar: "bg-gradient-to-b from-emerald-500 to-teal-600",
    btnGradient: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-200/50 dark:shadow-none",
    detailsBg: "bg-emerald-50/40 dark:bg-emerald-950/30 border border-emerald-100/50 dark:border-emerald-900/20",
    badgeBg: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300",
    badgeText: "GRADE",
    borderColor: "border-emerald-100 dark:border-emerald-900/30",
  },
  comment: {
    iconBg: "bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900/30",
    cardHoverEffect: "hover:shadow-lg hover:shadow-sky-100/40 hover:border-sky-300 dark:hover:border-sky-800",
    cardBg: "bg-gradient-to-br from-white to-sky-50/30 dark:from-neutral-900 dark:to-sky-950/10",
    cardUnreadBg: "bg-gradient-to-br from-sky-50/20 to-sky-100/10 dark:from-sky-950/20 dark:to-sky-900/10",
    leftBar: "bg-gradient-to-b from-sky-500 to-blue-500",
    btnGradient: "bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-sky-200/50 dark:shadow-none",
    detailsBg: "bg-sky-50/40 dark:bg-sky-950/30 border border-sky-100/50 dark:border-sky-900/20",
    badgeBg: "bg-sky-100 dark:bg-sky-900/50 text-sky-800 dark:text-sky-300",
    badgeText: "DISCUSSION",
    borderColor: "border-sky-100 dark:border-sky-900/30",
  },
  invite: {
    iconBg: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
    cardHoverEffect: "hover:shadow-lg hover:shadow-amber-100/40 hover:border-amber-300 dark:hover:border-amber-800",
    cardBg: "bg-gradient-to-br from-white to-amber-50/30 dark:from-neutral-900 dark:to-amber-950/10",
    cardUnreadBg: "bg-gradient-to-br from-amber-50/20 to-amber-100/10 dark:from-amber-950/20 dark:to-amber-900/10",
    leftBar: "bg-gradient-to-b from-amber-500 to-orange-500",
    btnGradient: "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-amber-200/50 dark:shadow-none",
    detailsBg: "bg-amber-50/40 dark:bg-amber-950/30 border border-amber-100/50 dark:border-amber-900/20",
    badgeBg: "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300",
    badgeText: "COLLABORATION",
    borderColor: "border-amber-100 dark:border-amber-900/30",
  },
  system: {
    iconBg: "bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 border-slate-200 dark:border-neutral-700",
    cardHoverEffect: "hover:shadow-lg hover:shadow-slate-200/40 hover:border-slate-350 dark:hover:border-neutral-600",
    cardBg: "bg-gradient-to-br from-white to-slate-50/30 dark:from-neutral-900 dark:to-neutral-800/10",
    cardUnreadBg: "bg-gradient-to-br from-slate-50/20 to-slate-100/10 dark:from-neutral-800/20 dark:to-neutral-700/10",
    leftBar: "bg-gradient-to-b from-slate-500 to-slate-600",
    btnGradient: "bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white shadow-slate-200/50 dark:shadow-none",
    detailsBg: "bg-slate-100/50 dark:bg-neutral-800/40 border border-slate-200/50 dark:border-neutral-700/20",
    badgeBg: "bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300",
    badgeText: "SYSTEM",
    borderColor: "border-slate-200 dark:border-neutral-800",
  },
  profile: {
    iconBg: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30",
    cardHoverEffect: "hover:shadow-lg hover:shadow-rose-100/40 hover:border-rose-300 dark:hover:border-rose-800",
    cardBg: "bg-gradient-to-br from-white to-rose-50/30 dark:from-neutral-900 dark:to-rose-950/10",
    cardUnreadBg: "bg-gradient-to-br from-rose-50/20 to-rose-100/10 dark:from-rose-950/20 dark:to-rose-900/10",
    leftBar: "bg-gradient-to-b from-rose-500 to-red-600",
    btnGradient: "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-rose-200/50 dark:shadow-none",
    detailsBg: "bg-rose-50/40 dark:bg-rose-950/30 border border-rose-100/50 dark:border-rose-900/20",
    badgeBg: "bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300",
    badgeText: "SECURITY",
    borderColor: "border-rose-100 dark:border-rose-900/30",
  },
};

const TYPE_ICON: Record<VisualType, React.ReactNode> = {
  review: <GitBranch size={16} />,
  grade: <CheckSquare size={16} />,
  comment: <MessageSquare size={16} />,
  invite: <Users size={16} />,
  system: <Inbox size={16} />,
  profile: <User size={16} />,
};

const CTA_ICON: Record<VisualType, React.ReactNode> = {
  review: <GitBranch size={11} />,
  grade: <ArrowRight size={11} />,
  comment: <MessageSquare size={11} />,
  invite: <Users size={11} />,
  system: <ArrowRight size={11} />,
  profile: <ArrowRight size={11} />,
};

// ─── Real-data helpers ───────────────────────────────────────────────────────

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;

  const isYesterday =
    now.getDate() - date.getDate() === 1 &&
    now.getMonth() === date.getMonth() &&
    now.getFullYear() === date.getFullYear();
  const time = date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (isYesterday) return `Yesterday, ${time}`;

  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function isToday(iso: string): boolean {
  const date = new Date(iso);
  const now = new Date();
  return (
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

/**
 * When the row last had something happen to it. A collapsed group keeps its original createdAt but
 * advances lastEventAt every time it absorbs another event, and the reader cares about the latter.
 */
function eventTime(n: NotificationDto): string {
  return n.lastEventAt ?? n.createdAt;
}

/** camelCase -> "Camel Case", for displaying a metadata key as a label. */
function humanizeKey(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/^./, (c) => c.toUpperCase());
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Metadata entries worth showing a user — skips opaque ids and anything already shown elsewhere. */
function displayableMetadata(n: NotificationDto): Array<[string, string]> {
  const meta = parseMetadata(n.metadata);
  if (!meta) return [];
  const skipKeys = new Set(["status", "expiresAt"]);
  return Object.entries(meta)
    .filter(([key, value]) => {
      if (skipKeys.has(key)) return false;
      if (/(^id$|Id$)/.test(key)) return false;
      if (value == null || value === "") return false;
      if (typeof value === "string" && UUID_RE.test(value)) return false;
      return true;
    })
    .map(([key, value]) => [humanizeKey(key), String(value)]);
}

function ctaLabel(bucket: VisualType): string {
  switch (bucket) {
    case "review":
      return "View Submission";
    case "grade":
      return "View Result";
    case "comment":
      return "View Discussion";
    case "invite":
      return "View Invitation";
    case "profile":
      return "Review Activity";
    default:
      return "View Details";
  }
}

/** How long to wait after the last keystroke before asking the server. */
const SEARCH_DEBOUNCE_MS = 300;

type TabId = "unread" | "all";

export default function NotificationsHubPage() {
  const [activeTab, setActiveTab] = useState<TabId>("unread");
  const [activeCategory, setActiveCategory] = useState<NotificationCategory | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Debounced so typing does not fire a request per keystroke. The search itself runs on the
  // server against the whole history, not over whichever page happens to be loaded.
  useEffect(() => {
    const timer = setTimeout(() => setSearchTerm(searchInput), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const {
    notifications,
    totalCount,
    unreadCount,
    unreadByCategory,
    loading,
    isRefetching,
    hasMore,
    loadMore,
    isLoadingMore,
    markAllRead,
    markRead,
    deleteNotification,
  } = useNotifications({
    status: activeTab === "unread" ? "unread" : "all",
    category: activeCategory,
    search: searchTerm,
  });

  const handleCardClick = useCallback(
    (item: NotificationDto) => {
      if (!item.read) markRead(item.id);
      setExpandedIds((prev) =>
        prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
      );
    },
    [markRead]
  );

  const handleMarkOneRead = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      markRead(id);
    },
    [markRead]
  );

  const handleDeleteItem = useCallback(
    async (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setPendingDeleteId(id);
      try {
        await deleteNotification(id);
      } catch {
        toast.error("Could not delete that notification. Please try again.");
      } finally {
        setPendingDeleteId(null);
      }
    },
    [deleteNotification]
  );

  const handleTabChange = useCallback((tab: TabId) => {
    setActiveTab(tab);
    setExpandedIds([]);
  }, []);

  const handleCategoryChange = useCallback((category: NotificationCategory | null) => {
    setActiveCategory(category);
    setExpandedIds([]);
  }, []);

  const clearFilters = useCallback(() => {
    setActiveCategory(null);
    setSearchInput("");
    setSearchTerm("");
  }, []);

  const { todayItems, earlierItems } = useMemo(() => {
    const today: NotificationDto[] = [];
    const earlier: NotificationDto[] = [];
    notifications.forEach((n) => (isToday(eventTime(n)) ? today : earlier).push(n));
    return { todayItems: today, earlierItems: earlier };
  }, [notifications]);

  const isFiltered = Boolean(activeCategory) || searchTerm.trim().length > 0;

  const renderCard = (item: NotificationDto) => {
    const isExpanded = expandedIds.includes(item.id);
    const bucket = getVisualType(item.type);
    const style = TYPE_STYLES[bucket];
    const targetUrl = getNotificationTargetUrl(item);
    const metadataEntries = displayableMetadata(item);
    const isDeleting = pendingDeleteId === item.id;

    return (
      <motion.div
        key={item.id}
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ x: 50, opacity: 0 }}
        onClick={() => handleCardClick(item)}
        className={`p-5 rounded-2xl transition-all cursor-pointer relative group flex flex-col gap-3.5 w-full overflow-hidden border ${style.borderColor} ${
          !item.read ? style.cardUnreadBg : `${style.cardBg} opacity-[0.72] hover:opacity-100`
        } ${style.cardHoverEffect} hover:-translate-y-0.5 hover:shadow-md`}
      >
        {/* The accent bar is the at-a-glance "this still needs you" signal, so a read card loses
            it entirely rather than merely dimming it. */}
        {!item.read && (
          <div className={`absolute left-0 top-0 bottom-0 w-[4px] rounded-l-2xl ${style.leftBar}`} />
        )}

        <div className="flex items-center gap-4 w-full">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${style.iconBg}`}>
            {TYPE_ICON[bucket]}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <h4
                  className={`text-xs leading-none truncate ${
                    item.read
                      ? "font-semibold text-slate-600 dark:text-slate-400"
                      : "font-black text-slate-900 dark:text-slate-100"
                  }`}
                >
                  {item.title}
                </h4>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${style.badgeBg}`}>
                  {style.badgeText}
                </span>
                {item.groupCount > 1 && (
                  // A collapsed group stands for many events; say so explicitly rather than
                  // letting one row quietly under-represent a backlog.
                  <span
                    className="shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-slate-900/5 dark:bg-white/10 text-slate-600 dark:text-slate-300"
                    title={`${item.groupCount} events collapsed into this notification`}
                  >
                    <Layers size={8} />
                    {item.groupCount}
                  </span>
                )}
              </div>
              <span className="text-[9px] text-slate-400 font-bold select-none shrink-0">
                {formatTimestamp(eventTime(item))}
              </span>
            </div>
            <p
              className={`text-[11px] font-semibold leading-relaxed mt-1 ${
                item.read ? "text-slate-400 dark:text-slate-500" : "text-slate-550 dark:text-slate-400"
              }`}
            >
              {item.message}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 select-none" onClick={(e) => e.stopPropagation()}>
            {item.read ? (
              <span
                className="p-1.5 rounded-lg bg-slate-50 dark:bg-neutral-800 text-emerald-500"
                title={item.readAt ? `Read ${formatTimestamp(item.readAt)}` : "Read"}
              >
                <Check size={12} />
              </span>
            ) : (
              <button
                onClick={(e) => handleMarkOneRead(item.id, e)}
                className="p-1.5 rounded-lg border border-transparent bg-slate-50 dark:bg-neutral-800 text-blue-600 hover:bg-blue-50/80 dark:hover:bg-blue-950/40 transition-all"
                title="Mark as read"
              >
                <Eye size={12} />
              </button>
            )}

            <button
              onClick={() => handleCardClick(item)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded text-slate-500 transition-transform"
              style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
              title={isExpanded ? "Collapse" : "Expand Details"}
            >
              <ChevronDown size={14} />
            </button>

            <button
              onClick={(e) => handleDeleteItem(item.id, e)}
              disabled={isDeleting}
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded text-slate-450 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
              title="Delete notification"
            >
              {isDeleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden w-full"
            >
              <div className="space-y-4 text-left pt-3">
                {item.actorName && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wide">
                    By {item.actorName}
                  </p>
                )}

                {item.groupCount > 1 && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                    This groups {item.groupCount} similar updates. Open the linked queue to see each
                    one individually.
                  </p>
                )}

                {metadataEntries.length > 0 && (
                  <div className={`p-4 rounded-xl space-y-1.5 ${style.detailsBg}`}>
                    {metadataEntries.map(([label, value]) => (
                      <div key={label} className="flex items-baseline gap-2 text-[11px]">
                        <span className="text-slate-400 font-extrabold uppercase tracking-wider text-[9px] shrink-0">
                          {label}
                        </span>
                        <span className="text-slate-750 dark:text-slate-300 font-semibold break-words">{value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {metadataEntries.length === 0 && !targetUrl && (
                  <p className="text-[11px] text-slate-400 italic">No further details.</p>
                )}

                {targetUrl && (
                  <Link
                    href={targetUrl}
                    onClick={(e) => e.stopPropagation()}
                    className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all inline-flex items-center gap-1.5 shadow-xs rounded-xl hover:-translate-y-0.5 active:translate-y-0 ${style.btnGradient}`}
                  >
                    {ctaLabel(bucket)} {CTA_ICON[bucket]}
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const renderSection = (label: string, items: NotificationDto[]) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
            {label}
          </h3>
          {label === "Today" && unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
            >
              Mark all as read <CheckCircle2 size={12} />
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-3">
          <AnimatePresence initial={false}>{items.map(renderCard)}</AnimatePresence>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 pt-10 pb-16 text-slate-800 dark:text-slate-200">
      <style jsx global>{`
        .notification-header {
          width: 100%;
          background: transparent;
          padding: 30px 20px 15px;
          box-sizing: border-box;
        }

        .notification-content {
          max-width: 1180px;
          margin: 0 auto;
        }

        .title-area {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
          width: 100%;
        }

        .title-left {
          position: relative;
          display: inline-block;
        }

        .title-left h1 {
          font-size: 52px;
          line-height: 1.05;
          margin: 0;
          background: linear-gradient(90deg, #1769ff 0%, #00b894 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .title-underline {
          display: block;
          width: 100%;
          height: 22px;
          margin-top: -4px;
          overflow: visible;
        }

        .title-underline path {
          fill: none;
          stroke-linecap: round;
        }

        .underline-blue {
          stroke: #1769ff;
          stroke-width: 2.2;
          opacity: 0.85;
        }

        .underline-gradient {
          stroke: url(#underlineGradient);
          stroke-width: 1.6;
          opacity: 0.65;
        }

        .title-left p {
          margin: 10px 0 0;
          font-size: 13px;
          font-weight: 500;
          color: #64748b;
        }

        :global(.dark) .title-left p {
          color: #94a3b8;
        }

        @media (max-width: 768px) {
          .title-left h1 {
            font-size: 38px;
          }
          .title-left p {
            font-size: 12px;
          }
        }
      `}</style>

      <section className="notification-header">
        <div className="notification-content">
          <div className="title-area">
            <div className="title-left">
              <h1 className={alexBrush.className}>Notifications</h1>

              <svg className="title-underline" viewBox="0 0 430 30" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="underlineGradient">
                    <stop offset="0%" stopColor="#1769FF" />
                    <stop offset="100%" stopColor="#00B894" />
                  </linearGradient>
                </defs>
                <path d="M5 12 C90 8, 180 13, 270 10 C330 8, 380 11, 425 9" className="underline-blue" />
                <path d="M8 23 C100 20, 190 23, 280 21 C335 20, 380 22, 425 20" className="underline-gradient" />
              </svg>

              <p>Stay updated with course collaboration, channel events, and platform activity.</p>
            </div>
          </div>
        </div>
      </section>

      <div className="notification-content px-4 sm:px-6">
        {/* ── Controls ──────────────────────────────────────────────────────
            No Refresh button: the list is kept current by the server's event
            stream, so asking the user to fetch would be asking them to do the
            client's job. No Clear All either — see NotificationController. */}
        <div className="flex flex-col gap-3 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            {/* Read-state tabs. The unread total lives here rather than in a standalone
                "589 UNREAD" chip: it is a property of a tab, not an action to press. */}
            <div
              role="tablist"
              aria-label="Filter notifications by read state"
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-neutral-900 p-1 border border-slate-200 dark:border-neutral-800"
            >
              {(
                [
                  ["unread", "Unread", unreadCount],
                  ["all", "All", null],
                ] as Array<[TabId, string, number | null]>
              ).map(([id, label, count]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={activeTab === id}
                  onClick={() => handleTabChange(id)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors ${
                    activeTab === id
                      ? "bg-white dark:bg-neutral-800 text-slate-900 dark:text-slate-100 shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  {label}
                  {count !== null && count > 0 && (
                    <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-blue-600 text-white text-[9px] font-black">
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Search runs server-side across the whole history, not over the loaded page. */}
            <div className="relative flex-1 min-w-[200px]">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search notifications…"
                aria-label="Search notifications"
                className="w-full rounded-full border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-2 pl-9 pr-9 text-xs font-semibold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  aria-label="Clear search"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-neutral-800 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors"
              >
                <CheckCircle2 size={13} /> Mark all read
              </button>
            )}
          </div>

          {/* Category chips, each showing how many unread it holds. */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => handleCategoryChange(null)}
              className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                activeCategory === null
                  ? "border-slate-900 dark:border-slate-100 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                  : "border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-slate-400 hover:border-slate-400"
              }`}
            >
              All types
            </button>
            {CATEGORY_ORDER.map((category) => {
              const count = unreadByCategory[category] ?? 0;
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(isActive ? null : category)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                    isActive
                      ? "border-blue-600 bg-blue-600 text-white"
                      : "border-slate-200 dark:border-neutral-800 text-slate-500 dark:text-slate-400 hover:border-slate-400"
                  }`}
                >
                  {CATEGORY_LABELS[category]}
                  {count > 0 && (
                    <span
                      className={`inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-black ${
                        isActive ? "bg-white/25 text-white" : "bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300"
                      }`}
                    >
                      {count > 99 ? "99+" : count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-2 px-1 min-h-[16px]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {isRefetching && notifications.length > 0 ? (
                <span className="inline-flex items-center gap-1.5">
                  <Loader2 size={10} className="animate-spin" /> Updating…
                </span>
              ) : totalCount > 0 ? (
                `Showing ${notifications.length} of ${totalCount}`
              ) : null}
            </p>
            {isFiltered && (
              <button
                onClick={clearFilters}
                className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                Clear filters
              </button>
            )}
          </div>
        </div>

        {/* ── Body ─────────────────────────────────────────────────────────── */}
        {loading && notifications.length === 0 ? (
          <div className="py-20 flex items-center justify-center">
            <Loader2 size={22} className="animate-spin text-slate-400" />
          </div>
        ) : notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-20 text-center select-none"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-50 dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 flex items-center justify-center text-slate-400">
              <Bell size={24} />
            </div>
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
              {isFiltered
                ? "Nothing matches those filters"
                : activeTab === "unread"
                  ? "You're all caught up"
                  : "No notifications yet"}
            </p>
            <p className="text-xs text-slate-400 mt-1.5">
              {isFiltered
                ? "Try a different category, or clear the filters to see everything."
                : activeTab === "unread"
                  ? "New notifications will appear here the moment they arrive."
                  : "Activity on your channels and content will show up here."}
            </p>
            {isFiltered && (
              <button
                onClick={clearFilters}
                className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-slate-200 dark:border-neutral-800 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-900"
              >
                Clear filters
              </button>
            )}
          </motion.div>
        ) : (
          <>
            {renderSection("Today", todayItems)}
            {renderSection("Earlier", earlierItems)}

            {hasMore && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={() => loadMore()}
                  disabled={isLoadingMore}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-neutral-800 px-5 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-neutral-900 transition-colors disabled:opacity-50"
                >
                  {isLoadingMore && <Loader2 size={12} className="animate-spin" />}
                  {isLoadingMore ? "Loading" : "Load more"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
