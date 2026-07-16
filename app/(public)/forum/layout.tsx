'use client';

import { ForumLayout } from '@/features/forum/components/ForumLayout';
import { ForumLayoutProvider } from '@/features/forum/components/ForumLayoutContext';

export default function ForumGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ForumLayoutProvider>
      <ForumLayout>{children}</ForumLayout>
    </ForumLayoutProvider>
  );
}
