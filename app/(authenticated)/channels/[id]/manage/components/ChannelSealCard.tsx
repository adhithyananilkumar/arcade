'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Stamp, Trash2 } from 'lucide-react';
import { channelService } from '@/domains/channels';
import { HOST_INSTITUTION_NAME } from '@/domains/credentials';
import { ImageCropModal } from '@/shared/design-system/ui/image-crop-modal';
import { getAvatarUrl } from '@/shared/utils/avatar';
import { hasTransparentBackground, rasteriseSvg } from '@/shared/utils/image';
import { BrandingPanel, BrandingPanelActions, type BrandingPanelProps } from './CertificateBrandingSection';
import { ImageDropzone } from './ImageDropzone';

const SEAL_MAX_BYTES = 1_000_000;

/**
 * An organisation's certificate seal (Manage → Identity & branding, a panel of
 * `CertificateBrandingSection`): a transparent PNG stamped above its name in the certificate's
 * issuer column. Optional — not needed to publish. Certificates copy it when issued, so a change
 * applies only to certificates issued from now on.
 *
 * Organisations only: a personal channel's certificates are issued by the host institution.
 */
export function ChannelSealCard({ channel, canEdit, saved, onSaved, preview, setDraft }: BrandingPanelProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [cropSource, setCropSource] = useState<File | null>(null);
  const [remove, setRemove] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => () => { if (fileUrl) URL.revokeObjectURL(fileUrl); }, [fileUrl]);

  const current = saved?.sealUrl ? getAvatarUrl(saved.sealUrl) ?? null : null;
  const seal = remove ? null : fileUrl ?? current;
  const changed = remove || file !== null;
  const issueAsHost = !!saved?.issueAsHost;

  useEffect(() => setDraft('seal', changed ? seal : undefined), [changed, seal, setDraft]);

  if (!canEdit || channel.isPersonal) return null;

  const reset = () => {
    setFile(null);
    setFileUrl(null);
    setRemove(false);
    setConfirmed(false);
  };

  const choose = async (picked: File) => {
    if (picked.type === 'image/svg+xml') {
      try {
        setCropSource(await rasteriseSvg(picked, 1200));
      } catch {
        toast.error('That SVG could not be read. Try exporting it again, or use a PNG.');
      }
      return;
    }
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(picked.type)) {
      toast.error('Use an image of the seal: PNG, SVG, JPEG or WebP.');
      return;
    }
    setCropSource(picked);
  };

  const cropped = async (croppedFile: File) => {
    if (croppedFile.type !== 'image/png') {
      toast.error('Use "Remove white background" first: the seal must be transparent to sit on the certificate paper.');
      return;
    }
    if (croppedFile.size > SEAL_MAX_BYTES) {
      toast.error('That seal image is over 1 MB. Crop it tighter.');
      return;
    }
    const url = URL.createObjectURL(croppedFile);
    if (!(await hasTransparentBackground(url).catch(() => false))) {
      URL.revokeObjectURL(url);
      toast.error('This seal still has a background. Use "Remove white background" in the cropper.');
      return;
    }
    setCropSource(null);
    setFile(croppedFile);
    setFileUrl(url);
    setRemove(false);
    setConfirmed(false);
  };

  const save = async () => {
    if (!changed || !confirmed) return;
    try {
      setSaving(true);
      const result = await channelService.updateSeal(channel.id, remove ? { remove: true } : { sealFile: file ?? undefined });
      toast.success(remove ? 'Seal removed' : 'Seal saved');
      onSaved(result);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save the seal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <BrandingPanel
      id="seal"
      icon={<Stamp size={14} />}
      title="Seal"
      requirement="optional"
      description="Your organisation's seal, stamped above its name on your certificates."
    >
      <ImageCropModal
        open={cropSource !== null}
        file={cropSource}
        aspectOptions={[
          { label: 'Round / square', value: 1 },
          { label: 'Free', value: undefined },
        ]}
        aspectRatio={1}
        transparency
        title="Crop the seal"
        hint="Scanned or photographed? Remove the white background, then trim the empty edges."
        onCancel={() => setCropSource(null)}
        onCropped={cropped}
        preview={(url) => preview({ seal: url })}
      />

      {issueAsHost && (
        <p className="mb-3 rounded-xl bg-slate-50 px-3 py-2 text-[11.5px] font-semibold leading-relaxed text-slate-600">
          Not in use: your certificates are issued in {HOST_INSTITUTION_NAME}&apos;s name and carry its seal. This seal
          is used again if you switch back to your own name.
        </p>
      )}

      <div className="space-y-2">
        <ImageDropzone
          accept={['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp']}
          onFile={choose}
          disabled={saving}
          label={seal ? 'Replace seal' : 'Add a seal'}
          help="A scan on white paper is fine — you can remove the background."
        >
          {seal ? (
            <span className="flex h-28 w-28 items-center justify-center rounded-2xl bg-surface p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={seal} alt="Seal" className="max-h-full max-w-full object-contain" />
            </span>
          ) : undefined}
        </ImageDropzone>
        {(current || file) && !remove && (
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
            Remove seal
          </button>
        )}
      </div>

      {changed && (
        <BrandingPanelActions
          warning={
            <p>
              Certificates issued <b>from now on</b> carry this. Ones already issued keep their seal.
            </p>
          }
          confirmLabel={
            remove
              ? 'I understand certificates issued from now on will carry no seal.'
              : 'I confirm this is our official seal, for certificates issued from now on.'
          }
          confirmed={confirmed}
          onConfirm={setConfirmed}
          onDiscard={reset}
          onSave={save}
          saveLabel={remove ? 'Remove seal' : 'Save seal'}
          canSave={confirmed}
          saving={saving}
        />
      )}
    </BrandingPanel>
  );
}
