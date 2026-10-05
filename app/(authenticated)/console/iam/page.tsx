'use client';

import { useState } from 'react';
import { Shield, Users } from 'lucide-react';
import { UsersList } from './UsersList';
import { PolicyManager } from './PolicyManager';
import { notFound } from 'next/navigation';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';

export default function IamPage() {
  const { user } = useAuthStore();

  if (!AuthorizationService.canAccessIamConsole(user)) {
    notFound();
  }

  const [activeTab, setActiveTab] = useState<'USERS' | 'POLICIES'>('USERS');

  const tabButtons = (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => setActiveTab('USERS')}
        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold tracking-tight transition-colors ${
          activeTab === 'USERS'
            ? 'bg-slate-950 text-white shadow-xs dark:bg-white dark:text-slate-950'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        <Users size={14} />
        Users
      </button>
      <button
        type="button"
        onClick={() => setActiveTab('POLICIES')}
        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold tracking-tight transition-colors ${
          activeTab === 'POLICIES'
            ? 'bg-slate-950 text-white shadow-xs dark:bg-white dark:text-slate-950'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        <Shield size={14} />
        Policies
      </button>
    </div>
  );

  return (
    <div className="flex w-full flex-col h-full space-y-5 pb-6">
      <div className={activeTab === 'USERS' ? 'flex-1 min-h-0 overflow-y-auto pr-2' : 'hidden'}>
        <UsersList headerSlot={tabButtons} />
      </div>
      <div className={activeTab === 'POLICIES' ? 'flex-1 min-h-0 overflow-y-auto pr-2' : 'hidden'}>
        <PolicyManager headerSlot={tabButtons} />
      </div>
    </div>
  );
}
