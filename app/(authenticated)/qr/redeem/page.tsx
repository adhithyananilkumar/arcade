"use client";

import React, { Suspense } from "react";
import { QrRedeemScanner } from "@/components/qr/QrRedeemScanner";
import { useSearchParams } from "next/navigation";

function RedeemContent() {
  const searchParams = useSearchParams();
  const tokenParam = searchParams.get("token");

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-zinc-950">
      <div className="w-full max-w-lg">
        <QrRedeemScanner initialToken={tokenParam} />
      </div>
    </div>
  );
}

export default function QrRedeemPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-zinc-400">Loading...</div>}>
      <RedeemContent />
    </Suspense>
  );
}
