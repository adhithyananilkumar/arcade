'use client';

import { useState, useEffect } from 'react';
// -----------------------------------------------------------------------------------------
// IMPORTANT: Before making further UI or architectural changes to the Policy Editor,
// read the standard defined in docs/architecture/iam-policy-editor-standard.md.
// Future versions of this editor should implement Managed Policy Bundles, Permission Tree Views,
// and Dependency Validations.
// -----------------------------------------------------------------------------------------
import { roleService, Role } from "@/domains/identity";
import { AuthService } from '@/infrastructure/auth/auth.service';
import { toast } from 'sonner';
import { Plus, ShieldCheck, Edit3, Trash2 } from 'lucide-react';
import { usePermissions } from "@/domains/identity";
import { PolicyEditor } from '@/domains/iam/policy-editor/PolicyEditor';
import { useAuthStore } from "@/infrastructure/auth/auth.store";

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
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);

  const { hasPermission } = usePermissions();
  const canManagePolicies = hasPermission('platform.roles.manage');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const rolesData = await roleService.getAllRoles('PLATFORM');
      setRoles(rolesData);
    } catch (error) {
      toast.error('Failed to load policies');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePolicy = async (data: {
    name: string;
    description: string;
    effectivePermissionIds: string[];
  }) => {
    try {
      setSaving(true);
      if (editingRole) {
        await roleService.updateRole(editingRole.id, {
          code: editingRole.code,
          displayName: data.name,
          description: data.description,
          permissionIds: data.effectivePermissionIds,
        });
        toast.success('Policy updated successfully');
      } else {
        await roleService.createRole({
          code: data.name.toUpperCase().replace(/\s+/g, '_'),
          displayName: data.name,
          description: data.description,
          permissionIds: data.effectivePermissionIds,
        }, 'PLATFORM');
        toast.success('Policy created successfully');
      }
      setIsModalOpen(false);
      setEditingRole(null);
      fetchData();
      await AuthService.refresh();
    } catch {
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
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
  };

  const togglePermission = (_permId: string) => {}; // unused – editor owns this now

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
                  {role.displayName}
                  {role.systemRole && (
                    <span className="px-2 py-0.5 text-xs font-semibold bg-gray-100 text-gray-600 rounded-full">System</span>
                  )}
                </h4>
                <p className="text-sm text-gray-500 mt-1">{role.description || 'No description provided.'}</p>
              </div>
              <div className="flex gap-1">
                {canManagePolicies && !role.systemRole && (
                  <button
                    onClick={() => startEditRole(role)}
                    className="p-1.5 text-gray-500 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                    title="Edit Policy"
                  >
                    <Edit3 size={16} />
                  </button>
                )}
                {canManagePolicies && !role.systemRole && (
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
                    {formatPermissionKey(p.code)}
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
          <div className="w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl">
            <PolicyEditor
              scope="PLATFORM"
              mode={editingRole ? 'edit' : 'create'}
              policy={editingRole ? {
                id: editingRole.id,
                name: editingRole.displayName ?? '',
                description: editingRole.description,
                permissionIds: editingRole.permissions?.map((p: any) => p.id) ?? [],
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
