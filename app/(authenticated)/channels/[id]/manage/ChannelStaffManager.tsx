'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  isPersonalChannel?: boolean;
}

export function ChannelStaffManager({ channelId, permissions, isSuspended, isPersonalChannel }: ChannelStaffManagerProps) {
  const router = useRouter();
  const [staff, setStaff] = useState<ChannelStaff[]>([]);
  const [invitations, setInvitations] = useState<ChannelInvitation[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isInvitationsExpanded, setIsInvitationsExpanded] = useState(false);
  const [isStaffExpanded, setIsStaffExpanded] = useState(false);
  const [staffSearch, setStaffSearch] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [emailStatus, setEmailStatus] = useState<'IDLE' | 'LOADING' | 'FOUND' | 'NOT_FOUND'>('IDLE');
  const [foundUser, setFoundUser] = useState<any>(null);

  const [editRolesTarget, setEditRolesTarget] = useState<ChannelStaff | null>(null);
  const [editRoleIds, setEditRoleIds] = useState<string[]>([]);
  const [editRolesSubmitting, setEditRolesSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [channelId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setAccessDenied(false);

      // Viewing the roster only requires membership; invitations/roles are manager-only. Fetch
      // them independently so a non-manager staff member (who can see the roster but not those)
      // isn't shown a false "failed to load" error for permissions they were never meant to have.
      const staffData = await ChannelStaffService.getStaff(channelId);
      setStaff(staffData);

      const [invitesData, rolesData] = await Promise.all([
        ChannelStaffService.getInvitations(channelId).catch(() => []),
        roleService.getChannelRoles(channelId).catch(() => [])
      ]);
      setInvitations(invitesData);
      setRoles(rolesData);
    } catch (error) {
      // Not a member of this channel (e.g. viewed via a platform-admin link, or after leaving).
      setAccessDenied(true);
    } finally {
      setLoading(false);
    }
  };

  const { user } = useAuthStore();
  // We can't access channel.ownerId directly here since channel is fetched in page,
  // but we can rely on permissions array containing 'ALL' if they are owner. Deliberately no
  // platform-admin bypass — a channel's staff/roles are its own internal governance, isolated
  // from the platform layer. A platform admin's tool for a problem channel is suspending it
  // wholesale, not reaching in to manage its roster.
  const canManageStaff =
    permissions.includes('ALL') || permissions.includes('channel.staff.manage');

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
          <h3 className="text-xl font-bold text-[#14142b]">Staff Management</h3>
          <p className="text-sm font-medium text-slate-500">Manage who has access to this channel and their permissions.</p>
        </div>
        {canManageStaff && (
          <Button
            onClick={() => setIsInviteModalOpen(true)}
            disabled={isSuspended}
            title={isSuspended ? 'Channel is suspended' : undefined}
            className="rounded-full bg-[#14142b] text-white hover:bg-[#232735] px-4 py-2 text-xs font-bold shadow-xs"
          >
            <Plus size={16} />
            Invite Staff
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-sm space-y-0">
        <div className="flex flex-col gap-3 border-b border-slate-100/80 bg-gradient-to-r from-slate-50/90 via-indigo-50/40 to-purple-50/60 px-6 py-4 sm:flex-row sm:items-center justify-between">
          <h4 className="flex items-center gap-2.5 text-sm font-extrabold text-[#14142b]">
            <span className="grid size-9 place-items-center rounded-2xl bg-indigo-100/90 text-indigo-700 border border-indigo-200/60 shadow-2xs">
              <Users size={18} />
            </span>
            <span>Staff Roster</span>
            {staff.length > 0 && (
              <span className="rounded-full bg-indigo-100/80 px-2.5 py-0.5 text-xs font-black text-indigo-800 border border-indigo-200/60">
                {staff.length} Members
              </span>
            )}
          </h4>
          {staff.length > 0 && (
            <Input
              type="text"
              value={staffSearch}
              onChange={(e) => setStaffSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full sm:w-64 border-slate-200 bg-white/90 focus:border-[#14142b] focus:ring-2 focus:ring-[#14142b]/10 text-xs rounded-xl"
            />
          )}
        </div>
        {staff.length === 0 ? (
          <div className="relative overflow-hidden flex flex-col items-center justify-center p-12 text-center bg-gradient-to-b from-white via-slate-50/40 to-white">
            {/* Hand-Drawn Doodle Background Accents */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.14] select-none overflow-hidden">
              <svg className="absolute left-10 top-1/2 -translate-y-1/2 size-20 text-slate-800" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="30" cy="20" r="10" strokeDasharray="3 2" />
                <path d="M15 48 C 15 35, 45 35, 45 48" />
              </svg>
              <svg className="absolute right-12 top-1/2 -translate-y-1/2 size-22 text-slate-800" viewBox="0 0 70 70" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <rect x="15" y="15" width="40" height="40" rx="8" strokeDasharray="4 2" />
                <path d="M25 35 L45 35 M35 25 L35 45" />
              </svg>
            </div>

            <div className="relative z-10">
              <div className="mb-3.5 mx-auto grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/80 shadow-2xs">
                <Users size={22} />
              </div>
              <p className="text-sm font-extrabold text-[#14142b]">No staff members invited yet</p>
              <p className="mt-1 text-xs font-medium text-slate-500 max-w-sm mx-auto">
                Invite team members or creators to help manage this channel and publish content.
              </p>
            </div>
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="p-8 text-center text-sm font-medium text-slate-400">
            No staff match &quot;{staffSearch}&quot;.
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100">
              {/* Header Row */}
              <div className="hidden sm:grid sm:grid-cols-12 items-center gap-4 px-6 py-3 bg-slate-50/70 text-[11px] font-black uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <div className="col-span-5">Member</div>
                <div className="col-span-5">Policies & Roles</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>

              {(isStaffExpanded ? filteredStaff : filteredStaff.slice(0, 5)).map((member) => {
                const isSelf = member.userId === user?.id;
                return (
                  <div
                    key={member.id}
                    className="grid grid-cols-1 sm:grid-cols-12 items-center gap-4 px-6 py-4 hover:bg-purple-50/20 transition-colors"
                  >
                    {/* Member Info (Col 5) */}
                    <div className="col-span-1 sm:col-span-5 flex items-center gap-3.5 min-w-0">
                      <Avatar className="h-10 w-10 shrink-0 bg-gradient-to-tr from-[#14142b] to-purple-900 text-white shadow-2xs">
                        <AvatarFallback className="font-extrabold text-xs">
                          {member.userName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-[#14142b] truncate flex items-center gap-1.5">
                          <span>{member.userName}</span>
                          {isSelf && (
                            <span className="rounded-md bg-purple-100 px-1.5 py-0.2 text-[10px] font-black text-purple-700">
                              You
                            </span>
                          )}
                        </p>
                        <p className="text-[11px] font-semibold text-slate-400 truncate mt-0.5">
                          {member.username ? (
                            <Link href={`/${member.username}`} className="font-bold text-indigo-600 hover:underline">
                              @{member.username}
                            </Link>
                          ) : (
                            member.email
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Roles / Policies (Col 5) */}
                    <div className="col-span-1 sm:col-span-5 flex flex-wrap items-center gap-1.5">
                      {member.roles.map((role) => (
                        <Badge
                          key={role.id}
                          variant="outline"
                          className="text-purple-700 border-purple-200/70 bg-purple-50/90 text-[11px] font-black px-3 py-1 rounded-full shadow-2xs"
                        >
                          {role.displayName}
                        </Badge>
                      ))}
                    </div>

                    {/* Actions (Col 2) */}
                    <div className="col-span-1 sm:col-span-2 flex items-center justify-end gap-1.5 shrink-0">
                      {canManageStaff && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEditRoles(member)}
                          className="h-8 w-8 rounded-xl text-slate-400 hover:text-[#14142b] hover:bg-slate-100"
                          title="Edit policies"
                        >
                          <Pencil size={15} />
                        </Button>
                      )}
                      {(canManageStaff || isSelf) && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleRemoveStaff(member.userId, isSelf)}
                          className="h-8 w-8 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50"
                          title={isSelf ? 'Leave channel' : 'Remove staff member'}
                        >
                          {isSelf ? <LogOut size={15} /> : <Trash2 size={15} />}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {!isStaffExpanded && filteredStaff.length > 5 && (
              <div className="p-3 bg-slate-50/60 flex justify-center border-t border-slate-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsStaffExpanded(true)}
                  className="text-xs font-bold text-[#14142b]"
                >
                  See {filteredStaff.length - 5} More Members
                </Button>
              </div>
            )}
            {isStaffExpanded && filteredStaff.length > 5 && (
              <div className="p-3 bg-slate-50/60 flex justify-center border-t border-slate-100">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsStaffExpanded(false)}
                  className="text-xs font-bold text-[#14142b]"
                >
                  Show Less
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {isPersonalChannel && invitations.length > 0 && (
        <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 shadow-sm space-y-0">
          <div className="flex items-center justify-between border-b border-slate-100 bg-amber-50/50 px-6 py-4">
            <h4 className="flex items-center gap-2.5 text-sm font-extrabold text-[#14142b]">
              <span className="grid size-8 place-items-center rounded-xl bg-amber-100/90 text-amber-700 border border-amber-200/60 shadow-2xs">
                <Mail size={16} />
              </span>
              <span>Pending Invitations</span>
            </h4>
            <span className="rounded-full bg-amber-100/80 px-2.5 py-0.5 text-xs font-black text-amber-800 border border-amber-200/60">
              {invitations.length} Pending
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {(isInvitationsExpanded ? invitations : invitations.slice(0, 3)).map((inv) => (
              <div
                key={inv.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 hover:bg-amber-50/20 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-800 font-extrabold text-xs border border-amber-200/60">
                    {inv.email[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-black text-[#14142b] truncate">{inv.email}</p>
                    <p className="text-[11px] font-semibold text-slate-400 truncate mt-0.5">
                      Invited by <span className="text-slate-700 font-bold">{inv.invitedByName}</span> on{' '}
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <Badge
                    variant="outline"
                    className={
                      inv.status === 'PENDING'
                        ? 'text-amber-700 border-amber-200/70 bg-amber-50/90 text-[11px] font-black px-3 py-1 rounded-full'
                        : inv.status === 'REJECTED'
                        ? 'text-rose-700 border-rose-200/70 bg-rose-50/90 text-[11px] font-black px-3 py-1 rounded-full'
                        : 'text-slate-600 border-slate-200 bg-slate-50 text-[11px] font-black px-3 py-1 rounded-full'
                    }
                  >
                    {inv.roleNames.join(', ')} • {inv.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {!isInvitationsExpanded && invitations.length > 3 && (
            <div className="p-3 bg-slate-50/60 flex justify-center border-t border-slate-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsInvitationsExpanded(true)}
                className="text-xs font-bold text-[#14142b]"
              >
                See {invitations.length - 3} More
              </Button>
            </div>
          )}
          {isInvitationsExpanded && invitations.length > 3 && (
            <div className="p-3 bg-slate-50/60 flex justify-center border-t border-slate-100">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsInvitationsExpanded(false)}
                className="text-xs font-bold text-[#14142b]"
              >
                Show Less
              </Button>
            </div>
          )}
        </div>
      )}

      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="max-w-md p-6 rounded-3xl border border-slate-200 bg-white shadow-2xl z-[100]">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-[#14142b]">Invite Staff Member</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Address / Username</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none z-10">
                  <Mail size={16} className="text-slate-400" />
                </div>
                <Input
                  type="text"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="user@example.com or username"
                  className="pl-10 pr-10 rounded-2xl border-slate-200 bg-slate-50/80 text-xs font-medium focus:border-indigo-500 focus:bg-white"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                  {emailStatus === 'LOADING' && <Loader2 size={16} className="animate-spin text-slate-400" />}
                  {emailStatus === 'FOUND' && <Check size={16} className="text-emerald-500" />}
                  {emailStatus === 'NOT_FOUND' && inviteEmail && <X size={16} className="text-rose-500" />}
                </div>
              </div>

              {emailStatus === 'FOUND' && foundUser && (
                <p className="mt-2 text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Check size={12} /> Found user: {foundUser.firstName} {foundUser.lastName}
                </p>
              )}
              {emailStatus === 'NOT_FOUND' && inviteEmail && (
                <p className="mt-2 text-xs font-bold text-rose-600 flex items-center gap-1">
                  <X size={12} /> User not found. Must be a registered user.
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Organization Policies <span className="text-slate-400 font-medium">(select one or more)</span>
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto rounded-2xl border border-slate-200 p-2 bg-slate-50/50">
                {roles.map(role => (
                  <label key={role.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-indigo-50/70 transition-colors cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={selectedRoleIds.includes(role.id)}
                      onChange={() => toggleRole(role.id, selectedRoleIds, setSelectedRoleIds)}
                      className="h-4 w-4 rounded-md accent-indigo-600 cursor-pointer"
                    />
                    <span>{role.displayName || role.code}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button variant="secondary" className="flex-1 rounded-2xl font-bold text-xs" onClick={() => setIsInviteModalOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md"
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
        <DialogContent className="max-w-md p-6 rounded-3xl border border-slate-200 bg-white shadow-2xl z-[100]">
          <DialogHeader>
            <DialogTitle className="text-base font-extrabold text-[#14142b]">Edit Policies</DialogTitle>
          </DialogHeader>

          {editRolesTarget && (
            <div className="space-y-4 mt-4">
              <p className="text-xs font-semibold text-slate-600">
                Update policies for <span className="font-extrabold text-slate-900">{editRolesTarget.userName}</span>.
              </p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto rounded-2xl border border-slate-200 p-2 bg-slate-50/50">
                {roles.map(role => (
                  <label key={role.id} className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-indigo-50/70 transition-colors cursor-pointer text-xs font-semibold text-slate-800">
                    <input
                      type="checkbox"
                      checked={editRoleIds.includes(role.id)}
                      onChange={() => toggleRole(role.id, editRoleIds, setEditRoleIds)}
                      className="h-4 w-4 rounded-md accent-indigo-600 cursor-pointer"
                    />
                    <span>{role.displayName || role.code}</span>
                  </label>
                ))}
              </div>
              <div className="pt-2 flex gap-3">
                <Button variant="secondary" className="flex-1 rounded-2xl font-bold text-xs" onClick={() => setEditRolesTarget(null)}>
                  Cancel
                </Button>
                <Button
                  className="flex-1 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs shadow-md"
                  onClick={handleUpdateRoles}
                  disabled={editRolesSubmitting || editRoleIds.length === 0}
                >
                  {editRolesSubmitting ? 'Saving...' : 'Save Changes'}
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
