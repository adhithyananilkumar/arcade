import { AuthOrchestrator } from '@/apps/public/orchestrators/AuthOrchestrator';
import { AuthPageShell } from '@/apps/public/layout/AuthPageShell';
import { PebbleLoader } from '@/domains/identity/components/PebbleLoader';
import type { AuthView } from '@/domains/identity/components/AuthForm';
import { Suspense } from 'react';

function parseInitialMode(mode?: string): AuthView {
  if (mode === 'signup') return 'signup';
  if (mode === 'forgot') return 'forgot';
  if (mode === 'reset') return 'reset';
  if (mode === 'verify') return 'verify';
  return 'login';
}

export default async function SignPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const { mode } = await searchParams;
  const initialMode = parseInitialMode(mode);

  return (
    <AuthPageShell showLogo={true}>
      <Suspense
        fallback={
          <div className="flex justify-center py-16">
            <PebbleLoader label="Loading" size="sm" />
          </div>
        }
      >
        <AuthOrchestrator initialMode={initialMode} />
      </Suspense>
    </AuthPageShell>
  );
}
