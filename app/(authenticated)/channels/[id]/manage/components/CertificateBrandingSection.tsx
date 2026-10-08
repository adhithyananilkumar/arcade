'use client';

import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import { AlertTriangle, Award, Check, Loader2 } from 'lucide-react';
import { Channel, ChannelSignatory, channelService } from '@/domains/channels';
import { IssuerLogoPreview } from '@/domains/credentials';
import { getAvatarUrl } from '@/shared/utils/avatar';
import { ChannelCertificateIssuerCard } from './ChannelCertificateIssuerCard';
import { ChannelLogoCard } from './ChannelLogoCard';
import { ChannelSealCard } from './ChannelSealCard';
import { ChannelSignatoryCard } from './ChannelSignatoryCard';

export type SignatoryMark = { name: string; title: string; signatureUrl: string };

/**
 * An unsaved change in one of the panels, as it would appear on the credentials. A key that is
 * absent means "no change"; `null` means "removed".
 */
export interface BrandingDraft {
  logo?: string | null;
  signatory?: SignatoryMark | null;
  seal?: string | null;
  asHost?: boolean;
}

/** Renders the one shared preview with some panel's draft applied (the croppers use it too). */
export type BrandingPreview = (override?: BrandingDraft) => ReactNode;

/**
 * Channel → Manage → Identity & branding: everything printed on the channel's badges and
 * certificates — logo, signature, issuer, seal — as panels side by side, above ONE sample
 * certificate (and badge) that shows every unsaved change at once. Each panel still saves on its
 * own, with its own warning and confirmation, because each reaches issued credentials differently.
 *
 * The logo (organisations) and the signature are required before the channel may publish: the
 * backend refuses a submission without them (`CHANNEL_BRANDING_INCOMPLETE`). The seal is optional.
 * A personal channel has no logo, issuer or seal of its own, so it gets only the signature panel.
 */
export function CertificateBrandingSection({
  channel,
  canEdit,
  onUpdate,
}: {
  channel: Channel;
  canEdit: boolean;
  onUpdate: (channel: Channel) => void;
}) {
  const personal = channel.isPersonal;
  const [saved, setSaved] = useState<ChannelSignatory | null>(null);
  const [loading, setLoading] = useState(canEdit);
  const [drafts, setDrafts] = useState<BrandingDraft>({});

  useEffect(() => {
    if (!canEdit) return;
    let live = true;
    channelService
      .getSignatory(channel.id)
      .then((s) => live && setSaved(s))
      .catch(() => live && toast.error('Could not load the certificate branding'))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [canEdit, channel.id]);

  const setDraft = useCallback(<K extends keyof BrandingDraft>(key: K, value: BrandingDraft[K] | undefined) => {
    setDrafts((current) => {
      if (value === undefined && !(key in current)) return current;
      const next = { ...current };
      if (value === undefined) delete next[key];
      else next[key] = value;
      return next;
    });
  }, []);

  const savedLogo = channel.iconUrl ? getAvatarUrl(channel.iconUrl) ?? null : null;
  const savedSignatory: SignatoryMark | null =
    saved && (saved.fixedName ?? saved.name) && saved.title && saved.signatureUrl
      ? {
          name: (saved.fixedName ?? saved.name)!,
          title: saved.title,
          signatureUrl: getAvatarUrl(saved.signatureUrl) ?? saved.signatureUrl,
        }
      : null;
  const savedSeal = saved?.sealUrl ? getAvatarUrl(saved.sealUrl) ?? null : null;
  const savedAsHost = !!saved?.issueAsHost;

  const hasLogo = personal || !!savedLogo;
  const hasSignature = !!savedSignatory;
  const missing = [!hasLogo && 'a logo', !hasSignature && 'a certificate signature'].filter(Boolean) as string[];

  const preview: BrandingPreview = (override = {}) => {
    const all = { ...drafts, ...override };
    const pick = <K extends keyof BrandingDraft>(key: K, base: BrandingDraft[K]) => (key in all ? all[key] : base);
    const signatory = pick('signatory', savedSignatory) ?? null;
    return (
      <IssuerLogoPreview
        logoSrc={pick('logo', savedLogo) ?? null}
        organisationName={personal ? saved?.fixedName ?? signatory?.name ?? '' : channel.name}
        personal={personal}
        sealSrc={pick('seal', savedSeal) ?? null}
        signatory={signatory}
        asHost={pick('asHost', savedAsHost) ?? false}
        showBadge={!personal}
      />
    );
  };

  const pending = Object.keys(drafts).length > 0;
  const panelProps = { channel, canEdit, saved, onSaved: setSaved, preview, setDraft };

  return (
    <section className="rounded-[20px] border border-slate-100 bg-surface p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50">
          <Award size={16} className="text-slate-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-[15px] font-extrabold tracking-tight text-slate-900">Badges &amp; certificates</h2>
          <p className="mt-1 text-[12.5px] font-medium leading-relaxed text-slate-500">
            {personal
              ? 'Your signature and title, printed on the certificates your exams award.'
              : 'The marks printed on the badges and certificates your organisation awards.'}
          </p>
        </div>
      </div>

      {canEdit && !loading && (
        missing.length > 0 ? (
          <div className="mt-5 flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-500/40 dark:bg-amber-500/10">
            <AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div className="text-xs font-medium leading-relaxed text-amber-900 dark:text-amber-100">
              <p className="font-bold">Required before this channel can publish</p>
              <p className="mt-0.5">
                Add {missing.join(' and ')} below. Until then, courses, events and exams from this channel cannot be
                submitted or published, because every badge and certificate they award carries these marks.
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[11.5px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
            <Check size={13} /> Ready to publish — the required marks are set
          </p>
        )
      )}

      {loading ? (
        <div className="flex items-center gap-2 py-10 text-[12.5px] font-bold text-slate-400">
          <Loader2 size={14} className="animate-spin" /> Loading…
        </div>
      ) : (
        <>
          <div
            className={`mt-6 grid items-start gap-4 ${
              personal ? 'lg:grid-cols-[minmax(0,420px)]' : 'md:grid-cols-2 xl:grid-cols-4'
            }`}
          >
            {!personal && <ChannelLogoCard {...panelProps} onUpdate={onUpdate} done={hasLogo} />}
            <ChannelSignatoryCard
              key={[saved?.name, saved?.title, saved?.signatureUrl, saved?.fixedName].join('|')}
              {...panelProps}
              done={hasSignature}
            />
            {!personal && <ChannelCertificateIssuerCard {...panelProps} />}
            {!personal && <ChannelSealCard {...panelProps} />}
          </div>

          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="mb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              {pending ? 'Preview — with your unsaved changes' : 'Preview — as issued now'}
            </p>
            <div className="mx-auto max-w-6xl">{preview()}</div>
          </div>
        </>
      )}
    </section>
  );
}

/** One panel in the row above the preview: a mark, whether it is required, and its controls. */
export function BrandingPanel({
  id,
  icon,
  title,
  description,
  requirement,
  done,
  children,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  description: ReactNode;
  requirement: 'required' | 'optional' | 'setting';
  done?: boolean;
  children: ReactNode;
}) {
  return (
    <div id={id} className="scroll-mt-28 flex h-full min-w-0 flex-col rounded-2xl border border-slate-200/70 p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
          {icon}
        </span>
        <h3 className="min-w-0 flex-1 truncate text-[13.5px] font-extrabold tracking-tight text-slate-900">{title}</h3>
        {requirement === 'required' && (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider ${
              done
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200'
            }`}
          >
            {done ? 'Done' : 'Required'}
          </span>
        )}
        {requirement === 'optional' && (
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10.5px] font-extrabold uppercase tracking-wider text-slate-500">
            Optional
          </span>
        )}
      </div>
      <p className="mt-1.5 text-[11.5px] font-medium leading-relaxed text-slate-500">{description}</p>
      <div className="mt-4 flex flex-1 flex-col">{children}</div>
    </div>
  );
}

/** The warning, confirmation and Discard/Save row a panel shows while it has an unsaved change. */
export function BrandingPanelActions({
  warning,
  confirmLabel,
  confirmed,
  onConfirm,
  onDiscard,
  onSave,
  saveLabel,
  canSave,
  saving,
}: {
  warning?: ReactNode;
  confirmLabel?: ReactNode;
  confirmed: boolean;
  onConfirm: (value: boolean) => void;
  onDiscard: () => void;
  onSave: () => void;
  saveLabel: string;
  canSave: boolean;
  saving: boolean;
}) {
  return (
    <div className="mt-4 space-y-3 border-t border-slate-100 pt-4">
      {warning && (
        <div className="flex gap-2 rounded-xl border border-amber-300 bg-amber-50 p-3 dark:border-amber-500/40 dark:bg-amber-500/10">
          <AlertTriangle size={15} className="mt-0.5 shrink-0 text-amber-600 dark:text-amber-400" />
          <div className="space-y-1 text-[11.5px] font-medium leading-relaxed text-amber-900 dark:text-amber-100">{warning}</div>
        </div>
      )}
      {confirmLabel && (
        <label className="flex cursor-pointer items-start gap-2 text-[11.5px] font-semibold leading-relaxed text-slate-700">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => onConfirm(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-indigo-600"
          />
          <span>{confirmLabel}</span>
        </label>
      )}
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={onDiscard}
          disabled={saving}
          className="rounded-xl border border-slate-200 bg-surface px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
        >
          Discard
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!canSave || saving}
          className="inline-flex items-center gap-1.5 rounded-xl bg-ink px-4 py-2 text-xs font-extrabold text-on-ink transition-all hover:bg-ink-hover active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
          {saveLabel}
        </button>
      </div>
    </div>
  );
}

export interface BrandingPanelProps {
  channel: Channel;
  canEdit: boolean;
  saved: ChannelSignatory | null;
  onSaved: (signatory: ChannelSignatory) => void;
  preview: BrandingPreview;
  setDraft: <K extends keyof BrandingDraft>(key: K, value: BrandingDraft[K] | undefined) => void;
}
