'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Check,
  Copy,
  ArrowUpRight,
  Share2,
} from 'lucide-react';
import { CredentialBadge } from './CredentialBadge';
import type { IssuedBadge } from '../types/credential.types';

function Portal({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted || typeof document === 'undefined') return null;
  return createPortal(children, document.body);
}

function formatDate(dateStr?: string | null) {
  if (!dateStr) return 'Verified';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export interface BadgeDetailModalProps {
  badge: IssuedBadge | null;
  onClose: () => void;
}

export function BadgeDetailModal({ badge, onClose }: BadgeDetailModalProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Close on Escape key
  useEffect(() => {
    if (!badge) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [badge, onClose]);

  const handleCopyId = useCallback(async () => {
    if (!badge?.credentialCode) return;
    try {
      await navigator.clipboard.writeText(badge.credentialCode);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {}
  }, [badge?.credentialCode]);

  const handleCopyLink = useCallback(async () => {
    if (!badge?.credentialCode) return;
    const url = typeof window !== 'undefined'
      ? `${window.location.origin}/credentials/${encodeURIComponent(badge.credentialCode)}`
      : `/credentials/${encodeURIComponent(badge.credentialCode)}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {}
  }, [badge?.credentialCode]);

  return (
    <Portal>
      <AnimatePresence>
        {badge && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-slate-950/75 backdrop-blur-md transition-opacity"
            />

            {/* Modal Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 14 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 my-auto w-full max-w-md overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-xl rounded-bl-xl border border-slate-200/90 dark:border-slate-800/90 bg-surface/98 dark:bg-slate-900/98 p-6 sm:p-7 shadow-2xl backdrop-blur-xl"
            >
              {/* Header Bar */}
              <div className="flex items-center justify-end pb-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex size-7 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800/80 text-black dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Spotlight Showcase Hero */}
              <div className="flex flex-col items-center text-center pb-6 pt-1">
                <div className="relative mb-4 flex items-center justify-center">
                  {/* Atmospheric Glow */}
                  <div className="absolute -inset-6 rounded-full bg-amber-500/15 dark:bg-amber-400/20 blur-3xl pointer-events-none" />
                  
                  <CredentialBadge
                    family={badge.badgeClass.family.key}
                    level={badge.badgeClass.tier.level}
                    title={badge.name}
                    className="relative h-44 w-44 sm:h-52 sm:w-52 drop-shadow-2xl transition-transform duration-300 hover:scale-105"
                  />
                </div>

                {/* Badge Title */}
                <h3 className="text-base sm:text-lg font-bold tracking-tight text-black dark:text-white max-w-sm">
                  {badge.name}
                </h3>
              </div>

              {/* Technical Ledger */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 rounded-xl border border-slate-200/70 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-xs mb-5">
                {/* Recipient */}
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="font-semibold text-black/70 dark:text-white/70">Awarded to</span>
                  <div className="flex items-center gap-1.5 font-bold text-black dark:text-white">
                    <span>{badge.recipientName || 'Arcade Member'}</span>
                    {badge.recipientHandle && (
                      <span className="text-black/50 dark:text-white/50 font-normal">
                        @{badge.recipientHandle}
                      </span>
                    )}
                  </div>
                </div>

                {/* Issuer */}
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="font-semibold text-black/70 dark:text-white/70">Issued by</span>
                  <span className="font-bold text-black dark:text-white">
                    {badge.issuerName || 'Arcade Academy'}
                  </span>
                </div>

                {/* Date */}
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="font-semibold text-black/70 dark:text-white/70">Issue Date</span>
                  <span className="font-bold text-black dark:text-white">
                    {formatDate(badge.issuedAt)}
                  </span>
                </div>

                {/* Credential ID */}
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="font-semibold text-black/70 dark:text-white/70">Credential ID</span>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    className="group inline-flex items-center gap-1.5 font-mono font-bold text-xs text-black dark:text-white cursor-pointer transition-colors"
                    title="Click to copy credential ID"
                  >
                    <span>{badge.credentialCode}</span>
                    {copiedId ? (
                      <span className="text-xs font-sans font-bold text-emerald-500">Copied</span>
                    ) : (
                      <Copy size={12} className="text-black/50 dark:text-white/50 group-hover:text-black dark:group-hover:text-white" />
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-bold text-black dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-2xs cursor-pointer active:scale-[0.98]"
                >
                  {copiedLink ? (
                    <>
                      <Check size={14} className="text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Share2 size={13} className="text-black dark:text-white" />
                      <span>Share</span>
                    </>
                  )}
                </button>

                <Link
                  href={`/credentials/${encodeURIComponent(badge.credentialCode)}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-black dark:bg-white px-4 py-2.5 text-xs font-bold text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-xs active:scale-[0.98]"
                >
                  <span>Verify Record</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Portal>
  );
}
