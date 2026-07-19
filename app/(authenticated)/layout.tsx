'use client';

import ProtectedLayout from '@/components/ProtectedLayout';
import DashboardNavbar from '@/components/layout/DashboardNavbar';
import TimeTracker from '@/components/TimeTracker';
import { useThemeStore } from '@/store/theme.store';
import { useEffect, useState } from 'react';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // or a loading spinner
  }

  return (
    <ProtectedLayout>
      <TimeTracker />
      <div className={`relative flex flex-col flex-1 w-full transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''}`} style={{ fontFamily: 'var(--font-geist-sans)' }}>
        {/* Main Content Area */}
        <div className="flex flex-col flex-1 relative z-10 bg-white dark:bg-black text-slate-900 dark:text-white">
          <DashboardNavbar />
          <main className="relative bg-transparent flex flex-col flex-1">
            {children}
          </main>
        </div>
      </div>
    </ProtectedLayout>
  );
}
