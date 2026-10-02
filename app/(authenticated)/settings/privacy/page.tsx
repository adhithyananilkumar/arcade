'use client';

import { motion } from 'framer-motion';
import { Trash2, Activity, ExternalLink, Users } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Channels & Communities Section */}
      <div className="rounded-2xl border border-gray-200 bg-surface p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Activity size={18} className="text-indigo-500" /> Channels & Communities
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage your channels, joined communities, or launch a new collaboration space.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/manage-channels"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Manage <ExternalLink size={12} />
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100 text-xs text-gray-600">
          <Users size={20} className="text-indigo-500 shrink-0" />
          <p>Channel creation is invite-only — a platform admin invites specific people to start a channel. Manage the channels you already own or staff below.</p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50/40 dark:bg-red-950/10 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
            <Trash2 size={16} /> Delete Account
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Account deletion is handled by our support team, so certificates and payments can be settled first.
            Email us from your account address and we&apos;ll take it from there.
          </p>
        </div>
        <a
          href="mailto:arcade@amaljyothi.ac.in?subject=Delete%20my%20Arcade%20account"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          Request deletion
        </a>
      </div>
    </motion.div>
  );
}
