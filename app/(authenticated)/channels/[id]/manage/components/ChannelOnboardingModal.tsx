'use client';

import { motion } from 'framer-motion';
import { Building2, ImagePlus, PenLine, X } from 'lucide-react';
import type { Channel } from '@/domains/channels';

interface ChannelOnboardingModalProps {
  channel: Channel;
  /** Closes the prompt for good (this channel, this browser). */
  onDismiss: () => void;
  onAddLogo: () => void;
  onAddSignatory: () => void;
}

/**
 * Shown once, when an organisation's channel is first opened after approval. The logo and the
 * certificate signatory are not asked for at application time — nothing can be printed until the
 * channel exists — so this is where they are collected. Each card opens the same modal the channel
 * settings use, which carries the crop/zoom and the badge and certificate previews.
 */
export function ChannelOnboardingModal({ channel, onDismiss, onAddLogo, onAddSignatory }: ChannelOnboardingModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
      <div onClick={onDismiss} className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200/80 bg-surface shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="channel-onboarding-title"
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
              <Building2 size={22} />
            </span>
            <div>
              <h2 id="channel-onboarding-title" className="text-lg font-black tracking-tight text-ink">
                {channel.name} is live
              </h2>
              <p className="text-xs font-semibold text-slate-500">Two quick things before you publish</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close"
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 p-6">
          <button
            type="button"
            onClick={onAddLogo}
            className="flex w-full cursor-pointer items-center gap-4 rounded-2xl border border-slate-200 bg-surface p-4 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50/40"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <ImagePlus size={18} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-extrabold text-ink">Add your organisation logo</span>
              <span className="block text-xs font-medium leading-relaxed text-slate-500">
                Your channel avatar, and the mark on every badge and certificate you issue. Crop and zoom it to fit.
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={onAddSignatory}
            className="flex w-full cursor-pointer items-center gap-4 rounded-2xl border border-slate-200 bg-surface p-4 text-left transition-colors hover:border-indigo-300 hover:bg-indigo-50/40"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <PenLine size={18} />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-extrabold text-ink">Set the certificate signatory</span>
              <span className="block text-xs font-medium leading-relaxed text-slate-500">
                The name, title and signature printed on your certificates.
              </span>
            </span>
          </button>

          <div className="flex items-center justify-between pt-3">
            <p className="text-[11px] font-medium text-slate-500">
              You can do this any time from Edit profile.
            </p>
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-2xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              Skip for now
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
