'use client';

import { useState, useEffect } from 'react';
import { UserService } from '@/services/user.service';
import { roleService, Role } from '@/services/role.service';
import { User } from '@/store/auth.store';
import { toast } from 'sonner';
import { Shield, Plus, X, Edit3 } from 'lucide-react';

export function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    const userRoleIds = (user as any).roles?.map((r: any) => r.id).filter(Boolean) || [];
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
    } catch (error) {
      toast.error('Failed to assign roles');
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

  return (
    <div className="space-y-4">
      {users.map(user => (
        <div key={user.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50/50">
          <div>
            <h4 className="font-semibold text-gray-900">{user.firstName} {user.lastName}</h4>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="mt-2 flex gap-2 flex-wrap">
              {(user as any).roles?.map((role: any) => (
                <span key={role.id} className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                  {role.name}
                </span>
              ))}
            </div>
          </div>
          <button 
            onClick={() => openAssignModal(user)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <Shield size={16} /> Assign Policy
          </button>
        </div>
      ))}

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
              {roles.map(role => (
                <label key={role.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={selectedRoles.includes(role.id)}
                    onChange={() => toggleRoleSelection(role.id)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{role.name}</div>
                    <div className="text-xs text-gray-500">{role.description}</div>
                  </div>
                </label>
              ))}
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
