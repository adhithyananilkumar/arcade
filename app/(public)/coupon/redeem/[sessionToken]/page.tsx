import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { CouponRedeemOrchestrator } from '@/apps/public/orchestrators/CouponRedeemOrchestrator';

export default async function CouponRedeemPage({
  params,
}: {
  params: Promise<{ sessionToken: string }>;
}) {
  const { sessionToken } = await params;

  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="animate-spin text-indigo-500" size={40} />
        </div>
      }
    >
      <CouponRedeemOrchestrator sessionToken={sessionToken} />
    </Suspense>
  );
}
