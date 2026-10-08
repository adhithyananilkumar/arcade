'use client';

/**
 * One earned badge, opened from the wallet, in the Achievements slide-over panel: the artwork (click
 * to spin it again), where it sits on the level standard, what it certifies, and everything the
 * holder can do with it — open the public credential page, add it to LinkedIn, download the
 * artwork, and choose whether it is public.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft, Calendar, Check, Copy, Download, ExternalLink, Eye, EyeOff, Loader2, ShieldAlert, ShieldCheck, X,
} from 'lucide-react';
import {
  CredentialBadge,
  LinkedInGlyph,
  TIER_STYLE,
  TierLadder,
  credentialPath,
  credentialsApi,
  downloadBadgeImage,
  linkedInAddToProfileUrl,
  type BadgeLevel,
  type BadgeTierInfo,
  type IssuedBadge,
} from '@/domains/credentials';
import { cn } from '@/shared/utils/utils';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

export interface BadgeDetailPanelProps {
  badge: IssuedBadge | null;
  tiers: BadgeTierInfo[];
  onClose: () => void;
  onChanged: (badge: IssuedBadge) => void;
}

export function BadgeDetailPanel({ badge, tiers, onClose, onChanged }: BadgeDetailPanelProps) {
  useEffect(() => {
    if (!badge) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [badge, onClose]);

  return (
    <AnimatePresence>
      {badge && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label={`${badge.name} badge`}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 cursor-pointer arcade-modal-backdrop"
          />
          <div className="absolute inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="flex w-screen max-w-md flex-col overflow-y-auto border-l border-slate-200/80 bg-surface p-6 shadow-2xl sm:max-w-[480px] sm:p-8"
            >
              <PanelBody key={badge.credentialCode} badge={badge} tiers={tiers} onClose={onClose} onChanged={onChanged} />
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

function PanelBody({ badge, tiers, onClose, onChanged }: { badge: IssuedBadge; tiers: BadgeTierInfo[]; onClose: () => void; onChanged: (b: IssuedBadge) => void }) {
  const [copied, setCopied] = useState<'id' | 'link' | null>(null);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [downloading, setDownloading] = useState<'png' | 'svg' | null>(null);
  const [spinKey, setSpinKey] = useState(0);

  const level = badge.badgeClass.tier.level as BadgeLevel;
  const family = badge.badgeClass.family.key;
  const style = TIER_STYLE[level];
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  const publicUrl = `${origin}${credentialPath(badge.credentialCode)}`;

  const copy = async (text: string, what: 'id' | 'link') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      toast.error('Could not copy to the clipboard');
    }
  };

  const toggleVisibility = async () => {
    setSavingVisibility(true);
    try {
      const next = await credentialsApi.setVisibility(badge.credentialCode, !badge.publicVisible);
      onChanged(next);
      toast.success(next.publicVisible ? 'Badge is public' : 'Badge is now private');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not change visibility');
    } finally {
      setSavingVisibility(false);
    }
  };

  const download = async (format: 'png' | 'svg') => {
    setDownloading(format);
    try {
      await downloadBadgeImage(family, level, badge.name, `${badge.name} - Arcade Level ${level} badge`, format, badge.issuerLogoUrl);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Download failed');
    } finally {
      setDownloading(null);
    }
  };

  const secondary =
    'inline-flex items-center justify-center gap-1.5 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md border border-slate-200 bg-surface px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-50';

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <button
          type="button"
          onClick={onClose}
          className="group/back rounded-full p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          title="Go back to Achievements"
        >
          <ArrowLeft className="h-5 w-5 transition-transform group-hover/back:-translate-x-0.5" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          title="Close"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Hero */}
      <div className="flex flex-col items-center py-6 text-center">
        <div className="relative mb-5 flex w-full flex-col items-center justify-center pb-2 pt-4" style={{ perspective: 1000 }}>
          <motion.div
            key={`glow-${spinKey}`}
            initial={{ opacity: 0.2, scale: 0.6 }}
            animate={{ opacity: [0.2, 0.6, 0.35, 0.55, 0.4], scale: [0.6, 1.25, 0.95, 1.15, 1.05] }}
            transition={{ duration: 6, ease: 'easeOut' }}
            className="pointer-events-none absolute -z-10 h-48 w-48 rounded-full bg-gradient-to-tr from-slate-300/40 via-slate-200/30 to-transparent blur-2xl"
          />
          <motion.button
            type="button"
            key={`spin-${spinKey}`}
            initial={{ rotateY: 0, scale: 0.6, opacity: 0 }}
            animate={{ rotateY: [0, 720, 1080], scale: [0.6, 1.05, 1], opacity: [0, 1, 1] }}
            transition={{ duration: 2.4, ease: [0.16, 1, 0.3, 1], times: [0, 0.6, 1] }}
            style={{ transformStyle: 'preserve-3d' }}
            onClick={() => setSpinKey((k) => k + 1)}
            title="Click to spin the badge again"
            className="w-44 cursor-pointer select-none drop-shadow-[0_18px_30px_rgba(20,20,43,0.18)]"
          >
            <CredentialBadge
              family={family}
              level={level}
              title={badge.name}
              issuerLogoUrl={badge.issuerLogoUrl}
              year={new Date(badge.issuedAt).getFullYear()}
              revoked={badge.revoked}
              label={`${badge.badgeClass.name} — ${badge.name}`}
            />
          </motion.button>
        </div>

        <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold', style.chip)}>{badge.badgeClass.tier.label}</span>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">{badge.name}</h2>
        <p className="mt-1.5 text-sm text-slate-500">
          {badge.badgeClass.family.label} · issued by{' '}
          {badge.issuerHandle ? (
            <Link href={`/${badge.issuerHandle}`} className="font-bold text-slate-800 hover:underline">
              {badge.issuerName}
            </Link>
          ) : (
            <span className="font-bold text-slate-800">{badge.issuerName}</span>
          )}
        </p>
        <div className="mt-2 flex items-center justify-center gap-1.5 text-xs font-bold">
          {badge.revoked ? (
            <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="h-4 w-4" /> Revoked{badge.revokedReason ? ` — ${badge.revokedReason}` : ''}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" /> Verified · <Calendar className="h-3.5 w-3.5" /> {formatDate(badge.issuedAt)}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-5">
        {/* Criteria */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Earning criteria</p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{badge.criteria}</p>
          {badge.contentPath && (
            <Link href={badge.contentPath} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#2962D6] hover:underline dark:text-[#7eb5ff]">
              View the {badge.contentType.toLowerCase()} <ExternalLink size={11} />
            </Link>
          )}
        </div>

        {/* Credential ID */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Credential ID</p>
          <div className="mt-1.5 flex items-center gap-2">
            <code className="rounded-lg border border-slate-200 bg-surface px-3 py-1.5 font-mono text-sm font-bold tracking-wider text-slate-800">
              {badge.credentialCode}
            </code>
            <button
              type="button"
              onClick={() => copy(badge.credentialCode, 'id')}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              aria-label="Copy credential ID"
            >
              {copied === 'id' ? <Check size={14} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Actions */}
        {!badge.revoked && (
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={credentialPath(badge.credentialCode)}
              target="_blank"
              className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-ink px-4 py-3 text-xs font-bold text-on-ink transition-colors hover:bg-ink-hover"
            >
              <ExternalLink size={14} /> Open credential page
            </Link>
            <a
              href={linkedInAddToProfileUrl({ credentialCode: badge.credentialCode, name: badge.name, issuedAt: badge.issuedAt, url: publicUrl })}
              target="_blank"
              rel="noopener noreferrer"
              className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-[#0A66C2] px-4 py-3 text-xs font-bold text-white hover:bg-[#0958a8]"
            >
              <LinkedInGlyph size={14} /> Add to LinkedIn
            </a>
            <button type="button" onClick={() => copy(publicUrl, 'link')} className={cn(secondary, 'col-span-2')}>
              {copied === 'link' ? <Check size={14} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={14} />} Copy share link
            </button>
            <button type="button" onClick={() => download('png')} disabled={downloading !== null} className={secondary}>
              {downloading === 'png' ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />} PNG
            </button>
            <button type="button" onClick={() => download('svg')} disabled={downloading !== null} className={secondary}>
              {downloading === 'svg' ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />} SVG
            </button>
          </div>
        )}

        {/* Visibility */}
        {!badge.revoked && (
          <button
            type="button"
            onClick={toggleVisibility}
            disabled={savingVisibility}
            className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200/80 px-4 py-3 text-left transition hover:bg-slate-50 disabled:opacity-60"
          >
            <span className="flex items-center gap-3">
              {badge.publicVisible ? <Eye size={16} className="text-emerald-600 dark:text-emerald-400" /> : <EyeOff size={16} className="text-slate-400" />}
              <span>
                <span className="block text-sm font-bold text-slate-800">{badge.publicVisible ? 'Public' : 'Private'}</span>
                <span className="block text-xs text-slate-500">
                  {badge.publicVisible
                    ? 'Shown on your profile; anyone with the link can view and verify it.'
                    : 'Hidden from your profile and its page. The ID still verifies for anyone you give it to.'}
                </span>
              </span>
            </span>
            <span aria-hidden className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', badge.publicVisible ? 'bg-emerald-500' : 'bg-slate-300')}>
              <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-surface shadow transition-all', badge.publicVisible ? 'left-[22px]' : 'left-0.5')} />
            </span>
          </button>
        )}

        {/* Level standard */}
        {tiers.length > 0 && (
          <div className="pb-2">
            <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Where this sits</p>
            <TierLadder tiers={tiers} family={family} current={level} compact />
          </div>
        )}
      </div>
    </>
  );
}
