'use client';

/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: Apps
 * App: Core
 *
 * Purpose:
 * Wraps the application in necessary global contexts (React Query, Theme, etc).
 *
 * Rules:
 * - Keep as minimal as possible.
 * - Do not place business logic here.
 * - See docs/architecture/ADR-001-frontend-architecture.md
 * ------------------------------------------------------------------
 */


import { Suspense } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/infrastructure/state/queryClient';
import { Toaster } from '@/shared/design-system/ui/sonner';
import { AuthInitializer } from '@/apps/core/components/AuthInitializer';
import { AppearanceController } from '@/apps/core/components/AppearanceController';
import { NavigationTracker } from '@/infrastructure/state/navigationHistory';
import { NavigationProgress } from '@/apps/core/components/NavigationProgress';
import { ConnectivityGate } from '@/apps/core/components/ConnectivityGate';
import { BugIsland } from '@/apps/core/components/bug-reports/BugIsland';


export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      <AppearanceController />
      {/* useSearchParams needs a Suspense boundary to keep static pages static. */}
      <Suspense fallback={null}>
        <NavigationTracker />
        <NavigationProgress />
      </Suspense>
      {children}
      <Toaster />
      <ConnectivityGate />
      <BugIsland />
    </QueryClientProvider>
  );
}