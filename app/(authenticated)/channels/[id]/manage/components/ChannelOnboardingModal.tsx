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
 * channel exists — so this is where they are asked for. Each card leads to Identity & branding,
 * where they are set with the cropper and the badge and certificate previews.
 */
export function ChannelOnboardingModal({ channel, onDismiss, onAddLogo, onAddSignatory }: ChannelOnboardingModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
      <div onClick={onDismiss} className="fixed inset-0 arcade-modal-backdrop" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative z-10 w-full max-w-lg overflow-hidden arcade-modal-box rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="channel-onboarding-title"
      >
        <div className="flex items-start justify-between gap-4 px-6 pt-6">
          <div>
            <h2 id="channel-onboarding-title" className="text-lg font-black tracking-tight text-ink">
              {channel.name} is live
            </h2>
            <p className="mt-0.5 text-xs font-semibold text-slate-500">Two quick things before you publish</p>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            aria-label="Close"
            className="rounded-tl-lg rounded-br-lg rounded-tr-xs rounded-bl-xs p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-ink cursor-pointer dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-3 p-6">
          <button
            type="button"
            onClick={onAddLogo}
            className="flex w-full cursor-pointer items-center gap-4 rounded-xl border border-slate-200 bg-surface p-4 text-left transition-colors hover:border-ink/20 hover:bg-ink/5"
          >
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
            className="flex w-full cursor-pointer items-center gap-4 rounded-xl border border-slate-200 bg-surface p-4 text-left transition-colors hover:border-ink/20 hover:bg-ink/5"
          >
            <span className="min-w-0">
              <span className="block text-sm font-extrabold text-ink">Set the certificate signatory</span>
              <span className="block text-xs font-medium leading-relaxed text-slate-500">
                The name, title and signature printed on your certificates.
              </span>
            </span>
          </button>

          <div className="flex items-center justify-between pt-3">
            <p className="text-[11px] font-medium text-slate-500">
              You can do this any time from Identity & branding.
            </p>
            <button
              type="button"
              onClick={onDismiss}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-100 hover:text-ink cursor-pointer dark:hover:bg-slate-800"
            >
              Skip for now
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
