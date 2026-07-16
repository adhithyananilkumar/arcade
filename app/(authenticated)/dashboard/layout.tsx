// app/(authenticated)/dashboard/layout.tsx
// Renders the dashboard shell.

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">{children}</div>
  );
}
