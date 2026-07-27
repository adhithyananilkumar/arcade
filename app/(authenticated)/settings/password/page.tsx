'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Lock, CheckCircle2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

export default function PasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setIsSaved(true);
    toast.success('Password updated successfully');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <motion.div 
      className="space-y-8"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Google & Account Password</h1>
        <p className="text-sm text-gray-500 dark:text-neutral-400 mt-1">Manage your account authentication details and linked sign-in methods.</p>
      </div>

      {/* Linked Google Banner */}
      <div className="rounded-2xl border border-sky-200 dark:border-sky-900/40 bg-sky-50/50 dark:bg-sky-950/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white dark:bg-neutral-800 shadow-sm flex items-center justify-center font-bold text-sky-600">
            G
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Google Sign-in Enabled</h3>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">Your Arcade account is connected to Google Authentication.</p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
          <CheckCircle2 size={12} /> Connected
        </span>
      </div>

      {/* Change Password Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Lock size={18} className="text-sky-500" /> Change Arcade Password
        </h3>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1.5">Current Password</label>
          <input 
            type="password" 
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1.5">New Password</label>
          <input 
            type="password" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-neutral-300 mb-1.5">Confirm New Password</label>
          <input 
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
          >
            <ShieldCheck size={16} />
            {isSaved ? 'Updated!' : 'Update Password'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
