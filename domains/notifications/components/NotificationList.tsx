'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { NotificationDto } from '../api/notification.service';
import { channelService } from '@/domains/channels';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { queryClient } from '@/infrastructure/state/queryClient';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface NotificationListProps {
  notifications: NotificationDto[];
  onItemClick?: (notification: NotificationDto) => void;
  onNotificationAction?: () => void;
  emptyMessage?: string;
}

export type TransferStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED' | 'EXPIRED';

function typeLabel(type: string): string | null {
  switch (type) {
    case 'COURSE_COLLABORATION_INVITATION':
      return 'Collaboration Request';
    case 'COURSE_COLLABORATION_ACCEPTED':
      return 'Collaboration Accepted';
    case 'COURSE_COLLABORATION_DECLINED':
      return 'Collaboration Declined';
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
    case 'REACH_US':
      return 'Reach Us';
    case 'CONTENT_REPORTED':
      return 'Content Report';
    default:
      return null;
  }
}

function typeTone(type: string): string {
  switch (type) {
    case 'COURSE_COLLABORATION_INVITATION':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'COURSE_COLLABORATION_ACCEPTED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'COURSE_COLLABORATION_DECLINED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'OWNER_TRANSFER_REQUESTED':
      return 'bg-amber-50 text-amber-800 border-amber-300';
    case 'OWNER_TRANSFER_ACCEPTED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'OWNER_TRANSFER_DECLINED':
    case 'OWNER_TRANSFER_CANCELLED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'CONTENT_APPROVED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'CONTENT_CHANGES_REQUESTED':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'CONTENT_SUBMITTED':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    case 'REACH_US':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'CONTENT_REPORTED':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
}

function getNotificationTargetUrl(n: NotificationDto): string | null {
  let metadataObj: any = null;
  if (n.metadata) {
    try {
      metadataObj = typeof n.metadata === 'string' ? JSON.parse(n.metadata) : n.metadata;
    } catch {
      metadataObj = null;
    }
  }

  const messageId = metadataObj?.contactMessageId || metadataObj?.messageId || metadataObj?.reportId || metadataObj?.id;

  if (n.type === 'REACH_US') {
    return messageId ? `/console/inbox?tab=reach-us&messageId=${messageId}` : '/console/inbox?tab=reach-us';
  }

  if (n.type === 'CONTENT_REPORTED') {
    return messageId ? `/console/inbox?tab=reports&reportId=${messageId}` : '/console/inbox?tab=reports';
  }

  const lowerTitle = (n.title || '').toLowerCase();
  const lowerMessage = (n.message || '').toLowerCase();

  if (lowerTitle.includes('reach us') || lowerMessage.includes('reach us')) {
    return messageId ? `/console/inbox?tab=reach-us&messageId=${messageId}` : '/console/inbox?tab=reach-us';
  }

  if (lowerTitle.includes('report') || lowerMessage.includes('report')) {
    return messageId ? `/console/inbox?tab=reports&reportId=${messageId}` : '/console/inbox?tab=reports';
  }

  if (n.linkUrl) {
    if (n.linkUrl === '/console/inbox') {
      if (messageId) {
        return `/console/inbox?messageId=${messageId}`;
      }
    }
    return n.linkUrl;
  }

  return null;
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
      <div className="py-12 px-4 text-center select-none">
        <div className="relative w-24 h-24 mx-auto flex items-center justify-center mb-3">
          {/* Detailed SVG representation of the leaves surrounding the bell */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none" fill="none">
            {/* Left Leaf Group (Teal/Green) */}
            <path d="M 22 55 C 16 48, 16 38, 24 32 C 26 40, 24 48, 22 55 Z" fill="#10b981" opacity="0.75" />
            <path d="M 12 42 C 8 36, 12 28, 20 28 C 18 34, 16 38, 12 42 Z" fill="#34d399" opacity="0.65" />
            <path d="M 28 62 C 24 58, 26 52, 32 48 C 30 54, 30 58, 28 62 Z" fill="#059669" opacity="0.5" />
            
            {/* Right Leaf Group (Blue/Indigo) */}
            <path d="M 78 55 C 84 48, 84 38, 76 32 C 74 40, 76 48, 78 55 Z" fill="#3b82f6" opacity="0.75" />
            <path d="M 88 42 C 92 36, 88 28, 80 28 C 82 34, 84 38, 88 42 Z" fill="#60a5fa" opacity="0.65" />
            <path d="M 72 62 C 76 58, 74 52, 68 48 C 70 54, 70 58, 72 62 Z" fill="#2563eb" opacity="0.5" />
          </svg>

          {/* Center circular background with bell icon */}
          <div className="w-16 h-16 rounded-full bg-slate-100/80 border border-slate-200/40 flex items-center justify-center relative z-10">
            <svg viewBox="0 0 24 24" className="w-7 h-7 text-slate-800" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
        </div>

        <h4 className="text-xs font-black text-slate-850 dark:text-slate-200 mb-1">You're all caught up!</h4>
        <p className="text-[10px] text-slate-400 font-semibold max-w-[180px] mx-auto leading-relaxed">
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
            return (
              <div
                key={n.id}
                className={`p-4 transition-colors border-l-4 ${
                  isPending
                    ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/20'
                    : resolvedStatus === 'ACCEPTED'
                    ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                    : resolvedStatus === 'DECLINED' || resolvedStatus === 'CANCELLED'
                    ? 'border-rose-500 bg-rose-50/30 dark:bg-rose-950/20'
                    : 'border-slate-400 bg-slate-50/40 dark:bg-slate-900/20'
                }`}
                onClick={() => onItemClick?.(n)}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                      isPending
                        ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/50 dark:text-amber-300'
                        : resolvedStatus === 'ACCEPTED'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300'
                        : resolvedStatus === 'DECLINED' || resolvedStatus === 'CANCELLED'
                        ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/50 dark:text-rose-300'
                        : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {isPending
                      ? 'Ownership Transfer Request'
                      : resolvedStatus === 'ACCEPTED'
                      ? 'Ownership Transfer Completed'
                      : `Ownership Transfer ${resolvedStatus.charAt(0) + resolvedStatus.slice(1).toLowerCase()}`}
                  </span>
                  {!n.read && <span className="mt-1 h-2 w-2 rounded-full bg-amber-500 shrink-0" />}
                </div>

                <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {currentOwnerName} wants to transfer ownership of {channelName} to you.
                </p>

                {isPending ? (
                  <>
                    <div className="my-2.5 rounded-lg bg-amber-100/70 dark:bg-amber-900/40 p-2.5 text-xs text-amber-950 dark:text-amber-200 space-y-1 border border-amber-200/60">
                      <p className="font-semibold text-[11px] uppercase tracking-wider text-amber-800 dark:text-amber-300">
                        If you accept:
                      </p>
                      <p className="flex items-center gap-1.5">
                        <span className="font-bold">•</span> You become the new channel owner.
                      </p>
                      <p className="flex items-center gap-1.5">
                        <span className="font-bold">•</span> {currentOwnerName} becomes a staff member.
                      </p>
                    </div>

                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-3">
                      {new Date(n.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      {' at '}
                      {new Date(n.createdAt).toLocaleTimeString(undefined, {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        disabled={actionLoadingId === requestId}
                        onClick={(e) => handleDecline(e, requestId, resolvedStatus)}
                        className="flex-1 py-1.5 px-3 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-neutral-800 hover:bg-slate-200 dark:hover:bg-neutral-700 rounded-lg transition-colors border border-slate-300 dark:border-neutral-700 disabled:opacity-50"
                      >
                        Decline
                      </button>
                      <button
                        type="button"
                        disabled={actionLoadingId === requestId}
                        onClick={(e) => handleAccept(e, requestId, resolvedStatus)}
                        className="flex-1 py-1.5 px-3 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-1"
                      >
                        {actionLoadingId === requestId && (
                          <Loader2 size={12} className="animate-spin" />
                        )}
                        Accept Ownership
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="mt-2.5 pt-2 border-t border-black/5 dark:border-white/10">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Ownership Transfer {resolvedStatus.charAt(0) + resolvedStatus.slice(1).toLowerCase()}
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                      This transfer request is no longer active.
                    </p>
                  </div>
                )}
              </div>
            );
          }

          // Current Owner / Requester View
          return (
            <div
              key={n.id}
              className={`p-4 transition-colors border-l-4 ${
                isPending
                  ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/20'
                  : resolvedStatus === 'ACCEPTED'
                  ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20'
                  : 'border-slate-400 bg-slate-50/40 dark:bg-slate-900/20'
              }`}
              onClick={() => onItemClick?.(n)}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span
                  className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                    isPending
                      ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/50 dark:text-amber-300'
                      : resolvedStatus === 'ACCEPTED'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {isPending
                    ? 'Ownership Transfer Requested'
                    : resolvedStatus === 'ACCEPTED'
                    ? 'Ownership Transfer Completed'
                    : `Ownership Transfer ${resolvedStatus.charAt(0) + resolvedStatus.slice(1).toLowerCase()}`}
                </span>
                {!n.read && <span className="mt-1 h-2 w-2 rounded-full bg-amber-500 shrink-0" />}
              </div>

              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-1">
                {isPending
                  ? `Waiting for ${proposedOwnerName} to respond.`
                  : `Ownership transfer for ${channelName} is ${resolvedStatus.toLowerCase()}.`}
              </p>

              {isPending ? (
                <div className="mt-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-500">
                    Status: <span className="font-bold text-amber-700 dark:text-amber-400">Pending</span>
                  </span>
                  <button
                    type="button"
                    disabled={actionLoadingId === requestId}
                    onClick={(e) => handleCancel(e, requestId)}
                    className="py-1 px-2.5 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-md transition-colors border border-rose-200 dark:border-rose-800 disabled:opacity-50 flex items-center gap-1"
                  >
                    {actionLoadingId === requestId && <Loader2 size={12} className="animate-spin" />}
                    Cancel Request
                  </button>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
                  No further action required.
                </p>
              )}
            </div>
          );
        }

        const label = typeLabel(n.type);
        const content = (
          <div
            className={`p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors ${!n.read ? 'bg-indigo-50/50 dark:bg-indigo-500/10' : ''}`}
            onClick={() => onItemClick?.(n)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                {label && (
                  <span
                    className={`mb-1.5 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${typeTone(n.type)}`}
                  >
                    {label}
                  </span>
                )}
                <p className="text-sm text-slate-800 dark:text-slate-200 font-bold">{n.title}</p>
              </div>
              {!n.read && <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500 shrink-0" />}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 break-words">{n.message}</p>
            {n.actorName && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                by {n.actorName}
              </p>
            )}
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
              {new Date(n.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
              {' at '}
              {new Date(n.createdAt).toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </p>
          </div>
        );

        const targetUrl = getNotificationTargetUrl(n);

        return targetUrl ? (
          <Link key={n.id} href={targetUrl} className="block cursor-pointer">
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
