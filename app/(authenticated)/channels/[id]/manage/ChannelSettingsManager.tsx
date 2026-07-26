'use client';

import { useState } from 'react';
import { Channel, channelService } from "@/domains/channels";
import { toast } from 'sonner';
import { Upload, Image as ImageIcon, Loader2, Shield, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { ImageCropModal } from '@/shared/design-system/ui/image-crop-modal';

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
        className="max-w-3xl overflow-hidden rounded-xl border border-slate-200/80 bg-white/95 shadow-[0_4px_16px_rgba(20,20,43,0.04)]"
      >
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
          <div>
            <h2 className="text-[15px] font-bold tracking-tight text-[#14142b]">
              Branding & profile
            </h2>
            <p className="mt-0.5 text-[12px] font-medium text-slate-500">
              Update your channel&apos;s public appearance.
            </p>
          </div>
          {isSuspended ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-700">
              <AlertTriangle size={12} /> Read only
            </span>
          ) : (
            !canManageSettings && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                <Shield size={12} /> Read only
              </span>
            )
          )}
        </div>

        <div className="space-y-8 p-5 sm:p-6">
          <div className="space-y-3">
            <label className="block text-[13px] font-semibold text-[#14142b]">Channel banner</label>
            <div className="group relative overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 transition-colors hover:border-slate-300 hover:bg-slate-50/80">
              {bannerPreview ? (
                <div className="aspect-[4/1] w-full">
                  <img
                    src={bannerPreview}
                    alt="Banner Preview"
                    className="h-full w-full object-cover"
                  />
                  {canManageSettings && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#14142b]/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="flex items-center gap-2 text-sm font-semibold text-white">
                        <Upload size={16} /> Change banner
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex aspect-[4/1] w-full flex-col items-center justify-center text-slate-400">
                  <ImageIcon size={28} className="mb-2" />
                  <span className="text-[13px] font-semibold">Upload banner</span>
                </div>
              )}
              {canManageSettings && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              )}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-[13px] font-semibold text-[#14142b]">Channel logo</label>
            {canManageSettings ? (
              <>
                <label className="group relative flex h-32 w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-white transition-colors hover:border-slate-300">
                  {iconPreview ? (
                    <>
                      <img
                        src={iconPreview}
                        alt="Logo Preview"
                        className="mx-auto h-full w-auto object-contain"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-[#14142b]/40 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="flex items-center gap-2 text-sm font-semibold text-white">
                          <Upload size={16} /> Change logo
                        </span>
                      </div>
                    </>
                  ) : (
                    <span className="flex items-center gap-2 text-[13px] font-medium text-slate-500">
                      <Upload className="text-slate-400" size={18} />
                      Drop or <span className="font-semibold text-[#14142b] underline">browse</span>
                    </span>
                  )}
                  <input
                    type="file"
                    name="icon"
                    className="hidden"
                    accept="image/*"
                    onChange={handleIconChange}
                  />
                </label>
                <p className="text-center text-[11px] font-medium text-slate-400">
                  Recommended 512×512 · PNG or JPG · Max 2MB
                </p>
              </>
            ) : (
              <div className="flex h-32 w-full items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
                {iconPreview ? (
                  <img src={iconPreview} alt="Logo" className="mx-auto h-full w-auto object-contain" />
                ) : (
                  <span className="text-sm text-slate-400">Cannot modify icon</span>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4 border-t border-slate-100 pt-6">
            <h3 className="text-[15px] font-bold tracking-tight text-[#14142b]">Channel details</h3>

            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-[#14142b]">
                Channel name
              </label>
              <input
                type="text"
                value={channel.name}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-500"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[13px] font-semibold text-[#14142b]">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!canManageSettings}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-[#14142b] outline-none transition-colors placeholder:text-slate-400 focus:border-[#14142b]/30 focus:bg-white focus:ring-4 focus:ring-slate-200/60 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                placeholder="What is your channel about?"
              />
            </div>
          </div>
        </div>

        {canManageSettings && (
          <div className="flex justify-end border-t border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full bg-[#14142b] px-5 py-2.5 text-[13px] font-semibold text-white shadow-[0_8px_18px_rgba(20,20,43,0.16)] transition-colors hover:bg-[#232735] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : 'Save changes'}
            </button>
          </div>
        )}
      </form>
    </>
  );
}
