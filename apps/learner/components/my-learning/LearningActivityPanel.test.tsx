import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LearningActivityPanel, formatMinutes } from './LearningActivityPanel';
// Imported through the domain barrel (deep imports are forbidden by the architecture lint rule);
// the mock below targets the underlying module, which the barrel re-exports, so the barrel hands
// back the mocked service.
import { ActivityService } from '@/domains/learning';

vi.mock('@/domains/learning/activity/api/activity.service', () => ({
  ActivityService: { getSummary: vi.fn(), getDailyActivity: vi.fn() },
}));

// framer-motion animates heights over time; the assertions here are about text and structure.
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...rest }: React.ComponentProps<'div'>) => <div {...rest}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

function renderPanel() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <LearningActivityPanel enabled />
    </QueryClientProvider>
  );
}

/** ISO date N days before today, matching the panel's own local-date window. */
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

describe('formatMinutes', () => {
  it('renders hours and minutes the way the brief asks for', () => {
    expect(formatMinutes(192)).toBe('3h 12m');
    expect(formatMinutes(42)).toBe('42m');
    expect(formatMinutes(120)).toBe('2h');
    expect(formatMinutes(0)).toBe('0m');
  });
});

describe('LearningActivityPanel — real duration', () => {
  beforeEach(() => vi.clearAllMocks());

  it('reads the canonical activity endpoint, never the retired time-activity one', async () => {
    vi.mocked(ActivityService.getDailyActivity).mockResolvedValue([]);
    renderPanel();
    await waitFor(() => expect(ActivityService.getDailyActivity).toHaveBeenCalled());
    // Bounded from/to, exactly two arguments — no unbounded fetch, no user id.
    expect(vi.mocked(ActivityService.getDailyActivity).mock.calls[0]).toHaveLength(2);
  });

  it('shows the range total as hours and minutes, summed from backend-provided per-day values', async () => {
    vi.mocked(ActivityService.getDailyActivity).mockResolvedValue([
      { date: daysAgo(4), activityCount: 1, intensity: 1, learningMinutes: 42 },
      { date: daysAgo(3), activityCount: 0, intensity: 0, learningMinutes: 18 },
      { date: daysAgo(2), activityCount: 2, intensity: 1, learningMinutes: 61 },
      { date: daysAgo(1), activityCount: 1, intensity: 1, learningMinutes: 35 },
      { date: daysAgo(0), activityCount: 1, intensity: 1, learningMinutes: 36 },
    ]);

    renderPanel();

    // 42 + 18 + 61 + 35 + 36 = 192 minutes = 3h 12m
    expect(await screen.findByText('3h 12m')).toBeInTheDocument();
    expect(screen.getByText('this week')).toBeInTheDocument();
  });

  it('keeps activity counts as a secondary signal alongside the duration', async () => {
    vi.mocked(ActivityService.getDailyActivity).mockResolvedValue([
      { date: daysAgo(1), activityCount: 3, intensity: 2, learningMinutes: 20 },
      { date: daysAgo(0), activityCount: 2, intensity: 1, learningMinutes: 10 },
    ]);

    renderPanel();

    expect(await screen.findByText('30m')).toBeInTheDocument();
    expect(screen.getByText(/5 learning actions/)).toBeInTheDocument();
  });

  it('never renders the old page-presence framing', async () => {
    vi.mocked(ActivityService.getDailyActivity).mockResolvedValue([
      { date: daysAgo(0), activityCount: 1, intensity: 1, learningMinutes: 30 },
    ]);
    renderPanel();
    await screen.findAllByText('30m');

    expect(screen.queryByText(/Hours\/Day/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Learning Time/i)).not.toBeInTheDocument();
    // The D2.5 "we can't measure time" caption must be gone now that we can.
    expect(screen.queryByText(/not tracked yet/i)).not.toBeInTheDocument();
  });

  it('states that idle and background time are excluded, so the number is not read as presence', async () => {
    vi.mocked(ActivityService.getDailyActivity).mockResolvedValue([]);
    renderPanel();
    expect(await screen.findByText(/Idle time and background tabs are not counted/i)).toBeInTheDocument();
  });

  it('renders an empty state rather than a confident 0h when there is no data at all', async () => {
    vi.mocked(ActivityService.getDailyActivity).mockResolvedValue([]);
    renderPanel();

    expect(await screen.findByText(/No activity recorded in this range/i)).toBeInTheDocument();
    expect(screen.queryByText('0m')).not.toBeInTheDocument();
  });

  it('treats a null learningMinutes as "not recorded", not as zero', async () => {
    vi.mocked(ActivityService.getDailyActivity).mockResolvedValue([
      // A day with a completion but no recorded duration — must not claim 0 minutes of learning.
      { date: daysAgo(0), activityCount: 2, intensity: 1, learningMinutes: null },
    ]);

    renderPanel();

    // The day still counts as active (it has actions), but contributes nothing to the total.
    expect(await screen.findAllByText('0m')).not.toHaveLength(0);
    expect(screen.getByText(/0 of 7 days with recorded time/)).toBeInTheDocument();
  });

  it('surfaces a load failure instead of rendering a fabricated zero', async () => {
    vi.mocked(ActivityService.getDailyActivity).mockRejectedValue(new Error('boom'));
    renderPanel();
    expect(
      await screen.findByText(/Your activity could not be loaded right now/i)
    ).toBeInTheDocument();
  });
});
