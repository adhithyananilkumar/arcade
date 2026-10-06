'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, Check, Info, Loader2, PenLine, Trash2, Undo2 } from 'lucide-react';
import { Channel, ChannelSignatory, channelService } from '@/domains/channels';
import { HOST_INSTITUTION_NAME, IssuerLogoPreview } from '@/domains/credentials';
import { ImageCropModal } from '@/shared/design-system/ui/image-crop-modal';
import { getAvatarUrl } from '@/shared/utils/avatar';
import { hasTransparentBackground, rasteriseSvg } from '@/shared/utils/image';
import { ImageDropzone } from './ImageDropzone';

interface ChannelSignatoryCardProps {
  channel: Channel;
  canEdit: boolean;
}

const SIGNATURE_MAX_BYTES = 1_000_000;

/**
 * Who signs this channel's certificates (Manage → Identity & branding): a signature, a name and a
 * title, printed in the middle of the certificate's bottom row.
 *
 * An organisation names its signatory (e.g. its Director). A personal channel is a person, not an
 * issuing institution: the host institution issues its certificates, and they say they were
 * conducted by the channel's owner, who signs them — so here the name is always the owner's own
 * (the backend enforces it) and only the title and the signature are theirs to set.
 *
 * Certificates copy the signatory when they are issued, so a change applies only to certificates
 * issued from now on.
 */
export function ChannelSignatoryCard({ channel, canEdit }: ChannelSignatoryCardProps) {
  const personal = channel.isPersonal;
  const [saved, setSaved] = useState<ChannelSignatory | null>(null);
  // Only those who manage the channel may read the signatory; the card renders nothing otherwise.
  const [loading, setLoading] = useState(canEdit);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [cropSource, setCropSource] = useState<File | null>(null);
  const [remove, setRemove] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = (s: ChannelSignatory) => {
    setSaved(s);
    setName(s.fixedName ?? s.name ?? '');
    setTitle(s.title ?? (s.fixedName ? 'Instructor' : ''));
    setFile(null);
    setFileUrl(null);
    setRemove(false);
    setConfirmed(false);
  };

  useEffect(() => {
    if (!canEdit) return;
    let live = true;
    channelService
      .getSignatory(channel.id)
      .then((s) => live && load(s))
      .catch(() => live && toast.error('Could not load the certificate signatory'))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [canEdit, channel.id]);

  useEffect(() => () => { if (fileUrl) URL.revokeObjectURL(fileUrl); }, [fileUrl]);

  if (!canEdit) return null;

  const fixedName = saved?.fixedName ?? null;
  const currentImage = saved?.signatureUrl ? getAvatarUrl(saved.signatureUrl) ?? null : null;
  const image = remove ? null : fileUrl ?? currentImage;
  const effectiveName = (fixedName ?? name).trim();
  const nameOk = effectiveName.length >= 2 && effectiveName.length <= 120;
  const titleOk = title.trim().length >= 2 && title.trim().length <= 120;
  const changed =
    remove ||
    file !== null ||
    (!fixedName && name.trim() !== (saved?.name ?? '')) ||
    title.trim() !== (saved?.title ?? (fixedName ? 'Instructor' : ''));
  const valid = remove || (nameOk && titleOk && image !== null);
  const signatory = !remove && image && effectiveName && title.trim()
    ? { name: effectiveName, title: title.trim(), signatureUrl: image }
    : null;

  const choose = async (picked: File) => {
    if (picked.type === 'image/svg+xml') {
      try {
        setCropSource(await rasteriseSvg(picked, 1600));
      } catch {
        toast.error('That SVG could not be read. Try exporting it again, or use a PNG.');
      }
      return;
    }
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(picked.type)) {
      toast.error('Use an image of the signature: PNG, SVG, JPEG or WebP.');
      return;
    }
    setCropSource(picked);
  };

  const cropped = async (croppedFile: File) => {
    if (croppedFile.type !== 'image/png') {
      toast.error('Use "Remove white background" first: the signature must be transparent to sit on the certificate paper.');
      return; // the cropper stays open so it can be fixed there
    }
    if (croppedFile.size > SIGNATURE_MAX_BYTES) {
      toast.error('That signature image is over 1 MB. Crop it tighter.');
      return;
    }
    const url = URL.createObjectURL(croppedFile);
    // A signature on a white box would print as a box over the certificate paper.
    if (!(await hasTransparentBackground(url).catch(() => false))) {
      URL.revokeObjectURL(url);
      toast.error('This signature still has a background. Use "Remove white background" in the cropper.');
      return;
    }
    setCropSource(null);
    setFile(croppedFile);
    setFileUrl(url);
    setRemove(false);
    setConfirmed(false);
  };

  const save = async () => {
    if (!changed || !valid || !confirmed) return;
    try {
      setSaving(true);
      const result = await channelService.updateSignatory(
        channel.id,
        remove ? { remove: true } : { name: effectiveName, title: title.trim(), signatureFile: file ?? undefined },
      );
      toast.success(remove ? 'Signature removed' : 'Signature saved');
      load(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save the signature');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'mt-2 w-full rounded-xl border border-slate-200 bg-surface px-3.5 py-2.5 text-[13.5px] font-semibold text-slate-900 outline-none transition-colors focus:border-slate-900 placeholder:font-medium placeholder:text-slate-300 disabled:bg-slate-50 disabled:text-slate-500';

  return (
    <section id="signatory" className="scroll-mt-28 rounded-[20px] border border-slate-100 bg-surface p-6">
      <ImageCropModal
        open={cropSource !== null}
        file={cropSource}
        aspectOptions={[
          { label: 'Free', value: undefined },
          { label: 'Wide 3:1', value: 3 },
          { label: 'Wide 4:1', value: 4 },
        ]}
        transparency
        title="Crop the signature"
        hint="Photographed or scanned on paper? Remove the white background, then trim the empty edges."
        onCancel={() => setCropSource(null)}
        onCropped={cropped}
        preview={(url) => (
          <IssuerLogoPreview
            logoSrc={channel.iconUrl ? getAvatarUrl(channel.iconUrl) ?? null : null}
            organisationName={personal ? effectiveName : channel.name}
            personal={personal}
            signatory={url ? { name: effectiveName || 'Signatory', title: title.trim() || 'Title', signatureUrl: url } : null}
            showBadge={false}
          />
        )}
      />

      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50">
          <PenLine size={16} className="text-slate-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-extrabold tracking-tight text-slate-900">Certificate signature</h2>
          <p className="mt-1 text-[12.5px] font-medium leading-relaxed text-slate-500">
            {personal
              ? 'Your signature, name and title, printed in the middle of the certificates your exams award.'
              : "The person who signs your organisation's certificates, e.g. its Director."}
          </p>
        </div>
      </div>

      {personal && (
        <div className="mt-5 flex gap-3 rounded-2xl border border-sky-200 bg-sky-50/70 p-4 dark:border-sky-500/30 dark:bg-sky-500/10">
          <Info size={17} className="mt-0.5 shrink-0 text-sky-600 dark:text-sky-300" />
          <p className="text-xs font-medium leading-relaxed text-sky-900 dark:text-sky-100">
            Certificates from a personal channel are issued by <b>{HOST_INSTITUTION_NAME}</b> through Arcade, and say
            the exam was <b>conducted by {effectiveName || 'you'}</b>. Your channel&apos;s name does not appear on them.
          </p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-[12.5px] font-bold text-slate-400">
          <Loader2 size={14} className="animate-spin" /> Loading…
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
            <div className="space-y-4">
              <ImageDropzone
                accept={['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp']}
                onFile={choose}
                disabled={saving}
                label={image ? 'Replace signature' : 'Add a signature'}
                help="Drop, paste or browse. A photo of it on white paper is fine — you can remove the background."
              >
                {image ? (
                  <span className="flex h-20 w-full items-center justify-center rounded-xl bg-white px-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt="Signature" className="max-h-16 max-w-full object-contain" />
                  </span>
                ) : undefined}
              </ImageDropzone>

              <div>
                <label htmlFor="signatory-name" className="block text-[12.5px] font-extrabold tracking-tight text-slate-700">
                  Name
                </label>
                <input
                  id="signatory-name"
                  value={fixedName ?? name}
                  disabled={!!fixedName}
                  onChange={(e) => {
                    setName(e.target.value);
                    setRemove(false);
                    setConfirmed(false);
                  }}
                  maxLength={120}
                  placeholder="e.g. Dr. Jane Mathew"
                  className={inputClass}
                />
                {fixedName && (
                  <p className="mt-1.5 text-[11px] font-medium text-slate-500">
                    Your profile name. Change it in your profile settings.
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="signatory-title" className="block text-[12.5px] font-extrabold tracking-tight text-slate-700">
                  Title
                </label>
                <input
                  id="signatory-title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setRemove(false);
                    setConfirmed(false);
                  }}
                  maxLength={120}
                  placeholder={personal ? 'e.g. Instructor' : 'e.g. Director'}
                  className={inputClass}
                />
              </div>

              {(saved?.signatureUrl || file) && !remove && (
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
                  Remove signature
                </button>
              )}
            </div>

            <div className="min-w-0">
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                {changed ? 'After this change' : 'Currently'}
              </p>
              <IssuerLogoPreview
                logoSrc={channel.iconUrl ? getAvatarUrl(channel.iconUrl) ?? null : null}
                organisationName={personal ? effectiveName : channel.name}
                personal={personal}
                signatory={signatory}
                showBadge={false}
              />
              {!signatory && (
                <p className="mt-2 text-[11px] font-medium text-slate-500">
                  {remove
                    ? 'Without a signature, certificates show only the date and the issuing organisation.'
                    : 'Add a signature, a name and a title to see them on the certificate.'}
                </p>
              )}
            </div>
          </div>

          {changed && (
            <div className="mt-6 space-y-4 border-t border-slate-100 pt-5">
              <div className="flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/40 dark:bg-amber-500/10">
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-xs font-medium leading-relaxed text-amber-900 dark:text-amber-100">
                  Certificates issued <b>from now on</b> carry this. Certificates already issued keep the signature they
                  were issued with.
                </p>
              </div>
              {valid && (
                <label className="flex cursor-pointer items-start gap-2.5 text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={confirmed}
                    onChange={(e) => setConfirmed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-indigo-600"
                  />
                  <span>
                    {remove
                      ? 'I understand certificates issued from now on will not be signed.'
                      : personal
                        ? 'This is my own signature, and I agree to it being printed on certificates issued from now on.'
                        : 'I confirm this signatory has agreed to sign our certificates, and that it applies to certificates issued from now on.'}
                  </span>
                </label>
              )}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => saved && load(saved)}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-surface px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  <Undo2 size={13} /> Discard
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={!valid || !confirmed || saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-ink px-5 py-2.5 text-xs font-extrabold text-on-ink transition-all hover:bg-ink-hover active:scale-[0.98] disabled:opacity-50"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  {remove ? 'Remove signature' : 'Save signature'}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
