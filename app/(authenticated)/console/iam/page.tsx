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

  if (
    !AuthorizationService.canManageSettings(user) &&
    !AuthorizationService.canManageUsers(user) &&
    !AuthorizationService.canManageRoles(user) &&
    !AuthorizationService.canManagePermissions(user)
  ) {
    notFound();
  }

  const [activeTab, setActiveTab] = useState<'USERS' | 'POLICIES'>('USERS');

  return (
    <div className="w-full space-y-5">
      <div className="flex flex-wrap gap-1 rounded-full border border-slate-200/80 bg-white/90 p-1 shadow-[0_4px_14px_rgba(20,20,43,0.04)]">
        <button
          type="button"
          onClick={() => setActiveTab('USERS')}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all ${
            activeTab === 'USERS'
              ? 'bg-[#14142b] text-white shadow-sm'
              : 'text-slate-500 hover:bg-slate-50 hover:text-[#14142b]'
          }`}
        >
          <Users size={14} />
          Users
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('POLICIES')}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[12px] font-semibold transition-all ${
            activeTab === 'POLICIES'
              ? 'bg-[#14142b] text-white shadow-sm'
              : 'text-slate-500 hover:bg-slate-50 hover:text-[#14142b]'
          }`}
        >
          <Shield size={14} />
          Policies
        </button>
      </div>

      <div className={activeTab === 'USERS' ? 'block' : 'hidden'}>
        <UsersList />
      </div>
      <div className={activeTab === 'POLICIES' ? 'block' : 'hidden'}>
        <PolicyManager />
      </div>
    </div>
  );
}
