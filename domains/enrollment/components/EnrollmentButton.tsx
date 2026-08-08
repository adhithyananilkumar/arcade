'use client';

import React, { useState, useCallback, useRef } from 'react';
import { EnrollmentService } from '../api/enrollment.service';
import { ResourceType, UIEnrollmentState } from '../types/enrollment.types';
import { toast } from 'sonner';

interface EnrollmentButtonProps {
  resourceType: ResourceType;
  resourceId: string;
  initialState: UIEnrollmentState;
  className?: string;
  onStateChange?: (newState: UIEnrollmentState) => void;
}

export function EnrollmentButton({
  resourceType,
  resourceId,
  initialState,
  className = '',
  onStateChange
}: EnrollmentButtonProps) {
  const [currentState, setCurrentState] = useState<UIEnrollmentState>(initialState);
  const [isProcessing, setIsProcessing] = useState(false);
  
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
          resetIdempotencyKey(); // Action succeeded, reset for future distinct actions
          break;
        case 'PENDING_ACTION':
          if (result.nextAction === 'WAITLIST') {
            notifyStateChange('WAITLISTED');
            toast.success('Added to waitlist');
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
          // Do not reset idempotency key on denial/failure unless we want retries to hit a new logical action.
          // Since it's a hard denial based on state, reusing it is fine or resetting is fine. Let's reset so they can retry if state changes.
          resetIdempotencyKey();
          break;
      }
    } catch (err: any) {
      console.error('Enrollment error:', err);
      // Network error or 500, we DO NOT reset idempotency key so retry uses same key
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
    
    if (!confirm('Are you sure you want to drop this?')) {
      return;
    }

    setIsProcessing(true);
    try {
      await EnrollmentService.revoke(resourceType, resourceId);
      notifyStateChange('NOT_ENROLLED');
      toast.success('Successfully dropped');
      resetIdempotencyKey();
    } catch (err: any) {
      console.error('Revoke error:', err);
      toast.error('Failed to revoke enrollment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Render logic based on explicit UI state
  if (currentState === 'ENROLLED') {
    return (
      <div className="flex gap-2">
        <button 
          disabled
          className={`bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-semibold py-3 px-4 rounded-lg shadow-sm opacity-90 cursor-default border border-emerald-200 dark:border-emerald-800 flex-1 text-center ${className}`}>
          Enrolled / Continue
        </button>
        <button 
          onClick={handleRevoke}
          disabled={isProcessing}
          className="bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 dark:bg-gray-800 dark:hover:bg-red-900/20 dark:text-gray-400 dark:hover:text-red-400 font-medium py-3 px-4 rounded-lg transition-colors border border-gray-200 dark:border-gray-700 disabled:opacity-50"
          title="Drop this resource">
          Unenroll
        </button>
      </div>
    );
  }

  if (currentState === 'WAITLISTED') {
    return (
      <div className="flex gap-2">
        <button 
          disabled
          className={`bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-semibold py-3 px-4 rounded-lg shadow-sm opacity-90 cursor-default border border-amber-200 dark:border-amber-800 flex-1 text-center ${className}`}>
          Waitlisted
        </button>
        <button 
          onClick={handleRevoke}
          disabled={isProcessing}
          className="bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 dark:bg-gray-800 dark:hover:bg-red-900/20 dark:text-gray-400 dark:hover:text-red-400 font-medium py-3 px-4 rounded-lg transition-colors border border-gray-200 dark:border-gray-700 disabled:opacity-50"
          title="Leave waitlist">
          Drop
        </button>
      </div>
    );
  }

  if (currentState === 'PENDING') {
    return (
      <button 
        disabled
        className={`bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 font-semibold py-3 px-4 rounded-lg shadow-sm opacity-90 cursor-default border border-blue-100 dark:border-blue-800 w-full ${className}`}>
        Action required
      </button>
    );
  }

  // Default: NOT_ENROLLED
  return (
    <button 
      onClick={handleEnroll}
      disabled={isProcessing}
      className={`bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed w-full ${className}`}>
      {isProcessing && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
      {isProcessing ? 'Processing...' : 'Enroll Now'}
    </button>
  );
}
