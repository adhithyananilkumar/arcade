'use client';

import { useState } from 'react';

/** Razorpay's public CDN for payment-method artwork (banks, wallets, UPI apps). */
const CDN = 'https://cdn.razorpay.com';

export const bankLogoUrl = (code: string) => `${CDN}/bank/${code}.gif`;
export const walletLogoUrl = (code: string) => `${CDN}/wallet/${code}.png`;
export const upiAppLogoUrl = (app: string) => `${CDN}/app/${app}.svg`;

/** A soft, stable colour per code so fallbacks differ from each other. */
function hue(code: string): number {
  let h = 0;
  for (const ch of code) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}

function initials(name: string, code: string): string {
  const letters = name
    .replace(/\b(bank|of|the|ltd|limited|money|pay)\b/gi, '')
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return letters || code.slice(0, 2).toUpperCase();
}

/**
 * A payment method's logo on a white tile (logos are drawn for white), falling back to a monogram
 * when the image is missing or blocked — a broken-image icon is never shown.
 */
export function MethodLogo({ src, name, code, size = 40 }: { src: string; name: string; code: string; size?: number }) {
  const [failed, setFailed] = useState(false);
  const h = hue(code);

  return (
    <span
      className="theme-fixed flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-[0_0_0_1px_rgba(20,22,43,0.08),0_2px_6px_-2px_rgba(20,22,43,0.12)]"
      style={{ width: size, height: size }}
    >
      {failed ? (
        <span
          className="flex h-full w-full items-center justify-center text-[12px] font-bold text-white"
          style={{ background: `linear-gradient(135deg, oklch(0.55 0.15 ${h}), oklch(0.42 0.13 ${(h + 40) % 360}))` }}
        >
          {initials(name, code)}
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- remote CDN artwork, tiny, no optimisation needed
        <img
          src={src}
          alt=""
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-[70%] w-[70%] object-contain"
        />
      )}
    </span>
  );
}
