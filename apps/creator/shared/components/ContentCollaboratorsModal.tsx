'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Users, Mail, Plus, Trash2, Loader2, Shield, X } from 'lucide-react';
import { api } from '@/infrastructure/http/api';
import { useAuthStore } from '@/infrastructure/auth/auth.store';

export interface Collaborator {
  id?: string;
  userId: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  role: 'OWNER' | 'MANAGER' | 'EDITOR' | 'VIEWER';
  status?: string;
  joinedAt?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  contentType: 'course' | 'workshop' | 'roadmap';
}

export function ContentCollaboratorsModal({ isOpen, onClose, contentId, contentType }: Props) {
  const { user } = useAuthStore();
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'OWNER' | 'MANAGER' | 'EDITOR' | 'VIEWER'>('EDITOR');
  const [inviting, setInviting] = useState(false);

  const apiBasePath = contentType === 'workshop' 
    ? `/api/v1/events/${contentId}/collaborators`
    : `/api/v1/courses/${contentId}/collaborators`;

  useEffect(() => {
    if (isOpen && contentId) {
      loadCollaborators();
    }
  }, [isOpen, contentId]);

  const loadCollaborators = async () => {
    try {
      setLoading(true);
      const data = await api.get<Collaborator[]>(apiBasePath);
      setCollaborators(data || []);
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
      await api.post<Collaborator>(apiBasePath, {
        email: inviteEmail.trim(),
        role: inviteRole,
      });
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
      await api.patch<Collaborator>(`${apiBasePath}/${userId}`, { role: newRole });
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
      await api.delete<void>(`${apiBasePath}/${userId}`);
      toast.success('Collaborator removed successfully!');
      loadCollaborators();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to remove collaborator.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-[#14142b]">
              <Users size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#14142b]">Manage Collaborators</h2>
              <p className="text-xs text-slate-500">Invite and manage co-authors for this {contentType}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-6">
          {/* Invite Form */}
          <form onSubmit={handleInvite} className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Invite New Collaborator</h3>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  placeholder="collaborator@example.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm font-medium text-[#14142b] outline-none focus:border-[#14142b]"
                  required
                />
              </div>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as any)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-[#14142b] outline-none focus:border-[#14142b]"
              >
                <option value="EDITOR">Editor</option>
                <option value="MANAGER">Manager</option>
                <option value="VIEWER">Viewer</option>
                <option value="OWNER">Owner</option>
              </select>
              <button
                type="submit"
                disabled={inviting || !inviteEmail.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#14142b] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#232735] disabled:opacity-50"
              >
                {inviting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                <span>Invite</span>
              </button>
            </div>
          </form>

          {/* Collaborators List */}
          <div>
            <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Current Collaborators</h3>
            {loading ? (
              <div className="flex py-8 justify-center items-center text-slate-400">
                <Loader2 size={24} className="animate-spin" />
              </div>
            ) : collaborators.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-400">
                <Users size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">No collaborators added yet.</p>
                <p className="text-xs">Invite team members above to start collaborating.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 overflow-hidden">
                {collaborators.map((c) => {
                  const isSelf = c.userId === user?.id;
                  return (
                    <div key={c.userId || c.email} className="flex items-center justify-between p-3.5 hover:bg-slate-50/50">
                      <div className="flex items-center gap-3">
                        {c.avatarUrl ? (
                          <img src={c.avatarUrl} alt={c.name || c.email} className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-[#14142b]">
                            {(c.name || c.email).charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#14142b]">{c.name || c.email}</span>
                            {c.status === 'PENDING' && (
                              <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-200">Pending Invite</span>
                            )}
                            {isSelf && (
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">You</span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400">{c.email}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {c.role === 'OWNER' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                            <Shield size={12} />
                            Owner
                          </span>
                        ) : (
                          <select
                            value={c.role}
                            onChange={(e) => handleRoleChange(c.userId, e.target.value as any)}
                            disabled={isSelf}
                            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-[#14142b] outline-none focus:border-[#14142b] disabled:opacity-50"
                          >
                            <option value="EDITOR">Editor</option>
                            <option value="MANAGER">Manager</option>
                            <option value="VIEWER">Viewer</option>
                            <option value="OWNER">Owner</option>
                          </select>
                        )}

                        {c.role !== 'OWNER' && !isSelf && (
                          <button
                            type="button"
                            onClick={() => handleRemove(c.userId)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                            title="Remove collaborator"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
