import LearnerShell from '@/apps/learner/layout/LearnerShell';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LearnerShell>
      {children}
    </LearnerShell>
  );
}
