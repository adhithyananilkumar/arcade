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
      <div className={`relative flex h-screen w-full overflow-hidden bg-background text-foreground transition-colors duration-300 ${theme === 'dark' ? 'dark' : ''}`} style={{ fontFamily: 'var(--font-geist-sans)' }}>
        {/* Main Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden relative z-10 bg-transparent">
          <DashboardNavbar />
          <main className="flex-1 overflow-y-auto p-6 md:p-8 relative bg-transparent">
            {children}
          </main>
        </div>
      </div>
    </ProtectedLayout>
  );
}
