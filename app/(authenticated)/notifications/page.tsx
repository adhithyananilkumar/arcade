"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaGithub } from "react-icons/fa";
import { 
  Bell, 
  User, 
  Trash2, 
  RotateCcw,
  ChevronDown,
  ArrowRight,
  Send,
  Eye,
  EyeOff,
  CheckCircle2,
  GitBranch,
  BookOpen,
  CheckSquare,
  MessageSquare,
  Users,
  ShieldCheck
} from "lucide-react";
import { useNotifications, NotificationDto } from "@/domains/notifications";

// Notification model interface representing the items
interface NotificationItem {
  id: string;
  type: "roadmap" | "review" | "grade" | "comment" | "invite" | "system" | "profile";
  title: string;
  description: string;
  details?: string; // Human feedback or logs
  actionLabel?: string; // Custom CTA button text
  timestamp: string;
  read: boolean;
  category: "Today" | "Earlier";
  actorName?: string; // Actor details
}

// Helpers
function getTypeStyles(type: NotificationItem["type"]) {
  switch (type) {
    case "roadmap":
      return {
        iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20 dark:bg-blue-500/15",
        cardHoverEffect: "hover:shadow-md hover:border-blue-400/50 dark:hover:border-blue-500/50",
        cardBg: "bg-white dark:bg-neutral-900 border-slate-200/60 dark:border-neutral-800/80",
        cardUnreadBg: "bg-blue-500/[0.02] border-blue-500/20 dark:bg-blue-500/[0.04] dark:border-blue-800/80",
        leftBar: "bg-blue-500",
        btnGradient: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm cursor-pointer",
        detailsBg: "bg-slate-50 dark:bg-neutral-950/40 border border-slate-150 dark:border-neutral-800/60",
        accentColor: "text-blue-600 dark:text-blue-400",
        badgeBg: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border border-blue-500/20",
        badgeText: "ROADMAP",
        borderColor: "border-slate-200/60 dark:border-neutral-800/80",
      };
    case "review":
      return {
        iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20 dark:bg-purple-500/15",
        cardHoverEffect: "hover:shadow-md hover:border-purple-400/50 dark:hover:border-purple-500/50",
        cardBg: "bg-white dark:bg-neutral-900 border-slate-200/60 dark:border-neutral-800/80",
        cardUnreadBg: "bg-purple-500/[0.02] border-purple-500/20 dark:bg-purple-500/[0.04] dark:border-purple-800/80",
        leftBar: "bg-purple-500",
        btnGradient: "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white shadow-sm cursor-pointer",
        detailsBg: "bg-slate-50 dark:bg-neutral-950/40 border border-slate-150 dark:border-neutral-800/60",
        accentColor: "text-purple-600 dark:text-purple-400",
        badgeBg: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 border border-purple-500/20",
        badgeText: "CODE REVIEW",
        borderColor: "border-slate-200/60 dark:border-neutral-800/80",
      };
    case "grade":
      return {
        iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 dark:bg-emerald-500/15",
        cardHoverEffect: "hover:shadow-md hover:border-emerald-400/50 dark:hover:border-emerald-500/50",
        cardBg: "bg-white dark:bg-neutral-900 border-slate-200/60 dark:border-neutral-800/80",
        cardUnreadBg: "bg-emerald-500/[0.02] border-emerald-500/20 dark:bg-emerald-500/[0.04] dark:border-emerald-800/80",
        leftBar: "bg-emerald-500",
        btnGradient: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-sm cursor-pointer",
        detailsBg: "bg-slate-50 dark:bg-neutral-950/40 border border-slate-150 dark:border-neutral-800/60",
        accentColor: "text-emerald-600 dark:text-emerald-400",
        badgeBg: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/20",
        badgeText: "ACADEMIC GRADE",
        borderColor: "border-slate-200/60 dark:border-neutral-800/80",
      };
    case "comment":
      return {
        iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20 dark:bg-sky-500/15",
        cardHoverEffect: "hover:shadow-md hover:border-sky-400/50 dark:hover:border-sky-500/50",
        cardBg: "bg-white dark:bg-neutral-900 border-slate-200/60 dark:border-neutral-800/80",
        cardUnreadBg: "bg-sky-500/[0.02] border-sky-500/20 dark:bg-sky-500/[0.04] dark:border-sky-800/80",
        leftBar: "bg-sky-500",
        btnGradient: "bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-sm cursor-pointer",
        detailsBg: "bg-slate-50 dark:bg-neutral-950/40 border border-slate-150 dark:border-neutral-800/60",
        accentColor: "text-sky-600 dark:text-sky-400",
        badgeBg: "bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400 border border-sky-500/20",
        badgeText: "DISCUSSION",
        borderColor: "border-slate-200/60 dark:border-neutral-800/80",
      };
    case "invite":
      return {
        iconBg: "bg-amber-500/10 text-amber-707 border-amber-500/20 dark:bg-amber-500/15",
        cardHoverEffect: "hover:shadow-md hover:border-amber-400/50 dark:hover:border-amber-500/50",
        cardBg: "bg-white dark:bg-neutral-900 border-slate-200/60 dark:border-neutral-800/80",
        cardUnreadBg: "bg-amber-500/[0.02] border-amber-500/20 dark:bg-amber-500/[0.04] dark:border-amber-800/80",
        leftBar: "bg-amber-500",
        btnGradient: "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-sm cursor-pointer",
        detailsBg: "bg-slate-50 dark:bg-neutral-950/40 border border-slate-150 dark:border-neutral-800/60",
        accentColor: "text-amber-707 dark:text-amber-400",
        badgeBg: "bg-amber-500/10 text-amber-707 dark:bg-amber-500/20 dark:text-amber-400 border border-amber-500/20",
        badgeText: "COLLABORATION",
        borderColor: "border-slate-200/60 dark:border-neutral-800/80",
      };
    case "system":
      return {
        iconBg: "bg-slate-500/10 text-slate-700 dark:text-slate-350 border-slate-500/20 dark:bg-slate-500/15",
        cardHoverEffect: "hover:shadow-md hover:border-slate-400/50 dark:hover:border-neutral-700",
        cardBg: "bg-white dark:bg-neutral-900 border-slate-200/60 dark:border-neutral-800/80",
        cardUnreadBg: "bg-slate-500/[0.02] border-slate-500/20 dark:bg-slate-500/[0.04] dark:border-slate-850",
        leftBar: "bg-slate-500",
        btnGradient: "bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white shadow-sm cursor-pointer",
        detailsBg: "bg-slate-50 dark:bg-neutral-950/40 border border-slate-150 dark:border-neutral-800/60",
        accentColor: "text-slate-700 dark:text-slate-300",
        badgeBg: "bg-slate-500/10 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 border border-slate-500/20",
        badgeText: "SYSTEM SYNC",
        borderColor: "border-slate-200/60 dark:border-neutral-800/80",
      };
    case "profile":
      return {
        iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-450 border-rose-500/20 dark:bg-rose-500/15",
        cardHoverEffect: "hover:shadow-md hover:border-rose-400/50 dark:hover:border-rose-500/50",
        cardBg: "bg-white dark:bg-neutral-900 border-slate-200/60 dark:border-neutral-800/80",
        cardUnreadBg: "bg-rose-500/[0.02] border-rose-500/20 dark:bg-rose-500/[0.04] dark:border-rose-800/80",
        leftBar: "bg-rose-500",
        btnGradient: "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-sm cursor-pointer",
        detailsBg: "bg-slate-50 dark:bg-neutral-950/40 border border-slate-150 dark:border-neutral-800/60",
        accentColor: "text-rose-600 dark:text-rose-400",
        badgeBg: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border border-rose-500/20",
        badgeText: "SECURITY LOG",
        borderColor: "border-slate-200/60 dark:border-neutral-800/80",
      };
  }
}

function getAvatarProps(name?: string) {
  const cleanName = (name || "System").trim();
  const parts = cleanName.split(/\s+/);
  let initials = "";
  if (parts.length >= 2) {
    initials = (parts[0][0] + parts[1][0]).toUpperCase();
  } else if (cleanName.length > 0) {
    initials = cleanName.slice(0, 2).toUpperCase();
  } else {
    initials = "SYS";
  }

  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % 6;

  const gradients = [
    "bg-gradient-to-br from-violet-500 to-indigo-500",
    "bg-gradient-to-br from-blue-500 to-cyan-500",
    "bg-gradient-to-br from-emerald-500 to-teal-500",
    "bg-gradient-to-br from-orange-500 to-rose-500",
    "bg-gradient-to-br from-rose-500 to-pink-500",
    "bg-gradient-to-br from-fuchsia-500 to-purple-500"
  ];

  return {
    initials,
    gradientClass: gradients[idx]
  };
}

function getCategoryIcon(type: string) {
  switch (type) {
    case "roadmap":
      return (
        <span className="w-4 h-4 rounded-full bg-blue-500 border border-white dark:border-neutral-900 flex items-center justify-center shadow-sm">
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </span>
      );
    case "review":
      return (
        <span className="w-4 h-4 rounded-full bg-purple-500 border border-white dark:border-neutral-900 flex items-center justify-center shadow-sm">
          <svg className="w-2 h-2 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </span>
      );
    case "grade":
      return (
        <span className="w-4 h-4 rounded-full bg-emerald-500 border border-white dark:border-neutral-900 flex items-center justify-center shadow-sm">
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </span>
      );
    default:
      return null;
  }
}

function mapBackendType(backendType: string): NotificationItem["type"] {
  switch (backendType) {
    case 'OWNER_TRANSFER_REQUESTED':
      return 'invite';
    case 'CONTENT_SUBMITTED':
    case 'CONTENT_CHANGES_REQUESTED':
      return 'review';
    case 'CONTENT_APPROVED':
      return 'roadmap';
    case 'CHANNEL_APPROVED':
    case 'CHANNEL_REJECTED':
      return 'system';
    default:
      return 'profile';
  }
}

function typeLabel(type: string): string | null {
  switch (type) {
    case 'OWNER_TRANSFER_REQUESTED':
      return 'Ownership Transfer Request';
    case 'OWNER_TRANSFER_ACCEPTED':
      return 'Ownership Transfer Completed';
    case 'OWNER_TRANSFER_DECLINED':
      return 'Ownership Transfer Declined';
    case 'OWNER_TRANSFER_CANCELLED':
      return 'Ownership Transfer Cancelled';
    case 'CONTENT_SUBMITTED':
      return 'Review submitted';
    case 'CONTENT_APPROVED':
      return 'Approved';
    case 'CONTENT_CHANGES_REQUESTED':
      return 'Changes requested';
    case 'CHANNEL_APPROVED':
    case 'CHANNEL_REJECTED':
      return 'Channel';
    default:
      return null;
  }
}

function formatNotificationDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' at ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function isToday(date: Date): boolean {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}

function formatMetadata(metadata: string, type: string): string {
  try {
    const parsed = JSON.parse(metadata);
    if (parsed.feedback) return parsed.feedback;
    if (parsed.message) return parsed.message;
    if (parsed.reason) return `Reason: ${parsed.reason}`;
    return JSON.stringify(parsed, null, 2);
  } catch {
    return metadata;
  }
}

function getActionLabel(type: string): string {
  switch (type) {
    case 'CONTENT_SUBMITTED':
    case 'CONTENT_CHANGES_REQUESTED':
      return 'Open Review Studio';
    case 'CONTENT_APPROVED':
      return 'View Live Roadmap';
    case 'OWNER_TRANSFER_REQUESTED':
      return 'Accept Staff Role';
    default:
      return 'View Details';
  }
}

export default function NotificationsHubPage() {
  const { 
    notifications: backendNotifications, 
    markAllRead, 
    markRead, 
    refresh 
  } = useNotifications();

  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [replyText, setReplyText] = useState("");

  const notifications = useMemo(() => {
    return backendNotifications
      .filter((n) => !deletedIds.includes(n.id))
      .map((dto): NotificationItem => {
        const date = new Date(dto.createdAt);
        const isTodayVal = isToday(date);
        return {
          id: dto.id,
          type: mapBackendType(dto.type),
          title: dto.title || typeLabel(dto.type) || 'Notification',
          description: dto.message || '',
          details: dto.metadata ? formatMetadata(dto.metadata, dto.type) : undefined,
          actionLabel: getActionLabel(dto.type),
          timestamp: formatNotificationDate(dto.createdAt),
          read: dto.read,
          category: isTodayVal ? "Today" : "Earlier",
          actorName: dto.actorName
        };
      });
  }, [backendNotifications, deletedIds]);

  const handleToggleRead = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await markRead(id);
  }, [markRead]);

  const handleCardClick = useCallback(async (id: string) => {
    await markRead(id);
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }, [markRead]);

  const handleMarkAllRead = useCallback(async () => {
    await markAllRead();
  }, [markAllRead]);

  const handleDeleteItem = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletedIds((prev) => [...prev, id]);
    setExpandedIds((prev) => prev.filter((x) => x !== id));
  }, []);

  const handleClearAll = useCallback(() => {
    setDeletedIds(backendNotifications.map((n) => n.id));
    setExpandedIds([]);
  }, [backendNotifications]);

  const handleResetDemo = useCallback(() => {
    setDeletedIds([]);
    setExpandedIds([]);
    refresh();
  }, [refresh]);

  // Group notifications based on activeTab and category filters
  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === "unread" && item.read) return false;
    if (selectedType !== "all" && item.type !== selectedType) return false;
    return true;
  });

  const todayItems = filteredNotifications.filter((n) => n.category === "Today");
  const earlierItems = filteredNotifications.filter((n) => n.category === "Earlier");
  const unreadCount = notifications.filter((n) => !n.read).length;

  const stats = useMemo(() => {
    const total = notifications.length;
    const unread = notifications.filter((n) => !n.read).length;
    const read = total - unread;
    return { total, unread, read };
  }, [notifications]);

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-neutral-950/20 pt-20 pb-16 text-slate-800 dark:text-slate-100">
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Caveat:wght@700&display=swap');
        .handwritten-title {
          font-family: 'Dancing Script', 'Caveat', cursive;
        }
      `}} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Header Block */}
        <header className="mb-8 flex flex-col items-center justify-center text-center gap-4">
          <div className="space-y-2">
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-5xl sm:text-6xl font-bold tracking-wide handwritten-title bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-purple-400 py-3 px-4 leading-normal">
                Notifications Hub
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold max-w-xl mx-auto">
              Monitor repository updates, code reviews, academic grades, and workspace activities.
            </p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0 select-none">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#1a73e8] dark:text-[#8ab4f8] hover:bg-[#e8f0fe]/50 dark:hover:bg-[#1a2e4d]/30 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 size={13} strokeWidth={2} />
                <span>Mark all read</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-[#fce8e6]/50 dark:hover:bg-rose-955/20 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 size={13} strokeWidth={2} />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </header>



        {/* Centered Single Column Content */}
        <div className="w-full">
          <main className="w-full">
            
            {filteredNotifications.length === 0 ? (
              
              /* Caught Up State (Borderless & Centered with Animated Ripple Radar Bell) */
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-16 px-6 flex flex-col items-center text-center gap-6 select-none w-full"
              >
                <div className="relative w-36 h-36 flex items-center justify-center mx-auto mb-2 select-none">
                  {/* Staggered Wing-flapping and Soundwave Animations */}
                  <svg 
                    viewBox="0 0 100 100" 
                    className="absolute inset-0 w-full h-full pointer-events-none opacity-85" 
                    fill="none"
                  >
                    {/* Left side (Green waves) - Staggered soundwave propagation */}
                    <motion.path 
                      d="M 28 62 C 24 58, 26 52, 32 48 C 30 54, 30 58, 28 62 Z" 
                      fill="#059669" 
                      style={{ originX: "32px", originY: "50px" }}
                      animate={{ scale: [1, 1.05, 1], x: [0, -2, 0], opacity: [0.7, 0.9, 0.7] }}
                      transition={{ duration: 2.2, delay: 0.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.path 
                      d="M 22 55 C 16 48, 16 38, 24 32 C 26 40, 24 48, 22 55 Z" 
                      fill="#10b981" 
                      style={{ originX: "24px", originY: "43px" }}
                      animate={{ scale: [1, 1.1, 1], x: [0, -5, 0], opacity: [0.6, 0.9, 0.6] }}
                      transition={{ duration: 2.2, delay: 0.2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.path 
                      d="M 12 42 C 8 36, 12 28, 20 28 C 18 34, 16 38, 12 42 Z" 
                      fill="#34d399" 
                      style={{ originX: "20px", originY: "35px" }}
                      animate={{ scale: [1, 1.18, 1], x: [0, -8, 0], opacity: [0.45, 0.85, 0.45] }}
                      transition={{ duration: 2.2, delay: 0, repeat: Infinity, ease: "easeInOut" }}
                    />
                    
                    {/* Right side (Blue waves) - Staggered soundwave propagation */}
                    <motion.path 
                      d="M 72 62 C 76 58, 74 52, 68 48 C 70 54, 70 58, 72 62 Z" 
                      fill="#2563eb" 
                      style={{ originX: "68px", originY: "50px" }}
                      animate={{ scale: [1, 1.05, 1], x: [0, 2, 0], opacity: [0.7, 0.9, 0.7] }}
                      transition={{ duration: 2.2, delay: 0.4, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.path 
                      d="M 78 55 C 84 48, 84 38, 76 32 C 74 40, 76 48, 78 55 Z" 
                      fill="#3b82f6" 
                      style={{ originX: "76px", originY: "43px" }}
                      animate={{ scale: [1, 1.1, 1], x: [0, 5, 0], opacity: [0.6, 0.9, 0.6] }}
                      transition={{ duration: 2.2, delay: 0.2, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.path 
                      d="M 88 42 C 92 36, 88 28, 80 28 C 82 34, 84 38, 88 42 Z" 
                      fill="#60a5fa" 
                      style={{ originX: "80px", originY: "35px" }}
                      animate={{ scale: [1, 1.18, 1], x: [0, 8, 0], opacity: [0.45, 0.85, 0.45] }}
                      transition={{ duration: 2.2, delay: 0, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </svg>

                  {/* Central Bell circular box with realistic bell body & clapper swing animation */}
                  <motion.div
                    animate={{ 
                      scale: [1, 1.05, 1],
                      boxShadow: ["0 4px 6px -1px rgb(0 0 0 / 0.1)", "0 10px 15px -3px rgb(59 130 246 / 0.15)", "0 4px 6px -1px rgb(0 0 0 / 0.1)"]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity, 
                      ease: "easeInOut"
                    }}
                    className="w-16 h-16 rounded-full bg-slate-50 dark:bg-neutral-800 border border-slate-200/40 dark:border-neutral-700/40 flex items-center justify-center text-slate-800 dark:text-slate-355 shadow-sm relative z-10"
                  >
                    <svg viewBox="0 0 24 24" className="w-8 h-8 overflow-visible" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                      {/* Bell Body swinging */}
                      <motion.path 
                        d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" 
                        style={{ originX: "12px", originY: "4px" }}
                        animate={{ rotate: [-10, 10, -10] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      />
                      {/* Clapper swinging offset */}
                      <motion.path 
                        d="M13.73 21a2 2 0 0 1-3.46 0" 
                        style={{ originX: "12px", originY: "17px" }}
                        animate={{ rotate: [18, -18, 18], x: [1, -1, 1] }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </svg>
                  </motion.div>
                </div>

                <div className="space-y-2 max-w-sm">
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">You're all caught up!</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                    No new activity matched in the active category. We'll alert you when updates sync.
                  </p>
                </div>
                
                <button
                  onClick={handleResetDemo}
                  className="px-5 py-2.5 text-xs font-bold text-[#1a73e8] bg-[#e8f0fe] hover:bg-[#d2e3fc] dark:bg-[#1a73e8]/20 dark:text-[#8ab4f8] dark:hover:bg-[#1a73e8]/30 rounded-full transition-colors cursor-pointer shadow-xs"
                >
                  Reload Demo Data
                </button>
              </motion.div>
            ) : (
              <div className="space-y-8 w-full">
                
                {/* Render Time blocks: Today */}
                {todayItems.length > 0 && (
                  <div className="space-y-4 w-full">
                    <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none">
                      Today
                    </h3>
                    <div className="grid grid-cols-1 gap-3 w-full">
                      <AnimatePresence mode="popLayout">
                        {todayItems.map((item) => (
                          <NotificationCard
                            key={item.id}
                            item={item}
                            isExpanded={expandedIds.includes(item.id)}
                            onToggleRead={(e) => handleToggleRead(item.id, e)}
                            onCardClick={() => handleCardClick(item.id)}
                            onDelete={(e) => handleDeleteItem(item.id, e)}
                            replyText={replyText}
                            onReplyTextChange={setReplyText}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

                {/* Render Time blocks: Earlier */}
                {earlierItems.length > 0 && (
                  <div className="space-y-4 w-full">
                    <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none">
                      Earlier
                    </h3>
                    <div className="grid grid-cols-1 gap-3 w-full">
                      <AnimatePresence mode="popLayout">
                        {earlierItems.map((item) => (
                          <NotificationCard
                            key={item.id}
                            item={item}
                            isExpanded={expandedIds.includes(item.id)}
                            onToggleRead={(e) => handleToggleRead(item.id, e)}
                            onCardClick={() => handleCardClick(item.id)}
                            onDelete={(e) => handleDeleteItem(item.id, e)}
                            replyText={replyText}
                            onReplyTextChange={setReplyText}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  </div>
                )}

              </div>
            )}

          </main>
        </div>

      </div>
    </div>
  );
}

// NotificationCard Component
interface CardProps {
  item: NotificationItem;
  isExpanded: boolean;
  onToggleRead: (e: React.MouseEvent) => void;
  onCardClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  replyText: string;
  onReplyTextChange: (val: string) => void;
}

function NotificationCard({
  item,
  isExpanded,
  onToggleRead,
  onCardClick,
  onDelete,
  replyText,
  onReplyTextChange
}: CardProps) {
  const style = getTypeStyles(item.type);
  const avatar = getAvatarProps(item.actorName);
  const categoryIcon = getCategoryIcon(item.type);

  const ctaButtonClass = `px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all inline-flex items-center gap-1.5 shadow-xs rounded-xl hover:-translate-y-0.5 active:translate-y-0 ${style.btnGradient}`;

  const renderCardContent = () => {
    switch (item.type) {
      case "roadmap":
        return (
          <div className="space-y-4 text-left pt-3 border-t border-black/[0.04] dark:border-white/[0.04]">
            <div className={`p-4 rounded-xl ${style.detailsBg}`}>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Moderator Review Logs</span>
              <p className="text-[11px] text-slate-705 dark:text-slate-300 font-semibold leading-relaxed">
                {item.details}
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); alert("Redirecting to published roadmap path..."); }}
              className={ctaButtonClass}
            >
              {item.actionLabel} <ArrowRight size={11} />
            </button>
          </div>
        );

      case "review":
        return (
          <div className="space-y-4 text-left pt-3 border-t border-black/[0.04] dark:border-white/[0.04]">
            <div className={`p-4 rounded-xl ${style.detailsBg}`}>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Review Request Details</span>
              <p className="text-[11px] text-slate-705 dark:text-slate-300 font-semibold leading-relaxed">
                {item.details}
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); alert("Loading branch comparison view in Review Studio..."); }}
              className={ctaButtonClass}
            >
              {item.actionLabel} <GitBranch size={11} />
            </button>
          </div>
        );

      case "grade":
        return (
          <div className="space-y-4 text-left pt-3 border-t border-black/[0.04] dark:border-white/[0.04]">
            <div className={`p-4 rounded-xl ${style.detailsBg}`}>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Feedback & Notes</span>
              <p className="text-[11px] text-slate-705 dark:text-slate-300 font-semibold leading-relaxed">
                {item.details}
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); alert("Redirecting to Student Gradebook..."); }}
              className={ctaButtonClass}
            >
              {item.actionLabel} <ArrowRight size={11} />
            </button>
          </div>
        );

      case "comment":
        return (
          <div className="space-y-4 text-left pt-3 border-t border-black/[0.04] dark:border-white/[0.04]">
            <div className={`p-4 rounded-xl flex gap-3 ${style.detailsBg}`}>
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-neutral-800 text-slate-600 dark:text-slate-400 flex items-center justify-center font-bold text-[10px] shrink-0 select-none">
                SJ
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block">Sarah Jenkins</span>
                <p className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                  {item.details}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={replyText}
                onChange={(e) => onReplyTextChange(e.target.value)}
                placeholder="Type reply to Sarah J..."
                className="flex-1 px-3.5 py-2 text-xs font-semibold bg-slate-50 dark:bg-neutral-900 focus:bg-white dark:focus:bg-neutral-800 rounded-xl focus:outline-none border border-slate-200/50 dark:border-neutral-800 focus:border-indigo-500"
              />
              <button
                onClick={() => { if (replyText.trim()) { alert(`Comment sent: ${replyText}`); onReplyTextChange(""); } }}
                className={`px-3.5 text-white rounded-xl text-xs flex items-center justify-center gap-1 transition-colors ${style.btnGradient}`}
              >
                <Send size={12} />
              </button>
            </div>
          </div>
        );

      case "invite":
        return (
          <div className="space-y-4 text-left pt-3 border-t border-black/[0.04] dark:border-white/[0.04]">
            <div className={`p-4 rounded-xl ${style.detailsBg}`}>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Staff Requirements</span>
              <p className="text-[11px] text-slate-705 dark:text-slate-300 font-semibold leading-relaxed">
                {item.details}
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); alert("Accepting moderator role..."); }}
              className={ctaButtonClass}
            >
              {item.actionLabel} <Users size={11} />
            </button>
          </div>
        );

      case "system":
        return (
          <div className="space-y-4 text-left pt-3 border-t border-black/[0.04] dark:border-white/[0.04]">
            <div className={`p-4 rounded-xl font-mono text-[10px] text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed ${style.detailsBg}`}>
              {item.details}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); alert("Redirecting to GitHub sync panel..."); }}
              className={ctaButtonClass}
            >
              {item.actionLabel} <FaGithub size={12} />
            </button>
          </div>
        );

      case "profile":
        return (
          <div className="space-y-4 text-left pt-3 border-t border-black/[0.04] dark:border-white/[0.04]">
            <div className={`p-4 rounded-xl font-mono text-[10px] text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed ${style.detailsBg}`}>
              {item.details}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); alert("Redirecting to Access & Security dashboard..."); }}
              className={ctaButtonClass}
            >
              {item.actionLabel} <ShieldCheck size={12} />
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
      onClick={onCardClick}
      className={`p-5 rounded-2xl transition-all cursor-pointer relative group flex flex-col gap-3.5 w-full overflow-hidden border ${style.borderColor} ${
        !item.read ? style.cardUnreadBg : style.cardBg
      } ${style.cardHoverEffect} hover:-translate-y-0.5 hover:shadow-xs`}
    >
      <div className="flex items-start gap-4 w-full">
        
        {/* Left Column: Avatar */}
        <div className="relative shrink-0 select-none">
          {item.actorName ? (
            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${avatar.gradientClass}`}>
              {avatar.initials}
            </div>
          ) : (
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${style.iconBg} shadow-sm`}>
              {item.type === "system" ? <FaGithub size={15} /> : <Bell size={15} />}
            </div>
          )}
          {categoryIcon && (
            <div className="absolute -bottom-1 -right-1">
              {categoryIcon}
            </div>
          )}
        </div>

        {/* Middle: Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <div className="flex items-center flex-wrap gap-2">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">{item.title}</h4>
              <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${style.badgeBg}`}>
                {style.badgeText}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-505 font-bold select-none">{item.timestamp}</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{item.description}</p>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 shrink-0 select-none" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onToggleRead}
            className={`p-1.5 rounded-lg border border-transparent transition-all cursor-pointer ${
              !item.read 
                ? "bg-slate-100 hover:bg-slate-200 text-indigo-600 dark:bg-neutral-800 dark:hover:bg-neutral-700" 
                : "bg-slate-50 text-slate-400 hover:text-slate-600 dark:bg-neutral-900 dark:hover:bg-neutral-800"
            }`}
            title={item.read ? "Mark as unread" : "Mark as read"}
          >
            {item.read ? <EyeOff size={11} strokeWidth={2.2} /> : <Eye size={11} strokeWidth={2.2} />}
          </button>

          <button
            onClick={onCardClick}
            className="p-1 hover:bg-slate-100 dark:hover:bg-neutral-800 rounded text-slate-500 transition-transform cursor-pointer"
            style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
            title={isExpanded ? "Collapse" : "Expand Details"}
          >
            <ChevronDown size={14} />
          </button>

          <button
            onClick={onDelete}
            className="p-1.5 hover:bg-slate-105 dark:hover:bg-neutral-800 rounded text-slate-400 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
            title="Delete notification"
          >
            <Trash2 size={12} strokeWidth={2.2} />
          </button>
        </div>

      </div>

      {/* Expanded detail section */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden w-full"
          >
            {renderCardContent()}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
