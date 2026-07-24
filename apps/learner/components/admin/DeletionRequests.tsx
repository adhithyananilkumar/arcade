'use client';

import { useState, useEffect } from 'react';
import { ChannelDeletionRequestDto, channelService } from "@/domains/channels";
import { Check, X, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { usePermissions } from "@/domains/identity";
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/design-system/ui/dialog';

export function DeletionRequests() {
  const [requests, setRequests] = useState<ChannelDeletionRequestDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ChannelDeletionRequestDto | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PERSONAL' | 'ORGANIZATION'>('ALL');
  const [approveForce, setApproveForce] = useState(false);

  const { hasPermission } = usePermissions();
  const { user } = useAuthStore();
  const canReview = hasPermission('platform.channels.manage');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await channelService.getPendingDeletionRequests();
      setRequests(data);
    } catch (error) {
      toast.error('Failed to load deletion requests');
    } finally {
      setLoading(false);
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
      fetchRequests();
    } catch (error) {
      toast.error('Failed to review request');
    }
  };

  const openReview = (req: ChannelDeletionRequestDto) => {
    setSelectedRequest(req);
    setApproveForce(false);
  };

  if (!canReview) return null;

  if (loading) return <div className="text-sm text-gray-500">Loading requests...</div>;

  const filteredRequests = (Array.isArray(requests) ? requests : []).filter(req => {
    if (filter === 'PERSONAL') return req.isPersonal;
    if (filter === 'ORGANIZATION') return !req.isPersonal;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-3">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
          <AlertTriangle className="text-red-500" size={20} />
          Pending Deletion Requests
          <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">{filteredRequests.length}</span>
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${filter === 'ALL' ? 'bg-red-600 text-white shadow-sm' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
          >
            All Requests
          </button>
          <button 
            onClick={() => setFilter('PERSONAL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${filter === 'PERSONAL' ? 'bg-red-600 text-white shadow-sm' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
          >
            Personal Channels
          </button>
          <button 
            onClick={() => setFilter('ORGANIZATION')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${filter === 'ORGANIZATION' ? 'bg-red-600 text-white shadow-sm' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
          >
            Organization Channels
          </button>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-sm text-gray-500 py-4">No deletion requests found.</div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div key={req.id} className="flex items-center justify-between p-4 rounded-xl border border-red-100 bg-red-50/30 hover:bg-red-50 transition-colors cursor-pointer" onClick={() => openReview(req)}>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-100 text-red-600 overflow-hidden shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    {req.channelName}
                    <span className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-[10px] text-gray-600 uppercase font-bold tracking-wide shadow-sm">
                      {req.isPersonal ? 'Personal' : 'Organization'}
                    </span>
                  </h4>
                  <p className="text-xs text-gray-500 flex items-center gap-2">
                    <span>Requested by: {req.requestedByName}</span>
                    <span>•</span>
                    <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-1">{req.reason}</p>
                </div>
              </div>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => openReview(req)}
                  className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  title="Review Deletion Request"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => handleReview(req.id, 'REJECT')}
                  className="p-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  title="Reject"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selectedRequest} onOpenChange={(open) => !open && setSelectedRequest(null)}>
        <DialogContent className="max-w-md p-6 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl text-red-600 flex items-center gap-2">
              <AlertTriangle size={20} />
              Review Deletion Request
            </DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-6 mt-4">
              <div>
                <h4 className="text-sm font-bold text-gray-900">Channel</h4>
                <p className="text-base text-gray-700">{selectedRequest.channelName}</p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900">Requested By</h4>
                <p className="text-base text-gray-700">{selectedRequest.requestedByName}</p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-gray-900">Reason for Deletion</h4>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mt-1">
                  <p className="text-sm text-gray-700">{selectedRequest.reason}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Phone</h4>
                  <p className="text-sm text-gray-700">{selectedRequest.phoneNumber}</p>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Email</h4>
                  <p className="text-sm text-gray-700">{selectedRequest.email}</p>
                </div>
              </div>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-red-100 bg-red-50/50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={approveForce}
                  onChange={(e) => setApproveForce(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-red-600"
                />
                <span className="text-sm text-gray-700">
                  <span className="font-bold text-red-700">Force delete</span> — unlist this
                  channel's content immediately, for safety/policy-violation cases. Leave
                  unchecked for the standard approval, where content stays publicly visible for
                  up to 6 months.
                </span>
              </label>

              <div className="flex gap-3 pt-6 border-t border-gray-100">
                <button
                  onClick={() => handleReview(selectedRequest.id, 'APPROVE', approveForce)}
                  className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-semibold text-sm shadow-sm"
                >
                  <Check size={18} /> {approveForce ? 'Force Approve Deletion' : 'Approve Deletion'}
                </button>
                <button
                  onClick={() => handleReview(selectedRequest.id, 'REJECT')}
                  className="flex-1 flex justify-center items-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-sm"
                >
                  <X size={18} /> Reject
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
