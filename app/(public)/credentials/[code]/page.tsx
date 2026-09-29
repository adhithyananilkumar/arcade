/**
 * ------------------------------------------------------------------
 * Arcade Frontend Architecture
 * Layer: App (routing only)
 *
 * The public credential page: `/credentials/ARC-XXXX-XXXX-XXXX` (badge) or `/credentials/CERT-…`
 * (certificate). Server-rendered metadata so a
 * shared link previews with the holder's name and the award; the page itself is the orchestrator.
 * ------------------------------------------------------------------
 */

import type { Metadata } from "next";
import { API_ORIGIN } from "@/infrastructure/config/env";
import { CredentialOrchestrator } from "@/apps/public/orchestrators/CredentialOrchestrator";

interface Params {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { code: raw } = await params;
  const code = decodeURIComponent(raw);
  // Same routing hint as the domain's credentialKindOf; inlined to keep this server module free of
  // the client-side API stack.
  const certificate = code.toUpperCase().replace(/[^0-9A-Z]/g, "").startsWith("CERT");
  try {
    const res = await fetch(
      `${API_ORIGIN}/api/v1/public/credentials/${certificate ? "certificates" : "badges"}/${encodeURIComponent(code)}`,
      { cache: "no-store" },
    );
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    if (certificate) {
      const c = data.certificate;
      const title = `${c.recipientName} — ${c.title} · ${c.documentTitle} | Arcade`;
      const description = `${c.documentTitle}, issued by ${c.issuerName} through Arcade. Credential ID ${c.credentialCode}. ${c.criteria}`;
      return { title, description, openGraph: { title, description, type: "profile" }, robots: { index: false } };
    }
    const b = data.badge;
    const title = `${b.recipientName} — ${b.name} · ${b.badgeClass.tier.label} | Arcade`;
    const description = `${b.badgeClass.name}, issued by ${b.issuerName} through Arcade. Credential ID ${b.credentialCode}. ${b.criteria}`;
    return { title, description, openGraph: { title, description, type: "profile" }, robots: { index: false } };
  } catch {
    return { title: "Credential | Arcade", robots: { index: false } };
  }
}

export default async function CredentialPage({ params }: Params) {
  const { code } = await params;
  return <CredentialOrchestrator code={decodeURIComponent(code)} />;
}
