'use client';

import { useState, useEffect } from 'react';
import { roleService, Role } from '@/services/role.service';
import { permissionService, Permission } from '@/services/permission.service';
import { AuthService } from '@/services/auth.service';
import { toast } from 'sonner';
import { Plus, X, ShieldCheck, Edit3, Trash2 } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuthStore } from '@/store/auth.store';

const formatPermissionKey = (key: string) => {
  if (!key) return '';
  const parts = key.split('.');
  const capitalized = parts.map(p => p.charAt(0).toUpperCase() + p.slice(1));
  if (capitalized.length >= 2) {
    const action = capitalized.pop();
    const resource = capitalized.join(' ');
    return `${action} ${resource}`;
  }
  return key;
};

export function PolicyManager() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  
  const { hasPermission } = usePermissions();
  const { user } = useAuthStore();
  const hasPlatformRole = user?.roles?.some((r: any) => r.scopeType === 'PLATFORM') || false;
  const canManagePolicies = hasPlatformRole || hasPermission('roles.create');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesData, permsData] = await Promise.all([
        roleService.getAllRoles('PLATFORM'),
        permissionService.getAllPermissions()
      ]);
      setRoles(rolesData);
      setPermissions(permsData.filter(p => p.scopeType === 'PLATFORM'));
    } catch (error) {
      toast.error('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) {
      toast.error('Policy name is required');
      return;
    }
    
    try {
      setSaving(true);
      if (editingRole) {
        await roleService.updateRole(editingRole.id, {
          name: newRoleName,
          description: newRoleDesc,
          permissionIds: selectedPermissions
        });
        toast.success('Policy updated successfully');
      } else {
        await roleService.createRole({
          name: newRoleName,
          description: newRoleDesc,
          permissionIds: selectedPermissions
        }, 'PLATFORM');
        toast.success('Policy created successfully');
      }
      setIsModalOpen(false);
      setEditingRole(null);
      setNewRoleName('');
      setNewRoleDesc('');
      setSelectedPermissions([]);
      fetchData();
      await AuthService.refresh();
    } catch (error) {
      toast.error(editingRole ? 'Failed to update policy' : 'Failed to create policy');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePolicy = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this policy? This action cannot be undone.')) {
      return;
    }
    try {
      await roleService.deleteRole(id);
      toast.success('Policy deleted successfully');
      fetchData();
      await AuthService.refresh();
    } catch (error) {
      toast.error('Failed to delete policy');
    }
  };

  const startEditRole = (role: Role) => {
    setEditingRole(role);
    setNewRoleName(role.name);
    setNewRoleDesc(role.description || '');
    setSelectedPermissions(role.permissions?.map((p: any) => p.id) || []);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
    setNewRoleName('');
    setNewRoleDesc('');
    setSelectedPermissions([]);
  };

  const togglePermission = (permId: string) => {
    if (selectedPermissions.includes(permId)) {
      setSelectedPermissions(selectedPermissions.filter(id => id !== permId));
    } else {
      setSelectedPermissions([...selectedPermissions, permId]);
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Loading policies...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-500">Manage custom policies and their associated permissions.</p>
        {canManagePolicies && (
          <button
            onClick={() => {
              setEditingRole(null);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            <Plus size={16} /> Create Policy
          </button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {roles.map(role => (
          <div key={role.id} className="p-5 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col h-full">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-indigo-600" />
                  {role.name}
                  {role.isSystem && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full">System</span>
                  )}
                </h4>
                <p className="text-sm text-gray-500 mt-1">{role.description || 'No description provided.'}</p>
              </div>
              <div className="flex gap-1">
                {canManagePolicies && !role.isSystem && (
                  <button
                    onClick={() => startEditRole(role)}
                    className="p-1.5 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                    title="Edit Policy"
                  >
                    <Edit3 size={16} />
                  </button>
                )}
                {hasPlatformRole && !role.isSystem && (
                  <button
                    onClick={() => handleDeletePolicy(role.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete Policy"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-gray-50">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Permissions ({role.permissions?.length || 0})</p>
              <div className="flex flex-wrap gap-1.5">
                {role.permissions?.map((p: any) => (
                  <span key={p.id} className="inline-block px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded border border-indigo-100">
                    {p.name || formatPermissionKey(p.key)}
                  </span>
                ))}
                {(!role.permissions || role.permissions.length === 0) && (
                  <span className="text-xs text-gray-400 italic">No permissions assigned</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {editingRole ? 'Edit Policy' : 'Create New Policy'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreatePolicy} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Policy Name</label>
                <input 
                  type="text" 
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="e.g. Content Moderator"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Briefly describe what this policy allows..."
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Permissions</label>
                <div className="grid md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                  {permissions.map(perm => (
                    <label key={perm.id} className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={selectedPermissions.includes(perm.id)}
                        onChange={() => togglePermission(perm.id)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{perm.name || formatPermissionKey(perm.key)}</div>
                        {perm.description && <div className="text-xs text-gray-500">{perm.description}</div>}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50"
                >
                  {saving ? (editingRole ? 'Updating...' : 'Creating...') : (editingRole ? 'Update Policy' : 'Create Policy')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
