'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, Check, Loader2, Stamp, Trash2, Undo2 } from 'lucide-react';
import { Channel, ChannelSignatory, channelService } from '@/domains/channels';
import { HOST_INSTITUTION_NAME, IssuerLogoPreview } from '@/domains/credentials';
import { ImageCropModal } from '@/shared/design-system/ui/image-crop-modal';
import { getAvatarUrl } from '@/shared/utils/avatar';
import { hasTransparentBackground, rasteriseSvg } from '@/shared/utils/image';
import { ImageDropzone } from './ImageDropzone';

interface ChannelSealCardProps {
  channel: Channel;
  canEdit: boolean;
  /** The organisation issues in the host's name, so its certificates carry the host's seal, not this one. */
  issueAsHost?: boolean;
}

const SEAL_MAX_BYTES = 1_000_000;

/**
 * An organisation's certificate seal (Manage → Identity & branding): a transparent PNG stamped above
 * its name in the certificate's issuer column. Optional. Certificates copy it when issued, so a
 * change applies only to certificates issued from now on.
 *
 * Organisations only: a personal channel's certificates are issued by the host institution.
 */
export function ChannelSealCard({ channel, canEdit, issueAsHost = false }: ChannelSealCardProps) {
  const [saved, setSaved] = useState<ChannelSignatory | null>(null);
  const [loading, setLoading] = useState(canEdit);
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [cropSource, setCropSource] = useState<File | null>(null);
  const [remove, setRemove] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!canEdit) return;
    let live = true;
    channelService
      .getSignatory(channel.id)
      .then((s) => live && setSaved(s))
      .catch(() => live && toast.error('Could not load the certificate seal'))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [canEdit, channel.id]);

  useEffect(() => () => { if (fileUrl) URL.revokeObjectURL(fileUrl); }, [fileUrl]);

  if (!canEdit || channel.isPersonal) return null;

  const current = saved?.sealUrl ? getAvatarUrl(saved.sealUrl) ?? null : null;
  const seal = remove ? null : fileUrl ?? current;
  const changed = remove || file !== null;
  const logo = channel.iconUrl ? getAvatarUrl(channel.iconUrl) ?? null : null;
  const signatory =
    saved?.name && saved.title && saved.signatureUrl
      ? { name: saved.name, title: saved.title, signatureUrl: getAvatarUrl(saved.signatureUrl) ?? saved.signatureUrl }
      : null;

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
      setSaved(result);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save the seal');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section id="seal" className="scroll-mt-28 rounded-[20px] border border-slate-100 bg-surface p-6">
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
        preview={(url) => (
          <IssuerLogoPreview logoSrc={logo} organisationName={channel.name} sealSrc={url} signatory={signatory} showBadge={false} />
        )}
      />

      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50">
          <Stamp size={16} className="text-slate-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-extrabold tracking-tight text-slate-900">Certificate seal</h2>
          <p className="mt-1 text-[12.5px] font-medium leading-relaxed text-slate-500">
            Optional. Your organisation&apos;s seal, stamped above its name on your certificates.
          </p>
          {issueAsHost && (
            <p className="mt-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-semibold leading-relaxed text-slate-600">
              Not in use: your certificates are issued in {HOST_INSTITUTION_NAME}&apos;s name and carry its seal. This
              seal is used again if you switch back to issuing in your own name.
            </p>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-[12.5px] font-bold text-slate-400">
          <Loader2 size={14} className="animate-spin" /> Loading…
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
            <div className="space-y-3">
              <ImageDropzone
                accept={['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp']}
                onFile={choose}
                disabled={saving}
                label={seal ? 'Replace seal' : 'Add a seal'}
                help="Drop, paste or browse. A scan on white paper is fine — you can remove the background."
              >
                {seal ? (
                  <span className="flex h-28 w-28 items-center justify-center rounded-2xl bg-white p-2">
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

            <div className="min-w-0">
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                {changed ? 'After this change' : 'Currently'}
              </p>
              <IssuerLogoPreview
                logoSrc={logo}
                organisationName={channel.name}
                sealSrc={seal}
                signatory={signatory}
                showBadge={false}
              />
            </div>
          </div>

          {changed && (
            <div className="mt-6 space-y-4 border-t border-slate-100 pt-5">
              <div className="flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/40 dark:bg-amber-500/10">
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-xs font-medium leading-relaxed text-amber-900 dark:text-amber-100">
                  Certificates issued <b>from now on</b> carry this. Certificates already issued keep the seal they were
                  issued with.
                </p>
              </div>
              <label className="flex cursor-pointer items-start gap-2.5 text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-indigo-600"
                />
                <span>
                  {remove
                    ? 'I understand certificates issued from now on will carry no seal.'
                    : 'I confirm this is our official seal, and that it applies to certificates issued from now on.'}
                </span>
              </label>
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
                  disabled={!confirmed || saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-xs font-extrabold text-on-ink transition-all hover:bg-ink-hover active:scale-[0.98] disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {remove ? 'Remove seal' : 'Save seal'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
