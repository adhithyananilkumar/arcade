'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Users, Mail, Plus, Trash2, Loader2, Shield } from 'lucide-react';
import {
  getCollaborators,
  inviteCollaborator,
  updateCollaboratorRole,
  removeCollaborator,
  Collaborator,
} from '@/domains/events/api/collaboration';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/design-system/ui/table';
import { Badge } from '@/shared/design-system/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/design-system/ui/avatar';
import { Button } from '@/shared/design-system/ui/button';
import { Input } from '@/shared/design-system/ui/input';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { WorkspaceRow, WorkspaceRows } from '@/apps/creator/studio/core/StudioWorkspaceKit';

interface Props {
  /** "rows" on the Content Overview (numbered rows); "studio" for modern seamless embedding; "card" for wizard. */
  layout?: 'card' | 'rows' | 'studio';
  eventId: string;
  startStep?: number;
}

export function EventCollaboratorsManager({ eventId, layout = 'card', startStep = 1 }: Props) {
  const { user } = useAuthStore();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'OWNER' | 'MANAGER' | 'EDITOR'>('EDITOR');
  const [inviting, setInviting] = useState(false);

  const currentUserCollab = collaborators.find(c => c.userId === user?.id);
  // Not on the roster = the channel's own staff (the backend decides whether that is enough).
  // An EDITOR collaborator is the only viewer who certainly cannot manage the team.
  const canManage = !currentUserCollab || currentUserCollab.role === 'OWNER' || currentUserCollab.role === 'MANAGER';

  useEffect(() => {
    loadCollaborators();
  }, [eventId]);

  const loadCollaborators = async () => {
    try {
      setLoading(true);
      const data = await getCollaborators(eventId);
      setCollaborators(data);
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load collaborators.');
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setInviting(true);
    try {
      await inviteCollaborator(eventId, inviteEmail.trim(), inviteRole);
      toast.success('Collaborator added successfully!');
      setInviteEmail('');
      loadCollaborators();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to add collaborator.');
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'OWNER' | 'MANAGER' | 'EDITOR') => {
    try {
      await updateCollaboratorRole(eventId, userId, newRole);
      toast.success('Collaborator role updated!');
      loadCollaborators();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to update collaborator role.');
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this collaborator?')) return;

    try {
      await removeCollaborator(eventId, userId);
      toast.success('Collaborator removed successfully!');
      loadCollaborators();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to remove collaborator.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
      </div>
    );
  }

  const inviteForm = (
    <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <input
          type="email"
          placeholder="Enter collaborator email address…"
          className="w-full rounded-2xl border border-slate-200 bg-surface px-4 py-3 text-sm font-medium text-slate-800 shadow-2xs outline-none focus:border-slate-400 dark:border-slate-700"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          required
        />
      </div>
      <div className="w-full sm:w-52">
        <select
          aria-label="Role"
          className="w-full rounded-2xl border border-slate-200 bg-surface px-4 py-3 text-sm font-bold text-slate-800 shadow-2xs outline-none focus:border-slate-400 dark:border-slate-700"
          value={inviteRole}
          onChange={(e) => setInviteRole(e.target.value as any)}
        >
          <option value="OWNER">Owner (Full Admin)</option>
          <option value="MANAGER">Manager (Team Access)</option>
          <option value="EDITOR">Editor (Edit Content)</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={inviting}
        className="inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-40 whitespace-nowrap dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
      >
        {inviting ? (
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Adding…</span>
          </div>
        ) : (
          <span>Add Collaborator</span>
        )}
      </button>
    </form>
  );

  const roster = collaborators.length === 0 ? (
    <div className="rounded-2xl bg-slate-50/70 p-8 text-center space-y-1 text-slate-500 dark:bg-slate-900/30">
      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">No additional collaborators added</p>
      <p className="text-xs text-slate-400">Invite team members above to grant management access to this event.</p>
    </div>
  ) : (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="text-xs font-bold uppercase tracking-wider text-slate-400">
            <th className="pb-3 pl-2">User</th>
            <th className="pb-3">Role</th>
            <th className="pb-3">Status</th>
            <th className="pb-3 pr-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="space-y-1">
          {collaborators.map((c) => (
            <tr key={c.id ?? c.userId ?? c.email} className="group transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-900/40">
              <td className="py-3 pl-2">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-xs font-black text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                    {c.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5 leading-tight">
                      {c.name}
                      {c.role === 'OWNER' && <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded-md">Lead</span>}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{c.email}</div>
                  </div>
                </div>
              </td>
              <td className="py-3">
                {c.id === null || !canManage ? (
                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {c.role}
                  </span>
                ) : (
                  <select
                    className="h-8 px-2 rounded-xl border border-slate-200 bg-surface text-xs font-bold text-slate-800 focus:outline-none dark:border-slate-700"
                    value={c.role}
                    onChange={(e) => handleRoleChange(c.id || c.userId, e.target.value as any)}
                    disabled={c.userId === user?.id || !canManage}
                  >
                    <option value="OWNER">Owner</option>
                    <option value="MANAGER">Manager</option>
                    <option value="EDITOR">Editor</option>
                  </select>
                )}
              </td>
              <td className="py-3">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                  c.status === 'ACCEPTED'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
                }`}>
                  {c.status === 'ACCEPTED' ? 'Active' : 'Pending'}
                </span>
              </td>
              <td className="py-3 pr-2 text-right">
                {c.id !== null && c.userId !== user?.id && canManage && (
                  <button
                    type="button"
                    onClick={() => handleRemove(c.id || c.userId)}
                    className="cursor-pointer text-xs font-bold text-red-500 hover:text-red-700 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors dark:hover:bg-red-950/20"
                  >
                    Remove
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  if (layout === 'studio') {
    return (
      <div className="space-y-6">
        {canManage && inviteForm}
        {roster}
      </div>
    );
  }

  if (layout === 'rows') {
    return (
      <WorkspaceRows>
        {canManage && (
          <WorkspaceRow step={startStep} title="Add a collaborator" description="Give another person edit or view access to this event under a role.">
            {inviteForm}
          </WorkspaceRow>
        )}
        <WorkspaceRow step={canManage ? startStep + 1 : startStep} title="Team" description="Everyone with access to this event, their role and whether they have accepted." wide>
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-surface">{roster}</div>
        </WorkspaceRow>
      </WorkspaceRows>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4">
      {/* Invite collaborator box - Only visible to OWNER or MANAGER */}
      {canManage && (
        <div className="bg-surface border border-zinc-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Add Event Collaborators
          </h2>
          <p className="text-zinc-500 text-sm mb-6">
            Grant other users edit or view access to this workshop and webinar contents under role-based policies.
          </p>

          {inviteForm}
        </div>
      )}

      {/* Collaborator roster */}
      <div className="bg-surface border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-200">
          <h3 className="font-bold text-zinc-900">Collaborator Roster</h3>
        </div>
        
        {roster}
      </div>
    </div>
  );
}
