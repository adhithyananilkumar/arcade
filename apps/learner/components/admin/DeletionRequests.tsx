'use client';

import { useState, useEffect } from 'react';
import { Channel, ChannelDeletionRequestDto, channelService } from "@/domains/channels";
import { Check, X, AlertTriangle, ShieldCheck, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from "@/domains/identity";
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/design-system/ui/dialog';

export function DeletionRequests() {
  const [requests, setRequests] = useState<ChannelDeletionRequestDto[]>([]);
  const [pipelineChannels, setPipelineChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ChannelDeletionRequestDto | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PERSONAL' | 'ORGANIZATION'>('ALL');
  const [approveForce, setApproveForce] = useState(false);

  const [hardDeleteTarget, setHardDeleteTarget] = useState<Channel | null>(null);
  const [hardDeleteReason, setHardDeleteReason] = useState('');
  const [hardDeleteConfirmText, setHardDeleteConfirmText] = useState('');
  const [hardDeleteAcknowledged, setHardDeleteAcknowledged] = useState(false);
  const [hardDeleteSubmitting, setHardDeleteSubmitting] = useState(false);

  const { hasPermission } = usePermissions();
  const { user } = useAuthStore();
  const canReview = hasPermission('platform.channels.manage');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const [requestsData, allChannels] = await Promise.all([
        channelService.getPendingDeletionRequests(),
        channelService.getAllChannels(),
      ]);
      setRequests(requestsData);
      // "In the deletion pipeline" = already suspended and waiting out the grace period (or
      // already unlisted, if forced) — distinct from a still-pending, not-yet-reviewed request.
      setPipelineChannels(allChannels.filter((c) => c.status === 'SUSPENDED'));
    } catch (error) {
      toast.error('Failed to load deletion requests');
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      await channelService.reactivateChannel(id);
      toast.success('Channel reactivated');
      fetchRequests();
    } catch (error) {
      toast.error('Failed to reactivate channel');
    }
  };

  const openHardDeleteDialog = (channel: Channel) => {
    setHardDeleteTarget(channel);
    setHardDeleteReason('');
    setHardDeleteConfirmText('');
    setHardDeleteAcknowledged(false);
  };

  const confirmHardDelete = async () => {
    if (!hardDeleteTarget) return;
    if (!hardDeleteReason.trim()) {
      toast.error('A reason is required to permanently delete a channel');
      return;
    }
    if (hardDeleteConfirmText !== hardDeleteTarget.name) {
      toast.error('Type the channel name exactly to confirm');
      return;
    }
    if (!hardDeleteAcknowledged) {
      toast.error('You must acknowledge the consequences before proceeding');
      return;
    }
    setHardDeleteSubmitting(true);
    try {
      await channelService.hardDeleteChannel(hardDeleteTarget.id, hardDeleteReason.trim(), hardDeleteConfirmText);
      toast.success('Channel and all its content have been permanently deleted');
      setHardDeleteTarget(null);
      fetchRequests();
    } catch (error) {
      toast.error('Failed to permanently delete channel');
    } finally {
      setHardDeleteSubmitting(false);
    }
  };

  const handleReview = async (id: string, action: 'APPROVE' | 'REJECT', force: boolean = false) => {
    try {
      await channelService.reviewDeletionRequest(id, action, force);
      toast.success(
        action === 'REJECT'
          ? 'Request rejected'
          : force
            ? 'Deletion approved — content unlisted immediately'
            : 'Deletion approved — content will be unlisted within 6 months'
      );
      setSelectedRequest(null);
      setApproveForce(false);
      fetchRequests();
    } catch (error) {
      toast.error('Failed to review request');
    }
  };

  const openReview = (req: ChannelDeletionRequestDto) => {
    setSelectedRequest(req);
    setApproveForce(false);
  };

  if (!canReview) return null;

  if (loading) return <div className="text-sm text-gray-500">Loading requests...</div>;

  const filteredRequests = (Array.isArray(requests) ? requests : []).filter(req => {
    if (filter === 'PERSONAL') return req.isPersonal;
    if (filter === 'ORGANIZATION') return !req.isPersonal;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-3">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <AlertTriangle className="text-red-500" size={20} />
          Pending Deletion Requests
          <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">{filteredRequests.length}</span>
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${filter === 'ALL' ? 'bg-red-600 text-white shadow-sm' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
          >
            All Requests
          </button>
          <button 
            onClick={() => setFilter('PERSONAL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${filter === 'PERSONAL' ? 'bg-red-600 text-white shadow-sm' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
          >
            Personal Channels
          </button>
          <button 
            onClick={() => setFilter('ORGANIZATION')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${filter === 'ORGANIZATION' ? 'bg-red-600 text-white shadow-sm' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
          >
            Organization Channels
          </button>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-sm text-gray-500 py-4">No deletion requests found.</div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div key={req.id} className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50/30 hover:bg-red-50 transition-colors cursor-pointer" onClick={() => openReview(req)}>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-600 overflow-hidden shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    {req.channelName}
                    <span className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[10px] text-gray-600 uppercase font-bold tracking-wide shadow-sm">
                      {req.isPersonal ? 'Personal' : 'Organization'}
                    </span>
                  </h4>
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <span>Requested by: {req.requestedByName}</span>
                    <span>•</span>
                    <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">{req.reason}</p>
                </div>
              </div>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => openReview(req)}
                  className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  title="Review Deletion Request"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => handleReview(req.id, 'REJECT')}
                  className="p-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Reject"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-1">
          <Clock className="text-amber-500" size={20} />
          Channels in Deletion Pipeline
          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">{pipelineChannels.length}</span>
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Suspended channels currently waiting out their grace period (or already unlisted, if
          forced) before their content disappears from public listings. Reactivate to cancel the
          deletion, or force hard delete to skip straight to permanent removal.
        </p>

        {pipelineChannels.length === 0 ? (
          <div className="text-sm text-gray-500 py-4">No channels currently in the deletion pipeline.</div>
        ) : (
          <div className="space-y-4">
            {pipelineChannels.map((channel) => (
              <div key={channel.id} className="flex items-center justify-between p-4 rounded-xl border border-amber-100 bg-amber-50/30">
                <div>
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    {channel.name}
                    <span className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[10px] text-gray-600 uppercase font-bold tracking-wide shadow-sm">
                      {channel.isPersonal ? 'Personal' : 'Organization'}
                    </span>
                    {channel.forcedSuspension && (
                      <span className="px-1.5 py-0.5 rounded bg-red-100 border border-red-200 text-[10px] text-red-700 uppercase font-bold tracking-wide">
                        Forced — already unlisted
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">Owner: {channel.ownerName}</p>
                  {channel.suspensionReason && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">{channel.suspensionReason}</p>
                  )}
                  {!channel.forcedSuspension && channel.contentUnlistDate && (
                    <p className="text-xs text-amber-700 mt-1 font-semibold">
                      Content unlists on {new Date(channel.contentUnlistDate).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => handleReactivate(channel.id)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                    title="Reactivate channel"
                  >
                    <ShieldCheck size={14} /> Reactivate
                  </button>
                  <button
                    onClick={() => openHardDeleteDialog(channel)}
                    className="flex items-center gap-1.5 text-xs font-semibold text-white bg-red-700 px-3 py-1.5 rounded-lg hover:bg-red-800 transition-colors"
                    title="Force hard delete"
                  >
                    <Trash2 size={14} /> Force Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="max-w-md p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-600 flex items-center gap-2">
              <AlertTriangle size={20} />
              Review Deletion Request
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6 mt-4">
              <div>
                <h4 className="text-sm font-bold text-gray-900">Channel</h4>
                <p className="text-base text-gray-700">{selectedRequest.channelName}</p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900">Requested By</h4>
                <p className="text-base text-gray-700">{selectedRequest.requestedByName}</p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900">Reason for Deletion</h4>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mt-1">
                  <p className="text-sm text-gray-700">{selectedRequest.reason}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Phone</h4>
                  <p className="text-sm text-gray-700">{selectedRequest.phoneNumber}</p>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Email</h4>
                  <p className="text-sm text-gray-700">{selectedRequest.email}</p>
                </div>
              </div>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-red-100 bg-red-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={approveForce}
                  onChange={(e) => setApproveForce(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-red-600"
                />
                <span className="text-sm text-gray-700">
                  <span className="font-bold text-red-700">Force delete</span> — unlist this
                  channel's content immediately, for safety/policy-violation cases. Leave
                  unchecked for the standard approval, where content stays publicly visible for
                  up to 6 months.
                </span>
              </label>

              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button
                  onClick={() => handleReview(selectedRequest.id, 'APPROVE', approveForce)}
                  className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold text-sm shadow-sm"
                >
                  <Check size={18} /> {approveForce ? 'Force Approve Deletion' : 'Approve Deletion'}
                </button>
                <button
                  onClick={() => handleReview(selectedRequest.id, 'REJECT')}
                  className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-sm"
                >
                  <X size={18} /> Reject
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!hardDeleteTarget} onOpenChange={(open) => !open && setHardDeleteTarget(null)}>
        <DialogContent className="max-w-md p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-700 flex items-center gap-2">
              <AlertTriangle size={20} /> Permanently Delete Channel
            </DialogTitle>
          </DialogHeader>

          {hardDeleteTarget && (
            <div className="space-y-5 mt-4">
              <div className="space-y-2 p-4 rounded-xl border-2 border-red-200 bg-red-50">
                <p className="text-sm font-bold text-red-800">This cannot be undone.</p>
                <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                  <li>Every course, roadmap, and workshop under this channel is deleted immediately — not soft-deleted, not recoverable.</li>
                  <li>There is no 6-month grace period, unlike the standard suspend/deletion-request flow.</li>
                  <li>Learners already enrolled in this channel's content lose access immediately.</li>
                  <li>Staff, roles, and pending invitations for this channel are also removed.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900">Channel</h4>
                <p className="text-base text-gray-700">{hardDeleteTarget.name}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900" htmlFor="pipeline-hard-delete-reason">
                  Reason (recorded in the permanent audit log)
                </label>
                <textarea
                  id="pipeline-hard-delete-reason"
                  value={hardDeleteReason}
                  onChange={(e) => setHardDeleteReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                  placeholder="e.g. Legal takedown, GDPR erasure request, severe policy violation..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900" htmlFor="pipeline-hard-delete-confirm">
                  Type <span className="font-mono text-red-700">{hardDeleteTarget.name}</span> to confirm
                </label>
                <input
                  id="pipeline-hard-delete-confirm"
                  type="text"
                  value={hardDeleteConfirmText}
                  onChange={(e) => setHardDeleteConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all font-mono"
                  autoComplete="off"
                />
              </div>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hardDeleteAcknowledged}
                  onChange={(e) => setHardDeleteAcknowledged(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-red-700"
                />
                <span className="text-sm text-gray-700">
                  I understand this permanently deletes the channel and all its content, and that
                  enrolled learners will immediately lose access.
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={confirmHardDelete}
                  disabled={
                    hardDeleteSubmitting ||
                    hardDeleteConfirmText !== hardDeleteTarget.name ||
                    !hardDeleteAcknowledged ||
                    !hardDeleteReason.trim()
                  }
                  className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-red-700 text-white rounded-xl hover:bg-red-800 transition-colors font-semibold text-sm shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 size={18} /> {hardDeleteSubmitting ? 'Deleting...' : 'Permanently Delete'}
                </button>
                <button
                  onClick={() => setHardDeleteTarget(null)}
                  className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-sm"
                >
                  <X size={18} /> Cancel
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
