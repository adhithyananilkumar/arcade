'use client';

import { useEffect } from 'react';

export default function TimeTracker() {
  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;

    // Simulate the 1 hour the user already waited if this is the first time running today
    const todayISO = new Date().toISOString().split('T')[0];
    const key = `time_spent_${todayISO}`;
    if (!localStorage.getItem(key)) {
      // 3600 seconds = 60 minutes (1 hour)
      localStorage.setItem(key, '3600');
    }

    const interval = setInterval(() => {
      const today = new Date().toISOString().split('T')[0];
      const todayKey = `time_spent_${today}`;
      const currentSeconds = parseInt(localStorage.getItem(todayKey) || '0', 10);
      
      // Increment by 10 seconds
      localStorage.setItem(todayKey, (currentSeconds + 10).toString());
      
      // Dispatch event so profile page can update dynamically
      window.dispatchEvent(new Event('timeTrackerUpdated'));
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  return null;
}
