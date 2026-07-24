'use client';

import { useState } from 'react';
import { Channel, channelService } from "@/domains/channels";
import { toast } from 'sonner';
import { Upload, Image as ImageIcon, Loader2, Shield, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';

interface Props {
  channel: Channel;
  onUpdate: (updatedChannel: Channel) => void;
  permissions: string[];
}

// Pure branding/profile editor — staff & role management lives in its own "Staff &
// Permissions" tab, and destructive channel actions live in their own "Danger Zone" tab.
// This dialog only edits what it's named for: the channel's public appearance and details.
export function ChannelSettingsManager({ channel, onUpdate, permissions }: Props) {
  const [description, setDescription] = useState(channel.description || '');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [iconPreview, setIconPreview] = useState<string>(channel.iconUrl || '');
  const [bannerPreview, setBannerPreview] = useState<string>(channel.bannerUrl || '');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const isOwner = user?.id === channel.ownerId;
  const isSuspended = channel.status === 'SUSPENDED';
  const canManageSettings = (isOwner || permissions.includes('channel.settings.manage')) && !isSuspended;

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedChannel = await channelService.updateChannelSettings(
        channel.id,
        description,
        iconFile || undefined,
        bannerFile || undefined
      );
      toast.success('Channel settings updated successfully');
      onUpdate(updatedChannel);
    } catch (error) {
      toast.error('Failed to update channel settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-2xl overflow-hidden max-w-3xl">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Branding & Profile</h2>
          <p className="text-sm text-gray-500">Update your channel's public appearance.</p>
        </div>
        {isSuspended ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
            <AlertTriangle size={12} /> Suspended — Read Only
          </span>
        ) : !canManageSettings && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
            <Shield size={12} /> Read Only
          </span>
        )}
      </div>  
      <div className="p-6 space-y-8">
        <div className="space-y-6">
          {/* Channel Banner */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">Channel Banner</label>
            <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors group">
              {bannerPreview ? (
                <div className="aspect-[4/1] w-full">
                  <img src={bannerPreview} alt="Banner Preview" className="w-full h-full object-cover" />
                  {canManageSettings && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-medium flex items-center gap-2">
                        <Upload size={18} /> Change Banner
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="aspect-[4/1] w-full flex flex-col items-center justify-center text-gray-500">
                  <ImageIcon size={32} className="mb-2 text-gray-400" />
                  <span className="text-sm font-medium">Click to upload banner</span>
                </div>
              )}
              {canManageSettings && (
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleBannerChange} 
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              )}
            </div>
          </div>

          {/* Channel Logo */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">Channel Logo</label>
            <div className="space-y-4">
                {canManageSettings ? (
                  <>
                    <label className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-xl appearance-none cursor-pointer hover:border-indigo-400 focus:outline-none">
                      <span className="flex items-center space-x-2">
                        <Upload className="w-6 h-6 text-gray-400" />
                        <span className="font-medium text-gray-600">
                          Drop files to Attach, or <span className="text-indigo-600 underline">browse</span>
                        </span>
                      </span>
                      <input type="file" name="icon" className="hidden" accept="image/*" onChange={handleIconChange} />
                    </label>
                    <p className="text-xs text-gray-500 text-center">
                      Recommended size: 512x512px. PNG or JPG. Max 2MB.
                    </p>
                  </>
                ) : (
                  <div className="flex items-center justify-center w-full h-32 px-4 bg-gray-50 border-2 border-gray-200 border-dashed rounded-xl">
                    <span className="text-sm text-gray-400">Cannot modify icon</span>
                  </div>
                )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Channel Details</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Channel Name</label>
              <input 
                type="text" 
                value={channel.name} 
                disabled 
                className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-2.5 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!canManageSettings}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="What is your channel about?"
              />
            </div>
          </div>
        </div>
      </div>

      {canManageSettings && (
        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
          </button>
        </div>
      )}
    </form>
  );
}
