'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UserService } from "@/domains/identity";
import { roleService, Role } from "@/domains/identity";
import { User, useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthService } from '@/infrastructure/auth/auth.service';
import { toast } from 'sonner';
import { Shield, Plus, X, Edit3, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/design-system/ui/avatar';
import { getAvatarUrl } from '@/shared/utils/avatar';

export function UsersList() {
  const currentUser = useAuthStore(state => state.user);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, rolesData] = await Promise.all([
        UserService.getAllUsers(),
        roleService.getAllRoles()
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const openAssignModal = (user: User) => {
    setSelectedUser(user);
    // Assuming user object has roles array like { id, name }
    const userRoleIds = (user as any).platformRoles?.map((r: any) => r.id).filter(Boolean) || [];
    setSelectedRoles(userRoleIds);
    setIsModalOpen(true);
  };

  const handleAssignRoles = async () => {
    if (!selectedUser) return;
    try {
      await UserService.assignRolesToUser(selectedUser.id, selectedRoles);
      toast.success('Roles assigned successfully');
      setIsModalOpen(false);
      fetchData(); // refresh list
      await AuthService.refresh();
    } catch (error: any) {
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to assign roles');
      }
    }
  };

  const toggleRoleSelection = (roleId: string) => {
    if (selectedRoles.includes(roleId)) {
      setSelectedRoles(selectedRoles.filter(id => id !== roleId));
    } else {
      setSelectedRoles([...selectedRoles, roleId]);
    }
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

      {filteredUsers.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
          No users found matching "{searchQuery}"
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_24px_-4px_rgba(20,20,43,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/75 backdrop-blur-xs text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-6 font-semibold">User</th>
                  <th className="py-3.5 px-4 font-semibold">Email</th>
                  <th className="py-3.5 px-4 font-semibold">Assigned Policies</th>
                  <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-all duration-150">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3.5">
                        <Avatar className="h-9 w-9 border border-slate-200/80 shadow-2xs">
                          <AvatarImage src={getAvatarUrl(user.avatarUrl)} alt="Avatar" className="object-cover" referrerPolicy="no-referrer" />
                          <AvatarFallback className="bg-slate-100 text-[#14142b] font-bold text-xs">
                            {user.firstName ? user.firstName.charAt(0) : 'U'}
                            {user.lastName ? user.lastName.charAt(0) : ''}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900">
                            <Link 
                              href={`/${user.username}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="hover:text-indigo-600 transition-colors"
                            >
                              {user.firstName} {user.lastName}
                            </Link>
                          </h4>
                          {user.username && (
                            <p className="text-[11px] text-slate-400 font-mono">@{user.username}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-medium text-slate-600">
                      {user.email}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-1.5 flex-wrap max-w-[280px]">
                        {(user as any).platformRoles && (user as any).platformRoles.length > 0 ? (
                          (user as any).platformRoles.map((role: any) => (
                            <span key={role.id} className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10.5px] font-semibold text-[#14142b]">
                              {role.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400">No custom policies</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <button 
                        onClick={() => openAssignModal(user)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-[#14142b] hover:bg-slate-50 transition-colors shadow-2xs hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Shield size={13} className="text-indigo-600" />
                        <span>Assign Policy</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Assign Policies</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-sm text-gray-500 mb-4">Select policies for {selectedUser.firstName} {selectedUser.lastName}.</p>
            
            <div className="space-y-2 max-h-60 overflow-y-auto mb-6">
              {roles.map(role => {
                const targetHighestLevel = (selectedUser as any).platformRoles
                  ?.filter((r: any) => r.scopeType === 'PLATFORM')
                  .map((r: any) => r.level || 0)
                  .sort((a: number, b: number) => b - a)[0] || 0;
                  
                const currentUserHighestLevel = currentUser?.platformRoles
                  ?.filter((r: any) => r.scopeType === 'PLATFORM')
                  .map((r: any) => r.level || 0)
                  .sort((a: number, b: number) => b - a)[0] || 0;

                const isTargetHigherOrEqual = targetHighestLevel >= currentUserHighestLevel && currentUser?.id !== selectedUser.id && targetHighestLevel > 0;
                const isRoleHigherOrEqual = currentUserHighestLevel > 0 && (role.level || 0) >= currentUserHighestLevel;
                const disabled = isTargetHigherOrEqual || isRoleHigherOrEqual;

                return (
                  <label key={role.id} className={`flex items-center gap-3 p-3 rounded-lg border ${disabled ? 'border-gray-50 bg-gray-50 opacity-50 cursor-not-allowed' : 'border-gray-100 hover:bg-gray-50 cursor-pointer'}`}>
                    <input 
                      type="checkbox" 
                      checked={selectedRoles.includes(role.id)}
                      onChange={() => !disabled && toggleRoleSelection(role.id)}
                      disabled={disabled}
                      className="h-4 w-4 rounded border-gray-300 text-[#14142b] focus:ring-slate-300 disabled:opacity-50"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {role.displayName}
                        {disabled && <span className="ml-2 text-[10px] uppercase text-red-500 font-semibold bg-red-50 px-1.5 py-0.5 rounded">Not Allowed</span>}
                      </div>
                      <div className="text-xs text-gray-500">{role.description}</div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignRoles}
                className="px-4 py-2 text-sm font-medium text-white bg-[#14142b] hover:bg-[#232735] rounded-lg"
              >
                Save Assignments
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
