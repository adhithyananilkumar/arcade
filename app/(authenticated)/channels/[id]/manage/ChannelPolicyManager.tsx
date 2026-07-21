'use client';

import { useState, useEffect, useCallback } from 'react';
// -----------------------------------------------------------------------------------------
// IMPORTANT: Before making further UI or architectural changes to the Policy Editor,
// read the standard defined in docs/architecture/iam-policy-editor-standard.md.
// Future versions of this editor should implement Managed Policy Bundles, Permission Tree Views,
// and Dependency Validations.
// -----------------------------------------------------------------------------------------
import { roleService, Role, RoleRequest } from "@/domains/identity";
import { toast } from 'sonner';
import { Plus, ShieldCheck, Edit3, Trash2, Shield } from 'lucide-react';
import { PolicyEditor } from '@/domains/iam';
import { RolePermissionsViewer } from '@/domains/iam/components/RolePermissionsViewer';

interface ChannelPolicyManagerProps {
  channelId: string;
  permissions: string[];
}

export function ChannelPolicyManager({ channelId, permissions: userPermissions }: ChannelPolicyManagerProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);
  const canCreateRoles = userPermissions.includes('ALL') || userPermissions.includes('channel.roles.create');
  const canUpdateRoles = userPermissions.includes('ALL') || userPermissions.includes('channel.roles.update');
  const canDeleteRoles = userPermissions.includes('ALL') || userPermissions.includes('channel.roles.delete');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const rolesData = await roleService.getChannelRoles(channelId);
      setRoles(rolesData);
    } catch {
      toast.error('Failed to load roles');
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSavePolicy = async (data: {
    name: string;
    description: string;
    effectivePermissionIds: string[];
  }) => {
    try {
      setSaving(true);
      const payload: RoleRequest = {
        code: editingRole ? editingRole.code : data.name.toUpperCase().replace(/\s+/g, '_'),
        displayName: data.name,
        description: data.description,
        permissionIds: data.effectivePermissionIds,
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
    } catch {
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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
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
        {canCreateRoles && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Create Policy
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
                  {role.displayName}
                  {role.systemRole && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full">System</span>
                  )}
                  {!role.systemRole && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-orange-100 text-orange-700 rounded-full">Custom</span>
                  )}
                </h4>
                <p className="text-sm text-gray-500 mt-1">{role.description || 'No description provided.'}</p>
              </div>
              
              {!role.systemRole && (canUpdateRoles || canDeleteRoles) && (
                <div className="flex items-center gap-2">
                  {canUpdateRoles && (
                    <button onClick={() => startEditRole(role)} className="p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-lg hover:bg-indigo-50">
                      <Edit3 size={16} />
                    </button>
                  )}
                  {canDeleteRoles && (
                    <button onClick={() => handleDeletePolicy(role.id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <RolePermissionsViewer role={role} />
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl">
            <PolicyEditor
              scope="CHANNEL"
              resourceId={channelId}
              mode={editingRole ? 'edit' : 'create'}
              policy={editingRole ? {
                id: editingRole.id,
                name: editingRole.displayName ?? '',
                description: editingRole.description,
                permissionIds: editingRole.permissions?.map((p) => p.id) ?? [],
              } : undefined}
              onSave={handleSavePolicy}
              onCancel={handleCloseModal}
            />
          </div>
        </div>
      )}
    </div>
  );
}
