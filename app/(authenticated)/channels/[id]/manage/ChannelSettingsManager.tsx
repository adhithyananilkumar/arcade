'use client';

import { useState } from 'react';
import { Channel, channelService } from "@/domains/channels";
import { toast } from 'sonner';
import { Upload, Image as ImageIcon, Loader2, Shield, AlertTriangle, Lock, Tv, Sparkles, FileText } from 'lucide-react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { ImageCropModal } from '@/shared/design-system/ui/image-crop-modal';
import { ChannelDoodleBanner } from './ChannelDoodleBanner';

interface Props {
  channel: Channel;
  onUpdate: (updatedChannel: Channel) => void;
  permissions: string[];
  locked?: boolean;
}

export function ChannelSettingsManager({ channel, onUpdate, permissions, locked }: Props) {
  const [description, setDescription] = useState(channel.description || '');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [iconPreview, setIconPreview] = useState<string>(channel.iconUrl || '');
  const [bannerPreview, setBannerPreview] = useState<string>(channel.bannerUrl || '');
  const [loading, setLoading] = useState(false);
  const [cropTarget, setCropTarget] = useState<'icon' | 'banner' | null>(null);
  const [cropSourceFile, setCropSourceFile] = useState<File | null>(null);
  const { user } = useAuthStore();
  const isOwner = user?.id === channel.ownerId;
  const isSuspended = channel.status === 'SUSPENDED' || !!locked;
  const canManageSettings = (isOwner || permissions.includes('channel.settings.manage')) && !isSuspended;

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) {
      setCropSourceFile(file);
      setCropTarget('icon');
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) {
      setCropSourceFile(file);
      setCropTarget('banner');
    }
  };

  const handleCropCancel = () => {
    setCropTarget(null);
    setCropSourceFile(null);
  };

  const handleCropped = (croppedFile: File) => {
    const previewUrl = URL.createObjectURL(croppedFile);
    if (cropTarget === 'icon') {
      setIconFile(croppedFile);
      setIconPreview(previewUrl);
    } else if (cropTarget === 'banner') {
      setBannerFile(croppedFile);
      setBannerPreview(previewUrl);
    }
    setCropTarget(null);
    setCropSourceFile(null);
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
    } catch {
      toast.error('Failed to update channel settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ImageCropModal
        open={cropTarget !== null}
        file={cropSourceFile}
        aspectRatio={cropTarget === 'banner' ? 4 : 1}
        title={cropTarget === 'banner' ? 'Crop channel banner' : 'Crop channel logo'}
        onCancel={handleCropCancel}
        onCropped={handleCropped}
      />
      <form
        onSubmit={handleSubmit}
        className="max-w-4xl mx-auto overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-[0_8px_28px_rgba(20,20,43,0.05)] space-y-6"
      >
        {/* Form Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-slate-50/80 px-6 py-4.5 sm:px-8">
          <div>
            <h2 className="text-base font-extrabold tracking-tight text-[#14142b]">
              Branding & Profile
            </h2>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              Customize your channel&apos;s public appearance, logo, and banner.
            </p>
          </div>
          {isSuspended ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3.5 py-1.5 text-xs font-bold text-rose-600 border border-rose-200/60">
              <AlertTriangle size={13} /> Read Only
            </span>
          ) : (
            !canManageSettings && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-600 border border-slate-200/60">
                <Shield size={13} /> Read Only
              </span>
            )
          )}
        </div>

        <div className="space-y-6 px-6 sm:px-8">
          {/* Live Visual Branding Preview Card */}
          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-[#14142b] uppercase tracking-wider">
              Live Preview & Media
            </label>
            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50/90 via-blue-50/40 to-slate-50/90 p-3.5 sm:p-5 shadow-2xs">
              
              {/* Banner Area */}
              <div className="group relative rounded-2xl overflow-hidden shadow-xs">
                <ChannelDoodleBanner bannerUrl={bannerPreview} className="h-40 w-full rounded-2xl" />

                {canManageSettings && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-xs cursor-pointer">
                    <span className="flex items-center gap-2 text-xs font-bold text-white bg-black/60 px-4 py-2 rounded-full border border-white/30 shadow-md">
                      <Upload size={14} /> Change Banner
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Logo Area & Quick Info Row */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 px-3 pb-2 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-end gap-3.5">
                  {/* Avatar floating over banner */}
                  <div className="-mt-10 sm:-mt-12 group relative h-20 w-20 sm:h-24 sm:w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-[#F5F0E6] text-black shadow-md ring-1 ring-black/5">
                    {iconPreview ? (
                      <img
                        src={iconPreview}
                        alt="Logo Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-[#F5F0E6] flex items-center justify-center text-black">
                        <Tv size={32} />
                      </div>
                    )}

                    {canManageSettings && (
                      <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 cursor-pointer backdrop-blur-xs">
                        <Upload size={16} className="text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleIconChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <div className="pb-1 pt-1 sm:pt-3 min-w-0">
                    <h3 className="text-base font-extrabold text-[#14142b] truncate">
                      {channel.name}
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-400">
                      Hover image or banner to change
                    </p>
                  </div>
                </div>

                {/* Quick File Action Buttons */}
                {canManageSettings && (
                  <div className="flex items-center gap-2 pb-1">
                    <label className="inline-flex items-center gap-1.5 rounded-xl border border-purple-200/80 bg-purple-50/70 px-3.5 py-1.5 text-[11px] font-extrabold text-purple-700 cursor-pointer shadow-2xs hover:bg-purple-100/80 transition-all">
                      <ImageIcon size={13} className="text-purple-600" />
                      <span>Upload Banner</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerChange}
                        className="hidden"
                      />
                    </label>

                    <label className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200/80 bg-indigo-50/70 px-3.5 py-1.5 text-[11px] font-extrabold text-indigo-700 cursor-pointer shadow-2xs hover:bg-indigo-100/80 transition-all">
                      <Upload size={13} className="text-indigo-600" />
                      <span>Upload Logo</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleIconChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form Fields Section */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <h3 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-[#14142b]">
              <span className="grid size-6 place-items-center rounded-lg bg-indigo-100/80 text-indigo-700 border border-indigo-200/60">
                <FileText size={13} />
              </span>
              <span>Channel Details</span>
            </h3>

            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className="mb-2 flex items-center justify-between text-xs font-extrabold text-slate-700">
                  <span>Channel Name</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-500 border border-slate-200/60">
                    <Lock size={10} className="text-slate-400" />
                    <span>System Managed</span>
                  </span>
                </label>
                <input
                  type="text"
                  value={channel.name}
                  disabled
                  className="w-full cursor-not-allowed rounded-2xl border border-slate-200/80 bg-slate-100/70 px-4.5 py-3 text-xs font-extrabold text-[#14142b] shadow-2xs"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center justify-between text-xs font-extrabold text-slate-700">
                  <span>Description</span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-600 border border-slate-200/60">
                    {description.length} / 500
                  </span>
                </label>
                <textarea
                  id="description"
                  rows={4}
                  maxLength={500}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={!canManageSettings}
                  className="w-full resize-none rounded-2xl border border-slate-200/90 bg-white px-4.5 py-3.5 text-xs font-medium text-[#14142b] outline-none transition-all placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500 shadow-2xs"
                  placeholder="Describe what your channel is about, its mission, and target audience..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action Bar */}
        {canManageSettings && (
          <div className="flex justify-end border-t border-slate-100 bg-gradient-to-r from-slate-50/60 via-indigo-50/20 to-slate-50/60 px-6 py-4.5 sm:px-8">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#14142b] via-indigo-950 to-[#14142b] px-7 py-2.5 text-xs font-extrabold text-white shadow-md hover:shadow-lg transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </>
  );
}
