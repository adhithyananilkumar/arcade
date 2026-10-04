'use client';

/**
 * One certificate, opened from the Achievements Certificates tab, in the slide-over panel: the
 * certificate as it looks, its status, and everything the holder can do with it — download the PDF,
 * open the public page, add it to LinkedIn, copy the link, see the grade card behind it, and choose
 * whether it is public. Mirrors {@link BadgeDetailPanel}.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowLeft, Calendar, Check, ClipboardList, Copy, Download, ExternalLink, Eye, EyeOff, Loader2, ShieldAlert, ShieldCheck,
  TimerOff, X,
} from 'lucide-react';
import {
  CertificateFace,
  LinkedInGlyph,
  credentialPath,
  credentialsApi,
  linkedInAddToProfileUrl,
  type IssuedCertificate,
} from '@/domains/credentials';
import { examRoutes } from '@/shared/routes/content.routes';
import { cn } from '@/shared/utils/utils';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}

export interface CertificateDetailPanelProps {
  certificate: IssuedCertificate | null;
  onClose: () => void;
  onChanged: (certificate: IssuedCertificate) => void;
}

export function CertificateDetailPanel({ certificate, onClose, onChanged }: CertificateDetailPanelProps) {
  useEffect(() => {
    if (!certificate) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [certificate, onClose]);

  return (
    <AnimatePresence>
      {certificate && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label={`${certificate.title} certificate`}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 cursor-pointer bg-slate-950/40 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="flex w-screen max-w-md flex-col overflow-y-auto border-l border-slate-200/80 bg-surface p-6 shadow-2xl sm:max-w-[560px] sm:p-8"
            >
              <PanelBody key={certificate.credentialCode} certificate={certificate} onClose={onClose} onChanged={onChanged} />
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

function PanelBody({
  certificate: c,
  onClose,
  onChanged,
}: {
  certificate: IssuedCertificate;
  onClose: () => void;
  onChanged: (c: IssuedCertificate) => void;
}) {
  const [copied, setCopied] = useState<'id' | 'link' | null>(null);
  const [savingVisibility, setSavingVisibility] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const origin = typeof window === 'undefined' ? '' : window.location.origin;
  const publicUrl = `${origin}${credentialPath(c.credentialCode)}`;
  const active = !c.revoked && !c.expired;

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
      const next = await credentialsApi.setCertificateVisibility(c.credentialCode, !c.publicVisible);
      onChanged(next);
      toast.success(next.publicVisible ? 'Certificate is public' : 'Certificate is now private');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Could not change visibility');
    } finally {
      setSavingVisibility(false);
    }
  };

  const download = async () => {
    setDownloading(true);
    try {
      await credentialsApi.downloadMyCertificate(c.credentialCode);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Download failed');
    } finally {
      setDownloading(false);
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
      <div className="py-6">
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl border border-slate-200 shadow-[0_18px_30px_rgba(20,20,43,0.12)]"
        >
          <CertificateFace certificate={c} />
        </motion.div>
        <div className="mt-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{c.documentTitle}</p>
          <h2 className="mt-1.5 text-2xl font-black tracking-tight text-slate-900">{c.title}</h2>
          <p className="mt-1.5 text-sm text-slate-500">
            Issued by{' '}
            {c.issuerHandle ? (
              <Link href={`/${c.issuerHandle}`} className="font-bold text-slate-800 hover:underline">
                {c.issuerName}
              </Link>
            ) : (
              <span className="font-bold text-slate-800">{c.issuerName}</span>
            )}
          </p>
          <div className="mt-2 flex items-center justify-center gap-1.5 text-xs font-bold">
            {c.revoked ? (
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                <ShieldAlert className="h-4 w-4" /> Revoked{c.revokedReason ? ` — ${c.revokedReason}` : ''}
              </span>
            ) : c.expired ? (
              <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                <TimerOff className="h-4 w-4" /> Expired{c.expiresAt ? ` ${formatDate(c.expiresAt)}` : ''}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" /> Verified · <Calendar className="h-3.5 w-3.5" /> {formatDate(c.issuedAt)}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* Criteria */}
        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">What it certifies</p>
          <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{c.criteria}</p>
          {c.gradeCardId && (
            <Link
              href={examRoutes.gradeCard(c.gradeCardId)}
              className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#2962D6] hover:underline dark:text-[#7eb5ff]"
            >
              <ClipboardList size={12} /> View the grade card
            </Link>
          )}
        </div>

        {/* Credential ID */}
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Credential ID</p>
          <div className="mt-1.5 flex items-center gap-2">
            <code className="rounded-lg border border-slate-200 bg-surface px-3 py-1.5 font-mono text-sm font-bold tracking-wider text-slate-800">
              {c.credentialCode}
            </code>
            <button
              type="button"
              onClick={() => copy(c.credentialCode, 'id')}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
              aria-label="Copy credential ID"
            >
              {copied === 'id' ? <Check size={14} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* Actions — the PDF is always available to the holder; a revoked one is watermarked. */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={download}
            disabled={downloading}
            className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-ink px-4 py-3 text-xs font-bold text-on-ink transition-colors hover:bg-ink-hover disabled:opacity-60"
          >
            {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} Download PDF
          </button>
          {active && (
            <>
              <a
                href={linkedInAddToProfileUrl({ credentialCode: c.credentialCode, name: c.title, issuedAt: c.issuedAt, url: publicUrl })}
                target="_blank"
                rel="noopener noreferrer"
                className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-tl-xl rounded-br-xl rounded-tr-md rounded-bl-md bg-[#0A66C2] px-4 py-3 text-xs font-bold text-white hover:bg-[#0958a8]"
              >
                <LinkedInGlyph size={14} /> Add to LinkedIn
              </a>
              {c.publicVisible && (
                <Link href={credentialPath(c.credentialCode)} target="_blank" className={secondary}>
                  <ExternalLink size={13} /> Public page
                </Link>
              )}
              <button
                type="button"
                onClick={() => copy(publicUrl, 'link')}
                className={cn(secondary, !c.publicVisible && 'col-span-2')}
              >
                {copied === 'link' ? <Check size={13} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={13} />} Copy link
              </button>
            </>
          )}
        </div>

        {/* Visibility */}
        {!c.revoked && (
          <button
            type="button"
            onClick={toggleVisibility}
            disabled={savingVisibility}
            className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200/80 px-4 py-3 text-left transition hover:bg-slate-50 disabled:opacity-60"
          >
            <span className="flex items-center gap-3">
              {c.publicVisible ? <Eye size={16} className="text-emerald-600 dark:text-emerald-400" /> : <EyeOff size={16} className="text-slate-400" />}
              <span>
                <span className="block text-sm font-bold text-slate-800">{c.publicVisible ? 'Public' : 'Private'}</span>
                <span className="block text-xs text-slate-500">
                  {c.publicVisible
                    ? 'Shown on your profile; anyone with the link can view, download and verify it.'
                    : 'Hidden from your profile and its page. The ID still verifies for anyone you give it to.'}
                </span>
              </span>
            </span>
            <span aria-hidden className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors', c.publicVisible ? 'bg-emerald-500' : 'bg-slate-300')}>
              <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-surface shadow transition-all', c.publicVisible ? 'left-[22px]' : 'left-0.5')} />
            </span>
          </button>
        )}
      </div>
    </>
  );
}
