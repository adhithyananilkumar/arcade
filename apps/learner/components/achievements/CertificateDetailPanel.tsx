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
          <div className="absolute inset-y-0 right-0 flex max-w-full">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="flex w-screen max-w-md flex-col overflow-hidden bg-white shadow-2xl sm:max-w-[440px]"
            >
              <div className="flex flex-1 flex-col overflow-y-auto">
                <PanelBody key={certificate.credentialCode} certificate={certificate} onClose={onClose} onChanged={onChanged} />
              </div>
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
    'flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 active:scale-[0.99]';

  return (
    <>
      {/* ─── Sticky header ─── */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-3 backdrop-blur-sm">
        <button
          type="button"
          onClick={onClose}
          className="group/back flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-900"
          title="Go back to Achievements"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover/back:-translate-x-0.5" />
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          title="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* ─── Hero: certificate face + identity ─── */}
      <div
        className="px-6 pb-6 pt-8"
        style={{ background: 'linear-gradient(180deg, #f8f9fb 0%, #ffffff 100%)' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl border border-slate-200 shadow-[0_18px_30px_rgba(20,20,43,0.12)]"
        >
          <CertificateFace certificate={c} verificationUrl={publicUrl} />
        </motion.div>
        <div className="mt-5 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">{c.documentTitle}</p>
          <h2 className="mt-1.5 text-[1.65rem] font-extrabold leading-tight tracking-tight text-slate-900">{c.title}</h2>
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
          <div className="mt-2.5 flex items-center justify-center gap-1.5 text-xs font-semibold">
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

      <div className="space-y-3 px-6 pb-8">
        {/* ─── Earning criteria ─── */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Earning Criteria</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{c.criteria}</p>
          {c.gradeCardId && (
            <Link
              href={examRoutes.gradeCard(c.gradeCardId)}
              className="mt-2.5 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              <ClipboardList size={12} /> View the grade card
            </Link>
          )}
        </div>

        {/* ─── Credential ID ─── */}
        <div>
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Credential ID</p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 font-mono text-sm font-semibold tracking-wider text-slate-800">
              {c.credentialCode}
            </code>
            <button
              type="button"
              onClick={() => copy(c.credentialCode, 'id')}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
              aria-label="Copy credential ID"
            >
              {copied === 'id' ? <Check size={14} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={14} />}
            </button>
          </div>
        </div>

        {/* ─── Action buttons ─── */}
        <div className="flex flex-col gap-2.5">
          {/* Download PDF */}
          <button
            type="button"
            onClick={download}
            disabled={downloading}
            className="flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow disabled:opacity-60 active:scale-[0.99]"
          >
            {downloading ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} Download PDF
          </button>
          {active && (
            <>
              {/* LinkedIn */}
              <a
                href={linkedInAddToProfileUrl({ credentialCode: c.credentialCode, name: c.title, issuedAt: c.issuedAt, url: publicUrl })}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-2xl bg-[#0A66C2] px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#0959ab] hover:shadow active:scale-[0.99]"
              >
                <LinkedInGlyph size={15} /> Add to LinkedIn
              </a>
              {/* Public page + Copy share link in a row if public page is available */}
              {c.publicVisible && (
                <Link href={credentialPath(c.credentialCode)} target="_blank" className={secondary}>
                  <ExternalLink size={13} /> Public page
                </Link>
              )}
              <button
                type="button"
                onClick={() => copy(publicUrl, 'link')}
                className={secondary}
              >
                {copied === 'link' ? <Check size={13} className="text-emerald-600 dark:text-emerald-400" /> : <Copy size={13} />} Copy share link
              </button>
            </>
          )}
        </div>

        {/* ─── Visibility toggle ─── */}
        {!c.revoked && (
          <button
            type="button"
            onClick={toggleVisibility}
            disabled={savingVisibility}
            className="flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-left shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 active:scale-[0.99]"
          >
            <span className="flex items-center gap-3">
              {c.publicVisible
                ? <Eye size={17} className="shrink-0 text-emerald-500" />
                : <EyeOff size={17} className="shrink-0 text-slate-400" />}
              <span>
                <span className="block text-sm font-semibold text-slate-900">{c.publicVisible ? 'Public' : 'Private'}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-slate-500">
                  {c.publicVisible
                    ? 'Shown on your profile; anyone with the link can view, download and verify it.'
                    : 'Hidden from your profile and its page. The ID still verifies for anyone you give it to.'}
                </span>
              </span>
            </span>
            <span
              aria-hidden
              className={cn('relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200', c.publicVisible ? 'bg-emerald-500' : 'bg-slate-200')}
            >
              <span
                className={cn(
                  'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-md transition-all duration-200',
                  c.publicVisible ? 'left-[22px]' : 'left-0.5',
                )}
              />
            </span>
          </button>
        )}
      </div>
    </>
  );
}
