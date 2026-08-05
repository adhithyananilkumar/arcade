'use client';

import { MapPin } from 'lucide-react';

export type CouponTicketProps = {
  title: string;
  code: string;
  /** Short tags under the title, e.g. PERCENT / USD */
  tags?: string[];
  /** Subtitle under tags (description or location-style line) */
  subtitle?: string | null;
  /** Primary offer line shown in the details area */
  offerLabel: string;
  offerValue: string;
  secondaryLabel?: string;
  secondaryValue?: string;
  /** Booking / reference id */
  referenceId: string;
  /** Absolute or relative URL to the QR PNG (backend-generated) */
  qrImageUrl?: string | null;
  /** Shown on the perforated divider */
  scanHint?: string;
  footerLeft?: string;
  /** Thumbnail / brand letter in the top-right */
  thumbLabel?: string;
  className?: string;
};

/**
 * Paytm-style perforated ticket card. Purely presentational — all values come from props
 * (backend / parent). Does not generate QR codes.
 */
export function CouponTicket({
  title,
  code,
  tags = [],
  subtitle,
  offerLabel,
  offerValue,
  secondaryLabel = 'Code',
  secondaryValue,
  referenceId,
  qrImageUrl,
  scanHint = 'SCAN QR CODE TO REDEEM',
  footerLeft = 'Your destination for exclusive offers!',
  thumbLabel,
  className = '',
}: CouponTicketProps) {
  const initial = (thumbLabel || title || 'A').charAt(0).toUpperCase();

  return (
    <div
      className={`mx-auto w-full max-w-[420px] overflow-hidden rounded-2xl border-[3px] border-[#00BAF2] bg-white shadow-[0_12px_40px_rgba(0,186,242,0.18)] ${className}`}
    >
      {/* Header */}
      <div className="flex gap-3 px-5 pb-4 pt-5">
        <div className="min-w-0 flex-1">
          <h2 className="text-[22px] font-extrabold leading-tight tracking-tight text-neutral-900">
            {title}
          </h2>
          {tags.length > 0 ? (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-neutral-200 px-2 py-0.5 text-[11px] font-medium text-neutral-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          {subtitle ? (
            <p className="mt-2.5 flex items-start gap-1 text-[12px] text-neutral-500">
              <MapPin size={13} className="mt-0.5 shrink-0 text-neutral-400" />
              <span className="leading-snug">{subtitle}</span>
            </p>
          ) : null}
        </div>
        <div className="flex size-[72px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-[#00BAF2] to-[#0077B6] text-2xl font-black text-white shadow-inner">
          {initial}
        </div>
      </div>

      {/* Perforation */}
      <div className="relative my-1 flex items-center">
        <span className="absolute -left-[10px] size-5 rounded-full border-[3px] border-[#00BAF2] bg-[#F7F9FC]" />
        <span className="absolute -right-[10px] size-5 rounded-full border-[3px] border-[#00BAF2] bg-[#F7F9FC]" />
        <div className="mx-4 flex-1 border-t border-dashed border-neutral-300" />
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-[10px] font-bold tracking-[0.12em] text-neutral-400">
          {scanHint}
        </span>
      </div>

      {/* Body */}
      <div className="grid grid-cols-[1fr_auto] gap-4 px-5 pb-4 pt-5">
        <div className="min-w-0 space-y-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
              {offerLabel}
            </p>
            <p className="mt-0.5 text-lg font-extrabold text-neutral-900">{offerValue}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-neutral-400">
              {secondaryLabel}
            </p>
            <p className="mt-0.5 font-mono text-base font-bold tracking-wider text-neutral-900">
              {secondaryValue || code}
            </p>
          </div>
          <p className="text-[11px] font-semibold tracking-wide text-neutral-400">
            COUPON ID : <span className="text-neutral-600">{referenceId}</span>
          </p>
        </div>

        <div className="flex flex-col items-center">
          <div className="flex size-[132px] items-center justify-center rounded-md border border-neutral-100 bg-white p-1.5 shadow-sm">
            {qrImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrImageUrl}
                alt="Coupon QR"
                className="size-full object-contain"
              />
            ) : (
              <div className="flex size-full flex-col items-center justify-center gap-1 bg-neutral-50 text-center">
                <span className="text-[10px] font-semibold text-neutral-400">QR pending</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 bg-[#00BAF2] px-5 py-3">
        <p className="text-[11px] font-medium leading-snug text-white/95">{footerLeft}</p>
        <span className="shrink-0 text-[13px] font-black tracking-tight text-white">arcade.</span>
      </div>
    </div>
  );
}

export function formatOfferValue(
  type: 'PERCENT' | 'FIXED',
  value: number,
  currency: string,
): string {
  if (type === 'PERCENT') return `${value}% OFF`;
  return `${currency} ${value} OFF`;
}
