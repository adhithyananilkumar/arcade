'use client';

import { useState, useEffect } from 'react';
import { ChannelStaffService, ChannelStaff, ChannelInvitation } from '@/services/channel-staff.service';
import { UserService } from '@/services/user.service';
import { Role, roleService } from '@/services/role.service';
import { toast } from 'sonner';
import { Users, Mail, Shield, Check, X, Search, Trash2, Plus, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChannelPolicyManager } from './ChannelPolicyManager';

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
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-indigo-600" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Staff Management</h3>
          <p className="text-sm text-gray-500">Manage who has access to this channel and their permissions.</p>
        </div>
        {canManageStaff && (
          <button
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={16} />
            Invite Staff
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users size={18} className="text-indigo-600" />
            Active Staff
          </h4>
        </div>
        <div className="divide-y divide-gray-100">
          {staff.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">No active staff members.</div>
          ) : (
            staff.map(member => (
              <div key={member.id} className="p-4 sm:px-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                    {member.userName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{member.userName}</p>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                    {member.roleName}
                  </span>
                  {canManageStaff && (
                    <button onClick={() => handleRemoveStaff(member.userId)} className="text-gray-400 hover:text-red-600 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {invitations.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <Mail size={18} className="text-orange-500" />
              Invitations
            </h4>
          </div>
          <div className="divide-y divide-gray-100">
            {(isInvitationsExpanded ? invitations : invitations.slice(0, 3)).map(inv => (
              <div key={inv.id} className="p-4 sm:px-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-900">{inv.email}</p>
                  <p className="text-xs text-gray-500">Invited by {inv.invitedByName} on {new Date(inv.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                  inv.status === 'PENDING' ? 'bg-orange-50 text-orange-700 ring-orange-600/20' :
                  inv.status === 'REJECTED' ? 'bg-red-50 text-red-700 ring-red-600/10' :
                  'bg-gray-50 text-gray-600 ring-gray-500/10'
                }`}>
                  {inv.roleName} - {inv.status}
                </span>
              </div>
            ))}
            {!isInvitationsExpanded && invitations.length > 3 && (
              <div className="p-3 bg-gray-50/50 flex justify-center">
                <button
                  onClick={() => setIsInvitationsExpanded(true)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  See {invitations.length - 3} More
                </button>
              </div>
            )}
            {isInvitationsExpanded && invitations.length > 3 && (
              <div className="p-3 bg-gray-50/50 flex justify-center">
                <button
                  onClick={() => setIsInvitationsExpanded(false)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Show Less
                </button>
              </div>
            )}
          </div>
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
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="user@example.com or username"
                  className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield size={16} className="text-gray-400" />
                </div>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white"
                >
                  <option value="">Select a policy...</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleInvite}
                disabled={emailStatus !== 'FOUND' || !selectedRole}
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                Send Invite
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Role Management Section */}
      <ChannelPolicyManager channelId={channelId} />
    </div>
  );
}
