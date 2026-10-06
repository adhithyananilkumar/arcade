'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, Check, Landmark, Loader2, Undo2 } from 'lucide-react';
import { Channel, ChannelSignatory, channelService } from '@/domains/channels';
import { HOST_INSTITUTION_NAME, IssuerLogoPreview } from '@/domains/credentials';
import { getAvatarUrl } from '@/shared/utils/avatar';

interface ChannelCertificateIssuerCardProps {
  channel: Channel;
  canEdit: boolean;
  /** Tells the page the choice changed, so the seal card can say whether its seal is in use. */
  onChange?: (issueAsHost: boolean) => void;
}

/**
 * Whose name an organisation's certificates are issued in (Manage → Identity & branding): its own, or
 * the host institution's. A department or club of the host issuing in the host's name gets the host
 * as issuing organisation and the host's seal, while its own logo stays beside the Arcade mark and the
 * certificate says it conducted the exam. Settings managers switch it, after a warning and a
 * confirmation. Certificates record the issuer when issued, so the switch applies to new ones only.
 *
 * Organisations only: a personal channel's certificates are always issued in the host's name.
 */
export function ChannelCertificateIssuerCard({ channel, canEdit, onChange }: ChannelCertificateIssuerCardProps) {
  const [saved, setSaved] = useState<ChannelSignatory | null>(null);
  const [loading, setLoading] = useState(canEdit);
  const [choice, setChoice] = useState<boolean | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!canEdit) return;
    let live = true;
    channelService
      .getSignatory(channel.id)
      .then((s) => {
        if (!live) return;
        setSaved(s);
        onChange?.(!!s.issueAsHost);
      })
      .catch(() => live && toast.error('Could not load the certificate issuer'))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
    // onChange is a notification, not an input: reloading on a new callback identity is not wanted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEdit, channel.id]);

  if (!canEdit || channel.isPersonal) return null;

  const current = !!saved?.issueAsHost;
  const asHost = choice ?? current;
  const changed = choice !== null && choice !== current;
  const logo = channel.iconUrl ? getAvatarUrl(channel.iconUrl) ?? null : null;
  const seal = saved?.sealUrl ? getAvatarUrl(saved.sealUrl) ?? null : null;
  const signatory =
    saved?.name && saved.title && saved.signatureUrl
      ? { name: saved.name, title: saved.title, signatureUrl: getAvatarUrl(saved.signatureUrl) ?? saved.signatureUrl }
      : null;

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
      toast.success(asHost ? `Certificates will be issued in ${HOST_INSTITUTION_NAME}'s name` : `Certificates will be issued in ${channel.name}'s name`);
      setSaved(result);
      onChange?.(!!result.issueAsHost);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not change the certificate issuer');
    } finally {
      setSaving(false);
    }
  };

  const option = (value: boolean, title: string, detail: string) => (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition-colors ${
        asHost === value ? 'border-indigo-300 bg-indigo-50/60 dark:border-indigo-500/40 dark:bg-indigo-500/10' : 'border-slate-200 hover:bg-slate-50'
      }`}
    >
      <input
        type="radio"
        name={`certificate-issuer-${channel.id}`}
        checked={asHost === value}
        onChange={() => pick(value)}
        disabled={saving}
        className="mt-0.5 h-4 w-4 accent-indigo-600"
      />
      <span className="min-w-0">
        <span className="block text-[13px] font-bold text-slate-900">{title}</span>
        <span className="mt-0.5 block text-xs font-medium leading-relaxed text-slate-500">{detail}</span>
      </span>
    </label>
  );

  return (
    <section id="certificate-issuer" className="scroll-mt-28 rounded-[20px] border border-slate-100 bg-surface p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50">
          <Landmark size={16} className="text-slate-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-extrabold tracking-tight text-slate-900">Certificate issuer</h2>
          <p className="mt-1 text-[12.5px] font-medium leading-relaxed text-slate-500">
            Whose name your certificates are issued in. A department or club of {HOST_INSTITUTION_NAME} can issue in the
            college&apos;s name.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-[12.5px] font-bold text-slate-400">
          <Loader2 size={14} className="animate-spin" /> Loading…
        </div>
      ) : (
        <>
          <div className="mt-6 grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
            <div className="space-y-3">
              {option(
                false,
                `In ${channel.name}'s name`,
                'Your organisation is the issuing organisation, with your own seal if you have one.',
              )}
              {option(
                true,
                `In ${HOST_INSTITUTION_NAME}'s name`,
                "The college is the issuing organisation and its seal is stamped. Your logo stays at the top, and the certificate says you conducted it.",
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
                asHost={asHost}
                showBadge={false}
              />
            </div>
          </div>

          {changed && (
            <div className="mt-6 space-y-4 border-t border-slate-100 pt-5">
              <div className="flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/40 dark:bg-amber-500/10">
                <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-xs font-medium leading-relaxed text-amber-900 dark:text-amber-100">
                  {asHost ? (
                    <>
                      Certificates issued <b>from now on</b> will name <b>{HOST_INSTITUTION_NAME}</b> as the issuing
                      organisation and carry its seal. Only do this if {channel.name} is part of the college and is
                      allowed to certify in its name.
                    </>
                  ) : (
                    <>
                      Certificates issued <b>from now on</b> will name <b>{channel.name}</b> as the issuing
                      organisation.
                    </>
                  )}{' '}
                  Certificates already issued keep the issuer they were issued with.
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
                  {asHost
                    ? `I confirm ${channel.name} is authorised to issue certificates in ${HOST_INSTITUTION_NAME}'s name.`
                    : `I understand certificates issued from now on will be in ${channel.name}'s name.`}
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
                  Save issuer
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}
