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

export function UsersList() {
  const currentUser = useAuthStore(state => state.user);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const getAvatarUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
    if (url.startsWith('/api/v1/')) {
      return baseUrl.replace('/api/v1', '') + url;
    }
    if (!url.includes('/')) {
      return baseUrl + '/users/avatars/' + url;
    }
    return baseUrl + (url.startsWith('/') ? '' : '/') + url;
  };

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
          className="block w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm"
          placeholder="Search users by name, username, or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {filteredUsers.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          No users found matching "{searchQuery}"
        </div>
      ) : (
        filteredUsers.map(user => (
          <div key={user.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-slate-200">
              <AvatarImage src={getAvatarUrl(user.avatarUrl)} alt="Avatar" className="object-cover" referrerPolicy="no-referrer" />
              <AvatarFallback className="bg-indigo-50 text-indigo-700 font-semibold text-sm">
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
                  className="hover:text-indigo-600 hover:underline transition-colors"
                >
                  {user.firstName} {user.lastName}
                </Link>
              </h4>
              <p className="text-sm text-gray-500">{user.email}</p>
              <div className="mt-2 flex gap-2 flex-wrap">
                {(user as any).platformRoles?.map((role: any) => (
                  <span key={role.id} className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                    {role.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button 
            onClick={() => openAssignModal(user)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <Shield size={16} /> Assign Policy
          </button>
        </div>
      )))}

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
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 disabled:opacity-50"
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
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
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
