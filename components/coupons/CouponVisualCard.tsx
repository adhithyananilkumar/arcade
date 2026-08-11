"use client";

import React from "react";
import {
  CouponTheme,
  resolveCouponTheme,
  themeToCssBackground,
} from "@/domains/coupons/theme";

export type CouponVisualCardProps = {
  code: string;
  discountType: "PERCENTAGE" | "FLAT_AMOUNT";
  discountValue: number;
  qrImageUrl?: string | null;
  qrToken?: string | null;
  theme?: Partial<CouponTheme> | null;
  merchantId?: string | null;
  expiresAt?: string | null;
  redeemed?: boolean;
  compact?: boolean;
  className?: string;
};

function discountLabel(
  discountType: "PERCENTAGE" | "FLAT_AMOUNT",
  discountValue: number,
): string {
  if (discountType === "PERCENTAGE") return `${discountValue}% off`;
  return `$${discountValue} off`;
}

export const CouponVisualCard: React.FC<CouponVisualCardProps> = ({
  code,
  discountType,
  discountValue,
  qrImageUrl,
  qrToken,
  theme,
  merchantId,
  expiresAt,
  redeemed = false,
  compact = false,
  className = "",
}) => {
  const resolved = resolveCouponTheme(theme);
  const qrSrc =
    qrImageUrl ||
    (qrToken
      ? `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/api/v1/qr/${qrToken}`
      : null);
  const qrSize = compact ? 120 : 168;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl shadow-[0_18px_40px_rgba(15,23,42,0.18)] ${className}`}
      style={{
        background: themeToCssBackground(resolved),
        color: resolved.textColor,
      }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full opacity-20"
        style={{ background: resolved.accent }}
      />
      <div
        className="pointer-events-none absolute -bottom-12 -left-8 h-40 w-40 rounded-full opacity-10"
        style={{ background: resolved.accent }}
      />

      <div className={`relative ${compact ? "p-4" : "p-5 sm:p-6"}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-80"
              style={{ color: resolved.accent }}
            >
              Arcade coupon
            </p>
            <h3 className={`mt-1 font-bold tracking-tight ${compact ? "text-xl" : "text-2xl"}`}>
              {discountLabel(discountType, discountValue)}
            </h3>
          </div>
          {redeemed && (
            <span className="rounded-full bg-black/25 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
              Redeemed
            </span>
          )}
        </div>

        <div className={`mt-4 flex ${compact ? "flex-col items-center gap-3" : "flex-col items-center gap-4 sm:flex-row sm:items-end sm:justify-between"}`}>
          <div className="text-center sm:text-left">
            <p className="text-[11px] font-medium opacity-80">Scan to redeem</p>
            <div
              className="mt-2 inline-flex rounded-2xl bg-white p-2.5 shadow-inner"
              style={{ boxShadow: `0 0 0 3px ${resolved.accent}55` }}
            >
              {qrSrc ? (
                <img
                  src={qrSrc}
                  alt={`QR for ${code}`}
                  width={qrSize}
                  height={qrSize}
                  className="rounded-lg object-contain"
                  style={{ width: qrSize, height: qrSize }}
                />
              ) : (
                <div
                  className="grid place-items-center rounded-lg bg-slate-100 text-[11px] text-slate-400"
                  style={{ width: qrSize, height: qrSize }}
                >
                  QR pending
                </div>
              )}
            </div>
          </div>

          <div className={`w-full ${compact ? "" : "sm:max-w-[46%] sm:text-right"}`}>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] opacity-70">
              Code
            </p>
            <p
              className={`mt-1 font-mono font-bold tracking-[0.12em] ${compact ? "text-lg" : "text-xl sm:text-2xl"}`}
              style={{ color: resolved.accent }}
            >
              {code}
            </p>
            <p className="mt-1 text-[11px] opacity-70">
              One-time use · enter code if you cannot scan
            </p>

            {(merchantId || expiresAt) && (
              <div className="mt-3 space-y-1 text-[11px] opacity-80">
                {merchantId && (
                  <p className="truncate font-mono" title={merchantId}>
                    Merchant · {merchantId.slice(0, 8)}…
                  </p>
                )}
                {expiresAt && (
                  <p>Expires · {new Date(expiresAt).toLocaleDateString()}</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
