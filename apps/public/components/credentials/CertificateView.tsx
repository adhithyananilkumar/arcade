"use client";

/**
 * Arcade Frontend Architecture
 * Layer: Apps (public)
 *
 * Public Certificate Showcase:
 * Re-exports the unified CredentialView showcase component to guarantee complete
 * visual, layout, and functional synchronization between badge and certificate pages.
 */

import { CredentialView } from "./CredentialView";
import type { PublicCertificate } from "@/domains/credentials";

export function CertificateView({ data }: { data: PublicCertificate }) {
  return <CredentialView data={data} />;
}
