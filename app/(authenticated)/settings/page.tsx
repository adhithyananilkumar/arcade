'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { useThemeStore } from '@/infrastructure/state/theme.store';
import { UserService } from "@/domains/identity";
import { User as UserIcon, Camera, Loader2, CheckCircle2, Activity, Moon, Sun } from 'lucide-react';
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
      className="max-w-7xl w-full mx-auto px-4 md:px-8 py-8 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white transition-colors">Settings</h1>
        <p className="text-gray-500 dark:text-neutral-400 mt-1 transition-colors">Manage your account settings and preferences.</p>
      </div>

      {/* Appearance Section */}
      <div className="mt-6">
        <div className="rounded-2xl border border-gray-200 dark:border-neutral-900 bg-white dark:bg-black shadow-sm overflow-hidden transition-colors">
          <div className="border-b border-gray-200 dark:border-neutral-900 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white transition-colors">Appearance</h3>
              <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1 transition-colors">
                Customize how Arcade looks on your device.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="relative inline-flex h-8 w-16 items-center rounded-full bg-slate-200 dark:bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:focus:ring-offset-black"
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
        </div>
      </div>

      {/* Security & Sessions Section */}
      <div className="mt-6">
        <div className="rounded-2xl border border-gray-200 dark:border-neutral-900 bg-white dark:bg-black shadow-sm overflow-hidden transition-colors">
          <div className="border-b border-gray-200 dark:border-neutral-900 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white transition-colors">Active Sessions</h3>
              <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1 transition-colors">
                These are devices that have logged into your account. Revoke any sessions that you do not recognize.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                href="/settings/sessions"
                className="rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 px-4 py-2 text-sm font-semibold hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
              >
                View Active Sessions
              </Link>
              <Link 
                href="/settings/security"
                className="rounded-lg bg-gray-50 dark:bg-neutral-900 px-4 py-2 text-sm font-medium text-gray-700 dark:text-neutral-300 hover:bg-gray-100 dark:hover:bg-neutral-800 border border-gray-200 dark:border-neutral-800 transition-colors"
              >
                View Audit Logs
              </Link>
            </div>
          </div>
        </div>
      </div>
      {/* Channels Section */}
      <div className="mt-6">
        <div className="rounded-2xl border border-gray-200 dark:border-neutral-900 bg-white dark:bg-black shadow-sm overflow-hidden transition-colors">
          <div className="border-b border-gray-200 dark:border-neutral-900 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white transition-colors">Channels & Communities</h3>
              <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1 transition-colors">
                Manage your channels or create a new one to start collaborating.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 hover:shadow"
              >
                <Activity size={16} />
                Create Channel
              </button>
            </div>
          </div>
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
