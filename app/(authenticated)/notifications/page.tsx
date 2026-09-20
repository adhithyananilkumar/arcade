"use client";

import React, { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Alex_Brush } from "next/font/google";
import { toast } from "sonner";
import {
  useNotifications,
  getNotificationTargetUrl,
  getVisualType,
  parseMetadata,
  type NotificationDto,
  type VisualType,
} from "@/domains/notifications";
import {
  Bell,
  User,
  Trash2,
  RefreshCw,
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
} from "lucide-react";

const alexBrush = Alex_Brush({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// ─── Per-bucket visual styling ──────────────────────────────────────────────
// Purely presentational — which of six looks a real notification's `type` gets skinned with.
// See domains/notifications/lib/visualType.ts for how `type` maps to a bucket.

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

export default function NotificationsHubPage() {
  const {
    notifications,
    unreadCount,
    loading,
    refresh,
    markAllRead,
    markRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();

  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [clearingAll, setClearingAll] = useState(false);

  const handleCardClick = useCallback(
    (item: NotificationDto) => {
      if (!item.read) markRead(item.id);
      setExpandedIds((prev) =>
        prev.includes(item.id) ? prev.filter((x) => x !== item.id) : [...prev, item.id]
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
        setExpandedIds((prev) => prev.filter((x) => x !== id));
      } catch {
        toast.error("Failed to delete notification.");
      } finally {
        setPendingDeleteId(null);
      }
    },
    [deleteNotification]
  );

  const handleClearAll = useCallback(async () => {
    if (notifications.length === 0) return;
    if (!window.confirm("Clear all notifications? This cannot be undone.")) return;
    setClearingAll(true);
    try {
      await deleteAllNotifications();
      setExpandedIds([]);
      toast.success("Notifications cleared.");
    } catch {
      toast.error("Failed to clear notifications.");
    } finally {
      setClearingAll(false);
    }
  }, [notifications.length, deleteAllNotifications]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refresh();
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

  const filteredNotifications = useMemo(() => {
    if (activeTab === "unread") return notifications.filter((n) => !n.read);
    return notifications;
  }, [notifications, activeTab]);

  const todayItems = useMemo(
    () => filteredNotifications.filter((n) => isToday(n.createdAt)),
    [filteredNotifications]
  );
  const earlierItems = useMemo(
    () => filteredNotifications.filter((n) => !isToday(n.createdAt)),
    [filteredNotifications]
  );

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
          !item.read ? style.cardUnreadBg : style.cardBg
        } ${style.cardHoverEffect} hover:-translate-y-0.5 hover:shadow-md`}
      >
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
                <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 leading-none truncate">
                  {item.title}
                </h4>
                <span className={`shrink-0 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${style.badgeBg}`}>
                  {style.badgeText}
                </span>
              </div>
              <span className="text-[9px] text-slate-400 font-bold select-none shrink-0">
                {formatTimestamp(item.createdAt)}
              </span>
            </div>
            <p className="text-[11px] text-slate-550 dark:text-slate-400 font-semibold leading-relaxed mt-1">
              {item.message}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 select-none" onClick={(e) => e.stopPropagation()}>
            {item.read ? (
              <span
                className="p-1.5 rounded-lg bg-slate-50 dark:bg-neutral-800 text-emerald-500"
                title="Read"
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
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
        }

        .title-left h1 {
          margin: 0;
          font-size: 58px;
          font-weight: 400;
          line-height: 0.95;

          background: linear-gradient(
            90deg,
            #1769ff 0%,
            #159fe8 50%,
            #00b894 100%
          );

          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }

        .title-underline {
          width: 300px;
          height: 20px;
          display: block;
          margin: 2px auto 0;
        }

        .title-underline path {
          fill: none;
          stroke-width: 2.2;
          stroke-linecap: round;
        }

        .underline-blue {
          stroke: #1769ff;
        }

        .underline-gradient {
          stroke: url(#underlineGradient);
        }

        .title-left p {
          margin: 10px 0 0;

          font-family: "Inter", sans-serif;
          font-size: 13px;
          font-weight: 500;
          line-height: 1.5;

          color: #64748b;
        }

        .actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 24px;
        }

        .action-button {
          height: 34px;
          padding: 0 14px;

          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;

          border: 1px solid #e6ecf5;
          border-radius: 8px;

          background: #ffffff;

          color: #15264a;

          font-family: "Inter", sans-serif;
          font-size: 11px;
          font-weight: 700;

          box-shadow: 0 2px 8px rgba(25, 50, 90, 0.05);

          cursor: pointer;

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .action-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(25, 50, 90, 0.08);
          border-color: #d6e1f0;
        }

        .action-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }

        .action-button svg {
          color: #172d52;
        }

        .action-button.unread {
          color: #1769ff;
        }

        .action-button.unread svg {
          color: #172d52;
        }

        .action-button.unread.active-filter {
          border-color: #1769ff;
          background-color: #f0f5ff;
        }

        :global(.dark) .action-button {
          background: #171717;
          border-color: #333;
          color: #e5e5e5;
        }

        :global(.dark) .action-button svg {
          color: #e5e5e5;
        }

        @media (max-width: 768px) {
          .notification-header {
            padding: 20px 16px;
          }

          .title-area {
            flex-direction: column;
          }

          .title-left h1 {
            font-size: 44px;
          }

          .title-underline {
            width: 230px;
          }

          .actions {
            flex-wrap: wrap;
            margin-top: 20px;
          }

          .action-button {
            height: 32px;
            padding: 0 12px;
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

          <div className="actions">
            <button
              onClick={() => setActiveTab(activeTab === "unread" ? "all" : "unread")}
              className={`action-button unread ${activeTab === "unread" ? "active-filter" : ""}`}
            >
              <Bell size={13} strokeWidth={1.8} />
              <span>{unreadCount} UNREAD</span>
            </button>

            <button onClick={handleRefresh} disabled={isRefreshing} className="action-button">
              <RefreshCw size={12} strokeWidth={1.8} className={isRefreshing ? "animate-spin" : ""} />
              <span>Refresh</span>
            </button>

            {notifications.length > 0 && (
              <button onClick={handleClearAll} disabled={clearingAll} className="action-button">
                {clearingAll ? (
                  <Loader2 size={12} strokeWidth={1.8} className="animate-spin" />
                ) : (
                  <Trash2 size={12} strokeWidth={1.8} />
                )}
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="notification-content px-4 sm:px-6 mt-4">
        {loading && notifications.length === 0 ? (
          <div className="py-20 flex items-center justify-center">
            <Loader2 size={22} className="animate-spin text-slate-400" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-20 flex flex-col items-center text-center gap-4 select-none w-full"
          >
            <div className="relative w-28 h-28 flex items-center justify-center mx-auto">
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none" fill="none">
                <path d="M 22 55 C 16 48, 16 38, 24 32 C 26 40, 24 48, 22 55 Z" fill="#10b981" opacity="0.75" />
                <path d="M 12 42 C 8 36, 12 28, 20 28 C 18 34, 16 38, 12 42 Z" fill="#34d399" opacity="0.65" />
                <path d="M 28 62 C 24 58, 26 52, 32 48 C 30 54, 30 58, 28 62 Z" fill="#059669" opacity="0.5" />
                <path d="M 78 55 C 84 48, 84 38, 76 32 C 74 40, 76 48, 78 55 Z" fill="#3b82f6" opacity="0.75" />
                <path d="M 88 42 C 92 36, 88 28, 80 28 C 82 34, 84 38, 88 42 Z" fill="#60a5fa" opacity="0.65" />
                <path d="M 72 62 C 76 58, 74 52, 68 48 C 70 54, 70 58, 72 62 Z" fill="#2563eb" opacity="0.5" />
              </svg>

              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-neutral-800 flex items-center justify-center text-slate-855 shadow-sm relative z-10">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-slate-800 dark:text-slate-300 animate-bounce" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-855 dark:text-slate-200">
                {activeTab === "unread" ? "No unread notifications" : "You’re all caught up!"}
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                We&apos;ll notify you when something new arrives.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-8 w-full">
            {todayItems.length > 0 && (
              <div className="space-y-4 w-full">
                <div className="flex items-center justify-between pb-1 select-none w-full">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Today</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
                    >
                      Mark all as read
                      <CheckCircle2 size={14} className="stroke-[2.5]" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 w-full">
                  <AnimatePresence>{todayItems.map(renderCard)}</AnimatePresence>
                </div>
              </div>
            )}

            {earlierItems.length > 0 && (
              <div className="space-y-4 w-full">
                <div className="flex items-center justify-between pb-1 select-none w-full">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Earlier</h3>
                </div>

                <div className="grid grid-cols-1 gap-3 w-full">
                  <AnimatePresence>{earlierItems.map(renderCard)}</AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
