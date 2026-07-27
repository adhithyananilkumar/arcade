'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ToggleLeft, Download, Trash2, Activity, Plus, ExternalLink, Users } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { CreateChannelModal } from "@/domains/channels";

export default function PrivacyPage() {
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [personalization, setPersonalization] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Channels & Communities Section */}
      <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-neutral-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity size={18} className="text-indigo-500" /> Channels & Communities
            </h3>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
              Manage your channels, joined communities, or launch a new collaboration space.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all"
            >
              <Plus size={14} /> Create Channel
            </button>
            <Link
              href="/manage-channels"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
            >
              Manage <ExternalLink size={12} />
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50/50 dark:bg-neutral-950/50 border border-slate-100 dark:border-neutral-800 text-xs text-gray-600 dark:text-neutral-300">
          <Users size={20} className="text-indigo-500 shrink-0" />
          <p>You can create public or private channels to interact with learners, publish resources, and manage member permissions safely.</p>
        </div>
      </div>

      {/* Privacy Toggles */}
      <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <ToggleLeft size={18} className="text-orange-500" /> Data Preferences
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">Usage Analytics</p>
              <p className="text-[11px] text-gray-500">Allow Arcade to collect anonymous telemetry data to improve performance.</p>
            </div>
            <button
              onClick={() => setAnalytics(!analytics)}
              className={`w-11 h-6 rounded-full p-1 transition-colors ${analytics ? 'bg-orange-500' : 'bg-gray-300 dark:bg-neutral-700'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${analytics ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 dark:border-neutral-800 pt-4">
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">Personalized Recommendations</p>
              <p className="text-[11px] text-gray-500">Use course history to personalize your learning dashboard.</p>
            </div>
            <button
              onClick={() => setPersonalization(!personalization)}
              className={`w-11 h-6 rounded-full p-1 transition-colors ${personalization ? 'bg-orange-500' : 'bg-gray-300 dark:bg-neutral-700'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${personalization ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 dark:border-neutral-800 pt-4">
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">Product Updates & Marketing</p>
              <p className="text-[11px] text-gray-500">Receive announcements about new courses and features.</p>
            </div>
            <button
              onClick={() => setMarketing(!marketing)}
              className={`w-11 h-6 rounded-full p-1 transition-colors ${marketing ? 'bg-orange-500' : 'bg-gray-300 dark:bg-neutral-700'}`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${marketing ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Account Data Export */}
      <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Download size={16} className="text-indigo-500" /> Export Personal Data
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">Download a copy of your Arcade activity and certificate records.</p>
        </div>
        <button 
          onClick={() => toast.success('Preparing your data archive...')}
          className="px-4 py-2 rounded-xl border border-gray-200 dark:border-neutral-800 text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors"
        >
          Download ZIP
        </button>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl border border-red-200 dark:border-red-900/30 bg-red-50/40 dark:bg-red-950/10 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
            <Trash2 size={16} /> Delete Account
          </h3>
          <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">Permanently remove your account and all associated course data.</p>
        </div>
        <button 
          onClick={() => toast.error('Please contact support to initiate account deletion.')}
          className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          Delete Account
        </button>
      </div>

      <CreateChannelModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {}}
      />
    </motion.div>
  );
}
