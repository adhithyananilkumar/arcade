'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { AlertTriangle, Check, Loader2, Trash2, Upload, X } from 'lucide-react';
import { Channel, channelService } from '@/domains/channels';
import { IssuerLogoPreview } from '@/domains/credentials';
import { ImageCropModal } from '@/shared/design-system/ui/image-crop-modal';
import { getAvatarUrl } from '@/shared/utils/avatar';
import { hasTransparentBackground, rasteriseSvg } from '@/shared/utils/image';

interface OrganisationLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: Channel;
  onUpdate: (updatedChannel: Channel) => void;
}

/**
 * The one place an organisation changes its logo. The logo is not just the channel's avatar: it is
 * printed on the organisation's badges and certificates, so the change is previewed on both and
 * must be confirmed before it is saved.
 *
 * What a change reaches (backend): badges read the logo live from the channel, so every badge —
 * already issued ones included — shows the new logo; certificates keep the logo they were issued
 * with, so only certificates issued from now on carry the new one.
 *
 * The logo must be a PNG or SVG with a transparent background, so it sits on the certificate paper
 * and the badge metal without a box around it. An SVG is rasterised to PNG here, in the browser:
 * the PDF engine embeds PNG and JPEG only, and never untrusted SVG markup.
 *
 * The parent remounts it on each open (a `key`), so every visit starts from the saved logo.
 */
export function OrganisationLogoModal({ isOpen, onClose, channel, onUpdate }: OrganisationLogoModalProps) {
  // The logo this change would leave: a new crop, nothing (removal), or the current one.
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [remove, setRemove] = useState(false);
  const [cropSource, setCropSource] = useState<File | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => () => { if (fileUrl) URL.revokeObjectURL(fileUrl); }, [fileUrl]);

  if (!isOpen) return null;

  const current = channel.iconUrl ? getAvatarUrl(channel.iconUrl) : null;
  const next = remove ? null : fileUrl ?? current;
  const changed = remove || file !== null;
  // Nothing has been issued under a logo yet, so there is nothing to warn about or confirm.
  const first = !current;

  const choose = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    e.target.value = '';
    if (!picked) return;
    if (picked.type === 'image/svg+xml') {
      try {
        setCropSource(await rasteriseSvg(picked));
      } catch {
        toast.error('That SVG could not be read. Try exporting it again, or use a PNG.');
      }
      return;
    }
    if (picked.type !== 'image/png') {
      toast.error('Use a PNG or SVG with a transparent background.');
      return;
    }
    setCropSource(picked);
  };

  const cropped = async (croppedFile: File) => {
    setCropSource(null);
    const url = URL.createObjectURL(croppedFile);
    // A logo on a white or coloured box would print as a box on the certificate and the badge.
    if (!(await hasTransparentBackground(url).catch(() => false))) {
      URL.revokeObjectURL(url);
      toast.error('This logo has a background. Upload a PNG or SVG with a transparent background.');
      return;
    }
    setFile(croppedFile);
    setFileUrl(url);
    setRemove(false);
    setConfirmed(false);
  };

  const save = async () => {
    if (!changed || (!first && !confirmed)) return;
    try {
      setSaving(true);
      const saved = await channelService.updateChannelProfile(channel.id, {
        iconFile: file ?? undefined,
        removeIcon: remove,
      });
      toast.success(remove ? 'Logo removed' : 'Logo updated');
      onUpdate(saved);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update the logo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ImageCropModal
        open={cropSource !== null}
        file={cropSource}
        aspectRatio={1}
        title="Crop organisation logo"
        onCancel={() => setCropSource(null)}
        onCropped={cropped}
        preview={(url) => <IssuerLogoPreview logoSrc={url} organisationName={channel.name} />}
      />

      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200/80 bg-surface shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="org-logo-title"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
              <div>
                <h2 id="org-logo-title" className="text-lg font-black tracking-tight text-ink">
                  Organisation logo
                </h2>
                <p className="text-xs font-semibold text-slate-500">
                  Your channel avatar, and the mark on your badges and certificates
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {!first && (
              <div className="flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/40 dark:bg-amber-500/10">
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div className="space-y-1 text-xs font-medium leading-relaxed text-amber-900 dark:text-amber-100">
                  <p className="font-bold">This logo is printed on your credentials.</p>
                  <p>
                    <b>Badges</b> show the logo live, so every badge your organisation has issued — including ones
                    learners already hold — will show the new logo.
                  </p>
                  <p>
                    <b>Certificates</b> keep the logo they were issued with. Only certificates issued from now on will
                    carry the new one.
                  </p>
                </div>
              </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-surface px-4 py-2 text-xs font-extrabold text-slate-800 shadow-xs transition-colors hover:bg-slate-50">
                  <Upload size={14} className="text-indigo-600 dark:text-indigo-400" />
                  <span>{next ? 'Choose a new logo' : 'Upload a logo'}</span>
                  <input type="file" accept="image/png, image/svg+xml" onChange={choose} className="hidden" />
                </label>
                {(current || file) && !remove && (
                  <button
                    type="button"
                    onClick={() => {
                      setRemove(true);
                      setFile(null);
                      setFileUrl(null);
                      setConfirmed(false);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                  >
                    <Trash2 size={13} />
                    Remove logo
                  </button>
                )}
                <span className="text-[11px] font-medium text-slate-500">
                  PNG or SVG, square, with a transparent background.
                </span>
              </div>

              <div>
                <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  {changed ? 'After this change' : 'Currently'}
                </p>
                <IssuerLogoPreview logoSrc={next} organisationName={channel.name} />
                {remove && (
                  <p className="mt-2 text-[11px] font-medium text-slate-500">
                    Without a logo, certificates name your organisation instead and badges leave the medallion empty.
                  </p>
                )}
              </div>

              {changed && !first && (
                <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-indigo-600"
                  />
                  <span>
                    I understand this {remove ? 'removes the logo from' : 'changes the logo on'} all of our badges, and on
                    certificates issued from now on.
                  </span>
                </label>
              )}

              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-2xl border border-slate-200 bg-surface px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={!changed || (!first && !confirmed) || saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-ink px-6 py-2.5 text-xs font-extrabold text-on-ink shadow-md transition-all hover:bg-indigo-950 active:scale-[0.98] disabled:opacity-50"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  <span>{remove ? 'Remove logo' : 'Save logo'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </>
  );
}
