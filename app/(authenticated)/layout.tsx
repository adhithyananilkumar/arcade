import LearnerShell from '@/apps/learner/layout/LearnerShell';
import { StaffOnboardingModal } from './components/StaffOnboardingModal';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LearnerShell>
      {children}
      <StaffOnboardingModal />
    </LearnerShell>
  );
}
