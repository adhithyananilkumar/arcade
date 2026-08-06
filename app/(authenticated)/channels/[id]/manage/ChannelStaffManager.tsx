'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChannelStaffService, ChannelStaff, ChannelInvitation } from "@/domains/channels";
import { UserService } from "@/domains/identity";
import { Role, roleService } from "@/domains/identity";
import { toast } from 'sonner';
import { Users, Mail, Check, X, Trash2, Plus, Loader2, LogOut, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/design-system/ui/dialog';
import { ChannelPolicyManager } from './ChannelPolicyManager';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/design-system/ui/table';
import { Badge } from '@/shared/design-system/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/design-system/ui/avatar';
import { Skeleton } from '@/shared/design-system/ui/skeleton';
import { Button } from '@/shared/design-system/ui/button';
import { Input } from '@/shared/design-system/ui/input';

interface ChannelStaffManagerProps {
  channelId: string;
  permissions: string[];
  isSuspended?: boolean;
}

export function ChannelStaffManager({ channelId, permissions, isSuspended }: ChannelStaffManagerProps) {
  const router = useRouter();
  const [staff, setStaff] = useState<ChannelStaff[]>([]);
  const [invitations, setInvitations] = useState<ChannelInvitation[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isInvitationsExpanded, setIsInvitationsExpanded] = useState(false);
  const [staffSearch, setStaffSearch] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [emailStatus, setEmailStatus] = useState<'IDLE' | 'LOADING' | 'FOUND' | 'NOT_FOUND'>('IDLE');
  const [foundUser, setFoundUser] = useState<any>(null);

  const [editRolesTarget, setEditRolesTarget] = useState<ChannelStaff | null>(null);
  const [editRoleIds, setEditRoleIds] = useState<string[]>([]);
  const [editRolesSubmitting, setEditRolesSubmitting] = useState(false);

  const canManageStaff =
    permissions.includes('ALL') || permissions.includes('channel.staff.manage');

  useEffect(() => {
    fetchData();
  }, [channelId, canManageStaff]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setAccessDenied(false);

      // Viewing the roster only requires membership; invitations/roles are manager-only. Fetch
      // them independently so a non-manager staff member (who can see the roster but not those)
      // isn't shown a false "failed to load" error for permissions they were never meant to have.
      const staffData = await ChannelStaffService.getStaff(channelId);
      setStaff(staffData);

      if (canManageStaff) {
        const [invitesData, rolesData] = await Promise.all([
          ChannelStaffService.getInvitations(channelId).catch(() => []),
          roleService.getChannelRoles(channelId).catch(() => [])
        ]);
        setInvitations(invitesData);
        setRoles(rolesData);
      } else {
        setInvitations([]);
        setRoles([]);
      }
    } catch (error) {
      // Not a member of this channel (e.g. viewed via a platform-admin link, or after leaving).
      setAccessDenied(true);
    } finally {
      setLoading(false);
    }
  };

  const { user } = useAuthStore();

  const filteredStaff = staffSearch.trim()
    ? staff.filter((member) => {
        const q = staffSearch.trim().toLowerCase();
        return member.userName.toLowerCase().includes(q) || member.email.toLowerCase().includes(q);
      })
    : staff;

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inviteEmail.trim()) {
        verifyIdentifier(inviteEmail.trim());
      } else {
        setEmailStatus('IDLE');
        setFoundUser(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [inviteEmail]);

  // Accepts either an email address or a username — whichever the admin typed.
  const verifyIdentifier = async (identifier: string) => {
    setEmailStatus('LOADING');
    try {
      if (identifier.includes('@')) {
        const user = await UserService.checkEmail(identifier);
        if (user) {
          setFoundUser(user);
          setEmailStatus('FOUND');
          return;
        }
      } else {
        const profile = await UserService.getPublicProfile(identifier).catch(() => null);
        if (profile) {
          setFoundUser(profile);
          setEmailStatus('FOUND');
          return;
        }
      }
      setFoundUser(null);
      setEmailStatus('NOT_FOUND');
    } catch {
      setFoundUser(null);
      setEmailStatus('NOT_FOUND');
    }
  };

  const toggleRole = (roleId: string, selected: string[], setSelected: (ids: string[]) => void) => {
    setSelected(
      selected.includes(roleId) ? selected.filter((id) => id !== roleId) : [...selected, roleId]
    );
  };

  const handleInvite = async () => {
    if (!inviteEmail || selectedRoleIds.length === 0 || emailStatus !== 'FOUND') {
      toast.error('Please enter a valid registered email/username and select at least one policy');
      return;
    }
    try {
      const identifier = inviteEmail.includes('@')
        ? { email: inviteEmail.trim() }
        : { username: inviteEmail.trim() };
      await ChannelStaffService.inviteStaff(channelId, identifier, selectedRoleIds);
      toast.success('Invitation sent successfully!');
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setSelectedRoleIds([]);
      setFoundUser(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    }
  };

  const openEditRoles = (member: ChannelStaff) => {
    setEditRolesTarget(member);
    setEditRoleIds(member.roles.map((r) => r.id));
  };

  const handleUpdateRoles = async () => {
    if (!editRolesTarget || editRoleIds.length === 0) {
      toast.error('Select at least one policy');
      return;
    }
    setEditRolesSubmitting(true);
    try {
      await ChannelStaffService.updateStaffRoles(channelId, editRolesTarget.userId, editRoleIds);
      toast.success('Policies updated');
      setEditRolesTarget(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update policies');
    } finally {
      setEditRolesSubmitting(false);
    }
  };

  const handleRemoveStaff = async (userId: string, isSelf: boolean) => {
    const confirmMessage = isSelf
      ? 'Are you sure you want to leave this channel?'
      : 'Are you sure you want to remove this staff member?';
    if (confirm(confirmMessage)) {
      try {
        await ChannelStaffService.removeStaff(channelId, userId);
        toast.success(isSelf ? 'You left the channel' : 'Staff removed');
        if (isSelf) {
          // No longer a member — this page's data (roster, roles) is no longer visible to us.
          router.push('/');
        } else {
          fetchData();
        }
      } catch {
        toast.error(isSelf ? 'Failed to leave channel' : 'Failed to remove staff');
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-white p-8 text-center">
        <p className="text-sm font-semibold text-gray-700">You're not a member of this channel</p>
        <p className="text-sm text-gray-500 mt-1">Only the owner and staff can view its roster and roles.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Staff Management</h3>
          <p className="text-sm text-gray-500">Manage who has access to this channel and their permissions.</p>
        </div>
        {canManageStaff && (
          <Button onClick={() => setIsInviteModalOpen(true)} disabled={isSuspended} title={isSuspended ? 'Channel is suspended' : undefined}>
            <Plus size={16} />
            Invite Staff
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users size={18} className="text-indigo-600" />
            Active Staff
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">{staff.length}</span>
          </h4>
          {staff.length > 0 && (
            <Input
              type="text"
              value={staffSearch}
              onChange={(e) => setStaffSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full sm:w-64"
            />
          )}
        </div>
        {staff.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">No active staff members.</div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">No staff match "{staffSearch}".</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Policies</TableHead>
                <TableHead className="w-20" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.map(member => {
                const isSelf = member.userId === user?.id;
                return (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar size="sm">
                        <AvatarFallback>{member.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {member.userName} {isSelf && <span className="text-gray-400 font-normal">(You)</span>}
                        </p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1.5">
                      {member.roles.map((role) => (
                        <Badge key={role.id} variant="outline" className="text-purple-700 border-purple-100 bg-purple-50">
                          {role.displayName}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {canManageStaff && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEditRoles(member)}
                          className="text-gray-400 hover:text-indigo-600"
                          title="Edit policies"
                        >
                          <Pencil size={16} />
                        </Button>
                      )}
                      {(canManageStaff || isSelf) && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRemoveStaff(member.userId, isSelf)}
                          className="text-gray-400 hover:text-red-600"
                          title={isSelf ? 'Leave channel' : 'Remove staff member'}
                        >
                          {isSelf ? <LogOut size={16} /> : <Trash2 size={16} />}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {invitations.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Mail size={18} className="text-orange-500" />
              Invitations
            </h4>
          </div>
          <Table>
            <TableBody>
              {(isInvitationsExpanded ? invitations : invitations.slice(0, 3)).map(inv => (
                <TableRow key={inv.id}>
                  <TableCell>
                    <p className="text-sm font-bold text-gray-900">{inv.email}</p>
                    <p className="text-xs text-gray-500">Invited by {inv.invitedByName} on {new Date(inv.createdAt).toLocaleDateString()}</p>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className={
                        inv.status === 'PENDING' ? 'text-orange-700 border-orange-200 bg-orange-50' :
                        inv.status === 'REJECTED' ? 'text-red-700 border-red-100 bg-red-50' :
                        'text-gray-600 border-gray-200 bg-gray-50'
                      }
                    >
                      {inv.roleNames.join(', ')} - {inv.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!isInvitationsExpanded && invitations.length > 3 && (
            <div className="p-3 bg-gray-50/50 flex justify-center">
              <Button variant="ghost" size="sm" onClick={() => setIsInvitationsExpanded(true)}>
                See {invitations.length - 3} More
              </Button>
            </div>
          )}
          {isInvitationsExpanded && invitations.length > 3 && (
            <div className="p-3 bg-gray-50/50 flex justify-center">
              <Button variant="ghost" size="sm" onClick={() => setIsInvitationsExpanded(false)}>
                Show Less
              </Button>
            </div>
          )}
        </div>
      )}

      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Invite Staff</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address / Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Mail size={16} className="text-gray-400" />
                </div>
                <Input
                  type="text"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="user@example.com or username"
                  className="pl-10 pr-10"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  {emailStatus === 'LOADING' && <Loader2 size={16} className="animate-spin text-gray-400" />}
                  {emailStatus === 'FOUND' && <Check size={16} className="text-green-500" />}
                  {emailStatus === 'NOT_FOUND' && inviteEmail && <X size={16} className="text-red-500" />}
                </div>
              </div>

              {emailStatus === 'FOUND' && foundUser && (
                <p className="mt-2 text-xs text-green-600 flex items-center gap-1">
                  <Check size={12} /> Found user: {foundUser.firstName} {foundUser.lastName}
                </p>
              )}
              {emailStatus === 'NOT_FOUND' && inviteEmail && (
                <p className="mt-2 text-xs text-red-600 flex items-center gap-1">
                  <X size={12} /> User not found. Must be a registered user.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Policies <span className="text-gray-400 font-normal">(select one or more)</span>
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto rounded-lg border border-gray-200 p-2">
                {roles.map(role => (
                  <label key={role.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedRoleIds.includes(role.id)}
                      onChange={() => toggleRole(role.id, selectedRoleIds, setSelectedRoleIds)}
                      className="h-4 w-4 accent-indigo-600"
                    />
                    <span className="text-sm text-gray-800">{role.displayName || role.code}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setIsInviteModalOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleInvite}
                disabled={emailStatus !== 'FOUND' || selectedRoleIds.length === 0}
              >
                Send Invite
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editRolesTarget} onOpenChange={(open) => !open && setEditRolesTarget(null)}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle>Edit Policies</DialogTitle>
          </DialogHeader>

          {editRolesTarget && (
            <div className="space-y-4 mt-4">
              <p className="text-sm text-gray-600">
                Update policies for <span className="font-bold">{editRolesTarget.userName}</span>.
              </p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto rounded-lg border border-gray-200 p-2">
                {roles.map(role => (
                  <label key={role.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editRoleIds.includes(role.id)}
                      onChange={() => toggleRole(role.id, editRoleIds, setEditRoleIds)}
                      className="h-4 w-4 accent-indigo-600"
                    />
                    <span className="text-sm text-gray-800">{role.displayName || role.code}</span>
                  </label>
                ))}
              </div>
              <div className="pt-2 flex gap-3">
                <Button variant="secondary" className="flex-1" onClick={() => setEditRolesTarget(null)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleUpdateRoles}
                  disabled={editRolesSubmitting || editRoleIds.length === 0}
                >
                  {editRolesSubmitting ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Role Management Section */}
      <ChannelPolicyManager channelId={channelId} permissions={permissions} isSuspended={isSuspended} />
    </div>
  );
}
