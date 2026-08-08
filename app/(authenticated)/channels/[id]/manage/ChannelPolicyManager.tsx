'use client';

import { useState, useEffect } from 'react';
// -----------------------------------------------------------------------------------------
// IMPORTANT: Before making further UI or architectural changes to the Policy Editor,
// read the standard defined in docs/architecture/iam-policy-editor-standard.md.
// Future versions of this editor should implement Managed Policy Bundles, Permission Tree Views,
// and Dependency Validations.
// -----------------------------------------------------------------------------------------
import { roleService, Role, RoleRequest } from "@/domains/identity";
import { toast } from 'sonner';
import { Plus, ShieldCheck, Edit3, Trash2, Shield } from 'lucide-react';
import { PolicyEditor } from '@/domains/iam/policy-editor/PolicyEditor';
import { Card, CardContent, CardHeader } from '@/shared/design-system/ui/card';
import { Badge } from '@/shared/design-system/ui/badge';
import { Skeleton } from '@/shared/design-system/ui/skeleton';
import { Button } from '@/shared/design-system/ui/button';

interface ChannelPolicyManagerProps {
  channelId: string;
  permissions: string[];
  isSuspended?: boolean;
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

export function ChannelPolicyManager({ channelId, permissions: userPermissions, isSuspended }: ChannelPolicyManagerProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);
  const canManageRoles = userPermissions.includes('ALL') || userPermissions.includes('channel.roles.manage');
  const canViewRoles = canManageRoles || userPermissions.includes('channel.staff.manage');

  useEffect(() => {
    fetchData();
  }, [channelId, canViewRoles]);

  const fetchData = async () => {
    if (!canViewRoles) {
      setLoading(false);
      setRoles([]);
      return;
    }
    try {
      setLoading(true);
      const rolesData = await roleService.getChannelRoles(channelId);
      setRoles(rolesData || []);
    } catch (error: any) {
      if (error?.status === 403 || error?.message?.includes('403')) {
        setRoles([]);
      } else {
        toast.error('Failed to load roles');
      }
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


  if (loading) {
    return (
      <div className="space-y-3 mt-8 pt-8 border-t border-gray-200">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-8 pt-8 border-t border-slate-200/60">
      {!canManageRoles && (
        <Card className="border-indigo-100/80 bg-indigo-50/20 shadow-2xs mb-8 rounded-3xl">
          <CardHeader>
            <h3 className="text-sm font-extrabold text-[#14142b] flex items-center gap-2">
              <ShieldCheck className="text-indigo-600" size={18} />
              Your Permissions
            </h3>
            <p className="text-xs font-medium text-slate-500">Here are the permissions you have been granted in this channel.</p>
          </CardHeader>
          <CardContent>
            {userPermissions.length > 0 ? (
              <ul className="list-disc pl-5 space-y-1.5 text-xs font-semibold text-slate-700">
                {userPermissions.map((perm) => (
                  <li key={perm} className="capitalize">{formatPermissionKey(perm)}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-400 italic">No specific permissions assigned.</p>
            )}
          </CardContent>
        </Card>
      )}

      {canViewRoles && (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-extrabold text-[#14142b] flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-indigo-100/90 text-indigo-700 border border-indigo-200/60 shadow-2xs">
                  <Shield size={18} />
                </span>
                <span>Custom Roles</span>
              </h3>
              <p className="text-sm font-medium text-slate-500 mt-1">Create custom roles with specific permissions for your channel staff.</p>
            </div>
            {canManageRoles && (
              <Button
                onClick={() => setIsModalOpen(true)}
                disabled={isSuspended}
                title={isSuspended ? 'Channel is suspended' : undefined}
                className="rounded-full bg-[#14142b] text-white hover:bg-[#232735] px-4.5 py-2 text-xs font-extrabold shadow-xs transition-all active:scale-[0.98]"
              >
                <Plus size={16} /> Create Role
              </Button>
            )}
          </div>

          <div className="grid gap-4.5 md:grid-cols-2">
            {roles.map((role, idx) => {
              const cardColor = idx % 2 === 0
                ? 'bg-gradient-to-br from-white via-indigo-50/40 to-blue-50/60 border-indigo-100/90 hover:border-indigo-300'
                : 'bg-gradient-to-br from-white via-purple-50/40 to-teal-50/50 border-purple-100/90 hover:border-purple-300';
              
              const iconBg = idx % 2 === 0 ? 'bg-indigo-100/80 text-indigo-700 border-indigo-200/70' : 'bg-purple-100/80 text-purple-700 border-purple-200/70';

              return (
              <Card key={role.id} className={`flex flex-col h-full rounded-3xl border ${cardColor} shadow-[0_8px_24px_rgba(20,20,43,0.04)] transition-all duration-300 hover:shadow-md`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-extrabold text-[#14142b] flex items-center gap-2 text-sm">
                        <span className={`grid size-7 place-items-center rounded-lg border ${iconBg} shadow-2xs`}>
                          <ShieldCheck size={15} />
                        </span>
                        <span>{role.displayName}</span>
                        {role.systemRole ? (
                          <Badge variant="secondary" className="bg-slate-100/90 text-slate-700 text-[10px] font-extrabold border border-slate-200/60">System</Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-800 border-amber-200/80 bg-amber-100/80 text-[10px] font-extrabold shadow-2xs">Custom</Badge>
                        )}
                      </h4>
                      <p className="text-xs font-medium text-slate-500 mt-2 leading-relaxed">{role.description || 'No description provided.'}</p>
                    </div>

                    {!role.systemRole && canManageRoles && (
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon-sm" onClick={() => startEditRole(role)} disabled={isSuspended} title={isSuspended ? 'Channel is suspended' : 'Edit Role'} className="text-slate-400 hover:text-[#14142b] hover:bg-white/80">
                          <Edit3 size={16} />
                        </Button>
                        <Button variant="ghost" size="icon-sm" onClick={() => handleDeletePolicy(role.id)} disabled={isSuspended} title={isSuspended ? 'Channel is suspended' : 'Delete Role'} className="text-slate-400 hover:text-red-600 hover:bg-rose-50">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="mt-auto pt-3 border-t border-slate-100/80">
                  <p className="text-[11px] font-extrabold text-slate-400 mb-2 uppercase tracking-wider">Permissions ({role.permissions?.length || 0})</p>
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions?.map((p: any) => (
                      <Badge key={p.id} variant="outline" className="text-blue-700 border-blue-200/80 bg-blue-100/90 text-[10px] font-extrabold shadow-2xs">
                        {formatPermissionKey(p.code)}
                      </Badge>
                    ))}
                    {(!role.permissions || role.permissions.length === 0) && (
                      <span className="text-xs text-slate-400 italic font-medium">No permissions assigned</span>
                    )}
                  </div>
                </CardContent>
              </Card>
              );
            })}
          </div>
        </>
      )}

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
