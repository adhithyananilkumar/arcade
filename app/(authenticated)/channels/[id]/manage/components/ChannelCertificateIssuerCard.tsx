'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Landmark } from 'lucide-react';
import { channelService } from '@/domains/channels';
import { HOST_INSTITUTION_NAME } from '@/domains/credentials';
import { BrandingPanel, BrandingPanelActions, type BrandingPanelProps } from './CertificateBrandingSection';

/**
 * Whose name an organisation's certificates are issued in (Manage → Identity & branding, a panel of
 * `CertificateBrandingSection`): its own, or the host institution's. A department or club of the host
 * issuing in the host's name gets the host as issuing organisation and the host's seal, while its own
 * logo stays beside the Arcade mark and the certificate says it conducted the exam. Settings managers
 * switch it, after a warning and a confirmation. Certificates record the issuer when issued, so the
 * switch applies to new ones only.
 *
 * Organisations only: a personal channel's certificates are always issued in the host's name.
 */
export function ChannelCertificateIssuerCard({ channel, canEdit, saved, onSaved, setDraft }: BrandingPanelProps) {
  const [choice, setChoice] = useState<boolean | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);

  const current = !!saved?.issueAsHost;
  const asHost = choice ?? current;
  const changed = choice !== null && choice !== current;

  useEffect(() => setDraft('asHost', changed ? asHost : undefined), [changed, asHost, setDraft]);

  if (!canEdit || channel.isPersonal) return null;

  const pick = (value: boolean) => {
    setChoice(value === current ? null : value);
    setConfirmed(false);
  };

  const reset = () => {
    setChoice(null);
    setConfirmed(false);
  };

  const save = async () => {
    if (!changed || !confirmed) return;
    try {
      setSaving(true);
      const result = await channelService.updateCertificateIssuer(channel.id, asHost);
      toast.success(
        asHost
          ? `Certificates will be issued in ${HOST_INSTITUTION_NAME}'s name`
          : `Certificates will be issued in ${channel.name}'s name`,
      );
      onSaved(result);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not change the certificate issuer');
    } finally {
      setSaving(false);
    }
  };

  const option = (value: boolean, title: string, detail: string) => (
    <label
      className={`flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition-colors ${
        asHost === value
          ? 'border-indigo-300 bg-indigo-50/60 dark:border-indigo-500/40 dark:bg-indigo-500/10'
          : 'border-slate-200 hover:bg-slate-50'
      }`}
    >
      <input
        type="radio"
        name={`certificate-issuer-${channel.id}`}
        checked={asHost === value}
        onChange={() => pick(value)}
        disabled={saving}
        className="mt-0.5 h-4 w-4 shrink-0 accent-indigo-600"
      />
      <span className="min-w-0">
        <span className="block text-[12.5px] font-bold text-slate-900">{title}</span>
        <span className="mt-0.5 block text-[11.5px] font-medium leading-relaxed text-slate-500">{detail}</span>
      </span>
    </label>
  );

  return (
    <BrandingPanel
      id="certificate-issuer"
      icon={<Landmark size={14} />}
      title="Issued in the name of"
      requirement="setting"
      description={`A department or club of ${HOST_INSTITUTION_NAME} can issue in the college's name.`}
    >
      <div className="space-y-2">
        {option(false, channel.name, 'You are the issuing organisation, with your own seal if you have one.')}
        {option(
          true,
          HOST_INSTITUTION_NAME,
          'The college issues, with its seal. Your logo stays at the top and the certificate says you conducted it.',
        )}
      </div>

      {changed && (
        <BrandingPanelActions
          warning={
            <p>
              {asHost ? (
                <>
                  Certificates issued <b>from now on</b> will name <b>{HOST_INSTITUTION_NAME}</b> as issuer and carry
                  its seal. Only do this if {channel.name} is part of the college and may certify in its name.
                </>
              ) : (
                <>
                  Certificates issued <b>from now on</b> will name <b>{channel.name}</b> as issuer.
                </>
              )}{' '}
              Ones already issued keep their issuer.
            </p>
          }
          confirmLabel={
            asHost
              ? `I confirm ${channel.name} is authorised to issue certificates in ${HOST_INSTITUTION_NAME}'s name.`
              : `I understand certificates issued from now on will be in ${channel.name}'s name.`
          }
          confirmed={confirmed}
          onConfirm={setConfirmed}
          onDiscard={reset}
          onSave={save}
          saveLabel="Save issuer"
          canSave={confirmed}
          saving={saving}
        />
      )}
    </BrandingPanel>
  );
}
