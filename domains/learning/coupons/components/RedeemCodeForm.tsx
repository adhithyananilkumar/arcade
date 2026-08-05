'use client';

import { useState } from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/shared/design-system/ui/button';
import {
  CouponService,
  type DiscountPayload,
  type RedeemStatus,
} from '../api/coupon.service';

/**
 * Checkout / feature-gate entry. Renders solely from backend response status.
 */
export function RedeemCodeForm() {
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<RedeemStatus | 'idle' | 'loading'>('idle');
  const [discount, setDiscount] = useState<DiscountPayload | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus('loading');
    setErrorMessage('');
    try {
      const res = await CouponService.redeemCode(code.trim());
      setStatus(res.status);
      setDiscount(res.discount ?? null);
    } catch (err: unknown) {
      setStatus('invalid');
      setErrorMessage(err instanceof Error ? err.message : 'Redemption failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 shadow-xl shadow-indigo-100/50"
      >
        <h1 className="text-center text-2xl font-bold text-gray-900">Enter redemption code</h1>
        <p className="mt-2 text-center text-sm text-gray-500">
          Enter the 6-character code from the coupon scan screen.
        </p>

        {status === 'redeemed' && discount ? (
          <div className="mt-8 flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-emerald-50 p-4 text-emerald-500">
              <CheckCircle2 size={48} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Discount applied</h2>
            <p className="mt-2 text-sm text-gray-600">
              {discount.couponName}:{' '}
              {discount.type === 'PERCENT'
                ? `${discount.discountApplied}% off`
                : `${discount.currency} ${discount.discountApplied} off`}
            </p>
          </div>
        ) : status === 'expired' ||
          status === 'already_used' ||
          status === 'used' ||
          status === 'invalid' ? (
          <div className="mt-8 flex flex-col items-center text-center">
            <div className="mb-4 rounded-full bg-red-50 p-4 text-red-500">
              <XCircle size={48} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {status === 'expired'
                ? 'Code expired'
                : status === 'already_used' || status === 'used'
                  ? 'Code already used'
                  : 'Invalid code'}
            </h2>
            {errorMessage ? (
              <p className="mt-2 text-sm text-gray-500">{errorMessage}</p>
            ) : null}
            <Button
              type="button"
              variant="outline"
              className="mt-6"
              onClick={() => {
                setStatus('idle');
                setCode('');
              }}
            >
              Try another code
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.slice(0, 6))}
              maxLength={6}
              autoComplete="off"
              spellCheck={false}
              placeholder="ABC123"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-center font-mono text-2xl tracking-[0.3em] uppercase outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              disabled={submitting}
            />
            <Button type="submit" className="w-full" disabled={submitting || code.length !== 6}>
              {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Apply code'}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
