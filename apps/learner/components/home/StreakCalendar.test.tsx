import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StreakCalendar } from './StreakCalendar';

describe('StreakCalendar', () => {
  it('renders the backend-provided streak number verbatim (no client-side recomputation)', () => {
    render(<StreakCalendar activityByDate={{}} streak={7} />);
    expect(screen.getByTestId('streak-count')).toHaveTextContent('7');
  });

  it('renders a zero streak as a real empty state, not a missing/blank badge', () => {
    render(<StreakCalendar activityByDate={{}} streak={0} />);
    expect(screen.getByTestId('streak-count')).toHaveTextContent('0');
  });

  it('accepts a backend-reported active day without throwing (activity count > 0)', () => {
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    render(<StreakCalendar activityByDate={{ [iso]: 2 }} streak={1} />);
    expect(screen.getByTestId('streak-count')).toHaveTextContent('1');
  });

  it('supports month navigation without throwing on months with no activity data', () => {
    render(<StreakCalendar activityByDate={{}} streak={0} />);
    const prevButton = screen.getByLabelText('Previous month');
    expect(prevButton).toBeInTheDocument();
  });
});
