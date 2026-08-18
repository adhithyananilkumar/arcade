import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EnrollmentButton } from './EnrollmentButton';
import { EnrollmentService } from '../api/enrollment.service';
import { myEnrollmentKeys } from '../api/myEnrollments.queries';

/**
 * The gap this closes: enrolling used to leave every cached view of the learner's enrollments
 * stale, because enrollment state lived on the `/users/me` profile payload. The only way to see a
 * new enrollment on My Learning was a full page reload.
 */

vi.mock('../api/enrollment.service', () => ({
  EnrollmentService: { enroll: vi.fn(), revoke: vi.fn() },
}));

vi.mock('@/domains/payment', () => ({ launchRazorpayCheckout: vi.fn() }));

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));

vi.mock('@/infrastructure/auth/auth.store', () => ({
  useAuthStore: () => ({ user: { id: 'u1', email: 'a@b.c', fullName: 'Ada' } }),
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}));

function renderButton(initialState: 'NOT_ENROLLED' | 'ENROLLED' = 'NOT_ENROLLED') {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const invalidateSpy = vi.spyOn(client, 'invalidateQueries');
  render(
    <QueryClientProvider client={client}>
      <EnrollmentButton resourceType="COURSE" resourceId="course-1" initialState={initialState} />
    </QueryClientProvider>
  );
  return { client, invalidateSpy };
}

beforeEach(() => vi.clearAllMocks());

describe('EnrollmentButton — enrollment read-model invalidation', () => {
  it('invalidates the enrollment read model after a granted enrollment', async () => {
    vi.mocked(EnrollmentService.enroll).mockResolvedValue({ status: 'GRANTED' });
    const { invalidateSpy } = renderButton();

    fireEvent.click(screen.getByRole('button', { name: /Enroll Now/i }));

    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: myEnrollmentKeys.all })
    );
  });

  it('invalidates under the shared root key, so the library, the per-resource lookup and the events list all refresh from one call', async () => {
    vi.mocked(EnrollmentService.enroll).mockResolvedValue({ status: 'GRANTED' });
    const { invalidateSpy } = renderButton();

    fireEvent.click(screen.getByRole('button', { name: /Enroll Now/i }));

    await waitFor(() => expect(invalidateSpy).toHaveBeenCalled());
    const key = invalidateSpy.mock.calls[0][0]?.queryKey as unknown[];
    // A prefix of every my-enrollment key => React Query's prefix matching covers all of them.
    expect(key).toEqual(['me', 'enrollments']);
    expect(myEnrollmentKeys.list({}).slice(0, key.length)).toEqual(key);
    expect(myEnrollmentKeys.resource('COURSE', 'course-1').slice(0, key.length)).toEqual(key);
    expect(myEnrollmentKeys.events('ALL', 0, 20).slice(0, key.length)).toEqual(key);
  });

  it('invalidates after an unenroll too, so a revoked course leaves the library immediately', async () => {
    vi.mocked(EnrollmentService.revoke).mockResolvedValue(undefined as never);
    vi.stubGlobal('confirm', () => true);
    const { invalidateSpy } = renderButton('ENROLLED');

    fireEvent.click(screen.getByRole('button', { name: /Unenroll/i }));

    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: myEnrollmentKeys.all })
    );
    vi.unstubAllGlobals();
  });

  it('does not invalidate when the enrollment attempt is denied outright', async () => {
    vi.mocked(EnrollmentService.enroll).mockResolvedValue({
      status: 'DENIED',
      reasonCode: 'CAPACITY_EXHAUSTED',
    });
    const { invalidateSpy } = renderButton();

    fireEvent.click(screen.getByRole('button', { name: /Enroll Now/i }));

    await waitFor(() => expect(EnrollmentService.enroll).toHaveBeenCalled());
    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
