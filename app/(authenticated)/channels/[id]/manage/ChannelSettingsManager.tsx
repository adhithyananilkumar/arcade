'use client';

import { useState } from 'react';
import { Channel, channelService } from "@/domains/channels";
import { toast } from 'sonner';
import { Upload, Image as ImageIcon, Loader2, AlertTriangle, Info, X, Shield } from 'lucide-react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/design-system/ui/dialog';
import { ChannelStaffManager } from './ChannelStaffManager';

interface Props {
  channel: Channel;
  onUpdate: (updatedChannel: Channel) => void;
  permissions: string[];
}

export function ChannelSettingsManager({ channel, onUpdate, permissions }: Props) {
  const [description, setDescription] = useState(channel.description || '');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  
  const [iconPreview, setIconPreview] = useState<string>(channel.iconUrl || '');
  const [bannerPreview, setBannerPreview] = useState<string>(channel.bannerUrl || '');
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const isOwner = user?.id === channel.ownerId;
  const canManageSettings = isOwner || permissions.includes('channel.settings.manage');

  // Deletion state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deletePhone, setDeletePhone] = useState(user?.mobileNumber || channel.ownerPhone || '');
  const [deleteEmail, setDeleteEmail] = useState(user?.email || channel.ownerEmail || '');
  const [deleteDeclaration, setDeleteDeclaration] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteDeclaration) {
      toast.error('You must accept the declaration to proceed.');
      return;
    }
    try {
      setDeleteLoading(true);
      await channelService.submitDeletionRequest(channel.id, deleteReason, deletePhone, deleteEmail);
      toast.success('Channel deletion request submitted successfully');
      setIsDeleteModalOpen(false);
      // Optional: Redirect or refresh
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit deletion request');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="pb-16">
    <form onSubmit={handleSubmit} className="border border-gray-200 rounded-2xl overflow-hidden max-w-3xl">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Branding & Profile</h2>
          <p className="text-sm text-gray-500">Update your channel's public appearance.</p>
        </div>
        {!canManageSettings && (
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

    {!channel.isPersonal && (
      <div className="mt-12 border-t border-gray-100 pt-8">
        <ChannelStaffManager channelId={channel.id} permissions={permissions} />
      </div>
    )}

    {isOwner && (
      <div className="mt-12 border-t border-red-100 pt-8 max-w-3xl">
        <h3 className="text-lg font-bold text-red-600 mb-1 flex items-center gap-2">
          <AlertTriangle size={20} />
          Danger Zone
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Irreversible actions for your channel.
        </p>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-semibold text-gray-900">Delete this channel</h4>
            <p className="text-sm text-gray-600 mt-1">Once deleted, your channel will be suspended and content ownership will be transferred.</p>
          </div>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="shrink-0 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
          >
            Request Deletion
          </button>
        </div>
      </div>
    )}

    <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle className="text-xl text-red-600 flex items-center gap-2">
            <AlertTriangle size={20} />
            Request Channel Deletion
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleDeleteSubmit} className="space-y-5 mt-4">
          <div className="rounded-xl bg-blue-50 p-4 border border-blue-100 flex gap-3">
            <Info className="text-blue-600 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-blue-800">
              Your content ownership will be transferred to arcade management and you won't be able to manage your uploaded contents.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Reason for Deletion</label>
            <textarea 
              required
              value={deleteReason}
              onChange={e => setDeleteReason(e.target.value)}
              rows={3}
              placeholder="Why are you deleting this channel?"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
            <input 
              required
              type="tel"
              value={deletePhone}
              onChange={e => setDeletePhone(e.target.value)}
              placeholder="+1 234 567 8900"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input 
              required
              type="email"
              value={deleteEmail}
              onChange={e => setDeleteEmail(e.target.value)}
              placeholder="owner@example.com"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer mt-2 group">
            <div className="flex h-5 items-center">
              <input 
                type="checkbox" 
                checked={deleteDeclaration}
                onChange={e => setDeleteDeclaration(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-600 cursor-pointer"
              />
            </div>
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
              I understand that this action can't be undone.
            </span>
          </label>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={deleteLoading || !deleteDeclaration}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteLoading && <Loader2 size={16} className="animate-spin" />}
              Submit Request
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    </div>
  );
}
