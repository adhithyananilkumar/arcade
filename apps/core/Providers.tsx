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


import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/infrastructure/state/queryClient';
import { Toaster } from 'sonner';
import { AuthInitializer } from '@/apps/core/components/AuthInitializer';


export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      {children}
      <Toaster position="top-right" richColors />

    </QueryClientProvider>
  );
}