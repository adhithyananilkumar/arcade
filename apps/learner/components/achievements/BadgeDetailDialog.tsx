'use client';

/**
 * One earned badge, opened from the wallet: the artwork, where it sits on the five-level ladder,
 * what it certifies, and everything the holder can do with it — open the public credential page,
 * add it to LinkedIn, download the artwork, and choose whether it is public.
 */

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Calendar, Check, Copy, Download, ExternalLink, Eye, EyeOff, Loader2, ShieldAlert, ShieldCheck,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/shared/design-system/ui/dialog';
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

export interface BadgeDetailDialogProps {
  badge: IssuedBadge | null;
  tiers: BadgeTierInfo[];
  onClose: () => void;
  onChanged: (badge: IssuedBadge) => void;
}

export function BadgeDetailDialog({ badge, tiers, onClose, onChanged }: BadgeDetailDialogProps) {
  const [copied, setCopied] = useState(false);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [downloading, setDownloading] = useState<'png' | 'svg' | null>(null);

  if (!badge) return null;
  const level = badge.badgeClass.tier.level as BadgeLevel;
  const family = badge.badgeClass.family.key;
  const style = TIER_STYLE[level];
  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  const publicUrl = `${origin}${credentialPath(badge.credentialCode)}`;

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
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
      await downloadBadgeImage(family, level, badge.name, `${badge.name} - Arcade Level ${level} badge`, format);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Download failed');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-4xl">
        <DialogTitle className="sr-only">{badge.name} badge</DialogTitle>
        <div className="grid md:grid-cols-[minmax(0,320px)_1fr]">
          {/* ── Artwork ── */}
          <div className="relative flex flex-col items-center justify-center border-b border-slate-100 bg-slate-50 px-6 pb-6 pt-10 dark:border-slate-800 dark:bg-slate-900/60 md:border-b-0 md:border-r">
            <motion.div
              initial={{ rotateY: -90, opacity: 0, scale: 0.9 }}
              animate={{ rotateY: 0, opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="w-52 drop-shadow-xl"
              style={{ perspective: 800 }}
            >
              <CredentialBadge
                family={family}
                level={level}
                title={badge.name}
                revoked={badge.revoked}
                label={`${badge.badgeClass.name} — ${badge.name}`}
              />
            </motion.div>
            <span className={cn('mt-4 rounded-full border px-3 py-1 text-xs font-semibold', style.chip)}>
              {badge.badgeClass.tier.label}
            </span>
            <p className="mt-2 text-center text-[11px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              {badge.badgeClass.family.label}
            </p>
            <div className="mt-5 grid w-full grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => download('png')}
                disabled={downloading !== null}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-white disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                {downloading === 'png' ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />} PNG
              </button>
              <button
                type="button"
                onClick={() => download('svg')}
                disabled={downloading !== null}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-white disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                {downloading === 'svg' ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />} SVG
              </button>
            </div>
          </div>

          {/* ── Details ── */}
          <div className="space-y-5 p-6">
            <div>
              {badge.revoked ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 dark:bg-rose-950/40 dark:text-rose-300">
                  <ShieldAlert size={12} /> Revoked{badge.revokedReason ? ` — ${badge.revokedReason}` : ''}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <ShieldCheck size={12} /> Verified credential
                </span>
              )}
              <h2 className="mt-3 text-2xl font-black tracking-tight text-[#14142b] dark:text-white">{badge.name}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Issued by{' '}
                {badge.issuerHandle ? (
                  <Link href={`/${badge.issuerHandle}`} className="font-bold text-slate-800 hover:underline dark:text-slate-200">
                    {badge.issuerName}
                  </Link>
                ) : (
                  <span className="font-bold text-slate-800 dark:text-slate-200">{badge.issuerName}</span>
                )}{' '}
                through Arcade
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-slate-500">
                <Calendar size={12} /> {formatDate(badge.issuedAt)}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60">
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Earning criteria</p>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">{badge.criteria}</p>
              {badge.contentPath && (
                <Link href={badge.contentPath} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#2962D6] hover:underline">
                  View the {badge.contentType.toLowerCase()} <ExternalLink size={11} />
                </Link>
              )}
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Credential ID</p>
              <div className="mt-1.5 flex items-center gap-2">
                <code className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-mono text-sm font-bold tracking-wider text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                  {badge.credentialCode}
                </code>
                <button
                  type="button"
                  onClick={() => copy(badge.credentialCode)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800"
                  aria-label="Copy credential ID"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {!badge.revoked && (
              <div className="flex flex-wrap gap-2">
                <Link
                  href={credentialPath(badge.credentialCode)}
                  target="_blank"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#14142b] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#23234a] dark:bg-white dark:text-slate-900"
                >
                  <ExternalLink size={13} /> Open credential page
                </Link>
                <a
                  href={linkedInAddToProfileUrl({ credentialCode: badge.credentialCode, name: badge.name, issuedAt: badge.issuedAt, url: publicUrl })}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#0A66C2] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#0958a8]"
                >
                  <LinkedInGlyph size={13} /> Add to LinkedIn
                </a>
                <button
                  type="button"
                  onClick={() => copy(publicUrl)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <Copy size={13} /> Copy link
                </button>
              </div>
            )}

            {!badge.revoked && (
              <button
                type="button"
                onClick={toggleVisibility}
                disabled={savingVisibility}
                className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200/80 px-4 py-3 text-left transition hover:bg-slate-50 disabled:opacity-60 dark:border-slate-800 dark:hover:bg-slate-900"
              >
                <span className="flex items-center gap-3">
                  {badge.publicVisible ? <Eye size={16} className="text-emerald-600" /> : <EyeOff size={16} className="text-slate-400" />}
                  <span>
                    <span className="block text-sm font-bold text-slate-800 dark:text-slate-100">
                      {badge.publicVisible ? 'Public' : 'Private'}
                    </span>
                    <span className="block text-xs text-slate-500">
                      {badge.publicVisible
                        ? 'Shown on your profile; anyone with the link can view and verify it.'
                        : 'Hidden from your profile and its page. The ID still verifies for anyone you give it to.'}
                    </span>
                  </span>
                </span>
                <span
                  aria-hidden
                  className={cn(
                    'relative h-6 w-11 shrink-0 rounded-full transition-colors',
                    badge.publicVisible ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                  )}
                >
                  <span
                    className={cn(
                      'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
                      badge.publicVisible ? 'left-[22px]' : 'left-0.5'
                    )}
                  />
                </span>
              </button>
            )}

            {tiers.length > 0 && (
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Where this sits</p>
                <TierLadder tiers={tiers} family={family} current={level} compact />
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
