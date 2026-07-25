'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Channel, ChannelDeletionRequestDto, channelService } from "@/domains/channels";
import { toast } from 'sonner';
import { Tv, Upload, Settings, Users, BarChart3, Video, Loader2, ArrowLeft, LayoutGrid, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { ChannelSettingsManager } from './ChannelSettingsManager';
import { ChannelStaffManager } from './ChannelStaffManager';
import { ChannelDangerZone } from './ChannelDangerZone';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/design-system/ui/dialog';
import { useAuthStore } from '@/infrastructure/auth/auth.store';

type ManageTab = 'OVERVIEW' | 'STAFF' | 'DANGER';

export default function ManageChannelPage() {
  const params = useParams();
  const router = useRouter();
  const channelId = params.id as string;
  const { user } = useAuthStore();

  const [channel, setChannel] = useState<Channel | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [pendingDeletionRequest, setPendingDeletionRequest] = useState<ChannelDeletionRequestDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ManageTab>('OVERVIEW');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    if (channelId) {
      fetchChannel();
    }
  }, [channelId]);

  const fetchChannel = async () => {
    try {
      setLoading(true);
      const [channelData, perms, myDeletionRequests] = await Promise.all([
        channelService.getChannel(channelId),
        channelService.getMyChannelPermissions(channelId),
        channelService.getMyDeletionRequests().catch(() => [])
      ]);
      setChannel(channelData);
      setPermissions(perms);
      setPendingDeletionRequest(
        myDeletionRequests.find((r) => r.channelId === channelId && r.status === 'PENDING') || null
      );
    } catch (error) {
      toast.error('Failed to load channel details');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!channel) return null;

  const isSuspended = channel.status === 'SUSPENDED';
  // Backend locks all mutations (settings/staff/roles/content) the moment a deletion request is
  // submitted, before any admin has reviewed it — see ChannelStatusGuard. The UI should reflect
  // that the same way it reflects a suspension, rather than letting the owner hit a surprise
  // 403 on submit.
  const isLocked = isSuspended || !!pendingDeletionRequest;
  // Content creation needs the actual channel.videos.upload permission (or owner's implicit
  // ALL) — bare access to this manage page doesn't imply that, so the button must reflect it.
  const canCreateContent = permissions.includes('ALL') || permissions.includes('channel.videos.upload');

  return (
    <div className="w-full space-y-8 pb-12">
      <button
        onClick={() => router.push('/')}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </button>

      {!isSuspended && pendingDeletionRequest && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-bold text-amber-700">Deletion request pending review</h3>
            <p className="text-sm text-amber-700 mt-0.5">
              You requested to delete this channel on{' '}
              {new Date(pendingDeletionRequest.createdAt).toLocaleDateString()}. Until a
              platform administrator reviews it, no settings, staff, role, or content changes
              can be made.
            </p>
          </div>
        </div>
      )}

      {isSuspended && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
          <AlertTriangle className="text-red-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h3 className="font-bold text-red-700">This channel is suspended</h3>
            <p className="text-sm text-red-600 mt-0.5">
              {channel.suspensionReason || 'A platform administrator has suspended this channel.'}
              {' '}No settings, staff, or role changes can be made until it is reactivated.
              {' '}
              {channel.forcedSuspension ? (
                <strong>Its content has already been unlisted from public discovery.</strong>
              ) : channel.contentUnlistDate ? (
                <>Its content will remain publicly visible until{' '}
                  <strong>{new Date(channel.contentUnlistDate).toLocaleDateString()}</strong>, after which it will be unlisted.</>
              ) : null}
            </p>
          </div>
        </div>
      )}

      {/* Channel Banner & Header (YouTube Style) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl bg-white shadow-sm border border-gray-100"
      >
        {/* Banner */}
        {channel.bannerUrl ? (
          <div className="h-48 w-full">
            <img src={channel.bannerUrl} alt={`${channel.name} banner`} className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="h-48 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
        )}
        
        {/* Profile Info */}
        <div className="px-4 sm:px-8 pb-8">
          <div className="flex flex-col md:flex-row gap-6 md:items-end md:justify-between -mt-12 mb-6">
            <div className="flex flex-col md:flex-row gap-6 md:items-end flex-1">
              <div className="h-24 w-24 sm:h-32 sm:w-32 shrink-0 overflow-hidden rounded-full border-4 border-white bg-indigo-50 flex items-center justify-center shadow-md">
                {channel.iconUrl ? (
                  <img src={channel.iconUrl} alt={channel.name} className="h-full w-full object-cover" />
                ) : (
                  <Tv size={48} className="text-indigo-300" />
                )}
              </div>
              
              <div className="flex-1 space-y-1">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{channel.name}</h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 font-medium">
                  <span>{channel.ownerName}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>{channel.isPersonal ? 'Personal Channel' : 'Organization Channel'}</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Created {new Date(channel.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            <div className="flex shrink-0 gap-3 mt-4 md:mt-0 flex-wrap">
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-2 rounded-xl bg-gray-100 px-5 py-2.5 text-sm font-bold text-gray-700 transition-colors hover:bg-gray-200"
              >
                <Settings size={18} />
                Settings
              </button>
              {canCreateContent && (
                <button
                  onClick={() => router.push('/studio')}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow"
                >
                  <Upload size={18} />
                  Create Content
                </button>
              )}
            </div>
          </div>
          
          <div className="max-w-3xl">
            <h3 className="font-semibold text-gray-900 mb-2">About this channel</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {channel.description || 'No description provided.'}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Tabs Menu */}
      <div className="flex gap-1 rounded-2xl border border-gray-100 bg-gray-50/60 p-1.5 mt-8 mb-6 w-fit">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
            activeTab === 'OVERVIEW' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <LayoutGrid size={16} />
          Overview
        </button>
        {/* Individual channels have a single, all-powerful owner and nothing to delegate —
            only org channels get a Staff & Permissions tab. */}
        {!channel.isPersonal && (
          <button
            onClick={() => setActiveTab('STAFF')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === 'STAFF' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Users size={16} />
            Staff & Permissions
          </button>
        )}
        {user?.id === channel.ownerId && (
          <button
            onClick={() => setActiveTab('DANGER')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === 'DANGER' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-red-600'
            }`}
          >
            <AlertTriangle size={16} />
            Danger Zone
          </button>
        )}
      </div>

      {activeTab === 'OVERVIEW' ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {canCreateContent && (
            <div
              onClick={() => router.push('/studio')}
              className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex items-center gap-4 cursor-pointer hover:border-indigo-200 hover:shadow transition-all group"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
                <Video size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Content</h4>
                <p className="text-sm text-gray-500">Manage videos and courses</p>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex items-center gap-4 cursor-pointer hover:border-indigo-200 hover:shadow transition-all group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <BarChart3 size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Analytics</h4>
              <p className="text-sm text-gray-500">View channel performance</p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm flex items-center gap-4 cursor-pointer hover:border-indigo-200 hover:shadow transition-all group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Community</h4>
              <p className="text-sm text-gray-500">Manage comments & members</p>
            </div>
          </div>
        </motion.div>
      ) : activeTab === 'STAFF' ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ChannelStaffManager channelId={channelId} permissions={permissions} isSuspended={isLocked} />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ChannelDangerZone channel={channel} />
        </motion.div>
      )}

      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Channel Settings</DialogTitle>
          </DialogHeader>
          <ChannelSettingsManager channel={channel} onUpdate={setChannel} permissions={permissions} locked={isLocked} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
