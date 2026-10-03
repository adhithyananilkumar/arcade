import LearnerShell from '@/apps/learner/layout/LearnerShell';
import { StaffOnboardingModal } from './components/StaffOnboardingModal';
import { ThemeScope } from '@/apps/core/components/ThemeScope';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Outside the shell on purpose: ProtectedLayout holds its children back until mount. */}
      <ThemeScope />
      <LearnerShell>
        {children}
        <StaffOnboardingModal />
      </LearnerShell>
    </>
  );
}
