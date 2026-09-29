import type { Metadata } from "next";
import { Suspense } from "react";
import { VerifyCredentialOrchestrator } from "@/apps/public/orchestrators/VerifyCredentialOrchestrator";

export const metadata: Metadata = {
  title: "Verify a credential | Arcade",
  description: "Check that an Arcade badge or certificate is genuine, current and unaltered, using its credential ID.",
};

export default function VerifyCredentialPage() {
  return (
    <Suspense fallback={null}>
      <VerifyCredentialOrchestrator />
    </Suspense>
  );
}
