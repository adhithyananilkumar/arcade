'use client';

import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { PendingChannels } from '@/app/(authenticated)/dashboard/PendingChannels'; // Reusing the component

export default function AdminChannelsPage() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-7xl mx-auto space-y-8"
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Channels</h1>
        <p className="text-gray-500">Manage all channel requests and active channels across the platform.</p>
      </div>
      
      <div className="rounded-3xl border border-indigo-200 bg-white p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Shield size={120} className="text-indigo-600" />
        </div>
        <div className="relative z-10 mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Shield size={20} className="text-indigo-600" />
            Admin Control Panel
          </h3>
          <p className="text-sm text-gray-500 mt-1">Review pending channels and monitor active ones.</p>
        </div>
        <div className="relative z-10">
          <PendingChannels />
        </div>
      </div>
    </motion.div>
  );
}
