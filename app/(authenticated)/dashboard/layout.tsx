// app/(authenticated)/dashboard/layout.tsx
// Gates the dashboard + editor behind a valid session, then renders the shell.

import { AuthGuard } from "@/components/AuthGuard";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 flex flex-col">{children}</div>
    </AuthGuard>
  );
}
