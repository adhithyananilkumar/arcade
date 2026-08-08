import { AuthOrchestrator } from '@/apps/public/orchestrators/AuthOrchestrator';
import { AuthPageShell } from '@/apps/public/layout/AuthPageShell';
import { PebbleLoader } from '@/domains/identity/components/PebbleLoader';
import { Suspense } from 'react';

export default function SignupPage() {
  return (
    <AuthPageShell>
      <Suspense
        fallback={
          <div className="flex justify-center py-16">
            <PebbleLoader label="Loading" size="sm" />
          </div>
        }
      >
        <AuthOrchestrator initialMode="signup" />
      </Suspense>
    </AuthPageShell>
  );
}
