'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { EnrollmentService } from '../api/enrollment.service';
import { ResourceType, UIEnrollmentState } from '../types/enrollment.types';
import { toast } from 'sonner';
import { ArrowRight, Loader2, LogOut } from 'lucide-react';
import { PaymentModal } from '@/domains/payment';

export interface EnrollmentButtonProps {
  resourceType: ResourceType;
  resourceId: string;
  initialState: UIEnrollmentState;
  className?: string;
  onStateChange?: (newState: UIEnrollmentState) => void;
  onGoToResource?: () => void;
  targetUrl?: string;
}

export function EnrollmentButton({
  resourceType,
  resourceId,
  initialState,
  className = '',
  onStateChange,
  onGoToResource,
  targetUrl
}: EnrollmentButtonProps) {
  const router = useRouter();
  const [currentState, setCurrentState] = useState<UIEnrollmentState>(initialState);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingPaymentEnrollmentId, setPendingPaymentEnrollmentId] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Track idempotency key across component lifecycle for the same logical action
  const idempotencyKeyRef = useRef<string | null>(null);

  const getOrCreateIdempotencyKey = useCallback(() => {
    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current = crypto.randomUUID();
    }
    return idempotencyKeyRef.current;
  }, []);

  const resetIdempotencyKey = useCallback(() => {
    idempotencyKeyRef.current = null;
  }, []);

  const notifyStateChange = useCallback((newState: UIEnrollmentState) => {
    setCurrentState(newState);
    if (onStateChange) {
      onStateChange(newState);
    }
  }, [onStateChange]);

  const handleEnroll = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    const key = getOrCreateIdempotencyKey();

    try {
      const result = await EnrollmentService.enroll(resourceType, resourceId, key);
      
      switch (result.status) {
        case 'GRANTED':
          notifyStateChange('ENROLLED');
          toast.success('Successfully enrolled!');
          resetIdempotencyKey();
          break;
        case 'PENDING_ACTION':
          if (result.nextAction === 'WAITLIST') {
            notifyStateChange('WAITLISTED');
            toast.success('Added to waitlist');
          } else if (result.nextAction === 'REQUIRE_PAYMENT' && result.recordId) {
            notifyStateChange('PENDING');
            setPendingPaymentEnrollmentId(result.recordId);
            setShowPaymentModal(true);
          } else {
            notifyStateChange('PENDING');
            toast.info('Action required: ' + result.nextAction);
          }
          resetIdempotencyKey();
          break;
        case 'DENIED':
          if (result.reasonCode === 'ALREADY_ENROLLED') {
            notifyStateChange('ENROLLED');
            toast.info('You are already enrolled');
          } else if (result.reasonCode === 'CAPACITY_EXHAUSTED') {
            toast.error('The capacity for this resource is exhausted.');
          } else if (result.reasonCode === 'RESOURCE_NOT_PUBLISHED') {
            toast.error('This resource is unavailable.');
          } else if (result.reasonCode === 'ENROLLMENT_WINDOW_NOT_OPEN') {
            toast.error('Enrollment opens later.');
          } else if (result.reasonCode === 'ENROLLMENT_WINDOW_CLOSED') {
            toast.error('Enrollment is closed.');
          } else if (result.reasonCode === 'USER_NOT_ELIGIBLE') {
            toast.error('You are not eligible for this resource.');
          } else if (result.reasonCode === 'CHANNEL_SUSPENDED') {
            toast.error('Access unavailable.');
          } else if (result.reasonCode === 'PREREQUISITE_NOT_MET') {
            toast.error('Prerequisites not met.');
          } else {
            toast.error(result.message || 'Enrollment denied');
          }
          resetIdempotencyKey();
          break;
      }
    } catch (err: any) {
      console.error('Enrollment error:', err);
      if (err?.message?.includes('401')) {
        toast.error('Please log in to enroll.');
      } else {
        toast.error('Failed to enroll. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRevoke = async () => {
    if (isProcessing) return;
    
    if (!confirm('Are you sure you want to unenroll from this resource?')) {
      return;
    }

    setIsProcessing(true);
    try {
      await EnrollmentService.revoke(resourceType, resourceId);
      notifyStateChange('NOT_ENROLLED');
      toast.success('Successfully unenrolled');
      resetIdempotencyKey();
    } catch (err: any) {
      console.error('Revoke error:', err);
      toast.error('Failed to revoke enrollment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGoToResource = () => {
    if (onGoToResource) {
      onGoToResource();
      return;
    }
    if (targetUrl) {
      router.push(targetUrl);
      return;
    }
    if (resourceType === 'COURSE') {
      router.push(`/learn/${resourceId}`);
    } else if (resourceType === 'EVENT') {
      router.push(`/events/${resourceId}`);
    } else if (resourceType === 'WORKSHOP') {
      // Legacy compatibility — route to new Event page
      router.push(`/events/${resourceId}`);
    }
  };

  const paymentModal = (
    <PaymentModal
      open={showPaymentModal}
      enrollmentId={pendingPaymentEnrollmentId || ''}
      onClose={() => setShowPaymentModal(false)}
      onGranted={() => {
        setShowPaymentModal(false);
        setPendingPaymentEnrollmentId(null);
        notifyStateChange('ENROLLED');
      }}
    />
  );

  // Render logic based on explicit UI state
  if (currentState === 'ENROLLED') {
    const resourceLabel = resourceType === 'COURSE' ? 'Course' : 'Event';
    return (
      <div className="flex items-center gap-2.5 w-full">
        <button
          onClick={handleGoToResource}
          className={`bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold py-3 px-5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 flex-1 text-sm ${className}`}>
          <span>Go to {resourceLabel}</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </button>
        <button
          onClick={handleRevoke}
          disabled={isProcessing}
          className="bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 dark:bg-gray-800 dark:hover:bg-red-950/40 dark:text-gray-400 dark:hover:text-red-400 font-medium py-3 px-3.5 rounded-xl transition-colors border border-gray-200 dark:border-gray-700 disabled:opacity-50 text-xs shrink-0 flex items-center gap-1.5"
          title="Unenroll">
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Unenroll</span>
        </button>
      </div>
    );
  }

  if (currentState === 'WAITLISTED') {
    return (
      <div className="flex items-center gap-2.5 w-full">
        <button
          disabled
          className={`bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 font-semibold py-3 px-4 rounded-xl shadow-sm opacity-90 cursor-default border border-amber-200 dark:border-amber-700 flex-1 text-center text-sm ${className}`}>
          Waitlisted
        </button>
        <button
          onClick={handleRevoke}
          disabled={isProcessing}
          className="bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 dark:bg-gray-800 dark:hover:bg-red-950/40 dark:text-gray-400 dark:hover:text-red-400 font-medium py-3 px-3.5 rounded-xl transition-colors border border-gray-200 dark:border-gray-700 disabled:opacity-50 text-xs shrink-0"
          title="Leave waitlist">
          Leave
        </button>
      </div>
    );
  }

  if (currentState === 'PENDING') {
    if (pendingPaymentEnrollmentId) {
      return (
        <>
          <button
            onClick={() => setShowPaymentModal(true)}
            className={`bg-[#4c6fff] hover:bg-[#3d5ce0] active:scale-[0.98] text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition-all w-full text-sm ${className}`}>
            Complete Payment
          </button>
          {paymentModal}
        </>
      );
    }
    return (
      <button
        disabled
        className={`bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-semibold py-3 px-4 rounded-xl shadow-sm opacity-90 cursor-default border border-blue-200 dark:border-blue-800 w-full text-sm ${className}`}>
        Action required
      </button>
    );
  }

  // Default: NOT_ENROLLED
  return (
    <button
      onClick={handleEnroll}
      disabled={isProcessing}
      className={`bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold py-3 px-5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed w-full text-sm ${className}`}>
      {isProcessing ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Enrolling...</span>
        </>
      ) : (
        <>
          <span>Enroll Now</span>
          <ArrowRight className="w-4 h-4 shrink-0" />
        </>
      )}
    </button>
  );
}
