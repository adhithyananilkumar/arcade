'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { courseRoutes, eventRoutes, examRoutes } from '@/shared/routes/content.routes';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { ApiError } from '@/infrastructure/http/api';
import { EnrollmentService } from '../api/enrollment.service';
import { myEnrollmentKeys } from '../api/myEnrollments.queries';
import { ResourceType, UIEnrollmentState } from '../types/enrollment.types';
import { toast } from 'sonner';
import { ArrowRight, Loader2, LogOut } from 'lucide-react';
import { launchRazorpayCheckout } from '@/domains/payment';

/**
 * Turns a thrown enrollment failure into something worth reading.
 *
 * <p>Every failure here used to collapse into "Failed to enroll. Please try again." — advice that
 * is actively wrong for most of the cases it covered. A learner whose API server is down, whose
 * session expired, or who hit a server fault can retry forever without anything changing; what
 * they need is to know which of those it was. Server faults carry the backend's incident
 * reference through, so a bug report names the log line that explains it.
 */
function describeEnrollmentFailure(err: unknown, verb: 'enrol' | 'unenrol' = 'enrol'): string {
  const action = verb === 'enrol' ? 'enrol' : 'unenrol';

  if (err instanceof ApiError) {
    if (err.isNetworkError) return `Could not ${action}: ${err.message}`;
    if (err.status === 401) return 'Please log in first.';
    if (err.status === 403) return `You are not allowed to ${action} here.`;
    if (err.status === 404) return 'This resource no longer exists.';
    if (err.status === 409) return err.message;
    if (err.status === 429) return 'Too many attempts — please wait a moment and try again.';
    // 4xx below carry a backend-authored, user-safe message; 5xx were rewritten by the API client
    // to a generic line that already includes the incident reference.
    return err.message;
  }

  return `Could not ${action}. Please try again.`;
}

export interface EnrollmentButtonProps {
  resourceType: ResourceType;
  resourceId: string;
  initialState: UIEnrollmentState;
  /**
   * Why a PENDING enrollment is pending, when the caller knows. `PAYMENT` means a checkout is
   * settling and the learner has nothing to do; `REQUIREMENTS` means they or a reviewer must
   * act. Omitted falls back to the "action required" wording.
   */
  pendingReason?: 'PAYMENT' | 'REQUIREMENTS';
  className?: string;
  onStateChange?: (newState: UIEnrollmentState) => void;
  onGoToResource?: () => void;
  targetUrl?: string;
}

export function EnrollmentButton({
  resourceType,
  resourceId,
  initialState,
  pendingReason,
  className = '',
  onStateChange,
  onGoToResource,
  targetUrl
}: EnrollmentButtonProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [currentState, setCurrentState] = useState<UIEnrollmentState>(initialState);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingPaymentEnrollmentId, setPendingPaymentEnrollmentId] = useState<string | null>(null);
  const [isPaying, setIsPaying] = useState(false);

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

  /**
   * Any enrollment state transition invalidates the learner read model.
   *
   * `myEnrollmentKeys.all` (`['me','enrollments']`) is the shared *prefix* of the library list,
   * the per-resource "am I enrolled" lookup and the events list, so React Query's prefix matching
   * means this single invalidation refreshes all three — no separate per-key call needed. This is
   * what makes "enrol here, see it on My Learning" work without a full page reload; previously the
   * only way to refresh enrollment state was to refetch the whole `/users/me` profile.
   */
  const invalidateEnrollmentReads = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: myEnrollmentKeys.all });
  }, [queryClient]);

  const notifyStateChange = useCallback((newState: UIEnrollmentState) => {
    setCurrentState(newState);
    invalidateEnrollmentReads();
    if (onStateChange) {
      onStateChange(newState);
    }
  }, [onStateChange, invalidateEnrollmentReads]);

  const startPayment = useCallback(async (paymentEnrollmentId: string) => {
    if (isPaying) return;
    setIsPaying(true);
    setPendingPaymentEnrollmentId(paymentEnrollmentId);
    notifyStateChange('PENDING');

    await launchRazorpayCheckout(paymentEnrollmentId, crypto.randomUUID(), {
      onGranted: () => {
        setIsPaying(false);
        setPendingPaymentEnrollmentId(null);
        notifyStateChange('ENROLLED');
        toast.success('Payment successful — you are enrolled!');
      },
      onFailed: () => {
        setIsPaying(false);
        toast.error('Payment failed. No amount was deducted — you can try again.');
      },
      onExpired: () => {
        setIsPaying(false);
        toast.error('This checkout session expired. Please try again.');
      },
      onVerifying: () => {
        toast.info('Verifying your payment…');
      },
      onVerifyTimeout: () => {
        setIsPaying(false);
        toast.info('Still confirming your payment — check back in a moment.');
      },
      onDismissed: () => {
        setIsPaying(false);
      },
      onError: (message) => {
        setIsPaying(false);
        toast.error(message);
      },
    });
  }, [isPaying, notifyStateChange]);

  const handleEnroll = async () => {
    if (isProcessing) return;

    if (!user) {
      const returnTo = `${window.location.pathname}${window.location.search}`;
      router.push(`/sign?mode=login&returnTo=${encodeURIComponent(returnTo)}`);
      return;
    }

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
            startPayment(result.recordId);
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
          } else if (result.reasonCode === 'ENROLLMENT_PAYMENT_PENDING' && result.recordId) {
            // A prior enrollment attempt is still awaiting payment — resume that checkout
            // instead of ever treating an unpaid enrollment as granted access.
            startPayment(result.recordId);
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
    } catch (err: unknown) {
      console.error('Enrollment error:', err);
      toast.error(describeEnrollmentFailure(err));
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
    } catch (err: unknown) {
      console.error('Revoke error:', err);
      toast.error(describeEnrollmentFailure(err, 'unenrol'));
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
      router.push(courseRoutes.overview(resourceId));
    } else if (resourceType === 'EVENT') {
      // EVENT is canonical for all event-like content (workshop, webinar, bootcamp). The former
      // 'WORKSHOP' branch was dead: the backend enum has no such member and rejected the request.
      router.push(eventRoutes.overview(resourceId));
    } else if (resourceType === 'EXAM') {
      router.push(examRoutes.landing(resourceId));
    }
  };

  /**
   * Adopt a *stronger* server state when the parent re-renders with fresher data — this is what
   * makes the button survive a page reload mid-checkout instead of offering "Enroll Now" again.
   *
   * Deliberately one-way: local state is never downgraded back towards NOT_ENROLLED. Right after
   * a successful payment this component knows the learner is ENROLLED before the enrollment
   * query has refetched, and a naive sync would flip the button back and let them pay twice.
   */
  useEffect(() => {
    if (isProcessing || isPaying) return;
    const rank: Record<UIEnrollmentState, number> = {
      NOT_ENROLLED: 0,
      PENDING: 1,
      WAITLISTED: 1,
      ENROLLED: 2,
    };
    setCurrentState((prev) => (rank[initialState] > rank[prev] ? initialState : prev));
  }, [initialState, isProcessing, isPaying]);

  // Render logic based on explicit UI state
  if (currentState === 'ENROLLED') {
    const resourceLabel = resourceType === 'COURSE' ? 'Course' : resourceType === 'EXAM' ? 'Exam' : 'Event';
    return (
      <div className="flex items-center gap-2.5 w-full">
        <button
          onClick={handleGoToResource}
          className={`bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold py-3.5 px-7 rounded-full shadow-[0_4px_20px_rgba(16,185,129,0.25),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_6px_24px_rgba(16,185,129,0.35)] transition-all text-sm flex items-center justify-center gap-2 flex-1 ${className}`}>
          <span>Go to {resourceLabel}</span>
          <ArrowRight className="w-4 h-4 shrink-0 text-white" />
        </button>
        <button
          onClick={handleRevoke}
          disabled={isProcessing}
          className="bg-black/5 hover:bg-black/10 active:scale-[0.98] text-slate-700 hover:text-red-600 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15 backdrop-blur-md border border-black/10 dark:border-white/10 font-semibold py-3.5 px-5 rounded-full transition-all text-xs shrink-0 flex items-center gap-1.5 disabled:opacity-50"
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
          className={`bg-amber-500/15 text-amber-900 dark:text-amber-200 backdrop-blur-md font-bold py-3.5 px-6 rounded-full border border-amber-500/20 shadow-xs opacity-90 cursor-default flex-1 text-center text-sm ${className}`}>
          Waitlisted
        </button>
        <button
          onClick={handleRevoke}
          disabled={isProcessing}
          className="bg-black/5 hover:bg-black/10 active:scale-[0.98] text-slate-700 hover:text-red-600 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15 backdrop-blur-md border border-black/10 dark:border-white/10 font-semibold py-3.5 px-5 rounded-full transition-all text-xs shrink-0 disabled:opacity-50"
          title="Leave waitlist">
          Leave
        </button>
      </div>
    );
  }

  if (currentState === 'PENDING') {
    if (pendingPaymentEnrollmentId) {
      return (
        <button
          onClick={() => startPayment(pendingPaymentEnrollmentId)}
          disabled={isPaying}
          className={`bg-[#14161c] hover:bg-[#232733] active:scale-[0.98] text-white font-bold py-3.5 px-8 rounded-full shadow-[0_8px_25px_rgba(20,22,28,0.22),inset_0_1px_0_rgba(255,255,255,0.2)] border border-white/15 transition-all w-full text-sm flex items-center justify-center gap-2 disabled:opacity-70 ${className}`}>
          {isPaying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <span>Processing…</span>
            </>
          ) : (
            'Complete Payment'
          )}
        </button>
      );
    }
    // No payment handle in this component instance — the page was reloaded with a checkout still
    // open, or the enrollment is waiting on someone's approval. `pendingReason` tells them apart.
    if (pendingReason === 'PAYMENT') {
      return (
        <div className="flex items-center gap-2.5 w-full">
          <button
            onClick={handleEnroll}
            disabled={isProcessing}
            className={`bg-[#14161c] hover:bg-[#232733] active:scale-[0.98] text-white font-bold py-3.5 px-8 rounded-full shadow-[0_8px_25px_rgba(20,22,28,0.22),inset_0_1px_0_rgba(255,255,255,0.2)] border border-white/15 transition-all flex-1 text-sm flex items-center justify-center gap-2 disabled:opacity-70 ${className}`}>
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span>Opening checkout…</span>
              </>
            ) : (
              'Complete Payment'
            )}
          </button>
          <button
            onClick={handleRevoke}
            disabled={isProcessing}
            className="bg-black/5 hover:bg-black/10 active:scale-[0.98] text-slate-700 hover:text-red-600 dark:bg-white/10 dark:text-slate-300 dark:hover:bg-white/15 backdrop-blur-md border border-black/10 dark:border-white/10 font-semibold py-3.5 px-5 rounded-full transition-all text-xs shrink-0 disabled:opacity-50"
            title="Cancel this registration">
            Cancel
          </button>
        </div>
      );
    }
    return (
      <button
        disabled
        className={`bg-blue-500/15 text-blue-900 dark:text-blue-200 backdrop-blur-md font-bold py-3.5 px-6 rounded-full border border-blue-500/20 shadow-xs opacity-90 cursor-default w-full text-sm ${className}`}>
        Action required
      </button>
    );
  }

  // Default: NOT_ENROLLED
  return (
    <button
      onClick={handleEnroll}
      disabled={isProcessing}
      className={`bg-[#14161c] hover:bg-[#232733] active:scale-[0.98] text-white font-bold py-3.5 px-8 rounded-full shadow-[0_8px_25px_rgba(20,22,28,0.22),inset_0_1px_0_rgba(255,255,255,0.2)] border border-white/15 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed w-full text-sm ${className}`}>
      {isProcessing ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Enrolling...</span>
        </>
      ) : (
        <>
          <span>{resourceType === 'EXAM' ? 'Register' : 'Enroll Now'}</span>
          <ArrowRight className="w-4 h-4 shrink-0 text-white" />
        </>
      )}
    </button>
  );
}
