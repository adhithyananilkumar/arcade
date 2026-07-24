'use client';

import { useState } from 'react';
import { Shield, AlertTriangle, History } from 'lucide-react';
import { motion } from 'framer-motion';
import { PendingChannels } from '@/apps/learner/components/channels/PendingChannels'; // Reusing the component
import { DeletionRequests } from '@/apps/learner/components/admin/DeletionRequests';
import { ChannelAuditLog } from '@/apps/learner/components/admin/ChannelAuditLog';

import { notFound } from 'next/navigation';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';

type AdminTab = 'CHANNELS' | 'DELETION_REQUESTS' | 'AUDIT_LOG';

export default function AdminChannelsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<AdminTab>('CHANNELS');

  if (!AuthorizationService.canManageChannels(user)) {
    notFound();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full space-y-8"
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
          <p className="text-sm text-gray-500 mt-1">Review pending channels, deletion requests, and monitor active ones.</p>
        </div>

        <div className="relative z-10 flex gap-1 rounded-2xl border border-gray-100 bg-gray-50/60 p-1.5 mb-6 w-fit">
          <button
            onClick={() => setActiveTab('CHANNELS')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === 'CHANNELS' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Shield size={16} />
            Channels
          </button>
          <button
            onClick={() => setActiveTab('DELETION_REQUESTS')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === 'DELETION_REQUESTS' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-red-600'
            }`}
          >
            <AlertTriangle size={16} />
            Deletion Requests
          </button>
          <button
            onClick={() => setActiveTab('AUDIT_LOG')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === 'AUDIT_LOG' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <History size={16} />
            Audit Log
          </button>
        </div>

        <div className="relative z-10">
          {activeTab === 'CHANNELS' && <PendingChannels />}
          {activeTab === 'DELETION_REQUESTS' && <DeletionRequests />}
          {activeTab === 'AUDIT_LOG' && <ChannelAuditLog />}
        </div>
      </div>
    </motion.div>
  );
}
