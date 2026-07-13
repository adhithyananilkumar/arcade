// app/(authenticated)/dashboard/layout.tsx
// Intentionally minimal — the auth team replaces this with the full nav/sidebar shell.
// Our pages never 404 during parallel development.

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {children}
    </div>
  );
}
