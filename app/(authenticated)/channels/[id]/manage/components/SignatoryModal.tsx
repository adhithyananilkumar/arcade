'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { AlertTriangle, Check, Loader2, PenLine, Trash2, Upload, X } from 'lucide-react';
import { Channel, ChannelSignatory, channelService } from '@/domains/channels';
import { IssuerLogoPreview } from '@/domains/credentials';
import { getAvatarUrl } from '@/shared/utils/avatar';
import { hasTransparentBackground, rasteriseSvg } from '@/shared/utils/image';

interface SignatoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  channel: Channel;
}

/**
 * The organisation's certificate signatory: the person who signs its certificates (e.g. the
 * Director) — their signature, name and title, printed in the middle of the certificate's bottom
 * row. Previewed on a full certificate and confirmed before saving.
 *
 * Certificates copy the signatory when they are issued (backend), so a change here applies only to
 * certificates issued from now on; ones already issued keep the signature they were issued with.
 *
 * The parent remounts it on each open (a `key`), so every visit starts from the saved signatory.
 */
export function SignatoryModal({ isOpen, onClose, channel }: SignatoryModalProps) {
  const [saved, setSaved] = useState<ChannelSignatory | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [remove, setRemove] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    let live = true;
    channelService
      .getSignatory(channel.id)
      .then((s) => {
        if (!live) return;
        setSaved(s);
        setName(s.name ?? '');
        setTitle(s.title ?? '');
      })
      .catch(() => live && toast.error('Could not load the signatory'))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [isOpen, channel.id]);

  useEffect(() => () => { if (fileUrl) URL.revokeObjectURL(fileUrl); }, [fileUrl]);

  if (!isOpen) return null;

  const currentImage = saved?.signatureUrl ? getAvatarUrl(saved.signatureUrl) ?? null : null;
  const image = remove ? null : fileUrl ?? currentImage;
  const nameOk = name.trim().length >= 2 && name.trim().length <= 120;
  const titleOk = title.trim().length >= 2 && title.trim().length <= 120;
  const changed =
    remove ||
    file !== null ||
    name.trim() !== (saved?.name ?? '') ||
    title.trim() !== (saved?.title ?? '');
  const valid = remove || (nameOk && titleOk && image !== null);
  const preview = !remove && image && name.trim() && title.trim()
    ? { name: name.trim(), title: title.trim(), signatureUrl: image }
    : null;

  const choose = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    e.target.value = '';
    if (!picked) return;
    if (picked.type !== 'image/png' && picked.type !== 'image/svg+xml') {
      toast.error('Use a PNG or SVG of the signature with a transparent background.');
      return;
    }
    let png: File;
    try {
      png = picked.type === 'image/svg+xml' ? await rasteriseSvg(picked) : picked;
    } catch {
      toast.error('That SVG could not be read. Try exporting it again, or use a PNG.');
      return;
    }
    if (png.size > 1_000_000) {
      toast.error('The signature image must be under 1 MB.');
      return;
    }
    const url = URL.createObjectURL(png);
    // A signature on a white box would print as a box over the certificate paper.
    if (!(await hasTransparentBackground(url).catch(() => false))) {
      URL.revokeObjectURL(url);
      toast.error('This signature has a background. Upload a PNG or SVG with a transparent background.');
      return;
    }
    setFile(png);
    setFileUrl(url);
    setRemove(false);
    setConfirmed(false);
  };

  const save = async () => {
    if (!changed || !valid || !confirmed) return;
    try {
      setSaving(true);
      await channelService.updateSignatory(
        channel.id,
        remove ? { remove: true } : { name: name.trim(), title: title.trim(), signatureFile: file ?? undefined }
      );
      toast.success(remove ? 'Signatory removed' : 'Signatory saved');
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save the signatory');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-2.5 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:bg-surface focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60';

  return (
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
          aria-labelledby="signatory-title"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <div>
              <h2 id="signatory-title" className="text-lg font-black tracking-tight text-ink">
                Certificate signatory
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                The person who signs your organisation&apos;s certificates
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

          {loading ? (
            <div className="flex items-center justify-center p-16">
              <Loader2 className="animate-spin text-slate-400" size={22} />
            </div>
          ) : (
            <div className="space-y-5 p-6">
              <div className="flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/40 dark:bg-amber-500/10">
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div className="space-y-1 text-xs font-medium leading-relaxed text-amber-900 dark:text-amber-100">
                  <p className="font-bold">This signature is printed on your certificates.</p>
                  <p>
                    Certificates issued <b>from now on</b> carry it. Certificates already issued keep the signature
                    they were issued with. Only upload a signature with the signatory&apos;s permission.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="space-y-1.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Name</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setRemove(false);
                      setConfirmed(false);
                    }}
                    maxLength={120}
                    placeholder="e.g. Dr. Jane Mathew"
                    className={inputClass}
                  />
                </label>
                <label className="space-y-1.5">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Title</span>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setRemove(false);
                      setConfirmed(false);
                    }}
                    maxLength={120}
                    placeholder="e.g. Director"
                    className={inputClass}
                  />
                </label>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-surface px-4 py-2 text-xs font-extrabold text-slate-800 shadow-xs transition-colors hover:bg-slate-50">
                  {image ? <PenLine size={14} className="text-indigo-600 dark:text-indigo-400" /> : <Upload size={14} className="text-indigo-600 dark:text-indigo-400" />}
                  <span>{image ? 'Replace signature' : 'Upload signature'}</span>
                  <input type="file" accept="image/png, image/svg+xml" onChange={choose} className="hidden" />
                </label>
                {(saved?.signatureUrl || file) && !remove && (
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
                    Remove signatory
                  </button>
                )}
                <span className="text-[11px] font-medium text-slate-500">
                  PNG or SVG with a transparent background, wider than tall.
                </span>
              </div>

              <div>
                <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-700">
                  {changed ? 'After this change' : 'Currently'}
                </p>
                <IssuerLogoPreview
                  logoSrc={channel.iconUrl ? getAvatarUrl(channel.iconUrl) ?? null : null}
                  organisationName={channel.name}
                  signatory={preview}
                  showBadge={false}
                />
                {!preview && (
                  <p className="mt-2 text-[11px] font-medium text-slate-500">
                    {remove
                      ? 'Without a signatory, certificates show only the date and your organisation.'
                      : 'Add a name, a title and the signature to see them on the certificate.'}
                  </p>
                )}
              </div>

              {changed && valid && (
                <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-indigo-600"
                  />
                  <span>
                    {remove
                      ? 'I understand certificates issued from now on will not be signed.'
                      : 'I confirm this signatory has agreed to sign our certificates, and that it applies to certificates issued from now on.'}
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
                  disabled={!changed || !valid || !confirmed || saving}
                  className="inline-flex items-center gap-2 rounded-2xl bg-ink px-6 py-2.5 text-xs font-extrabold text-on-ink shadow-md transition-all hover:bg-indigo-950 active:scale-[0.98] disabled:opacity-50"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  <span>{remove ? 'Remove signatory' : 'Save signatory'}</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
