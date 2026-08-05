'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CouponService,
  type RedeemSessionResponse,
} from '@/domains/learning/coupons/api/coupon.service';
import { CouponRedeemCard } from '@/domains/learning/coupons/components/CouponRedeemCard';

export function CouponRedeemOrchestrator({ sessionToken }: { sessionToken: string }) {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<RedeemSessionResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // Backend redirected here with ?reason= when scan failed
      if (sessionToken === 'invalid') {
        const reason = searchParams.get('reason');
        const status =
          reason === 'already_used' ? 'already_used' : reason === 'expired' ? 'expired' : 'invalid';
        if (!cancelled) {
          setData({ status });
          setLoading(false);
        }
        return;
      }

      try {
        const res = await CouponService.getSession(sessionToken);
        if (!cancelled) setData(res);
      } catch {
        if (!cancelled) setData({ status: 'invalid' });
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [sessionToken, searchParams]);

  return <CouponRedeemCard loading={loading} data={data} />;
}
