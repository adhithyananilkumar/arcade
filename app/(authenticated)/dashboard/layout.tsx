// app/(authenticated)/dashboard/layout.tsx
// Renders the dashboard shell.

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>{children}</>
  );
}
