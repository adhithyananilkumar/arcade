'use client';

import { useState, useEffect } from 'react';
import { roleService, Role } from "@/domains/identity";
import { AuthService } from '@/infrastructure/auth/auth.service';
import { toast } from 'sonner';
import { Plus, ShieldCheck, Edit3, Trash2, Users, Search } from 'lucide-react';
import { usePermissions } from "@/domains/identity";
import { PolicyEditor } from '@/domains/iam/policy-editor/PolicyEditor';
import { SURFACE_LABEL } from '@/domains/iam/policy-editor/PermissionSelector';
import type { ConsoleSurface } from '@/domains/identity';
import { ConfirmDialog } from '@/domains/iam';

export function PolicyManager() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState('');

  const { hasPermission } = usePermissions();
  const canManagePolicies = hasPermission('platform.roles.manage');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const rolesData = await roleService.getAllRoles();
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
        });
        toast.success('Policy created successfully');
      }
      setIsModalOpen(false);
      setEditingRole(null);
      fetchData();
      await AuthService.refresh();
    } catch {
      toast.error(editingRole ? 'Failed to update policy' : 'Failed to create policy');
    }
  };

  const handleDeletePolicy = async () => {
    if (!deletingRole) return;
    try {
      setDeleting(true);
      await roleService.deleteRole(deletingRole.id);
      toast.success('Policy deleted successfully');
      setDeletingRole(null);
      fetchData();
      await AuthService.refresh();
    } catch (error) {
      toast.error('Failed to delete policy');
    } finally {
      setDeleting(false);
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

  if (loading) return <div className="text-sm text-gray-500">Loading policies...</div>;

  const filteredRoles = roles.filter((role) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      role.displayName.toLowerCase().includes(q) ||
      (role.description ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-900">Policies</p>
          <p className="text-xs text-gray-500">Reusable access definitions for Platform Console users.</p>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 sm:w-64">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-[#14142b]/30 focus:outline-none focus:ring-1 focus:ring-slate-300 shadow-sm"
              placeholder="Search policies…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {canManagePolicies && (
            <button
              onClick={() => {
                setEditingRole(null);
                setIsModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#14142b] hover:bg-[#232735] rounded-lg transition-colors shrink-0"
            >
              <Plus size={16} /> Create Policy
            </button>
          )}
        </div>
      </div>

      {filteredRoles.length === 0 ? (
        <div className="p-10 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <p className="text-sm text-gray-500">No policies match &quot;{search}&quot;.</p>
        </div>
      ) : (
      <div className="grid gap-4 md:grid-cols-2">
        {filteredRoles.map(role => {
          const surfaces = Array.from(
            new Set((role.permissions ?? []).map((p) => SURFACE_LABEL[(p.surface as ConsoleSurface) ?? 'SYSTEM']))
          );
          return (
            <div key={role.id} className="p-5 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col h-full">
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-[#14142b] shrink-0" />
                    <span className="truncate">{role.displayName}</span>
                    <span className={`shrink-0 px-2 py-0.5 text-xs font-semibold rounded-full ${
                      role.systemRole ? 'bg-gray-100 text-gray-600' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {role.systemRole ? 'System' : 'Custom'}
                    </span>
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">{role.description || 'No description provided.'}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  {canManagePolicies && !role.systemRole && (
                    <button
                      onClick={() => startEditRole(role)}
                      className="p-1.5 text-gray-500 hover:text-[#14142b] rounded-lg hover:bg-slate-100 transition-colors"
                      title="Edit Policy"
                    >
                      <Edit3 size={16} />
                    </button>
                  )}
                  {canManagePolicies && !role.systemRole && (
                    <button
                      onClick={() => setDeletingRole(role)}
                      className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Delete Policy"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                <span>{role.permissions?.length || 0} permission{(role.permissions?.length || 0) === 1 ? '' : 's'}</span>
                <span className="flex items-center gap-1">
                  <Users size={12} /> {role.assignedUserCount ?? 0} user{(role.assignedUserCount ?? 0) === 1 ? '' : 's'}
                </span>
              </div>

              <div className="mt-auto pt-3 border-t border-gray-50">
                {surfaces.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {surfaces.map((s) => (
                      <span key={s} className="inline-block px-2 py-1 bg-slate-100 text-[#14142b] text-xs rounded border border-slate-200">
                        {s}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 italic">No permissions assigned</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl">
            <PolicyEditor
              scope="PLATFORM"
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

      <ConfirmDialog
        open={deletingRole !== null}
        title={`Delete ${deletingRole?.displayName ?? 'this policy'}?`}
        description={<p>This action cannot be undone. Any users currently holding this policy will lose the permissions it grants.</p>}
        danger
        busy={deleting}
        confirmLabel="Delete Policy"
        onConfirm={handleDeletePolicy}
        onCancel={() => setDeletingRole(null)}
      />
    </div>
  );
}
