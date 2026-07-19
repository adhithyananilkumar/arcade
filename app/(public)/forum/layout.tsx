'use client';

import { ForumLayout } from "@/apps/public/layout/ForumLayout";
import { ForumLayoutProvider } from "@/apps/public/layout/ForumLayoutContext";

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
