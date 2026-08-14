'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { NotificationDto } from '../api/notification.service';
import { channelService } from '@/domains/channels';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { queryClient } from '@/infrastructure/state/queryClient';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface NotificationListProps {
  notifications: NotificationDto[];
  onItemClick?: (notification: NotificationDto) => void;
  onNotificationAction?: () => void;
  emptyMessage?: string;
}

export type TransferStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'EXPIRED';

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

function typeTone(type: string): string {
  switch (type) {
    case 'OWNER_TRANSFER_REQUESTED':
      return 'bg-[#fef7e0] text-[#b06000] border-[#feebc8] dark:bg-[#b06000]/20 dark:text-[#fdd663] dark:border-[#b06000]/30';
    case 'OWNER_TRANSFER_ACCEPTED':
      return 'bg-[#e6f4ea] text-[#137333] border-[#ceead6] dark:bg-[#137333]/20 dark:text-[#81c995] dark:border-[#137333]/30';
    case 'OWNER_TRANSFER_DECLINED':
    case 'OWNER_TRANSFER_CANCELLED':
      return 'bg-[#fce8e6] text-[#c5221f] border-[#fad2cf] dark:bg-[#c5221f]/20 dark:text-[#f28b82] dark:border-[#c5221f]/30';
    case 'CONTENT_APPROVED':
      return 'bg-[#e6f4ea] text-[#137333] border-[#ceead6] dark:bg-[#137333]/20 dark:text-[#81c995] dark:border-[#137333]/30';
    case 'CONTENT_CHANGES_REQUESTED':
      return 'bg-[#fef7e0] text-[#b06000] border-[#feebc8] dark:bg-[#b06000]/20 dark:text-[#fdd663] dark:border-[#b06000]/30';
    case 'CONTENT_SUBMITTED':
      return 'bg-[#e8f0fe] text-[#1a73e8] border-[#d2e3fc] dark:bg-[#1a73e8]/20 dark:text-[#8ab4f8] dark:border-[#1a73e8]/30';
    default:
      return 'bg-[#f1f3f4] text-[#3c4043] border-[#e8eaed] dark:bg-[#3c4043]/20 dark:text-[#bdc1c6] dark:border-[#3c4043]/30';
  }
}

function getAvatarProps(name?: string) {
  const cleanName = (name || 'System').trim();
  const parts = cleanName.split(/\s+/);
  let initials = '';
  if (parts.length >= 2) {
    initials = (parts[0][0] + parts[1][0]).toUpperCase();
  } else if (cleanName.length > 0) {
    initials = cleanName.slice(0, 2).toUpperCase();
  } else {
    initials = 'SYS';
  }

  let hash = 0;
  for (let i = 0; i < cleanName.length; i++) {
    hash = cleanName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % 6;

  const colors = [
    'bg-[#1a73e8]', // Google Blue
    'bg-[#1e8e3e]', // Google Green
    'bg-[#d93025]', // Google Red
    'bg-[#e37400]', // Google Yellow/Orange
    'bg-[#3f51b5]', // Indigo
    'bg-[#9c27b0]'  // Purple
  ];

  return {
    initials,
    gradientClass: colors[idx]
  };
}

function formatNotificationDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' at ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function getCategoryIcon(type: string) {
  switch (type) {
    case 'CONTENT_APPROVED':
    case 'OWNER_TRANSFER_ACCEPTED':
      return (
        <span className="w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-900 flex items-center justify-center shadow-md">
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </span>
      );
    case 'CONTENT_CHANGES_REQUESTED':
      return (
        <span className="w-4 h-4 rounded-full bg-amber-500 ring-2 ring-white dark:ring-neutral-900 flex items-center justify-center shadow-md">
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </span>
      );
    case 'OWNER_TRANSFER_REQUESTED':
      return (
        <span className="w-4 h-4 rounded-full bg-amber-500 ring-2 ring-white dark:ring-neutral-900 flex items-center justify-center shadow-md">
          <svg className="w-2 h-2 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="9" cy="7" r="4"/><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/></svg>
        </span>
      );
    case 'CONTENT_SUBMITTED':
      return (
        <span className="w-4 h-4 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-neutral-900 flex items-center justify-center shadow-md">
          <svg className="w-2 h-2 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </span>
      );
    case 'CHANNEL_APPROVED':
      return (
        <span className="w-4 h-4 rounded-full bg-blue-500 ring-2 ring-white dark:ring-neutral-900 flex items-center justify-center shadow-md">
          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>
        </span>
      );
    case 'CHANNEL_REJECTED':
      return (
        <span className="w-4 h-4 rounded-full bg-rose-500 ring-2 ring-white dark:ring-neutral-900 flex items-center justify-center shadow-md">
          <svg className="w-2 h-2 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </span>
      );  default:
      return null;
  }
}

export function NotificationList({
  notifications,
  onItemClick,
  onNotificationAction,
  emptyMessage,
}: NotificationListProps) {
  const { user } = useAuthStore();
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [transferStatuses, setTransferStatuses] = useState<Record<string, TransferStatus>>({});
  const checkedRequestIdsRef = useRef<Set<string>>(new Set());

  // Verify live transfer status from backend ONCE per requestId to prevent API loops
  useEffect(() => {
    const uncheckedNotifications = notifications.filter((n) => {
      if (n.type !== 'OWNER_TRANSFER_REQUESTED') return false;
      let metadataObj: any = null;
      try {
        metadataObj = typeof n.metadata === 'string' ? JSON.parse(n.metadata) : n.metadata;
      } catch {
        return false;
      }
      const requestId = metadataObj?.requestId;
      const channelId = metadataObj?.channelId;
      return Boolean(channelId && requestId && !checkedRequestIdsRef.current.has(requestId));
    });

    if (uncheckedNotifications.length === 0) return;

    uncheckedNotifications.forEach(async (n) => {
      let metadataObj: any = null;
      try {
        metadataObj = typeof n.metadata === 'string' ? JSON.parse(n.metadata) : n.metadata;
      } catch {
        metadataObj = null;
      }
      const channelId = metadataObj?.channelId;
      const requestId = metadataObj?.requestId;
      if (channelId && requestId) {
        checkedRequestIdsRef.current.add(requestId);
        try {
          const statusResp = await channelService.getOwnershipTransferStatus(channelId);
          if (statusResp) {
            setTransferStatuses((prev) => ({
              ...prev,
              [requestId]: statusResp.status as TransferStatus,
            }));
          } else {
            setTransferStatuses((prev) => ({ ...prev, [requestId]: 'EXPIRED' }));
          }
        } catch {
          // Silently retain last known status
        }
      }
    });
  }, [notifications]);

  if (notifications.length === 0) {
    return (
      <div className="py-14 px-6 text-center select-none">
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center mb-4">
          {/* Detailed SVG representation of the leaves surrounding the bell with staggered waves */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none opacity-85" fill="none">
            {/* Left Leaf Group (Teal/Green) - Staggered soundwave propagation */}
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
            
            {/* Right Leaf Group (Blue/Indigo) - Staggered soundwave propagation */}
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

          {/* Center circular background with realistic bell body & clapper swing animation */}
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              boxShadow: ["0 2px 4px -1px rgb(0 0 0 / 0.05)", "0 6px 10px -3px rgb(59 130 246 / 0.1)", "0 2px 4px -1px rgb(0 0 0 / 0.05)"]
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              ease: "easeInOut"
            }}
            className="w-16 h-16 rounded-full bg-slate-50 dark:bg-neutral-800 border border-slate-200/40 dark:border-neutral-700/40 flex items-center justify-center relative z-10 shadow-sm"
          >
            <svg viewBox="0 0 24 24" className="w-7 h-7 overflow-visible text-slate-700 dark:text-slate-350" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
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

        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">You're all caught up!</h4>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold max-w-[185px] mx-auto leading-relaxed">
          {emptyMessage || "We'll notify you when something new arrives."}
        </p>
      </div>
    );
  }

  const handleAccept = async (e: React.MouseEvent, requestId: string, currentStatus: TransferStatus) => {
    e.stopPropagation();
    e.preventDefault();
    if (currentStatus !== 'PENDING') return;

    try {
      setActionLoadingId(requestId);
      await channelService.acceptOwnershipTransfer(requestId);
      setTransferStatuses((prev) => ({ ...prev, [requestId]: 'ACCEPTED' }));
      toast.success('Ownership transferred successfully.');
      queryClient.invalidateQueries();
      onNotificationAction?.();
    } catch (error: any) {
      const msg = error.message || 'Failed to accept ownership transfer.';
      if (
        msg.toLowerCase().includes('pending') ||
        msg.toLowerCase().includes('expired') ||
        msg.toLowerCase().includes('not found')
      ) {
        setTransferStatuses((prev) => ({ ...prev, [requestId]: 'ACCEPTED' }));
        onNotificationAction?.();
      } else {
        toast.error(msg);
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDecline = async (e: React.MouseEvent, requestId: string, currentStatus: TransferStatus) => {
    e.stopPropagation();
    e.preventDefault();
    if (currentStatus !== 'PENDING') return;

    try {
      setActionLoadingId(requestId);
      await channelService.declineOwnershipTransfer(requestId);
      setTransferStatuses((prev) => ({ ...prev, [requestId]: 'DECLINED' }));
      toast.success('Ownership transfer declined.');
      queryClient.invalidateQueries();
      onNotificationAction?.();
    } catch (error: any) {
      const msg = error.message || 'Failed to decline ownership transfer.';
      if (
        msg.toLowerCase().includes('pending') ||
        msg.toLowerCase().includes('expired') ||
        msg.toLowerCase().includes('not found')
      ) {
        setTransferStatuses((prev) => ({ ...prev, [requestId]: 'DECLINED' }));
        onNotificationAction?.();
      } else {
        toast.error(msg);
      }
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (e: React.MouseEvent, requestId: string) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      setActionLoadingId(requestId);
      await channelService.cancelOwnershipTransfer(requestId);
      setTransferStatuses((prev) => ({ ...prev, [requestId]: 'CANCELLED' }));
      toast.success('Ownership transfer request cancelled.');
      queryClient.invalidateQueries();
      onNotificationAction?.();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel ownership transfer request.');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Build a map of resolved statuses from terminal notification types OR metadata
  const terminalResolvedStatuses: Record<string, TransferStatus> = {};
  notifications.forEach((n) => {
    let metadataObj: any = null;
    try {
      metadataObj = typeof n.metadata === 'string' ? JSON.parse(n.metadata) : n.metadata;
    } catch {}
    const rId = metadataObj?.requestId;
    if (rId) {
      if (n.type === 'OWNER_TRANSFER_ACCEPTED') terminalResolvedStatuses[rId] = 'ACCEPTED';
      if (n.type === 'OWNER_TRANSFER_DECLINED') terminalResolvedStatuses[rId] = 'DECLINED';
      if (n.type === 'OWNER_TRANSFER_CANCELLED') terminalResolvedStatuses[rId] = 'CANCELLED';
    }
  });

  // Filter out redundant pending notifications when a terminal status notification exists for the same requestId
  const filteredNotifications = notifications.filter((n) => {
    let metadataObj: any = null;
    try {
      metadataObj = typeof n.metadata === 'string' ? JSON.parse(n.metadata) : n.metadata;
    } catch {}
    const rId = metadataObj?.requestId;
    if (n.type === 'OWNER_TRANSFER_REQUESTED' && rId && terminalResolvedStatuses[rId]) {
      return false; // Skip stale pending notification if a terminal update exists
    }
    return true;
  });

  // Deduplicate notifications per ID
  const uniqueNotifications = filteredNotifications.filter(
    (n, idx, arr) => arr.findIndex((x) => x.id === n.id) === idx
  );

  return (
    <div className="divide-y divide-black/5 dark:divide-white/5">
      {uniqueNotifications.map((n) => {
        let metadataObj: any = null;
        if (n.metadata) {
          try {
            metadataObj = typeof n.metadata === 'string' ? JSON.parse(n.metadata) : n.metadata;
          } catch {
            metadataObj = null;
          }
        }

        const isOwnerTransferRequest = n.type === 'OWNER_TRANSFER_REQUESTED';
        const requestId = metadataObj?.requestId;
        const currentOwnerId = metadataObj?.currentOwnerId;
        const currentOwnerName = metadataObj?.currentOwnerName || n.actorName || 'The current owner';
        const channelName = metadataObj?.channelName ? `"${metadataObj.channelName}"` : 'the channel';
        const proposedOwnerId = metadataObj?.proposedOwnerId;
        const proposedOwnerName = metadataObj?.proposedOwnerName || 'the proposed owner';

        const isProposedOwner = Boolean(proposedOwnerId && user?.id && user.id === proposedOwnerId);
        const isCurrentOwner = Boolean(currentOwnerId && user?.id && user.id === currentOwnerId) || (!isProposedOwner);

        const resolvedStatus: TransferStatus =
          transferStatuses[requestId] || terminalResolvedStatuses[requestId] || metadataObj?.status || 'PENDING';

        // Actionable card for OWNER_TRANSFER_REQUESTED
        if (isOwnerTransferRequest && requestId) {
          const isPending = resolvedStatus === 'PENDING';

          // Proposed Owner View
          if (isProposedOwner) {
            const avatar = getAvatarProps(currentOwnerName);
            return (
              <div
                key={n.id}
                className={`p-4 transition-all duration-200 border-l-4 ${
                  isPending
                    ? 'border-amber-500 bg-amber-500/[0.02] dark:bg-amber-500/[0.05]'
                    : resolvedStatus === 'ACCEPTED'
                    ? 'border-emerald-500 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.05]'
                    : 'border-rose-500 bg-rose-500/[0.02] dark:bg-rose-500/[0.05]'
                }`}
                onClick={() => onItemClick?.(n)}
              >
                <div className="flex gap-3">
                  {/* Left Column: Avatar */}
                  <div className="relative shrink-0 select-none">
                    <div className={`h-9 w-9 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${avatar.gradientClass}`}>
                      {avatar.initials}
                    </div>
                    <div className="absolute -bottom-1 -right-1">
                      {getCategoryIcon(n.type)}
                    </div>
                  </div>

                  {/* Middle/Content Column */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          isPending
                            ? 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-355 dark:border-amber-500/30'
                            : resolvedStatus === 'ACCEPTED'
                            ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-350 dark:border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:text-rose-350 dark:border-rose-500/30'
                        }`}
                      >
                        {isPending
                          ? 'Ownership Transfer'
                          : resolvedStatus === 'ACCEPTED'
                          ? 'Transfer Completed'
                          : `Transfer ${resolvedStatus.charAt(0) + resolvedStatus.slice(1).toLowerCase()}`}
                      </span>
                      {!n.read && (
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                        </span>
                      )}
                    </div>

                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-snug">
                      {currentOwnerName} wants to transfer ownership of {channelName} to you.
                    </p>

                    {isPending ? (
                      <>
                        <div className="my-2.5 rounded-lg bg-amber-500/[0.04] dark:bg-amber-500/[0.08] p-2.5 text-[11px] text-slate-650 dark:text-slate-355 space-y-1.5 border border-amber-500/10 leading-relaxed">
                          <p className="font-bold text-[10px] uppercase tracking-wider text-amber-700 dark:text-amber-400">
                            If you accept:
                          </p>
                          <p className="flex items-center gap-1.5">
                            <span className="text-amber-500 font-bold">•</span> You become the new channel owner.
                          </p>
                          <p className="flex items-center gap-1.5">
                            <span className="text-amber-500 font-bold">•</span> {currentOwnerName} becomes a staff member.
                          </p>
                        </div>

                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-3">
                          {formatNotificationDate(n.createdAt)}
                        </p>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={actionLoadingId === requestId}
                            onClick={(e) => handleDecline(e, requestId, resolvedStatus)}
                            className="flex-1 py-1.5 px-3 text-[11px] font-bold text-slate-655 dark:text-slate-300 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 rounded-lg border border-slate-200/50 dark:border-neutral-700/50 transition-colors disabled:opacity-50 cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            type="button"
                            disabled={actionLoadingId === requestId}
                            onClick={(e) => handleAccept(e, requestId, resolvedStatus)}
                            className="flex-1 py-1.5 px-3 text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1 cursor-pointer"
                          >
                            {actionLoadingId === requestId && (
                              <Loader2 size={10} className="animate-spin" />
                            )}
                            Accept
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="mt-2.5 pt-2 border-t border-black/5 dark:border-white/5">
                        <p className="text-[11px] font-bold text-slate-650 dark:text-slate-300">
                          Transfer Request {resolvedStatus.charAt(0) + resolvedStatus.slice(1).toLowerCase()}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                          This request is no longer active.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          // Current Owner / Requester View
          const avatar = getAvatarProps(proposedOwnerName);
          return (
            <div
              key={n.id}
              className={`p-4 transition-all duration-200 border-l-4 ${
                isPending
                  ? 'border-amber-500 bg-amber-500/[0.02] dark:bg-amber-500/[0.05]'
                  : resolvedStatus === 'ACCEPTED'
                  ? 'border-emerald-500 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.05]'
                  : 'border-slate-400 bg-slate-500/[0.02] dark:bg-slate-500/[0.05]'
              }`}
              onClick={() => onItemClick?.(n)}
            >
              <div className="flex gap-3">
                {/* Left Column: Avatar */}
                <div className="relative shrink-0 select-none">
                  <div className={`h-9 w-9 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ${avatar.gradientClass}`}>
                    {avatar.initials}
                  </div>
                  <div className="absolute -bottom-1 -right-1">
                    {getCategoryIcon(n.type)}
                  </div>
                </div>

                {/* Middle/Content Column */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span
                      className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        isPending
                          ? 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-350 dark:border-amber-500/30'
                          : resolvedStatus === 'ACCEPTED'
                          ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-355 dark:border-emerald-500/30'
                          : 'bg-slate-500/10 text-slate-700 border-slate-500/20 dark:text-slate-350 dark:border-slate-500/30'
                      }`}
                    >
                      {isPending
                        ? 'Ownership Transfer Pending'
                        : resolvedStatus === 'ACCEPTED'
                        ? 'Transfer Completed'
                        : `Transfer ${resolvedStatus.charAt(0) + resolvedStatus.slice(1).toLowerCase()}`}
                    </span>
                    {!n.read && (
                      <span className="relative flex h-2 w-2 shrink-0">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-snug">
                    {isPending
                      ? `Waiting for ${proposedOwnerName} to respond.`
                      : `Ownership transfer for ${channelName} is ${resolvedStatus.toLowerCase()}.`}
                  </p>

                  {isPending ? (
                    <div className="mt-3 flex items-center justify-between gap-2 pt-1 border-t border-black/[0.03] dark:border-white/[0.03]">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Status: <span className="text-amber-700 dark:text-amber-400">Pending</span>
                      </span>
                      <button
                        type="button"
                        disabled={actionLoadingId === requestId}
                        onClick={(e) => handleCancel(e, requestId)}
                        className="py-1 px-2.5 text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-955/40 hover:bg-rose-105 dark:hover:bg-rose-900/40 rounded-md border border-rose-200 dark:border-rose-800 transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                      >
                        {actionLoadingId === requestId && <Loader2 size={10} className="animate-spin" />}
                        Cancel Request
                      </button>
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">
                      No further action required.
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        }

        const label = typeLabel(n.type);
        const avatar = getAvatarProps(n.actorName);
        const categoryIcon = getCategoryIcon(n.type);
        const content = (
          <div
            className={`p-4 transition-all duration-150 hover:bg-slate-50 dark:hover:bg-neutral-800/40 cursor-pointer flex items-start gap-3 relative ${
              !n.read 
                ? 'bg-[#e8f0fe]/50 dark:bg-[#1a2e4d]/30' 
                : 'bg-transparent'
            }`}
            onClick={() => onItemClick?.(n)}
          >
            {/* Left Column: Avatar with deterministic background */}
            <div className="relative shrink-0 select-none">
              {n.actorName ? (
                <div className={`h-9 w-9 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm ring-2 ring-white/60 dark:ring-neutral-805/60 ${avatar.gradientClass}`}>
                  {avatar.initials}
                </div>
              ) : (
                <div className="h-9 w-9 rounded-full flex items-center justify-center bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-neutral-700/50 shadow-sm ring-2 ring-white/60 dark:ring-neutral-805/60">
                  <svg className="w-4 h-4 text-slate-500 dark:text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                </div>
              )}
              {categoryIcon && (
                <div className="absolute -bottom-1 -right-1">
                  {categoryIcon}
                </div>
              )}
            </div>

            {/* Middle/Content Column */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  {label && (
                    <span
                      className={`mb-1.5 inline-flex rounded-md border px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${typeTone(n.type)}`}
                    >
                      {label}
                    </span>
                  )}
                  <p className="text-xs font-semibold text-[#1f1f1f] dark:text-[#e3e3e3] leading-snug">{n.title}</p>
                </div>
                {!n.read && (
                  <span className="relative flex h-2 w-2 shrink-0 mt-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1a73e8]/75 dark:bg-[#8ab4f8]/75 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1a73e8] dark:bg-[#8ab4f8]"></span>
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#444746] dark:text-[#c4c7c5] mt-0.5 leading-relaxed">{n.message}</p>
              {n.actorName && (
                <p className="text-[10px] text-[#444746] dark:text-[#c4c7c5] mt-1">
                  by <span className="font-semibold text-[#1f1f1f] dark:text-[#e3e3e3]">{n.actorName}</span>
                </p>
              )}
              <span className="text-[10px] text-[#5f6368] dark:text-[#9aa0a6] mt-1.5 block">
                {formatNotificationDate(n.createdAt)}
              </span>
            </div>
          </div>
        );

        return n.linkUrl ? (
          <Link key={n.id} href={n.linkUrl} className="block cursor-pointer">
            {content}
          </Link>
        ) : (
          <div key={n.id} className="cursor-pointer">
            {content}
          </div>
        );
      })}
    </div>
  );
}
