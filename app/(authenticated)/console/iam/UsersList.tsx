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

interface UsersListProps {
  headerSlot?: React.ReactNode;
}

export function UsersList({ headerSlot }: UsersListProps = {}) {
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
      {/* Unified Toolbar Dock */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-full border border-slate-200/80 bg-surface/80 p-1.5 shadow-xs backdrop-blur-md">
        {headerSlot}
        <div className="flex items-center gap-2 flex-1 sm:flex-initial justify-end">
          <div className="relative min-w-[220px] sm:min-w-[320px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input
              type="text"
              className="w-full rounded-full border border-slate-200/80 bg-surface py-1.5 pl-8 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
              placeholder="Search users with platform access…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          {canManageAdminRole && (
            <button
              type="button"
              onClick={() => setGrantDialogOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-on-ink bg-slate-950 hover:bg-slate-800 rounded-full transition-colors shrink-0 shadow-xs"
            >
              <UserPlus size={13} /> Grant Access
            </button>
          )}
        </div>
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
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-on-ink bg-ink hover:bg-ink-hover rounded-lg transition-colors"
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
                  <AvatarFallback className="bg-slate-100 text-ink font-semibold text-sm">
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
                      className="hover:text-ink hover:underline transition-colors"
                    >
                      {user.firstName} {user.lastName}
                    </Link>
                  </h4>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    {user.platformRoles?.length ? (
                      user.platformRoles.map((role) => (
                        <span key={role.id} className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-ink ring-1 ring-inset ring-slate-300">
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
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-ink bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors shrink-0"
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
