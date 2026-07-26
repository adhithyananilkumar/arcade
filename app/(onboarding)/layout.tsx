import ProtectedLayout from '@/apps/core/layout/ProtectedLayout';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout>
      <div className="min-h-screen w-full">{children}</div>
    </ProtectedLayout>
  );
}
