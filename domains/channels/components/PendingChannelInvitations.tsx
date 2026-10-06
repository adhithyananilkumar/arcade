'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Check, X } from 'lucide-react';
import { ChannelStaffService, type ChannelInvitation } from '../api/channel-staff.service';
import { myChannelsKeys } from '../hooks/useMyChannelsQuery';

export const myChannelInvitationsKey = ['my-channel-invitations'] as const;

/**
 * The signed-in user's pending channel staff invitations. One query key shared by every surface
 * that shows them (navbar bell, notifications page), so accepting in one clears the other.
 */
export function useMyChannelInvitations() {
  return useQuery<ChannelInvitation[]>({
    queryKey: myChannelInvitationsKey,
    queryFn: () => ChannelStaffService.getMyInvitations(),
    staleTime: 60 * 1000,
  });
}

interface PendingChannelInvitationsProps {
  /** Called after Accept/Decline is clicked, e.g. to close the dropdown hosting the list. */
  onAction?: () => void;
  /** `compact` for the bell dropdown, `card` for a full page. */
  variant?: 'compact' | 'card';
}

/**
 * Accept/Decline cards for pending channel staff invitations. Renders nothing when there are none.
 * The STAFF_INVITED notification links to a page showing this list — it is the only place an
 * invitee can act on an invitation.
 */
export function PendingChannelInvitations({ onAction, variant = 'compact' }: PendingChannelInvitationsProps) {
  const queryClient = useQueryClient();
  const { data: invitations = [] } = useMyChannelInvitations();

  const refresh = () => queryClient.invalidateQueries({ queryKey: myChannelInvitationsKey });

  const handleAccept = async (id: string) => {
    onAction?.();
    try {
      await ChannelStaffService.acceptInvitation(id);
      toast.success('Invitation accepted! You are now staff.');
      // Accepting makes the user staff somewhere, so the shared channel queries are now stale.
      queryClient.invalidateQueries({ queryKey: myChannelsKeys.workspaces });
    } catch (error) {
      // e.g. expired, channel suspended, already staff — the backend says which.
      toast.error(error instanceof Error ? error.message : 'Failed to accept invitation');
    } finally {
      refresh();
    }
  };

  const handleReject = async (id: string) => {
    onAction?.();
    try {
      await ChannelStaffService.rejectInvitation(id);
      toast.success('Invitation declined.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to decline invitation');
    } finally {
      refresh();
    }
  };

  if (invitations.length === 0) return null;

  const isCard = variant === 'card';

  return (
    <div className={isCard ? 'rounded-2xl border border-indigo-200 bg-indigo-50/40 dark:border-indigo-500/25 dark:bg-indigo-500/10 overflow-hidden' : 'border-b border-slate-950/5'}>
      <p className={`${isCard ? 'px-5 pt-4' : 'px-4 pt-3'} pb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400`}>
        Action Required · Channel invitations
      </p>
      <div className="divide-y divide-slate-950/5">
        {invitations.map((inv) => (
          <div key={inv.id} className={`${isCard ? 'px-5 py-4' : 'p-4'} hover:bg-slate-950/5 transition-colors`}>
            <p className="text-sm text-slate-800 font-medium mb-1">
              Invitation to join <span className="font-bold">{inv.channelName}</span>
            </p>
            <p className="text-xs text-slate-500 mb-1">
              <span className="font-bold text-slate-700">{inv.invitedByName}</span> invited you as{' '}
              <span className="font-bold text-slate-700">{inv.roleNames.join(', ')}</span>.
            </p>
            <p className="text-[11px] text-slate-400 mb-3">
              {new Date(inv.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} at{' '}
              {new Date(inv.createdAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}
              {inv.expiresAt && (
                <> · expires {new Date(inv.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</>
              )}
            </p>
            <div className={`flex gap-2 ${isCard ? 'max-w-xs' : ''}`}>
              <button
                onClick={() => handleAccept(inv.id)}
                className="flex-1 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <Check size={14} /> Accept
              </button>
              <button
                onClick={() => handleReject(inv.id)}
                className="flex-1 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <X size={14} /> Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
