'use client';

import { useState, useEffect } from 'react';
import { ChannelStaffService, ChannelStaff, ChannelInvitation } from "@/domains/channels";
import { UserService } from "@/domains/identity";
import { Role, roleService } from "@/domains/identity";
import { toast } from 'sonner';
import { Users, Mail, Check, X, Trash2, Plus, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/design-system/ui/dialog';
import { ChannelPolicyManager } from './ChannelPolicyManager';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/design-system/ui/table';
import { Badge } from '@/shared/design-system/ui/badge';
import { Avatar, AvatarFallback } from '@/shared/design-system/ui/avatar';
import { Skeleton } from '@/shared/design-system/ui/skeleton';
import { Button } from '@/shared/design-system/ui/button';
import { Input } from '@/shared/design-system/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/shared/design-system/ui/select';

interface ChannelStaffManagerProps {
  channelId: string;
  permissions: string[];
}

export function ChannelStaffManager({ channelId, permissions }: ChannelStaffManagerProps) {
  const [staff, setStaff] = useState<ChannelStaff[]>([]);
  const [invitations, setInvitations] = useState<ChannelInvitation[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isInvitationsExpanded, setIsInvitationsExpanded] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [emailStatus, setEmailStatus] = useState<'IDLE' | 'LOADING' | 'FOUND' | 'NOT_FOUND'>('IDLE');
  const [foundUser, setFoundUser] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [channelId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [staffData, invitesData, rolesData] = await Promise.all([
        ChannelStaffService.getStaff(channelId),
        ChannelStaffService.getInvitations(channelId),
        roleService.getChannelRoles(channelId)
      ]);
      setStaff(staffData);
      setInvitations(invitesData);
      setRoles(rolesData);
    } catch (error) {
      toast.error('Failed to load staff information');
    } finally {
      setLoading(false);
    }
  };

  const { user } = useAuthStore();
  // We can't access channel.ownerId directly here since channel is fetched in page, 
  // but we can rely on permissions array containing 'ALL' if they are owner.
  const canManageStaff = permissions.includes('ALL') || permissions.includes('channel.staff.manage');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (inviteEmail && inviteEmail.includes('@')) {
        verifyEmail(inviteEmail);
      } else {
        setEmailStatus('IDLE');
        setFoundUser(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [inviteEmail]);

  const verifyEmail = async (email: string) => {
    setEmailStatus('LOADING');
    try {
      const user = await UserService.checkEmail(email);
      if (user) {
        setFoundUser(user);
        setEmailStatus('FOUND');
      } else {
        setFoundUser(null);
        setEmailStatus('NOT_FOUND');
      }
    } catch {
      setFoundUser(null);
      setEmailStatus('NOT_FOUND');
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail || !selectedRole || emailStatus !== 'FOUND') {
      toast.error('Please enter a valid registered email and select a policy');
      return;
    }
    try {
      await ChannelStaffService.inviteStaff(channelId, inviteEmail, selectedRole);
      toast.success('Invitation sent successfully!');
      setIsInviteModalOpen(false);
      setInviteEmail('');
      setSelectedRole('');
      setFoundUser(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    }
  };

  const handleRemoveStaff = async (userId: string) => {
    if (confirm('Are you sure you want to remove this staff member?')) {
      try {
        await ChannelStaffService.removeStaff(channelId, userId);
        toast.success('Staff removed');
        fetchData();
      } catch {
        toast.error('Failed to remove staff');
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Staff Management</h3>
          <p className="text-sm text-gray-500">Manage who has access to this channel and their permissions.</p>
        </div>
        {canManageStaff && (
          <Button onClick={() => setIsInviteModalOpen(true)}>
            <Plus size={16} />
            Invite Staff
          </Button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users size={18} className="text-indigo-600" />
            Active Staff
          </h4>
        </div>
        {staff.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">No active staff members.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                {canManageStaff && <TableHead className="w-10" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {staff.map(member => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar size="sm">
                        <AvatarFallback>{member.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{member.userName}</p>
                        <p className="text-xs text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-purple-700 border-purple-100 bg-purple-50">
                      {member.roleName}
                    </Badge>
                  </TableCell>
                  {canManageStaff && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleRemoveStaff(member.userId)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
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
                      {inv.roleName} - {inv.status}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization Policy</label>
              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value ?? '')}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a policy..." />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.id} value={role.id}>{role.displayName || role.code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setIsInviteModalOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleInvite}
                disabled={emailStatus !== 'FOUND' || !selectedRole}
              >
                Send Invite
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Management Section */}
      <ChannelPolicyManager channelId={channelId} permissions={permissions} />
    </div>
  );
}
