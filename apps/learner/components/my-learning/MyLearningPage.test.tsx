import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type {
  LearnerEnrollmentSummary,
  LearnerEventRegistration,
} from '@/domains/enrollment';
import { MyEnrollmentsService } from '@/domains/enrollment';
import { ActivityService } from '@/domains/learning';
import MyLearningPage from './MyLearningPage';

// The page must talk to the backend only through the domain service layer. Mocking the services
// (not `fetch`, and not a second HTTP client) is itself the assertion that no other transport is
// in play — anything bypassing these would blow up on a real network call in jsdom.
//
// These mock the service modules the query hooks actually import, so the real hooks, real query
// keys and real caching all run — only the HTTP boundary is replaced.
vi.mock('@/domains/enrollment/api/myEnrollments.service', () => ({
  MyEnrollmentsService: {
    list: vi.fn(),
    getForResource: vi.fn(),
    listEvents: vi.fn(),
  },
}));

vi.mock('@/domains/learning/activity/api/activity.service', () => ({
  ActivityService: { getSummary: vi.fn(), getDailyActivity: vi.fn() },
}));

vi.mock('@/infrastructure/auth/auth.store', () => ({
  useAuthStore: () => ({ user: { id: 'u1', fullName: 'Ada', email: 'a@b.c' }, status: 'authenticated' }),
}));

// TextType animates with gsap on a timer; irrelevant to what is under test here.
vi.mock('@/shared/design-system/ui/TextType/TextType', () => ({
  default: () => null,
}));

function page<T>(content: T[], over: Partial<Record<string, unknown>> = {}) {
  return {
    content,
    totalElements: content.length,
    totalPages: content.length === 0 ? 0 : 1,
    number: 0,
    size: 12,
    first: true,
    last: true,
    ...over,
  } as never;
}

function course(over: Partial<LearnerEnrollmentSummary> = {}): LearnerEnrollmentSummary {
  return {
    enrollmentId: 'enr-1',
    resourceType: 'COURSE',
    resourceId: 'course-1',
    title: 'Distributed Systems',
    slug: null,
    imageUrl: null,
    resourceStatus: 'PUBLISHED',
    enrollmentStatus: 'GRANTED',
    accessState: 'ACCESSIBLE',
    requiresPayment: false,
    denialReasonCode: null,
    progressState: 'IN_PROGRESS',
    progressPercent: 42,
    enrolledAt: '2026-08-01T10:00:00Z',
    grantedAt: '2026-08-01T10:00:00Z',
    startedAt: null,
    completedAt: null,
    ...over,
  };
}

function registration(over: Partial<LearnerEventRegistration> = {}): LearnerEventRegistration {
  return {
    enrollmentId: 'enr-e1',
    eventId: 'event-1',
    title: 'Kubernetes Bootcamp',
    slug: 'k8s-bootcamp',
    imageUrl: null,
    eventType: 'BOOTCAMP',
    eventStatus: 'PUBLISHED',
    deliveryMode: 'ONLINE',
    enrollmentStatus: 'GRANTED',
    registrationStatus: 'APPROVED',
    attendanceStatus: null,
    registeredAt: '2026-08-01T10:00:00Z',
    firstSessionStartsAt: '2026-09-01T09:00:00Z',
    lastSessionEndsAt: '2026-09-01T12:00:00Z',
    upcoming: true,
    ...over,
  };
}

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MyLearningPage />
    </QueryClientProvider>
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(ActivityService.getDailyActivity).mockResolvedValue([]);
  vi.mocked(MyEnrollmentsService.list).mockResolvedValue(page([]));
  vi.mocked(MyEnrollmentsService.listEvents).mockResolvedValue(page([]));
});

describe('MyLearningPage — data source', () => {
  it('reads the library from GET /me/enrollments, scoped to COURSE, with server-side paging', async () => {
    renderPage();
    await waitFor(() => expect(MyEnrollmentsService.list).toHaveBeenCalled());
    expect(MyEnrollmentsService.list).toHaveBeenCalledWith(
      expect.objectContaining({ resourceType: 'COURSE', page: 0, size: 12 })
    );
  });

  it('reads events from GET /me/events rather than inventing a second registration source', async () => {
    renderPage();
    await waitFor(() => expect(MyEnrollmentsService.listEvents).toHaveBeenCalled());
    expect(MyEnrollmentsService.listEvents).toHaveBeenCalledWith('UPCOMING', 0, 12);
  });

  it('issues a fixed number of requests regardless of library size — no per-card progress fetch', async () => {
    vi.mocked(MyEnrollmentsService.list).mockResolvedValue(
      page([
        course({ enrollmentId: 'a', resourceId: 'c-a' }),
        course({ enrollmentId: 'b', resourceId: 'c-b' }),
        course({ enrollmentId: 'c', resourceId: 'c-c' }),
      ])
    );
    renderPage();
    await screen.findAllByText('Distributed Systems');
    expect(MyEnrollmentsService.list).toHaveBeenCalledTimes(1);
    expect(MyEnrollmentsService.getForResource).not.toHaveBeenCalled();
  });
});

describe('MyLearningPage — states', () => {
  it('shows a loading skeleton before the library resolves, not an empty library', () => {
    vi.mocked(MyEnrollmentsService.list).mockReturnValue(new Promise(() => {}));
    const { container } = renderPage();
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0);
    expect(screen.queryByText(/Your library is empty/i)).not.toBeInTheDocument();
  });

  it('shows a real empty state — not a mock course card — for a learner with no enrollments', async () => {
    renderPage();
    expect(await screen.findByText(/Your library is empty/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Browse courses/i })).toBeInTheDocument();
  });

  it('shows an error state with a retry affordance when the library request fails', async () => {
    vi.mocked(MyEnrollmentsService.list).mockRejectedValue(new Error('boom'));
    renderPage();
    expect(await screen.findByText(/could not load this right now/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument();
  });
});

describe('MyLearningPage — course rendering', () => {
  it('renders a real backend percentage (on the card and the Continue panel)', async () => {
    vi.mocked(MyEnrollmentsService.list).mockResolvedValue(page([course({ progressPercent: 42 })]));
    renderPage();
    expect((await screen.findAllByText('42%')).length).toBeGreaterThan(0);
  });

  it('renders a genuine 0% as a 0% bar', async () => {
    vi.mocked(MyEnrollmentsService.list).mockResolvedValue(
      page([course({ progressPercent: 0, progressState: 'NOT_STARTED' })])
    );
    renderPage();
    expect(await screen.findByText('0%')).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });

  it('renders NO percentage — and no fabricated fallback — when the backend sends null', async () => {
    vi.mocked(MyEnrollmentsService.list).mockResolvedValue(
      page([course({ progressPercent: null, progressState: 'NOT_STARTED' })])
    );
    renderPage();
    expect(await screen.findByText(/No progress recorded/i)).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByText(/%$/)).not.toBeInTheDocument();
  });

  it('does not offer an open link for a payment-pending enrollment', async () => {
    vi.mocked(MyEnrollmentsService.list).mockResolvedValue(
      page([
        course({
          accessState: 'PENDING_REQUIREMENTS',
          enrollmentStatus: 'PENDING',
          requiresPayment: true,
        }),
      ])
    );
    renderPage();
    expect(await screen.findByText('Payment pending')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Continue|Start|Review/i })).not.toBeInTheDocument();
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });

  it('does not offer an open link for a revoked enrollment', async () => {
    vi.mocked(MyEnrollmentsService.list).mockResolvedValue(
      page([course({ accessState: 'REVOKED', enrollmentStatus: 'REVOKED' })])
    );
    renderPage();
    expect(await screen.findByText('Access revoked')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Continue/i })).not.toBeInTheDocument();
  });

  it('shows a completed course as completed', async () => {
    vi.mocked(MyEnrollmentsService.list).mockResolvedValue(
      page([course({ progressState: 'COMPLETED', progressPercent: 100, completedAt: '2026-08-10T00:00:00Z' })])
    );
    renderPage();
    expect(await screen.findByText('Completed')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Review' })).toHaveAttribute('href', '/learn/course-1');
  });
});

describe('MyLearningPage — events tab', () => {
  it('renders registered events with subtype, schedule and delivery mode, and no join credentials', async () => {
    vi.mocked(MyEnrollmentsService.listEvents).mockResolvedValue(page([registration()]));
    const { container } = renderPage();

    fireEvent.click(await screen.findByRole('tab', { name: /Events/i }));

    expect(await screen.findByText('Kubernetes Bootcamp')).toBeInTheDocument();
    expect(screen.getByText('Bootcamp')).toBeInTheDocument();
    expect(screen.getByText('Online')).toBeInTheDocument();
    expect(screen.getByText('Registered')).toBeInTheDocument();
    // A list surface must never carry a meeting link/passcode.
    expect(container.innerHTML).not.toMatch(/meetingUrl|passcode|meet\.|zoom\./i);
  });

  it('asks the server for PAST events instead of filtering upcoming/past in the browser', async () => {
    vi.mocked(MyEnrollmentsService.listEvents).mockResolvedValue(page([registration()]));
    renderPage();

    fireEvent.click(await screen.findByRole('tab', { name: /Events/i }));
    fireEvent.click(await screen.findByRole('button', { name: 'Past' }));

    await waitFor(() =>
      expect(MyEnrollmentsService.listEvents).toHaveBeenCalledWith('PAST', 0, 12)
    );
  });

  it('shows an honest empty state rather than a permanently blank tab', async () => {
    renderPage();
    fireEvent.click(await screen.findByRole('tab', { name: /Events/i }));
    expect(await screen.findByText(/No upcoming events/i)).toBeInTheDocument();
  });
});

describe('MyLearningPage — tabs and filters', () => {
  it('offers only Courses and Events — no Webinars/Workshops/Articles tabs with no backend source', async () => {
    renderPage();
    const tabs = await screen.findAllByRole('tab');
    expect(tabs.map((t) => t.textContent)).toHaveLength(2);
    expect(screen.queryByRole('tab', { name: /Webinars/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /Articles/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /Workshops/i })).not.toBeInTheDocument();
  });

  it('sends the sort choice to the backend rather than re-sorting a client-side array', async () => {
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'Recently updated' }));
    await waitFor(() =>
      expect(MyEnrollmentsService.list).toHaveBeenCalledWith(
        expect.objectContaining({ sort: 'updatedAt', direction: 'desc' })
      )
    );
  });

  it('requests full history from the backend when the learner asks for it', async () => {
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: 'All history' }));
    await waitFor(() =>
      expect(MyEnrollmentsService.list).toHaveBeenCalledWith(
        expect.objectContaining({ status: ['ALL'] })
      )
    );
  });

  it('pages through the library on the server, requesting the next page number', async () => {
    vi.mocked(MyEnrollmentsService.list).mockResolvedValue(
      page([course()], { totalPages: 3, totalElements: 30, last: false })
    );
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: /Next/i }));
    await waitFor(() =>
      expect(MyEnrollmentsService.list).toHaveBeenCalledWith(expect.objectContaining({ page: 1 }))
    );
  });
});

describe('MyLearningPage — removed fabrications', () => {
  it('does not render the fake learning-history log rows', async () => {
    renderPage();
    await screen.findByText(/Your library is empty/i);
    expect(screen.queryByText(/Intensive Fullstack Sprint/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Database Migration & API Security Module/i)).not.toBeInTheDocument();
  });

  it('does not offer a review/rating control, since no learner review API exists', async () => {
    vi.mocked(MyEnrollmentsService.list).mockResolvedValue(
      page([course({ progressState: 'COMPLETED', progressPercent: 100 })])
    );
    renderPage();
    await screen.findByText('Completed');
    expect(screen.queryByText(/Leave Rating|Edit Rating|Submit Review/i)).not.toBeInTheDocument();
  });

  it('labels the activity chart as activity, never as "Learning Time" in hours', async () => {
    renderPage();
    expect(await screen.findByText('Learning Activity')).toBeInTheDocument();
    expect(screen.queryByText(/Hours\/Day/i)).not.toBeInTheDocument();
  });

  it('marks the Learning Journey as unavailable rather than computing a fake level', async () => {
    renderPage();
    expect(await screen.findByText(/progression tracking is not available yet/i)).toBeInTheDocument();
    expect(screen.queryByText(/Complete 3 courses/i)).not.toBeInTheDocument();
  });
});
