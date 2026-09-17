'use client';

import { useState, useEffect, useMemo } from 'react';
// -----------------------------------------------------------------------------------------
// IMPORTANT: Before making further UI or architectural changes to the Policy Editor,
// read the standard defined in docs/architecture/iam-policy-editor-standard.md.
// Future versions of this editor should implement Managed Policy Bundles, Permission Tree Views,
// and Dependency Validations.
// -----------------------------------------------------------------------------------------
import { roleService, Role } from "@/domains/identity";
import { AuthService } from '@/infrastructure/auth/auth.service';
import { toast } from 'sonner';
import { Plus, ShieldCheck, Edit3, Trash2, Search, Shield, Lock } from 'lucide-react';
import { usePermissions } from "@/domains/identity";
import { PolicyEditor } from '@/domains/iam/policy-editor/PolicyEditor';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'CUSTOM' | 'SYSTEM'>('ALL');

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

  const filteredRoles = useMemo(() => {
    return roles.filter(role => {
      const matchesSearch =
        role.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        role.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (role.description && role.description.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (typeFilter === 'CUSTOM') return !role.systemRole;
      if (typeFilter === 'SYSTEM') return !!role.systemRole;
      return true;
    });
  }, [roles, searchQuery, typeFilter]);

  const customCount = roles.filter(r => !r.systemRole).length;
  const systemCount = roles.filter(r => !!r.systemRole).length;

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center rounded-2xl border border-slate-200/80 bg-white/80 p-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="size-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          <span className="text-xs font-semibold text-slate-500">Loading platform policies...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action and Filter Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Type Filter Pills */}
        <div className="flex items-center gap-1 rounded-full border border-slate-200/80 bg-white/80 p-1 shadow-[0_2px_8px_rgba(20,20,43,0.04)] backdrop-blur-md">
          <button
            type="button"
            onClick={() => setTypeFilter('ALL')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              typeFilter === 'ALL'
                ? 'bg-[#14142b] text-white shadow-xs'
                : 'text-slate-500 hover:bg-slate-50 hover:text-[#14142b]'
            }`}
          >
            All Policies <span className="opacity-75 font-normal">({roles.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('CUSTOM')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              typeFilter === 'CUSTOM'
                ? 'bg-[#14142b] text-white shadow-xs'
                : 'text-slate-500 hover:bg-slate-50 hover:text-[#14142b]'
            }`}
          >
            Custom <span className="opacity-75 font-normal">({customCount})</span>
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('SYSTEM')}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
              typeFilter === 'SYSTEM'
                ? 'bg-[#14142b] text-white shadow-xs'
                : 'text-slate-500 hover:bg-slate-50 hover:text-[#14142b]'
            }`}
          >
            System <span className="opacity-75 font-normal">({systemCount})</span>
          </button>
        </div>

        {/* Create Policy Button */}
        {canManagePolicies && (
          <button
            onClick={() => {
              setEditingRole(null);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#14142b] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#232735] transition-all"
          >
            <Plus size={15} />
            <span>Create Policy</span>
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
          <Search className="h-4 w-4 text-slate-400" />
        </div>
        <input
          type="text"
          className="block w-full rounded-xl border border-slate-200/90 bg-white py-2.5 pl-10 pr-4 text-xs focus:border-[#14142b]/30 focus:outline-none focus:ring-1 focus:ring-slate-300 shadow-2xs placeholder:text-slate-400"
          placeholder="Search policies by name, code, or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Enterprise Data Table */}
      {filteredRoles.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center text-slate-500">
          No policies found matching your search.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_24px_-4px_rgba(20,20,43,0.04)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/75 backdrop-blur-xs text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-6 font-semibold w-[28%]">Policy</th>
                  <th className="py-3.5 px-4 font-semibold w-[24%]">Description</th>
                  <th className="py-3.5 px-4 font-semibold w-[30%]">Permissions</th>
                  <th className="py-3.5 px-4 font-semibold w-[10%]">Type</th>
                  <th className="py-3.5 px-6 font-semibold text-right w-[8%]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-slate-50/80 transition-all duration-150">
                    {/* Policy Identity */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 shadow-2xs">
                          <ShieldCheck size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-slate-900 truncate">
                              {role.displayName}
                            </span>
                          </div>
                          <span className="font-mono text-[10.5px] text-slate-400">
                            {role.code}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Description */}
                    <td className="py-4 px-4">
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {role.description || <span className="italic text-slate-400">No description provided</span>}
                      </p>
                    </td>

                    {/* Permissions */}
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[320px]">
                        {role.permissions && role.permissions.length > 0 ? (
                          <>
                            {role.permissions.slice(0, 3).map((p: any) => (
                              <span
                                key={p.id}
                                className="inline-flex items-center rounded-md bg-slate-100/90 border border-slate-200/80 px-2 py-0.5 text-[10.5px] font-medium text-slate-700"
                              >
                                {formatPermissionKey(p.code)}
                              </span>
                            ))}
                            {role.permissions.length > 3 && (
                              <span className="inline-flex items-center rounded-md bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                                +{role.permissions.length - 3} more
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No permissions assigned</span>
                        )}
                      </div>
                    </td>

                    {/* Type / Scope */}
                    <td className="py-4 px-4">
                      {role.systemRole ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[10.5px] font-semibold text-slate-600">
                          <Lock size={10} className="text-slate-400" />
                          System
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 text-[10.5px] font-semibold text-emerald-700">
                          <Shield size={10} className="text-emerald-500" />
                          Custom
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {canManagePolicies && !role.systemRole ? (
                          <>
                            <button
                              onClick={() => startEditRole(role)}
                              className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-[#14142b] transition-colors shadow-2xs"
                              title="Edit Policy"
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              onClick={() => handleDeletePolicy(role.id)}
                              className="inline-flex size-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50/50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors shadow-2xs"
                              title="Delete Policy"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-medium italic">Read-only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit/Create Policy Modal */}
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
