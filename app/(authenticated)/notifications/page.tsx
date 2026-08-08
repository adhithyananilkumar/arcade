"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaLinkedin, FaGithub } from "react-icons/fa";
import { Alex_Brush } from "next/font/google";
import { 
  Bell, 
  User, 
  Trash2, 
  RefreshCw,
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

const alexBrush = Alex_Brush({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

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
}

export default function NotificationsHubPage() {
  // Pre-seed items with human-written, developer-platform notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      type: "roadmap",
      title: "Roadmap Published",
      description: 'Your custom "Full Stack React Developer" roadmap has been reviewed, approved, and published to the discover feed.',
      details: "Admin Review: 'Excellent sequence of state management and testing topics. The layout is clean and learning resources are highly relevant. We have pinned this to the React community dashboard.'",
      actionLabel: "View Live Roadmap",
      timestamp: "10 minutes ago",
      read: false,
      category: "Today"
    },
    {
      id: "2",
      type: "review",
      title: "New Review Request",
      description: "You have a new request to review a submitted branch on the 'Docker Fundamentals' study roadmap.",
      details: "Request details: User 'Sanjay K.' has proposed a new side branch containing 'Kubernetes local setups (Minikube & Kind)' and requested moderator approval to merge it into the central learning path.",
      actionLabel: "Open Review Studio",
      timestamp: "1 hour ago",
      read: false,
      category: "Today"
    },
    {
      id: "3",
      type: "grade",
      title: "Project Evaluated",
      description: "Instructor John Doe graded your 'PostgreSQL Schema Normalization Challenge' submission: 95/100.",
      details: "Instructor Feedback: 'Your tables are perfectly normalized up to 3NF. Good decision to index the foreign keys on the transactions table for query optimizations. Let us look at partitioning options in the next session.'",
      actionLabel: "Open Gradebook",
      timestamp: "3 hours ago",
      read: false,
      category: "Today"
    },
    {
      id: "4",
      type: "comment",
      title: "New Comment on Node",
      description: "Sarah Jenkins left a comment on your roadmap node 'Docker Compose' in the React Hub channel.",
      details: "\"Hey! Quick question: do you recommend using Docker Compose for local microservices development, or should we go ahead and configure a local Kubernetes cluster right from the start?\"",
      actionLabel: "Reply to Comment",
      timestamp: "5 hours ago",
      read: false,
      category: "Today"
    },
    {
      id: "5",
      type: "invite",
      title: "Channel Staff Invite",
      description: "Alex Rivera invited you to join the moderator team for the 'Next.js Study Group' workspace.",
      details: "As a channel moderator, you will be able to manage submitted roadmaps, pin learning resources to nodes, answer student questions, and schedule interactive live review sessions.",
      actionLabel: "Accept Staff Role",
      timestamp: "Yesterday, 6:30 PM",
      read: true,
      category: "Earlier"
    },
    {
      id: "6",
      type: "system",
      title: "GitHub Sync Completed",
      description: "Your workspace profile has successfully synced commits with the GitHub repository 'arcade-learning-hub'.",
      details: "Sync Log:\n- Latest commit: 'refactored roadmap node canvas interactions (#342)'\n- Status: Success\n- Execution time: 2.4 seconds\n- 14 nodes updated.",
      actionLabel: "View Sync Telemetry",
      timestamp: "Yesterday, 10:15 AM",
      read: true,
      category: "Earlier"
    },
    {
      id: "7",
      type: "profile",
      title: "Account Security Log",
      description: "A new authentication login was registered from a new IP location: 192.168.1.144.",
      details: "Security Log Details:\n- Device: Chrome on Windows 11\n- Date/Time: August 7, 2026, 10:14 PM\n- Location: IP 192.168.1.144 (Local Network)\n- Status: Authorized via Session Cookie",
      actionLabel: "Review Device Access Logs",
      timestamp: "2 days ago",
      read: true,
      category: "Earlier"
    }
  ]);

  // Track expanded notification IDs
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  // Vercel-style tab filter: "all" or "unread"
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  // Quick reply input states for comments
  const [replyText, setReplyText] = useState("");

  // Helper functions to retrieve style attributes
  const getTypeStyles = (type: NotificationItem["type"]) => {
    switch (type) {
      case "roadmap":
        return {
          iconBg: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30",
          cardHoverEffect: "hover:shadow-lg hover:shadow-blue-100/40 hover:border-blue-300 dark:hover:border-blue-800",
          cardBg: "bg-gradient-to-br from-white to-blue-50/30 dark:from-neutral-900 dark:to-blue-950/10",
          cardUnreadBg: "bg-gradient-to-br from-blue-50/20 to-blue-100/10 dark:from-blue-950/20 dark:to-blue-900/10",
          leftBar: "bg-gradient-to-b from-blue-500 to-indigo-600",
          btnGradient: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-200/50 dark:shadow-none",
          detailsBg: "bg-blue-50/40 dark:bg-blue-950/30 border border-blue-100/50 dark:border-blue-900/20",
          accentColor: "text-blue-600 dark:text-blue-400",
          badgeBg: "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300",
          badgeText: "ROADMAP",
          borderColor: "border-blue-100 dark:border-blue-900/30",
        };
      case "review":
        return {
          iconBg: "bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30",
          cardHoverEffect: "hover:shadow-lg hover:shadow-purple-100/40 hover:border-purple-300 dark:hover:border-purple-800",
          cardBg: "bg-gradient-to-br from-white to-purple-50/30 dark:from-neutral-900 dark:to-purple-950/10",
          cardUnreadBg: "bg-gradient-to-br from-purple-50/20 to-purple-100/10 dark:from-purple-950/20 dark:to-purple-900/10",
          leftBar: "bg-gradient-to-b from-purple-500 to-fuchsia-600",
          btnGradient: "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white shadow-purple-200/50 dark:shadow-none",
          detailsBg: "bg-purple-50/40 dark:bg-purple-950/30 border border-purple-100/50 dark:border-purple-900/20",
          accentColor: "text-purple-600 dark:text-purple-400",
          badgeBg: "bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-300",
          badgeText: "CODE REVIEW",
          borderColor: "border-purple-100 dark:border-purple-900/30",
        };
      case "grade":
        return {
          iconBg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
          cardHoverEffect: "hover:shadow-lg hover:shadow-emerald-100/40 hover:border-emerald-300 dark:hover:border-emerald-800",
          cardBg: "bg-gradient-to-br from-white to-emerald-50/30 dark:from-neutral-900 dark:to-emerald-950/10",
          cardUnreadBg: "bg-gradient-to-br from-emerald-50/20 to-emerald-100/10 dark:from-emerald-950/20 dark:to-emerald-900/10",
          leftBar: "bg-gradient-to-b from-emerald-500 to-teal-600",
          btnGradient: "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-200/50 dark:shadow-none",
          detailsBg: "bg-emerald-50/40 dark:bg-emerald-950/30 border border-emerald-100/50 dark:border-emerald-900/20",
          accentColor: "text-emerald-600 dark:text-emerald-400",
          badgeBg: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300",
          badgeText: "ACADEMIC GRADE",
          borderColor: "border-emerald-100 dark:border-emerald-900/30",
        };
      case "comment":
        return {
          iconBg: "bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-sky-100 dark:border-sky-900/30",
          cardHoverEffect: "hover:shadow-lg hover:shadow-sky-100/40 hover:border-sky-300 dark:hover:border-sky-800",
          cardBg: "bg-gradient-to-br from-white to-sky-50/30 dark:from-neutral-900 dark:to-sky-950/10",
          cardUnreadBg: "bg-gradient-to-br from-sky-50/20 to-sky-100/10 dark:from-sky-950/20 dark:to-sky-900/10",
          leftBar: "bg-gradient-to-b from-sky-500 to-blue-500",
          btnGradient: "bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white shadow-sky-200/50 dark:shadow-none",
          detailsBg: "bg-sky-50/40 dark:bg-sky-950/30 border border-sky-100/50 dark:border-sky-900/20",
          accentColor: "text-sky-600 dark:text-sky-400",
          badgeBg: "bg-sky-100 dark:bg-sky-900/50 text-sky-850 dark:text-sky-300",
          badgeText: "DISCUSSION",
          borderColor: "border-sky-100 dark:border-sky-900/30",
        };
      case "invite":
        return {
          iconBg: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
          cardHoverEffect: "hover:shadow-lg hover:shadow-amber-100/40 hover:border-amber-300 dark:hover:border-amber-800",
          cardBg: "bg-gradient-to-br from-white to-amber-50/30 dark:from-neutral-900 dark:to-amber-950/10",
          cardUnreadBg: "bg-gradient-to-br from-amber-50/20 to-amber-100/10 dark:from-amber-950/20 dark:to-amber-900/10",
          leftBar: "bg-gradient-to-b from-amber-500 to-orange-500",
          btnGradient: "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-amber-200/50 dark:shadow-none",
          detailsBg: "bg-amber-50/40 dark:bg-amber-950/30 border border-amber-100/50 dark:border-amber-900/20",
          accentColor: "text-amber-600 dark:text-amber-400",
          badgeBg: "bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300",
          badgeText: "COLLABORATION",
          borderColor: "border-amber-100 dark:border-amber-900/30",
        };
      case "system":
        return {
          iconBg: "bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300 border-slate-200 dark:border-neutral-700",
          cardHoverEffect: "hover:shadow-lg hover:shadow-slate-200/40 hover:border-slate-350 dark:hover:border-neutral-600",
          cardBg: "bg-gradient-to-br from-white to-slate-50/30 dark:from-neutral-900 dark:to-neutral-800/10",
          cardUnreadBg: "bg-gradient-to-br from-slate-50/20 to-slate-100/10 dark:from-neutral-800/20 dark:to-neutral-700/10",
          leftBar: "bg-gradient-to-b from-slate-500 to-slate-600",
          btnGradient: "bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white shadow-slate-200/50 dark:shadow-none",
          detailsBg: "bg-slate-100/50 dark:bg-neutral-800/40 border border-slate-200/50 dark:border-neutral-700/20",
          accentColor: "text-slate-800 dark:text-neutral-300",
          badgeBg: "bg-slate-100 dark:bg-neutral-800 text-slate-700 dark:text-neutral-300",
          badgeText: "SYSTEM SYNC",
          borderColor: "border-slate-200 dark:border-neutral-800",
        };
      case "profile":
        return {
          iconBg: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30",
          cardHoverEffect: "hover:shadow-lg hover:shadow-rose-100/40 hover:border-rose-300 dark:hover:border-rose-800",
          cardBg: "bg-gradient-to-br from-white to-rose-50/30 dark:from-neutral-900 dark:to-rose-950/10",
          cardUnreadBg: "bg-gradient-to-br from-rose-50/20 to-rose-100/10 dark:from-rose-950/20 dark:to-rose-900/10",
          leftBar: "bg-gradient-to-b from-rose-500 to-red-600",
          btnGradient: "bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white shadow-rose-200/50 dark:shadow-none",
          detailsBg: "bg-rose-50/40 dark:bg-rose-950/30 border border-rose-100/50 dark:border-rose-900/20",
          accentColor: "text-rose-600 dark:text-rose-400",
          badgeBg: "bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-300",
          badgeText: "SECURITY LOG",
          borderColor: "border-rose-100 dark:border-rose-900/30",
        };
    }
  };

  // Toggle single item read status
  const handleToggleRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    );
  };

  // Card click handler
  const handleCardClick = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Handle Mark all as read
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // Delete notification item
  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setExpandedIds((prev) => prev.filter((x) => x !== id));
  };

  // Clear all notifications
  const handleClearAll = () => {
    setNotifications([]);
    setExpandedIds([]);
  };

  // Seeder helper to reload demo items
  const handleResetDemo = () => {
    setNotifications([
      {
        id: "1",
        type: "roadmap",
        title: "Roadmap Published",
        description: 'Your custom "Full Stack React Developer" roadmap has been reviewed, approved, and published to the discover feed.',
        details: "Admin Review: 'Excellent sequence of state management and testing topics. The layout is clean and learning resources are highly relevant. We have pinned this to the React community dashboard.'",
        actionLabel: "View Live Roadmap",
        timestamp: "10 minutes ago",
        read: false,
        category: "Today"
      },
      {
        id: "2",
        type: "review",
        title: "New Review Request",
        description: "You have a new request to review a submitted branch on the 'Docker Fundamentals' study roadmap.",
        details: "Request details: User 'Sanjay K.' has proposed a new side branch containing 'Kubernetes local setups (Minikube & Kind)' and requested moderator approval to merge it into the central learning path.",
        actionLabel: "Open Review Studio",
        timestamp: "1 hour ago",
        read: false,
        category: "Today"
      },
      {
        id: "3",
        type: "grade",
        title: "Project Evaluated",
        description: "Instructor John Doe graded your 'PostgreSQL Schema Normalization Challenge' submission: 95/100.",
        details: "Instructor Feedback: 'Your tables are perfectly normalized up to 3NF. Good decision to index the foreign keys on the transactions table for query optimizations. Let us look at partitioning options in the next session.'",
        actionLabel: "Open Gradebook",
        timestamp: "3 hours ago",
        read: false,
        category: "Today"
      },
      {
        id: "4",
        type: "comment",
        title: "New Comment on Node",
        description: "Sarah Jenkins left a comment on your roadmap node 'Docker Compose' in the React Hub channel.",
        details: "\"Hey! Quick question: do you recommend using Docker Compose for local microservices development, or should we go ahead and configure a local Kubernetes cluster right from the start?\"",
        actionLabel: "Reply to Comment",
        timestamp: "5 hours ago",
        read: false,
        category: "Today"
      },
      {
        id: "5",
        type: "invite",
        title: "Channel Staff Invite",
        description: "Alex Rivera invited you to join the moderator team for the 'Next.js Study Group' workspace.",
        details: "As a channel moderator, you will be able to manage submitted roadmaps, pin learning resources to nodes, answer student questions, and schedule interactive live review sessions.",
        actionLabel: "Accept Staff Role",
        timestamp: "Yesterday, 6:30 PM",
        read: true,
        category: "Earlier"
      },
      {
        id: "6",
        type: "system",
        title: "GitHub Sync Completed",
        description: "Your workspace profile has successfully synced commits with the GitHub repository 'arcade-learning-hub'.",
        details: "Sync Log:\n- Latest commit: 'refactored roadmap node canvas interactions (#342)'\n- Status: Success\n- Execution time: 2.4 seconds\n- 14 nodes updated.",
        actionLabel: "View Sync Telemetry",
        timestamp: "Yesterday, 10:15 AM",
        read: true,
        category: "Earlier"
      },
      {
        id: "7",
        type: "profile",
        title: "Account Security Log",
        description: "A new authentication login was registered from a new IP location: 192.168.1.144.",
        details: "Security Log Details:\n- Device: Chrome on Windows 11\n- Date/Time: August 7, 2026, 10:14 PM\n- Location: IP 192.168.1.144 (Local Network)\n- Status: Authorized via Session Cookie",
        actionLabel: "Review Device Access Logs",
        timestamp: "2 days ago",
        read: true,
        category: "Earlier"
      }
    ]);
    setExpandedIds([]);
  };

  // Helper function to return icon structure
  const renderNotificationIcon = (type: NotificationItem["type"]) => {
    const style = getTypeStyles(type);
    const iconClass = "group-hover:scale-105 group-hover:rotate-[4deg] transition-all duration-200";
    let iconElement = <Bell size={16} className={iconClass} />;

    switch (type) {
      case "roadmap":
        iconElement = <BookOpen size={16} className={iconClass} />;
        break;
      case "review":
        iconElement = <GitBranch size={16} className={iconClass} />;
        break;
      case "grade":
        iconElement = <CheckSquare size={16} className={iconClass} />;
        break;
      case "comment":
        iconElement = <MessageSquare size={16} className={iconClass} />;
        break;
      case "invite":
        iconElement = <Users size={16} className={iconClass} />;
        break;
      case "system":
        iconElement = <FaGithub size={16} className={iconClass} />;
        break;
      case "profile":
        iconElement = <User size={16} className={iconClass} />;
        break;
    }

    return (
      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${style.iconBg}`}>
        {iconElement}
      </div>
    );
  };

  // Render expanded detail content
  const renderExpandedContent = (item: NotificationItem) => {
    const style = getTypeStyles(item.type);
    const ctaButtonClass = `px-4 py-2 text-[10px] font-bold uppercase tracking-wider transition-all inline-flex items-center gap-1.5 shadow-xs rounded-xl hover:-translate-y-0.5 active:translate-y-0 ${style.btnGradient}`;

    switch (item.type) {
      case "roadmap":
        return (
          <div className="space-y-4 text-left pt-3">
            <div className={`p-4 rounded-xl ${style.detailsBg}`}>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Moderator Review Logs</span>
              <p className="text-[11px] text-slate-750 font-semibold leading-relaxed">
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
          <div className="space-y-4 text-left pt-3">
            <div className={`p-4 rounded-xl ${style.detailsBg}`}>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Review Request Details</span>
              <p className="text-[11px] text-slate-750 font-semibold leading-relaxed">
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
          <div className="space-y-4 text-left pt-3">
            <div className={`p-4 rounded-xl ${style.detailsBg}`}>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Feedback & Notes</span>
              <p className="text-[11px] text-slate-750 font-semibold leading-relaxed">
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
          <div className="space-y-4 text-left pt-3">
            <div className={`p-4 rounded-xl flex gap-3 ${style.detailsBg}`}>
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-655 flex items-center justify-center font-bold text-xs shrink-0 select-none">
                SJ
              </div>
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block">Sarah Jenkins</span>
                <p className="text-[11px] text-slate-700 font-semibold leading-relaxed">
                  {item.details}
                </p>
              </div>
            </div>
            <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type reply to Sarah J..."
                className="flex-1 px-3.5 py-2 text-xs font-semibold bg-slate-50 focus:bg-white rounded-xl focus:outline-none border border-transparent focus:border-slate-200"
              />
              <button
                onClick={() => { if (replyText.trim()) { alert(`Comment sent: ${replyText}`); setReplyText(""); } }}
                className={`px-3.5 text-white rounded-xl text-xs flex items-center justify-center gap-1 transition-colors ${style.btnGradient}`}
              >
                <Send size={12} />
              </button>
            </div>
          </div>
        );

      case "invite":
        return (
          <div className="space-y-4 text-left pt-3">
            <div className={`p-4 rounded-xl ${style.detailsBg}`}>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block mb-1">Staff Requirements</span>
              <p className="text-[11px] text-slate-750 font-semibold leading-relaxed">
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
          <div className="space-y-4 text-left pt-3">
            <div className={`p-4 rounded-xl font-mono text-[10px] text-slate-600 whitespace-pre-line leading-relaxed ${style.detailsBg}`}>
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
          <div className="space-y-4 text-left pt-3">
            <div className={`p-4 rounded-xl font-mono text-[10px] text-slate-600 whitespace-pre-line leading-relaxed ${style.detailsBg}`}>
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

  // Group notifications based on read/unread status if activeTab filter is set
  const filteredNotifications = notifications.filter((item) => {
    if (activeTab === "unread") return !item.read;
    return true;
  });

  // Group notifications into Today and Earlier lists
  const todayItems = filteredNotifications.filter((n) => n.category === "Today");
  const earlierItems = filteredNotifications.filter((n) => n.category === "Earlier");
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-white pt-10 pb-16 text-slate-800">
      
      <style jsx global>{`
        .notification-header {
          width: 100%;
          background: #ffffff;
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

        /* Buttons */

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

          box-shadow:
            0 2px 8px rgba(25, 50, 90, 0.05);

          cursor: pointer;

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            border-color 0.2s ease;
        }

        .action-button:hover {
          transform: translateY(-1px);

          box-shadow:
            0 4px 12px rgba(25, 50, 90, 0.08);

          border-color: #d6e1f0;
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

        /* Responsive */

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

              {/* Double hand-drawn underline */}
              <svg
                className="title-underline"
                viewBox="0 0 430 30"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="underlineGradient">
                    <stop offset="0%" stopColor="#1769FF" />
                    <stop offset="100%" stopColor="#00B894" />
                  </linearGradient>
                </defs>
                <path
                  d="M5 12 C90 8, 180 13, 270 10 C330 8, 380 11, 425 9"
                  className="underline-blue"
                />

                <path
                  d="M8 23 C100 20, 190 23, 280 21 C335 20, 380 22, 425 20"
                  className="underline-gradient"
                />
              </svg>

              <p>
                Stay updated with the latest activity and important updates.
              </p>
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

            <button onClick={handleResetDemo} className="action-button">
              <RotateCcw size={12} strokeWidth={1.8} />
              <span>Reset Demo</span>
            </button>

            {notifications.length > 0 && (
              <button onClick={handleClearAll} className="action-button">
                <Trash2 size={12} strokeWidth={1.8} />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Notifications List aligned with the redesigned header */}
      <div className="notification-content px-4 sm:px-6 mt-4">

        {filteredNotifications.length === 0 ? (
          /* --- BORDERLESS CENTERED CAUGHT UP STATE --- */
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

              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-855 shadow-sm relative z-10">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-slate-800 animate-bounce" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-855">You're all caught up!</h3>
              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                We'll notify you when something new arrives.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="space-y-8 w-full">
            {/* Today List */}
            {todayItems.length > 0 && (
              <div className="space-y-4 w-full">
                <div className="flex items-center justify-between pb-1 select-none w-full">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Today</h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
                    >
                      Mark all as read
                      <CheckCircle2 size={14} className="stroke-[2.5]" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 w-full">
                  <AnimatePresence>
                    {todayItems.map((item) => {
                      const isExpanded = expandedIds.includes(item.id);
                      const style = getTypeStyles(item.type);
                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ x: 50, opacity: 0 }}
                          onClick={() => handleCardClick(item.id)}
                          className={`p-5 rounded-2xl transition-all cursor-pointer relative group flex flex-col gap-3.5 w-full overflow-hidden border ${style.borderColor} ${
                            !item.read ? style.cardUnreadBg : style.cardBg
                          } ${style.cardHoverEffect} hover:-translate-y-0.5 hover:shadow-md`}
                        >
                          {/* Left Accent Bar */}
                          {!item.read && (
                            <div className={`absolute left-0 top-0 bottom-0 w-[4px] rounded-l-2xl ${style.leftBar}`} />
                          )}

                          <div className="flex items-center gap-4 w-full">
                            {renderNotificationIcon(item.type)}

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-black text-slate-900 leading-none">{item.title}</h4>
                                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${style.badgeBg}`}>
                                    {style.badgeText}
                                  </span>
                                </div>
                                <span className="text-[9px] text-slate-400 font-bold select-none">{item.timestamp}</span>
                              </div>
                              <p className="text-[11px] text-slate-550 font-semibold leading-relaxed mt-1">{item.description}</p>
                            </div>

                            {/* Eye checkmark toggle (marked read/unread), accordion, and delete */}
                            <div className="flex items-center gap-2.5 shrink-0 select-none" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={(e) => handleToggleRead(item.id, e)}
                                className={`p-1.5 rounded-lg border border-transparent transition-all ${
                                  !item.read 
                                    ? "bg-slate-50 text-blue-600 hover:bg-blue-50/80" 
                                    : "bg-slate-50 text-slate-400 hover:text-slate-600"
                                }`}
                                title={item.read ? "Mark as unread" : "Mark as read"}
                              >
                                {item.read ? <EyeOff size={12} /> : <Eye size={12} />}
                              </button>

                              <button
                                onClick={() => handleCardClick(item.id)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-transform"
                                style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                                title={isExpanded ? "Collapse" : "Expand Details"}
                              >
                                <ChevronDown size={14} />
                              </button>

                              <button
                                onClick={(e) => handleDeleteItem(item.id, e)}
                                className="p-1.5 hover:bg-slate-100 rounded text-slate-450 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete notification"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Expanded detail section */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="overflow-hidden w-full"
                              >
                                {renderExpandedContent(item)}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* Earlier List */}
            {earlierItems.length > 0 && (
              <div className="space-y-4 w-full">
                <div className="flex items-center justify-between pb-1 select-none w-full">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider">Earlier</h3>
                </div>

                <div className="grid grid-cols-1 gap-3 w-full">
                  <AnimatePresence>
                    {earlierItems.map((item) => {
                      const isExpanded = expandedIds.includes(item.id);
                      const style = getTypeStyles(item.type);
                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ x: 50, opacity: 0 }}
                          onClick={() => handleCardClick(item.id)}
                          className={`p-5 rounded-2xl transition-all cursor-pointer relative group flex flex-col gap-3.5 w-full overflow-hidden border ${style.borderColor} ${
                            !item.read ? style.cardUnreadBg : style.cardBg
                          } ${style.cardHoverEffect} hover:-translate-y-0.5 hover:shadow-md`}
                        >
                          {/* Left Accent Bar */}
                          {!item.read && (
                            <div className={`absolute left-0 top-0 bottom-0 w-[4px] rounded-l-2xl ${style.leftBar}`} />
                          )}

                          <div className="flex items-center gap-4 w-full">
                            {renderNotificationIcon(item.type)}

                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs font-black text-slate-900 leading-none">{item.title}</h4>
                                  <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${style.badgeBg}`}>
                                    {style.badgeText}
                                  </span>
                                </div>
                                <span className="text-[9px] text-slate-400 font-bold select-none">{item.timestamp}</span>
                              </div>
                              <p className="text-[11px] text-slate-550 font-semibold leading-relaxed mt-1">{item.description}</p>
                            </div>

                            {/* Eye checkmark toggle (marked read/unread), accordion, and delete */}
                            <div className="flex items-center gap-2.5 shrink-0 select-none" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={(e) => handleToggleRead(item.id, e)}
                                className={`p-1.5 rounded-lg border border-transparent transition-all ${
                                  !item.read 
                                    ? "bg-slate-50 text-blue-600 hover:bg-blue-55/80" 
                                    : "bg-slate-55 text-slate-400 hover:text-slate-650"
                                }`}
                                title={item.read ? "Mark as unread" : "Mark as read"}
                              >
                                {item.read ? <EyeOff size={12} /> : <Eye size={12} />}
                              </button>

                              <button
                                onClick={() => handleCardClick(item.id)}
                                className="p-1 hover:bg-slate-100 rounded text-slate-500 transition-transform"
                                style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                                title={isExpanded ? "Collapse" : "Expand Details"}
                              >
                                <ChevronDown size={14} />
                              </button>

                              <button
                                onClick={(e) => handleDeleteItem(item.id, e)}
                                className="p-1.5 hover:bg-slate-100 rounded text-slate-450 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Delete notification"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Expanded detail section */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                                className="overflow-hidden w-full"
                              >
                                {renderExpandedContent(item)}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
