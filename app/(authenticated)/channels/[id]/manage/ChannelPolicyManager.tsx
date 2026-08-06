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
  const canManageStaff = userPermissions.includes('ALL') || userPermissions.includes('channel.staff.manage');

  useEffect(() => {
    fetchData();
  }, [channelId, canManageStaff]);

  const fetchData = async () => {
    if (!canManageStaff) {
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
          <Button onClick={() => setIsModalOpen(true)} disabled={isSuspended} title={isSuspended ? 'Channel is suspended' : undefined}>
            <Plus size={16} /> Create Role
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {roles.map(role => (
          <Card key={role.id} className="flex flex-col h-full">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-gray-900 flex items-center gap-2">
                    <ShieldCheck size={18} className="text-indigo-600" />
                    {role.displayName}
                    {role.systemRole ? (
                      <Badge variant="secondary">System</Badge>
                    ) : (
                      <Badge variant="outline" className="text-orange-700 border-orange-200 bg-orange-50">Custom</Badge>
                    )}
                  </h4>
                  <p className="text-sm text-gray-500 mt-1">{role.description || 'No description provided.'}</p>
                </div>

                {!role.systemRole && canManageStaff && (
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon-sm" onClick={() => startEditRole(role)} disabled={isSuspended} title={isSuspended ? 'Channel is suspended' : 'Edit Role'}>
                      <Edit3 size={16} />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => handleDeletePolicy(role.id)} disabled={isSuspended} title={isSuspended ? 'Channel is suspended' : 'Delete Role'}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="mt-auto pt-4 border-t border-gray-50">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Permissions ({role.permissions?.length || 0})</p>
              <div className="flex flex-wrap gap-1.5">
                {role.permissions?.map((p: any) => (
                  <Badge key={p.id} variant="outline" className="text-indigo-700 border-indigo-100 bg-indigo-50">
                    {formatPermissionKey(p.code)}
                  </Badge>
                ))}
                {(!role.permissions || role.permissions.length === 0) && (
                  <span className="text-xs text-gray-400 italic">No permissions assigned</span>
                )}
              </div>
            </CardContent>
          </Card>
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
