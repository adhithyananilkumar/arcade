'use client';

import ProtectedLayout from '@/apps/core/layout/ProtectedLayout';
import DashboardNavbar from '@/apps/learner/layout/DashboardNavbar';
import DashboardDock from '@/apps/learner/layout/DashboardDock';
import { TimeTracker } from "@/domains/learning";
import { useThemeStore } from '@/infrastructure/state/theme.store';
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
          <main className="relative bg-transparent flex flex-col flex-1 pb-28">
            {children}
          </main>
          <DashboardDock />
        </div>
      </div>
    </ProtectedLayout>
  );
}
