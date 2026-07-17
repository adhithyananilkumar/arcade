'use client';

import { useState, useEffect } from 'react';
import { roleService, Role, RoleRequest } from '@/services/role.service';
import { permissionService, Permission } from '@/services/permission.service';
import { toast } from 'sonner';
import { Plus, X, ShieldCheck, Edit3, Trash2, Shield } from 'lucide-react';

interface ChannelPolicyManagerProps {
  channelId: string;
  permissions: string[];
}

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

export function ChannelPolicyManager({ channelId, permissions }: ChannelPolicyManagerProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // We rely on permissions array containing 'ALL' if they are owner
  const canManageStaff = permissions.includes('ALL') || permissions.includes('channel.staff.manage');

  useEffect(() => {
    fetchData();
  }, [channelId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesData, permsData] = await Promise.all([
        roleService.getChannelRoles(channelId),
        permissionService.getAllPermissions() // Wait, permissions API has scope support?
      ]);
      setRoles(rolesData);
      
      // Filter permissions to only show ORGANIZATION scope for custom roles
      const orgPerms = permsData.filter(p => p.scopeType === 'ORGANIZATION');
      setAvailablePermissions(orgPerms);
    } catch (error) {
      toast.error('Failed to load roles');
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
      const payload: RoleRequest = {
        name: newRoleName,
        description: newRoleDesc,
        permissionIds: selectedPermissions
      };

      if (editingRole) {
        await roleService.updateChannelRole(channelId, editingRole.id, payload);
        toast.success('Role updated successfully');
      } else {
        await roleService.createChannelRole(channelId, payload);
        toast.success('Role created successfully');
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      toast.error(editingRole ? 'Failed to update role' : 'Failed to create role');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePolicy = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this custom role? Users assigned this role may lose access.')) {
      return;
    }
    try {
      await roleService.deleteChannelRole(channelId, id);
      toast.success('Role deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete role');
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

  if (loading) return <div className="p-8 text-center text-gray-500">Loading roles...</div>;

  return (
    <div className="space-y-6 mt-8 pt-8 border-t border-gray-200">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Shield className="text-indigo-600" size={20} />
            Custom Roles
          </h3>
          <p className="text-sm text-gray-500">Create custom roles with specific permissions for your channel staff.</p>
        </div>
        {canManageStaff && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            <Plus size={16} /> Create Role
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
                  {!role.isSystem && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700 rounded-full">Custom</span>
                  )}
                </h4>
                <p className="text-sm text-gray-500 mt-1">{role.description || 'No description provided.'}</p>
              </div>
              
              {!role.isSystem && canManageStaff && (
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => startEditRole(role)}
                    className="p-1.5 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                    title="Edit Role"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => handleDeletePolicy(role.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete Role"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
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
                {editingRole ? 'Edit Custom Role' : 'Create Custom Role'}
              </h3>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreatePolicy} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <input 
                  type="text" 
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="e.g. Video Editor"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea 
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Briefly describe what this role allows..."
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Select Permissions</label>
                <div className="grid md:grid-cols-2 gap-3 max-h-60 overflow-y-auto p-1">
                  {availablePermissions.map(perm => (
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
                  {availablePermissions.length === 0 && (
                    <div className="col-span-2 text-sm text-gray-500 p-4 text-center border rounded-lg border-dashed">
                      No organization permissions available.
                    </div>
                  )}
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
                  {saving ? (editingRole ? 'Updating...' : 'Creating...') : (editingRole ? 'Update Role' : 'Create Role')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
