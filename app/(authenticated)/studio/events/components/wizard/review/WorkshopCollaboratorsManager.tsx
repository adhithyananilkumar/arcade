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
} from '@/app/(authenticated)/studio/events/api/collaboration';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/shared/design-system/ui/table';
import { Badge } from '@/shared/design-system/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/design-system/ui/avatar';
import { Button } from '@/shared/design-system/ui/button';
import { Input } from '@/shared/design-system/ui/input';
import { useAuthStore } from '@/infrastructure/auth/auth.store';

interface Props {
  workshopId: string;
}

export function WorkshopCollaboratorsManager({ workshopId }: Props) {
  const { user } = useAuthStore();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'OWNER' | 'MANAGER' | 'EDITOR' | 'VIEWER'>('EDITOR');
  const [inviting, setInviting] = useState(false);

  const isOwner = collaborators.find(c => c.userId === user?.id)?.role === 'OWNER';

  useEffect(() => {
    loadCollaborators();
  }, [workshopId]);

  useEffect(() => {
    if (collaborators.length > 0 && !isOwner) {
      setInviteRole('VIEWER');
    }
  }, [collaborators, isOwner]);

  const loadCollaborators = async () => {
    try {
      setLoading(true);
      const data = await getCollaborators(workshopId);
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
      await inviteCollaborator(workshopId, inviteEmail.trim(), inviteRole);
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

  const handleRoleChange = async (userId: string, newRole: 'OWNER' | 'MANAGER' | 'EDITOR' | 'VIEWER') => {
    try {
      await updateCollaboratorRole(workshopId, userId, newRole);
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
      await removeCollaborator(workshopId, userId);
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
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-4">
      {/* Invite collaborator box */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-indigo-600" />
          Add Workshop Collaborators
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6">
          Grant other users edit or view access to this workshop and webinar contents under role-based policies.
        </p>

        <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              type="email"
              placeholder="Enter user's email address"
              className="pl-10"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
            />
          </div>
          <div className="w-full sm:w-48">
            <select
              className="w-full h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as any)}
              disabled={!isOwner}
            >
              <option value="OWNER">Owner (Full Admin)</option>
              <option value="MANAGER">Manager (Can manage workshop)</option>
              <option value="EDITOR">Editor (Can edit content)</option>
              <option value="VIEWER">Viewer (Read-only)</option>
            </select>
          </div>
          <Button type="submit" disabled={inviting} className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-2">
            {inviting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add Collaborator
          </Button>
        </form>
      </div>

      {/* Collaborator roster */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Collaborator Roster</h3>
        </div>
        
        {collaborators.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 dark:text-zinc-400">
            No collaborators added yet. Add one above!
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role Policy</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {collaborators.map((c) => (
                <TableRow key={c.userId}>
                  <TableCell className="flex items-center gap-3">
                    <Avatar className="w-9 h-9">
                      {c.avatarUrl && <AvatarImage src={c.avatarUrl} alt={c.name} />}
                      <AvatarFallback className="bg-indigo-100 text-indigo-700 font-bold">
                        {c.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm flex items-center gap-1.5">
                        {c.name}
                        {c.role === 'OWNER' && <Shield className="w-3.5 h-3.5 text-amber-500" />}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">{c.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {c.id === null ? (
                      <Badge variant="secondary" className="bg-zinc-100 text-zinc-700">OWNER</Badge>
                    ) : (
                      <select
                        className="h-8 px-2 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        value={c.role}
                        onChange={(e) => handleRoleChange(c.userId, e.target.value as any)}
                        disabled={c.userId === user?.id || !isOwner}
                      >
                        <option value="OWNER">Owner</option>
                        <option value="MANAGER">Manager</option>
                        <option value="EDITOR">Editor</option>
                        <option value="VIEWER">Viewer</option>
                      </select>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={c.status === 'ACCEPTED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {c.id !== null && c.userId !== user?.id && (
                      <Button
                        variant="ghost"
                        onClick={() => handleRemove(c.userId)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 p-2 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
