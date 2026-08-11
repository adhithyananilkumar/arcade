"use client";

import React, { useEffect, useState } from "react";
import { QrResponse, qrService } from "@/domains/qr/services/qrService";

interface QrCodeCardProps {
  token?: string;
  initialData?: QrResponse;
  sizePx?: number;
}

export const QrCodeCard: React.FC<QrCodeCardProps> = ({
  token,
  initialData,
  sizePx = 250,
}) => {
  const [data, setData] = useState<QrResponse | null>(initialData ?? null);
  const [loading, setLoading] = useState<boolean>(!initialData && !!token);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!initialData && token) {
      setLoading(true);
      qrService
        .getDetails(token)
        .then((res) => {
          setData(res);
          setError(null);
        })
        .catch((err) => {
          setError("Failed to load QR Code details.");
        })
        .finally(() => setLoading(false));
    }
  }, [token, initialData]);

  useEffect(() => {
    if (!data?.expiresAt) return;
    const interval = setInterval(() => {
      const diff = new Date(data.expiresAt!).getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft("Expired");
        clearInterval(interval);
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins}m ${secs}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [data?.expiresAt]);

  if (loading) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center rounded-2xl bg-zinc-900/60 p-6 text-zinc-400 border border-zinc-800 backdrop-blur-md">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        <p className="mt-3 text-sm">Generating QR Code...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex h-64 w-full flex-col items-center justify-center rounded-2xl bg-red-950/20 p-6 text-red-400 border border-red-900/50">
        <p className="font-medium text-sm">{error ?? "No QR Code found"}</p>
      </div>
    );
  }

  const isExpired = data.expiresAt && new Date(data.expiresAt) < new Date();
  const isRedeemed = data.redeemed;

  let statusColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  let statusText = "VALID";

  if (isRedeemed) {
    statusColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
    statusText = "REDEEMED";
  } else if (isExpired) {
    statusColor = "bg-red-500/10 text-red-400 border-red-500/20";
    statusText = "EXPIRED";
  }

  const imageUrl =
    data.imageBase64 ??
    `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/api/v1/qr/${data.token}`;

  return (
    <div className="flex flex-col items-center rounded-3xl bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 border border-zinc-800/80 shadow-2xl transition-all duration-300 hover:border-zinc-700/80 max-w-sm w-full">
      <div className="flex w-full items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          {data.type} QR
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium border ${statusColor}`}
        >
          {statusText}
        </span>
      </div>

      <div className="relative rounded-2xl bg-white p-3 shadow-inner my-2">
        <img
          src={imageUrl}
          alt="QR Code"
          style={{ width: sizePx, height: sizePx }}
          className="rounded-lg object-contain"
        />
        {isRedeemed && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 backdrop-blur-xs rounded-2xl">
            <span className="rounded-lg bg-amber-500/20 px-4 py-2 text-sm font-bold text-amber-300 border border-amber-500/40">
              REDEEMED
            </span>
          </div>
        )}
      </div>

      {data.couponCode && (
        <div className="mt-4 text-center">
          <p className="text-xs text-zinc-400 uppercase tracking-widest font-mono">
            Coupon Code
          </p>
          <p className="mt-1 text-xl font-bold tracking-wider text-indigo-400 font-mono">
            {data.couponCode}
          </p>
        </div>
      )}

      {data.expiresAt && !isRedeemed && (
        <div className="mt-3 text-xs text-zinc-400 font-mono">
          Expires in: <span className="text-zinc-200 font-semibold">{timeLeft}</span>
        </div>
      )}
    </div>
  );
};
