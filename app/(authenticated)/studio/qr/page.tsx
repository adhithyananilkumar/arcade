"use client";

import React, { useState } from "react";
import { QrCodeCard } from "@/components/qr/QrCodeCard";
import { QrResponse, qrService } from "@/domains/qr/services/qrService";

export default function StudioSingleQrPage() {
  const [mode, setMode] = useState<"GENERIC" | "COUPON">("COUPON");
  const [content, setContent] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [merchantId, setMerchantId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [sizePx, setSizePx] = useState(300);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QrResponse | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res =
        mode === "GENERIC"
          ? await qrService.generateGeneric({
              content: content.trim(),
              format: "PNG",
              sizePx,
              errorCorrection: "M",
            })
          : await qrService.generateCoupon({
              couponCode: couponCode.trim(),
              merchantId: merchantId.trim() || undefined,
              expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
              sizePx,
              errorCorrection: "M",
            });
      setResult(res);
    } catch (err: any) {
      setError(err?.message || "Failed to generate QR code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-zinc-100 font-sans">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-white">One-off QR Generator</h1>
          <p className="mt-1 text-sm text-zinc-400">
            Generate a reusable generic QR, or a one-time coupon QR that encodes a redemption token
            (not the raw coupon code).
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <form
            onSubmit={handleGenerate}
            className="rounded-3xl bg-zinc-900/70 p-6 border border-zinc-800 space-y-4"
          >
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("COUPON")}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold border ${
                  mode === "COUPON"
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400"
                }`}
              >
                Coupon (one-time)
              </button>
              <button
                type="button"
                onClick={() => setMode("GENERIC")}
                className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold border ${
                  mode === "GENERIC"
                    ? "bg-indigo-600 border-indigo-500 text-white"
                    : "bg-zinc-950 border-zinc-800 text-zinc-400"
                }`}
              >
                Generic
              </button>
            </div>

            {mode === "GENERIC" ? (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Content / URL
                </label>
                <input
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  className="w-full rounded-xl bg-zinc-950 px-4 py-2.5 text-sm text-white border border-zinc-800 focus:border-indigo-500 focus:outline-none"
                  placeholder="https://example.com"
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Coupon Code
                  </label>
                  <input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    required
                    className="w-full rounded-xl bg-zinc-950 px-4 py-2.5 text-sm text-white border border-zinc-800 focus:border-indigo-500 focus:outline-none"
                    placeholder="e.g. A3K9P2"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Merchant ID (optional)
                  </label>
                  <input
                    value={merchantId}
                    onChange={(e) => setMerchantId(e.target.value)}
                    className="w-full rounded-xl bg-zinc-950 px-4 py-2.5 text-sm text-white border border-zinc-800 focus:border-indigo-500 focus:outline-none"
                    placeholder="UUID"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                    Expiry (optional)
                  </label>
                  <input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="w-full rounded-xl bg-zinc-950 px-4 py-2.5 text-sm text-white border border-zinc-800 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                Size (px)
              </label>
              <input
                type="number"
                min={100}
                max={1000}
                value={sizePx}
                onChange={(e) => setSizePx(parseInt(e.target.value) || 300)}
                className="w-full rounded-xl bg-zinc-950 px-4 py-2.5 text-sm text-white border border-zinc-800 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 font-semibold text-white disabled:opacity-50"
            >
              {loading ? "Generating..." : "Generate QR"}
            </button>

            {error && (
              <div className="rounded-2xl bg-red-950/20 p-4 border border-red-900/50 text-red-400 text-sm">
                {error}
              </div>
            )}
          </form>

          <div className="flex items-start justify-center">
            {result ? (
              <div className="w-full space-y-3">
                <QrCodeCard initialData={result} sizePx={Math.min(result.sizePx, 280)} />
                <p className="text-center text-xs text-zinc-500 font-mono break-all">
                  Token: {result.token}
                </p>
                {mode === "COUPON" && (
                  <p className="text-center text-xs text-amber-400/90">
                    One-time use: after redeem, this QR cannot be scanned again.
                  </p>
                )}
              </div>
            ) : (
              <div className="flex h-64 w-full items-center justify-center rounded-3xl border border-dashed border-zinc-800 text-zinc-500 text-sm">
                Generated QR will appear here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
