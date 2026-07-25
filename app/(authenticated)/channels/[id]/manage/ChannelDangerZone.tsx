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
      <div className="p-6 text-center text-sm text-gray-500">
        Only the channel owner can access destructive actions.
      </div>
    );
  }

  const isSuspended = channel.status === 'SUSPENDED';

  return (
    <div className="max-w-3xl">
      <h3 className="text-lg font-bold text-red-600 mb-1 flex items-center gap-2">
        <AlertTriangle size={20} />
        Danger Zone
      </h3>
      <p className="text-sm text-gray-500 mb-4">Irreversible actions for your channel.</p>

      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-semibold text-gray-900">Delete this channel</h4>
            <p className="text-sm text-gray-600 mt-1">
              {isSuspended
                ? 'This channel is already suspended — there is nothing further to request.'
                : 'Once approved, your channel will be suspended. Its content stays owned by the channel and remains publicly visible for up to 6 months before being unlisted, giving you time to appeal or reactivate.'}
            </p>
          </div>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteModalOpen(true)}
            className="shrink-0"
            disabled={isSuspended}
          >
            Request Deletion
          </Button>
        </CardContent>
      </Card>

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
