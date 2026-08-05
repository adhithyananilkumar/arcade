'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Download, Loader2, QrCode } from 'lucide-react';
import { CouponService, type UserCouponDto } from '@/domains/learning/coupons/api/coupon.service';
import {
  CouponTicket,
  formatOfferValue,
} from '@/domains/learning/coupons/components/CouponTicket';
import { resolveQrUrl } from '@/domains/learning/coupons/components/CouponRedeemCard';
import { useAuthStore } from '@/infrastructure/auth/auth.store';
import { AuthorizationService } from '@/infrastructure/auth/authorization.service';

export default function IssuedCouponTicketPage({
  params,
}: {
  params: Promise<{ userCouponId: string }>;
}) {
  const { userCouponId } = use(params);
  const router = useRouter();
  const { user, status } = useAuthStore();
  const [coupon, setCoupon] = useState<UserCouponDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const allowed =
    AuthorizationService.canManageChannels(user) ||
    AuthorizationService.canManageSettings(user) ||
    AuthorizationService.canReviewContent(user) ||
    AuthorizationService.canAccessConsole(user);

  const load = async () => {
    try {
      setLoading(true);
      setCoupon(await CouponService.getUserCoupon(userCouponId));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load coupon');
      setCoupon(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && allowed) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userCouponId, status]);

  if (status === 'loading' || !user) {
    return <div className="text-sm text-slate-500">Loading…</div>;
  }

  if (!allowed) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        You do not have permission to view this coupon.
      </div>
    );
  }

  const generateQr = async () => {
    try {
      setBusy(true);
      await CouponService.generateQr(userCouponId);
      toast.success('QR code generated');
      await load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate QR');
    } finally {
      setBusy(false);
    }
  };

  const downloadQr = async () => {
    try {
      setBusy(true);
      await CouponService.downloadQr(userCouponId);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center gap-2 text-sm text-slate-500">
        <Loader2 className="animate-spin" size={18} /> Loading ticket…
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        Coupon not found.
      </div>
    );
  }

  const qrUrl = resolveQrUrl(coupon.qrImageUrl);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <button
        type="button"
        onClick={() => router.push('/console/coupons')}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-[#14142b]"
      >
        <ArrowLeft size={16} /> Back to templates
      </button>

      <div className="text-center">
        <h1 className="text-xl font-bold text-[#14142b]">Coupon ticket</h1>
        <p className="mt-1 text-sm text-slate-500">
          Scan the QR to open the offer link and reveal the discount.
        </p>
      </div>

      <CouponTicket
        title={coupon.couponName}
        code={coupon.couponCode}
        tags={[coupon.discountType, coupon.currency, coupon.status]}
        subtitle="Scan QR code to redeem this offer"
        offerLabel="Discount"
        offerValue={formatOfferValue(
          coupon.discountType,
          coupon.discountValue,
          coupon.currency,
        )}
        secondaryLabel="Code"
        secondaryValue={coupon.couponCode}
        referenceId={coupon.id.slice(0, 8).toUpperCase()}
        qrImageUrl={qrUrl}
        scanHint="SCAN QR CODE TO REDEEM"
      />

      <div className="flex flex-wrap justify-center gap-2">
        {!coupon.qrImageUrl && coupon.status === 'ISSUED' ? (
          <button
            type="button"
            disabled={busy}
            onClick={generateQr}
            className="inline-flex items-center gap-2 rounded-lg bg-[#14142b] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#232735] disabled:opacity-50"
          >
            {busy ? <Loader2 className="animate-spin" size={18} /> : <QrCode size={16} />}
            Generate QR
          </button>
        ) : null}
        {coupon.qrImageUrl ? (
          <button
            type="button"
            disabled={busy}
            onClick={downloadQr}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-[#14142b] hover:bg-slate-50 disabled:opacity-50"
          >
            {busy ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
            Download PNG
          </button>
        ) : null}
      </div>
    </div>
  );
}
