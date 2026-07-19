'use client';

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
