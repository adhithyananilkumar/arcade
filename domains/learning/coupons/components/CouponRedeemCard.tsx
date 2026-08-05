'use client';

import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import type { RedeemSessionResponse } from '../api/coupon.service';
import { CouponTicket, formatOfferValue } from './CouponTicket';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

/**
 * Public scan-landing view. Renders solely from backend `status` (+ offer payload).
 * When valid, reveals the discount on a ticket card with the redemption code.
 */
export function CouponRedeemCard({
  loading,
  data,
}: {
  loading: boolean;
  data: RedeemSessionResponse | null;
}) {
  if (loading || !data) {
    return (
      <StatusShell>
        <div className="mb-4 rounded-full bg-sky-50 p-4 text-[#00BAF2]">
          <Loader2 className="animate-spin" size={32} />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Opening your offer…</h2>
        <p className="mt-2 text-sm text-gray-500">Loading coupon details from the server.</p>
      </StatusShell>
    );
  }

  if (data.status === 'valid' && data.discount) {
    const d = data.discount;
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-6 px-4 py-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <CouponTicket
            title={d.couponName}
            code={d.couponCode}
            tags={[d.type, d.currency]}
            subtitle={d.description || 'Exclusive arcade offer'}
            offerLabel="Your offer"
            offerValue={formatOfferValue(d.type, d.value, d.currency)}
            secondaryLabel="Redemption code"
            secondaryValue={data.redemptionCode ?? d.couponCode}
            referenceId={data.redemptionCode ?? '—'}
            scanHint="OFFER UNLOCKED"
            footerLeft="Show this code at checkout to apply your discount."
          />
        </motion.div>
        {data.expiresAt ? <CountdownDisplay expiresAt={data.expiresAt} /> : null}
        <p className="text-center text-sm text-slate-500">
          Enter this code at checkout, or share it with the cashier.
        </p>
      </div>
    );
  }

  if (data.status === 'expired') {
    return (
      <StatusShell>
        <IconWrap tone="red">
          <Clock size={48} />
        </IconWrap>
        <h2 className="text-2xl font-bold text-gray-900">This link has expired</h2>
        <p className="mt-2 text-sm text-gray-500">Scan the coupon QR again to get a new offer link.</p>
      </StatusShell>
    );
  }

  if (data.status === 'used' || data.status === 'already_used') {
    return (
      <StatusShell>
        <IconWrap tone="amber">
          <CheckCircle2 size={48} />
        </IconWrap>
        <h2 className="text-2xl font-bold text-gray-900">This coupon was already used</h2>
        <p className="mt-2 text-sm text-gray-500">Each coupon can only be redeemed once.</p>
      </StatusShell>
    );
  }

  return (
    <StatusShell>
      <IconWrap tone="red">
        <XCircle size={48} />
      </IconWrap>
      <h2 className="text-2xl font-bold text-gray-900">Invalid link</h2>
      <p className="mt-2 text-sm text-gray-500">This offer link is not valid.</p>
    </StatusShell>
  );
}

function CountdownDisplay({ expiresAt }: { expiresAt: string }) {
  const [label, setLabel] = useState(() => formatRemaining(expiresAt));

  useEffect(() => {
    const id = setInterval(() => setLabel(formatRemaining(expiresAt)), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-gray-600 shadow-sm">
      <Clock size={16} className="text-[#00BAF2]" />
      Link expires in {label}
    </p>
  );
}

/** Display helper only — does not decide redemption validity. */
function formatRemaining(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (Number.isNaN(ms) || ms <= 0) return '0:00';
  const totalSec = Math.floor(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function StatusShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-xl shadow-sky-100/50"
      >
        <div className="flex flex-col items-center">{children}</div>
      </motion.div>
    </div>
  );
}

function IconWrap({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: 'red' | 'amber';
}) {
  const cls = tone === 'red' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500';
  return <div className={`mb-4 rounded-full p-4 ${cls}`}>{children}</div>;
}

/** Resolve backend-relative QR URLs for <img src>. */
export function resolveQrUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}
