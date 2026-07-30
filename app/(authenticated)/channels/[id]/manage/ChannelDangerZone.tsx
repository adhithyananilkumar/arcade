'use client';

import { useState, useEffect, useCallback } from 'react';
import { Channel, channelService, ChannelStaffService, ChannelStaff, OwnershipTransferResponse } from "@/domains/channels";
import { toast } from 'sonner';
import { AlertTriangle, Info, Loader2, Search, Check, ShieldAlert, Crown } from 'lucide-react';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/shared/design-system/ui/dialog';
import { Card, CardContent } from '@/shared/design-system/ui/card';
import { Button } from '@/shared/design-system/ui/button';
import { Input } from '@/shared/design-system/ui/input';

interface Props {
  channel: Channel;
}

export function ChannelDangerZone({ channel }: Props) {
  const { user } = useAuthStore();

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const deletePhone = user?.mobileNumber || channel.ownerPhone || '';
  const deleteEmail = user?.email || channel.ownerEmail || '';
  const [deleteDeclaration, setDeleteDeclaration] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Ownership transfer state
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferRequest, setTransferRequest] = useState<OwnershipTransferResponse | null>(null);
  const [loadingTransfer, setLoadingTransfer] = useState(true);
  const [staffList, setStaffList] = useState<ChannelStaff[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [ack1, setAck1] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Final confirmation modal state
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmChannelName, setConfirmChannelName] = useState('');
  const [confirmOwnerEmail, setConfirmOwnerEmail] = useState('');
  const [confirmCheckbox, setConfirmCheckbox] = useState(false);

  const fetchTransferStatus = useCallback(async () => {
    try {
      setLoadingTransfer(true);
      const status = await channelService.getOwnershipTransferStatus(channel.id);
      setTransferRequest(status);
    } catch {
      // Backend handles permission / empty response
    } finally {
      setLoadingTransfer(false);
    }
  }, [channel.id]);

  const fetchStaff = useCallback(async () => {
    try {
      setLoadingStaff(true);
      const staff = await ChannelStaffService.getStaff(channel.id);
      setStaffList(staff || []);
    } catch {
      // Backend handles permission
    } finally {
      setLoadingStaff(false);
    }
  }, [channel.id]);

  useEffect(() => {
    fetchTransferStatus();
    fetchStaff();
  }, [fetchTransferStatus, fetchStaff]);

  const handleOpenTransferModal = () => {
    setSelectedStaffId('');
    setStaffSearchQuery('');
    setAck1(false);
    setIsTransferModalOpen(true);
  };

  const handleCloseTransferModal = () => {
    setIsTransferModalOpen(false);
    setSelectedStaffId('');
    setStaffSearchQuery('');
    setAck1(false);
  };

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
      toast.error(error.message || error.response?.data?.message || 'Failed to submit deletion request');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRequestTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaffId) {
      toast.error('Please select a staff member');
      return;
    }
    if (!ack1) {
      toast.error('Please acknowledge the terms before requesting transfer');
      return;
    }
    const selectedStaff = staffList.find((s) => s.userId === selectedStaffId);
    setConfirmChannelName(channel.name);
    setConfirmOwnerEmail(selectedStaff?.email || '');
    setConfirmCheckbox(false);
    setIsTransferModalOpen(false);
    setIsConfirmModalOpen(true);
  };

  const handleSendTransferRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = confirmChannelName.trim();
    const trimmedEmail = confirmOwnerEmail.trim();

    if (!trimmedName) {
      toast.error('Channel Name is required.');
      return;
    }
    if (!trimmedEmail) {
      toast.error('Recipient email is required.');
      return;
    }
    if (!confirmCheckbox) {
      toast.error('Please confirm that the channel name and recipient email are correct.');
      return;
    }

    const targetStaff = eligibleStaff.find(
      (s) => s.email.toLowerCase() === trimmedEmail.toLowerCase()
    );
    if (!targetStaff) {
      toast.error(`No active staff member found with email "${trimmedEmail}".`);
      return;
    }

    try {
      setActionLoading(true);
      await channelService.requestOwnershipTransfer(channel.id, targetStaff.userId);
      toast.success(
        'Ownership Transfer Requested: A request has been sent to the selected staff member. Ownership remains unchanged until accepted.'
      );
      setIsConfirmModalOpen(false);
      await fetchTransferStatus();
    } catch (error: any) {
      toast.error(error.message || error.response?.data?.message || 'Failed to request ownership transfer');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelTransfer = async () => {
    if (!transferRequest) return;
    try {
      setActionLoading(true);
      await channelService.cancelOwnershipTransfer(transferRequest.id);
      toast.success('Ownership transfer request cancelled');
      await fetchTransferStatus();
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel ownership transfer request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptTransfer = async () => {
    if (!transferRequest) return;
    try {
      setActionLoading(true);
      await channelService.acceptOwnershipTransfer(transferRequest.id);
      toast.success('Ownership transfer accepted successfully');
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept ownership transfer');
      setActionLoading(false);
    }
  };

  const handleDeclineTransfer = async () => {
    if (!transferRequest) return;
    try {
      setActionLoading(true);
      await channelService.declineOwnershipTransfer(transferRequest.id);
      toast.success('Ownership transfer request declined');
      await fetchTransferStatus();
    } catch (error: any) {
      toast.error(error.message || 'Failed to decline ownership transfer');
    } finally {
      setActionLoading(false);
    }
  };

  const isSuspended = channel.status === 'SUSPENDED';
  const isOwner = user?.id === channel.ownerId;
  const eligibleStaff = staffList.filter(s => s.userId !== channel.ownerId);

  const filteredStaff = eligibleStaff.filter((staff) => {
    const name = staff.userName || '';
    const email = staff.email || '';
    const query = staffSearchQuery.toLowerCase().trim();
    return name.toLowerCase().includes(query) || email.toLowerCase().includes(query);
  });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h3 className="text-lg font-bold text-red-600 mb-1 flex items-center gap-2">
          <AlertTriangle size={20} />
          Danger Zone
        </h3>
        <p className="text-sm text-gray-500 mb-4">Irreversible actions for your channel.</p>
      </div>

      {/* Delete Channel Card */}
      {isOwner && (
        <Card className="border-red-200 bg-red-50/60 dark:bg-red-950/20">
          <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100">Delete this channel</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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
      )}

      {/* Transfer Ownership Subtle Danger Card */}
      <Card className="border border-red-200 dark:border-red-900/40 bg-red-50/60 dark:bg-red-950/20">
        <CardContent className="p-6">
          {loadingTransfer ? (
            <div className="flex items-center gap-2 text-sm text-gray-500 py-2">
              <Loader2 size={16} className="animate-spin text-red-600" /> Loading transfer details...
            </div>
          ) : transferRequest && transferRequest.status === 'PENDING' ? (
            user?.id === transferRequest.proposedOwnerId ? (
              // Logged-in user is the proposed owner
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-red-700 dark:text-red-400 text-base flex items-center gap-2">
                    <Crown size={18} className="text-red-600" />
                    Pending Ownership Transfer Request
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    You have been requested to become the new owner of this channel.
                  </p>
                </div>
                <div className="bg-white/90 dark:bg-neutral-900/90 rounded-xl p-4 border border-red-200/80 dark:border-red-800/40 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Requested By:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-semibold">{transferRequest.currentOwnerName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Status:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300">
                      Pending Acceptance
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Expires:</span>
                    <span className="text-gray-900 dark:text-gray-200">{new Date(transferRequest.expiresAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <Button
                    onClick={handleAcceptTransfer}
                    disabled={actionLoading}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold"
                  >
                    {actionLoading && <Loader2 size={16} className="animate-spin mr-1" />}
                    Accept Ownership
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleDeclineTransfer}
                    disabled={actionLoading}
                    className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                  >
                    {actionLoading && <Loader2 size={16} className="animate-spin mr-1" />}
                    Decline
                  </Button>
                </div>
              </div>
            ) : (
              // Logged-in user is current owner with a pending request
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-red-700 dark:text-red-400 text-base flex items-center gap-2">
                      <ShieldAlert size={18} className="text-red-600" />
                      Ownership Transfer Requested
                    </h4>
                    <p className="text-sm text-red-900 dark:text-red-300 mt-1 font-medium">
                      A request has been sent to <span className="font-bold">{transferRequest.proposedOwnerName}</span>.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      Ownership remains unchanged until the request is accepted.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={handleCancelTransfer}
                    disabled={actionLoading}
                    className="border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 shrink-0 font-semibold text-xs"
                  >
                    {actionLoading && <Loader2 size={14} className="animate-spin mr-1" />}
                    Cancel Request
                  </Button>
                </div>
                <div className="bg-white/90 dark:bg-neutral-900/90 rounded-xl p-4 border border-red-200/80 dark:border-red-800/40 space-y-2.5 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Proposed Owner:</span>
                    <span className="text-gray-900 dark:text-gray-100 font-bold">{transferRequest.proposedOwnerName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Status:</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                      Pending Response
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 dark:text-gray-400 font-medium">Expires On:</span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {new Date(transferRequest.expiresAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                  </div>
                </div>
              </div>
            )
          ) : (
            // No active pending transfer request -> Show primary button to open modal
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-red-700 dark:text-red-400 text-base flex items-center gap-2">
                  <Crown size={18} className="text-red-600" />
                  Transfer Ownership
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 max-w-xl">
                  Transfer ownership of this channel to another active staff member. Ownership changes only after the selected member accepts the request.
                </p>
              </div>
              <Button
                type="button"
                onClick={handleOpenTransferModal}
                disabled={isSuspended}
                className="border border-red-300 text-red-700 hover:bg-red-100/80 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/50 font-bold shrink-0 shadow-sm transition-all"
                variant="outline"
              >
                Transfer Ownership
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Transfer Ownership Minimal Enterprise Desktop Modal */}
      <Dialog open={isTransferModalOpen} onOpenChange={setIsTransferModalOpen}>
        <DialogContent className="max-w-[760px] w-full p-6 overflow-hidden rounded-xl border border-slate-200 dark:border-neutral-800 shadow-xl bg-white dark:bg-neutral-900">
          <DialogHeader className="p-0 pb-4 border-b border-slate-100 dark:border-neutral-800">
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Transfer Ownership
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Transfer this channel to another staff member. Ownership changes only after the selected member accepts.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleRequestTransfer} className="space-y-5 pt-4">
            {/* Two-Column Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* LEFT COLUMN: Search & Staff Picker (approx 58% -> 7 Cols) */}
              <div className="md:col-span-7 space-y-2.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select new owner
                </label>

                {/* Search input */}
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search staff by name or email..."
                    value={staffSearchQuery}
                    onChange={(e) => setStaffSearchQuery(e.target.value)}
                    className="pl-8.5 h-9 bg-slate-50 dark:bg-neutral-950 border-slate-200 dark:border-neutral-800 text-xs focus:border-amber-500 focus:ring-amber-500 rounded-lg"
                  />
                </div>

                {/* Staff List */}
                <div className="max-h-[190px] overflow-y-auto rounded-lg border border-slate-200 dark:border-neutral-800 divide-y divide-slate-100 dark:divide-neutral-800/60 bg-white dark:bg-neutral-950">
                  {loadingStaff ? (
                    <div className="p-6 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                      <Loader2 size={14} className="animate-spin text-amber-600" /> Loading staff members...
                    </div>
                  ) : filteredStaff.length === 0 ? (
                    <div className="p-6 text-center text-xs text-slate-500">
                      {eligibleStaff.length === 0
                        ? 'No active staff members available.'
                        : 'No staff members match your search.'}
                    </div>
                  ) : (
                    filteredStaff.map((staff) => {
                      const isSelected = selectedStaffId === staff.userId;
                      const displayName = staff.userName || staff.email.split('@')[0];

                      return (
                        <label
                          key={staff.userId}
                          onClick={() => setSelectedStaffId(staff.userId)}
                          className={`flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-amber-50/70 dark:bg-amber-950/20 border-l-2 border-amber-600'
                              : 'hover:bg-slate-50 dark:hover:bg-neutral-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="h-7 w-7 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-xs flex items-center justify-center border border-amber-200 dark:border-amber-800/50 shrink-0">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                                {displayName}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {staff.email}
                              </p>
                            </div>
                          </div>
                          <input
                            type="radio"
                            name="proposedOwner"
                            checked={isSelected}
                            onChange={() => setSelectedStaffId(staff.userId)}
                            className="h-3.5 w-3.5 text-amber-600 border-slate-300 focus:ring-amber-500 cursor-pointer shrink-0"
                          />
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: Compact Important Checklist (approx 42% -> 5 Cols) */}
              <div className="md:col-span-5 space-y-2.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Important
                </label>
                <div className="rounded-lg border border-slate-200 dark:border-neutral-800 bg-slate-50/60 dark:bg-neutral-950 p-3.5 space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <span>Ownership changes only after acceptance.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <span>Selected staff member becomes the owner.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <span>You become a staff member.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <span>Owner-only permissions are removed.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <span>You can leave the channel after transfer.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <span>Until acceptance you remain the owner.</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Single Required Acknowledgment Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={ack1}
                  onChange={(e) => setAck1(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer shrink-0"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200">
                  I understand that after this request is accepted I will no longer be the owner of this channel.
                </span>
              </label>
            </div>

            {/* Footer */}
            <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-100 dark:border-neutral-800">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCloseTransferModal}
                disabled={actionLoading}
                className="h-8 px-3 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={actionLoading || !selectedStaffId || !ack1}
                className="h-8 px-4 text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm disabled:opacity-50"
              >
                {actionLoading && <Loader2 size={12} className="animate-spin mr-1.5" />}
                Request Transfer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Final Confirmation Modal */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="max-w-md w-full p-6 overflow-hidden rounded-xl border border-slate-200 dark:border-neutral-800 shadow-xl bg-white dark:bg-neutral-900">
          <DialogHeader className="p-0 pb-3 border-b border-slate-100 dark:border-neutral-800">
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Confirm Ownership Transfer
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              You are about to request ownership transfer of this channel. Please verify the details below before continuing.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSendTransferRequest} className="space-y-4 pt-3">
            {/* Channel Name Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Channel Name
              </label>
              <Input
                type="text"
                value={confirmChannelName}
                onChange={(e) => setConfirmChannelName(e.target.value)}
                placeholder="Channel name"
                className="h-9 bg-slate-50 dark:bg-neutral-950 border-slate-200 dark:border-neutral-800 text-xs focus:border-amber-500 focus:ring-amber-500 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* New Owner Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Owner Email
              </label>
              <Input
                type="email"
                value={confirmOwnerEmail}
                onChange={(e) => setConfirmOwnerEmail(e.target.value)}
                placeholder="New owner email"
                className="h-9 bg-slate-50 dark:bg-neutral-950 border-slate-200 dark:border-neutral-800 text-xs focus:border-amber-500 focus:ring-amber-500 rounded-lg text-slate-900 dark:text-slate-100"
              />
            </div>

            {/* Warning Message */}
            <div className="rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/30 p-3 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
              <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-snug">
                Ownership will change only after the selected staff member accepts this request. Until then, you remain the owner.
              </p>
            </div>

            {/* Confirmation Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={confirmCheckbox}
                  onChange={(e) => setConfirmCheckbox(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500 cursor-pointer shrink-0"
                />
                <span className="text-xs text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 font-medium">
                  I confirm that the channel name and recipient email are correct.
                </span>
              </label>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 flex justify-end gap-2.5 border-t border-slate-100 dark:border-neutral-800">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={actionLoading}
                className="h-8 px-3 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-neutral-800 font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={actionLoading || !confirmCheckbox}
                className="h-8 px-4 text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm disabled:opacity-50"
              >
                {actionLoading && <Loader2 size={12} className="animate-spin mr-1.5" />}
                Send Transfer Request
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
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
