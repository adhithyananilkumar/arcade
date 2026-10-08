'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Send } from 'lucide-react';
import { channelService } from '../api/channel.service';
import { toast } from 'sonner';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function InviteUserModal({ isOpen, onClose, onSuccess }: InviteUserModalProps) {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    if (isLoading) return;
    setIdentifier('');
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = identifier.trim();

    if (trimmed.length < 2) {
      toast.error('Enter an email address or username to invite');
      return;
    }

    try {
      setIsLoading(true);
      await channelService.sendCreationInvitation(trimmed);
      toast.success(`Invitation sent to ${trimmed}`);
      setIdentifier('');
      onSuccess?.();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 arcade-modal-backdrop"
            onClick={handleClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', duration: 0.5, bounce: 0.3 }}
              className="w-full max-w-md overflow-hidden arcade-modal-box rounded-tl-[2.25rem] rounded-br-[2.25rem] rounded-tr-xl rounded-bl-xl border border-slate-200/80 bg-surface shadow-2xl pointer-events-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-200/70 px-6 py-4">
                <h2 className="text-base font-bold text-ink">
                  Invite User to Create a Channel
                </h2>
                <button
                  type="button"
                  onClick={handleClose}
                  aria-label="Close"
                  className="rounded-tl-lg rounded-br-lg rounded-tr-xs rounded-bl-xs p-1.5 text-slate-400 hover:bg-slate-100 hover:text-ink transition-colors cursor-pointer dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label htmlFor="identifier" className="block text-sm font-semibold text-ink mb-1.5">
                    Email or Username
                  </label>
                  <input
                    type="text"
                    id="identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-ink placeholder-slate-400 focus:border-ink/30 focus:bg-surface focus:outline-none focus:ring-4 focus:ring-slate-200/60 transition-all"
                    placeholder="e.g. jane@example.com or jane-doe"
                    autoComplete="off"
                    required
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    We&apos;ll email a link to create a channel. If the identifier matches an
                    existing account, they&apos;ll also get an in-app notification.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex w-full items-center justify-center rounded-xl bg-ink px-4 py-3 text-sm font-semibold text-on-ink shadow-sm transition-all hover:bg-ink-hover disabled:opacity-50 cursor-pointer"
                  >
                    {isLoading ? "Sending..." : "Send Invitation"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
