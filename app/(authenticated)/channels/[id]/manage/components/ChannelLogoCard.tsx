'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, Building2, Check, ImageIcon, Loader2, Trash2, Undo2 } from 'lucide-react';
import { Channel, channelService } from '@/domains/channels';
import { IssuerLogoPreview } from '@/domains/credentials';
import { ImageCropModal } from '@/shared/design-system/ui/image-crop-modal';
import { getAvatarUrl } from '@/shared/utils/avatar';
import { hasTransparentBackground, rasteriseSvg } from '@/shared/utils/image';
import { ImageDropzone } from './ImageDropzone';

interface ChannelLogoCardProps {
  channel: Channel;
  canEdit: boolean;
  onUpdate: (channel: Channel) => void;
}

/**
 * The one place an organisation changes its logo (Manage → Identity & branding). The logo is not
 * just the channel's avatar: it is printed on the organisation's badges and certificates, so a
 * change is previewed on both and must be confirmed before it is saved.
 *
 * What a change reaches (backend): badges read the logo live from the channel, so every badge —
 * already issued ones included — shows the new logo; certificates keep the logo they were issued
 * with, so only certificates issued from now on carry the new one.
 *
 * The logo must be a PNG or SVG with a transparent background, so it sits on the certificate paper
 * and the badge metal without a box around it. An SVG is rasterised to PNG here, in the browser:
 * the PDF engine embeds PNG and JPEG only, and never untrusted SVG markup. A logo on white can be
 * cleaned up in the cropper ("Remove white background").
 *
 * A personal channel has no logo of its own (it shows its owner's profile picture), so this card is
 * for organisations only.
 */
export function ChannelLogoCard({ channel, canEdit, onUpdate }: ChannelLogoCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [remove, setRemove] = useState(false);
  const [cropSource, setCropSource] = useState<File | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => () => { if (fileUrl) URL.revokeObjectURL(fileUrl); }, [fileUrl]);

  const current = channel.iconUrl ? getAvatarUrl(channel.iconUrl) ?? null : null;
  const next = remove ? null : fileUrl ?? current;
  const changed = remove || file !== null;
  // Nothing has been issued under a logo yet, so there is nothing to warn about or confirm.
  const first = !current;

  const reset = () => {
    setFile(null);
    setFileUrl(null);
    setRemove(false);
    setConfirmed(false);
  };

  const choose = async (picked: File) => {
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
    const url = URL.createObjectURL(croppedFile);
    // A logo on a white or coloured box would print as a box on the certificate and the badge.
    if (!(await hasTransparentBackground(url).catch(() => false))) {
      URL.revokeObjectURL(url);
      toast.error('This logo still has a background. Use "Remove white background" in the cropper, or upload a transparent PNG/SVG.');
      return; // the cropper stays open so it can be fixed there
    }
    setCropSource(null);
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
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update the logo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section id="logo" className="scroll-mt-28 rounded-[20px] border border-slate-100 bg-surface p-6">
      <ImageCropModal
        open={cropSource !== null}
        file={cropSource}
        aspectRatio={1}
        transparency
        title="Crop your logo"
        hint="Square, on a transparent background. Trim the empty edges, then zoom out a little if it touches the frame."
        onCancel={() => setCropSource(null)}
        onCropped={cropped}
        preview={(url) => <IssuerLogoPreview logoSrc={url} organisationName={channel.name} />}
      />

      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50">
          <ImageIcon size={16} className="text-slate-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-extrabold tracking-tight text-slate-900">Logo</h2>
          <p className="mt-1 text-[12.5px] font-medium leading-relaxed text-slate-500">
            Your channel avatar, and the mark on your badges and certificates.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="space-y-3">
          {canEdit ? (
            <ImageDropzone
              accept={['image/png', 'image/svg+xml']}
              onFile={choose}
              disabled={saving}
              label={next ? 'Replace logo' : 'Add a logo'}
              help="Drop, paste or browse. PNG or SVG with a transparent background."
            >
              <LogoTile src={next} />
            </ImageDropzone>
          ) : (
            <div className="flex justify-center rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
              <LogoTile src={current} />
            </div>
          )}
          {canEdit && (current || file) && !remove && (
            <button
              type="button"
              onClick={() => {
                setRemove(true);
                setFile(null);
                setFileUrl(null);
                setConfirmed(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
            >
              <Trash2 size={13} />
              Remove logo
            </button>
          )}
        </div>

        <div className="min-w-0">
          <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
            {changed ? 'After this change' : 'Currently'}
          </p>
          <IssuerLogoPreview logoSrc={next} organisationName={channel.name} />
          {remove && (
            <p className="mt-2 text-[11px] font-medium text-slate-500">
              Without a logo, certificates name your organisation instead and badges leave the medallion empty.
            </p>
          )}
        </div>
      </div>

      {changed && (
        <div className="mt-6 space-y-4 border-t border-slate-100 pt-5">
          {!first && (
            <div className="flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/40 dark:bg-amber-500/10">
              <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div className="space-y-1 text-xs font-medium leading-relaxed text-amber-900 dark:text-amber-100">
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
          {!first && (
            <label className="flex cursor-pointer items-start gap-2.5 text-xs font-semibold text-slate-700">
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
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={reset}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-surface px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
            >
              <Undo2 size={13} /> Discard
            </button>
            <button
              type="button"
              onClick={save}
              disabled={(!first && !confirmed) || saving}
              className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-xs font-extrabold text-on-ink transition-all hover:bg-ink-hover active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {remove ? 'Remove logo' : 'Save logo'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function LogoTile({ src }: { src: string | null }) {
  return (
    <span
      className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 shadow-xs"
      style={{
        backgroundColor: '#fff',
        backgroundImage:
          'linear-gradient(45deg,#f1f5f9 25%,transparent 25%),linear-gradient(-45deg,#f1f5f9 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#f1f5f9 75%),linear-gradient(-45deg,transparent 75%,#f1f5f9 75%)',
        backgroundSize: '12px 12px',
        backgroundPosition: '0 0,0 6px,6px -6px,-6px 0',
      }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="Logo" className="h-full w-full object-contain p-2" />
      ) : (
        <Building2 size={30} className="text-slate-300" />
      )}
    </span>
  );
}
