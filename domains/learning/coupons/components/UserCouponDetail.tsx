'use client';

import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/shared/design-system/ui/button';
import { useState } from 'react';
import { CouponService, type UserCouponDto } from '../api/coupon.service';

/** Coupon detail — Download QR only triggers backend PNG download; no QR generation UI. */
export function UserCouponDetail({ coupon }: { coupon: UserCouponDto }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  const onDownload = async () => {
    setDownloading(true);
    setError('');
    try {
      await CouponService.downloadQr(coupon.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{coupon.couponName}</h2>
          <p className="mt-1 font-mono text-sm text-gray-500">{coupon.couponCode}</p>
          <p className="mt-3 text-sm text-gray-600">
            {coupon.discountType === 'PERCENT'
              ? `${coupon.discountValue}% off`
              : `${coupon.currency} ${coupon.discountValue} off`}
          </p>
          <p className="mt-2 text-xs uppercase tracking-wide text-gray-400">
            Status: {coupon.status}
          </p>
        </div>
        <Button
          type="button"
          onClick={onDownload}
          disabled={downloading || !coupon.qrImageUrl || coupon.status !== 'ISSUED'}
        >
          {downloading ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Download size={16} />
          )}
          <span className="ml-2">Download QR</span>
        </Button>
      </div>
      {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      {!coupon.qrImageUrl && coupon.status === 'ISSUED' ? (
        <p className="mt-3 text-sm text-amber-600">QR not generated yet. Ask an admin to generate it.</p>
      ) : null}
    </div>
  );
}
