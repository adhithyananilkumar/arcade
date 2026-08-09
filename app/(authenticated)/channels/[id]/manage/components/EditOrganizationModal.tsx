'use client';

import { useState, useEffect } from 'react';
import { Channel, channelService } from '@/domains/channels';
import { toast } from 'sonner';
import { X, Upload, Loader2, Building2, Image as ImageIcon, Check, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageCropModal } from '@/shared/design-system/ui/image-crop-modal';
import { ChannelDoodleBanner } from '../ChannelDoodleBanner';

interface EditOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: Channel;
  onUpdate: (updatedChannel: Channel) => void;
}

export function EditOrganizationModal({
  isOpen,
  onClose,
  channel,
  onUpdate,
}: EditOrganizationModalProps) {
  const [name, setName] = useState(channel.name || '');
  const [description, setDescription] = useState(channel.description || '');
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [iconPreview, setIconPreview] = useState<string>(channel.iconUrl || '');
  const [bannerPreview, setBannerPreview] = useState<string>(channel.bannerUrl || '');
  const [loading, setLoading] = useState(false);

  const [cropTarget, setCropTarget] = useState<'icon' | 'banner' | null>(null);
  const [cropSourceFile, setCropSourceFile] = useState<File | null>(null);

  useEffect(() => {
    setName(channel.name || '');
    setDescription(channel.description || '');

    const savedBanner = typeof window !== 'undefined' ? localStorage.getItem(`arcade_org_banner_${channel.id}`) : null;
    const savedLogo = typeof window !== 'undefined' ? localStorage.getItem(`arcade_org_logo_${channel.id}`) : null;

    setIconPreview(savedLogo !== null ? savedLogo : (channel.iconUrl || ''));
    setBannerPreview(savedBanner !== null ? savedBanner : (channel.bannerUrl || ''));
    setIconFile(null);
    setBannerFile(null);
  }, [channel, isOpen]);

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
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      if (cropTarget === 'icon') {
        setIconFile(croppedFile);
        setIconPreview(dataUrl);
      } else if (cropTarget === 'banner') {
        setBannerFile(croppedFile);
        setBannerPreview(dataUrl);
      }
    };
    reader.readAsDataURL(croppedFile);
    setCropTarget(null);
    setCropSourceFile(null);
  };

  const handleRemoveBanner = () => {
    setBannerPreview('');
    setBannerFile(null);
    toast.info('Organization banner removed');
  };

  const handleRemoveLogo = () => {
    setIconPreview('');
    setIconFile(null);
    toast.info('Organization logo removed');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await channelService.updateChannelSettings(
        channel.id,
        description,
        iconFile || undefined,
        bannerFile || undefined
      );

      const finalChannel: Channel = {
        ...channel,
        name: name || channel.name,
        description,
        iconUrl: iconPreview,
        bannerUrl: bannerPreview,
      };

      toast.success('Organization branding and profile updated successfully');
      onUpdate(finalChannel);
      onClose();
    } catch {
      toast.error('Failed to update organization profile');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <ImageCropModal
        open={cropTarget !== null}
        file={cropSourceFile}
        aspectRatio={cropTarget === 'banner' ? 4 : 1}
        title={cropTarget === 'banner' ? 'Crop Organization Banner' : 'Crop Organization Logo'}
        onCancel={handleCropCancel}
        onCropped={handleCropped}
      />

      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 className="text-lg font-black tracking-tight text-[#14142b]">
                  Edit Organization Profile
                </h2>
                <p className="text-xs font-semibold text-slate-500">
                  Update your organizational branding, channel name, logo, and cover banner
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* 1. Banner Image Upload & Preview Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Organization Cover Banner (4:1 Aspect Ratio)
                  </label>
                  {bannerPreview && (
                    <button
                      type="button"
                      onClick={handleRemoveBanner}
                      className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline"
                    >
                      <Trash2 size={13} />
                      <span>Remove Banner</span>
                    </button>
                  )}
                </div>

                <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
                  <ChannelDoodleBanner bannerUrl={bannerPreview} className="h-36 w-full" />

                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
                    <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-extrabold text-slate-800 shadow-md hover:bg-slate-50 transition-all">
                      <Upload size={14} className="text-indigo-600" />
                      <span>Upload & Crop Banner</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleBannerChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* 2. Logo Avatar & Channel Name Section */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:items-center">
                {/* Logo Crop Preview */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                      Logo Avatar
                    </label>
                    {iconPreview && (
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="text-[11px] font-bold text-rose-600 hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="relative group h-24 w-24 overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center">
                    {iconPreview ? (
                      <img src={iconPreview} alt="Logo" className="h-full w-full object-cover" />
                    ) : (
                      <Building2 size={32} />
                    )}

                    <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer p-2 rounded-full bg-white text-slate-800 shadow-md">
                        <Upload size={16} className="text-indigo-600" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleIconChange}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* Name Input */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Organization Channel Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Arcade AI Research Institute"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              {/* 3. Description Textarea */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  Organization Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your organization's mission, courses, faculty, and learning goals..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                />
              </div>

              {/* Modal Footer / Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#14142b] px-6 py-2.5 text-xs font-extrabold text-white shadow-md hover:bg-indigo-950 transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Saving Profile...</span>
                    </>
                  ) : (
                    <>
                      <Check size={15} />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </AnimatePresence>
    </>
  );
}
