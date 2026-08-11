"use client";

import React, { useState, useEffect } from "react";
import {
  couponService,
  CouponBatch,
  BatchStatus,
  Coupon,
} from "@/domains/coupons/services/couponService";

export default function StudioCouponsPage() {
  const [count, setCount] = useState<number>(10);
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FLAT_AMOUNT">("PERCENTAGE");
  const [discountValue, setDiscountValue] = useState<number>(15);
  const [codePrefix, setCodePrefix] = useState<string>("SUMMER");
  const [merchantId, setMerchantId] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);
  const [activeBatchId, setActiveBatchId] = useState<string | null>(null);
  const [batchStatus, setBatchStatus] = useState<BatchStatus | null>(null);
  const [batchData, setBatchData] = useState<CouponBatch | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Poll status if batch is IN_PROGRESS or PENDING
  useEffect(() => {
    if (!activeBatchId) return;

    let intervalId: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const status = await couponService.getBatchStatus(activeBatchId);
        setBatchStatus(status);

        if (status.status === "COMPLETED") {
          const details = await couponService.getBatchDetails(activeBatchId);
          setBatchData(details);
          setLoading(false);
        } else if (status.status === "FAILED") {
          setError("Batch generation failed.");
          setLoading(false);
        } else {
          intervalId = setTimeout(checkStatus, 1500);
        }
      } catch (err) {
        setError("Failed to fetch batch status.");
        setLoading(false);
      }
    };

    checkStatus();

    return () => clearTimeout(intervalId);
  }, [activeBatchId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setBatchData(null);
    setBatchStatus(null);
    setActiveBatchId(null);

    try {
      const res = await couponService.createBulk({
        count,
        discountType,
        discountValue,
        codePrefix: codePrefix || undefined,
        merchantId: merchantId.trim() || undefined,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
      });

      if ("batchId" in res) {
        // Async mode response
        setActiveBatchId(res.batchId);
        setBatchStatus(res);
      } else {
        // Sync mode response
        setBatchData(res);
        setLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to create bulk coupons.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-zinc-100 font-sans">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Studio Coupon Generator
            </h1>
            <p className="mt-1 text-sm text-zinc-400">
              Generate single or bulk promotional coupons embedded with unique QR code tokens.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Generation Form */}
          <div className="lg:col-span-1 rounded-3xl bg-zinc-900/70 p-6 border border-zinc-800 shadow-xl backdrop-blur-md">
            <h2 className="text-lg font-bold text-white mb-4">Bulk Generation Setup</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Coupon Count
                </label>
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={count}
                  onChange={(e) => setCount(parseInt(e.target.value) || 1)}
                  className="w-full rounded-xl bg-zinc-950 px-4 py-2.5 text-sm text-white border border-zinc-800 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Discount Type
                </label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full rounded-xl bg-zinc-950 px-4 py-2.5 text-sm text-white border border-zinc-800 focus:border-indigo-500 focus:outline-none"
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FLAT_AMOUNT">Flat Amount ($)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Discount Value
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl bg-zinc-950 px-4 py-2.5 text-sm text-white border border-zinc-800 focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Code Prefix (Optional)
                </label>
                <input
                  type="text"
                  value={codePrefix}
                  onChange={(e) => setCodePrefix(e.target.value)}
                  placeholder="e.g. SUMMER"
                  className="w-full rounded-xl bg-zinc-950 px-4 py-2.5 text-sm text-white border border-zinc-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Merchant ID (Optional)
                </label>
                <input
                  type="text"
                  value={merchantId}
                  onChange={(e) => setMerchantId(e.target.value)}
                  placeholder="UUID"
                  className="w-full rounded-xl bg-zinc-950 px-4 py-2.5 text-sm text-white border border-zinc-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">
                  Expiry Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full rounded-xl bg-zinc-950 px-4 py-2.5 text-sm text-white border border-zinc-800 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 font-semibold text-white shadow-lg transition-all hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Generating..." : `Generate ${count} Coupons`}
              </button>
            </form>
          </div>

          {/* Results Table & Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Polling Banner */}
            {loading && batchStatus && (
              <div className="rounded-3xl bg-indigo-950/30 p-6 border border-indigo-800/50 shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-indigo-300">
                    Async Batch Generation in Progress...
                  </span>
                  <span className="text-xs font-mono text-indigo-400">
                    Status: {batchStatus.status}
                  </span>
                </div>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full bg-indigo-500 transition-all duration-300"
                    style={{
                      width: `${
                        (batchStatus.generatedCount / (batchStatus.requestedCount || 1)) * 100
                      }%`,
                    }}
                  />
                </div>
                <p className="mt-2 text-xs text-zinc-400 font-mono text-right">
                  {batchStatus.generatedCount} / {batchStatus.requestedCount} generated
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-2xl bg-red-950/20 p-4 border border-red-900/50 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Coupons Table */}
            {batchData && (
              <div className="rounded-3xl bg-zinc-900/70 p-6 border border-zinc-800 shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Batch Results</h2>
                    <p className="text-xs text-zinc-400 font-mono mt-0.5">
                      Batch ID: {batchData.id} ({batchData.coupons?.length ?? 0} items)
                    </p>
                  </div>

                  <a
                    href={couponService.getExportUrl(batchData.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 border border-zinc-700 hover:bg-zinc-700 transition-colors"
                  >
                    Export CSV
                  </a>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-zinc-300">
                    <thead className="bg-zinc-950/60 text-xs font-semibold uppercase tracking-wider text-zinc-400 border-b border-zinc-800">
                      <tr>
                        <th className="py-3 px-4">QR</th>
                        <th className="py-3 px-4">Code</th>
                        <th className="py-3 px-4">Discount</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Expires</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60 font-mono text-xs">
                      {batchData.coupons?.map((coupon: Coupon) => (
                        <tr key={coupon.id} className="hover:bg-zinc-800/40">
                          <td className="py-3 px-4">
                            {coupon.qrImageUrl || coupon.qrToken ? (
                              <img
                                src={
                                  coupon.qrImageUrl ??
                                  `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/api/v1/qr/${coupon.qrToken}`
                                }
                                alt="QR"
                                className="h-10 w-10 rounded bg-white p-0.5"
                              />
                            ) : (
                              <span className="text-zinc-600">N/A</span>
                            )}
                          </td>
                          <td className="py-3 px-4 font-bold text-indigo-400">
                            {coupon.code}
                          </td>
                          <td className="py-3 px-4 text-zinc-200">
                            {coupon.discountType === "PERCENTAGE"
                              ? `${coupon.discountValue}%`
                              : `$${coupon.discountValue}`}
                          </td>
                          <td className="py-3 px-4">
                            {coupon.redeemed ? (
                              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
                                REDEEMED
                              </span>
                            ) : (
                              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                                ACTIVE
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-zinc-400">
                            {coupon.expiresAt
                              ? new Date(coupon.expiresAt).toLocaleDateString()
                              : "Never"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
