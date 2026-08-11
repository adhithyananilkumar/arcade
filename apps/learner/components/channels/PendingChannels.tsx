'use client';

import { useState, useEffect } from 'react';
import { Channel, ChannelContentItem, channelService } from "@/domains/channels";
import { Search, Check, X, Tv, ShieldOff, ShieldCheck, BookOpen, AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from "@/domains/identity";
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/design-system/ui/dialog';

export function PendingChannels() {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'ALL'>('PENDING');
  const [pendingChannels, setPendingChannels] = useState<Channel[]>([]);
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suspendTarget, setSuspendTarget] = useState<Channel | null>(null);
  const [suspendReason, setSuspendReason] = useState('');
  const [suspendForce, setSuspendForce] = useState(false);
  const [channelContent, setChannelContent] = useState<ChannelContentItem[]>([]);
  const [contentLoading, setContentLoading] = useState(false);
  const [hardDeleteTarget, setHardDeleteTarget] = useState<Channel | null>(null);
  const [hardDeleteReason, setHardDeleteReason] = useState('');
  const [hardDeleteConfirmText, setHardDeleteConfirmText] = useState('');
  const [hardDeleteAcknowledged, setHardDeleteAcknowledged] = useState(false);
  const [hardDeleteSubmitting, setHardDeleteSubmitting] = useState(false);

  const { hasPermission } = usePermissions();
  const { user } = useAuthStore();
  const canApprove = hasPermission('platform.channels.manage');
  const canSuspend = hasPermission('platform.channels.manage');

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    if (!selectedChannel) {
      setChannelContent([]);
      return;
    }
    setContentLoading(true);
    channelService
      .getChannelContent(selectedChannel.id)
      .then(setChannelContent)
      .catch(() => toast.error('Failed to load channel content'))
      .finally(() => setContentLoading(false));
  }, [selectedChannel]);

  const fetchChannels = async () => {
    try {
      setLoading(true);
      const [pendingData, allData] = await Promise.all([
        channelService.getPendingRequests(),
        channelService.getAllChannels()
      ]);
      setPendingChannels(pendingData);
      setAllChannels(allData);
    } catch (error) {
      toast.error('Failed to load channels');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await channelService.acceptChannelRequest(id);
      toast.success('Channel request accepted');
      fetchChannels();
    } catch (error) {
      toast.error('Failed to accept request');
    }
  };

  const handleReject = async (id: string) => {
    try {
      await channelService.deleteChannelRequest(id);
      toast.success('Channel request deleted');
      fetchChannels();
    } catch (error) {
      toast.error('Failed to delete request');
    }
  };

  const openSuspendDialog = (channel: Channel) => {
    setSuspendTarget(channel);
    setSuspendReason('');
    setSuspendForce(false);
  };

  const confirmSuspend = async () => {
    if (!suspendTarget) return;
    if (!suspendReason.trim()) {
      toast.error('A reason is required to suspend a channel');
      return;
    }
    try {
      await channelService.suspendChannel(suspendTarget.id, suspendReason.trim(), suspendForce);
      toast.success(
        suspendForce
          ? 'Channel suspended — content unlisted immediately'
          : 'Channel suspended — content will be unlisted within 6 months'
      );
      setSuspendTarget(null);
      setSelectedChannel(null);
      fetchChannels();
    } catch (error) {
      toast.error('Failed to suspend channel');
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
      setSelectedChannel(null);
      fetchChannels();
    } catch (error) {
      toast.error('Failed to permanently delete channel');
    } finally {
      setHardDeleteSubmitting(false);
    }
  };

  const handleReactivate = async (id: string) => {
    try {
      await channelService.reactivateChannel(id);
      toast.success('Channel reactivated');
      fetchChannels();
    } catch (error) {
      toast.error('Failed to reactivate channel');
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Loading channels...</div>;

  const displayChannels = (activeTab === 'PENDING' ? pendingChannels : allChannels).filter(c => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(lowerQuery) || c.ownerName.toLowerCase().includes(lowerQuery);
  });

  return (
    <div className="space-y-6">
      <div className="sticky top-[48px] z-10 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-end border-b border-gray-200 bg-white/80 backdrop-blur-md pt-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'PENDING' ? 'text-[#14142b]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Pending Requests
            {pendingChannels.length > 0 && (
              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-[#14142b]">{pendingChannels.length}</span>
            )}
            {activeTab === 'PENDING' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#14142b] rounded-t-full" />}
          </button>
          <button
            onClick={() => setActiveTab('ALL')}
            className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'ALL' ? 'text-[#14142b]' : 'text-gray-500 hover:text-gray-700'}`}
          >
            All Channels
            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{allChannels.length}</span>
            {activeTab === 'ALL' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#14142b] rounded-t-full" />}
          </button>
        </div>

        {canApprove && (
          <div className="relative w-full sm:w-64 pb-2 sm:pb-3">
            <div className="absolute inset-y-0 left-0 pl-3 pb-2 sm:pb-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent transition-all"
            />
          </div>
        )}
      </div>

      {displayChannels.length === 0 ? (
        <div className="text-sm text-gray-500">No channels found.</div>
      ) : (
        <div className="space-y-4">
      {displayChannels.map((channel) => (
        <div key={channel.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-100/80 transition-colors cursor-pointer" onClick={() => setSelectedChannel(channel)}>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-[#14142b] overflow-hidden shrink-0">
              {channel.iconUrl ? (
                <img src={channel.iconUrl} alt={channel.name} className="h-full w-full object-cover" />
              ) : (
                <Tv size={24} />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{channel.name}</h4>
              <p className="text-xs text-gray-500 flex items-center gap-2">
                <span>{channel.isPersonal ? 'Personal' : 'Organization'}</span>
                <span>•</span>
                <span>Owner: {channel.ownerName}</span>
                {activeTab === 'ALL' && (
                  <>
                    <span>•</span>
                    <span className={
                      channel.status === 'ACTIVE' ? 'text-emerald-600' :
                      channel.status === 'SUSPENDED' ? 'text-red-600' : 'text-amber-600'
                    }>{channel.status}</span>
                  </>
                )}
              </p>
              {channel.description && <p className="text-sm text-gray-600 mt-1 line-clamp-1">{channel.description}</p>}
            </div>
          </div>
          {activeTab === 'PENDING' && (
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              {canApprove && (
                <button
                  onClick={() => handleAccept(channel.id)}
                  className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                  title="Accept"
                >
                  <Check size={18} />
                </button>
              )}
              {canSuspend && (
                <button
                  onClick={() => handleReject(channel.id)}
                  className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  title="Delete"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          )}
          {activeTab === 'ALL' && (channel.status === 'ACTIVE' || channel.status === 'SUSPENDED') && (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
              <a
                href={`/channels/${channel.id}/manage`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#14142b] bg-slate-100 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                View
              </a>
              {canSuspend && channel.status === 'ACTIVE' && (
                <button
                  onClick={() => openSuspendDialog(channel)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                  title="Suspend channel"
                >
                  <ShieldOff size={14} /> Suspend
                </button>
              )}
              {canSuspend && channel.status === 'SUSPENDED' && (
                <button
                  onClick={() => handleReactivate(channel.id)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                  title="Reactivate channel"
                >
                  <ShieldCheck size={14} /> Reactivate
                </button>
              )}
            </div>
          )}
        </div>
      ))}
      </div>
    )}

      <Dialog open={!!selectedChannel} onOpenChange={(open) => !open && setSelectedChannel(null)}>
        <DialogContent className="max-w-md p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl">Channel Details</DialogTitle>
          </DialogHeader>
          
          {selectedChannel && (
            <div className="space-y-8 mt-6">
              <div className="flex items-center gap-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-[#14142b] overflow-hidden shrink-0 shadow-sm border border-slate-100">
                  {selectedChannel.iconUrl ? (
                    <img src={selectedChannel.iconUrl} alt={selectedChannel.name} className="h-full w-full object-cover" />
                  ) : (
                    <Tv size={36} />
                  )}
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gray-900 leading-tight">{selectedChannel.name}</h3>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                      {selectedChannel.isPersonal ? 'Personal' : 'Organization'}
                    </span>
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      selectedChannel.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                      selectedChannel.status === 'SUSPENDED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {selectedChannel.status}
                    </span>
                  </div>
                </div>
              </div>

              {selectedChannel.description && (
                <div className="space-y-2 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <h4 className="text-sm font-bold text-gray-900">Description</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedChannel.description}</p>
                </div>
              )}

              {selectedChannel.status === 'SUSPENDED' && selectedChannel.suspensionReason && (
                <div className="space-y-2 bg-red-50 p-4 rounded-xl border border-red-100">
                  <h4 className="text-sm font-bold text-red-700">Suspension Reason</h4>
                  <p className="text-sm text-red-600 leading-relaxed">{selectedChannel.suspensionReason}</p>
                </div>
              )}

              <div className="space-y-4 pt-6 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-900">Owner Information</h4>
                <div className="grid grid-cols-2 gap-6 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <span className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Name</span>
                    <span className="text-base font-semibold text-gray-900">{selectedChannel.ownerName}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Email</span>
                    <span className="text-base font-semibold text-gray-900 break-all">{selectedChannel.ownerEmail || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Phone Number</span>
                    <span className="text-base font-semibold text-gray-900">{selectedChannel.ownerPhone || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Created On</span>
                    <span className="text-base font-semibold text-gray-900">
                      {new Date(selectedChannel.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              {selectedChannel.status !== 'PENDING' && (
                <div className="space-y-4 pt-6 border-t border-gray-100">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <BookOpen size={16} className="text-gray-400" /> Content
                    {channelContent.length > 0 && (
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-bold text-gray-500">{channelContent.length}</span>
                    )}
                  </h4>
                  {contentLoading ? (
                    <p className="text-sm text-gray-400">Loading content...</p>
                  ) : channelContent.length === 0 ? (
                    <p className="text-sm text-gray-400">No content under this channel.</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {channelContent.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-3 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{item.title}</p>
                            <p className="text-xs text-gray-500">{item.type}</p>
                          </div>
                          <span className={`shrink-0 text-[10px] font-bold px-2 py-1 rounded-lg border ${
                            item.status.toUpperCase() === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            item.status.toUpperCase() === 'DRAFT' ? 'bg-gray-100 text-gray-500 border-gray-200' :
                            item.status.toUpperCase() === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' :
                            'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {item.status.replace(/_/g, ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {selectedChannel.status === 'PENDING' && (
                <div className="flex gap-3 pt-6 border-t border-gray-100">
                  {canApprove && (
                    <button
                      onClick={() => {
                        handleAccept(selectedChannel.id);
                        setSelectedChannel(null);
                      }}
                      className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold text-sm shadow-sm"
                    >
                      <Check size={18} /> Approve Channel
                    </button>
                  )}
                  {canSuspend && (
                    <button
                      onClick={() => {
                        handleReject(selectedChannel.id);
                        setSelectedChannel(null);
                      }}
                      className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-semibold text-sm"
                    >
                      <X size={18} /> Reject
                    </button>
                  )}
                </div>
              )}

              {canSuspend && selectedChannel.status === 'ACTIVE' && (
                <div className="flex gap-3 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => openSuspendDialog(selectedChannel)}
                    className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors font-semibold text-sm"
                  >
                    <ShieldOff size={18} /> Suspend Channel
                  </button>
                </div>
              )}

              {canSuspend && selectedChannel.status === 'SUSPENDED' && (
                <div className="flex gap-3 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => {
                      handleReactivate(selectedChannel.id);
                      setSelectedChannel(null);
                    }}
                    className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-semibold text-sm shadow-sm"
                  >
                    <ShieldCheck size={18} /> Reactivate Channel
                  </button>
                </div>
              )}

              {canSuspend && (selectedChannel.status === 'ACTIVE' || selectedChannel.status === 'SUSPENDED') && (
                <div className="space-y-3 pt-6 border-t-2 border-dashed border-red-200">
                  <h4 className="text-sm font-bold text-red-700 flex items-center gap-2">
                    <AlertTriangle size={16} /> Danger Zone
                  </h4>
                  <p className="text-xs text-gray-500">
                    Permanently and immediately delete this channel and everything it owns. This
                    bypasses the standard suspend/grace-period flow entirely — there is no undo.
                  </p>
                  <button
                    onClick={() => openHardDeleteDialog(selectedChannel)}
                    className="w-full flex justify-center items-center gap-2 px-4 py-3 bg-red-700 text-white rounded-xl hover:bg-red-800 transition-colors font-semibold text-sm shadow-sm"
                  >
                    <Trash2 size={18} /> Force Hard Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!suspendTarget} onOpenChange={(open) => !open && setSuspendTarget(null)}>
        <DialogContent className="max-w-md p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-600 flex items-center gap-2">
              <ShieldOff size={20} /> Suspend Channel
            </DialogTitle>
          </DialogHeader>

          {suspendTarget && (
            <div className="space-y-6 mt-4">
              <div>
                <h4 className="text-sm font-bold text-gray-900">Channel</h4>
                <p className="text-base text-gray-700">{suspendTarget.name}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900" htmlFor="suspend-reason">
                  Reason (shown to the owner/staff)
                </label>
                <textarea
                  id="suspend-reason"
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  placeholder="e.g. Policy violation, billing dispute..."
                />
              </div>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-red-100 bg-red-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={suspendForce}
                  onChange={(e) => setSuspendForce(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-red-600"
                />
                <span className="text-sm text-gray-700">
                  <span className="font-bold text-red-700">Force suspend</span> — unlist this
                  channel's content immediately, for safety/policy-violation takedowns. Leave
                  unchecked for a standard suspend, where content stays publicly visible for up
                  to 6 months.
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={confirmSuspend}
                  className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold text-sm shadow-sm"
                >
                  <ShieldOff size={18} /> {suspendForce ? 'Force Suspend' : 'Suspend Channel'}
                </button>
                <button
                  onClick={() => setSuspendTarget(null)}
                  className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-sm"
                >
                  <X size={18} /> Cancel
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
                  <li>There is no 6-month grace period, unlike a normal suspend.</li>
                  <li>Learners already enrolled in this channel's content lose access immediately.</li>
                  <li>Staff, roles, and pending invitations for this channel are also removed.</li>
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900">Channel</h4>
                <p className="text-base text-gray-700">{hardDeleteTarget.name}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900" htmlFor="hard-delete-reason">
                  Reason (recorded in the permanent audit log)
                </label>
                <textarea
                  id="hard-delete-reason"
                  value={hardDeleteReason}
                  onChange={(e) => setHardDeleteReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition-all"
                  placeholder="e.g. Legal takedown, GDPR erasure request, severe policy violation..."
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-900" htmlFor="hard-delete-confirm">
                  Type <span className="font-mono text-red-700">{hardDeleteTarget.name}</span> to confirm
                </label>
                <input
                  id="hard-delete-confirm"
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
