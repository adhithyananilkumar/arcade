'use client';

import { useState } from 'react';
import { useReviewWorkspace } from './ReviewWorkspaceProvider';
import { ReviewApi } from '@/shared/api/review.api';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function ReviewDecisionPanel() {
  const { workspace, refresh } = useReviewWorkspace();
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!workspace) return null;
  const isPending = workspace.reviewRound.status === 'PENDING';

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      await ReviewApi.approveRound(workspace.reviewRound.id);
      refresh();
      router.push('/console/reviews');
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError('This review is no longer pending. Someone else may have already acted on it.');
        refresh();
      } else {
        setError('Failed to approve the review.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!reason.trim()) {
      setError('Please provide a reason for requesting changes.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      await ReviewApi.requestChanges(workspace.reviewRound.id, reason);
      refresh();
      router.push('/console/reviews');
    } catch (err: any) {
      if (err.response?.status === 400) {
        setError('This review is no longer pending. Someone else may have already acted on it.');
        refresh();
      } else {
        setError('Failed to request changes.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white border-b border-gray-200">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Decision</h2>
      
      {!isPending ? (
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-center">
          <p className="text-sm font-medium text-gray-600">
            This review round is {workspace.reviewRound.status.toLowerCase()}.
          </p>
          {workspace.reviewRound.decision && (
            <p className={`mt-2 text-sm font-bold ${workspace.reviewRound.decision === 'APPROVED' ? 'text-green-600' : 'text-orange-600'}`}>
              Decision: {workspace.reviewRound.decision.replace('_', ' ')}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <AnimatePresence mode="wait">
            {!showRejectForm ? (
              <motion.div 
                key="buttons"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-3"
              >
                <button
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 shadow-sm"
                >
                  <CheckCircle size={18} />
                  Approve Publication
                </button>
                <button
                  onClick={() => setShowRejectForm(true)}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50 shadow-sm"
                >
                  <XCircle size={18} />
                  Request Changes
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-col gap-3"
              >
                <label className="text-sm font-medium text-gray-700">Reason for changes</label>
                <textarea 
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Explain what needs to be fixed..."
                  className="w-full rounded-xl border border-gray-300 p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  disabled={isSubmitting}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowRejectForm(false)}
                    disabled={isSubmitting}
                    className="flex-1 py-2 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRequestChanges}
                    disabled={isSubmitting || !reason.trim()}
                    className="flex-1 py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 text-sm shadow-sm flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} />
                    Submit Request
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
