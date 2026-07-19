'use client';

import { useState, useEffect } from 'react';
import { Channel, channelService } from '@/services/platform/tenancy/channel.service';
import { Search, Check, X, Tv } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuthStore } from '@/store/auth.store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export function PendingChannels() {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'ALL'>('PENDING');
  const [pendingChannels, setPendingChannels] = useState<Channel[]>([]);
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { hasPermission } = usePermissions();
  const { user } = useAuthStore();
  const hasPlatformRole = user?.roles?.some((r: any) => r.scopeType === 'PLATFORM') || false;
  
  const canApprove = hasPlatformRole || hasPermission('channels.approve');
  const canSuspend = hasPlatformRole || hasPermission('channels.suspend');

  useEffect(() => {
    fetchChannels();
  }, []);

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

  if (loading) return <div className="text-sm text-gray-500">Loading channels...</div>;

  const displayChannels = (activeTab === 'PENDING' ? pendingChannels : allChannels).filter(c => {
    if (!searchQuery) return true;
    const lowerQuery = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(lowerQuery) || c.ownerName.toLowerCase().includes(lowerQuery);
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-end border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'PENDING' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Pending Requests
            {pendingChannels.length > 0 && (
              <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs text-indigo-700">{pendingChannels.length}</span>
            )}
            {activeTab === 'PENDING' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
          </button>
          <button
            onClick={() => setActiveTab('ALL')}
            className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'ALL' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            All Channels
            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{allChannels.length}</span>
            {activeTab === 'ALL' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
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
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 overflow-hidden shrink-0">
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
                    <span className={channel.status === 'ACTIVE' ? 'text-emerald-600' : 'text-amber-600'}>{channel.status}</span>
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
          {activeTab === 'ALL' && channel.status === 'ACTIVE' && (
            <div onClick={(e) => e.stopPropagation()}>
              <a
                href={`/channels/${channel.id}/manage`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                View
              </a>
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
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 overflow-hidden shrink-0 shadow-sm border border-indigo-50">
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
                      selectedChannel.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
