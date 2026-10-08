'use client';

import { useState, useEffect } from 'react';
import { Channel, channelService } from '@/domains/channels';
import { toast } from 'sonner';
import { X, Upload, Loader2, Building2, Image as ImageIcon, Check, Trash2, ShieldAlert, PenLine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ImageCropModal } from '@/shared/design-system/ui/image-crop-modal';
import { getAvatarUrl } from '@/shared/utils/avatar';
import { ChannelDoodleBanner } from '../ChannelDoodleBanner';

interface EditOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: Channel;
  onUpdate: (updatedChannel: Channel) => void;
  /** Goes to Identity & branding — the one place the logo changes (it is on badges and certificates). */
  onEditLogo: () => void;
  /** Opens the certificate signatory modal (organisations only). */
  onEditSignatory: () => void;
}

export function EditOrganizationModal({
  isOpen,
  onClose,
  channel,
  onUpdate,
  onEditLogo,
  onEditSignatory,
}: EditOrganizationModalProps) {
  const [name, setName] = useState(channel.name || '');
  const [description, setDescription] = useState(channel.description || '');
  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [bannerPreview, setBannerPreview] = useState<string>(channel.bannerUrl || '');
  const [loading, setLoading] = useState(false);

  const [cropTarget, setCropTarget] = useState<'banner' | null>(null);
  const [cropSourceFile, setCropSourceFile] = useState<File | null>(null);

  const [removeBanner, setRemoveBanner] = useState(false);

  useEffect(() => {
    setName(channel.name || '');
    setDescription(channel.description || '');
    setBannerPreview(channel.bannerUrl || '');
    setBannerFile(null);
    setRemoveBanner(false);
  }, [channel, isOpen]);

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
      if (cropTarget === 'banner') {
        setBannerFile(croppedFile);
        setBannerPreview(dataUrl);
        setRemoveBanner(false);
      }
    };
    reader.readAsDataURL(croppedFile);
    setCropTarget(null);
    setCropSourceFile(null);
  };

  const handleRemoveBanner = () => {
    setBannerPreview('');
    setBannerFile(null);
    setRemoveBanner(!!channel.bannerUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      toast.error('Channel name must be at least 2 characters');
      return;
    }
    if (trimmedName.length > 150) {
      toast.error('Channel name must be at most 150 characters');
      return;
    }
    if (description.trim().length > 2000) {
      toast.error('Description must be at most 2000 characters');
      return;
    }
    try {
      setLoading(true);
      // The backend is the source of truth for what was saved — use its response rather than an
      // optimistic local copy, so a rename or removal that didn't persist can't be shown as done.
      const saved = await channelService.updateChannelProfile(channel.id, {
        name: trimmedName !== channel.name ? trimmedName : undefined,
        description: description.trim(),
        bannerFile: bannerFile || undefined,
        removeBanner,
      });

      toast.success('Channel profile updated');
      onUpdate(saved);
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update channel profile');
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
        aspectRatio={4}
        title="Crop Organization Banner"
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
            className="fixed inset-0 arcade-modal-backdrop"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative z-10 w-full max-w-2xl overflow-hidden arcade-modal-box rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface shadow-2xl"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-5">
              <div>
                <h2 className="text-lg font-black tracking-tight text-ink">
                  Edit Organization Profile
                </h2>
                <p className="mt-0.5 text-xs font-semibold text-slate-500">
                  Update your organizational branding, channel name, logo, and cover banner
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-tl-lg rounded-br-lg rounded-tr-xs rounded-bl-xs p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink transition-colors cursor-pointer dark:hover:bg-slate-800"
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
                      className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:underline dark:text-rose-400"
                    >
                      <Trash2 size={13} />
                      <span>Remove Banner</span>
                    </button>
                  )}
                </div>

                <div className="relative group overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
                  <ChannelDoodleBanner bannerUrl={bannerPreview} className="w-full aspect-[4/1]" />

                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-xs">
                    <label className="cursor-pointer inline-flex items-center gap-2 rounded-xl bg-surface px-4 py-2 text-xs font-extrabold text-slate-800 shadow-md hover:bg-slate-50 transition-all">
                      <Upload size={14} className="text-indigo-600 dark:text-indigo-400" />
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
                {/* Logo — organizations only (a personal channel shows its owner's profile picture). It is
                    changed only in Identity & branding (ChannelLogoCard), since it is printed on badges and certificates. */}
                {!channel.isPersonal && (
                <div className="space-y-2">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Logo
                  </label>
                  <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                    {channel.iconUrl ? (
                      <img src={getAvatarUrl(channel.iconUrl)} alt="Logo" className="h-full w-full object-cover" />
                    ) : (
                      <Building2 size={30} className="text-slate-400" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={onEditLogo}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    <ShieldAlert size={13} />
                    Change logo…
                  </button>
                  <p className="text-[11px] font-medium leading-snug text-slate-500">
                    Also printed on your badges and certificates.
                  </p>
                  <button
                    type="button"
                    onClick={onEditSignatory}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    <PenLine size={13} />
                    Certificate signatory…
                  </button>
                </div>
                )}

                {/* Name Input */}
                <div className={`${channel.isPersonal ? 'sm:col-span-3' : 'sm:col-span-2'} space-y-2`}>
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                    Organization Channel Name
                  </label>
                  <input
                    type="text"
                    required
                    minLength={2}
                    maxLength={150}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Arcade AI Research Institute"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
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
                  maxLength={2000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your organization's mission, courses, faculty, and learning goals..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
                />
              </div>

              {/* Modal Footer / Buttons */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-200/70 pt-5">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-ink cursor-pointer dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-on-ink shadow-sm transition-colors hover:bg-ink-hover disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </AnimatePresence>
    </>
  );
}
