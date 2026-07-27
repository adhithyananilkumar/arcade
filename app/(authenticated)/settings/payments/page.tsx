'use client';

import { motion } from 'framer-motion';
import { CreditCard, Check, Plus, ShieldCheck } from 'lucide-react';

export default function PaymentsPage() {
  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Active Subscription Card */}
      <div className="rounded-2xl border border-purple-200 dark:border-purple-900/50 bg-gradient-to-br from-purple-50/50 via-white to-indigo-50/30 dark:from-purple-950/20 dark:via-neutral-900 dark:to-neutral-900 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-purple-100 dark:border-purple-900/30 pb-4 mb-4">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 mb-2">
              ACTIVE PLAN
            </span>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Pro Learner Membership</h2>
            <p className="text-xs text-gray-500 dark:text-neutral-400 mt-0.5">Billed annually. Next billing date: August 15, 2027.</p>
          </div>
          <button className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition-colors">
            Manage Plan
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-neutral-300">
            <Check size={14} className="text-emerald-500" /> Unlimited Course Access
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-neutral-300">
            <Check size={14} className="text-emerald-500" /> Premium Certificates
          </div>
          <div className="flex items-center gap-2 text-slate-700 dark:text-neutral-300">
            <Check size={14} className="text-emerald-500" /> Priority Support
          </div>
        </div>
      </div>

      {/* Payment Methods Section */}
      <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard size={18} className="text-purple-500" /> Payment Methods
          </h3>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-neutral-800 text-xs font-semibold text-gray-700 dark:text-neutral-300 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors">
            <Plus size={14} /> Add Card
          </button>
        </div>

        <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-neutral-800 bg-slate-50/50 dark:bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-7 rounded bg-slate-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-[10px] text-slate-600 dark:text-slate-300">
              VISA
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">Visa ending in 4242</p>
              <p className="text-[11px] text-gray-500">Expires 12/28 • Default method</p>
            </div>
          </div>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">Default</span>
        </div>
      </div>

      {/* Invoices */}
      <div className="rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">Billing History</h3>
        
        <div className="divide-y divide-gray-100 dark:divide-neutral-800">
          <div className="py-3 flex items-center justify-between text-xs">
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">Pro Learner (Annual)</p>
              <p className="text-gray-500">Aug 15, 2026</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-gray-900 dark:text-white">$120.00</span>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold">PAID</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
