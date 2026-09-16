'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { UserService, usePermissions } from '@/domains/identity';
import { User } from '@/infrastructure/auth/auth.store';
import { toast } from 'sonner';
import { Shield, Search, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/design-system/ui/avatar';
import { getAvatarUrl } from '@/shared/utils/avatar';
import { UserAccessDrawer } from './UserAccessDrawer';
import { GrantAccessDialog } from './GrantAccessDialog';

const PAGE_SIZE = 20;

export function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const [drawerUser, setDrawerUser] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [grantDialogOpen, setGrantDialogOpen] = useState(false);

  const { hasPermission } = usePermissions();
  const canManageAdminRole = hasPermission('platform.users.manage');

  // Debounce free-text search before it hits the server; a new search also resets pagination,
  // applied in the same timer callback rather than a second effect reacting to `search`.
  useEffect(() => {
    const handle = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(0);
    }, 300);
    return () => clearTimeout(handle);
  }, [searchInput]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const result = await UserService.getPlatformAccessUsers(search || undefined, page, PAGE_SIZE);
      setUsers(result.content);
      setTotalUsers(result.totalElements);
      setTotalPages(result.totalPages);
    } catch {
      toast.error('Failed to fetch platform users');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openAccessDrawer = (user: User) => {
    setDrawerUser(user);
    setDrawerOpen(true);
  };

  const handleAccessChanged = () => {
    fetchUsers();
  };

  const handleGrantSelect = (user: User) => {
    setGrantDialogOpen(false);
    openAccessDrawer(user);
  };

  return (
    <div className="space-y-4">
      {/* Header: search + grant access */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#14142b]/30 focus:outline-none focus:ring-1 focus:ring-slate-300 shadow-sm"
            placeholder="Search users with platform access…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        {canManageAdminRole && (
          <button
            onClick={() => setGrantDialogOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#14142b] hover:bg-[#232735] rounded-xl transition-colors shrink-0"
          >
            <UserPlus size={15} /> Grant Access
          </button>
        )}
      </div>

      <p className="text-xs text-gray-400 px-1">
        {loading
          ? 'Loading…'
          : `${totalUsers} user${totalUsers === 1 ? '' : 's'} with platform access${search ? ` matching "${search}"` : ''}`}
      </p>

      {/* User list */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[76px] rounded-xl border border-gray-100 bg-gray-50/50 animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="p-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200 space-y-3">
          <p className="text-sm text-gray-500">
            {search
              ? `No users with platform access match "${search}".`
              : 'No users currently hold platform access.'}
          </p>
          {canManageAdminRole && !search && (
            <button
              onClick={() => setGrantDialogOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-[#14142b] hover:bg-[#232735] rounded-lg transition-colors"
            >
              <UserPlus size={14} /> Grant someone access
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {users.map(user => (
            <div key={user.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="h-10 w-10 border border-slate-200 shrink-0">
                  <AvatarImage src={getAvatarUrl(user.avatarUrl)} alt="Avatar" className="object-cover" referrerPolicy="no-referrer" />
                  <AvatarFallback className="bg-slate-100 text-[#14142b] font-semibold text-sm">
                    {user.firstName ? user.firstName.charAt(0) : 'U'}
                    {user.lastName ? user.lastName.charAt(0) : ''}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
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
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {user.platformRoles?.length ? (
                      user.platformRoles.map((role) => (
                        <span key={role.id} className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-[#14142b] ring-1 ring-inset ring-slate-300">
                          {role.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400 italic">No policy assigned</span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => openAccessDrawer(user)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-[#14142b] bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors shrink-0"
              >
                <Shield size={16} /> Manage Access
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          <span className="text-xs text-gray-400">
            Page {page + 1} of {totalPages}
          </span>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-gray-600 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      <UserAccessDrawer
        user={drawerUser}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        canManageAdminRole={canManageAdminRole}
        onChanged={handleAccessChanged}
      />

      {grantDialogOpen && (
        <GrantAccessDialog
          onClose={() => setGrantDialogOpen(false)}
          onSelect={handleGrantSelect}
        />
      )}
    </div>
  );
}
