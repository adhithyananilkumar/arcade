'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Building2, ImageIcon, Trash2 } from 'lucide-react';
import { Channel, channelService } from '@/domains/channels';
import { ImageCropModal } from '@/shared/design-system/ui/image-crop-modal';
import { getAvatarUrl } from '@/shared/utils/avatar';
import { hasTransparentBackground, rasteriseSvg } from '@/shared/utils/image';
import { BrandingPanel, BrandingPanelActions, type BrandingPanelProps } from './CertificateBrandingSection';
import { ImageDropzone } from './ImageDropzone';

interface ChannelLogoCardProps extends BrandingPanelProps {
  onUpdate: (channel: Channel) => void;
  /** The saved logo is set (the channel may publish as far as the logo goes). */
  done: boolean;
}

/**
 * The one place an organisation changes its logo (Manage → Identity & branding, a panel of
 * `CertificateBrandingSection`). The logo is not just the channel's avatar: it is printed on the
 * organisation's badges and certificates, so a change is shown in the section's shared preview and
 * must be confirmed before it is saved. It is required before the channel may publish.
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
export function ChannelLogoCard({ channel, canEdit, onUpdate, done, preview, setDraft }: ChannelLogoCardProps) {
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

  useEffect(() => setDraft('logo', changed ? next : undefined), [changed, next, setDraft]);

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
    <BrandingPanel
      id="logo"
      icon={<ImageIcon size={14} />}
      title="Logo"
      requirement="required"
      done={done}
      description="Your channel avatar, beside the Arcade mark on certificates and in the badge medallion."
    >
      <ImageCropModal
        open={cropSource !== null}
        file={cropSource}
        aspectRatio={1}
        transparency
        title="Crop your logo"
        hint="Square, on a transparent background. Trim the empty edges, then zoom out a little if it touches the frame."
        onCancel={() => setCropSource(null)}
        onCropped={cropped}
        preview={(url) => preview({ logo: url })}
      />

      <div className="space-y-2">
        {canEdit ? (
          <ImageDropzone
            accept={['image/png', 'image/svg+xml']}
            onFile={choose}
            disabled={saving}
            label={next ? 'Replace logo' : 'Add a logo'}
            help="PNG or SVG with a transparent background."
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
        {remove && (
          <p className="text-[11px] font-medium leading-relaxed text-rose-600 dark:text-rose-400">
            Without a logo, certificates name your organisation instead, badges leave the medallion empty — and the
            channel cannot publish new content.
          </p>
        )}
      </div>

      {changed && (
        <BrandingPanelActions
          warning={
            first ? undefined : (
              <>
                <p>
                  <b>Badges</b> show the logo live: every badge already issued will show the new one.
                </p>
                <p>
                  <b>Certificates</b> keep the logo they were issued with; only new ones change.
                </p>
              </>
            )
          }
          confirmLabel={
            first
              ? undefined
              : `I understand this ${remove ? 'removes the logo from' : 'changes the logo on'} all of our badges, and on certificates issued from now on.`
          }
          confirmed={confirmed}
          onConfirm={setConfirmed}
          onDiscard={reset}
          onSave={save}
          saveLabel={remove ? 'Remove logo' : 'Save logo'}
          canSave={first || confirmed}
          saving={saving}
        />
      )}
    </BrandingPanel>
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
