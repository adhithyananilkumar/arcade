'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Info, PenLine, Trash2 } from 'lucide-react';
import { ChannelSignatory, channelService } from '@/domains/channels';
import { HOST_INSTITUTION_NAME } from '@/domains/credentials';
import { ImageCropModal } from '@/shared/design-system/ui/image-crop-modal';
import { getAvatarUrl } from '@/shared/utils/avatar';
import { hasTransparentBackground, rasteriseSvg } from '@/shared/utils/image';
import { BrandingPanel, BrandingPanelActions, type BrandingPanelProps } from './CertificateBrandingSection';
import { ImageDropzone } from './ImageDropzone';

interface ChannelSignatoryCardProps extends BrandingPanelProps {
  /** A complete signatory is saved (the channel may publish as far as the signature goes). */
  done: boolean;
}

const SIGNATURE_MAX_BYTES = 1_000_000;

/**
 * Who signs this channel's certificates (Manage → Identity & branding, a panel of
 * `CertificateBrandingSection`): a signature, a name and a title, printed in the middle of the
 * certificate's bottom row. Required before the channel may publish.
 *
 * An organisation names its signatory (e.g. its Director). A personal channel is a person, not an
 * issuing institution: the host institution issues its certificates, and they say they were
 * conducted by the channel's owner, who signs them — so here the name is always the owner's own
 * (the backend enforces it) and only the title and the signature are theirs to set.
 *
 * Certificates copy the signatory when they are issued, so a change applies only to certificates
 * issued from now on.
 */
export function ChannelSignatoryCard({ channel, canEdit, saved, onSaved, preview, setDraft, done }: ChannelSignatoryCardProps) {
  const personal = channel.isPersonal;
  // The section remounts this panel (by `key`) when the saved signatory changes, so the form starts
  // from it; saving the seal or issuer next door leaves an edit in progress here alone.
  const [name, setName] = useState(saved?.fixedName ?? saved?.name ?? '');
  const [title, setTitle] = useState(saved?.title ?? (saved?.fixedName ? 'Instructor' : ''));
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [cropSource, setCropSource] = useState<File | null>(null);
  const [remove, setRemove] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = (s: ChannelSignatory | null) => {
    setName(s?.fixedName ?? s?.name ?? '');
    setTitle(s?.title ?? (s?.fixedName ? 'Instructor' : ''));
    setFile(null);
    setFileUrl(null);
    setRemove(false);
    setConfirmed(false);
  };

  useEffect(() => () => { if (fileUrl) URL.revokeObjectURL(fileUrl); }, [fileUrl]);

  const fixedName = saved?.fixedName ?? null;
  const currentImage = saved?.signatureUrl ? getAvatarUrl(saved.signatureUrl) ?? null : null;
  const image = remove ? null : fileUrl ?? currentImage;
  const effectiveName = (fixedName ?? name).trim();
  const trimmedTitle = title.trim();
  const nameOk = effectiveName.length >= 2 && effectiveName.length <= 120;
  const titleOk = trimmedTitle.length >= 2 && trimmedTitle.length <= 120;
  const changed =
    remove ||
    file !== null ||
    (!fixedName && name.trim() !== (saved?.name ?? '')) ||
    trimmedTitle !== (saved?.title ?? (fixedName ? 'Instructor' : ''));
  const valid = remove || (nameOk && titleOk && image !== null);

  useEffect(() => {
    setDraft(
      'signatory',
      !changed
        ? undefined
        : !remove && image && effectiveName && trimmedTitle
          ? { name: effectiveName, title: trimmedTitle, signatureUrl: image }
          : null,
    );
  }, [changed, remove, image, effectiveName, trimmedTitle, setDraft]);

  if (!canEdit) return null;

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
        remove ? { remove: true } : { name: effectiveName, title: trimmedTitle, signatureFile: file ?? undefined },
      );
      toast.success(remove ? 'Signature removed' : 'Signature saved');
      onSaved(result); // remounts this panel with the saved signatory
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not save the signature');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'mt-1.5 w-full rounded-xl border border-slate-200 bg-surface px-3 py-2 text-[13px] font-semibold text-slate-900 outline-none transition-colors focus:border-slate-900 placeholder:font-medium placeholder:text-slate-300 disabled:bg-slate-50 disabled:text-slate-500';

  return (
    <BrandingPanel
      id="signatory"
      icon={<PenLine size={14} />}
      title="Signature"
      requirement="required"
      done={done}
      description={
        personal
          ? 'Your signature, name and title, printed in the middle of your certificates.'
          : "The person who signs your certificates, e.g. your Director."
      }
    >
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
        preview={(url) =>
          preview({
            signatory: url ? { name: effectiveName || 'Signatory', title: trimmedTitle || 'Title', signatureUrl: url } : null,
          })
        }
      />

      {personal && (
        <div className="mb-4 flex gap-2 rounded-xl border border-sky-200 bg-sky-50/70 p-3 dark:border-sky-500/30 dark:bg-sky-500/10">
          <Info size={15} className="mt-0.5 shrink-0 text-sky-600 dark:text-sky-300" />
          <p className="text-[11.5px] font-medium leading-relaxed text-sky-900 dark:text-sky-100">
            Certificates from a personal channel are issued by <b>{HOST_INSTITUTION_NAME}</b> through Arcade, and say the
            exam was <b>conducted by {effectiveName || 'you'}</b>. Your channel&apos;s name does not appear on them.
          </p>
        </div>
      )}

      <div className="space-y-3">
        <ImageDropzone
          accept={['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp']}
          onFile={choose}
          disabled={saving}
          label={image ? 'Replace signature' : 'Add a signature'}
          help="A photo on white paper is fine — you can remove the background."
        >
          {image ? (
            <span className="flex h-20 w-full items-center justify-center rounded-xl bg-surface px-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="Signature" className="max-h-16 max-w-full object-contain" />
            </span>
          ) : undefined}
        </ImageDropzone>

        <div>
          <label htmlFor="signatory-name" className="block text-[12px] font-extrabold tracking-tight text-slate-700">
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
            <p className="mt-1 text-[11px] font-medium text-slate-500">Your profile name. Change it in your profile settings.</p>
          )}
        </div>
        <div>
          <label htmlFor="signatory-title" className="block text-[12px] font-extrabold tracking-tight text-slate-700">
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
        {remove && (
          <p className="text-[11px] font-medium leading-relaxed text-rose-600 dark:text-rose-400">
            Without a signature, certificates show only the date and the issuer — and the channel cannot publish new
            content.
          </p>
        )}
      </div>

      {changed && (
        <BrandingPanelActions
          warning={
            <p>
              Certificates issued <b>from now on</b> carry this. Ones already issued keep their signature.
            </p>
          }
          confirmLabel={
            valid
              ? remove
                ? 'I understand certificates issued from now on will not be signed.'
                : personal
                  ? 'This is my own signature, and I agree to it being printed on certificates issued from now on.'
                  : 'I confirm this signatory has agreed to sign our certificates, from now on.'
              : undefined
          }
          confirmed={confirmed}
          onConfirm={setConfirmed}
          onDiscard={() => load(saved)}
          onSave={save}
          saveLabel={remove ? 'Remove signature' : 'Save signature'}
          canSave={valid && confirmed}
          saving={saving}
        />
      )}
    </BrandingPanel>
  );
}
