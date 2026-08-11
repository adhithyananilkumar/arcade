"use client";

import React, { useEffect, useState } from "react";
import { RedeemResponse, QrStatus, qrService } from "@/domains/qr/services/qrService";

interface QrRedeemScannerProps {
  initialToken?: string | null;
}

function extractToken(raw: string): string {
  const value = raw.trim();
  try {
    const url = new URL(value);
    const tokenParam = url.searchParams.get("token");
    if (tokenParam) return tokenParam;
  } catch {
    // not a URL
  }
  const match = value.match(/[?&]token=([^&]+)/);
  if (match?.[1]) return decodeURIComponent(match[1]);
  return value;
}

export const QrRedeemScanner: React.FC<QrRedeemScannerProps> = ({ initialToken }) => {
  const [tokenInput, setTokenInput] = useState(initialToken ?? "");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<QrStatus | null>(null);
  const [result, setResult] = useState<RedeemResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadStatus = async (raw: string) => {
    const token = extractToken(raw);
    if (!token) return;
    setChecking(true);
    setError(null);
    setResult(null);
    try {
      const res = await qrService.getStatus(token);
      setStatus(res);
    } catch (err: any) {
      setStatus(null);
      setError(err?.message || "Could not load QR status.");
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (initialToken) {
      setTokenInput(initialToken);
      void loadStatus(initialToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialToken]);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    await loadStatus(tokenInput);
  };

  const handleRedeem = async () => {
    if (!tokenInput.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = extractToken(tokenInput);
      const res = await qrService.redeem(token);
      setResult(res);
      setStatus({
        token,
        status: "REDEEMED",
        redeemed: true,
        expired: false,
        couponCode: res.couponCode,
      });
    } catch (err: any) {
      setError(
        err?.message ||
          "Failed to redeem QR code. It may already be used, expired, or invalid."
      );
      await loadStatus(tokenInput);
    } finally {
      setLoading(false);
    }
  };

  const statusStyles =
    status?.status === "VALID"
      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      : status?.status === "REDEEMED"
        ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
        : status?.status === "EXPIRED"
          ? "bg-red-500/10 text-red-400 border-red-500/20"
          : "bg-zinc-800 text-zinc-400 border-zinc-700";

  const canRedeem = status?.status === "VALID" && !status.redeemed && !status.expired;

  return (
    <div className="mx-auto max-w-md rounded-3xl bg-zinc-900/80 p-8 border border-zinc-800 shadow-2xl backdrop-blur-xl">
      <h2 className="text-2xl font-bold text-white mb-2">Redeem QR Token</h2>
      <p className="text-sm text-zinc-400 mb-6">
        Staff scan view. Coupon QR codes are <span className="text-amber-300">one-time use</span> —
        already redeemed tokens cannot be claimed again.
      </p>

      <form onSubmit={handleCheck} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            QR Token / URL
          </label>
          <input
            type="text"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Paste token or redemption URL..."
            className="w-full rounded-xl bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-500 border border-zinc-800 focus:border-indigo-500 focus:outline-none transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={checking || !tokenInput.trim()}
          className="w-full rounded-xl bg-zinc-800 py-3 font-semibold text-white border border-zinc-700 hover:bg-zinc-700 disabled:opacity-50"
        >
          {checking ? "Checking..." : "Check Status"}
        </button>
      </form>

      {status && (
        <div className={`mt-6 rounded-2xl p-4 border ${statusStyles}`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider">Status</span>
            <span className="text-sm font-bold">{status.status}</span>
          </div>
          {status.couponCode && (
            <p className="mt-2 font-mono text-white text-lg">{status.couponCode}</p>
          )}
          {status.status === "REDEEMED" && (
            <p className="mt-1 text-xs opacity-80">Already used — one-time QR, cannot redeem again.</p>
          )}
          {status.status === "EXPIRED" && (
            <p className="mt-1 text-xs opacity-80">This QR has expired and cannot be redeemed.</p>
          )}
          {status.status === "VALID" && (
            <p className="mt-1 text-xs opacity-80">Valid and unused. Ready to redeem once.</p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={handleRedeem}
        disabled={loading || !canRedeem}
        className="mt-4 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 font-semibold text-white shadow-lg transition-all hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Redeeming..." : "Redeem (one-time)"}
      </button>

      {error && (
        <div className="mt-6 rounded-2xl bg-red-950/30 p-4 border border-red-900/50 text-red-300 text-sm">
          <p className="font-semibold text-red-400">Redemption Failed</p>
          <p className="mt-1 text-xs">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-6 rounded-2xl bg-emerald-950/30 p-5 border border-emerald-900/50 text-emerald-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              REDEEMED
            </span>
            <span className="text-xs font-mono text-zinc-400">
              {new Date(result.redeemedAt).toLocaleTimeString()}
            </span>
          </div>
          <p className="mt-3 text-lg font-bold text-white font-mono">
            {result.couponCode ?? "Coupon Claimed"}
          </p>
          <p className="mt-1 text-xs text-emerald-300/80">{result.message}</p>
        </div>
      )}
    </div>
  );
};
