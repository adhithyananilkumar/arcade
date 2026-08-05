'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { CouponService, type UserCouponDto } from '@/domains/learning/coupons/api/coupon.service';
import { UserCouponDetail } from '@/domains/learning/coupons/components/UserCouponDetail';

export function MyCouponsOrchestrator() {
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState<UserCouponDto[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await CouponService.listMine();
        if (!cancelled) setCoupons(list);
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load coupons');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="animate-spin text-indigo-500" size={36} />
      </div>
    );
  }

  if (error) {
    return <p className="p-8 text-center text-red-600">{error}</p>;
  }

  if (coupons.length === 0) {
    return <p className="p-8 text-center text-gray-500">You have no coupons yet.</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My coupons</h1>
      {coupons.map((c) => (
        <UserCouponDetail key={c.id} coupon={c} />
      ))}
    </div>
  );
}
