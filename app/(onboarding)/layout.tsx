import ProtectedLayout from '@/components/ProtectedLayout';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayout>
      <div className="flex min-h-screen w-full flex-col bg-slate-50">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </ProtectedLayout>
  );
}
