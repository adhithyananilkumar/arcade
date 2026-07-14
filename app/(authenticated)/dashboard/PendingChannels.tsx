'use client';

import { useState, useEffect } from 'react';
import { Channel, channelService } from '@/services/channel.service';
import { Check, X, Tv } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuthStore } from '@/store/auth.store';

export function PendingChannels() {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'ALL'>('PENDING');
  const [pendingChannels, setPendingChannels] = useState<Channel[]>([]);
  const [allChannels, setAllChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { hasPermission } = usePermissions();
  const { user } = useAuthStore();
  const isSuperUser = user?.roles?.some((r: any) => r.name === 'SUPER_USER') || false;
  
  const canApprove = isSuperUser || hasPermission('channels.approve');
  const canSuspend = isSuperUser || hasPermission('channels.suspend');

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

  const displayChannels = activeTab === 'PENDING' ? pendingChannels : allChannels;

  return (
    <div className="space-y-6">
      <div className="flex gap-4 border-b border-gray-200">
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

      {displayChannels.length === 0 ? (
        <div className="text-sm text-gray-500">No channels found.</div>
      ) : (
        <div className="space-y-4">
      {displayChannels.map((channel) => (
        <div key={channel.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 overflow-hidden">
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
            <div className="flex gap-2">
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
            <a
              href={`/channels/${channel.id}/manage`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              View
            </a>
          )}
        </div>
      ))}
      </div>
    )}
    </div>
  );
}
