/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useMemo } from 'react';
import {
  ChannelDeletionRequestDto,
  ChannelSummary,
  channelService,
  useChannelSummariesQuery,
  useInvalidateChannelAdmin,
  usePendingDeletionRequestsQuery,
} from "@/domains/channels";
import { Check, X, AlertTriangle, ShieldCheck, Trash2, Clock, User, Building2, Calendar, Search, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from "@/domains/identity";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/design-system/ui/dialog';

export function DeletionRequests() {
  // Both reads are shared queries. The page's tab badge and the navbar's task menu ask for the
  // same deletion list on the same render, and the sibling Channels panel asks for the same
  // `allChannels`; one key each means one request each rather than one per caller.
  const { data: requestsData, isLoading: requestsLoading } = usePendingDeletionRequestsQuery();
  // Only the suspended channels, asked for by status. This used to fetch every channel — 4,042
  // rows, 2.5 MB — and keep the suspended ones in the browser.
  const { channels: suspendedChannels, isLoading: channelsLoading } = useChannelSummariesQuery({
    status: 'SUSPENDED',
    size: 100,
  });
  const invalidateChannelAdmin = useInvalidateChannelAdmin();

  const requests = requestsData ?? [];
  const loading = requestsLoading || channelsLoading;
  const pipelineChannels = suspendedChannels;
  const [selectedRequest, setSelectedRequest] = useState<ChannelDeletionRequestDto | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PERSONAL' | 'ORGANIZATION'>('ALL');
  const [approveForce, setApproveForce] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [hardDeleteTarget, setHardDeleteTarget] = useState<ChannelSummary | null>(null);
  const [hardDeleteReason, setHardDeleteReason] = useState('');
  const [hardDeleteConfirmText, setHardDeleteConfirmText] = useState('');
  const [hardDeleteAcknowledged, setHardDeleteAcknowledged] = useState(false);
  const [hardDeleteSubmitting, setHardDeleteSubmitting] = useState(false);

  const { hasPermission } = usePermissions();
  const canReview = hasPermission('platform.channels.manage');

  const handleReactivate = async (id: string) => {
    try {
      await channelService.reactivateChannel(id);
      toast.success('Channel reactivated');
      invalidateChannelAdmin();
    } catch {
      toast.error('Failed to reactivate channel');
    }
  };

  const openHardDeleteDialog = (channel: ChannelSummary) => {
    setHardDeleteTarget(channel);
    setHardDeleteReason('');
    setHardDeleteConfirmText('');
    setHardDeleteAcknowledged(false);
  };

  const confirmHardDelete = async () => {
    if (!hardDeleteTarget) return;
    if (!hardDeleteReason.trim()) {
      toast.error('A reason is required to permanently delete a channel');
      return;
    }
    if (hardDeleteConfirmText !== hardDeleteTarget.name) {
      toast.error('Type the channel name exactly to confirm');
      return;
    }
    if (!hardDeleteAcknowledged) {
      toast.error('You must acknowledge the consequences before proceeding');
      return;
    }
    setHardDeleteSubmitting(true);
    try {
      await channelService.hardDeleteChannel(hardDeleteTarget.id, hardDeleteReason.trim(), hardDeleteConfirmText);
      toast.success('Channel and all its content have been permanently deleted');
      setHardDeleteTarget(null);
      invalidateChannelAdmin();
    } catch (err) {
      // The backend explains refusals (e.g. records that are kept permanently); show that reason.
      toast.error(err instanceof Error && err.message ? err.message : 'Failed to permanently delete channel');
    } finally {
      setHardDeleteSubmitting(false);
    }
  };

  const handleReview = async (id: string, action: 'APPROVE' | 'REJECT', force: boolean = false) => {
    try {
      await channelService.reviewDeletionRequest(id, action, force);
      toast.success(
        action === 'REJECT'
          ? 'Request rejected'
          : force
            ? 'Deletion approved — content unlisted immediately'
            : 'Deletion approved — content will be unlisted within 6 months'
      );
      setSelectedRequest(null);
      setApproveForce(false);
      invalidateChannelAdmin();
    } catch {
      toast.error('Failed to review request');
    }
  };

  const openReview = (req: ChannelDeletionRequestDto) => {
    setSelectedRequest(req);
    setApproveForce(false);
  };

  const filteredRequests = useMemo(() => {
    return (Array.isArray(requests) ? requests : []).filter((req) => {
      if (filter === 'PERSONAL' && !req.isPersonal) return false;
      if (filter === 'ORGANIZATION' && req.isPersonal) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = req.channelName?.toLowerCase().includes(q);
        const matchesBy = req.requestedByName?.toLowerCase().includes(q);
        const matchesReason = req.reason?.toLowerCase().includes(q);
        if (!matchesName && !matchesBy && !matchesReason) return false;
      }
      return true;
    });
  }, [requests, filter, searchQuery]);

  if (!canReview) return null;

  return (
    <div className="space-y-8">
      {/* Section 1: Pending Deletion Requests */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-full border border-slate-200/80 bg-surface/80 p-1.5 shadow-xs backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'PERSONAL', label: 'Personal' },
              { id: 'ORGANIZATION', label: 'Organization' },
            ].map((item) => {
              const isActive = filter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id as any)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-bold tracking-tight transition-colors ${
                    isActive
                      ? 'bg-slate-950 text-on-ink shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <div className="relative min-w-[320px] sm:min-w-[380px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-slate-200/80 bg-surface py-1.5 pl-8 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100 transition-all"
            />
          </div>
        </div>

        {/* Requests Table / Empty State */}
        {loading ? (
          <div className="rounded-2xl border border-slate-200/90 bg-surface py-14 text-center">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="size-5 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
              <span className="text-xs font-medium text-slate-500">Loading deletion requests...</span>
            </div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-16 text-center">
            <div className="flex flex-col items-center justify-center gap-2.5 max-w-sm mx-auto">
              <div className="mb-2 flex size-16 items-center justify-center rounded-3xl bg-gradient-to-b from-rose-50 via-rose-50/80 to-rose-100/60 p-3 shadow-xs border border-rose-100/80 dark:from-rose-500/10 dark:to-rose-500/15 dark:border-rose-500/20 dark:via-rose-500/10">
                <AlertTriangle size={26} className="text-rose-600 dark:text-rose-400 stroke-[1.8]" />
              </div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                No deletion requests awaiting review
              </h3>
              <p className="text-xs font-medium leading-relaxed text-slate-500">
                {searchQuery || filter !== 'ALL'
                  ? 'No deletion requests match the current search or filter.'
                  : 'Any self-service deletion requests will appear here.'}
              </p>
              {(searchQuery || filter !== 'ALL') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setFilter('ALL');
                  }}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-2.5 text-xs font-bold text-on-ink shadow-xs transition-transform hover:scale-[1.02] active:scale-[0.98] hover:bg-slate-800"
                >
                  <RotateCcw size={13} />
                  <span>Reset filters</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-surface shadow-[0_4px_24px_-4px_rgba(20,20,43,0.04)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/75 backdrop-blur-xs text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-6 font-semibold">Channel</th>
                    <th className="py-3.5 px-4 font-semibold">Type</th>
                    <th className="py-3.5 px-4 font-semibold">Requested By</th>
                    <th className="py-3.5 px-4 font-semibold">Reason</th>
                    <th className="py-3.5 px-4 font-semibold">Requested Date</th>
                    <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredRequests.map((req) => (
                    <tr
                      key={req.id}
                      onClick={() => openReview(req)}
                      className="group cursor-pointer hover:bg-rose-50/40 transition-all duration-150 dark:hover:bg-rose-500/10"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-50 via-slate-50 to-rose-100/70 text-rose-600 overflow-hidden shrink-0 border border-rose-200/50 shadow-2xs group-hover:scale-105 transition-transform font-bold text-sm dark:from-rose-500/10 dark:to-rose-500/15 dark:text-rose-400 dark:border-rose-500/25">
                            {req.channelName ? req.channelName.charAt(0).toUpperCase() : 'C'}
                          </div>
                          <span className="font-bold text-xs text-slate-900 group-hover:text-rose-600 transition-colors dark:group-hover:text-rose-400">
                            {req.channelName}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
                            req.isPersonal
                              ? 'border-sky-200/80 bg-sky-50 text-sky-700 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-300'
                              : 'border-purple-200/80 bg-purple-50 text-purple-700 dark:border-purple-500/25 dark:bg-purple-500/10 dark:text-purple-300'
                          }`}
                        >
                          {req.isPersonal ? <User size={11} className="text-sky-500" /> : <Building2 size={11} className="text-purple-500" />}
                          {req.isPersonal ? 'Personal' : 'Organization'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2.5 min-w-0 max-w-[190px]">
                          <div className="flex size-7 items-center justify-center rounded-full bg-gradient-to-tr from-slate-100 to-slate-200/90 text-slate-700 font-bold text-[11px] border border-slate-200/80 shrink-0">
                            {(req.requestedByName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 truncate">
                            <p className="truncate font-semibold text-xs text-slate-800">{req.requestedByName}</p>
                            <p className="truncate text-[10.5px] text-slate-400 font-mono">{req.email || req.phoneNumber || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 max-w-[220px]">
                        <p className="truncate text-slate-600 font-normal text-xs" title={req.reason}>
                          {req.reason || 'No reason provided'}
                        </p>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                          <Calendar size={12} className="text-slate-400 shrink-0" />
                          <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => openReview(req)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-ink hover:bg-ink-hover px-3.5 py-1.5 text-xs font-semibold text-on-ink shadow-xs hover:scale-[1.02] active:scale-[0.98] transition-all"
                            title="Review request"
                          >
                            <Check size={12} className="text-emerald-400" strokeWidth={3} />
                            <span>Review</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReview(req.id, 'REJECT')}
                            className="inline-flex items-center gap-1 rounded-xl border border-rose-200/90 bg-surface hover:bg-rose-50 hover:border-rose-300 px-3 py-1.5 text-xs font-semibold text-rose-600 shadow-2xs hover:scale-[1.02] active:scale-[0.98] transition-all dark:border-rose-500/25 dark:hover:bg-rose-500/10 dark:hover:border-rose-500/40 dark:text-rose-400"
                            title="Reject request"
                          >
                            <X size={12} strokeWidth={2.5} />
                            <span>Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Section 2: Channels in Deletion Pipeline */}
      <div className="space-y-4 pt-6 border-t border-slate-200">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200/60 shadow-2xs dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/25">
              <Clock size={15} />
            </span>
            Channels in Deletion Pipeline
            <span className="rounded-full bg-amber-50 text-amber-700 border border-amber-200/70 px-2 py-0.5 text-xs font-bold dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/25">
              {pipelineChannels.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Suspended channels waiting out their 6-month grace period before removal. Reactivate to restore, or force permanent delete.
          </p>
        </div>

        {/* Pipeline Table / Empty State */}
        {pipelineChannels.length === 0 ? (
          <div className="py-12 text-center">
            <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
              <div className="mb-1 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-b from-amber-50 to-amber-100/60 p-2.5 shadow-2xs border border-amber-100/80 dark:from-amber-500/10 dark:to-amber-500/15 dark:border-amber-500/20">
                <Clock size={22} className="text-amber-600 dark:text-amber-400" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                No channels in deletion pipeline
              </h4>
              <p className="text-xs font-medium text-slate-500">
                No channels are currently waiting out their 6-month grace period.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-surface shadow-[0_4px_24px_-4px_rgba(20,20,43,0.04)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200/80 bg-slate-50/75 backdrop-blur-xs text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-6 font-semibold">Channel</th>
                    <th className="py-3.5 px-4 font-semibold">Type</th>
                    <th className="py-3.5 px-4 font-semibold">Owner</th>
                    <th className="py-3.5 px-4 font-semibold">Reason / Notes</th>
                    <th className="py-3.5 px-4 font-semibold">Unlist Schedule</th>
                    <th className="py-3.5 px-6 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {pipelineChannels.map((channel) => (
                    <tr key={channel.id} className="hover:bg-slate-50/80 transition-all duration-150">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-xs text-slate-900">{channel.name}</span>
                          {channel.forcedSuspension && (
                            <span className="inline-flex items-center rounded-md bg-rose-50 border border-rose-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-rose-700 dark:bg-rose-500/10 dark:border-rose-500/25 dark:text-rose-300">
                              Forced
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
                            channel.isPersonal
                              ? 'border-sky-200/80 bg-sky-50 text-sky-700 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-300'
                              : 'border-purple-200/80 bg-purple-50 text-purple-700 dark:border-purple-500/25 dark:bg-purple-500/10 dark:text-purple-300'
                          }`}
                        >
                          {channel.isPersonal ? <User size={11} className="text-sky-500" /> : <Building2 size={11} className="text-purple-500" />}
                          {channel.isPersonal ? 'Personal' : 'Organization'}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-semibold text-xs text-slate-800">
                        {channel.ownerName}
                      </td>
                      <td className="py-4 px-4 max-w-[200px]">
                        <p className="truncate text-slate-600 text-xs" title={channel.suspensionReason}>
                          {channel.suspensionReason || '—'}
                        </p>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-[11px]">
                        {channel.forcedSuspension ? (
                          <span className="font-semibold text-rose-600 dark:text-rose-400">Unlisted immediately</span>
                        ) : channel.contentUnlistDate ? (
                          <span className="font-medium text-amber-700 dark:text-amber-300">
                            Unlists on {new Date(channel.contentUnlistDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-slate-400">Standard grace</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleReactivate(channel.id)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:scale-[1.02] active:scale-[0.98] transition-all"
                            title="Reactivate channel"
                          >
                            <ShieldCheck size={13} />
                            <span>Reactivate</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openHardDeleteDialog(channel)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-rose-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-rose-700 transition-colors shadow-xs dark:border-rose-500/40"
                            title="Force hard delete"
                          >
                            <Trash2 size={13} />
                            <span>Force Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
            </table>
          </div>
        </div>
      )}
    </div>

      {/* Review Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="max-w-md p-6 sm:p-7">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-rose-700 flex items-center gap-2 dark:text-rose-300">
              <AlertTriangle size={18} />
              Review Deletion Request
            </DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-5 mt-3">
              <div>
                <span className="block text-[11px] font-medium text-slate-400">Target Channel</span>
                <p className="text-sm font-bold text-slate-900">{selectedRequest.channelName}</p>
              </div>

              <div>
                <span className="block text-[11px] font-medium text-slate-400">Requested By</span>
                <p className="text-sm font-semibold text-slate-800">{selectedRequest.requestedByName}</p>
              </div>

              <div className="space-y-1">
                <span className="block text-[11px] font-medium text-slate-400">Reason for Deletion</span>
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {selectedRequest.reason || 'No specific reason given'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50/70 p-3 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="block text-[10px] font-medium text-slate-400">Phone</span>
                  <span className="font-semibold text-slate-800">{selectedRequest.phoneNumber || '—'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-medium text-slate-400">Email</span>
                  <span className="font-semibold text-slate-800 break-all">{selectedRequest.email || '—'}</span>
                </div>
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-rose-200 bg-rose-50/50 cursor-pointer dark:border-rose-500/25 dark:bg-rose-500/10">
                <input
                  type="checkbox"
                  checked={approveForce}
                  onChange={(e) => setApproveForce(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-rose-600 rounded"
                />
                <span className="text-xs text-slate-700">
                  <span className="font-bold text-rose-700 dark:text-rose-300">Force immediate unlisting</span> — removes content immediately instead of waiting the 6-month grace period.
                </span>
              </label>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => handleReview(selectedRequest.id, 'APPROVE', approveForce)}
                  className="flex-1 inline-flex justify-center items-center gap-1.5 px-4 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors font-semibold text-xs shadow-sm"
                >
                  <Check size={15} /> {approveForce ? 'Force Approve' : 'Approve Deletion'}
                </button>
                <button
                  type="button"
                  onClick={() => handleReview(selectedRequest.id, 'REJECT')}
                  className="flex-1 inline-flex justify-center items-center gap-1.5 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-semibold text-xs"
                >
                  <X size={15} /> Reject
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Hard Delete Dialog */}
      <Dialog open={!!hardDeleteTarget} onOpenChange={(open) => !open && setHardDeleteTarget(null)}>
        <DialogContent className="max-w-md p-6 sm:p-7">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-rose-700 flex items-center gap-2 dark:text-rose-300">
              <AlertTriangle size={18} /> Permanently Delete Channel
            </DialogTitle>
          </DialogHeader>

          {hardDeleteTarget && (
            <div className="space-y-4 mt-3">
              <div className="space-y-1.5 p-3.5 rounded-xl border border-rose-200 bg-rose-50 dark:border-rose-500/25 dark:bg-rose-500/10">
                <p className="text-xs font-bold text-rose-800 dark:text-rose-200">Irreversible Action</p>
                <ul className="text-xs text-rose-700 space-y-1 list-disc list-inside dark:text-rose-300">
                  <li>Every course, roadmap, and workshop is deleted immediately.</li>
                  <li>Learners already enrolled in content lose access permanently.</li>
                  <li>Staff, roles, and pending invitations are removed.</li>
                </ul>
              </div>

              <div>
                <span className="block text-[11px] font-medium text-slate-400">Target Channel</span>
                <p className="text-sm font-bold text-slate-900">{hardDeleteTarget.name}</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800" htmlFor="pipeline-hard-delete-reason">
                  Audit Reason (Mandatory)
                </label>
                <textarea
                  id="pipeline-hard-delete-reason"
                  value={hardDeleteReason}
                  onChange={(e) => setHardDeleteReason(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent transition-all placeholder:text-slate-400"
                  placeholder="e.g. Legal takedown, GDPR erasure request, severe policy violation..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800" htmlFor="pipeline-hard-delete-confirm">
                  Type <span className="font-mono text-rose-700 select-all dark:text-rose-300">{hardDeleteTarget.name}</span> to confirm
                </label>
                <input
                  id="pipeline-hard-delete-confirm"
                  type="text"
                  value={hardDeleteConfirmText}
                  onChange={(e) => setHardDeleteConfirmText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent font-mono"
                  autoComplete="off"
                />
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-xl border border-rose-200 bg-rose-50/50 cursor-pointer dark:border-rose-500/25 dark:bg-rose-500/10">
                <input
                  type="checkbox"
                  checked={hardDeleteAcknowledged}
                  onChange={(e) => setHardDeleteAcknowledged(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-rose-700 rounded"
                />
                <span className="text-xs text-slate-700">
                  I understand this permanently deletes the channel and all its content immediately.
                </span>
              </label>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={confirmHardDelete}
                  disabled={
                    hardDeleteSubmitting ||
                    hardDeleteConfirmText !== hardDeleteTarget.name ||
                    !hardDeleteAcknowledged ||
                    !hardDeleteReason.trim()
                  }
                  className="flex-1 inline-flex justify-center items-center gap-1.5 px-4 py-2.5 bg-rose-700 text-white rounded-xl hover:bg-rose-800 transition-colors font-semibold text-xs shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 size={15} /> {hardDeleteSubmitting ? 'Deleting...' : 'Permanently Delete'}
                </button>
                <button
                  type="button"
                  onClick={() => setHardDeleteTarget(null)}
                  className="flex-1 inline-flex justify-center items-center gap-1.5 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors font-semibold text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
