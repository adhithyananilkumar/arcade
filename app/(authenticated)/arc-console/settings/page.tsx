'use client';

import { useState } from 'react';
import { Shield, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { UsersList } from './UsersList';
import { PolicyManager } from './PolicyManager';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<'USERS' | 'POLICIES'>('USERS');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-7xl mx-auto space-y-8"
    >
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Admin Settings</h1>
        <p className="text-gray-500">Manage users, custom policies, and IAM permissions across the platform.</p>
      </div>
      
      <div className="rounded-3xl border border-indigo-200 bg-white p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Users size={120} className="text-indigo-600" />
        </div>
        
        <div className="relative z-10 mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Shield size={20} className="text-indigo-600" />
            Identity & Access Management
          </h3>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex gap-4 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('USERS')}
              className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'USERS' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Users Directory
              {activeTab === 'USERS' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
            </button>
            <button
              onClick={() => setActiveTab('POLICIES')}
              className={`pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'POLICIES' ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Custom Policies
              {activeTab === 'POLICIES' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full" />}
            </button>
          </div>

          <div className="pt-2">
            {activeTab === 'USERS' && <UsersList />}
            {activeTab === 'POLICIES' && <PolicyManager />}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
