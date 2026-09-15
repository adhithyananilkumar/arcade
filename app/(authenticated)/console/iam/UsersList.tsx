'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { UserService, pipelineService, usePermissions, type IncompleteUserSummary } from '@/domains/identity';
import { User } from '@/infrastructure/auth/auth.store';
import { toast } from 'sonner';
import { Shield, Search, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/design-system/ui/avatar';
import { getAvatarUrl } from '@/shared/utils/avatar';
import { UserAccessDrawer } from './UserAccessDrawer';

export function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [drawerUserId, setDrawerUserId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const [showIncomplete, setShowIncomplete] = useState(false);
  const [incompleteUsers, setIncompleteUsers] = useState<IncompleteUserSummary[]>([]);
  const [incompleteLoading, setIncompleteLoading] = useState(false);

  const { hasPermission } = usePermissions();
  const canManageAdminRole = hasPermission('platform.users.manage');

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const usersData = await UserService.getAllUsers();
      setUsers(usersData);
    } catch {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchComplianceReport = useCallback(async () => {
    setIncompleteLoading(true);
    try {
      const page = await pipelineService.getIncompleteUsers('ALL', 0, 100);
      setIncompleteUsers(page.content);
    } catch {
      toast.error('Failed to load compliance report');
    } finally {
      setIncompleteLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (showIncomplete) fetchComplianceReport();
  }, [showIncomplete, fetchComplianceReport]);

  const openAccessDrawer = (user: User) => {
    setDrawerUserId(user.id);
    setDrawerOpen(true);
  };

  const handleAccessChanged = () => {
    fetchUsers();
    if (showIncomplete) fetchComplianceReport();
  };

  if (loading) return <div className="text-sm text-gray-500">Loading users...</div>;

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.firstName && user.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (user.lastName && user.lastName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#14142b]/30 focus:outline-none focus:ring-1 focus:ring-slate-300 shadow-sm"
          placeholder="Search users by name, username, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Compliance report toggle */}
      {canManageAdminRole && (
        <div className="rounded-xl border border-amber-100 bg-amber-50/40 overflow-hidden">
          <button
            type="button"
            onClick={() => setShowIncomplete((s) => !s)}
            className="w-full flex items-center justify-between gap-2 px-4 py-2.5 text-left"
          >
            <span className="flex items-center gap-2 text-xs font-bold text-amber-700">
              <AlertTriangle size={13} />
              Access Compliance Report
            </span>
            {showIncomplete ? <ChevronUp size={14} className="text-amber-600" /> : <ChevronDown size={14} className="text-amber-600" />}
          </button>
          {showIncomplete && (
            <div className="px-4 pb-3 space-y-2">
              {incompleteLoading ? (
                <p className="text-xs text-amber-700/70">Loading…</p>
              ) : incompleteUsers.length === 0 ? (
                <p className="text-xs text-amber-700/70">No IAM configuration issues found.</p>
              ) : (
                incompleteUsers.map((u) => {
                  const user = users.find((x) => x.id === u.id);
                  return (
                    <div
                      key={u.id}
                      className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-white border border-amber-100"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{u.fullName || u.email}</p>
                        <p className="text-[11px] text-amber-700/80">{u.description}</p>
                      </div>
                      {user && (
                        <button
                          type="button"
                          onClick={() => openAccessDrawer(user)}
                          className="shrink-0 px-2.5 py-1 text-[11px] font-bold text-[#14142b] bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      )}

      {filteredUsers.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          No users found matching &quot;{searchQuery}&quot;
        </div>
      ) : (
        filteredUsers.map(user => (
          <div key={user.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border border-slate-200">
                <AvatarImage src={getAvatarUrl(user.avatarUrl)} alt="Avatar" className="object-cover" referrerPolicy="no-referrer" />
                <AvatarFallback className="bg-slate-100 text-[#14142b] font-semibold text-sm">
                  {user.firstName ? user.firstName.charAt(0) : 'U'}
                  {user.lastName ? user.lastName.charAt(0) : ''}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-semibold text-gray-900">
                  <Link
                    href={`/${user.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-[#14142b] hover:underline transition-colors"
                  >
                    {user.firstName} {user.lastName}
                  </Link>
                </h4>
                <p className="text-sm text-gray-500">{user.email}</p>
                <div className="mt-2 flex gap-2 flex-wrap">
                  {user.platformRoles?.map((role) => (
                    <span key={role.id} className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-[#14142b] ring-1 ring-inset ring-slate-300">
                      {role.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => openAccessDrawer(user)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#14142b] bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <Shield size={16} /> Manage Access
            </button>
          </div>
        ))
      )}

      <UserAccessDrawer
        userId={drawerUserId}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        canManageAdminRole={canManageAdminRole}
        onChanged={handleAccessChanged}
      />
    </div>
  );
}
