import { Suspense } from 'react';
import CalendarClient from './components/CalendarClient';
import { Skeleton } from '@/shared/design-system/ui/skeleton';

export const metadata = {
  title: 'Calendar | Arcade',
  description: 'Stay organized and make progress, one day at a time.',
};

export default function CalendarPage() {
  return (
    <div className="flex h-screen w-full flex-col p-4 pt-24 md:p-6 md:pt-28 lg:p-8 lg:pt-32 overflow-hidden">
      <Suspense fallback={
        <div className="flex h-full w-full items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      }>
        <CalendarClient />
      </Suspense>
    </div>
  );
}
