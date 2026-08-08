'use client';

import { useState } from 'react';
import { Channel, channelService } from "@/domains/channels";
import { toast } from 'sonner';
import { AlertTriangle, Info, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/design-system/ui/dialog';
import { Card, CardHeader, CardContent } from '@/shared/design-system/ui/card';
import { Button } from '@/shared/design-system/ui/button';
import { Input } from '@/shared/design-system/ui/input';

interface Props {
  channel: Channel;
}

// Owner-only, destructive channel actions — kept isolated from both the branding/profile
// settings dialog and the staff/roles tab so it can't be triggered by accident.
export function ChannelDangerZone({ channel }: Props) {
  const { user } = useAuthStore();
  const isOwner = user?.id === channel.ownerId;

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const deletePhone = user?.mobileNumber || channel.ownerPhone || '';
  const deleteEmail = user?.email || channel.ownerEmail || '';
  const [deleteDeclaration, setDeleteDeclaration] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleDeleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deleteDeclaration) {
      toast.error('You must accept the declaration to proceed.');
      return;
    }
    try {
      setDeleteLoading(true);
      await channelService.submitDeletionRequest(channel.id, deleteReason, deletePhone, deleteEmail);
      toast.success('Channel deletion request submitted successfully');
      setIsDeleteModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit deletion request');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!isOwner) {
    return (
      <div className="p-6 text-center text-sm font-medium text-slate-400">
        Only the channel owner can access destructive actions.
      </div>
    );
  }

  const isSuspended = channel.status === 'SUSPENDED';

  return (
    <div className="max-w-3xl mx-auto overflow-hidden rounded-2xl border border-rose-200/80 bg-white/95 p-6 sm:p-7 shadow-[0_8px_28px_rgba(20,20,43,0.05)] space-y-4">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/60">
          <AlertTriangle size={20} />
        </div>
        <div>
          <h3 className="text-base font-bold text-rose-600 tracking-tight">
            Danger Zone
          </h3>
          <p className="text-xs font-medium text-slate-500">Irreversible actions for your channel.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-rose-200/80 bg-rose-50/70 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-[#14142b] text-sm">Delete Channel Request</h4>
          <p className="text-xs font-medium text-slate-600 mt-1 leading-relaxed max-w-xl">
            {isSuspended
              ? 'This channel is already suspended — there is nothing further to request.'
              : 'Once approved, your channel will be suspended. Content stays owned by the channel and remains publicly visible for up to 6 months before being unlisted.'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsDeleteModalOpen(true)}
          className="shrink-0 rounded-full px-5 py-2.5 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSuspended}
        >
          Request Deletion
        </button>
      </div>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="max-w-md p-6">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-600 flex items-center gap-2">
              <AlertTriangle size={20} />
              Request Channel Deletion
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleDeleteSubmit} className="space-y-5 mt-4">
            <div className="rounded-xl bg-blue-50 p-4 border border-blue-100 flex gap-3">
              <Info className="text-blue-600 shrink-0 mt-0.5" size={18} />
              <p className="text-sm text-blue-800">
                Your content ownership will be transferred to arcade management and you won't be able to manage your uploaded contents.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Reason for Deletion</label>
              <textarea
                required
                value={deleteReason}
                onChange={e => setDeleteReason(e.target.value)}
                rows={3}
                placeholder="Why are you deleting this channel?"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
              <Input
                required
                type="tel"
                value={deletePhone}
                readOnly
                disabled
                className="bg-gray-50 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">From your account — update it in account settings.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <Input
                required
                type="email"
                value={deleteEmail}
                readOnly
                disabled
                className="bg-gray-50 text-gray-600 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">From your account — update it in account settings.</p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer mt-2 group">
              <div className="flex h-5 items-center">
                <input
                  type="checkbox"
                  checked={deleteDeclaration}
                  onChange={e => setDeleteDeclaration(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-600 cursor-pointer"
                />
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                I understand that this action can't be undone.
              </span>
            </label>

            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive" disabled={deleteLoading || !deleteDeclaration}>
                {deleteLoading && <Loader2 size={16} className="animate-spin" />}
                Submit Request
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
