'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  hideHeader?: boolean;
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

export function ChannelPolicyManager({ channelId, permissions: userPermissions, isSuspended, hideHeader = false }: ChannelPolicyManagerProps) {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
      <div className={`space-y-3 ${hideHeader ? 'pt-2' : 'mt-8 pt-8 border-t border-gray-200'}`}>
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${hideHeader ? 'pt-0' : 'mt-8 pt-8 border-t border-slate-200/60'}`}>
      {!canManageRoles && (
        <Card className="border-2 border-blue-400/90 bg-blue-50/30 shadow-2xs mb-8 rounded-none">
          <CardHeader>
            <h3 className="text-sm font-extrabold text-[#14142b] flex items-center gap-2">
              <ShieldCheck className="text-blue-600" size={18} />
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
          {!hideHeader ? (
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-extrabold text-[#14142b] flex items-center gap-2.5">
                  <span className="grid size-9 place-items-center rounded-2xl bg-blue-100/90 text-blue-700 border border-blue-200/60 shadow-2xs">
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
                  className="rounded-full bg-[#14142b] text-white hover:bg-[#232735] px-5 py-2 text-xs font-extrabold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Plus size={16} /> Create Role
                </Button>
              )}
            </div>
          ) : (
            canManageRoles && (
              <div className="flex justify-end mb-4">
                <Button
                  onClick={() => setIsModalOpen(true)}
                  disabled={isSuspended}
                  title={isSuspended ? 'Channel is suspended' : undefined}
                  className="rounded-full bg-[#14142b] text-white hover:bg-[#232735] px-5 py-2 text-xs font-extrabold shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Plus size={16} /> Create Role
                </Button>
              </div>
            )
          )}

          <div className="grid gap-4.5 md:grid-cols-2">
            {roles.map((role) => (
              <div
                key={role.id}
                className="group relative flex flex-col justify-between rounded-none border-2 border-sky-400/90 bg-white p-5 sm:p-6 shadow-[0_4px_25px_rgba(20,20,43,0.06)] hover:shadow-lg hover:border-blue-600 transition-all duration-200"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-8 place-items-center rounded-xl bg-sky-50/90 text-sky-600 border border-sky-200/80 shadow-2xs">
                        <ShieldCheck size={16} />
                      </span>
                      <h4 className="font-extrabold text-[#14142b] text-base leading-tight">
                        {role.displayName}
                      </h4>
                    </div>

                    {!role.systemRole && canManageRoles && (
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => startEditRole(role)}
                          disabled={isSuspended}
                          title={isSuspended ? 'Channel is suspended' : 'Edit Role'}
                          className="h-8 w-8 rounded-xl text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                        >
                          <Edit3 size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDeletePolicy(role.id)}
                          disabled={isSuspended}
                          title={isSuspended ? 'Channel is suspended' : 'Delete Role'}
                          className="h-8 w-8 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    )}
                  </div>

                  <p className="text-xs font-medium text-slate-500 mt-3 leading-relaxed">
                    {role.description || 'No description provided.'}
                  </p>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                    Permissions ({role.permissions?.length || 0})
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions?.map((p: any) => (
                      <Badge
                        key={p.id}
                        variant="outline"
                        className="inline-flex items-center gap-1 text-[11px] font-extrabold text-sky-700 border-sky-200/90 bg-sky-50/90 px-3 py-1 rounded-full shadow-2xs"
                      >
                        <ShieldCheck size={12} className="text-sky-500 shrink-0" />
                        <span>{formatPermissionKey(p.code)}</span>
                      </Badge>
                    ))}
                    {(!role.permissions || role.permissions.length === 0) && (
                      <span className="text-xs text-slate-400 italic font-medium">No permissions assigned</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {isModalOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200/80 bg-white my-auto">
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
        </div>,
        document.body
      )}
    </div>
  );
}
