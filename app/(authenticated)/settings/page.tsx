'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { useThemeStore } from '@/infrastructure/state/theme.store';
import { User as UserIcon, Moon, Sun, Shield, Activity, ExternalLink, Smartphone } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { CreateChannelModal } from "@/domains/channels";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!user || !mounted) return null;

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Settings Overview</h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">Manage your account preferences, appearance, and linked services.</p>
      </div>

      {/* User Quick Info */}
      <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-900/50 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl">
            {user.firstName ? user.firstName[0] : 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {user.firstName} {user.lastName}
            </h2>
            <p className="text-sm text-gray-500 dark:text-neutral-400">{user.email}</p>
          </div>
        </div>
        <Link 
          href="/settings/info" 
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-neutral-200 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
        >
          Edit Profile
        </Link>
      </div>

      {/* Appearance Section */}
      <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
        <div className="px-6 py-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Appearance</h3>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
              Switch between Light and Dark mode interfaces.
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="relative inline-flex h-8 w-16 items-center rounded-full bg-slate-200 dark:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
            role="switch"
            aria-checked={theme === 'dark'}
          >
            <span className="sr-only">Toggle Dark Mode</span>
            <span
              className={`${
                theme === 'dark' ? 'translate-x-9 bg-black' : 'translate-x-1 bg-white'
              } inline-block h-6 w-6 transform rounded-full transition-transform duration-200 ease-in-out flex items-center justify-center shadow-sm`}
            >
              {theme === 'dark' ? <Moon size={12} className="text-indigo-400" /> : <Sun size={12} className="text-amber-500" />}
            </span>
          </button>
        </div>
      </div>

      {/* Security & Sessions Section */}
      <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Shield size={18} className="text-indigo-500" /> Active Sessions & Security
            </h3>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
              Monitor active logins and security logs for your account.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href="/settings/security"
              className="rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-4 py-2 text-xs font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-1.5"
            >
              View Audit Logs <ExternalLink size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Channels Section */}
      <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 overflow-hidden shadow-sm">
        <div className="px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Activity size={18} className="text-purple-500" /> Channels & Communities
            </h3>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">
              Create and manage your learning channels and communities.
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-700"
          >
            <Activity size={14} />
            Create Channel
          </button>
        </div>
      </div>
      
      <CreateChannelModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {}}
      />
    </motion.div>
  );
}
